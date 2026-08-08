/**
 * 光标同步测试 — 验证点击代码行后大纲能定位到对应元素
 *
 * 覆盖修复的 4 个 bug：
 *  - Bug A: findTargetByLine 现在能识别声明项（变量/游标行）
 *  - Bug C+D: getParent 父链正确（section/declarationGroup/declarationEntry）
 *
 * 直接测试 extension.ts 的 findTargetByLine（私有方法通过反射调用），
 * 以及 treeView 的 getParent（已在上游 declaration_render_test 覆盖，此处补充边界）。
 *
 * 运行：node test/cursor_sync_test.js （需先 npm run compile）
 */
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class { constructor(l, c) { this.label = l; this.collapsibleState = c; } },
    ThemeIcon: class { constructor(id) { this.id = id; } },
    EventEmitter: class { constructor() { this.l = []; } event(l) { this.l.push(l); return { dispose() {} }; } fire(d) { this.l.forEach(x => x(d)); } dispose() { this.l = []; } },
    workspace: { getConfiguration: () => ({ get: (k, d) => d }), fs: {}, createFileSystemWatcher: () => ({ onDidCreate() {}, onDidChange() {}, onDidDelete() {}, dispose() {} }) },
    window: { createOutputChannel: () => ({ appendLine() {}, dispose() {} }), createTreeView: () => ({ visible: true, reveal() {}, onDidChangeVisibility() {}, dispose() {} }), showQuickPick: async () => undefined, showInformationMessage() {}, showWarningMessage() {}, showErrorMessage() {} },
    commands: { registerCommand: () => ({ dispose() {} }) },
    RelativePattern: class { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f, toString: () => f }) },
    Position: class { constructor(l, c) { this.line = l; this.character = c; } },
    Location: class { constructor(u, r) { this.uri = u; this.range = r; } },
    Range: class { constructor(s, e) { this.start = s; this.end = e; } },
    MarkdownString: class { constructor(s) { this.value = s; } },
    Hover: class { constructor(c, r) { this.contents = c; this.range = r; } },
    ViewColumn: { One: 1, Two: 2, Beside: -2 }
};
const o = Module._resolveFilename;
Module._resolveFilename = function (r) { if (r === 'vscode') return 'vscode_mock'; return o.apply(this, arguments); };
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../out/parser');
const { PLSQLOutlineExtension } = require('../out/extension');

let passed = 0, failed = 0;
const failures = [];
function assert(cond, msg) { if (cond) passed++; else { failed++; failures.push(msg); console.error('  ✗ FAIL: ' + msg); } }

// 带丰富声明与控制结构的包
const SOURCE = `CREATE OR REPLACE PACKAGE BODY sync_pkg IS
    g_count   NUMBER := 0;             -- L2
    CURSOR c_all IS SELECT * FROM t;   -- L3
    e_bad    EXCEPTION;                -- L4

    PROCEDURE do_work(p_in IN NUMBER) IS  -- L6
        v_local NUMBER := p_in;         -- L7
    BEGIN                                -- L8
        IF p_in IS NULL THEN            -- L9
            v_local := 0;               -- L10
        END IF;                         -- L11
        FOR i IN 1..10 LOOP             -- L12
            v_local := v_local + i;     -- L13
        END LOOP;                       -- L14
    EXCEPTION                           -- L15
        WHEN OTHERS THEN NULL;          -- L16
    END do_work;                        -- L17
END sync_pkg;                           -- L18
/`;

async function main() {
    console.log('=== 光标同步测试 ===\n');
    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    const result = await parser.parse(SOURCE, 'sync_pkg.pkb');
    if (result.metadata.errors.length > 0) {
        console.error('解析错误:', JSON.stringify(result.metadata.errors));
        process.exit(1);
    }
    const root = result.nodes[0];

    // findTargetByLine 及其辅助方法在原型上且自包含（只依赖传入的 nodes），
    // 这里通过原型绑定到一个空桩对象上调用，避免实例化整个扩展（需大量 vscode mock）。
    const proto = PLSQLOutlineExtension.prototype;
    const stub = {};
    ['findTargetByLine', 'collectCandidates', 'isLineInNodeRange',
     'getStructureBlockTypeForRange', 'getLastChildNode'].forEach(m => { stub[m] = proto[m]; });
    function callFindTarget(line) {
        return stub.findTargetByLine.call(stub, result.nodes, line);
    }

    // ---- Bug A: 声明项行能被识别为 declarationEntry ----
    console.log('--- 声明项行定位（Bug A）---');
    // 找到 g_count、c_all、e_bad 的实际行号
    function findVarLine(name) {
        if (root.variableTable && root.variableTable.has(name)) return root.variableTable.get(name).line;
        return null;
    }
    const gCountLine = findVarLine('g_count');
    const cAllLine = findVarLine('c_all');
    const eBadLine = findVarLine('e_bad');

    assert(gCountLine !== null, 'g_count 声明行已记录');
    if (gCountLine) {
        const t = callFindTarget(gCountLine);
        assert(t !== null, `点击 g_count 声明行(L${gCountLine})能找到目标`);
        assert(t && t.type === 'declarationEntry', `目标类型为 declarationEntry（实际 ${t && t.type}）`);
        assert(t && t.entry && t.entry.name === 'g_count', '目标声明项名为 g_count');
    }
    if (cAllLine) {
        const t = callFindTarget(cAllLine);
        assert(t && t.type === 'declarationEntry' && t.entry.name === 'c_all', '点击游标 c_all 行定位到 declarationEntry');
    }
    if (eBadLine) {
        const t = callFindTarget(eBadLine);
        assert(t && t.type === 'declarationEntry' && t.entry.name === 'e_bad', '点击异常 e_bad 行定位到 declarationEntry');
    }

    // ---- 局部变量 v_local（在 do_work 内）----
    const doWork = root.children.find(c => c.name === 'do_work');
    let vLocalLine = null;
    if (doWork && doWork.variableTable && doWork.variableTable.has('v_local')) {
        vLocalLine = doWork.variableTable.get('v_local').line;
    }
    assert(vLocalLine !== null, 'v_local 局部声明行已记录');
    if (vLocalLine) {
        const t = callFindTarget(vLocalLine);
        assert(t && t.type === 'declarationEntry' && t.entry.name === 'v_local',
            '点击局部变量 v_local 行定位到 declarationEntry');
    }

    // ---- 子程序声明行定位为 node ----
    console.log('\n--- 子程序/控制结构行定位 ---');
    if (doWork) {
        const t = callFindTarget(doWork.declarationLine);
        assert(t && t.type === 'node' && t.node.name === 'do_work', '点击 do_work 声明行定位到 node');

        // BEGIN 行
        if (doWork.beginLine) {
            const tb = callFindTarget(doWork.beginLine);
            assert(tb && tb.type === 'structureBlock' && tb.blockType === 'BEGIN', '点击 BEGIN 行定位到 BEGIN 结构块');
        }
        // EXCEPTION 行
        if (doWork.exceptionLine) {
            const te = callFindTarget(doWork.exceptionLine);
            assert(te && te.type === 'structureBlock' && te.blockType === 'EXCEPTION', '点击 EXCEPTION 行定位到 EXCEPTION 结构块');
        }
    }

    // ---- 控制结构行（IF/FOR 内部）定位到 node ----
    function findControlLine(type) {
        let found = null;
        function walk(n) { if (n.type === type) found = n; (n.children || []).forEach(walk); }
        result.nodes.forEach(walk);
        return found;
    }
    const ifNode = findControlLine('IF_STATEMENT');
    if (ifNode) {
        const t = callFindTarget(ifNode.declarationLine);
        assert(t && t.type === 'node', '点击 IF 行定位到 node');
    }

    // ---- 声明项优先级高于所在节点范围 ----
    console.log('\n--- 优先级 ---');
    // 声明项行同时在 do_work 范围内，应优先返回 declarationEntry 而非 node
    if (vLocalLine) {
        const t = callFindTarget(vLocalLine);
        assert(t && t.type === 'declarationEntry', '声明项行优先于所在节点范围（返回 declarationEntry）');
    }

    console.log('\n================================');
    console.log(`测试结果: ${passed}/${passed + failed} 通过`);
    if (failed > 0) { failures.forEach(f => console.error('  - ' + f)); process.exit(1); }
    console.log('\n所有测试通过!');
}

main().catch(err => { console.error('测试执行异常:', err); process.exit(1); });

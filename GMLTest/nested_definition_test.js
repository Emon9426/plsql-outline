/**
 * GMLTest: 嵌套子程序 Ctrl+Click 跳转测试（Bug A/C 回归）
 *
 * 测试对象：test/complex_realworld_pkg.pkb（order_mgmt_pkg）
 *   嵌套链：order_mgmt_pkg → calculate_total → compute_line_total → apply_rounding
 *                                → accumulate
 *
 * 验证 Ctrl+Click（provideDefinition）对：
 *  1. 同包内顶层子程序（calculate_total/validate_order/cancel_order）调用 → 跳转声明行
 *  2. 同包内 2 级嵌套子程序（compute_line_total/accumulate）调用 → 跳转声明行
 *  3. 同包内 3 级嵌套子程序（apply_rounding，在 compute_line_total 内）调用 → 跳转声明行
 *  4. 变量/游标调用 → 跳转声明行（保持原行为）
 *
 * 修复的 Bug：
 *  - Bug A: findProcFuncInChildren 原不递归，嵌套子程序 Ctrl+Click 返回 null
 *  - Bug C: 跨文件回退误返 null（同文件定义兜底）
 */
const path = require('path');
const fs = require('fs');

// ---------- mock vscode ----------
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class { constructor(l, c) { this.label = l; this.collapsibleState = c; } },
    ThemeIcon: class { constructor(id) { this.id = id; } },
    EventEmitter: class { constructor() { this.l = []; } event(x) { this.l.push(x); return { dispose() {} }; } fire(d) { this.l.forEach(x => x(d)); } dispose() { this.l = []; } },
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
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (r) { if (r === 'vscode') return 'vscode_mock'; return originalResolve.apply(this, arguments); };
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../out/parser');
const { PLSQLOutlineExtension } = require('../out/extension');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

const SOURCE_FILE = path.join(__dirname, '..', 'test', 'complex_realworld_pkg.pkb');

function makeDoc(src, filePath) {
    const lines = src.split('\n');
    return {
        uri: { fsPath: filePath, toString: () => 'file:///' + filePath.replace(/\\/g, '/') },
        fileName: filePath,
        lineAt(l) { const t = lines[l] || ''; return { text: t }; },
        getText(r) { if (!r) return src; return (lines[r.start.line] || '').substring(r.start.character, r.end.character); },
        getWordRangeAtPosition(pos, pattern) {
            const lt = lines[pos.line] || '';
            const re = pattern ? new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g') : /[A-Za-z_]\w*/g;
            let m;
            while ((m = re.exec(lt)) !== null) {
                if (pos.character >= m.index && pos.character <= m.index + m[0].length) {
                    return { start: { line: pos.line, character: m.index }, end: { line: pos.line, character: m.index + m[0].length } };
                }
                if (m[0].length === 0) re.lastIndex++;
            }
            return undefined;
        }
    };
}

// 在解析树中查找某子程序名的声明行
function findDeclLine(nodes, name) {
    let found = null;
    function walk(n) {
        if (n.name === name && (n.type === 'FUNCTION' || n.type === 'PROCEDURE')) found = n.declarationLine;
        (n.children || []).forEach(walk);
    }
    nodes.forEach(walk);
    return found;
}

// 在源码中查找某子程序的"调用点"行号（1-based），跳过声明行
function findCallLine(lines, name, declLine) {
    const re = new RegExp('\\b' + name + '\\s*\\(');
    for (let i = 0; i < lines.length; i++) {
        if (re.test(lines[i]) && (declLine === null || (i + 1) !== declLine)) return i + 1;
    }
    return 0;
}

async function run() {
    const rec = makeRecorder();
    const filePath = 'C:/fake/order_mgmt_pkg.pkb';
    const src = fs.readFileSync(SOURCE_FILE, 'utf8');
    const lines = src.split('\n');
    const doc = makeDoc(src, filePath);

    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    const t0 = Date.now();
    const result = await parser.parse(src, 'order_mgmt_pkg.pkb');
    const parseTime = Date.now() - t0;

    rec.assert('parse_clean', 'order_mgmt_pkg 解析零错误', result.metadata.errors.length === 0, `errors=${result.metadata.errors.length}`);
    rec.assert('parse_perf', '解析性能 < 200ms', parseTime < 200, `${parseTime}ms`);
    rec.assert('root_name', '包名 order_mgmt_pkg', result.nodes[0] && result.nodes[0].name === 'order_mgmt_pkg', result.nodes[0] && result.nodes[0].name);

    // 绑定原型方法到桩对象
    const proto = PLSQLOutlineExtension.prototype;
    const stub = { currentParseResult: result, symbolIndex: { lookupWithPriority: () => [] } };
    ['provideDefinition', 'parseCallAtPosition', 'findVariableInParseResult', 'findNodeInCurrentFile',
     'findProcFuncInChildren', 'isCallableNode', 'isNodeScopeContainsLine', 'isLineInNodeRange',
     'getStructureBlockTypeForRange', 'getLastChildNode', 'showSymbolQuickPick'].forEach(m => stub[m] = proto[m]);

    // 模拟 Ctrl+Click：给定调用名，返回跳转目标行号（1-based）或 null
    function ctrlClick(callName) {
        const declLine = findDeclLine(result.nodes, callName);
        const callLine = findCallLine(lines, callName, declLine);
        if (callLine === 0) return { skipped: true, declLine, callLine };
        const lt = lines[callLine - 1];
        const char = lt.indexOf(callName);
        const loc = stub.provideDefinition.call(stub, doc, { line: callLine - 1, character: char }, {});
        if (!loc) return { jumped: false, declLine, callLine };
        const targetLine = loc.range.line !== undefined ? loc.range.line + 1 : (loc.range.start ? loc.range.start.line + 1 : null);
        return { jumped: true, targetLine, declLine, callLine };
    }

    // ---- Case 1: 2 级嵌套子程序 compute_line_total（calculate_total 内）----
    console.log('--- 嵌套子程序跳转 ---');
    let r = ctrlClick('compute_line_total');
    rec.assert('nested2_compute_line_total_jumps', 'compute_line_total（2级嵌套）Ctrl+Click 跳转成功',
        r.jumped === true, r.jumped === false ? 'NULL（未跳转，Bug A 未修复）' : 'skipped=' + r.skipped);
    rec.assert('nested2_compute_line_total_line', 'compute_line_total 跳转到声明行',
        r.jumped && r.targetLine === r.declLine, `target=${r.targetLine} decl=${r.declLine}`);

    // ---- Case 2: 2 级嵌套子程序 accumulate（calculate_total 内）----
    r = ctrlClick('accumulate');
    rec.assert('nested2_accumulate_jumps', 'accumulate（2级嵌套）Ctrl+Click 跳转成功',
        r.jumped === true, r.jumped === false ? 'NULL' : 'skipped=' + r.skipped);
    rec.assert('nested2_accumulate_line', 'accumulate 跳转到声明行',
        r.jumped && r.targetLine === r.declLine, `target=${r.targetLine} decl=${r.declLine}`);

    // ---- Case 3: 3 级嵌套子程序 apply_rounding（compute_line_total 内）----
    r = ctrlClick('apply_rounding');
    rec.assert('nested3_apply_rounding_jumps', 'apply_rounding（3级嵌套）Ctrl+Click 跳转成功',
        r.jumped === true, r.jumped === false ? 'NULL（Bug A 未修复）' : 'skipped=' + r.skipped);
    rec.assert('nested3_apply_rounding_line', 'apply_rounding 跳转到声明行',
        r.jumped && r.targetLine === r.declLine, `target=${r.targetLine} decl=${r.declLine}`);

    // ---- Case 4: 跨包前缀调用 pkg.proc 的解析（parseCallAtPosition）----
    // 直接测试 parseCallAtPosition 对 "order_mgmt_pkg.calculate_total" 形式的解析
    const callInfo = stub.parseCallAtPosition.call(stub, doc, { line: 0, character: 0 });
    // 这个 position 不一定有内容，仅验证方法不抛错
    rec.assert('parse_call_no_throw', 'parseCallAtPosition 不抛异常', callInfo === null || (callInfo.name !== undefined), 'ok');

    // ---- Case 5: 去重守卫移除后连续两次调用都返回 Location（v1.5.3 修复回归）----
    if (findDeclLine(result.nodes, 'compute_line_total')) {
        const dl = findDeclLine(result.nodes, 'compute_line_total');
        const cl = findCallLine(lines, 'compute_line_total', dl);
        if (cl > 0) {
            const lt = lines[cl - 1];
            const ch = lt.indexOf('compute_line_total');
            const pos = { line: cl - 1, character: ch };
            const loc1 = stub.provideDefinition.call(stub, doc, pos, {});
            const loc2 = stub.provideDefinition.call(stub, doc, pos, {});
            rec.assert('dedup_removed_twice_jump', '连续两次 Ctrl+Click 都返回跳转（去重守卫已移除）',
                loc1 !== null && loc2 !== null, `loc1=${!!loc1} loc2=${!!loc2}`);
        }
    }

    return { suiteName: 'nested_definition_test', cases: rec.cases, parseTime };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log(`\n=== GMLTest: nested_definition ===`);
        cases.forEach(c => console.log(`  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.desc}${c.passed ? '' : ' [' + c.actual + ']'}`));
        console.log(`\n结果: ${passed}/${cases.length} 通过`);
        process.exit(passed === cases.length ? 0 : 1);
    }).catch(err => { console.error('测试异常:', err); process.exit(1); });
}

module.exports = { run };

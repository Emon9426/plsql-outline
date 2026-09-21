/**
 * 光标区域跟随测试（Issue #22）— 光标进入 Body / Declaration 区域时大纲跟随选中对应区域文件夹
 *
 * 锁定的契约：
 *  1. getStructureBlockTypeForRange：声明区（declarationLine..BEGIN 之间）判为 'DECLARE'
 *  2. collectCandidates：区域范围与控制结构范围匹配同基准（150+level），
 *     光标位于 LOOP/IF 等控制结构内部时跟随到最内层控制结构；ELSIF/ELSE 分支
 *     （显示层已合并进 IF）自身不产生范围候选，让位给外围容器
 *  3. selectAndRevealTarget：BEGIN → reveal Body 文件夹（不再回退宿主过程名，推翻旧"决策 A"）；
 *     DECLARE → Declaration 文件夹（不可渲染时回退宿主节点）；EXCEPTION/END → 对应叶子
 *  4. revealItem：不做可见性门控（面板可见即 reveal，依赖 VS Code 原生沿父链自动展开）
 *  5. reveal 父链可解析性：所有跟随目标沿 getParent 上溯，每级元素的 cacheKey
 *     必须出现在其父项 getChildren 的键集合中（ELSIF/ELSE 分支子级上溯所属 IF）
 *
 * 运行：node tests/regression/cursor_follow_region_test.js（需先 npm run compile）
 */
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class { constructor(l, c) { this.label = l; this.collapsibleState = c; } },
    ThemeIcon: class { constructor(id) { this.id = id; } },
    EventEmitter: class { constructor() { this.l = []; } event(l) { this.l.push(l); return { dispose() {} }; } fire(d) { this.l.forEach(x => x(d)); } dispose() { this.l = []; } },
    workspace: { getConfiguration: () => ({ get: (k, d) => d }), fs: {}, createFileSystemWatcher: () => ({ onDidCreate() {}, onDidChange() {}, onDidDelete() {}, dispose() {} }) },
    window: {
        createOutputChannel: () => ({ appendLine() {}, dispose() {} }),
        createTreeView: () => treeViewSpy,
        showQuickPick: async () => undefined, showInformationMessage() {}, showWarningMessage() {}, showErrorMessage() {}
    },
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

// createTreeView 的 mock 对象：捕获 reveal 调用供断言
const revealCalls = [];
const treeViewSpy = {
    visible: true,
    title: '',
    reveal: async (element, options) => { revealCalls.push({ element, options }); },
    dispose() {}
};

const o = Module._resolveFilename;
Module._resolveFilename = function (r) { if (r === 'vscode') return 'vscode_mock'; return o.apply(this, arguments); };
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../../out/parser');
const { PLSQLOutlineExtension } = require('../../out/extension');
const { TreeViewManager, MemoryDataProvider } = require('../../out/treeView');

let passed = 0, failed = 0;
const failures = [];
function assert(cond, msg) { if (cond) passed++; else { failed++; failures.push(msg); console.error('  ✗ FAIL: ' + msg); } }

// 带声明区空隙、嵌套控制结构、ELSIF/ELSE 分支（含其内部 FOR）与异常区的独立过程
const SOURCE = [
    'CREATE OR REPLACE PROCEDURE follow_proc IS',   // L1
    '    v_a NUMBER;',                              // L2
    '',                                             // L3  ← 声明区空白行（非声明项行）
    '    v_b VARCHAR2(10);',                        // L4
    '',                                             // L5  ← 声明区空白行
    '    CURSOR c1 IS SELECT * FROM emp;',          // L6
    'BEGIN',                                        // L7
    '    LOOP',                                     // L8
    '        IF v_a > 0 THEN',                      // L9
    '            v_a := v_a - 1;',                  // L10 ← LOOP 内 IF 体内
    '        END IF;',                              // L11
    '    END LOOP;',                                // L12
    '',                                             // L13 ← 体内空白行（无控制结构覆盖）
    '    IF v_b IS NULL THEN',                      // L14
    '        NULL;',                                // L15 ← 顶层 IF 体内
    '    ELSIF v_b = \'x\' THEN',                   // L16
    '        FOR j IN 1..2 LOOP',                   // L17
    '            v_a := v_a + j;',                  // L18 ← ELSIF 分支内 FOR 体内（显示层并入 IF）
    '        END LOOP;',                            // L19
    '    ELSE',                                     // L20
    '        NULL;',                                // L21 ← ELSE 体内
    '    END IF;',                                  // L22
    'EXCEPTION',                                    // L23
    '    WHEN OTHERS THEN',                         // L24 ← 异常区内部
    '        NULL;',                                // L25
    'END follow_proc;'                              // L26
].join('\n');

// 无任何声明项的过程：Declaration 文件夹不渲染，DECLARE 跟随需回退宿主节点
const NO_DECL_SOURCE = [
    'CREATE OR REPLACE PROCEDURE no_decl IS',       // L1
    '',                                             // L2  ← 声明区空白行（无声明项）
    'BEGIN',                                        // L3
    '    NULL;',                                    // L4
    'END no_decl;'                                  // L5
].join('\n');

// 触发器（带 DECLARE）：主体被解析为代理渲染的内联匿名块，区域目标挂在匿名块上（父级显示为宿主）
const TRIGGER_SOURCE = [
    'CREATE OR REPLACE TRIGGER trg_follow',         // L1
    'BEFORE INSERT ON t_test FOR EACH ROW',         // L2
    'DECLARE',                                      // L3
    '    v_x NUMBER;',                              // L4
    'BEGIN',                                        // L5
    '    IF :new.x IS NULL THEN',                   // L6
    '        :new.x := 0;',                         // L7  ← 匿名块内 IF 体内
    '    END IF;',                                  // L8
    'END;',                                         // L9
    '/'                                             // L10
].join('\n');

// 包规格：无 BEGIN（beginLine=null），光标跟随停留在包/成员声明节点
const SPEC_SOURCE = [
    'CREATE OR REPLACE PACKAGE pkg_spec_follow IS', // L1
    '    PROCEDURE do_a;',                          // L2
    '    FUNCTION do_b RETURN NUMBER;',             // L3
    'END pkg_spec_follow;'                          // L4
].join('\n');

async function main() {
    console.log('=== 光标区域跟随测试（Issue #22）===\n');
    const result = await new PLSQLParser().parse(SOURCE, 'follow_proc.prc');
    const noDeclResult = await new PLSQLParser().parse(NO_DECL_SOURCE, 'no_decl.prc');
    const triggerResult = await new PLSQLParser().parse(TRIGGER_SOURCE, 'trg_follow.trg');
    const specResult = await new PLSQLParser().parse(SPEC_SOURCE, 'pkg_spec_follow.pks');
    for (const r of [result, noDeclResult, triggerResult, specResult]) {
        if (r.metadata.errors.length > 0) {
            console.error('解析错误:', JSON.stringify(r.metadata.errors));
            process.exit(1);
        }
    }
    const proc = result.nodes.find(n => n.name === 'follow_proc');
    assert(!!proc, '解析出 follow_proc 过程');
    if (!proc) process.exit(1);

    // ---- 目标定位（findTargetByLine，经原型反射在桩上调用）----
    const proto = PLSQLOutlineExtension.prototype;
    const stub = {};
    ['findTargetByLine', 'collectCandidates', 'isLineInNodeRange',
     'getStructureBlockTypeForRange', 'getLastChildNode'].forEach(m => { stub[m] = proto[m]; });
    function callFindTarget(nodes, line) {
        return stub.findTargetByLine.call(stub, nodes, line);
    }

    console.log('--- 声明区定位为 DECLARE ---');
    for (const line of [3, 5]) {
        const t = callFindTarget(result.nodes, line);
        assert(t && t.type === 'structureBlock' && t.blockType === 'DECLARE',
            `声明区空白行 L${line} 定位到 DECLARE 区域（实际 ${t && t.type}/${t && t.blockType}）`);
        assert(t && t.node === proc, `L${line} DECLARE 目标宿主为 follow_proc`);
    }
    const t2 = callFindTarget(result.nodes, 2);
    assert(t2 && t2.type === 'declarationEntry' && t2.entry.name === 'v_a',
        '声明项行仍优先定位到 declarationEntry（既有行为不回归）');

    console.log('--- 体内定位（最内层容器跟随）---');
    const tBody = callFindTarget(result.nodes, 13);
    assert(tBody && tBody.type === 'structureBlock' && tBody.blockType === 'BEGIN' && tBody.node === proc,
        `体内空白行 L13 定位到 BEGIN 区域（实际 ${tBody && tBody.type}/${tBody && tBody.blockType}）`);

    const tIfInLoop = callFindTarget(result.nodes, 10);
    assert(tIfInLoop && tIfInLoop.type === 'node' && tIfInLoop.node.type === 'IF_STATEMENT',
        `LOOP 内 IF 体内 L10 跟随到最内层控制结构 IF（实际 ${tIfInLoop && tIfInLoop.type}/${tIfInLoop && tIfInLoop.node && tIfInLoop.node.type}）`);

    const tTopIf = callFindTarget(result.nodes, 15);
    assert(tTopIf && tTopIf.type === 'node' && tTopIf.node.type === 'IF_STATEMENT',
        `顶层 IF 体内 L15 跟随到 IF 节点（实际 ${tTopIf && tTopIf.node && tTopIf.node.type}）`);

    const tForInElsif = callFindTarget(result.nodes, 18);
    assert(tForInElsif && tForInElsif.type === 'node' && tForInElsif.node.type === 'FOR_LOOP',
        `ELSIF 分支内 FOR 体内 L18 跟随到 FOR 节点（实际 ${tForInElsif && tForInElsif.node && tForInElsif.node.type}）`);

    const tElse = callFindTarget(result.nodes, 21);
    assert(tElse && tElse.node && tElse.node.type !== 'ELSE_BRANCH' && tElse.node.type !== 'ELSIF_BRANCH',
        `ELSE 体内 L21 不定位到 ELSE/ELSIF 分支（实际 ${tElse && tElse.node && tElse.node.type}/${tElse && tElse.blockType}）`);

    const tExc = callFindTarget(result.nodes, 24);
    assert(tExc && tExc.type === 'structureBlock' && tExc.blockType === 'EXCEPTION' && tExc.node === proc,
        `异常区内部 L24 定位到 EXCEPTION 区域（实际 ${tExc && tExc.blockType}）`);

    // ---- reveal 目标（selectAndRevealTarget → 捕获 createTreeView().reveal 调用）----
    console.log('\n--- reveal 目标构造 ---');
    const manager = new TreeViewManager({ subscriptions: [] });
    manager.updateDataProvider(new MemoryDataProvider(result));
    const provider = manager.getProvider();

    async function revealAndLast(target) {
        revealCalls.length = 0;
        await manager.selectAndRevealTarget(target);
        return revealCalls[revealCalls.length - 1];
    }

    /**
     * reveal 父链可解析性契约：目标沿 getParent 上溯到根，每级元素的 cacheKey
     * 必须出现在其父项 getChildren 产出的键集合中（VS Code reveal 按句柄沿链解析）。
     */
    async function assertRevealChain(element, what) {
        let cur = element;
        for (let depth = 0; cur && depth < 64; depth++) {
            const parent = await provider.getParent(cur);
            if (!parent) { return; }
            const kids = await provider.getChildren(parent);
            const keys = kids.map(k => provider.generateCacheKey(k));
            const curKey = provider.generateCacheKey(cur);
            assert(keys.includes(curKey), `${what}: 父链可解析（${curKey} 应在父项 children 中）`);
            cur = parent;
        }
        assert(false, `${what}: 父链超过 64 层（疑似成环）`);
    }

    // BEGIN 区域 → Body 文件夹（不再是宿主过程名节点）
    let call = await revealAndLast({ type: 'structureBlock', node: proc, blockType: 'BEGIN' });
    assert(!!call, 'BEGIN 区域触发 reveal');
    assert(call && call.element.isProgramGroup === true && call.element.programGroupKind === 'body',
        `BEGIN 区域 reveal 到 Body 文件夹（实际 ${call && call.element.label}）`);
    assert(call && call.element.parentNode === proc, 'Body 文件夹宿主为 follow_proc');
    assert(call && call.options && call.options.select === true && call.options.focus === false,
        'reveal 选项为选中但不聚焦');
    if (call) { await assertRevealChain(call.element, 'Body 文件夹'); }

    // DECLARE 区域 → Declaration 文件夹
    call = await revealAndLast({ type: 'structureBlock', node: proc, blockType: 'DECLARE' });
    assert(!!call, 'DECLARE 区域触发 reveal');
    assert(call && call.element.isDeclarationSection === true && call.element.parentNode === proc,
        `DECLARE 区域 reveal 到 Declaration 文件夹（实际 ${call && call.element.label}）`);
    if (call) { await assertRevealChain(call.element, 'Declaration 文件夹'); }

    // EXCEPTION 区域 → EXCEPTION 叶子（既有行为不回归）
    call = await revealAndLast({ type: 'structureBlock', node: proc, blockType: 'EXCEPTION' });
    assert(call && call.element.isStructureBlock === true &&
        call.element.structureBlock && call.element.structureBlock.type === 'EXCEPTION',
        'EXCEPTION 区域 reveal 到 EXCEPTION 叶子');
    if (call) { await assertRevealChain(call.element, 'EXCEPTION 叶子'); }

    // END → END 叶子
    call = await revealAndLast({ type: 'structureBlock', node: proc, blockType: 'END' });
    assert(call && call.element.isStructureBlock === true &&
        call.element.structureBlock && call.element.structureBlock.type === 'END',
        'END reveal 到 END 叶子');
    if (call) { await assertRevealChain(call.element, 'END 叶子'); }

    // 控制结构节点目标 → 该节点项；ELSIF 分支内的 FOR 父链上溯所属 IF（幽灵父项修复）
    const topIf = (proc.children || []).find(c => c.type === 'IF_STATEMENT' && c.declarationLine === 14);
    assert(!!topIf, '解析出 L14 顶层 IF 节点');
    if (topIf) {
        call = await revealAndLast({ type: 'node', node: topIf });
        assert(call && call.element.node === topIf, '控制结构节点 reveal 到该节点项');
        if (call) { await assertRevealChain(call.element, '顶层 IF 节点'); }
    }
    const forInElsif = (function findFor(nodes) {
        for (const n of nodes) {
            if (n.type === 'FOR_LOOP' && n.declarationLine === 17) return n;
            const hit = findFor(n.children || []);
            if (hit) return hit;
        }
        return undefined;
    })(result.nodes);
    assert(!!forInElsif, '解析出 L17 ELSIF 内 FOR 节点');
    if (forInElsif) {
        call = await revealAndLast({ type: 'node', node: forInElsif });
        assert(call && call.element.node === forInElsif, 'ELSIF 内 FOR reveal 到该节点项');
        if (call) { await assertRevealChain(call.element, 'ELSIF 内 FOR（父级应为所属 IF）'); }
    }

    // 面板不可见 → 不 reveal（静默跳过）
    treeViewSpy.visible = false;
    revealCalls.length = 0;
    await manager.selectAndRevealTarget({ type: 'structureBlock', node: proc, blockType: 'BEGIN' });
    assert(revealCalls.length === 0, '面板不可见时不调用 reveal');
    treeViewSpy.visible = true;

    // ---- 无声明项过程：DECLARE 跟随回退宿主节点 ----
    console.log('\n--- Declaration 文件夹不可渲染时回退 ---');
    const noDecl = noDeclResult.nodes.find(n => n.name === 'no_decl');
    assert(!!noDecl, '解析出 no_decl 过程');
    const tNoDecl = noDecl && callFindTarget(noDeclResult.nodes, 2);
    assert(tNoDecl && tNoDecl.type === 'structureBlock' && tNoDecl.blockType === 'DECLARE',
        `无声明项过程 L2 仍定位到 DECLARE 区域（实际 ${tNoDecl && tNoDecl.blockType}）`);
    revealCalls.length = 0;
    manager.updateDataProvider(new MemoryDataProvider(noDeclResult));
    await manager.selectAndRevealTarget({ type: 'structureBlock', node: noDecl, blockType: 'DECLARE' });
    const fbCall = revealCalls[revealCalls.length - 1];
    assert(fbCall && fbCall.element.node === noDecl && !fbCall.element.isProgramGroup && !fbCall.element.isDeclarationSection,
        `Declaration 不可渲染时回退 reveal 宿主节点（实际 ${fbCall && fbCall.element.label}）`);
    if (fbCall) { await assertRevealChain(fbCall.element, '回退宿主节点'); }

    // ---- 触发器：区域目标挂在代理匿名块上，父链经宿主解析 ----
    console.log('\n--- 触发器（代理匿名块）---');
    const trg = triggerResult.nodes.find(n => n.type === 'TRIGGER');
    assert(!!trg, '解析出 trg_follow 触发器');
    const anonChild = trg && (trg.children || []).find(c => c.type === 'ANONYMOUS_BLOCK');
    assert(!!anonChild, '触发器主体解析为内联匿名块');
    const tTrgIf = triggerResult.nodes && callFindTarget(triggerResult.nodes, 7);
    assert(tTrgIf && tTrgIf.type === 'node' && tTrgIf.node.type === 'IF_STATEMENT',
        `触发器 IF 体内 L7 跟随到 IF 节点（实际 ${tTrgIf && tTrgIf.node && tTrgIf.node.type}）`);
    if (anonChild && anonChild.beginLine) {
        revealCalls.length = 0;
        manager.updateDataProvider(new MemoryDataProvider(triggerResult));
        await manager.selectAndRevealTarget({ type: 'structureBlock', node: anonChild, blockType: 'BEGIN' });
        const trgCall = revealCalls[revealCalls.length - 1];
        assert(trgCall && trgCall.element.isProgramGroup === true && trgCall.element.programGroupKind === 'body' &&
            trgCall.element.parentNode === anonChild,
            '触发器 BEGIN 区域 reveal 到匿名块的 Body 文件夹');
        if (trgCall) { await assertRevealChain(trgCall.element, '触发器匿名块 Body（父级应为宿主）'); }
    }

    // ---- 包规格：无 BEGIN，跟随停留在节点 ----
    console.log('\n--- 包规格（无 BEGIN）---');
    const tPkg = callFindTarget(specResult.nodes, 1);
    assert(tPkg && tPkg.type === 'node' && tPkg.node.type === 'PACKAGE_HEADER',
        `包规格声明行 L1 定位到包节点（实际 ${tPkg && tPkg.node && tPkg.node.type}）`);
    const tSpecMember = callFindTarget(specResult.nodes, 2);
    assert(tSpecMember && tSpecMember.type === 'node' && tSpecMember.node.name === 'do_a',
        `包成员声明行 L2 定位到成员节点（实际 ${tSpecMember && tSpecMember.node && tSpecMember.node.name}）`);

    console.log('\n================================');
    console.log(`测试结果: ${passed}/${passed + failed} 通过`);
    if (failed > 0) { failures.forEach(f => console.error('  - ' + f)); process.exit(1); }
    console.log('\n所有测试通过!');
}

main().catch(err => { console.error('测试执行异常:', err); process.exit(1); });

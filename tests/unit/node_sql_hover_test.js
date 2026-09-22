/**
 * GMLTest: 节点悬浮聚合游标 SQL 测试（Issue #36）
 *
 * 背景：#33 已支持悬浮单个游标项/游标名显示完整 SQL；#36 扩展为悬浮任意
 * 大纲节点（或编辑器中的单元名）时聚合展示该单元直接作用域内声明的全部
 * 游标 SQL（原生悬浮高度随内容自适应）。
 *
 * 锁定契约：
 *  - getScopeCursorSqls：仅统计节点自身 variableTable 的游标（嵌套子程序
 *    作用域不并入父级），按声明行排序
 *  - 节点 TreeItem tooltip：有游标 → MarkdownString 逐条 ```sql 块；
 *    无游标 → 维持纯文本 tooltip
 *  - 编辑器 Hover：悬浮单元名返回单元头信息 + 全部游标 SQL；控制结构
 *    占位名/未知词返回 null
 */
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class TreeItem { constructor(label, collapsibleState) { this.label = label; this.collapsibleState = collapsibleState; } },
    ThemeIcon: class ThemeIcon { constructor(id) { this.id = id; } },
    EventEmitter: class EventEmitter { constructor() { this.listeners = []; } event(l) { this.listeners.push(l); return { dispose() {} }; } fire(d) { this.listeners.forEach(l => l(d)); } dispose() { this.listeners = []; } },
    MarkdownString: class MarkdownString { constructor(s) { this.value = s || ''; } appendMarkdown(s) { this.value += s; return this; } },
    Hover: class Hover { constructor(c, r) { this.contents = c; this.range = r; } },
    workspace: { getConfiguration: () => ({ get: (k, def) => def }), fs: {}, createFileSystemWatcher: () => ({ onDidCreate() {}, onDidChange() {}, onDidDelete() {}, dispose() {} }) },
    window: { createOutputChannel: () => ({ appendLine() {}, dispose() {} }), createTreeView: () => ({ visible: true, reveal() {}, dispose() {} }), showQuickPick: async () => undefined, showInformationMessage() {}, showWarningMessage() {}, showErrorMessage() {} },
    commands: { registerCommand: () => ({ dispose() {} }) },
    RelativePattern: class RelativePattern { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f }) },
    Position: class Position { constructor(l, c) { this.line = l; this.character = c; } },
    Range: class Range { constructor(s, e) { this.start = s; this.end = e; } },
    Location: class Location { constructor(u, r) { this.uri = u; this.range = r; } },
    ViewColumn: { One: 1, Two: 2, Beside: -2 }
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request) { if (request === 'vscode') return 'vscode_mock'; return originalResolve.apply(this, arguments); };
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../../out/parser');
const { PLSQLOutlineProvider, MemoryDataProvider } = require('../../out/treeView');
const { PLSQLOutlineExtension } = require('../../out/extension');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

const CODE = [
    'CREATE OR REPLACE PROCEDURE p_hover IS',      // 1
    '  CURSOR c_first IS SELECT 1 FROM dual;',      // 2
    '  CURSOR c_second IS',                         // 3
    '    SELECT 2',                                 // 4
    '      FROM dual;',                             // 5
    '  PROCEDURE nested_sub IS',                    // 6
    '    CURSOR c_nested IS SELECT 3 FROM dual;',   // 7
    '  BEGIN',                                      // 8
    '    NULL;',                                    // 9
    '  END nested_sub;',                            // 10
    'BEGIN',                                        // 11
    '  NULL;',                                      // 12
    'END p_hover;'                                  // 13
].join('\n');

async function run() {
    const rec = makeRecorder();
    const result = await new PLSQLParser().parse(CODE, 'node_sql_hover_test.sql');
    const proc = result.nodes.find(n => n.name === 'p_hover');
    const nested = proc && (proc.children || []).find(c => c.name === 'nested_sub');
    rec.assert('proc_parsed', '解析出 p_hover 与嵌套 nested_sub', !!proc && !!nested, `${!!proc}/${!!nested}`);
    if (!proc || !nested) { return { suiteName: '节点悬浮聚合SQL', cases: rec.cases }; }

    const provider = new PLSQLOutlineProvider();
    provider.setDataProvider(new MemoryDataProvider(result));

    // ---- getScopeCursorSqls：仅直接作用域游标，按行序 ----
    const procCursors = provider.getScopeCursorSqls(proc);
    rec.assert('scope_direct_only', 'p_hover 作用域仅含 c_first/c_second（嵌套 c_nested 不并入）',
        procCursors.length === 2 && procCursors[0].name === 'c_first' && procCursors[1].name === 'c_second',
        procCursors.map(c => c.name).join(','));
    const nestedCursors = provider.getScopeCursorSqls(nested);
    rec.assert('nested_scope_own', 'nested_sub 作用域仅含 c_nested',
        nestedCursors.length === 1 && nestedCursors[0].name === 'c_nested', nestedCursors.map(c => c.name).join(','));

    // ---- 节点 tooltip：多条 SQL 聚合 ----
    const procTip = provider.getTreeItem({ node: proc, isStructureBlock: false, label: 'p_hover', line: proc.declarationLine }).tooltip;
    rec.assert('proc_tooltip_markdown', '有游标的节点 tooltip 为 MarkdownString',
        procTip && typeof procTip === 'object' && typeof procTip.value === 'string', typeof procTip);
    if (procTip && procTip.value) {
        rec.assert('tooltip_both_sql', 'tooltip 聚合两条游标 SQL（含 ```sql 块与 SELECT 原文）',
            (procTip.value.match(/```sql/g) || []).length === 2 &&
            procTip.value.includes('SELECT 1 FROM dual') && procTip.value.includes('SELECT 2'),
            procTip.value.slice(-160));
        rec.assert('tooltip_no_nested_sql', 'tooltip 不含嵌套子程序作用域的 c_nested SQL',
            !procTip.value.includes('SELECT 3 FROM dual'), procTip.value.includes('SELECT 3'));
        rec.assert('tooltip_order', '游标按声明行序展示（c_first 在 c_second 前）',
            procTip.value.indexOf('c_first') < procTip.value.indexOf('c_second'),
            procTip.value.indexOf('c_first') + '/' + procTip.value.indexOf('c_second'));
    }
    const nestedTip = provider.getTreeItem({ node: nested, isStructureBlock: false, label: 'nested_sub', line: nested.declarationLine }).tooltip;
    rec.assert('nested_tooltip_single', '嵌套子程序 tooltip 仅聚合自身游标 c_nested',
        nestedTip && typeof nestedTip === 'object' && nestedTip.value.includes('SELECT 3 FROM dual') &&
        !nestedTip.value.includes('SELECT 1'),
        typeof nestedTip === 'object' ? nestedTip.value.slice(-120) : typeof nestedTip);

    // 无游标节点维持纯文本 tooltip
    const plainCode = 'CREATE OR REPLACE PROCEDURE p_plain IS\nBEGIN\n  NULL;\nEND p_plain;';
    const plainResult = await new PLSQLParser().parse(plainCode, 'plain_hover_test.sql');
    const plainProc = plainResult.nodes[0];
    const plainProvider = new PLSQLOutlineProvider();
    plainProvider.setDataProvider(new MemoryDataProvider(plainResult));
    const plainTip = plainProvider.getTreeItem({ node: plainProc, isStructureBlock: false, label: 'p_plain', line: plainProc.declarationLine }).tooltip;
    rec.assert('no_cursor_plain_tooltip', '无游标节点维持纯文本 tooltip', typeof plainTip === 'string', typeof plainTip);

    // ---- 编辑器 Hover：单元名聚合 ----
    const extProto = PLSQLOutlineExtension.prototype;
    const extStub = Object.create(extProto);
    extStub.currentParseResult = result;
    extStub.parseDocumentQuiet = async () => { /* 测试桩：跳过按需重解析 */ };
    extStub.debugLog = () => { /* 测试桩：静默 */ };
    extStub.treeViewManager = { getProvider: () => provider };
    const makeDoc = (word) => ({
        uri: { fsPath: 'node_sql_hover_test.sql' },
        fileName: 'node_sql_hover_test.sql',
        languageId: 'plsql',
        version: 1,
        getText: () => word,
        getWordRangeAtPosition: () => new mockVscode.Range(new mockVscode.Position(5, 2), new mockVscode.Position(5, 2 + word.length)),
        lineAt: () => ({ text: '  ' + word + ';', lineNumber: 5 })
    });

    const hoverMain = await extStub.provideHover(makeDoc('p_hover'), new mockVscode.Position(5, 3), undefined);
    rec.assert('hover_node_returns', '悬浮单元名返回 Hover', !!hoverMain, !!hoverMain);
    if (hoverMain) {
        const md = hoverMain.contents && hoverMain.contents[0] ? hoverMain.contents[0] : hoverMain.contents;
        rec.assert('hover_node_aggregates', '悬浮 p_hover 聚合两条游标 SQL',
            (md.value.match(/```sql/g) || []).length === 2 && md.value.includes('**p_hover**'),
            md.value.slice(-140));
    }

    const hoverNested = await extStub.provideHover(makeDoc('nested_sub'), new mockVscode.Position(9, 3), undefined);
    rec.assert('hover_nested_returns', '悬浮嵌套子程序名返回 Hover', !!hoverNested, !!hoverNested);
    if (hoverNested) {
        const mdNested = hoverNested.contents && hoverNested.contents[0] ? hoverNested.contents[0] : hoverNested.contents;
        rec.assert('hover_nested_own_scope', '悬浮 nested_sub 仅含自身游标 SQL（不含父级游标）',
            (mdNested.value.match(/```sql/g) || []).length === 1 && mdNested.value.includes('SELECT 3 FROM dual'),
            mdNested.value.slice(-120));
    }

    // 控制结构占位名 / 未知词 → null
    const hoverIf = await extStub.provideHover(makeDoc('IF'), new mockVscode.Position(4, 3), undefined);
    rec.assert('hover_control_null', '控制结构占位名不触发悬浮', hoverIf === null, JSON.stringify(hoverIf && 'hover'));
    const hoverUnknown = await extStub.provideHover(makeDoc('no_such_name'), new mockVscode.Position(4, 3), undefined);
    rec.assert('hover_unknown_null', '未知词不触发悬浮', hoverUnknown === null, JSON.stringify(hoverUnknown && 'hover'));

    return { suiteName: '节点悬浮聚合SQL', cases: rec.cases };
}

module.exports = { run };

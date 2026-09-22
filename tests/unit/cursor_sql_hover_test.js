/**
 * GMLTest: 游标完整 SQL 捕获与悬浮展示测试（Issue #33）
 *
 * 验证：
 *  - 解析层：VariableInfo.sql 捕获游标声明完整原文——单行（剥尾注释）、
 *    多行 SELECT、带参数/RETURN 子句跨行、字符串内分号（'' 转义与 Q-quote）不截断，
 *    末行于字符串感知的真实 ';' 处截断
 *  - 显示层：大纲 Cursors 声明项 tooltip 含 ```sql 代码块（MarkdownString）；
 *    非游标声明项维持纯文本 tooltip
 *  - 编辑器 Hover：游标名悬浮内容追加完整 SQL 代码块（provideHover 原型反射）
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
const { DeclarationCategory } = require('../../out/types');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

async function parseOne(code) {
    return new PLSQLParser().parse(code, 'cursor_sql_test.sql');
}

async function run() {
    const rec = makeRecorder();

    const code = [
        'CREATE OR REPLACE PROCEDURE p_cursor_demo IS',          // 1
        '  CURSOR c_simple IS SELECT * FROM emp WHERE deptno = 10;   -- 单行游标',  // 2
        '  CURSOR c_multi IS',                                    // 3
        '    SELECT ename,',                                      // 4
        '           sal',                                         // 5
        '      FROM emp',                                         // 6
        "     WHERE remark = q'[a;b]' AND sal > 100;",            // 7
        '  CURSOR c_param(p_d IN NUMBER,',                        // 8
        '                 p_e IN VARCHAR2) RETURN emp%ROWTYPE IS',// 9
        "    SELECT * FROM emp WHERE deptno = p_d AND note = 'it''s;ok';", // 10
        '  v_dummy NUMBER;',                                      // 11
        'BEGIN',                                                  // 12
        '  NULL;',                                                // 13
        'END p_cursor_demo;'                                      // 14
    ].join('\n');
    const result = await parseOne(code);
    const proc = result.nodes[0];
    const table = proc.variableTable;
    rec.assert('table_exists', '解析出声明表', !!table, !!table);
    if (!table) { return { suiteName: '游标SQL悬浮', cases: rec.cases }; }

    // ---- 解析层：VariableInfo.sql 捕获 ----
    const cSimple = table.get('c_simple');
    const cMulti = table.get('c_multi');
    const cParam = table.get('c_param');
    rec.assert('c_simple_sql', '单行游标 SQL 捕获且剥除尾注释',
        cSimple && cSimple.sql === '  CURSOR c_simple IS SELECT * FROM emp WHERE deptno = 10;',
        cSimple && cSimple.sql);
    rec.assert('c_multi_sql', '多行 SELECT 游标 SQL 原文完整捕获（含 Q-quote 内分号）',
        cMulti && cMulti.sql === [
            '  CURSOR c_multi IS',
            '    SELECT ename,',
            '           sal',
            '      FROM emp',
            "     WHERE remark = q'[a;b]' AND sal > 100;"
        ].join('\n'),
        cMulti && cMulti.sql);
    rec.assert('c_param_sql', '跨行参数 + RETURN 子句游标 SQL 完整捕获（含转义引号内分号）',
        cParam && cParam.sql === [
            '  CURSOR c_param(p_d IN NUMBER,',
            '                 p_e IN VARCHAR2) RETURN emp%ROWTYPE IS',
            "    SELECT * FROM emp WHERE deptno = p_d AND note = 'it''s;ok';"
        ].join('\n'),
        cParam && cParam.sql);
    rec.assert('v_dummy_no_sql', '普通变量无 sql 字段',
        table.get('v_dummy') && table.get('v_dummy').sql === undefined,
        table.get('v_dummy') && table.get('v_dummy').sql);

    // ---- 防护：畸形游标（缺终止分号）不吞后续语句 ----
    const badCode = [
        'CREATE OR REPLACE PROCEDURE p_bad IS',
        '  CURSOR c_bad IS SELECT 1',   // 缺 ';'
        'BEGIN',
        '  NULL;',
        'END p_bad;'
    ].join('\n');
    const badResult = await parseOne(badCode);
    const badEntry = badResult.nodes[0] && badResult.nodes[0].variableTable
        ? badResult.nodes[0].variableTable.get('c_bad') : undefined;
    rec.assert('malformed_no_sql', '缺终止分号的游标不捕获 SQL（不吞 BEGIN/NULL）',
        badEntry && badEntry.sql === undefined, badEntry && badEntry.sql);

    // ---- 防护：SQL 内 ``` 序列不破坏 markdown 代码块（围栏自动加长） ----
    const fenceCode = [
        'CREATE OR REPLACE PROCEDURE p_fence IS',
        "  CURSOR c_fence IS SELECT '```code' AS v",   // 字符串内含三反引号
        '    FROM dual; -- ```break',
        'BEGIN',
        '  NULL;',
        'END p_fence;'
    ].join('\n');
    const fenceResult = await parseOne(fenceCode);
    const fenceEntry = fenceResult.nodes[0] && fenceResult.nodes[0].variableTable
        ? fenceResult.nodes[0].variableTable.get('c_fence') : undefined;
    rec.assert('fence_sql_captured', '含 ``` 字面量的游标 SQL 仍捕获',
        fenceEntry && typeof fenceEntry.sql === 'string' && fenceEntry.sql.includes('FROM dual'),
        fenceEntry && fenceEntry.sql);
    if (fenceEntry && fenceEntry.sql) {
        const fenceProvider = new PLSQLOutlineProvider();
        fenceProvider.setDataProvider(new MemoryDataProvider(fenceResult));
        const fenceTip = fenceProvider.getTreeItem({
            isStructureBlock: false,
            label: 'c_fence',
            line: 2,
            isDeclarationEntry: true,
            declarationEntry: fenceEntry
        }).tooltip;
        const tipValue = fenceTip && fenceTip.value || '';
        // 围栏应为 4 个反引号（长于 SQL 内 3 连串），且 SQL 的 ``` 原样保留在块内
        rec.assert('fence_longer_than_backticks', 'tooltip 围栏长于 SQL 内最长反引号连串（4×` 开闭）',
            /````sql\n/.test(tipValue) && tipValue.includes("SELECT '```code' AS v") && tipValue.endsWith('````'),
            tipValue);
    }

    // ---- 显示层：大纲 Cursors 项 tooltip 含 sql 代码块 ----
    const provider = new PLSQLOutlineProvider();
    provider.setDataProvider(new MemoryDataProvider(result));
    const entryItem = {
        isStructureBlock: false,
        label: 'c_simple',
        line: 2,
        isDeclarationEntry: true,
        declarationEntry: cSimple
    };
    const entryTreeItem = provider.getTreeItem(entryItem);
    const tip = entryTreeItem.tooltip;
    rec.assert('tooltip_markdown', '游标项 tooltip 为 MarkdownString', tip && typeof tip === 'object' && typeof tip.value === 'string', tip && tip.constructor && tip.constructor.name);
    rec.assert('tooltip_sql_block', 'tooltip 含 ```sql 代码块与完整 SQL',
        tip && tip.value.includes('```sql') && tip.value.includes('CURSOR c_simple IS SELECT * FROM emp WHERE deptno = 10;'),
        tip && tip.value.slice(0, 120));
    const varTreeItem = provider.getTreeItem({
        isStructureBlock: false,
        label: 'v_dummy : NUMBER',
        line: 11,
        isDeclarationEntry: true,
        declarationEntry: table.get('v_dummy')
    });
    rec.assert('var_tooltip_plain', '非游标声明项维持纯文本 tooltip',
        varTreeItem.tooltip && typeof varTreeItem.tooltip === 'string',
        varTreeItem.tooltip);

    // ---- 编辑器 Hover：游标名悬浮追加完整 SQL ----
    const extProto = PLSQLOutlineExtension.prototype;
    const extStub = Object.create(extProto);
    extStub.currentParseResult = result;
    extStub.parseDocumentQuiet = async () => { /* 测试桩：跳过按需重解析 */ };
    extStub.debugLog = () => { /* 测试桩：静默 */ };
    const doc = {
        uri: { fsPath: 'cursor_sql_test.sql' },
        fileName: 'cursor_sql_test.sql',
        languageId: 'plsql',
        version: 1,
        getText: (r) => 'c_simple',
        getWordRangeAtPosition: () => new mockVscode.Range(new mockVscode.Position(12, 2), new mockVscode.Position(12, 10)),
        lineAt: () => ({ text: '  c_simple;', lineNumber: 12 })
    };
    const hover = await extStub.provideHover(doc, new mockVscode.Position(12, 3), undefined);
    rec.assert('hover_returns', '编辑器悬浮游标名返回 Hover', !!hover, !!hover);
    if (hover) {
        const md = hover.contents && hover.contents[0] ? hover.contents[0] : hover.contents;
        rec.assert('hover_sql_appended', '悬浮内容追加 ```sql 完整 SQL 代码块',
            md.value.includes('```sql') && md.value.includes('CURSOR c_simple IS SELECT * FROM emp WHERE deptno = 10;'),
            md.value.slice(-140));
    }

    return { suiteName: '游标SQL悬浮', cases: rec.cases };
}

module.exports = { run };

/**
 * Refresh 焦点回退测试（Issue #23 评审 H1）— extension.ts parseCurrentFile 宿主行为
 *
 * 背景：顶部 Refresh 按钮（plsqlOutline.refresh）改接 parseCurrentFile 后，
 * 当大纲树获得焦点时 vscode.window.activeTextEditor 为 undefined，命令会
 * 弹"没有活动的编辑器"而不解析——与 Issue #23 要修的"点击无效"同症状。
 * 修复：onActiveEditorChanged 记录最近 PL/SQL 编辑器，parseCurrentFile 在
 * activeTextEditor 为空时回退。
 *
 * 锁定契约：
 *  1. 大纲树焦点（activeTextEditor=undefined）下 Refresh → 回退最近 PL/SQL 编辑器，
 *     解析正常完成（getCurrentParseResult 非空），无任何警告
 *  2. 活动编辑器为非 PL/SQL 文件 → 保持原警告语义（"当前文件不是PL/SQL文件"），不回退
 *  3. 无活动编辑器且从未有过 PL/SQL 编辑器 → "没有活动的编辑器"
 *
 * 同层先例：cursor_sync_test（mock vscode 加载 out/extension）。
 * 不放 e2e 的原因：焦点回退逻辑可确定性验证；"树获得焦点使 activeTextEditor
 * 变 undefined"是 VS Code 平台事实，e2e 只会重复验证平台而非本扩展逻辑。
 *
 * 运行：node tests/regression/refresh_focus_test.js （需先 npm run compile）
 */
const Module = require('module');

// ---------- mock vscode（在 require out/extension 前注入）----------
const listeners = {};          // 事件回调捕获
const warnings = [];           // showWarningMessage 捕获
let activeTextEditor = undefined; // 可变的活动编辑器状态

function makeMockDocument(fileName, version) {
    return {
        fileName,
        version,
        languageId: fileName.endsWith('.md') ? 'markdown' : (fileName.endsWith('.sql') ? 'sql' : 'plsql'),
        uri: { toString: () => 'file:///' + fileName, fsPath: fileName },
        getText: () => 'CREATE OR REPLACE PROCEDURE p_focus IS\nBEGIN\n  NULL;\nEND p_focus;\n'
    };
}
function makeMockEditor(doc) {
    return { document: doc };
}

const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class { constructor(l, c) { this.label = l; this.collapsibleState = c; } },
    ThemeIcon: class { constructor(id) { this.id = id; } },
    EventEmitter: class { constructor() { this.l = []; } event(l) { this.l.push(l); return { dispose() {} }; } fire(d) { this.l.forEach(x => x(d)); } dispose() { this.l = []; } },
    workspace: {
        getConfiguration: () => ({ get: (k, d) => d, update: async () => {} }),
        fs: {},
        onDidSaveTextDocument: (cb) => { listeners.save = cb; return { dispose() {} }; },
        onDidChangeConfiguration: (cb) => { listeners.config = cb; return { dispose() {} }; },
        onDidChangeTextDocument: (cb) => { listeners.docChange = cb; return { dispose() {} }; }
    },
    window: {
        // 活动编辑器用 getter 模拟真实运行时可变性
        get activeTextEditor() { return activeTextEditor; },
        onDidChangeActiveTextEditor: (cb) => { listeners.activeChanged = cb; return { dispose() {} }; },
        onDidChangeTextEditorSelection: (cb) => { listeners.selection = cb; return { dispose() {} }; },
        createOutputChannel: () => ({ appendLine() {}, show() {}, dispose() {} }),
        createStatusBarItem: () => ({ text: '', tooltip: '', command: undefined, name: '', show() {}, hide() {}, dispose() {} }),
        createTreeView: () => ({
            visible: true, title: '',
            reveal: async () => {},
            onDidExpandElement: () => ({ dispose() {} }),
            onDidCollapseElement: () => ({ dispose() {} }),
            onDidChangeVisibility: () => ({ dispose() {} }),
            dispose() {}
        }),
        showQuickPick: async () => undefined,
        showInformationMessage() {},
        showWarningMessage: (msg) => { warnings.push(msg); },
        showErrorMessage: (msg) => { warnings.push(msg); },
        setStatusBarMessage() {},
        // 大纲搜索框视图（Issue #36）：只注册不渲染
        registerWebviewViewProvider: () => ({ dispose() {} }),
        // withProgress：立即执行回调（不渲染 UI），取消令牌永不触发
        withProgress: async (_opts, cb) => cb(
            { report() {} },
            { isCancellationRequested: false }
        )
    },
    commands: { registerCommand: () => ({ dispose() {} }) },
    languages: {
        registerHoverProvider: () => ({ dispose() {} }),
        registerDefinitionProvider: () => ({ dispose() {} }),
        registerFoldingRangeProvider: () => ({ dispose() {} }),
        registerDocumentHighlightProvider: () => ({ dispose() {} })
    },
    RelativePattern: class { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f, toString: () => f }) },
    Position: class { constructor(l, c) { this.line = l; this.character = c; } },
    Location: class { constructor(u, r) { this.uri = u; this.range = r; } },
    Range: class { constructor(s, e) { this.start = s; this.end = e; } },
    MarkdownString: class { constructor(s) { this.value = s; } },
    Hover: class { constructor(c, r) { this.contents = c; this.range = r; } },
    ViewColumn: { One: 1, Two: 2, Beside: -2 },
    ProgressLocation: { Notification: 15, SourceControl: 1, Window: 10 },
    StatusBarAlignment: { Left: 1, Right: 2 }
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request) {
    if (request === 'vscode') return 'vscode_mock';
    return originalResolve.apply(this, arguments);
};
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLOutlineExtension } = require('../../out/extension');

let passed = 0, failed = 0;
const failures = [];
function assert(cond, msg) { if (cond) passed++; else { failed++; failures.push(msg); console.error('  ✗ FAIL: ' + msg); } }

async function main() {
    console.log('=== Refresh 焦点回退测试（Issue #23 评审 H1）===\n');
    const context = { subscriptions: [] };
    const ext = new PLSQLOutlineExtension(context);
    let ext2 = null; // Case 3 的独立实例（finally 统一清理）
    const docA = makeMockDocument('focus_target.pkb', 1);
    const editorA = makeMockEditor(docA);

    try {
        // ---- Case 1: 大纲树焦点（activeTextEditor=undefined）→ 回退最近 PL/SQL 编辑器 ----
        console.log('--- Case 1: 焦点在大纲树，Refresh 回退最近 PL/SQL 编辑器 ---');
        activeTextEditor = editorA;
        listeners.activeChanged(editorA);           // 模拟用户先在 PL/SQL 文件上活动过
        activeTextEditor = undefined;               // 模拟焦点移到大纲树（VS Code 平台行为）
        warnings.length = 0;
        await ext['parseCurrentFile']();
        const result1 = ext.getCurrentParseResult();
        assert(warnings.length === 0, `无任何警告（实际: ${warnings.join(' | ') || '无'}）`);
        assert(result1 !== null, '解析完成，getCurrentParseResult 非空');
        assert(result1 && result1.metadata && result1.metadata.sourceFile === 'focus_target.pkb',
            `解析的是回退编辑器的文档（实际: ${result1 && result1.metadata && result1.metadata.sourceFile}）`);
        assert(result1 && result1.nodes && result1.nodes.length === 1 && result1.nodes[0].name === 'p_focus',
            '解析结果包含过程 p_focus');

        // ---- Case 2: 活动编辑器为非 PL/SQL 文件 → 保持原警告，不回退 ----
        console.log('--- Case 2: 活动编辑器非 PL/SQL 文件 ---');
        const mdEditor = makeMockEditor(makeMockDocument('readme.md', 1));
        // readme.md 不满足 languageId/扩展名判定 → isPLSQLFile 为 false
        activeTextEditor = mdEditor;
        warnings.length = 0;
        await ext['parseCurrentFile']();
        assert(warnings.some(w => w.includes('不是PL/SQL文件')),
            `警告"当前文件不是PL/SQL文件"（实际: ${warnings.join(' | ') || '无'}）`);

        // ---- Case 3: 无活动编辑器且从无 PL/SQL 编辑器 → "没有活动的编辑器" ----
        console.log('--- Case 3: 全新窗口（从无 PL/SQL 编辑器）---');
        ext2 = new PLSQLOutlineExtension({ subscriptions: [] });
        activeTextEditor = undefined;
        warnings.length = 0;
        await ext2['parseCurrentFile']();
        assert(warnings.some(w => w.includes('没有活动的编辑器')),
            `警告"没有活动的编辑器"（实际: ${warnings.join(' | ') || '无'}）`);
        assert(ext2.getCurrentParseResult() === null, '未产生解析结果');

        console.log(`\n结果: ${passed}/${passed + failed} 通过`);
        process.exitCode = failed === 0 ? 0 : 1;
    } finally {
        // 清理内存监控 setInterval，让进程正常退出
        ext.dispose();
        ext2.dispose();
    }

    if (failed > 0) {
        console.error('失败项:', failures);
    }
}

main().catch(e => { console.error(e); process.exit(1); });

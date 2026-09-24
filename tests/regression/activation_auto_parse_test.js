/**
 * 激活自动解析识别口径测试（Issue #29）
 *
 * 背景：activate() 末尾的「活动 PL/SQL 文件自动解析」此前硬编码
 * DEFAULT_FILE_EXTENSIONS——用户经 plsql-outline.fileExtensions 配置的扩展名
 * （如 .tps）激活时不触发自动解析，大纲为空，需手动点解析；而 parseCurrentFile、
 * 提供者（#26）都走 isPLSQLFile 的配置分支，识别口径不一致。
 * 修复：activate() 复用 isPLSQLFile（public 化）。
 *
 * 锁定契约（真实 activate() 流程 + mock vscode，捕获 executeCommand 调用）：
 *  1. 配置扩展名（['.tps']）+ plaintext 语言 ID 的 .tps 文件 → 激活后 1s 自动解析触发
 *  2. 默认配置 + .fcn（在 DEFAULT_FILE_EXTENSIONS 内、未声明语言）→ 仍触发（不回归）
 *  3. 配置扩展名（['.tps']）+ .txt → 不触发（负例）
 *
 * 同层先例：refresh_focus_test（mock vscode 加载 out/extension，调用真实 activate）。
 * 不放 e2e 的原因：激活时机 + 1s 延迟定时器可确定性验证；e2e 无法便捷观测
 * executeCommand('plsqlOutline.parseCurrentFile') 是否由激活路径发出。
 *
 * 运行：node tests/regression/activation_auto_parse_test.js （需先 npm run compile）
 */
const Module = require('module');

// ---------- mock vscode（在 require out/extension 前注入）----------
const listeners = {};          // 事件回调捕获
const warnings = [];           // showWarningMessage 捕获
const executed = [];           // executeCommand 调用捕获
let activeTextEditor = undefined; // 可变的活动编辑器状态
let configuredExts = null;     // null = 返回默认值（模拟未配置）

function makeDoc(fileName, languageId) {
    return {
        fileName,
        version: 1,
        languageId,
        uri: { toString: () => 'file:///' + fileName, fsPath: fileName },
        getText: () => 'CREATE OR REPLACE PROCEDURE p_auto IS\nBEGIN\n  NULL;\nEND p_auto;\n'
    };
}
function makeEditor(doc) {
    return { document: doc };
}
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class { constructor(l, c) { this.label = l; this.collapsibleState = c; } },
    ThemeIcon: class { constructor(id) { this.id = id; } },
    EventEmitter: class { constructor() { this.l = []; } event(l) { this.l.push(l); return { dispose() {} }; } fire(d) { this.l.forEach(x => x(d)); } dispose() { this.l = []; } },
    workspace: {
        getConfiguration: () => ({
            get: (k, d) => (k === 'fileExtensions' && configuredExts ? configuredExts : d),
            update: async () => {}
        }),
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
    commands: {
        registerCommand: () => ({ dispose() {} }),
        // 激活自动解析走此路径：只记录，不真正执行命令（路由验证，不重复验证解析）
        executeCommand: (cmd) => { executed.push(cmd); return Promise.resolve(); }
    },
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

const { activate, deactivate } = require('../../out/extension');

let passed = 0, failed = 0;
const failures = [];
function assert(cond, msg) { if (cond) passed++; else { failed++; failures.push(msg); console.error('  ✗ FAIL: ' + msg); } }

async function runActivationCase() {
    executed.length = 0;
    warnings.length = 0;
    activate({ subscriptions: [] });
    // activate() 内 setTimeout 1000ms 后才发命令，留足余量
    await sleep(1400);
}

async function main() {
    console.log('=== 激活自动解析识别口径测试（Issue #29）===\n');
    try {
        // ---- Case 1: 配置扩展名 .tps（plaintext）→ 自动解析触发（修复前不触发）----
        console.log('--- Case 1: 配置扩展名文件（.tps, plaintext）激活自动解析 ---');
        configuredExts = ['.tps'];
        activeTextEditor = makeEditor(makeDoc('auto_parse.tps', 'plaintext'));
        await runActivationCase();
        assert(executed.includes('plsqlOutline.parseCurrentFile'),
            `配置扩展名文件激活后应自动解析（实际 executeCommand: ${executed.join(',') || '无'}）`);
        deactivate();

        // ---- Case 2: 默认配置 + .fcn → 仍触发（DEFAULT_FILE_EXTENSIONS 原有不回归）----
        console.log('--- Case 2: 默认配置 + .fcn（默认清单内、未声明语言）---');
        configuredExts = null;
        activeTextEditor = makeEditor(makeDoc('auto_parse.fcn', 'plaintext'));
        await runActivationCase();
        assert(executed.includes('plsqlOutline.parseCurrentFile'),
            `.fcn 在默认清单内应自动解析（实际 executeCommand: ${executed.join(',') || '无'}）`);
        deactivate();

        // ---- Case 3: .txt（不在配置内）→ 不触发 ----
        console.log('--- Case 3: 非 PL/SQL 文档（.txt）不触发 ---');
        configuredExts = ['.tps'];
        activeTextEditor = makeEditor(makeDoc('note.txt', 'plaintext'));
        await runActivationCase();
        assert(!executed.includes('plsqlOutline.parseCurrentFile'),
            `.txt 不应触发激活自动解析（实际 executeCommand: ${executed.join(',') || '无'}）`);
        deactivate();

        console.log(`\n结果: ${passed}/${passed + failed} 通过`);
        process.exitCode = failed === 0 ? 0 : 1;
    } finally {
        // 清理内存监控 setInterval，让进程正常退出
        deactivate();
    }

    if (failed > 0) {
        console.error('失败项:', failures);
    }
}

main().catch(e => { console.error(e); process.exit(1); });

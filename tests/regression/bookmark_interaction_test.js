/**
 * GMLTest: 书签行号交互回归（v1.17.0；2026-10-06 定稿：单击切换）
 *
 * 平台事实（SendInput + 事件轨迹实测，见 memory reference-vscode-selection-
 * event-platform-limits）：VS Code 对"选区值完全相同"的点击**不派发任何事件**——
 * 双击行号的第二击零事件，双击不可检测。交互定稿：
 *   - 单击未选中的行号（必产生一个整行选事件）→ 直接切换书签（建签不弹表单）
 *   - 同选区重复点击零事件 → 无操作（平台天然防误触）
 *   - 编辑书签走悬停卡/右键菜单/书签视图/命令（showInputBox）
 *   - Ctrl+Alt+K 在光标行切换（键绑定，命令路径）
 *
 * 本套件以 mock vscode 直接驱动 BookmarkManager.onSelectionChanged 的真实
 * 事件形态，锁定交互契约。
 */
const Module = require('module');

const listeners = {};
let activeTextEditor = undefined;
const decoTypes = [];

function makeDoc() {
    return {
        fileName: 'bm_interaction.pkb',
        version: 1,
        languageId: 'plsql',
        uri: { toString: () => 'file:///bm_interaction.pkb', fsPath: 'bm_interaction.pkb' },
        lineCount: 22,
        getText: () => 'CREATE OR REPLACE PACKAGE BODY order_mgr AS\n...END order_mgr;\n',
        lineAt: (l) => ({ text: `line-${l + 1} content`, rangeIncludingLineBreak: {} })
    };
}
const decorationCalls = [];
function makeEditor(doc) {
    return {
        document: doc,
        setDecorations(type, options) { decorationCalls.push({ type, options }); }
    };
}

function chainListener(key, cb) {
    const prev = listeners[key];
    listeners[key] = (e) => { if (prev) prev(e); cb(e); };
}

let inputBoxCalls = 0;

const vscodeMock = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class { constructor(l, c) { this.label = l; this.collapsibleState = c; } },
    EventEmitter: class {
        constructor() { this.l = []; this.event = (cb) => { this.l.push(cb); return { dispose() {} }; }; }
        fire(d) { this.l.forEach(x => x(d)); } dispose() { this.l = []; }
    },
    workspace: {
        getConfiguration: () => ({ get: (k, d) => d, update: async () => {} }),
        get textDocuments() { return activeTextEditor ? [activeTextEditor.document] : []; },
        onDidSaveTextDocument: () => ({ dispose() {} }),
        onDidChangeConfiguration: () => ({ dispose() {} }),
        onDidChangeTextDocument: (cb) => { chainListener('docChange', cb); return { dispose() {} }; },
        onDidRenameFiles: () => ({ dispose() {} }),
        onDidDeleteFiles: () => ({ dispose() {} }),
        onDidOpenTextDocument: () => ({ dispose() {} })
    },
    window: {
        get activeTextEditor() { return activeTextEditor; },
        state: { focused: true },
        onDidChangeActiveTextEditor: (cb) => { chainListener('activeChanged', cb); return { dispose() {} }; },
        onDidChangeTextEditorSelection: (cb) => { chainListener('selection', cb); return { dispose() {} }; },
        onDidChangeVisibleTextEditors: () => ({ dispose() {} }),
        onDidChangeActiveColorTheme: () => ({ dispose() {} }),
        get visibleTextEditors() { return activeTextEditor ? [activeTextEditor] : []; },
        activeColorTheme: { kind: 2 },
        createTextEditorDecorationType: (opts) => { decoTypes.push(opts); return { dispose() {} }; },
        createTreeView: () => ({ badge: undefined, dispose() {} }),
        showInputBox: async () => { inputBoxCalls++; return undefined; },
        showWarningMessage() {},
        showInformationMessage: async () => undefined,
        showQuickPick: async () => undefined
    },
    commands: { registerCommand: () => ({ dispose() {} }) },
    Uri: {
        file: (f) => ({ fsPath: f, toString: () => 'file:///' + f }),
        parse: (s) => ({ toString: () => s, fsPath: s })
    },
    Position: class { constructor(l, c) { this.line = l; this.character = c; } },
    Range: class {
        constructor(a, b, c, d) {
            this.start = c === undefined ? a : { line: a, character: b };
            this.end = c === undefined ? b : { line: c, character: d };
        }
    },
    Selection: class { constructor(a, b) { this.anchor = a; this.active = b; this.start = a; this.end = b; } },
    MarkdownString: class { constructor(s) { this.value = s; } },
    OverviewRulerLane: { Left: 0, Center: 1, Right: 2, Full: 3 },
    ColorThemeKind: { Light: 1, Dark: 2 },
    TextEditorSelectionChangeKind: { Keyboard: 2, Mouse: 1, Command: 3 }
};

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request) {
    if (request === 'vscode') return 'vscode_mock';
    return originalResolve.apply(this, arguments);
};
require.cache['vscode_mock'] = { exports: vscodeMock };

const { BookmarkManager } = require('../../out/bookmarkManager');

/** 整行选中事件（单击行号的原生效果） */
function fullLineEvent(editor, line0) {
    const P = vscodeMock.Position, S = vscodeMock.Selection;
    return {
        textEditor: editor, kind: vscodeMock.TextEditorSelectionChangeKind.Mouse,
        selections: [new S(new P(line0, 0), new P(line0 + 1, 0))]
    };
}
/** 塌陷事件（点击正文等，空选区） */
function collapseEvent(editor, line0) {
    const P = vscodeMock.Position, S = vscodeMock.Selection;
    return {
        textEditor: editor, kind: vscodeMock.TextEditorSelectionChangeKind.Mouse,
        selections: [new S(new P(line0, 0), new P(line0, 0))]
    };
}
/** 键盘选区事件（kind ≠ Mouse） */
function keyboardEvent(editor, line0) {
    const P = vscodeMock.Position, S = vscodeMock.Selection;
    return {
        textEditor: editor, kind: vscodeMock.TextEditorSelectionChangeKind.Keyboard,
        selections: [new S(new P(line0, 0), new P(line0 + 1, 0))]
    };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
    let passed = 0, failed = 0;
    const failures = [];
    function assert(cond, msg) { if (cond) passed++; else { failed++; failures.push(msg); console.error('  ✗ FAIL: ' + msg); } }

    const context = {
        subscriptions: [],
        workspaceState: { store: new Map(), get(k) { return this.store.get(k); }, async update(k, v) { this.store.set(k, v); } }
    };
    const doc = makeDoc();
    const editor = makeEditor(doc);
    activeTextEditor = editor;
    const manager = new BookmarkManager(context, () => null, () => true);
    const uri = doc.uri;
    const key = uri.toString();

    console.log('=== 书签行号交互回归（单击切换契约）===\n');

    // ---- Case 1: 单击未选中的行号 → 建签（不弹表单）----
    inputBoxCalls = 0;
    listeners.selection(fullLineEvent(editor, 7));       // 单击行 8
    await sleep(80);
    let state = manager.getStateSnapshot();
    assert(state[key] && state[key].length === 1 && state[key][0].line === 7,
        `单击行号应建签（实际 ${JSON.stringify(state[key])}）`);
    assert(inputBoxCalls === 0, `建签不弹表单（showInputBox 调用 ${inputBoxCalls} 次）`);

    // ---- Case 2: 平台行为——同选区第二次点击零事件 → 不切换（模拟真机：
    //      VS Code 对同选区不派发事件，这里验证"即便收到同值事件也不误切"的
    //      保守面：收到塌陷/其他形态一律无操作）----
    listeners.selection(collapseEvent(editor, 7));       // 同行塌陷
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(state[key] && state[key].length === 1,
        `塌陷/同区二次操作不误删书签（实际 ${JSON.stringify(state[key])}）`);

    // ---- Case 3: 先点别行再点回 → 删除（可靠删除路径）----
    listeners.selection(fullLineEvent(editor, 12));      // 点行 13（建第二个签）
    await sleep(60);
    listeners.selection(fullLineEvent(editor, 7));       // 选区已变 → 事件必发 → 切换=删除
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(state[key] && state[key].length === 1 && state[key][0].line === 12,
        `再点别行后点回原行应删签（实际 ${JSON.stringify(state[key])}）`);

    // ---- Case 4: 键盘选区（kind=Keyboard）不触发切换 ----
    await sleep(60);
    listeners.selection(keyboardEvent(editor, 3));       // 键盘整行选
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(state[key] && state[key].length === 1 && state[key][0].line === 12,
        `键盘选区变化不触发切换（实际 ${JSON.stringify(state[key])}）`);

    // ---- Case 5: 重复单击同一行（选区未变时平台零事件；若宿主仍派发同值
    //      Mouse 整行事件，切换语义保持幂等——建删交替与单击心智一致）----
    listeners.selection(fullLineEvent(editor, 12));      // 事件再现（宽容宿主）→ 切换=删除
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(!state[key] || state[key].length === 0,
        `单击已有书签行=删签（实际 ${JSON.stringify(state[key])}）`);

    // ---- Case 6: 装饰区间契约——一次点击双图标缺陷（实机用户报告）----
    // 区间吞换行符（rangeIncludingLineBreak）时终点触下一行行首，VS Code 会把
    // gutter 图标渗染到下一行；契约：行起点零宽区间 + 装饰类型 isWholeLine
    decorationCalls.length = 0;
    listeners.selection(fullLineEvent(editor, 7));       // 建签
    await sleep(80);
    const deco = decorationCalls.find(c => c.options && c.options.length > 0);
    assert(!!deco, '建签后应设置装饰');
    if (deco) {
        assert(deco.options.length === 1, `单书签应只有一个装饰区间（实际 ${deco.options.length}）`);
        const r = deco.options[0].range;
        assert(r.start.line === 7 && r.start.character === 0 &&
               r.end.line === 7 && r.end.character === 0,
            `装饰区间必须是行起点零宽区间、不触及下一行（实际 ` +
            `${r.start.line}:${r.start.character}-${r.end.line}:${r.end.character}）`);
    }
    assert(decoTypes.length > 0 && decoTypes.every(t => t.isWholeLine === true),
        `装饰类型应开启 isWholeLine（整行背景由类型负责）（实际 ${JSON.stringify(decoTypes.map(t => t.isWholeLine))}）`);

    // ---- Case 7: 幽灵切换防护——窗口失焦期间的重放整行事件不建签 ----
    // 实机两次捕获：窗口 WM_CLOSE 关闭瞬间、前台切换空档，VS Code 重放整行选区
    // （kind=Mouse）凭空建签；真实行号点击必在聚焦窗口 → 失焦一律忽略
    listeners.selection(fullLineEvent(editor, 9));       // 先清理：行 10 建签
    await sleep(80);
    vscodeMock.window.state.focused = false;
    listeners.selection(fullLineEvent(editor, 15));      // 失焦重放 → 应被忽略
    await sleep(80);
    vscodeMock.window.state.focused = true;
    listeners.selection(fullLineEvent(editor, 9));       // 聚焦恢复正常切换（行 10 删签）
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(state[key] && state[key].length === 1 && state[key][0].line === 7,
        `失焦重放整行事件不建签（实际 ${JSON.stringify(state[key])}）`);

    console.log(`\n结果: ${passed}/${passed + failed} 通过`);
    process.exitCode = failed === 0 ? 0 : 1;
    if (failed > 0) {
        console.error('失败项:', failures);
    }
    manager.dispose();
}

main();

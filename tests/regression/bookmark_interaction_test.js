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
 * 事件形态，锁定交互契约。末行签名形态 [L,0)→[L,len) 来自 2026-10-16
 * SendInput+trace 实测（sel=2:0-2:3），仅做删除（#46）。全清命令
 * （书签视图标题栏按钮）不依赖活动编辑器/文件存在性（#48）。
 */
const Module = require('module');

const listeners = {};
let activeTextEditor = undefined;
const decoTypes = [];
/** 命令处理器捕获（#48 全清契约要驱动命令层而非仅方法层） */
const commandHandlers = {};
/** showWarningMessage 模态确认的可编程应答（undefined = Esc 取消） */
let warnChoice = undefined;

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
        showWarningMessage: async () => warnChoice,
        showInformationMessage: async () => undefined,
        showQuickPick: async () => undefined
    },
    commands: {
        registerCommand: (id, handler) => {
            commandHandlers[id] = handler;
            return { dispose() {} };
        }
    },
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
    Selection: class {
        constructor(a, b) {
            this.anchor = a; this.active = b; this.start = a; this.end = b;
            // 真实 vscode.Selection 有 isEmpty（锚点与活动点重合）；#50 的塌陷/拖选
            // 起点判定依赖它，mock 早先缺失导致零宽选区被当成非空区间分类
            this.isEmpty = a.line === b.line && a.character === b.character;
        }
    },
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
/**
 * 任意 Mouse 选区事件（Issue #50：按 2026-11-15 SendInput 实测的真实形态构造）
 * @param {{line:number,char:number}[]} pair 起点/终点（0-based 行、列）
 */
function mouseEvent(editor, startLine, startChar, endLine, endChar) {
    const P = vscodeMock.Position, S = vscodeMock.Selection;
    return {
        textEditor: editor, kind: vscodeMock.TextEditorSelectionChangeKind.Mouse,
        selections: [new S(new P(startLine, startChar), new P(endLine, endChar))]
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
    // 越过鼠标突发窗口（Case 2 的塌陷属正文手势，窗口内的整行事件按 #50 契约忽略）
    await sleep(600);
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

    // ---- Case 8-11: 末行整行签名（#46）——末行无换行符，行号单击选区止于
    //      行尾 [L,0)→[L,len)（2026-10-16 SendInput+trace 实测），仅做删除 ----
    // mock 文档 22 行，末行 = 行 21，lineAt(21).text = 'line-22 content'（15 列）
    function lastLineEvent(editor0, line0, lineLen) {
        const P = vscodeMock.Position, S = vscodeMock.Selection;
        return {
            textEditor: editor0, kind: vscodeMock.TextEditorSelectionChangeKind.Mouse,
            selections: [new S(new P(line0, 0), new P(line0, lineLen))]
        };
    }

    // Case 8: 末行整行选 + 已有书签 → 删除（末行书签此前无法单击删除，#46 主诉）
    manager.toggle(editor, 21);                          // 行 21 建签（setup）
    await sleep(80);
    listeners.selection(lastLineEvent(editor, 21, 15));
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(!state[key] || state[key].every(b => b.line !== 21),
        `末行整行选应删除末行书签（实际 ${JSON.stringify(state[key])}）`);

    // Case 9: 末行整行选 + 无书签 → 不建签（防双击末行整词/三击选行误建）
    listeners.selection(lastLineEvent(editor, 21, 15));
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(!state[key] || state[key].every(b => b.line !== 21),
        `末行整行选在无签时不得建签（实际 ${JSON.stringify(state[key])}）`);

    // Case 10: 非末行的 [L,0)→[L,len) 形态 → 不触发（中间行行号点击必产生
    // 整行签名；此形态 = 拖选整行文本/双击整词，不得误删）
    manager.clearFile(uri);                              // setup：重置为恰一个行 7 书签
    manager.toggle(editor, 7);
    await sleep(80);
    listeners.selection(lastLineEvent(editor, 7, 14));   // 'line-8 content' 14 列
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(state[key] && state[key].length === 1 && state[key][0].line === 7,
        `非末行整行文本选区不得误删书签（实际 ${JSON.stringify(state[key])}）`);

    // Case 11: 失焦期间的末行整行事件 → 忽略（幽灵删除防护，同 Case 7 机理）
    vscodeMock.window.state.focused = false;
    listeners.selection(lastLineEvent(editor, 21, 15));
    await sleep(80);
    vscodeMock.window.state.focused = true;
    state = manager.getStateSnapshot();
    assert(state[key] && state[key].length === 1 && state[key][0].line === 7,
        `失焦末行整行事件不改变书签（实际 ${JSON.stringify(state[key])}）`);

    // ---- Case 14-22: Issue #50 正文手势误触契约 ----
    // 根因：切换条件只看"选区形状"，而 [L,0)→[L+1,0) 并非行号点击独占——三击正文、
    // 拖选整行、双击词后拖拽都会产生同一形状。2026-11-15 SendInput 实测的 33 个
    // 手势事件序列见 docs/design/bookmarks/repro-doubleclick/trace-before-fix.txt。
    // 契约：整行事件必须是本轮鼠标手势的第一个事件（前面不得有 500ms 内的
    // 非行号 Mouse 选区事件），且形状必须是精确的 [L,0)→[L+1,0)。
    manager.clearFile(uri);
    await sleep(600);

    // Case 14: 三击正文（塌陷 → 词选区 → 整行）→ 不得建签
    // 实测 P9：[9:13 空] → [9:4-9:13] → [9:0-10:0]
    listeners.selection(mouseEvent(editor, 9, 13, 9, 13));
    await sleep(30);
    listeners.selection(mouseEvent(editor, 9, 4, 9, 13));
    await sleep(30);
    listeners.selection(fullLineEvent(editor, 9));
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(!state[key] || state[key].length === 0,
        `三击正文不得建签（实际 ${JSON.stringify(state[key])}）`);

    // Case 15: 拖选止于下一行行首（起点不在列 0）→ 不得建签
    // 实测 P10：[11:7-11:7] → … → [11:7-12:0]（形状含 a.char≠0）
    listeners.selection(mouseEvent(editor, 11, 7, 11, 7));
    await sleep(30);
    listeners.selection(mouseEvent(editor, 11, 6, 11, 7));
    await sleep(30);
    listeners.selection(mouseEvent(editor, 11, 7, 12, 0));
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(!state[key] || state[key].length === 0,
        `拖选止于下一行行首不得建签（实际 ${JSON.stringify(state[key])}）`);

    // Case 16: 从行首拖到下一行行首（选中整行的常规手势）→ 不得建签
    // 实测 D5：[4:0 空] → [4:0-5:0]（形状与行号点击完全相同，只能靠突发判定）
    await sleep(600);
    listeners.selection(mouseEvent(editor, 4, 0, 4, 0));
    await sleep(30);
    listeners.selection(fullLineEvent(editor, 4));
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(!state[key] || state[key].length === 0,
        `正文拖选整行不得建签（实际 ${JSON.stringify(state[key])}）`);

    // Case 17: 双击词后拖拽到下一行行首 → 既不得建签也不得删已有签
    // 实测 D1：[10:9 空] → [10:8-10:9] → [10:0-11:0]（现版本建签后又删签）
    manager.clearFile(uri);
    manager.toggle(editor, 10);                             // 行 10 先有签
    await sleep(600);                                       // 越过突发窗口，建立干净基线
    listeners.selection(mouseEvent(editor, 10, 9, 10, 9));
    await sleep(30);
    listeners.selection(mouseEvent(editor, 10, 8, 10, 9));
    await sleep(30);
    listeners.selection(fullLineEvent(editor, 10));
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(state[key] && state[key].length === 1 && state[key][0].line === 10,
        `双击词后拖拽不得删掉既有书签（实际 ${JSON.stringify(state[key])}）`);

    // Case 18: 双击词后 Shift+点击下一行行首 → 不得建签
    // 实测 D2：[12:8-12:12] 词 → [12:8-13:0]（簇内间隔 460ms，靠"列 0"形状层兜住）
    manager.clearFile(uri);
    listeners.selection(mouseEvent(editor, 12, 8, 12, 12));
    await sleep(500);
    listeners.selection(mouseEvent(editor, 12, 8, 13, 0));
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(!state[key] || state[key].length === 0,
        `Shift+点击扩选到下一行行首不得建签（实际 ${JSON.stringify(state[key])}）`);

    // Case 19: 行号建签后，紧接着三击另一行正文 → 原签保留、新签不建
    manager.clearFile(uri);
    await sleep(600);
    listeners.selection(fullLineEvent(editor, 3));          // 点行 4 行号建签
    await sleep(80);
    listeners.selection(mouseEvent(editor, 9, 13, 9, 13));  // 三击行 10 正文
    await sleep(30);
    listeners.selection(mouseEvent(editor, 9, 4, 9, 13));
    await sleep(30);
    listeners.selection(fullLineEvent(editor, 9));
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(state[key] && state[key].length === 1 && state[key][0].line === 3,
        `行号建签后正文三击不得增删书签（实际 ${JSON.stringify(state[key])}）`);

    // Case 20: 连续点击多个行号（间隔小于突发窗口）→ 逐个建签，不被突发判定误杀
    manager.clearFile(uri);
    await sleep(600);
    listeners.selection(fullLineEvent(editor, 12));
    await sleep(60);
    listeners.selection(fullLineEvent(editor, 13));
    await sleep(60);
    listeners.selection(fullLineEvent(editor, 14));
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(state[key] && state[key].length === 3 &&
           state[key].map(b => b.line).join(',') === '12,13,14',
        `连续点三个行号应建三个签（实际 ${JSON.stringify(state[key])}）`);

    // Case 21: 末行三击正文 → 不得误删末行书签（#46 语义保留）
    // 实测 V13b 真实序列：塌陷 → 词选区 [L,0)-[L,3) → 整行 [L,0)-[L,len)
    manager.clearFile(uri);
    manager.toggle(editor, 21);                             // 末行建签
    await sleep(600);
    listeners.selection(mouseEvent(editor, 21, 5, 21, 5));   // 三击第一击：光标落位
    await sleep(30);
    listeners.selection(mouseEvent(editor, 21, 0, 21, 3));   // 第二击：选中词 END
    await sleep(30);
    listeners.selection(lastLineEvent(editor, 21, 15));      // 第三击：整行
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(state[key] && state[key].length === 1 && state[key][0].line === 21,
        `末行三击正文不得误删末行书签（实际 ${JSON.stringify(state[key])}）`);

    // Case 22: 末行行号单击（无簇内前导事件）→ 仍可删签（#46 主路径不回归）
    await sleep(600);
    listeners.selection(lastLineEvent(editor, 21, 15));     // 末行行号单击 → 删签
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(state[key] && state[key].every(b => b.line !== 21),
        `末行行号单击仍应删除末行书签（实际 ${JSON.stringify(state[key])}）`);

    // Case 23: 点正文中部（塌陷列 >0，仅光标落位）后立刻点行号 → 仍应建签
    // （突发判定不得把"点一下代码再点行号"这种正常连击误杀）
    manager.clearFile(uri);
    await sleep(600);
    listeners.selection(mouseEvent(editor, 8, 12, 8, 12));   // 行 9 中部单击
    await sleep(120);                                        // 远在突发窗口内
    listeners.selection(fullLineEvent(editor, 8));           // 紧接着点行 9 行号
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(state[key] && state[key].length === 1 && state[key][0].line === 8,
        `正文单击后紧接行号点击仍应建签（实际 ${JSON.stringify(state[key])}）`);

    // Case 24: 点正文行首（塌陷列 =0，= 拖选起点特征）后立刻点同一行行号 → 不建签
    // 与 Case 16 同形：列 0 塌陷是"从行首起拖"的实测特征，必须计为正文手势
    manager.clearFile(uri);
    await sleep(600);
    listeners.selection(mouseEvent(editor, 8, 0, 8, 0));     // 行 9 行首单击
    await sleep(120);
    listeners.selection(fullLineEvent(editor, 8));
    await sleep(80);
    state = manager.getStateSnapshot();
    assert(!state[key] || state[key].length === 0,
        `行首塌陷后 500ms 内的整行事件仍按拖选起点抑制（实际 ${JSON.stringify(state[key])}）`);

    // ---- Case 12-13: 全清命令（#48）——书签视图标题栏按钮不依赖活动编辑器 ----
    // 场景：书签属于"已删除文件"（deleted_file.pkb——状态层存在、磁盘无此文件，
    // 永远无法打开）+ 无任何活动编辑器 → clearAll 命令仍可全清
    const doc2 = {
        fileName: 'deleted_file.pkb', version: 1, languageId: 'plsql',
        uri: { toString: () => 'file:///deleted_file.pkb', fsPath: 'deleted_file.pkb' },
        lineCount: 5,
        lineAt: () => ({ text: 'gone', rangeIncludingLineBreak: {} })
    };
    const editor2 = { document: doc2, setDecorations() {} };
    manager.toggle(editor, 5);                              // setup：主文件也留有书签
    manager.toggle(editor2, 3);
    await sleep(80);
    let snap = manager.getStateSnapshot();
    assert(Object.keys(snap).length === 2,
        `全清前应有两个文件的书签（实际 ${JSON.stringify(Object.keys(snap))}）`);

    activeTextEditor = undefined;                        // 无任何活动编辑器
    warnChoice = '全部清除';
    await commandHandlers['plsqlOutline.bookmark.clearAll']();
    await sleep(80);
    snap = manager.getStateSnapshot();
    assert(Object.keys(snap).length === 0,
        `无活动编辑器时 clearAll 应清空包括已删除文件在内的全部书签（#48，实际 ${JSON.stringify(snap)}）`);

    // Case 13: 模态确认取消 → 书签保留
    manager.toggle(editor2, 2);
    await sleep(80);
    warnChoice = undefined;                              // 模拟 Esc 取消
    await commandHandlers['plsqlOutline.bookmark.clearAll']();
    await sleep(80);
    snap = manager.getStateSnapshot();
    assert(Object.keys(snap).length === 1,
        `确认弹窗取消时不得清除（实际 ${JSON.stringify(snap)}）`);

    console.log(`\n结果: ${passed}/${passed + failed} 通过`);
    process.exitCode = failed === 0 ? 0 : 1;
    if (failed > 0) {
        console.error('失败项:', failures);
    }
    manager.dispose();
}

main();

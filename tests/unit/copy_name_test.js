/**
 * GMLTest: 大纲右键复制名称测试（Issue #36；v1.17.0 起走单 Webview 消息路径）
 *
 * 背景：大纲为单 Webview 视图（outlineWebview.ts），右键「复制名称」由
 * webview 发送 {type:'copy', id} 消息 → copyNameById → 剪贴板。
 *
 * 锁定契约：
 *  - 子程序/包节点 → 模型节点带 copyName=node.name；复制干净 node.name
 *    （不带类型后缀、不带行号描述）
 *  - 声明项（变量/游标等）→ copyName=entry.name（不带 ": TYPE = 值" 描述）
 *  - 控制结构（IF/LOOP 等关键字占位名）、文件夹、结构块 → copyName 为空，
 *    复制时提示不可复制，不写剪贴板
 */
const Module = require('module');
let copiedText = null;
let infoMessages = [];
let warnMessages = [];
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class TreeItem { constructor(label, collapsibleState) { this.label = label; this.collapsibleState = collapsibleState; } },
    ThemeIcon: class ThemeIcon { constructor(id) { this.id = id; } },
    EventEmitter: class EventEmitter { constructor() { this.listeners = []; } event(l) { this.listeners.push(l); return { dispose() {} }; } fire(d) { this.listeners.forEach(l => l(d)); } dispose() { this.listeners = []; } },
    MarkdownString: class MarkdownString { constructor(s) { this.value = s || ''; } },
    env: { clipboard: { writeText: async (t) => { copiedText = t; } } },
    workspace: { getConfiguration: () => ({ get: (k, def) => def }) },
    window: {
        createOutputChannel: () => ({ appendLine() {}, dispose() {} }),
        registerWebviewViewProvider: (id, provider) => {
            mockVscode.__webviewProvider = provider;
            return { dispose() {} };
        },
        showInformationMessage: (m) => { infoMessages.push(m); },
        showWarningMessage: (m) => { warnMessages.push(m); },
        showErrorMessage() {},
        showQuickPick: async () => undefined
    },
    commands: { registerCommand: () => ({ dispose() {} }) },
    RelativePattern: class RelativePattern { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f }) }
};

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request) { if (request === 'vscode') return 'vscode_mock'; return originalResolve.apply(this, arguments); };
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../../out/parser');
// run_all 单进程共享 vscode_mock 缓存：删除编译产物缓存后以本套件 mock 重新加载
delete require.cache[require.resolve('../../out/treeView')];
delete require.cache[require.resolve('../../out/outlineWebview')];
const { MemoryDataProvider } = require('../../out/treeView');
const { OutlineWebviewManager } = require('../../out/outlineWebview');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

/** 构造 mock webview 视图：捕获 postMessage 与消息处理器 */
function makeMockView() {
    const view = {
        visible: true,
        webview: {
            cspSource: 'vscode-webview-test:',
            options: undefined,
            html: '',
            posted: [],
            postMessage: async (msg) => { view.webview.posted.push(msg); return true; },
            onDidReceiveMessage: (cb) => { view.__messageHandler = cb; return { dispose() {} }; }
        },
        onDidDispose: () => ({ dispose() {} })
    };
    return view;
}

/** 深度遍历模型节点 */
function* walkNodes(nodes) {
    for (const n of nodes || []) {
        yield n;
        yield* walkNodes(n.children);
    }
}

const CODE = [
    'CREATE OR REPLACE PROCEDURE p_copy IS',        // 1
    '  CURSOR c_demo IS SELECT * FROM dual;',        // 2
    '  v_num NUMBER;',                               // 3
    'BEGIN',                                         // 4
    '  IF v_num > 0 THEN',                           // 5
    '    NULL;',                                     // 6
    '  END IF;',                                     // 7
    'END p_copy;'                                    // 8
].join('\n');

async function run() {
    const rec = makeRecorder();
    const result = await new PLSQLParser().parse(CODE, 'copy_name_test.sql');
    const proc = result.nodes.find(n => n.name === 'p_copy');
    rec.assert('proc_parsed', '解析出 p_copy', !!proc, !!proc);
    if (!proc) { return { suiteName: '复制名称', cases: rec.cases }; }

    const manager = new OutlineWebviewManager({ subscriptions: { push() {} } });
    manager.updateDataProvider(new MemoryDataProvider(result));
    const view = makeMockView();
    mockVscode.__webviewProvider.resolveWebviewView(view, {}, { isCancellationRequested: false });
    view.__messageHandler({ type: 'ready' });
    await new Promise(r => setTimeout(r, 100));

    const models = view.webview.posted.filter(m => m.type === 'model');
    rec.assert('model_posted', 'ready 后发布树模型', models.length >= 1, models.length);
    if (models.length === 0) { return { suiteName: '复制名称', cases: rec.cases }; }
    const all = [...walkNodes(models[models.length - 1].nodes)];

    // ---- 子程序节点：模型带干净 copyName，复制 node.name ----
    const procNode = all.find(n => n.copyName === 'p_copy');
    rec.assert('model_proc_copy_name', '模型中子程序节点带 copyName=p_copy', !!procNode,
        all.map(n => n.copyName).filter(Boolean).join(','));
    copiedText = null; infoMessages = []; warnMessages = [];
    if (procNode) {
        await view.__messageHandler({ type: 'copy', id: procNode.id });
        rec.assert('copy_node_name', '子程序节点复制 node.name',
            copiedText === 'p_copy', copiedText);
    }

    // ---- 声明项：copyName=entry.name（不带类型/初值描述）----
    const entryNode = all.find(n => n.copyName === 'c_demo');
    rec.assert('model_entry_copy_name', '模型中游标声明项带 copyName=c_demo', !!entryNode,
        all.map(n => n.copyName).filter(Boolean).join(','));
    copiedText = null;
    if (entryNode) {
        await view.__messageHandler({ type: 'copy', id: entryNode.id });
        rec.assert('copy_entry_name', '声明项复制 entry.name（不带 ": TYPE" 描述）',
            copiedText === 'c_demo', copiedText);
    }

    // ---- 文件夹（Body）：copyName 为空 → 提示不可复制 ----
    const bodyNode = all.find(n => typeof n.label === 'string' && /BODY/i.test(n.label) && n.collapsible !== 0);
    copiedText = null; warnMessages = [];
    if (bodyNode) {
        rec.assert('model_folder_no_name', '文件夹节点不带 copyName', bodyNode.copyName === undefined, String(bodyNode.copyName));
        await view.__messageHandler({ type: 'copy', id: bodyNode.id });
        rec.assert('folder_no_copy', '文件夹不写剪贴板并提示', copiedText === null && warnMessages.length > 0,
            `${copiedText} / ${warnMessages.join(';')}`);
    } else {
        rec.assert('model_folder_no_name', '文件夹节点不带 copyName（Body 缺失，跳过）', true, 'skipped');
    }

    // ---- 控制结构（IF 占位名）：copyName 为空 → 提示 ----
    const ifNode = all.find(n => n.label === 'IF');
    if (ifNode) {
        rec.assert('model_control_no_name', '控制结构节点不带 copyName', ifNode.copyName === undefined, String(ifNode.copyName));
        copiedText = null; warnMessages = [];
        await view.__messageHandler({ type: 'copy', id: ifNode.id });
        rec.assert('control_no_copy', '控制结构（占位名）不写剪贴板并提示', copiedText === null && warnMessages.length > 0,
            `${copiedText} / ${warnMessages.join(';')}`);
    } else {
        rec.assert('model_control_no_name', '控制结构节点不带 copyName（IF 缺失，跳过）', true, 'skipped');
    }

    rec.assert('copy_feedback', '复制成功给出反馈提示', infoMessages.some(m => String(m).includes('p_copy')), infoMessages.join(';'));

    manager.dispose();
    return { suiteName: '复制名称', cases: rec.cases };
}

module.exports = { run };

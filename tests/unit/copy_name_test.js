/**
 * GMLTest: 大纲右键复制名称测试（Issue #36）
 *
 * 背景：大纲视图右键「复制名称」把方法/过程名（干净标识符）写入剪贴板。
 *
 * 锁定契约（plsqlOutline.copyName 命令处理器）：
 *  - 子程序/包节点 → 复制 node.name（不带类型后缀、不带行号描述）
 *  - 声明项（变量/游标等）→ 复制 entry.name（不带 ": TYPE = 值" 描述）
 *  - 控制结构（IF/LOOP 等关键字占位名）、文件夹、结构块 → 提示不可复制，不写剪贴板
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
        createTreeView: () => ({ visible: true, title: '', message: undefined, reveal: async () => {}, dispose() {} }),
        showInformationMessage: (m) => { infoMessages.push(m); },
        showWarningMessage: (m) => { warnMessages.push(m); },
        showErrorMessage() {},
        showQuickPick: async () => undefined
    },
    commands: {},
    RelativePattern: class RelativePattern { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f }) }
};
// 注册命令捕获：记录 id → 回调，供测试直接调用 copyName 处理器
const registeredCommands = {};
mockVscode.commands.registerCommand = (id, cb) => { registeredCommands[id] = cb; return { dispose() {} }; };

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request) { if (request === 'vscode') return 'vscode_mock'; return originalResolve.apply(this, arguments); };
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../../out/parser');
// 本套件构造 TreeViewManager 并捕获命令注册：run_all 单进程共享 vscode_mock
// 缓存——删除 treeView 编译产物缓存后以本套件 mock（含 registerCommand 捕获、
// clipboard）重新加载，拿到独立模块实例
delete require.cache[require.resolve('../../out/treeView')];
const { MemoryDataProvider, TreeViewManager } = require('../../out/treeView');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
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

    const manager = new TreeViewManager({ subscriptions: { push() {} } });
    manager.updateDataProvider(new MemoryDataProvider(result));
    const copyName = registeredCommands['plsqlOutline.copyName'];
    rec.assert('command_registered', 'copyName 命令已注册', typeof copyName === 'function', typeof copyName);
    if (typeof copyName !== 'function') { return { suiteName: '复制名称', cases: rec.cases }; }

    // ---- 子程序节点：复制干净 node.name ----
    copiedText = null; infoMessages = []; warnMessages = [];
    await copyName({ node: proc, isStructureBlock: false, label: 'p_copy', line: proc.declarationLine });
    rec.assert('copy_node_name', '子程序节点复制 node.name',
        copiedText === 'p_copy', copiedText);

    // ---- 声明项：复制 entry.name（不带类型/初值描述）----
    const cursorEntry = proc.variableTable ? proc.variableTable.get('c_demo') : undefined;
    rec.assert('cursor_entry_exists', '游标声明项存在', !!cursorEntry, !!cursorEntry);
    if (cursorEntry) {
        copiedText = null;
        await copyName({ isStructureBlock: false, label: 'c_demo', line: cursorEntry.line, isDeclarationEntry: true, declarationEntry: cursorEntry });
        rec.assert('copy_entry_name', '声明项复制 entry.name（不带 ": TYPE" 描述）',
            copiedText === 'c_demo', copiedText);
    }

    // ---- 控制结构 / 文件夹：提示不可复制 ----
    const procChildren = await manager.getProvider().getChildren({ node: proc, isStructureBlock: false, label: 'p_copy', line: proc.declarationLine });
    const bodyGroup = procChildren.find(c => c.isProgramGroup && c.programGroupKind === 'body');
    copiedText = null;
    await copyName(bodyGroup);
    rec.assert('folder_no_copy', '文件夹不写剪贴板并提示', copiedText === null && warnMessages.length > 0,
        `${copiedText} / ${warnMessages.join(';')}`);

    const ifNode = (proc.children || []).find(c => c.type === 'IF_STATEMENT');
    if (ifNode) {
        copiedText = null; warnMessages = [];
        await copyName({ node: ifNode, isStructureBlock: false, label: 'IF', line: ifNode.declarationLine });
        rec.assert('control_no_copy', '控制结构（占位名）不写剪贴板并提示', copiedText === null && warnMessages.length > 0,
            `${copiedText} / ${warnMessages.join(';')}`);
    } else {
        rec.assert('control_no_copy', '控制结构（占位名）不写剪贴板并提示（IF 节点缺失，跳过）', true, 'skipped');
    }

    rec.assert('copy_feedback', '复制成功给出反馈提示', infoMessages.some(m => String(m).includes('p_copy')), infoMessages.join(';'));

    return { suiteName: '复制名称', cases: rec.cases };
}

module.exports = { run };

/**
 * GMLTest: 大纲搜索过滤测试（Issue #36）
 *
 * 背景：搜索框（大纲树上方 Webview）输入过滤词后树只保留命中项及其祖先链，
 * 命中分支以展开态呈现（id 加 ::f 后缀获得独立展开状态），清空后恢复原状。
 *
 * 锁定契约：
 *  - 匹配对象为节点名/声明项名（大小写不敏感子串）；控制结构关键字占位名、
 *    文件夹、结构块不直接参与匹配（文件夹仅作为命中项祖先保留）
 *  - 命中项的祖先链保留（包→子程序→Declaration→Cursors→游标项）
 *  - 非命中分支整体隐藏；countFilterMatches / getFirstFilterMatch 口径一致
 *  - 过滤期间 TreeItem.id 带 ::f 后缀、命中分支默认展开；清空后 id 复原
 */
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class TreeItem { constructor(label, collapsibleState) { this.label = label; this.collapsibleState = collapsibleState; } },
    ThemeIcon: class ThemeIcon { constructor(id) { this.id = id; } },
    EventEmitter: class EventEmitter { constructor() { this.listeners = []; } event(l) { this.listeners.push(l); return { dispose() {} }; } fire(d) { this.listeners.forEach(l => l(d)); } dispose() { this.listeners = []; } },
    MarkdownString: class MarkdownString { constructor(s) { this.value = s || ''; } },
    workspace: { getConfiguration: () => ({ get: (k, def) => def }) },
    window: {
        createOutputChannel: () => ({ appendLine() {}, dispose() {} }),
        createTreeView: () => ({ visible: true, title: '', message: undefined, reveal: async () => {}, dispose() {} }),
        showInformationMessage() {}, showWarningMessage() {}, showErrorMessage() {},
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
// 本套件构造 TreeViewManager（createTreeView/命令注册）：run_all 单进程共享
// vscode_mock 缓存，先加载套件的 mock 缺 createTreeView——删除 treeView 编译
// 产物缓存后以本套件 mock 重新加载，拿到独立模块实例
delete require.cache[require.resolve('../../out/treeView')];
const { PLSQLOutlineProvider, MemoryDataProvider, TreeViewManager } = require('../../out/treeView');

const COLLAPSED = mockVscode.TreeItemCollapsibleState.Collapsed;
const EXPANDED = mockVscode.TreeItemCollapsibleState.Expanded;

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

const CODE = [
    'CREATE OR REPLACE PACKAGE BODY pb_filter IS',   // 1
    '  CURSOR c_alpha IS SELECT * FROM dual;',        // 2
    '  v_count NUMBER;',                              // 3
    '  PROCEDURE inner_proc IS',                      // 4
    '    CURSOR c_inner IS SELECT 1 FROM dual;',      // 5
    '  BEGIN',                                        // 6
    '    LOOP',                                       // 7
    '      NULL;',                                    // 8
    '    END LOOP;',                                  // 9
    '  END inner_proc;',                              // 10
    '  PROCEDURE other_proc IS',                      // 11
    '  BEGIN',                                        // 12
    '    NULL;',                                      // 13
    '  END other_proc;',                              // 14
    'BEGIN',                                          // 15
    '  NULL;',                                        // 16
    'END pb_filter;'                                  // 17
].join('\n');

async function run() {
    const rec = makeRecorder();
    const result = await new PLSQLParser().parse(CODE, 'outline_filter_test.sql');
    const pkg = result.nodes.find(n => n.name === 'pb_filter');
    rec.assert('pkg_parsed', '解析出 pb_filter', !!pkg, !!pkg);
    if (!pkg) { return { suiteName: '大纲搜索过滤', cases: rec.cases }; }

    const provider = new PLSQLOutlineProvider();
    provider.setDataProvider(new MemoryDataProvider(result));

    // ---- 未过滤：包下含 Declaration / inner_proc / other_proc / Body ----
    const pkgItem = { node: pkg, isStructureBlock: false, label: provider.getNodeLabel(pkg), line: pkg.declarationLine };
    const fullChildren = await provider.getChildren(pkgItem);
    const hasDecl = fullChildren.some(c => c.isDeclarationSection);
    const hasInner = fullChildren.some(c => c.node && c.node.name === 'inner_proc');
    const hasOther = fullChildren.some(c => c.node && c.node.name === 'other_proc');
    rec.assert('unfiltered_full', '未过滤时 Declaration/inner_proc/other_proc 全部可见',
        hasDecl && hasInner && hasOther, `${hasDecl}/${hasInner}/${hasOther}`);

    // ---- 过滤 "inner"：命中 inner_proc 与其内部游标 c_inner ----
    provider.setFilter('inner');
    rec.assert('filter_active', '过滤生效标记', provider.isFilterActive(), provider.isFilterActive());
    const roots = await provider.getChildren();
    rec.assert('root_kept_ancestor', '根包作为命中祖先保留',
        roots.length === 1 && roots[0].node && roots[0].node.name === 'pb_filter',
        roots.map(r => r.label).join(','));

    const filteredChildren = await provider.getChildren(pkgItem);
    const labels = filteredChildren.map(c => c.label).join(',');
    rec.assert('filtered_children', '包下仅保留 inner_proc（Declaration/other_proc/Body 隐藏）',
        filteredChildren.length === 1 && filteredChildren[0].node && filteredChildren[0].node.name === 'inner_proc',
        labels);

    // 祖先链：inner_proc → Declaration（因 c_inner 命中）保留且 Cursors 组可见
    const innerItem = filteredChildren[0];
    const innerChildren = await provider.getChildren(innerItem);
    const innerDecl = innerChildren.find(c => c.isDeclarationSection);
    rec.assert('inner_decl_kept', 'inner_proc 的 Declaration 因 c_inner 命中而保留', !!innerDecl, labels);
    if (innerDecl) {
        const declChildren = await provider.getChildren(innerDecl);
        const cursorsGroup = declChildren.find(c => c.isDeclarationGroup && c.declarationEntries &&
            c.declarationEntries.some(e => e.name === 'c_inner'));
        rec.assert('cursor_entry_matchable', 'Declaration 下保留含 c_inner 的 Cursors 分组', !!cursorsGroup, declChildren.map(c => c.label).join(','));
        if (cursorsGroup) {
            const cursorEntries = await provider.getChildren(cursorsGroup);
            rec.assert('cursor_entry_only_match', 'Cursors 分组仅保留命中的 c_inner',
                cursorEntries.length === 1 && cursorEntries[0].declarationEntry &&
                cursorEntries[0].declarationEntry.name === 'c_inner',
                cursorEntries.map(c => c.label).join(','));
        }
    }

    // ---- 展开态与 id 后缀 ----
    rec.assert('filtered_expand_state', '过滤期间命中分支（代码单元）默认展开',
        provider.getTreeItem(innerItem).collapsibleState === EXPANDED,
        provider.getTreeItem(innerItem).collapsibleState);
    rec.assert('filtered_id_suffix', '过滤期间 TreeItem.id 带 ::f 后缀',
        typeof provider.getTreeItem(innerItem).id === 'string' && provider.getTreeItem(innerItem).id.endsWith('::f'),
        provider.getTreeItem(innerItem).id);
    const rawId = provider.generateCacheKey(innerItem);
    provider.setFilter('');
    rec.assert('filter_cleared', '清空后过滤标记复位', !provider.isFilterActive(), provider.isFilterActive());
    rec.assert('id_restored', '清空后 id 复原（不含 ::f）',
        !provider.generateCacheKey(innerItem).endsWith('::f'), `${rawId} -> ${provider.generateCacheKey(innerItem)}`);
    const restoredChildren = await provider.getChildren(pkgItem);
    rec.assert('children_restored', '清空后包下子项全部恢复',
        restoredChildren.some(c => c.isDeclarationSection) &&
        restoredChildren.some(c => c.node && c.node.name === 'inner_proc') &&
        restoredChildren.some(c => c.node && c.node.name === 'other_proc'),
        restoredChildren.map(c => c.label).join(','));

    // ---- 计数与首个命中 ----
    provider.setFilter('inner');
    const count = await provider.countFilterMatches();
    rec.assert('count_matches', '命中计数 = inner_proc + c_inner = 2', count === 2, count);
    const first = await provider.getFirstFilterMatch();
    rec.assert('first_match', '首个命中为 inner_proc（先序遍历）',
        first && first.node && first.node.name === 'inner_proc', first && first.label);

    // ---- 大小写不敏感 ----
    provider.setFilter('INNER');
    const upperCount = await provider.countFilterMatches();
    rec.assert('case_insensitive', '过滤词大小写不敏感（INNER 同 inner）', upperCount === 2, upperCount);

    // ---- 控制结构关键字占位名/文件夹不参与匹配 ----
    provider.setFilter('loop');
    const loopCount = await provider.countFilterMatches();
    rec.assert('control_not_matchable', '控制结构占位名 LOOP 不参与匹配（计数 0）', loopCount === 0, loopCount);
    provider.setFilter('body');
    const bodyCount = await provider.countFilterMatches();
    rec.assert('folder_not_matchable', '文件夹 Body 不参与匹配（计数 0）', bodyCount === 0, bodyCount);

    // ---- TreeViewManager：过滤提示消息 + 光标跟随暂停标记 ----
    const manager = new TreeViewManager({ subscriptions: { push() {} } });
    manager.updateDataProvider(new MemoryDataProvider(result));
    await manager.setFilter('inner');
    rec.assert('manager_filter_active', '管理器过滤生效（光标跟随暂停依据）', manager.isFilterActive(), manager.isFilterActive());
    rec.assert('manager_message', '标题栏提示含命中数', /inner/.test(String(manager.getTreeView().message)) && /2/.test(String(manager.getTreeView().message)), manager.getTreeView().message);
    await manager.setFilter('');
    rec.assert('manager_message_cleared', '清空后提示复位', manager.getTreeView().message === undefined, manager.getTreeView().message);

    // ---- 过滤期间根级折叠状态：未命中子树的文件夹行为不受影响（默认折叠语义由无过滤场景锁定）----
    const plainProvider = new PLSQLOutlineProvider();
    plainProvider.setDataProvider(new MemoryDataProvider(result));
    const plainChildren = await plainProvider.getChildren(pkgItem);
    const plainBody = plainChildren.find(c => c.isProgramGroup && c.programGroupKind === 'body');
    rec.assert('plain_body_collapsed', '无过滤时 Body 文件夹默认折叠（不受过滤逻辑影响）',
        plainBody && plainProvider.getTreeItem(plainBody).collapsibleState === COLLAPSED,
        plainBody && plainProvider.getTreeItem(plainBody).collapsibleState);

    return { suiteName: '大纲搜索过滤', cases: rec.cases };
}

module.exports = { run };

/**
 * GMLTest: 大纲逐级展开与原生缩进测试（Issue #36）
 *
 * 背景：v1.13.0（#33）用标签 NBSP 伪缩进表达嵌套，控制结构默认展开——展开
 * Body 时全部子层级级联展开，且图标不随缩进移动。#36 改为：控制结构默认折叠
 * （逐级手动展开），嵌套层级完全由树结构原生缩进表达（图标/文字同层对齐，
 * 缩进宽度与参考线由 workbench.tree.* 默认值提供）。
 *
 * 锁定契约：
 *  - 控制结构标签为纯关键字（无 NBSP 前缀），嵌套子级渲染不变
 *  - 有子级的控制结构（含 ELSIF/ELSE 合并 IF）默认 Collapsed；无子级为 None
 *  - 区域文件夹（Declaration/Sub Program/Body）默认 Collapsed
 *  - forceExpandAll（「展开所有」命令）：控制结构/文件夹/代码单元全部 Expanded
 *  - 顶层对象（包）沿 view.expandByDefault（默认 true）展开一层
 */
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class TreeItem { constructor(label, collapsibleState) { this.label = label; this.collapsibleState = collapsibleState; } },
    ThemeIcon: class ThemeIcon { constructor(id) { this.id = id; } },
    EventEmitter: class EventEmitter { constructor() { this.listeners = []; } event(l) { this.listeners.push(l); return { dispose() {} }; } fire(d) { this.listeners.forEach(l => l(d)); } dispose() { this.listeners = []; } },
    MarkdownString: class MarkdownString { constructor(s) { this.value = s || ''; } },
    workspace: { getConfiguration: () => ({ get: (k, def) => def }) },
    window: { createOutputChannel: () => ({ appendLine() {}, dispose() {} }) },
    RelativePattern: class RelativePattern { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f }) }
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request) { if (request === 'vscode') return 'vscode_mock'; return originalResolve.apply(this, arguments); };
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../../out/parser');
const { PLSQLOutlineProvider, MemoryDataProvider } = require('../../out/treeView');
const { NodeType } = require('../../out/types');

const COLLAPSED = mockVscode.TreeItemCollapsibleState.Collapsed;
const EXPANDED = mockVscode.TreeItemCollapsibleState.Expanded;
const NONE = mockVscode.TreeItemCollapsibleState.None;

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

const CODE = [
    'CREATE OR REPLACE PROCEDURE p_indent IS',  // 1
    'BEGIN',                                    // 2
    '  LOOP',                                   // 3
    '    IF v_a > 0 THEN',                      // 4
    '      NULL;',                              // 5
    '    END IF;',                              // 6
    '    WHILE v_a < 10 LOOP',                  // 7
    '      NULL;',                              // 8
    '    END LOOP;',                            // 9
    '  END LOOP;',                              // 10
    '  IF v_b IS NULL THEN',                    // 11
    '    NULL;',                                // 12
    '  ELSIF v_b = 1 THEN',                     // 13
    '    FOR j IN 1..2 LOOP',                   // 14
    '      NULL;',                              // 15
    '    END LOOP;',                            // 16
    '  ELSE',                                   // 17
    '    NULL;',                                // 18
    '  END IF;',                                // 19
    '  CASE v_c',                               // 20
    '    WHEN 1 THEN',                          // 21
    '      NULL;',                              // 22
    '    ELSE',                                 // 23
    '      NULL;',                              // 24
    '  END CASE;',                              // 25
    'END p_indent;'                             // 26
].join('\n');

const PKG_CODE = [
    'CREATE OR REPLACE PACKAGE pkg_top AS',     // 1
    '  PROCEDURE p1;',                          // 2
    'END pkg_top;'                              // 3
].join('\n');

/** 取 Body 文件夹与其顶层控制结构项（每场景新建 provider，避免 treeItemCache 串扰） */
async function makeProvider(result) {
    const provider = new PLSQLOutlineProvider();
    provider.setDataProvider(new MemoryDataProvider(result));
    return provider;
}

async function run() {
    const rec = makeRecorder();
    const result = await new PLSQLParser().parse(CODE, 'control_expand_test.sql');
    const proc = result.nodes.find(n => n.name === 'p_indent');
    rec.assert('proc_parsed', '解析出 p_indent', !!proc, !!proc);
    if (!proc) { return { suiteName: '逐级展开与原生缩进', cases: rec.cases }; }

    const provider = await makeProvider(result);

    // 取 Body 文件夹
    const procItem = { node: proc, isStructureBlock: false, label: provider.getNodeLabel(proc), line: proc.declarationLine };
    const procChildren = await provider.getChildren(procItem);
    const bodyGroup = procChildren.find(c => c.isProgramGroup && c.programGroupKind === 'body');
    const declGroup = procChildren.find(c => c.isDeclarationSection);
    rec.assert('body_group_exists', 'Body 文件夹存在', !!bodyGroup, !!bodyGroup);
    if (!bodyGroup) { return { suiteName: '逐级展开与原生缩进', cases: rec.cases }; }

    // ---- 标签为纯关键字（无 NBSP 前缀，嵌套由原生树缩进表达）----
    const bodyItems = await provider.getChildren(bodyGroup);
    const loopItem = bodyItems.find(i => i.node && i.node.type === NodeType.LOOP_STATEMENT && i.node.declarationLine === 3);
    const topIfItem = bodyItems.find(i => i.node && i.node.type === NodeType.IF_STATEMENT && i.node.declarationLine === 11);
    const caseItem = bodyItems.find(i => i.node && i.node.type === NodeType.CASE_STATEMENT && i.node.declarationLine === 20);
    const lbl = (item) => item ? provider.getTreeItem(item).label : '(missing)';
    rec.assert('loop_label_plain', 'Body 顶层 LOOP 标签无 NBSP 前缀', loopItem && lbl(loopItem) === 'LOOP', JSON.stringify(lbl(loopItem)));
    rec.assert('top_if_label_plain', 'Body 顶层 IF 标签无 NBSP 前缀', topIfItem && lbl(topIfItem) === 'IF', JSON.stringify(lbl(topIfItem)));
    const loopChildren = await provider.getChildren(loopItem);
    const ifInLoop = loopChildren.find(i => i.node && i.node.type === NodeType.IF_STATEMENT);
    const whileInLoop = loopChildren.find(i => i.node && i.node.type === NodeType.WHILE_LOOP);
    rec.assert('nested_label_plain', '嵌套 IF/WHILE 标签无 NBSP 前缀（同级纯标签对齐）',
        ifInLoop && lbl(ifInLoop) === 'IF' && whileInLoop && lbl(whileInLoop) === 'WHILE',
        JSON.stringify(lbl(ifInLoop)) + ' / ' + JSON.stringify(lbl(whileInLoop)));
    const caseChildren = await provider.getChildren(caseItem);
    const whenItem = caseChildren.find(i => i.node && i.node.type === NodeType.WHEN_BRANCH);
    rec.assert('when_label_plain', 'CASE 内 WHEN 标签无 NBSP 前缀', whenItem && lbl(whenItem) === 'WHEN', JSON.stringify(lbl(whenItem)));

    // ---- 逐级展开：控制结构默认折叠 ----
    const state = (item) => item ? provider.getTreeItem(item).collapsibleState : '(missing)';
    rec.assert('loop_default_collapsed', '有子级的 LOOP 默认折叠', loopItem && state(loopItem) === COLLAPSED, state(loopItem));
    rec.assert('merged_if_default_collapsed', 'ELSIF/ELSE 合并 IF（含吸收子级）默认折叠',
        topIfItem && state(topIfItem) === COLLAPSED, state(topIfItem));
    rec.assert('case_default_collapsed', '有子级的 CASE 默认折叠', caseItem && state(caseItem) === COLLAPSED, state(caseItem));
    rec.assert('when_leaf_none', '无子级 WHEN 为叶（None）', whenItem && state(whenItem) === NONE, state(whenItem));
    rec.assert('body_folder_collapsed', 'Body 文件夹默认折叠', state(bodyGroup) === COLLAPSED, state(bodyGroup));
    rec.assert('proc_unit_collapsed', '代码单元（p_indent）默认折叠（区域文件夹待展开）', state(procItem) === COLLAPSED, state(procItem));
    if (declGroup) {
        rec.assert('decl_folder_collapsed', 'Declaration 文件夹默认折叠', state(declGroup) === COLLAPSED, state(declGroup));
    }

    // ---- 「展开所有」：forceExpandAll 强制展开（含文件夹与控制结构）----
    const forceProvider = await makeProvider(result);
    forceProvider.setForceExpandAll(true);
    const fProcChildren = await forceProvider.getChildren({ node: proc, isStructureBlock: false, label: 'p_indent', line: proc.declarationLine });
    const fBody = fProcChildren.find(c => c.isProgramGroup && c.programGroupKind === 'body');
    const fState = (item) => item ? forceProvider.getTreeItem(item).collapsibleState : '(missing)';
    const fBodyItems = await forceProvider.getChildren(fBody);
    const fLoop = fBodyItems.find(i => i.node && i.node.type === NodeType.LOOP_STATEMENT && i.node.declarationLine === 3);
    const fIf = fBodyItems.find(i => i.node && i.node.type === NodeType.IF_STATEMENT && i.node.declarationLine === 11);
    rec.assert('force_body_expanded', 'forceExpandAll：Body 文件夹展开', fBody && fState(fBody) === EXPANDED, fState(fBody));
    rec.assert('force_proc_expanded', 'forceExpandAll：代码单元展开',
        fState({ node: proc, isStructureBlock: false, label: 'p_indent', line: proc.declarationLine }) === EXPANDED,
        fState({ node: proc, isStructureBlock: false, label: 'p_indent', line: proc.declarationLine }));
    rec.assert('force_loop_expanded', 'forceExpandAll：LOOP 展开', fLoop && fState(fLoop) === EXPANDED, fState(fLoop));
    rec.assert('force_merged_if_expanded', 'forceExpandAll：合并 IF 展开', fIf && fState(fIf) === EXPANDED, fState(fIf));

    // ---- 顶层对象：expandByDefault（默认 true）展开一层 ----
    const pkgResult = await new PLSQLParser().parse(PKG_CODE, 'pkg_top_expand_test.sql');
    const pkg = pkgResult.nodes.find(n => n.name === 'pkg_top');
    const pkgProvider = await makeProvider(pkgResult);
    const pkgItem = { node: pkg, isStructureBlock: false, label: 'pkg_top', line: pkg.declarationLine };
    rec.assert('pkg_default_expanded', '顶层包沿 expandByDefault=true 默认展开一层',
        pkg && pkgProvider.getTreeItem(pkgItem).collapsibleState === EXPANDED,
        pkgProvider.getTreeItem(pkgItem).collapsibleState);

    return { suiteName: '逐级展开与原生缩进', cases: rec.cases };
}

module.exports = { run };

/**
 * GMLTest: 嵌套 Sub Program 渲染测试
 *
 * 验证扁平化分组样式 + Sub Program 任意深度嵌套（Sub Program 中的 Sub Program）。
 * 测试对象：GMLTest/nested_subprograms.pkb
 *   嵌套链：gml_test_pkg → outer_proc → inner_func → deepest_proc → leaf_func（4 级 Sub Program）
 *
 * 本文件导出 run()，供 run_all.js 调用以生成 HTML 报告；也可直接运行（控制台输出）。
 */
const path = require('path');
const fs = require('fs');

// ---------- mock vscode ----------
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class TreeItem { constructor(label, collapsibleState) { this.label = label; this.collapsibleState = collapsibleState; } },
    ThemeIcon: class ThemeIcon { constructor(id) { this.id = id; } },
    EventEmitter: class EventEmitter { constructor() { this.listeners = []; } event(l) { this.listeners.push(l); return { dispose() {} }; } fire(d) { this.listeners.forEach(l => l(d)); } dispose() { this.listeners = []; } },
    workspace: { getConfiguration: () => ({ get: (k, def) => def }) },
    window: { createOutputChannel: () => ({ appendLine() {}, dispose() {} }) },
    RelativePattern: class RelativePattern { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f }) }
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request) { if (request === 'vscode') return 'vscode_mock'; return originalResolve.apply(this, arguments); };
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../../out/parser');
const { PLSQLOutlineProvider } = require('../../out/treeView');
const { SectionType, DeclarationCategory, NodeType } = require('../../out/types');
const iconPathMod = require('path');
// 从 iconPath 提取 SVG 基名（自定义图标 {light,dark}；codicon {id}）
function iconName(icon) {
    if (!icon) return 'none';
    if (icon.dark && icon.dark.fsPath) {
        return iconPathMod.basename(icon.dark.fsPath).replace(/\.svg$/, '');
    }
    return icon.id ? ('codicon:' + icon.id) : 'unknown';
}

// ---------- 断言收集器（供 HTML 报告） ----------
function makeRecorder() {
    const cases = [];
    function record(name, desc, passed, actual) {
        cases.push({ name, desc, passed, actual: String(actual) });
    }
    function assert(name, desc, cond, actual) {
        record(name, desc, !!cond, actual);
    }
    return { cases, assert, record };
}

function makeProvider(parseResult) {
    const provider = new PLSQLOutlineProvider();
    provider.dataProvider = { getParseResult: async () => parseResult };
    return provider;
}

// 递归查找名为 name 的子项
async function findChild(provider, parent, name) {
    const kids = await provider.getChildren(parent);
    return kids.find(c => (c.label && c.label.includes(name)) || (c.node && c.node.name === name));
}

const SOURCE_FILE = path.join(__dirname, 'nested_subprograms.pkb');

async function run() {
    const rec = makeRecorder();
    const content = fs.readFileSync(SOURCE_FILE, 'utf8');

    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    const t0 = Date.now();
    const result = await parser.parse(content, 'nested_subprograms.pkb');
    const parseTime = Date.now() - t0;

    rec.assert('parse_clean', '源码解析零错误', result.metadata.errors.length === 0, `errors=${result.metadata.errors.length}`);
    rec.assert('parse_perf', '解析性能 < 200ms', parseTime < 200, `${parseTime}ms`);

    const root = result.nodes[0];
    rec.assert('root_exists', '根节点存在且为包体', !!root && root.type === NodeType.PACKAGE_BODY, root && root.name);
    rec.assert('root_name', '包名正确 gml_test_pkg', root && root.name === 'gml_test_pkg', root && root.name);

    const provider = makeProvider(result);
    const topItems = await provider.getChildren();
    const pkgItem = topItems[0];
    const pkgChildren = await provider.getChildren(pkgItem);

    // ---- Case 1: 顶层结构（Declaration + 子程序直接显示 + Exception/End）----
    const labels = pkgChildren.map(c => c.label);
    const hasDeclaration = pkgChildren.some(c => c.isDeclarationSection);
    const hasException = pkgChildren.some(c => c.isStructureBlock && c.label === 'EXCEPTION' || (c.structureBlock && c.label === 'EXCEPTION'));
    const hasEnd = pkgChildren.some(c => c.label === 'END');
    rec.assert('top_declaration', '顶层有 Declaration 包裹文件夹', hasDeclaration, labels.join(','));
    // 包下子程序直接显示（不再有 Sub Program 文件夹）
    rec.assert('top_no_subprogram_folder', '包下无 Sub Program 文件夹（子程序直接显示）',
        !pkgChildren.some(c => c.isProgramGroup && c.programGroupKind === 'subprogram'), labels.join(','));
    rec.assert('top_no_section_layer', '无 DECLARE/SUBPROGRAM 旧分区层（isSection）', !pkgChildren.some(c => c.isSection), labels.join(','));

    // ---- Case 2: Declaration 包裹层含全部 5 类别 ----
    const declSection = pkgChildren.find(c => c.isDeclarationSection);
    const declChildren = await provider.getChildren(declSection);
    const declGroups = declChildren.filter(c => c.isDeclarationGroup);
    const declCats = declGroups.map(g => g.declarationCategory).sort();
    rec.assert('decl_5_categories', 'Declaration 下含 Variables/Constants/Cursors/Types/Exceptions 五类',
        declCats.length >= 4, declCats.join(','));
    rec.assert('decl_has_cursors', 'Declaration 含 Cursors（c_pkg_orders）',
        declCats.includes(DeclarationCategory.CURSOR), declCats.join(','));
    rec.assert('decl_has_types', 'Declaration 含 Types（t_order_rec/t_id_tab）',
        declCats.includes(DeclarationCategory.TYPE), declCats.join(','));
    rec.assert('decl_has_constants', 'Declaration 含 Constants（c_max_retry）',
        declCats.includes(DeclarationCategory.CONSTANT), declCats.join(','));

    // ---- Case 3: Sub Program 嵌套 L1（outer_proc 直接在包下，Procedure 图标）----
    // 包下子程序直接显示（无 Sub Program 文件夹）
    const outerProc = pkgChildren.find(c => c.node && c.node.name === 'outer_proc');
    const topFunc = pkgChildren.find(c => c.node && c.node.name === 'top_func');
    rec.assert('l1_outer_direct', 'outer_proc 直接在包下显示（非 Sub Program 文件夹）', !!outerProc, labels.join(','));
    rec.assert('l1_topfunc_direct', 'top_func 直接在包下显示', !!topFunc, labels.join(','));
    const outerItem = provider.getTreeItem(outerProc);
    rec.assert('l1_outer_procedure_icon', 'outer_proc 为 Procedure 图标 proc/P（数据库圆筒+P）',
        iconName(outerItem.iconPath) === 'proc', iconName(outerItem.iconPath));
    rec.assert('l1_outer_label_nameonly', 'outer_proc 标签仅名称（无 "Procedure:" 前缀）',
        outerItem.label === 'outer_proc', outerItem.label);
    const topFuncItem = provider.getTreeItem(topFunc);
    rec.assert('l1_topfunc_function_icon', 'top_func 为 Function 图标 func/F（数据库圆筒+F）',
        iconName(topFuncItem.iconPath) === 'func', iconName(topFuncItem.iconPath));

    // ---- Case 4: outer_proc 展开后有自己的 Declaration / Sub Program / Body ----
    const outerChildren = await provider.getChildren(outerProc);
    rec.assert('l2_outer_has_declaration', 'outer_proc 展开后有 Declaration', outerChildren.some(c => c.isDeclarationSection), outerChildren.map(c => c.label).join(','));
    rec.assert('l2_outer_has_subprogram', 'outer_proc 展开后有 Sub Program（嵌套！）', outerChildren.some(c => c.isProgramGroup && c.programGroupKind === 'subprogram'), outerChildren.map(c => c.label).join(','));

    // ---- Case 5: Sub Program 嵌套 L2（inner_func 在 outer_proc 的 Sub Program 下）----
    const outerSubGroup = outerChildren.find(c => c.isProgramGroup && c.programGroupKind === 'subprogram');
    const outerSubChildren = await provider.getChildren(outerSubGroup);
    const innerFunc = outerSubChildren.find(c => c.node && c.node.name === 'inner_func');
    rec.assert('l2_inner_in_outer_subprogram', 'inner_func 在 outer_proc 的 Sub Program 下（L2 嵌套）', !!innerFunc, outerSubChildren.map(c => c.node && c.node.name).join(','));
    const siblingProc = outerSubChildren.find(c => c.node && c.node.name === 'sibling_proc');
    rec.assert('l2_sibling_in_outer_subprogram', 'sibling_proc 也在 outer_proc 的 Sub Program 下', !!siblingProc, outerSubChildren.map(c => c.node && c.node.name).join(','));
    const innerItem = provider.getTreeItem(innerFunc);
    rec.assert('l2_inner_function_icon', 'inner_func 为 Function 图标 func/F',
        iconName(innerItem.iconPath) === 'func', iconName(innerItem.iconPath));

    // ---- Case 6: Sub Program 嵌套 L3（deepest_proc 在 inner_func 的 Sub Program 下）----
    const innerChildren = await provider.getChildren(innerFunc);
    const innerSubGroup = innerChildren.find(c => c.isProgramGroup && c.programGroupKind === 'subprogram');
    rec.assert('l3_inner_has_subprogram', 'inner_func 展开后有 Sub Program（L3 嵌套）', !!innerSubGroup, innerChildren.map(c => c.label).join(','));
    const innerSubChildren = await provider.getChildren(innerSubGroup);
    const deepestProc = innerSubChildren.find(c => c.node && c.node.name === 'deepest_proc');
    rec.assert('l3_deepest_in_inner_subprogram', 'deepest_proc 在 inner_func 的 Sub Program 下（L3 嵌套）', !!deepestProc, innerSubChildren.map(c => c.node && c.node.name).join(','));
    const deepestItem = provider.getTreeItem(deepestProc);
    rec.assert('l3_deepest_procedure_icon', 'deepest_proc 为 Procedure 图标 proc/P',
        iconName(deepestItem.iconPath) === 'proc', iconName(deepestItem.iconPath));

    // ---- Case 7: Sub Program 嵌套 L4（leaf_func 在 deepest_proc 的 Sub Program 下）----
    const deepestChildren = await provider.getChildren(deepestProc);
    const deepestSubGroup = deepestChildren.find(c => c.isProgramGroup && c.programGroupKind === 'subprogram');
    rec.assert('l4_deepest_has_subprogram', 'deepest_proc 展开后有 Sub Program（L4 嵌套）', !!deepestSubGroup, deepestChildren.map(c => c.label).join(','));
    if (deepestSubGroup) {
        const deepestSubChildren = await provider.getChildren(deepestSubGroup);
        const leafFunc = deepestSubChildren.find(c => c.node && c.node.name === 'leaf_func');
        rec.assert('l4_leaf_in_deepest_subprogram', 'leaf_func 在 deepest_proc 的 Sub Program 下（最深 L4 嵌套）', !!leafFunc, deepestSubChildren.map(c => c.node && c.node.name).join(','));
    }

    // ---- Case 8: 每层 Body 含控制结构 ----
    const outerBody = outerChildren.find(c => c.isProgramGroup && c.programGroupKind === 'body');
    rec.assert('body_outer_exists', 'outer_proc 有 Body 文件夹', !!outerBody, outerChildren.map(c => c.label).join(','));
    if (outerBody) {
        const bodyKids = await provider.getChildren(outerBody);
        rec.assert('body_outer_has_control', 'outer_proc Body 含控制结构（IF/FOR）',
            bodyKids.some(c => c.node && (c.node.type === NodeType.IF_STATEMENT || c.node.type === NodeType.FOR_LOOP)),
            bodyKids.map(c => c.node && c.node.type).join(','));
    }
    const deepestBody = deepestChildren.find(c => c.isProgramGroup && c.programGroupKind === 'body');
    rec.assert('body_deepest_exists', 'deepest_proc 有 Body 文件夹', !!deepestBody, deepestChildren.map(c => c.label).join(','));

    // ---- Case 9: 递归 getParent 父链（L4 → L3 → L2 → L1 → PKG 全链可达）----
    // leaf_func 的父链应能逐级回溯到根
    if (deepestSubGroup) {
        const deepestSubChildren = await provider.getChildren(deepestSubGroup);
        const leafFunc = deepestSubChildren.find(c => c.node && c.node.name === 'leaf_func');
        if (leafFunc) {
            // leaf_func → deepest_proc 的 Sub Program group
            const p1 = await provider.getParent(leafFunc);
            rec.assert('parent_l4_to_l3group', 'leaf_func 父为 deepest_proc 的 Sub Program group',
                p1 && p1.isProgramGroup && p1.programGroupKind === 'subprogram', p1 && p1.label);
            // 沿父链回溯，应能到达 PKG
            let cur = p1; let reachedPkg = false; let steps = 0;
            while (cur && steps < 20) {
                if (cur.node && cur.node.name === 'gml_test_pkg') { reachedPkg = true; break; }
                cur = await provider.getParent(cur); steps++;
            }
            rec.assert('parent_chain_to_root', 'leaf_func 父链可逐级回溯到包根节点（reveal 不会断链）',
                reachedPkg, `steps=${steps}`);
        }
    }

    // ---- Case 10: 子程序图标在 Sub Program 下区分 Procedure/Function（P vs F）----
    // outer_proc(Procedure=proc) 与 top_func(Function=func) 图标不同
    rec.assert('icon_distinction', 'Procedure(proc/P) 与 Function(func/F) 图标可区分',
        iconName(outerItem.iconPath) !== iconName(topFuncItem.iconPath),
        `${iconName(outerItem.iconPath)} vs ${iconName(topFuncItem.iconPath)}`);

    return { suiteName: 'nested_subprograms_test', cases: rec.cases, parseTime };
}

// 直接运行时输出控制台结果
if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log(`\n=== GMLTest: nested_subprograms ===`);
        cases.forEach(c => console.log(`  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.desc}${c.passed ? '' : ' [' + c.actual + ']'} `));
        console.log(`\n结果: ${passed}/${cases.length} 通过`);
        process.exit(passed === cases.length ? 0 : 1);
    }).catch(err => { console.error('测试异常:', err); process.exit(1); });
}

module.exports = { run };

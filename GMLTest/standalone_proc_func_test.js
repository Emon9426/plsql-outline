/**
 * GMLTest: 独立 Procedure / Function 渲染测试
 *
 * 验证顶层节点为独立程序（无包包裹）时，扁平化分组样式正确：
 *  - 顶层节点类型/图标（PROCEDURE=symbol-method, FUNCTION=symbol-function）
 *  - Declaration 包裹层（变量/游标/常量/类型/异常）
 *  - Sub Program 嵌套（独立程序内也可有子程序）
 *  - Body 控制结构
 *  - getParent 父链
 *
 * 测试对象：GMLTest/standalone_proc_func.sql（含 1 个 Procedure + 1 个 Function）
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

const { PLSQLParser } = require('../out/parser');
const { PLSQLOutlineProvider } = require('../out/treeView');
const { DeclarationCategory, NodeType } = require('../out/types');
const iconPathMod = require('path');
function iconName(icon) {
    if (!icon) return 'none';
    if (icon.dark && icon.dark.fsPath) return iconPathMod.basename(icon.dark.fsPath).replace(/\.svg$/, '');
    return icon.id ? ('codicon:' + icon.id) : 'unknown';
}

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}
function makeProvider(parseResult) {
    const provider = new PLSQLOutlineProvider();
    provider.dataProvider = { getParseResult: async () => parseResult };
    return provider;
}

const SOURCE_FILE = path.join(__dirname, 'standalone_proc_func.sql');

async function run() {
    const rec = makeRecorder();
    const content = fs.readFileSync(SOURCE_FILE, 'utf8');

    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    const t0 = Date.now();
    const result = await parser.parse(content, 'standalone_proc_func.sql');
    const parseTime = Date.now() - t0;

    rec.assert('parse_clean', '源码解析零错误', result.metadata.errors.length === 0, `errors=${result.metadata.errors.length}`);
    rec.assert('parse_perf', '解析性能 < 200ms', parseTime < 200, `${parseTime}ms`);

    // 两个顶层程序
    rec.assert('two_toplevel', '解析出 2 个顶层程序（Procedure + Function）', result.nodes.length === 2, result.nodes.length);

    const provider = makeProvider(result);
    const topItems = await provider.getChildren();
    rec.assert('two_topitems', '大纲顶层 2 个节点', topItems.length === 2, topItems.length);

    // ========== 独立 Procedure ==========
    const procItem = topItems.find(t => t.node && t.node.name === 'calc_order_total');
    rec.assert('proc_exists', '存在独立 Procedure calc_order_total', !!procItem, topItems.map(t => t.node && t.node.name).join(','));
    if (procItem) {
        const procTree = provider.getTreeItem(procItem);
        rec.assert('proc_type', 'calc_order_total 为 PROCEDURE 类型', procItem.node.type === NodeType.PROCEDURE, procItem.node.type);
        rec.assert('proc_icon', 'calc_order_total 图标 proc/P（Procedure）', iconName(procTree.iconPath) === 'proc', iconName(procTree.iconPath));

        const procChildren = await provider.getChildren(procItem);
        const labels = procChildren.map(c => c.label);
        rec.assert('proc_declaration', 'Procedure 有 Declaration 包裹层', procChildren.some(c => c.isDeclarationSection), labels.join(','));

        // Declaration 含变量/游标/常量/类型/异常
        const decl = procChildren.find(c => c.isDeclarationSection);
        const declKids = await provider.getChildren(decl);
        const cats = declKids.filter(c => c.isDeclarationGroup).map(g => g.declarationCategory);
        rec.assert('proc_decl_vars', 'Procedure Declaration 含 Variables', cats.includes(DeclarationCategory.VARIABLE), cats.join(','));
        rec.assert('proc_decl_cursors', 'Procedure Declaration 含 Cursors', cats.includes(DeclarationCategory.CURSOR), cats.join(','));
        rec.assert('proc_decl_constants', 'Procedure Declaration 含 Constants', cats.includes(DeclarationCategory.CONSTANT), cats.join(','));
        rec.assert('proc_decl_types', 'Procedure Declaration 含 Types', cats.includes(DeclarationCategory.TYPE), cats.join(','));
        rec.assert('proc_decl_exceptions', 'Procedure Declaration 含 Exceptions', cats.includes(DeclarationCategory.EXCEPTION), cats.join(','));

        // Sub Program 嵌套（独立程序也有子程序）
        rec.assert('proc_subprogram', 'Procedure 有 Sub Program 文件夹（嵌套子程序）',
            procChildren.some(c => c.isProgramGroup && c.programGroupKind === 'subprogram'), labels.join(','));
        const subGroup = procChildren.find(c => c.isProgramGroup && c.programGroupKind === 'subprogram');
        if (subGroup) {
            const subKids = await provider.getChildren(subGroup);
            const names = subKids.map(c => c.node && c.node.name);
            rec.assert('proc_nested_func', 'Procedure Sub Program 含 apply_discount (Function)', names.includes('apply_discount'), names.join(','));
            rec.assert('proc_nested_proc', 'Procedure Sub Program 含 accumulate (Procedure)', names.includes('accumulate'), names.join(','));
            // 图标区分
            const applyDisc = subKids.find(c => c.node && c.node.name === 'apply_discount');
            const accum = subKids.find(c => c.node && c.node.name === 'accumulate');
            rec.assert('proc_nested_func_icon', 'apply_discount 为 Function 图标 func/F',
                iconName(provider.getTreeItem(applyDisc).iconPath) === 'func', iconName(provider.getTreeItem(applyDisc).iconPath));
            rec.assert('proc_nested_proc_icon', 'accumulate 为 Procedure 图标 proc/P',
                iconName(provider.getTreeItem(accum).iconPath) === 'proc', iconName(provider.getTreeItem(accum).iconPath));
        }

        // Body 控制结构
        const body = procChildren.find(c => c.isProgramGroup && c.programGroupKind === 'body');
        rec.assert('proc_body', 'Procedure 有 Body 文件夹', !!body, labels.join(','));
        if (body) {
            const bodyKids = await provider.getChildren(body);
            rec.assert('proc_body_control', 'Procedure Body 含 FOR/IF 控制结构',
                bodyKids.some(c => c.node && (c.node.type === NodeType.FOR_LOOP || c.node.type === NodeType.IF_STATEMENT)),
                bodyKids.map(c => c.node && c.node.type).join(','));
        }

        // EXCEPTION / END 叶子
        rec.assert('proc_exception', 'Procedure 有 EXCEPTION 叶子',
            procChildren.some(c => c.isStructureBlock && c.label === 'EXCEPTION'), labels.join(','));
        rec.assert('proc_end', 'Procedure 有 END 叶子',
            procChildren.some(c => c.label === 'END'), labels.join(','));

        // getParent：嵌套子程序的父 → Sub Program 文件夹 → Procedure
        if (subGroup) {
            const subKids = await provider.getChildren(subGroup);
            const nested = subKids[0];
            const p1 = await provider.getParent(nested);
            rec.assert('proc_parent_nested', '嵌套子程序父为 Sub Program 文件夹',
                p1 && p1.isProgramGroup && p1.programGroupKind === 'subprogram', p1 && p1.label);
        }
    }

    // ========== 独立 Function ==========
    const funcItem = topItems.find(t => t.node && t.node.name === 'get_customer_tier');
    rec.assert('func_exists', '存在独立 Function get_customer_tier', !!funcItem, topItems.map(t => t.node && t.node.name).join(','));
    if (funcItem) {
        const funcTree = provider.getTreeItem(funcItem);
        rec.assert('func_type', 'get_customer_tier 为 FUNCTION 类型', funcItem.node.type === NodeType.FUNCTION, funcItem.node.type);
        rec.assert('func_icon', 'get_customer_tier 图标 func/F（Function）', iconName(funcTree.iconPath) === 'func', iconName(funcTree.iconPath));

        const funcChildren = await provider.getChildren(funcItem);
        const fLabels = funcChildren.map(c => c.label);
        rec.assert('func_declaration', 'Function 有 Declaration 包裹层', funcChildren.some(c => c.isDeclarationSection), fLabels.join(','));
        // Function 的 Declaration 含常量
        const fDecl = funcChildren.find(c => c.isDeclarationSection);
        if (fDecl) {
            const fDeclKids = await provider.getChildren(fDecl);
            const fCats = fDeclKids.filter(c => c.isDeclarationGroup).map(g => g.declarationCategory);
            rec.assert('func_decl_constants', 'Function Declaration 含 Constants (c_gold/c_silver)',
                fCats.includes(DeclarationCategory.CONSTANT), fCats.join(','));
        }
        // Function 无子程序（Sub Program 文件夹不出现）
        rec.assert('func_no_subprogram', 'Function 无 Sub Program 文件夹（无嵌套子程序）',
            !funcChildren.some(c => c.isProgramGroup && c.programGroupKind === 'subprogram'), fLabels.join(','));
        // EXCEPTION / END
        rec.assert('func_exception', 'Function 有 EXCEPTION 叶子',
            funcChildren.some(c => c.isStructureBlock && c.label === 'EXCEPTION'), fLabels.join(','));
    }

    return { suiteName: 'standalone_proc_func_test', cases: rec.cases, parseTime };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log(`\n=== GMLTest: standalone_proc_func ===`);
        cases.forEach(c => console.log(`  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.desc}${c.passed ? '' : ' [' + c.actual + ']'}`));
        console.log(`\n结果: ${passed}/${cases.length} 通过`);
        process.exit(passed === cases.length ? 0 : 1);
    }).catch(err => { console.error('测试异常:', err); process.exit(1); });
}

module.exports = { run };

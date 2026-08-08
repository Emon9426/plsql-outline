/**
 * GMLTest: 万行级 Package 渲染测试（性能 + 扁平化样式正确性）
 *
 * 测试对象：test/huge_package_10k.sql（13,258 行，150 个顶层程序，4 级 Sub Program 嵌套）
 *
 * 与 test/huge_package_test.js 的区别：
 *  - huge_package_test.js 只验证【解析层】（节点闭合、控制结构计数）
 *  - 本测试验证【渲染层】（Declaration 包裹、Sub Program 文件夹、图标、getParent 父链）
 *    在万行级代码上的正确性与性能
 *
 * 验证：
 *  1. 万行级渲染性能（getChildren/getTreeItem 全量遍历 < 1000ms）
 *  2. 顶层 Package 下结构正确（Declaration / Sub Program）
 *  3. 抽样子程序可正确渲染（Declaration/Sub Program/Body）
 *  4. 抽样子程序图标区分（Procedure=symbol-method, Function=symbol-function）
 *  5. Declaration 包裹层在大规模声明下正确
 *  6. getParent 父链在大规模树中可达根
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

// 复用 test/ 目录下的万行级文件
const SOURCE_FILE = path.join(__dirname, '..', 'test', 'huge_package_10k.sql');

async function run() {
    const rec = makeRecorder();
    rec.assert('fixture_exists', '万行级测试文件存在', fs.existsSync(SOURCE_FILE), SOURCE_FILE);

    const content = fs.readFileSync(SOURCE_FILE, 'utf8');
    const lineCount = content.split('\n').length;
    rec.assert('fixture_lines', '文件达到万行级（>=10000 行）', lineCount >= 10000, lineCount);

    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    const parseT0 = Date.now();
    const result = await parser.parse(content, 'huge_package_10k.sql');
    const parseTime = Date.now() - parseT0;
    rec.assert('parse_clean', '万行解析零错误', result.metadata.errors.length === 0, `errors=${result.metadata.errors.length}`);
    rec.assert('parse_perf', '万行解析性能 < 3000ms', parseTime < 3000, `${parseTime}ms`);

    const root = result.nodes[0];
    rec.assert('root_pkg', '根节点为 PACKAGE_BODY', root && root.type === NodeType.PACKAGE_BODY, root && root.type);
    rec.assert('root_name', '包名 huge_test_pkg（schema 剥离）', root && root.name === 'huge_test_pkg', root && root.name);

    const provider = makeProvider(result);

    // ---- 1. 渲染性能：遍历顶层 + 抽样展开子程序，测量渲染耗时 ----
    const renderT0 = Date.now();
    const topItems = await provider.getChildren();
    const pkgChildren = await provider.getChildren(topItems[0]);
    // 渲染顶层所有 TreeItem
    for (const c of pkgChildren) { provider.getTreeItem(c); }
    const renderTime = Date.now() - renderT0;
    rec.assert('render_perf_toplevel', '顶层渲染性能 < 500ms', renderTime < 500, `${renderTime}ms`);

    // ---- 2. 顶层结构（Declaration + 子程序直接显示）----
    const labels = pkgChildren.map(c => c.label);
    rec.assert('top_declaration', '万行包顶层有 Declaration 包裹文件夹',
        pkgChildren.some(c => c.isDeclarationSection), labels.join(','));
    // 包下子程序直接显示（无 Sub Program 文件夹）
    rec.assert('top_no_subprogram_folder', '万行包顶层无 Sub Program 文件夹（子程序直接显示）',
        !pkgChildren.some(c => c.isProgramGroup && c.programGroupKind === 'subprogram'), labels.join(','));
    rec.assert('top_no_section', '万行包无旧 DECLARE/SUBPROGRAM 分区层（isSection）',
        !pkgChildren.some(c => c.isSection), labels.join(','));

    // ---- 3. Declaration 包裹层（大规模声明）----
    const declSection = pkgChildren.find(c => c.isDeclarationSection);
    if (declSection) {
        const declKids = await provider.getChildren(declSection);
        const groups = declKids.filter(c => c.isDeclarationGroup);
        rec.assert('decl_groups_count', '万行包 Declaration 有多个类别分组（>=4）', groups.length >= 4, groups.length);
        // 抽样：包级 Variables 组（包级声明，非子程序局部变量）
        const varGroup = groups.find(g => g.declarationCategory === DeclarationCategory.VARIABLE);
        if (varGroup) {
            const varEntries = await provider.getChildren(varGroup);
            rec.assert('decl_vars_present', '万行包 Declaration 含包级变量（>=10）', varEntries.length >= 10, varEntries.length);
        }
        const cursorGroup = groups.find(g => g.declarationCategory === DeclarationCategory.CURSOR);
        if (cursorGroup) {
            const cursorEntries = await provider.getChildren(cursorGroup);
            rec.assert('decl_cursors_many', '万行包 Cursors 组含多个游标（>=10）', cursorEntries.length >= 10, cursorEntries.length);
        }
    }

    // ---- 4. 包下子程序直接显示（150 个顶层程序，仅名称+图标）----
    // 子程序是包的直接子项（node 类型为 FUNCTION/PROCEDURE）
    const subChildren = pkgChildren.filter(c => c.node &&
        (c.node.type === NodeType.FUNCTION || c.node.type === NodeType.PROCEDURE));
    rec.assert('subprogram_count', '万行包下直接显示 150 个子程序', subChildren.length === 150, subChildren.length);
    if (subChildren.length > 0) {
        // 全部子程序都有有效 TreeItem（图标）
        let allHaveIcon = true;
        for (const sc of subChildren) {
            const ti = provider.getTreeItem(sc);
            if (!ti.iconPath) { allHaveIcon = false; break; }
        }
        rec.assert('subprogram_all_icons', '全部 150 个子程序都有图标', allHaveIcon, '部分缺失');

        // 图标区分：抽样前几个，应有 proc(Procedure/P) 和 func(Function/F)
        const iconIds = new Set();
        for (let i = 0; i < Math.min(10, subChildren.length); i++) {
            const ti = provider.getTreeItem(subChildren[i]);
            if (ti.iconPath) iconIds.add(iconName(ti.iconPath));
        }
        rec.assert('subprogram_icon_variety', '万行包子程序图标有区分（含 proc/P 和 func/F）',
            iconIds.has('proc') && iconIds.has('func'), Array.from(iconIds).join(','));

        // 子程序标签仅名称（无 "Procedure:"/"Function:" 前缀）
        const firstSubTree = provider.getTreeItem(subChildren[0]);
        rec.assert('subprogram_label_nameonly', '子程序标签仅名称（无类型前缀）',
            !firstSubTree.label.includes(':'), firstSubTree.label);
    }

    // ---- 5. 抽样子程序内部渲染（Procedure 内 Declaration/Sub Program/Body）----
    if (subChildren.length > 0) {
        // 找第一个 Procedure（含嵌套子程序的）
        const sampleProc = subChildren.find(c => c.node && c.node.type === NodeType.PROCEDURE);
        if (sampleProc) {
            const sampleTree = provider.getTreeItem(sampleProc);
            rec.assert('sample_proc_icon', '抽样子程序图标正确 proc/P（Procedure）',
                iconName(sampleTree.iconPath) === 'proc', iconName(sampleTree.iconPath));
            const sampleKids = await provider.getChildren(sampleProc);
            rec.assert('sample_proc_declaration', '抽样子程序有 Declaration 包裹层',
                sampleKids.some(c => c.isDeclarationSection), sampleKids.map(c => c.label).join(','));
            rec.assert('sample_proc_subprogram', '抽样子程序有 Sub Program 文件夹（嵌套子程序）',
                sampleKids.some(c => c.isProgramGroup && c.programGroupKind === 'subprogram'), sampleKids.map(c => c.label).join(','));
            rec.assert('sample_proc_body', '抽样子程序有 Body 文件夹',
                sampleKids.some(c => c.isProgramGroup && c.programGroupKind === 'body'), sampleKids.map(c => c.label).join(','));

            // ---- 6. getParent 父链（万行树中可达根）----
            const nestedSub = sampleKids.find(c => c.isProgramGroup && c.programGroupKind === 'subprogram');
            if (nestedSub) {
                const nestedKids = await provider.getChildren(nestedSub);
                if (nestedKids.length > 0) {
                    let cur = nestedKids[0]; let reachedRoot = false; let steps = 0;
                    while (cur && steps < 30) {
                        if (cur.node && cur.node.name === 'huge_test_pkg') { reachedRoot = true; break; }
                        cur = await provider.getParent(cur); steps++;
                    }
                    rec.assert('large_parent_chain', '万行树中嵌套子程序父链可达包根节点',
                        reachedRoot, `steps=${steps}`);
                }
            }
        }
    }

    // ---- 7. END 叶子 ----
    rec.assert('top_end', '万行包顶层有 END 叶子',
        pkgChildren.some(c => c.label === 'END'), labels.join(','));

    return { suiteName: 'large_package_render_test', cases: rec.cases, parseTime };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log(`\n=== GMLTest: large_package_render ===`);
        cases.forEach(c => console.log(`  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.desc}${c.passed ? '' : ' [' + c.actual + ']'}`));
        console.log(`\n结果: ${passed}/${cases.length} 通过`);
        process.exit(passed === cases.length ? 0 : 1);
    }).catch(err => { console.error('测试异常:', err); process.exit(1); });
}

module.exports = { run };

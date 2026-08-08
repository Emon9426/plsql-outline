/**
 * 大纲渲染测试（v1.5.4：Declaration 包裹层 + 扁平化分组）
 *
 * 验证：
 *  1. 对象名下直接是 Declaration / Sub Program / Body / Exception / End（无旧分区中间层）
 *  2. Declaration 包裹文件夹下含 Variables/Constants/Cursors/Types/Exceptions 五类
 *  3. Sub Program 文件夹含所有子程序（Procedure/Function）
 *  4. 子程序内部同样扁平化
 *  5. getParent 父链（reveal 所需）
 *
 * 使用真实的 PLSQLOutlineProvider + mock vscode。
 * 运行：node test/declaration_render_test.js （需先 npm run compile）
 */
const path = require('path');

// ---------- mock vscode ----------
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class TreeItem {
        constructor(label, collapsibleState) { this.label = label; this.collapsibleState = collapsibleState; }
    },
    ThemeIcon: class ThemeIcon { constructor(id) { this.id = id; } },
    EventEmitter: class EventEmitter {
        constructor() { this.listeners = []; }
        event(l) { this.listeners.push(l); return { dispose: () => {} }; }
        fire(d) { this.listeners.forEach(l => l(d)); }
        dispose() { this.listeners = []; }
    },
    workspace: { getConfiguration: () => ({ get: (key, def) => def }) },
    window: { createOutputChannel: () => ({ appendLine: () => {}, dispose: () => {} }) },
    RelativePattern: class RelativePattern { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f }) }
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request) {
    if (request === 'vscode') return 'vscode_mock';
    return originalResolve.apply(this, arguments);
};
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../out/parser');
const { PLSQLOutlineProvider } = require('../out/treeView');
const { SectionType, DeclarationCategory, NodeType } = require('../out/types');

let passed = 0, failed = 0;
const failures = [];
function assert(cond, msg) { if (cond) passed++; else { failed++; failures.push(msg); console.error('  ✗ FAIL: ' + msg); } }

// 带丰富声明与子程序的包
const SOURCE = `CREATE OR REPLACE PACKAGE BODY demo_pkg
IS
    -- 包级声明
    g_count   NUMBER := 0;
    c_limit   NUMBER CONSTANT := 100;
    CURSOR c_all (p_id NUMBER) IS
        SELECT * FROM t WHERE id = p_id;
    TYPE t_rec IS RECORD (id NUMBER, nm VARCHAR2(30));
    e_bad     EXCEPTION;

    PROCEDURE do_work(p_in IN NUMBER) IS
        v_local   NUMBER := p_in;
        c_local   NUMBER CONSTANT := 10;
        CURSOR c_inner IS SELECT level FROM dual;
        TYPE t_inner IS TABLE OF NUMBER;
        e_inner   EXCEPTION;
    BEGIN
        IF p_in IS NULL THEN
            v_local := 0;
        ELSIF p_in > c_local THEN
            v_local := c_local;
        ELSE
            v_local := p_in;
        END IF;
        FOR i IN 1 .. c_local LOOP
            v_local := v_local + i;
        END LOOP;
    EXCEPTION
        WHEN e_inner THEN
            v_local := -1;
    END do_work;

    FUNCTION get_count RETURN NUMBER IS
    BEGIN
        RETURN g_count;
    END get_count;
END demo_pkg;
/`;

function makeProvider(parseResult) {
    const provider = new PLSQLOutlineProvider();
    provider.dataProvider = { getParseResult: async () => parseResult };
    return provider;
}

async function main() {
    console.log('=== 大纲渲染测试（Declaration 包裹层 + 扁平化分组）===\n');
    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    const result = await parser.parse(SOURCE, 'demo_pkg.pkb');
    assert(result.metadata.errors.length === 0, '解析无错误（实际 ' + result.metadata.errors.length + '）');
    const root = result.nodes[0];
    assert(root.name === 'demo_pkg', '包名正确');

    const provider = makeProvider(result);
    const rootItems = await provider.getChildren();
    const pkgItem = rootItems[0];
    const pkgChildren = await provider.getChildren(pkgItem);
    const labels = pkgChildren.map(c => c.label);
    console.log('  包体子项:', labels.join(', '));

    // ---------- 1. 顶层结构：Declaration / Sub Program（无旧 section 层）----------
    console.log('\n--- 顶层扁平化结构 ---');
    assert(!pkgChildren.some(c => c.isSection), '无旧 DECLARE/SUBPROGRAM 分区层（isSection）');
    const declSection = pkgChildren.find(c => c.isDeclarationSection);
    const subGroup = pkgChildren.find(c => c.isProgramGroup && c.programGroupKind === 'subprogram');
    assert(declSection !== undefined, '存在 Declaration 包裹文件夹');
    assert(subGroup !== undefined, '存在 Sub Program 文件夹');

    // ---------- 2. Declaration 包裹层含 5 类 ----------
    console.log('\n--- Declaration 包裹层 ---');
    const declChildren = await provider.getChildren(declSection);
    const declGroups = declChildren.filter(c => c.isDeclarationGroup);
    const declCats = declGroups.map(g => g.declarationCategory);
    console.log('  声明分组:', declGroups.map(g => g.label).join(', '));
    assert(declGroups.length >= 4, 'Declaration 至少 4 个类别分组');
    assert(declCats.includes(DeclarationCategory.VARIABLE), 'Declaration 含 Variables');
    assert(declCats.includes(DeclarationCategory.CURSOR), 'Declaration 含 Cursors');
    assert(declCats.includes(DeclarationCategory.CONSTANT), 'Declaration 含 Constants');
    assert(declCats.includes(DeclarationCategory.TYPE), 'Declaration 含 Types');
    assert(declCats.includes(DeclarationCategory.EXCEPTION), 'Declaration 含 Exceptions');

    // 声明项叶节点带跳转命令
    const cursorGroup = declGroups.find(g => g.declarationCategory === DeclarationCategory.CURSOR);
    const cursorEntries = await provider.getChildren(cursorGroup);
    const entryItem = provider.getTreeItem(cursorEntries[0]);
    assert(entryItem.command !== undefined && entryItem.command.command === 'plsqlOutline.goToLine',
        '声明项带跳转命令 goToLine');

    // ---------- 3. Sub Program 文件夹含所有子程序 ----------
    console.log('\n--- Sub Program 文件夹 ---');
    assert(/^Sub Program \(2\)$/.test(subGroup.label), `Sub Program 标签含数量（实际 "${subGroup.label}"）`);
    const subChildren = await provider.getChildren(subGroup);
    const subNames = subChildren.map(c => c.node && c.node.name);
    console.log('  子程序:', subNames.join(', '));
    assert(subNames.includes('do_work'), 'Sub Program 含 do_work');
    assert(subNames.includes('get_count'), 'Sub Program 含 get_count');

    // ---------- 4. 子程序图标区分 Procedure/Function ----------
    console.log('\n--- 子程序图标区分 ---');
    const doWorkItem = subChildren.find(c => c.node && c.node.name === 'do_work');
    const getCountItem = subChildren.find(c => c.node && c.node.name === 'get_count');
    const doWorkIcon = provider.getTreeItem(doWorkItem).iconPath;
    const getCountIcon = provider.getTreeItem(getCountItem).iconPath;
    assert(doWorkIcon && doWorkIcon.id === 'symbol-method', `do_work 为 Procedure 图标 symbol-method（实际 ${doWorkIcon && doWorkIcon.id}）`);
    assert(getCountIcon && getCountIcon.id === 'symbol-function', `get_count 为 Function 图标 symbol-function（实际 ${getCountIcon && getCountIcon.id}）`);

    // ---------- 5. 子程序内部同样扁平化 ----------
    console.log('\n--- 子程序 do_work 内部扁平化 ---');
    const doWorkChildren = await provider.getChildren(doWorkItem);
    assert(doWorkChildren.some(c => c.isDeclarationSection), 'do_work 含 Declaration');
    assert(doWorkChildren.some(c => c.isProgramGroup && c.programGroupKind === 'body'), 'do_work 含 Body');
    // do_work 的局部声明分组
    const dwDecl = doWorkChildren.find(c => c.isDeclarationSection);
    const dwDeclChildren = await provider.getChildren(dwDecl);
    const dwGroups = dwDeclChildren.filter(c => c.isDeclarationGroup);
    assert(dwGroups.length >= 4, 'do_work 局部至少 4 个声明分组');
    // do_work 的 Body 含控制结构
    const dwBody = doWorkChildren.find(c => c.isProgramGroup && c.programGroupKind === 'body');
    const dwBodyChildren = await provider.getChildren(dwBody);
    assert(dwBodyChildren.some(c => c.node && c.node.type === NodeType.IF_STATEMENT), 'do_work Body 含 IF');
    assert(dwBodyChildren.some(c => c.node && c.node.type === NodeType.FOR_LOOP), 'do_work Body 含 FOR');

    // ---------- 6. getParent 父链 ----------
    console.log('\n--- getParent 父链 ---');
    // 声明项的父 → 声明分组
    const entryParent = await provider.getParent(cursorEntries[0]);
    assert(entryParent && entryParent.isDeclarationGroup, '声明项的父为声明分组');
    // 声明分组的父 → Declaration 包裹层
    const groupParent = await provider.getParent(cursorGroup);
    assert(groupParent && groupParent.isDeclarationSection, '声明分组的父为 Declaration 包裹层');
    // Declaration 包裹层的父 → 包节点
    const declParent = await provider.getParent(declSection);
    assert(declParent && declParent.node && declParent.node.name === 'demo_pkg', 'Declaration 包裹层的父为包节点');
    // 子程序节点的父 → Sub Program 文件夹
    const subNodeParent = await provider.getParent(doWorkItem);
    assert(subNodeParent && subNodeParent.isProgramGroup && subNodeParent.programGroupKind === 'subprogram',
        '子程序节点的父为 Sub Program 文件夹');
    // Sub Program 文件夹的父 → 包节点
    const subGroupParent = await provider.getParent(subGroup);
    assert(subGroupParent && subGroupParent.node && subGroupParent.node.name === 'demo_pkg',
        'Sub Program 文件夹的父为包节点');

    // ---------- 结果 ----------
    console.log('\n================================');
    console.log(`测试结果: ${passed}/${passed + failed} 通过`);
    if (failed > 0) { failures.forEach(f => console.error('  - ' + f)); process.exit(1); }
    console.log('\n所有测试通过!');
}

main().catch(err => { console.error('测试执行异常:', err); process.exit(1); });

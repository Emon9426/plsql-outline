/**
 * 大纲渲染测试（v1.5.3：Sub Program 分组 + 新分区顺序）
 *
 * 验证：
 *  1. 包体分区顺序：对象名 → DECLARE(声明项) → Sub Program(子程序) → BODY → EXCEPTION → END
 *  2. 子程序统一归入 "Sub Program (N)" 分组，不再平铺在 DECLARE 中
 *  3. DECLARE 分区仅含声明项分组（变量/游标/常量/类型/异常）
 *  4. 声明项叶节点带跳转命令
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

// ---------- 带丰富声明与子程序的包 ----------
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
    console.log('=== 大纲渲染测试（Sub Program 分组 + 新分区顺序）===\n');
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

    // ---------- 1. 包体分区顺序：DECLARE → Sub Program → BODY? → EXCEPTION? → END ----------
    console.log('--- 包体分区顺序 ---');
    const sectionTypes = pkgChildren.filter(c => c.isSection).map(c => c.sectionType);
    console.log('  分区顺序:', sectionTypes.join(' → '));
    // 期望顺序：DECLARE, SUBPROGRAM, END（本包无包级 BODY/EXCEPTION）
    const expectedOrder = [SectionType.DECLARE, SectionType.SUBPROGRAM, SectionType.END];
    assert(JSON.stringify(sectionTypes) === JSON.stringify(expectedOrder),
        `分区顺序为 DECLARE → SUBPROGRAM → END（实际 ${JSON.stringify(sectionTypes)}）`);

    // ---------- 2. Sub Program 分组含所有子程序 ----------
    console.log('\n--- Sub Program 分组 ---');
    const subSection = pkgChildren.find(c => c.isSection && c.sectionType === SectionType.SUBPROGRAM);
    assert(subSection !== undefined, '存在 Sub Program 分区');
    assert(/^Sub Program \(2\)$/.test(subSection.label), `Sub Program 标签含数量 "Sub Program (2)"（实际 "${subSection.label}"）`);
    const subChildren = await provider.getChildren(subSection);
    const subNames = subChildren.map(c => c.node && c.node.name);
    console.log('  子程序:', subNames.join(', '));
    assert(subNames.includes('do_work'), 'Sub Program 含 do_work');
    assert(subNames.includes('get_count'), 'Sub Program 含 get_count');

    // ---------- 3. DECLARE 分区仅含声明项分组（不含子程序）----------
    console.log('\n--- DECLARE 分区（仅声明项分组）---');
    const declSection = pkgChildren.find(c => c.isSection && c.sectionType === SectionType.DECLARE);
    assert(declSection !== undefined, '存在 DECLARE 分区');
    const declChildren = await provider.getChildren(declSection);
    const declGroups = declChildren.filter(c => c.isDeclarationGroup);
    const declNodes = declChildren.filter(c => c.node); // 子程序节点不应出现
    console.log('  声明分组:', declGroups.map(g => g.label).join(', '));
    assert(declGroups.length >= 4, 'DECLARE 至少 4 个声明分组');
    assert(declNodes.length === 0, 'DECLARE 分区不含子程序节点（子程序已移至 Sub Program）');
    assert(declGroups.some(g => g.declarationCategory === DeclarationCategory.CURSOR), 'DECLARE 含 Cursors');
    assert(declGroups.some(g => g.declarationCategory === DeclarationCategory.CONSTANT), 'DECLARE 含 Constants');
    assert(declGroups.some(g => g.declarationCategory === DeclarationCategory.TYPE), 'DECLARE 含 Types');
    assert(declGroups.some(g => g.declarationCategory === DeclarationCategory.EXCEPTION), 'DECLARE 含 Exceptions');

    // 声明项叶节点带跳转命令
    const cursorGroup = declGroups.find(g => g.declarationCategory === DeclarationCategory.CURSOR);
    const cursorEntries = await provider.getChildren(cursorGroup);
    const entryItem = provider.getTreeItem(cursorEntries[0]);
    assert(entryItem.command !== undefined && entryItem.command.command === 'plsqlOutline.goToLine',
        '声明项带跳转命令 goToLine');

    // ---------- 4. 子程序 do_work 内部也是分区结构 ----------
    console.log('\n--- 子程序 do_work 内部分区 ---');
    const doWorkItem = subChildren.find(c => c.node && c.node.name === 'do_work');
    const doWorkChildren = await provider.getChildren(doWorkItem);
    const dwSections = doWorkChildren.filter(c => c.isSection).map(c => c.sectionType);
    console.log('  do_work 分区:', dwSections.join(' → '));
    assert(dwSections.includes(SectionType.DECLARE), 'do_work 含 DECLARE（局部声明）');
    assert(dwSections.includes(SectionType.BODY), 'do_work 含 BODY（控制结构）');
    assert(dwSections.includes(SectionType.EXCEPTION), 'do_work 含 EXCEPTION');
    assert(dwSections.includes(SectionType.END), 'do_work 含 END');

    // do_work 的局部声明也在 DECLARE 分组里
    const dwDecl = doWorkChildren.find(c => c.isSection && c.sectionType === SectionType.DECLARE);
    const dwDeclChildren = await provider.getChildren(dwDecl);
    const dwGroups = dwDeclChildren.filter(c => c.isDeclarationGroup);
    assert(dwGroups.length >= 4, 'do_work 局部至少 4 个声明分组');

    // do_work 的 BODY 含控制结构
    const dwBody = doWorkChildren.find(c => c.isSection && c.sectionType === SectionType.BODY);
    const dwBodyChildren = await provider.getChildren(dwBody);
    assert(dwBodyChildren.some(c => c.node && c.node.type === NodeType.IF_STATEMENT), 'do_work BODY 含 IF');
    assert(dwBodyChildren.some(c => c.node && c.node.type === NodeType.FOR_LOOP), 'do_work BODY 含 FOR');

    // ---------- 5. getParent 父链（reveal 所需）----------
    console.log('\n--- getParent 父链 ---');
    // 声明项的父应为声明分组
    const entryParent = await provider.getParent(cursorEntries[0]);
    assert(entryParent && entryParent.isDeclarationGroup, '声明项的父为声明分组');
    // 声明分组的父应为 DECLARE 分区
    const groupParent = await provider.getParent(cursorGroup);
    assert(groupParent && groupParent.isSection && groupParent.sectionType === SectionType.DECLARE,
        '声明分组的父为 DECLARE 分区');
    // DECLARE 分区的父应为包节点
    const declParent = await provider.getParent(declSection);
    assert(declParent && declParent.node && declParent.node.name === 'demo_pkg',
        'DECLARE 分区的父为包节点');
    // 子程序节点的父应为 SUBPROGRAM 分区
    const subNodeParent = await provider.getParent(doWorkItem);
    assert(subNodeParent && subNodeParent.isSection && subNodeParent.sectionType === SectionType.SUBPROGRAM,
        '子程序节点的父为 SUBPROGRAM 分区');

    // ---------- 结果 ----------
    console.log('\n================================');
    console.log(`测试结果: ${passed}/${passed + failed} 通过`);
    if (failed > 0) { failures.forEach(f => console.error('  - ' + f)); process.exit(1); }
    console.log('\n所有测试通过!');
}

main().catch(err => { console.error('测试执行异常:', err); process.exit(1); });

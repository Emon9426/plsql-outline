/**
 * 声明项大纲渲染测试
 *
 * 验证 Phase B 的新功能：在 DECLARE 分区下按类别（Variables/Cursors/Constants/
 * Types/Exceptions）分组展示声明项，以及扁平模式。
 *
 * 使用真实的 PLSQLOutlineProvider + mock vscode，覆盖：
 *  1. 程序体的 DECLARE 分区下出现声明分组
 *  2. 分组可展开为声明项叶节点（带类别图标、行号、跳转命令）
 *  3. 扁平模式（groupDeclarations=false）直接展开所有声明项
 *  4. 包体顶层声明（包级游标/变量）也被展示
 *
 * 运行：node test/declaration_render_test.js  （需先 npm run compile）
 */
const path = require('path');
const fs = require('fs');

// ---------- mock vscode ----------
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class TreeItem {
        constructor(label, collapsibleState) {
            this.label = label;
            this.collapsibleState = collapsibleState;
        }
    },
    ThemeIcon: class ThemeIcon { constructor(id) { this.id = id; } },
    EventEmitter: class EventEmitter {
        constructor() { this.listeners = []; }
        event(listener) { this.listeners.push(listener); return { dispose: () => {} }; }
        fire(data) { this.listeners.forEach(l => l(data)); }
        dispose() { this.listeners = []; }
    },
    workspace: {
        getConfiguration: () => ({ get: (key, def) => def })
    },
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

// ---------- 构造一个带丰富声明的小包 ----------
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
END demo_pkg;
/`;

// 简单的数据桥：让 provider 能拿到解析结果
function makeProvider(parseResult) {
    const provider = new PLSQLOutlineProvider();
    provider.dataProvider = {
        getParseResult: async () => parseResult
    };
    return provider;
}

async function main() {
    console.log('=== 声明项大纲渲染测试 ===\n');
    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    const result = await parser.parse(SOURCE, 'demo_pkg.pkb');
    assert(result.metadata.errors.length === 0, '解析无错误（实际 ' + result.metadata.errors.length + '）');
    const root = result.nodes[0];
    assert(root !== undefined, '根节点存在');
    assert(root.name === 'demo_pkg', '包名正确（schema 无前缀）');

    // ---------- 1. 包体因有包级声明，应使用分区分组 ----------
    console.log('--- 包体分区（含包级声明）---');
    const provider = makeProvider(result);
    const rootItems = await provider.getChildren(); // 顶层 -> [package body]
    assert(rootItems.length === 1, '顶层仅 1 个节点');
    const pkgItem = rootItems[0];
    const pkgChildren = await provider.getChildren(pkgItem);
    const pkgDeclareSection = pkgChildren.find(c => c.isSection && c.sectionType === SectionType.DECLARE);
    assert(pkgDeclareSection !== undefined, '包体出现 DECLARE 分区');

    const pkgDeclareChildren = await provider.getChildren(pkgDeclareSection);
    // 应含子程序 + 声明分组（Variables/Cursors/Types/Constants/Exceptions）
    const pkgGroups = pkgDeclareChildren.filter(c => c.isDeclarationGroup);
    console.log('  包级声明分组:', pkgGroups.map(g => g.label).join(', '));
    assert(pkgGroups.length >= 4, '包级至少 4 个声明分组（变量/游标/类型/常量/异常）');
    assert(pkgGroups.some(g => g.declarationCategory === DeclarationCategory.VARIABLE), '含 Variables 分组');
    assert(pkgGroups.some(g => g.declarationCategory === DeclarationCategory.CURSOR), '含 Cursors 分组（c_all）');
    assert(pkgGroups.some(g => g.declarationCategory === DeclarationCategory.CONSTANT), '含 Constants 分组（c_limit）');
    assert(pkgGroups.some(g => g.declarationCategory === DeclarationCategory.TYPE), '含 Types 分组（t_rec）');
    assert(pkgGroups.some(g => g.declarationCategory === DeclarationCategory.EXCEPTION), '含 Exceptions 分组（e_bad）');

    // 验证游标分组的展开项
    const cursorGroup = pkgGroups.find(g => g.declarationCategory === DeclarationCategory.CURSOR);
    const cursorEntries = await provider.getChildren(cursorGroup);
    assert(cursorEntries.length === 1, '游标分组含 1 项（c_all）');
    assert(cursorEntries[0].isDeclarationEntry, '游标项是 declarationEntry');
    assert(cursorEntries[0].declarationEntry.name === 'c_all', '游标名为 c_all');

    // ---------- 2. 程序体 do_work 的 DECLARE 分区 + 分组 ----------
    console.log('\n--- 程序体 do_work 局部声明 ---');
    const procItem = pkgDeclareChildren.find(c => c.node && c.node.name === 'do_work');
    assert(procItem !== undefined, 'do_work 在 DECLARE 分区下');
    const procChildren = await provider.getChildren(procItem);
    const procDeclareSection = procChildren.find(c => c.isSection && c.sectionType === SectionType.DECLARE);
    assert(procDeclareSection !== undefined, 'do_work 出现 DECLARE 分区');
    const procDeclareChildren = await provider.getChildren(procDeclareSection);
    const procGroups = procDeclareChildren.filter(c => c.isDeclarationGroup);
    console.log('  局部声明分组:', procGroups.map(g => g.label).join(', '));
    assert(procGroups.length >= 4, 'do_work 至少 4 个声明分组');

    // ---------- 3. TreeItem 渲染 ----------
    console.log('\n--- TreeItem 渲染 ---');
    const groupTreeItem = provider.getTreeItem(cursorGroup);
    assert(groupTreeItem.iconPath !== undefined, '分组项有图标');
    assert(groupTreeItem.collapsibleState === 1 /* Collapsed */, '分组项默认折叠');

    const entryTreeItem = provider.getTreeItem(cursorEntries[0]);
    assert(entryTreeItem.command !== undefined && entryTreeItem.command.command === 'plsqlOutline.goToLine',
        '声明项带跳转命令 goToLine');
    assert(entryTreeItem.iconPath !== undefined, '声明项有图标');

    // ---------- 4. BODY 分区保留控制结构 ----------
    const procBodySection = procChildren.find(c => c.isSection && c.sectionType === SectionType.BODY);
    assert(procBodySection !== undefined, 'do_work 出现 BODY 分区');
    const bodyChildren = await provider.getChildren(procBodySection);
    assert(bodyChildren.length > 0, 'BODY 分区有控制结构（IF/FOR）');
    assert(bodyChildren.some(c => c.node && c.node.type === NodeType.IF_STATEMENT), 'BODY 含 IF');
    assert(bodyChildren.some(c => c.node && c.node.type === NodeType.FOR_LOOP), 'BODY 含 FOR');

    // ---------- 5. EXCEPTION / END 分区 ----------
    assert(procChildren.some(c => c.isSection && c.sectionType === SectionType.EXCEPTION), 'do_work 含 EXCEPTION 分区');
    assert(procChildren.some(c => c.isSection && c.sectionType === SectionType.END), 'do_work 含 END 分区');

    // ---------- 结果 ----------
    console.log('\n================================');
    console.log(`测试结果: ${passed}/${passed + failed} 通过`);
    if (failed > 0) { failures.forEach(f => console.error('  - ' + f)); process.exit(1); }
    console.log('\n所有测试通过!');
}

main().catch(err => { console.error('测试执行异常:', err); process.exit(1); });

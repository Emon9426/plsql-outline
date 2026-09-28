/**
 * GMLTest: 图标四类家族分类测试（Issue #42）
 *
 * 背景：#42 之前所有控制结构在 getNodeIcon 兜底为 variable（圆筒+v），
 * 匿名块用圆筒 anon、EXCEPTION 结构块用红三角 exception-block，四类语义不区分。
 *
 * 锁定契约（按家族）：
 *  - DB 对象：圆筒家族（proc/func/trigger/type/package）保持现状
 *  - 主结构：匿名块 = folder-anon（文件夹+</>）、EXCEPTION 结构块 = folder-exc（文件夹+红!）
 *  - 分支：IF/ELSIF/ELSE/CASE/WHEN = branch（蓝菱形）
 *  - 循环：LOOP/WHILE/FOR = loop（琥珀环箭头）
 *  - END 结构块保留几何符号 end；显示层不构造 BEGIN 块叶子（BEGIN 语义由 Body 文件夹承载）
 *  - 全树出现的每个图标在 res/icons/ 均有对应 SVG；图标全集与生成器清单一一对应（防脱节）
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

const fs = require('fs');
const path = require('path');
const { PLSQLParser } = require('../../out/parser');
const { PLSQLOutlineProvider, MemoryDataProvider } = require('../../out/treeView');
const { NodeType } = require('../../out/types');

const ICONS_DIR = path.join(__dirname, '..', '..', 'res', 'icons');
function iconName(icon) {
    if (!icon) return 'none';
    if (icon.dark && icon.dark.fsPath) return path.basename(icon.dark.fsPath).replace(/\.svg$/, '');
    return icon.id ? ('codicon:' + icon.id) : 'unknown';
}

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

const PROC_CODE = [
    'CREATE OR REPLACE PROCEDURE p_icon IS',  // 1
    '  v_a NUMBER := 1;',                      // 2
    'BEGIN',                                   // 3
    '  IF v_a > 0 THEN',                       // 4
    '    LOOP',                                // 5
    '      EXIT WHEN v_a > 5;',                // 6
    '      v_a := v_a + 1;',                   // 7
    '    END LOOP;',                           // 8
    '  END IF;',                               // 9
    '  WHILE v_a < 10 LOOP',                   // 10
    '    v_a := v_a + 1;',                     // 11
    '  END LOOP;',                             // 12
    '  FOR j IN 1..3 LOOP',                    // 13
    '    NULL;',                               // 14
    '  END LOOP;',                             // 15
    '  CASE v_a',                              // 16
    '    WHEN 1 THEN',                         // 17
    '      NULL;',                             // 18
    '    ELSE',                                // 19
    '      NULL;',                             // 20
    '  END CASE;',                             // 21
    'EXCEPTION',                               // 22
    '  WHEN OTHERS THEN',                      // 23
    '    NULL;',                               // 24
    'END p_icon;'                              // 25
].join('\n');

const ANON_CODE = [
    'DECLARE',                                 // 1
    '  v_i PLS_INTEGER := 0;',                 // 2
    'BEGIN',                                   // 3
    '  WHILE v_i < 3 LOOP',                    // 4
    '    v_i := v_i + 1;',                     // 5
    '  END LOOP;',                             // 6
    'END;'                                     // 7
].join('\n');

/** 递归遍历整棵显示树，收集（类型, 结构块, 图标）三元组（render-validate 同款全树遍历） */
async function walk(provider, items, out, depth) {
    for (const it of items) {
        const tree = provider.getTreeItem(it);
        out.push({
            label: String(tree.label),
            nodeType: it.node ? it.node.type : undefined,
            isStructureBlock: !!it.isStructureBlock,
            icon: iconName(tree.iconPath)
        });
        if (depth < 8) {
            const kids = await provider.getChildren(it);
            if (kids && kids.length > 0) {
                await walk(provider, kids, out, depth + 1);
            }
        }
    }
    return out;
}

async function run() {
    const rec = makeRecorder();

    // ---- 场景一：过程（分支/循环/结构块全家桶），独立解析器实例 ----
    const procResult = await new PLSQLParser().parse(PROC_CODE, 'control_icon_proc.sql');
    const procProvider = new PLSQLOutlineProvider();
    procProvider.setDataProvider(new MemoryDataProvider(procResult));
    const procTop = await procProvider.getChildren();
    const procWalk = await walk(procProvider, procTop, [], 0);

    const byType = (t) => procWalk.filter(e => e.nodeType === t);
    const blocks = (lbl) => procWalk.filter(e => e.isStructureBlock && e.label === lbl);
    const one = (entries) => entries.length > 0 ? entries[0].icon : '(missing)';

    // 分支家族：IF / CASE / WHEN → branch（length>0 前置防 every() 对空数组恒真）
    rec.assert('if_branch', 'IF 图标 = branch（蓝菱形）', byType(NodeType.IF_STATEMENT).length > 0 && byType(NodeType.IF_STATEMENT).every(e => e.icon === 'branch'), one(byType(NodeType.IF_STATEMENT)));
    rec.assert('case_branch', 'CASE 图标 = branch', byType(NodeType.CASE_STATEMENT).length > 0 && byType(NodeType.CASE_STATEMENT).every(e => e.icon === 'branch'), one(byType(NodeType.CASE_STATEMENT)));
    rec.assert('when_branch', 'WHEN 图标 = branch', byType(NodeType.WHEN_BRANCH).length > 0 && byType(NodeType.WHEN_BRANCH).every(e => e.icon === 'branch'), one(byType(NodeType.WHEN_BRANCH)));

    // 循环家族：LOOP / WHILE / FOR → loop
    rec.assert('loop_icon', 'LOOP 图标 = loop（琥珀环箭头）', byType(NodeType.LOOP_STATEMENT).length > 0 && byType(NodeType.LOOP_STATEMENT).every(e => e.icon === 'loop'), one(byType(NodeType.LOOP_STATEMENT)));
    rec.assert('while_icon', 'WHILE 图标 = loop', byType(NodeType.WHILE_LOOP).length > 0 && byType(NodeType.WHILE_LOOP).every(e => e.icon === 'loop'), one(byType(NodeType.WHILE_LOOP)));
    rec.assert('for_icon', 'FOR 图标 = loop', byType(NodeType.FOR_LOOP).length > 0 && byType(NodeType.FOR_LOOP).every(e => e.icon === 'loop'), one(byType(NodeType.FOR_LOOP)));

    // 主结构家族：EXCEPTION 结构块 = folder-exc；END 保留几何符号。
    // 显示层不构造 BEGIN 结构块叶子（BEGIN 语义由 Body 文件夹承载），故无 begin 断言。
    rec.assert('exc_folder', 'EXCEPTION 结构块图标 = folder-exc（文件夹+红!）', blocks('EXCEPTION').length > 0 && blocks('EXCEPTION').every(e => e.icon === 'folder-exc'), one(blocks('EXCEPTION')));
    rec.assert('end_keep', 'END 结构块图标保持 end（灰⏹）', blocks('END').length > 0 && blocks('END').every(e => e.icon === 'end'), one(blocks('END')));

    // 主结构文件夹保持：Declaration / Body 文件夹图标不变（Body 承载 BEGIN 语义）
    const bodyFolder = procWalk.find(e => e.label.startsWith('Body ('));
    rec.assert('body_folder_keep', 'Body 文件夹图标保持 folder-body', bodyFolder && bodyFolder.icon === 'folder-body', bodyFolder ? bodyFolder.icon : '(missing)');

    // DB 对象家族保持现状：过程根节点 = proc（圆筒+P）
    const procRoot = procWalk.find(e => e.nodeType === NodeType.PROCEDURE);
    rec.assert('proc_keep', 'PROCEDURE 图标保持 proc（圆筒+P）', procRoot && procRoot.icon === 'proc', procRoot ? procRoot.icon : '(missing)');

    // ---- 场景二：顶层匿名块 → folder-anon，体内 WHILE → loop ----
    const anonResult = await new PLSQLParser().parse(ANON_CODE, 'control_icon_anon.sql');
    const anonProvider = new PLSQLOutlineProvider();
    anonProvider.setDataProvider(new MemoryDataProvider(anonResult));
    const anonTop = await anonProvider.getChildren();
    const anonWalk = await walk(anonProvider, anonTop, [], 0);

    const anonRoot = anonWalk.find(e => e.nodeType === NodeType.ANONYMOUS_BLOCK);
    rec.assert('anon_folder', '匿名块图标 = folder-anon（文件夹+</>，主结构家族）', anonRoot && anonRoot.icon === 'folder-anon', anonRoot ? anonRoot.icon : '(missing)');
    const anonWhile = anonWalk.filter(e => e.nodeType === NodeType.WHILE_LOOP);
    rec.assert('anon_while_loop', '匿名块内 WHILE 图标 = loop', anonWhile.length > 0 && anonWhile.every(e => e.icon === 'loop'), one(anonWhile));

    // ---- 全树图标文件存在性：防止 treeView 映射与 res/icons 生成器脱节 ----
    const allEntries = procWalk.concat(anonWalk);
    const missing = allEntries.filter(e => {
        if (!e.icon || e.icon === 'none') { return false; }
        return !fs.existsSync(path.join(ICONS_DIR, `${e.icon}.svg`));
    });
    rec.assert('icons_on_disk', '全树引用的图标在 res/icons/ 均存在', missing.length === 0,
        missing.map(e => `${e.label}:${e.icon}`).join(','));

    // ---- 图标全集静态对照：res/icons 与 generate_icons.js 的 ICONS 清单一一对应 ----
    // （fixture 只触达部分图标；此断言兜住"生成器误删未触达图标仍全绿"的缺口）
    const EXPECTED_ICONS = [
        'proc', 'func', 'package', 'trigger', 'type', 'cursor',
        'variable', 'constant', 'exception',
        'folder-decl', 'folder-sub', 'folder-body', 'folder-anon', 'folder-exc',
        'branch', 'loop', 'begin', 'end'
    ].sort();
    const darkIcons = fs.readdirSync(ICONS_DIR)
        .filter(f => f.endsWith('.svg') && !f.endsWith('-light.svg'))
        .map(f => f.replace(/\.svg$/, ''))
        .sort();
    const diff = [];
    for (let i = 0; i < Math.max(EXPECTED_ICONS.length, darkIcons.length); i++) {
        if (EXPECTED_ICONS[i] !== darkIcons[i]) {
            diff.push(`${EXPECTED_ICONS[i] || '(无)'} vs ${darkIcons[i] || '(无)'}`);
        }
    }
    rec.assert('icons_full_set', 'res/icons 暗色全集 = 生成器 18 图标清单（含明暗配对）',
        diff.length === 0 && EXPECTED_ICONS.every(n => fs.existsSync(path.join(ICONS_DIR, `${n}-light.svg`))),
        diff.join(';'));

    return { suiteName: '控制结构图标分类', cases: rec.cases };
}

module.exports = { run };

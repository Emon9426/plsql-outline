/**
 * GMLTest: 大纲控制结构嵌套缩进测试（Issue #33）
 *
 * 验证 treeView 标签伪缩进（每层 4 个 NBSP，普通空格会被 HTML 折叠）：
 *  - Body 顶层控制结构（LOOP/IF）无前缀、彼此对齐
 *  - LOOP 内嵌套的 IF/WHILE 前缀 1 层（4×NBSP）；再嵌套一层加 1 层
 *  - ELSIF/ELSE 合并进 IF 后，IF 直系子项与分支子项缩进一致（同级对齐）
 *  - CASE → WHEN 分支缩进 +1，WHEN 内部再 +1（displayIndent 按显示父级链计算，
 *    不依赖 parser 的 level 跳变）
 *  - reveal/getParent 构造的临时项（无 displayIndent）不污染 treeItemCache：
 *    同一节点随后按真实 displayIndent 渲染时标签不受 fallback 估算影响
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

const NBSP = '\u00A0';
const STEP = 4;

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

async function run() {
    const rec = makeRecorder();
    const result = await new PLSQLParser().parse(CODE, 'control_indent_test.sql');
    const proc = result.nodes.find(n => n.name === 'p_indent');
    rec.assert('proc_parsed', '解析出 p_indent', !!proc, !!proc);
    if (!proc) { return { suiteName: '控制结构缩进', cases: rec.cases }; }

    const provider = new PLSQLOutlineProvider();
    provider.setDataProvider(new MemoryDataProvider(result));

    // 取 Body 文件夹
    const procItem = { node: proc, isStructureBlock: false, label: provider.getNodeLabel(proc), line: proc.declarationLine };
    const procChildren = await provider.getChildren(procItem);
    const bodyGroup = procChildren.find(c => c.isProgramGroup && c.programGroupKind === 'body');
    rec.assert('body_group_exists', 'Body 文件夹存在', !!bodyGroup, !!bodyGroup);
    if (!bodyGroup) { return { suiteName: '控制结构缩进', cases: rec.cases }; }

    const bodyItems = await provider.getChildren(bodyGroup);
    const byType = (t) => bodyItems.filter(i => i.node && i.node.type === t);

    // Body 顶层：LOOP / 顶层IF / CASE 无前缀、对齐
    const loopItem = byType(NodeType.LOOP_STATEMENT).find(i => i.node.declarationLine === 3);
    const topIfItem = byType(NodeType.IF_STATEMENT).find(i => i.node.declarationLine === 11);
    const caseItem = byType(NodeType.CASE_STATEMENT).find(i => i.node.declarationLine === 20);
    const lbl = (item) => item ? provider.getTreeItem(item).label : '(missing)';
    rec.assert('loop_no_indent', 'Body 顶层 LOOP 无缩进前缀', loopItem && lbl(loopItem) === 'LOOP', lbl(loopItem));
    rec.assert('top_if_no_indent', 'Body 顶层 IF 无缩进前缀（与 LOOP 对齐）', topIfItem && lbl(topIfItem) === 'IF', lbl(topIfItem));
    rec.assert('case_no_indent', 'Body 顶层 CASE 无缩进前缀', caseItem && lbl(caseItem) === 'CASE', lbl(caseItem));

    // LOOP 内：IF / WHILE 前缀 1 层
    const loopChildren = await provider.getChildren(loopItem);
    const ifInLoop = loopChildren.find(i => i.node && i.node.type === NodeType.IF_STATEMENT);
    const whileInLoop = loopChildren.find(i => i.node && i.node.type === NodeType.WHILE_LOOP);
    rec.assert('if_in_loop_1step', 'LOOP 内 IF 缩进 1 层（4×NBSP）',
        ifInLoop && lbl(ifInLoop) === NBSP.repeat(STEP) + 'IF', JSON.stringify(lbl(ifInLoop)));
    rec.assert('while_in_loop_1step', 'LOOP 内 WHILE 缩进 1 层且与 IF 对齐',
        whileInLoop && lbl(whileInLoop) === NBSP.repeat(STEP) + 'WHILE', JSON.stringify(lbl(whileInLoop)));

    // ELSIF 合并：合并 IF 的子项（IF 直系 + ELSIF 内 FOR）同级同缩进
    const mergedChildren = await provider.getChildren(topIfItem);
    const forInElsif = mergedChildren.find(i => i.node && i.node.type === NodeType.FOR_LOOP && i.node.declarationLine === 14);
    rec.assert('for_in_elsif_1step', 'ELSIF 分支内 FOR 与 IF 直系子项同级缩进 1 层',
        forInElsif && lbl(forInElsif) === NBSP.repeat(STEP) + 'FOR', JSON.stringify(lbl(forInElsif)));

    // CASE → WHEN 缩进 +1；WHEN 内部若嵌套控制结构再 +1（此处 WHEN 为叶）
    const caseChildren = await provider.getChildren(caseItem);
    const whenItem = caseChildren.find(i => i.node && i.node.type === NodeType.WHEN_BRANCH);
    rec.assert('when_1step', 'CASE 内 WHEN 缩进 1 层',
        whenItem && lbl(whenItem) === NBSP.repeat(STEP) + 'WHEN', JSON.stringify(lbl(whenItem)));

    // 临时项不污染缓存：无 displayIndent 的临时项（reveal/getParent 构造）标签按 level
    // 估算，但不得写入 treeItemCache——随后真实渲染项（带 displayIndent）可正常入缓存。
    // 用全新 provider（空缓存）隔离验证；treeItemCache 为编译产物的运行时私有字段。
    const freshProvider = new PLSQLOutlineProvider();
    freshProvider.setDataProvider(new MemoryDataProvider(result));
    const whileNode = whileInLoop.node;
    const whileFresh = { node: whileNode, isStructureBlock: false, label: 'WHILE', line: whileNode.declarationLine };
    const freshLabel = freshProvider.getTreeItem(whileFresh).label; // fallback: level-2 = 1 层
    rec.assert('fresh_fallback_label', '临时项使用 level 估算缩进（1 层）',
        freshLabel === NBSP.repeat(STEP) + 'WHILE', JSON.stringify(freshLabel));
    const cacheKey = freshProvider.generateCacheKey(whileFresh);
    const freshCached = freshProvider.treeItemCache.has(cacheKey);
    const realItem = { node: whileNode, isStructureBlock: false, label: 'WHILE', line: whileNode.declarationLine, displayIndent: 1 };
    freshProvider.getTreeItem(realItem);
    rec.assert('cache_not_poisoned', '临时项不写入 treeItemCache，真实项正常写入',
        !freshCached && freshProvider.treeItemCache.has(cacheKey),
        'fresh cached=' + freshCached + ', real cached=' + freshProvider.treeItemCache.has(cacheKey));

    return { suiteName: '控制结构缩进', cases: rec.cases };
}

module.exports = { run };

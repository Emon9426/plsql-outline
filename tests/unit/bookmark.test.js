/**
 * GMLTest: 书签核心逻辑测试（v1.17.0）
 *
 * 验证 src/bookmarks.ts 的纯函数契约（vscode-free，直连 out/）：
 *  1. applyDocumentChanges —— 书签跟随编辑迁移
 *     （用户示例：bbb 行书签，其上插入一行 → 2→3；整行删除随之删签；
 *       行内编辑不动；行首插入带换行才推挤；多变更降序归一；越界裁剪）
 *  2. findEnclosingSymbol / buildSummaryChain —— 所属子程序与结构链路摘要
 *  3. defaultBookmarkName / previewLineText —— 行文本展示辅助
 *
 * 交互契约（行号单击切换，2026-10-06 定稿）由 tests/regression/
 * bookmark_interaction_test.js 以真实事件形态驱动完整接线锁定。
 *
 * 行号口径：BookmarkData.line 为 0-based（与内部一致）。
 */
const { PLSQLParser } = require('../../out/parser');
const { NodeType } = require('../../out/types');
const {
    applyDocumentChanges,
    findEnclosingSymbol,
    buildSummaryChain,
    defaultBookmarkName,
    previewLineText
} = require('../../out/bookmarks');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

function bm(line, name) {
    return { line, name: name || '', note: '', createdAt: 1 };
}

/** 便捷构造单个变更（0-based 行列） */
function ch(sl, sc, el, ec, text) {
    return { startLine: sl, startChar: sc, endLine: el, endChar: ec, text };
}

/** 单书签 + 单变更迁移结果行号（-1 = 被删除） */
function migrate(bookmarkLine, change, lineCount) {
    const r = applyDocumentChanges([bm(bookmarkLine)], [change], lineCount);
    if (r.kept.length === 0) {
        return -1;
    }
    return r.kept[0].line;
}

const SAMPLE = [
    'CREATE OR REPLACE PACKAGE BODY pkg_bm AS',
    '  PROCEDURE outer_proc IS',
    '    v_num NUMBER;',
    '    PROCEDURE inner_proc IS',
    '    BEGIN',
    '      FOR r IN 1..3 LOOP',
    '        NULL;',
    '      END LOOP;',
    '    END inner_proc;',
    '  BEGIN',
    '    outer_body;',
    '    inner_proc;',
    '  END outer_proc;',
    'END pkg_bm;'
].join('\n');

async function run() {
    const rec = makeRecorder();

    /* ---------------- applyDocumentChanges ---------------- */

    // 用户原始示例：aaa/bbb/ccc，书签在 bbb（0-based 行 1），
    // 在其上方插入一行 aaa（变更 (1,0)-(1,0) 插入 "aaa\n"）→ 书签行 1→2（显示 2→3）
    rec.assert('m_user_example', '用户示例：上方插入一行，书签 2→3',
        migrate(1, ch(1, 0, 1, 0, 'aaa\n'), 4) === 2,
        migrate(1, ch(1, 0, 1, 0, 'aaa\n'), 4));

    rec.assert('m_delete_above', '上方删除一行，书签上移',
        migrate(1, ch(0, 0, 1, 0, ''), 2) === 0,
        migrate(1, ch(0, 0, 1, 0, ''), 2));

    rec.assert('m_insert_head_no_newline', '行首插入不带换行文本（"x"），书签不动',
        migrate(1, ch(1, 0, 1, 0, 'x'), 3) === 1,
        migrate(1, ch(1, 0, 1, 0, 'x'), 3));

    rec.assert('m_insert_head_two_lines', '行首插入两行（"a\\nb\\n"），书签 +2',
        migrate(1, ch(1, 0, 1, 0, 'a\nb\n'), 5) === 3,
        migrate(1, ch(1, 0, 1, 0, 'a\nb\n'), 5));

    rec.assert('m_insert_mid_line', '行中插入（列 2），书签不动',
        migrate(1, ch(1, 2, 1, 2, 'zz'), 3) === 1,
        migrate(1, ch(1, 2, 1, 2, 'zz'), 3));

    rec.assert('m_insert_line_end', '行尾插入（含换行文本），书签不动',
        migrate(1, ch(1, 3, 1, 3, 'x\ny'), 4) === 1,
        migrate(1, ch(1, 3, 1, 3, 'x\ny'), 4));

    rec.assert('m_inline_delete', '行内删除字符，书签不动',
        migrate(1, ch(1, 1, 1, 3, ''), 3) === 1,
        migrate(1, ch(1, 1, 1, 3, ''), 3));

    rec.assert('m_whole_line_delete', '书签行被整行删除 → 删签',
        migrate(1, ch(1, 0, 2, 0, ''), 2) === -1,
        migrate(1, ch(1, 0, 2, 0, ''), 2));

    rec.assert('m_span_delete_covers', '跨行删除覆盖书签行 → 删签',
        migrate(2, ch(1, 0, 3, 0, ''), 3) === -1,
        migrate(2, ch(1, 0, 3, 0, ''), 3));

    rec.assert('m_span_delete_partial', '上方多行删除止于书签行中部（列 4）→ 跟内容上移合并',
        migrate(2, ch(0, 0, 2, 4, ''), 5) === 0,
        migrate(2, ch(0, 0, 2, 4, ''), 5));

    // 多变更（多光标）：VS Code 天然降序 [下方先、上方后]，书签上方两处插入 → +2
    {
        const r = applyDocumentChanges(
            [bm(9)], [ch(6, 0, 6, 0, 'x\n'), ch(2, 0, 2, 0, 'y\n')], 13);
        rec.assert('m_multi_change', '多变更（降序给定）：书签上方两处插入，书签 +2',
            r.kept.length === 1 && r.kept[0].line === 11,
            JSON.stringify(r.kept));
    }
    // 乱序给定的归一化：同一组变更乱序输入，结果一致
    {
        const r = applyDocumentChanges(
            [bm(9)], [ch(2, 0, 2, 0, 'y\n'), ch(6, 0, 6, 0, 'x\n')], 13);
        rec.assert('m_multi_change_unsorted', '多变更乱序输入：内部降序归一，结果一致 +2',
            r.kept.length === 1 && r.kept[0].line === 11,
            JSON.stringify(r.kept));
    }

    rec.assert('m_change_below', '变更在书签下方，书签不动',
        migrate(1, ch(3, 0, 3, 0, 'a\nb\nc'), 6) === 1,
        migrate(1, ch(3, 0, 3, 0, 'a\nb\nc'), 6));

    // 全选替换：书签行被完全覆盖 → 删签；末行书签（E 止于行中）→ 上移到 0
    {
        const r = applyDocumentChanges(
            [bm(2), bm(3)], [ch(0, 0, 3, 5, 'new content')], 1);
        rec.assert('m_select_all_replace', '全选替换：中间行删签、末行书签并到首行',
            r.kept.length === 1 && r.kept[0].line === 0 && r.removedCount === 1,
            JSON.stringify(r));
    }

    // 防御性裁剪：书签行越界（文档缩短后）→ 丢弃
    {
        const r = applyDocumentChanges([bm(10)], [], 3);
        rec.assert('m_prune_out_of_range', '越界书签被裁剪', r.kept.length === 0,
            JSON.stringify(r.kept));
    }

    // 删除计数：整行删除后 removedCount = 1
    {
        const r = applyDocumentChanges([bm(1), bm(4)], [ch(1, 0, 2, 0, '')], 4);
        rec.assert('m_removed_count', '整行删除后 removedCount=1 且其余书签不动/迁移正确',
            r.removedCount === 1 && r.kept.length === 1 && r.kept[0].line === 3,
            JSON.stringify(r));
    }

    /* ---------------- 所属与摘要（真实解析树） ---------------- */

    const parsed = await new PLSQLParser().parse(SAMPLE, 'bookmark_test.sql', { maxNestingDepth: 15 });
    rec.assert('p_parse_clean', '样本解析零错误', parsed.metadata.errors.length === 0,
        parsed.metadata.errors.length);

    // FOR 行（1-based 行 6）：最内层可调用 = inner_proc
    {
        const node = findEnclosingSymbol(parsed.nodes, 6);
        rec.assert('s_inner_proc', 'FOR 行所属 = 最内层 PROCEDURE inner_proc',
            node && node.type === NodeType.PROCEDURE && node.name.toLowerCase() === 'inner_proc',
            node ? `${node.type} ${node.name}` : 'null');
    }
    // DECLARE 区行（1-based 行 3，v_num 声明）：所属 = outer_proc
    {
        const node = findEnclosingSymbol(parsed.nodes, 3);
        rec.assert('s_declare_section', '声明区行所属 = outer_proc',
            node && node.type === NodeType.PROCEDURE && node.name.toLowerCase() === 'outer_proc',
            node ? `${node.type} ${node.name}` : 'null');
    }
    // 摘要链路：FOR 行 → pkg_bm → outer_proc → inner_proc → FOR
    {
        const chain = buildSummaryChain(parsed.nodes, 6).toLowerCase();
        rec.assert('s_chain_for', 'FOR 行摘要链路含四层',
            chain.includes('pkg_bm') && chain.includes('outer_proc') &&
            chain.includes('inner_proc') && chain.trim().endsWith('for'),
            chain);
    }
    // 根行（1-based 行 1）：兜底容器 = PACKAGE BODY
    {
        const node = findEnclosingSymbol(parsed.nodes, 1);
        rec.assert('s_root_fallback', '包体声明行所属兜底 = PACKAGE BODY pkg_bm',
            node && node.type === NodeType.PACKAGE_BODY && node.name.toLowerCase() === 'pkg_bm',
            node ? `${node.type} ${node.name}` : 'null');
    }
    // 循环体内部行（1-based 行 7，NULL;）：最内层仍是 inner_proc，链路含 FOR
    {
        const chain = buildSummaryChain(parsed.nodes, 7).toLowerCase();
        const node = findEnclosingSymbol(parsed.nodes, 7);
        rec.assert('s_loop_body', '循环体行所属 = inner_proc，摘要含 for',
            node && node.name.toLowerCase() === 'inner_proc' && chain.includes('for'),
            `${node ? node.name : 'null'} / ${chain}`);
    }

    /* ---------------- 行文本展示辅助 ---------------- */

    rec.assert('t_default_name', '默认名：trim 后取前 40 字符',
        defaultBookmarkName('   FOR r IN 1..3 LOOP   ') === 'FOR r IN 1..3 LOOP',
        defaultBookmarkName('   FOR r IN 1..3 LOOP   '));
    rec.assert('t_default_name_empty', '空行默认名占位符',
        defaultBookmarkName('    ') === '(空行)', defaultBookmarkName('    '));
    rec.assert('t_default_name_truncate', '超长行截断带省略号',
        defaultBookmarkName('x'.repeat(50)).length === 41 &&
        defaultBookmarkName('x'.repeat(50)).endsWith('…'),
        defaultBookmarkName('x'.repeat(50)).length);
    rec.assert('t_preview', '预览：trim 后截断 80 字符',
        previewLineText('  abc  ') === 'abc' &&
        previewLineText('y'.repeat(100)).length === 81,
        previewLineText('y'.repeat(100)).length);

    return { suiteName: 'bookmark_test', cases: rec.cases, parseTime: 0 };
}

module.exports = { run };

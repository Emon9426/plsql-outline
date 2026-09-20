/**
 * GMLTest: 结构关键字配对高亮测试（Issue #31）
 *
 * 验证 src/highlight.ts 纯函数契约：
 *  - maskLiteralsAndComments：Q-quote（含 -- / /* 内容）、标准字符串（'' 转义）、
 *    -- 注释、单行/跨行块注释均掩码为等长空格；行数与行长保持，代码区原样
 *  - buildKeywordGroups：块组（匿名块 DECLARE/BEGIN/EXCEPTION/END；子程序
 *    BEGIN/EXCEPTION/END，按节点层级隔离）、IF 组（IF/ELSIF/ELSE/END IF 链）、
 *    循环组（FOR|WHILE + LOOP + END LOOP）
 *  - matchKeywordGroup：词区间与组 span 重叠命中——覆盖 END IF / END LOOP 中的
 *    END 与 IF/LOOP 词、FOR..LOOP 行中的任一关键字
 *  - 负例：普通词/THEN 不命中、掩码区（字符串内）不命中、END CASE 不命中、
 *    无配对的 BEGIN-only 节点不建组（原生词高亮回退路径）
 *
 * 折叠保留首行为 VS Code 原生行为；原生词高亮回退由 provider 返回空数组实现，
 * 编辑器侧行为由 foldRouting E2E 在真实宿主验证。
 */
const { PLSQLParser } = require('../../out/parser');
const { NodeType } = require('../../out/types');
const { maskLiteralsAndComments, buildKeywordGroups, matchKeywordGroup } = require('../../out/highlight');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

async function parseOne(code) {
    return new PLSQLParser().parse(code, 'keyword_highlight_test.sql', { maxNestingDepth: 15 });
}

/** 综合 Fixture：匿名块 > 子程序 > IF 链 > FOR 循环，含 Q-quote 与异常节 */
function fixtureSource() {
    return [
        'DECLARE',                                              // 1
        "  v_msg VARCHAR2(100) := q'[has -- and /* inside]';",  // 2
        '  PROCEDURE p_inner IS',                               // 3
        '  BEGIN',                                              // 4
        '    IF v_msg IS NOT NULL THEN',                        // 5
        '      NULL;',                                          // 6
        "    ELSIF v_msg = 'x' THEN",                           // 7
        '      NULL;',                                          // 8
        '    ELSE',                                             // 9
        '      FOR r IN 1..3 LOOP',                             // 10
        '        NULL;',                                        // 11
        '      END LOOP;',                                      // 12
        '    END IF;',                                          // 13
        '  EXCEPTION',                                          // 14
        '    WHEN OTHERS THEN NULL;',                           // 15
        '  END p_inner;',                                       // 16
        'BEGIN',                                                // 17
        '  p_inner;',                                           // 18
        'EXCEPTION',                                            // 19
        '  WHEN OTHERS THEN NULL;',                             // 20
        'END;',                                                 // 21
        '/'                                                     // 22
    ].join('\n');
}

async function run() {
    const rec = makeRecorder();

    // ---- Case 1: 掩码契约 ----
    const masked = maskLiteralsAndComments(fixtureSource());
    rec.assert('m1_line_count', '掩码保持行数', masked.length === 22, masked.length);
    const m2 = masked[1];
    rec.assert('m1_qquote_masked', 'Q-quote（含 -- 与 /*）从 q\' 起整体掩码且等长，前后代码保留',
        m2.length === fixtureSource().split('\n')[1].length &&
        m2.startsWith('  v_msg VARCHAR2(100) :=') && m2.trimEnd().endsWith(';') &&
        !m2.includes('has') && !m2.includes('inside') && !m2.includes('--') && !m2.includes('/*'),
        JSON.stringify(m2));
    const maskLower = maskLiteralsAndComments([
        "v := 'it''s -- ok'; -- tail comment",
        '/* one */ x := 1; /* start',
        'still comment */ y := 2;',
        "n := NQ'[x]'||q'{y}';"
    ].join('\n'));
    rec.assert('m1_std_string_escape', "标准字符串（'' 转义）与 -- 注释均掩码",
        maskLower[0].startsWith('v :=') && !maskLower[0].includes('it') &&
        !maskLower[0].includes('tail') && maskLower[0].trimEnd().endsWith(';'),
        JSON.stringify(maskLower[0]));
    rec.assert('m1_block_comment_single', '单行 /* */ 掩码且其后代码保留',
        maskLower[1].startsWith('          ') && maskLower[1].includes('x := 1;') && !maskLower[1].includes('one') && !maskLower[1].includes('start'),
        JSON.stringify(maskLower[1]));
    rec.assert('m1_block_comment_multiline', '跨行 /* */ 两行均掩码',
        !maskLower[2].includes('still comment') && maskLower[2].includes('y := 2;'),
        JSON.stringify(maskLower[2]));
    rec.assert('m1_nq_and_brace', 'NQ' + "'" + '[x] 与 q' + "'" + '{y} 掩码',
        !maskLower[3].includes('[x]') && !maskLower[3].includes('{y}') && maskLower[3].includes('||'),
        JSON.stringify(maskLower[3]));

    // ---- Case 2: 配对组构造 ----
    const src = fixtureSource();
    const lines = src.split('\n');
    const result = await parseOne(src);
    const groups = buildKeywordGroups(result, masked);
    const spanText = (s) => (lines[s.line - 1] || '').substring(s.start, s.end);
    const blocks = groups.filter(g => g.kind === 'block');
    const ifGroups = groups.filter(g => g.kind === 'if');
    const loopGroups = groups.filter(g => g.kind === 'loop');
    rec.assert('g1_group_kinds', '组构成：2 block + 1 if + 1 loop',
        blocks.length === 2 && ifGroups.length === 1 && loopGroups.length === 1,
        groups.map(g => g.kind).join(','));
    const anonBlock = blocks.find(g => g.spans.some(s => s.line === 1));
    const procBlock = blocks.find(g => g.spans.some(s => s.line === 4));
    rec.assert('g2_anon_spans', '匿名块组 = DECLARE@1 BEGIN@17 EXCEPTION@19 END@21',
        anonBlock && anonBlock.spans.map(s => s.line).join(',') === '1,17,19,21' &&
        spanText(anonBlock.spans[0]).toUpperCase() === 'DECLARE',
        anonBlock && JSON.stringify(anonBlock.spans));
    rec.assert('g3_proc_spans', '子程序组 = BEGIN@4 EXCEPTION@14 END@16（无 DECLARE，层级隔离）',
        procBlock && procBlock.spans.map(s => s.line).join(',') === '4,14,16' &&
        !procBlock.spans.some(s => s.line === 17),
        procBlock && JSON.stringify(procBlock.spans));
    const ifg = ifGroups[0];
    rec.assert('g4_if_spans', 'IF 组 = IF@5 ELSIF@7 ELSE@9 END IF@13',
        ifg && ifg.spans.map(s => spanText(s).toUpperCase()).join('|') === 'IF|ELSIF|ELSE|END IF',
        ifg && JSON.stringify(ifg.spans));
    const lpg = loopGroups[0];
    rec.assert('g5_loop_spans', '循环组 = FOR@10 + LOOP@10 + END LOOP@12',
        lpg && lpg.spans.map(s => spanText(s).toUpperCase()).join('|') === 'FOR|LOOP|END LOOP',
        lpg && JSON.stringify(lpg.spans));

    // ---- Case 3: 命中匹配（含复合关键字中的词）----
    const pos = (line, s, e) => matchKeywordGroup(groups, line, s, e);
    const r3decl = pos(1, 0, 7);
    rec.assert('h1_declare_hits_block', '双击 DECLARE → 匿名块组（含 BEGIN@17）',
        r3decl === anonBlock, r3decl && r3decl.kind);
    const r3begin4 = pos(4, 2, 7);
    rec.assert('h2_inner_begin', '双击子程序 BEGIN → 子程序组（非匿名块组）',
        r3begin4 === procBlock, r3begin4 && r3begin4.kind);
    const r3end21 = pos(21, 0, 3);
    rec.assert('h3_block_end', '双击裸 END → 所在块组',
        r3end21 === anonBlock, r3end21 && r3end21.kind);
    const r3end13 = pos(13, 4, 7);
    const r3if13 = pos(13, 8, 10);
    rec.assert('h4_end_if_word', '双击 END IF 中的 END 或 IF → 同一 IF 组',
        r3end13 === ifg && r3if13 === ifg, `${r3end13 && r3end13.kind}/${r3if13 && r3if13.kind}`);
    rec.assert('h5_elsif_else', '双击 ELSIF/ELSE → IF 组',
        pos(7, 6, 11) === ifg && pos(9, 6, 10) === ifg, 'see groups');
    rec.assert('h6_loop_words', '双击 FOR / LOOP（含 END LOOP 中的 LOOP）→ 循环组',
        pos(10, 6, 9) === lpg && pos(10, 18, 22) === lpg && pos(12, 10, 14) === lpg,
        'see groups');

    // ---- Case 4: 负例（回退原生词高亮路径）----
    rec.assert('n1_plain_word', '双击变量名 v_msg 不命中',
        pos(2, 2, 7) === null, 'expected null');
    rec.assert('n2_then_word', '双击 THEN 不命中',
        pos(5, 24, 28) === null, 'expected null');
    rec.assert('n3_word_in_string', '字符串内（掩码区）词位不命中',
        pos(2, 26, 30) === null, 'expected null');
    const caseSrc = [
        'BEGIN',                        // 1
        '  CASE',                       // 2
        '    WHEN 1 THEN NULL;',        // 3
        '  END CASE;',                  // 4
        'END;'                          // 5
    ].join('\n');
    const caseMasked = maskLiteralsAndComments(caseSrc);
    const caseGroups = buildKeywordGroups(await parseOne(caseSrc), caseMasked);
    rec.assert('n4_end_case', 'END CASE 行不建 IF/循环组（END@4 不命中）',
        matchKeywordGroup(caseGroups, 4, 2, 5) === null, JSON.stringify(caseGroups));
    rec.assert('n5_block_of_anon', '裸 BEGIN..END 匿名块仍有块组（BEGIN@1+END@5）',
        caseGroups.some(g => g.kind === 'block' && g.spans.some(s => s.line === 1)),
        JSON.stringify(caseGroups));

    // ---- Case 5: BEGIN-only 节点（未闭合）不建组 ----
    const fakeResult = {
        nodes: [{ type: NodeType.TRIGGER, name: 't', declarationLine: 1, beginLine: 3, exceptionLine: null, endLine: null, level: 1, children: [] }],
        metadata: { sourceFile: 'fake.sql', parseTime: 0, version: 't', errors: [], warnings: [], totalLines: 0, maxNestingDepth: 0 }
    };
    const fakeMasked = ['CREATE TRIGGER t', 'BEGIN', '  NULL;'];
    rec.assert('n6_begin_only_no_group', '仅 BEGIN 可定位（未闭合触发器）不建组',
        buildKeywordGroups(fakeResult, fakeMasked).length === 0,
        JSON.stringify(buildKeywordGroups(fakeResult, fakeMasked)));

    // ---- Case 6: 大小写不敏感 ----
    const lcSrc = [
        'declare',          // 1
        '  v number;',      // 2
        'begin',            // 3
        '  null;',          // 4
        'end;'              // 5
    ].join('\n');
    const lcMasked = maskLiteralsAndComments(lcSrc);
    const lcGroups = buildKeywordGroups(await parseOne(lcSrc), lcMasked);
    rec.assert('c6_case_insensitive', '小写关键字同样建组并命中',
        lcGroups.some(g => g.kind === 'block' && g.spans.length === 3) &&
        matchKeywordGroup(lcGroups, 3, 0, 5) !== null,
        JSON.stringify(lcGroups));

    // ---- Case 7: null 防御 ----
    rec.assert('c7_null_safe', 'buildKeywordGroups(null) 返回空数组',
        Array.isArray(buildKeywordGroups(null, [])) && buildKeywordGroups(null, []).length === 0,
        'expected []');

    return { suiteName: 'keyword_highlight_test', cases: rec.cases };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log('\n=== GMLTest: keyword_highlight_test ===');
        cases.forEach(c => console.log('  ' + (c.passed ? '✓' : '✗') + ' ' + c.name + ': ' + c.desc + (c.passed ? '' : ' [' + c.actual + ']')));
        console.log('\n结果: ' + passed + '/' + cases.length + ' 通过');
        process.exitCode = passed === cases.length ? 0 : 1;
    }).catch(e => { console.error(e); process.exitCode = 1; });
}

module.exports = { run };

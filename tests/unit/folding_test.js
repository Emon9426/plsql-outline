/**
 * GMLTest: 块结构折叠范围计算测试（Issue #23）
 *
 * 验证 src/folding.ts 的 computeFoldRanges 纯函数契约：
 *  - Function/Procedure 折叠整个过程（声明行 → END 行）
 *  - IF 行折叠到 END IF 行（IF/ELSIF/ELSE 兄弟链合并；CASE 内嵌 IF 不误合并）
 *  - LOOP/WHILE/FOR 折叠到 END LOOP 行；CASE 折叠到 END CASE 行
 *  - 匿名块、Package Body 整体折叠；Package Header 等未闭合节点不折叠
 *  - ELSIF/ELSE/WHEN 不产生独立折叠；排序与去重契约
 */
const { PLSQLParser } = require('../../out/parser');
const { NodeType } = require('../../out/types');
const { computeFoldRanges } = require('../../out/folding');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

async function parseOne(code) {
    return new PLSQLParser().parse(code, 'folding_test.sql', { maxNestingDepth: 15 });
}

/** 手工构造最小 ParseResult（排序/去重/防御性用例用） */
function fakeResult(nodes) {
    return {
        nodes,
        metadata: {
            sourceFile: 'fake.sql', parseTime: 0, version: 'test',
            errors: [], warnings: [], totalLines: 0, maxNestingDepth: 0
        }
    };
}

function fakeNode(type, declarationLine, endLine, children) {
    return { type, name: type, declarationLine, endLine: endLine === undefined ? null : endLine, level: 1, children: children || [] };
}

/** 构造 IF 链兄弟数组（模拟解析器拆分形态：后一分支 declarationLine = 前一节点 endLine） */
function ifChain() {
    const ifNode = fakeNode(NodeType.IF_STATEMENT, 4, 6);
    const elsif = fakeNode(NodeType.ELSIF_BRANCH, 6, 8);
    const els = fakeNode(NodeType.ELSE_BRANCH, 8, 10);
    return [ifNode, elsif, els];
}

async function run() {
    const rec = makeRecorder();

    // ---- Case 1: Procedure + IF/ELSIF/ELSE + LOOP ----
    const r1 = await parseOne([
        'CREATE OR REPLACE PROCEDURE p_calc IS',      // 1
        '  v_idx NUMBER := 0;',                       // 2
        'BEGIN',                                      // 3
        '  IF v_idx > 0 THEN',                        // 4
        '    NULL;',                                  // 5
        '  ELSIF v_idx = 0 THEN',                     // 6
        '    NULL;',                                  // 7
        '  ELSE',                                     // 8
        '    NULL;',                                  // 9
        '  END IF;',                                  // 10
        '  LOOP',                                     // 11
        '    v_idx := v_idx + 1;',                    // 12
        '  END LOOP;',                                // 13
        'END p_calc;'                                 // 14
    ].join('\n'));
    const f1 = computeFoldRanges(r1);
    rec.assert('c1_proc_whole', 'Procedure 折叠整个过程 [1,14]',
        JSON.stringify(f1) === JSON.stringify([{ startLine: 1, endLine: 14 }, { startLine: 4, endLine: 10 }, { startLine: 11, endLine: 13 }]),
        JSON.stringify(f1));
    rec.assert('c1_if_to_end_if', 'IF 行折叠到 END IF 行（链合并后 [4,10]）',
        f1.some(r => r.startLine === 4 && r.endLine === 10), JSON.stringify(f1));
    rec.assert('c1_loop_to_end_loop', 'LOOP 折叠到 END LOOP 行 [11,13]',
        f1.some(r => r.startLine === 11 && r.endLine === 13), JSON.stringify(f1));
    rec.assert('c1_no_branch_folds', 'ELSIF/ELSE 不产生独立折叠',
        f1.every(r => r.startLine !== 6 && r.startLine !== 8), JSON.stringify(f1));
    rec.assert('c1_parse_clean', 'Case1 解析零错误', r1.metadata.errors.length === 0, r1.metadata.errors.length);

    // ---- Case 2: CASE（含内嵌 IF 与 CASE 自身 ELSE）----
    const r2 = await parseOne([
        'CREATE OR REPLACE FUNCTION f_grade(p_score IN NUMBER) RETURN VARCHAR2 IS', // 1
        'BEGIN',                                      // 2
        '  CASE',                                     // 3
        '    WHEN p_score >= 90 THEN',                // 4
        '      IF p_score = 100 THEN',                // 5
        '        RETURN NULL;',                       // 6
        '      END IF;',                              // 7
        '      RETURN NULL;',                         // 8
        '    ELSE',                                   // 9
        '      RETURN NULL;',                         // 10
        '  END CASE;',                                // 11
        '  RETURN NULL;',                             // 12
        'END f_grade;'                                // 13
    ].join('\n'));
    const f2 = computeFoldRanges(r2);
    rec.assert('c2_func_whole', 'Function 折叠整个过程 [1,13]',
        f2.some(r => r.startLine === 1 && r.endLine === 13), JSON.stringify(f2));
    rec.assert('c2_case_to_end_case', 'CASE 折叠到 END CASE 行 [3,11]',
        f2.some(r => r.startLine === 3 && r.endLine === 11), JSON.stringify(f2));
    rec.assert('c2_inner_if_no_merge', 'CASE 内嵌 IF 折叠 [5,7]，不被 CASE 的 ELSE 误合并',
        f2.some(r => r.startLine === 5 && r.endLine === 7) && !f2.some(r => r.startLine === 5 && r.endLine !== 7),
        JSON.stringify(f2));
    rec.assert('c2_when_no_fold', 'WHEN 分支不产生独立折叠',
        f2.every(r => r.startLine !== 4), JSON.stringify(f2));

    // ---- Case 3: WHILE / FOR → END LOOP ----
    const r3 = await parseOne([
        'CREATE OR REPLACE PROCEDURE p_loop IS',      // 1
        'BEGIN',                                      // 2
        '  WHILE 1 = 1 LOOP',                         // 3
        '    NULL;',                                  // 4
        '  END LOOP;',                                // 5
        '  FOR i IN 1 .. 10 LOOP',                    // 6
        '    NULL;',                                  // 7
        '  END LOOP;',                                // 8
        'END p_loop;'                                 // 9
    ].join('\n'));
    const f3 = computeFoldRanges(r3);
    rec.assert('c3_while_for', 'WHILE [3,5] 与 FOR [6,8] 均折叠到 END LOOP 行',
        f3.some(r => r.startLine === 3 && r.endLine === 5) && f3.some(r => r.startLine === 6 && r.endLine === 8),
        JSON.stringify(f3));

    // ---- Case 4: Package Body 整体 + 内嵌子程序 ----
    const r4 = await parseOne([
        'CREATE OR REPLACE PACKAGE BODY pkg_demo IS', // 1
        '  PROCEDURE p_inner IS',                     // 2
        '  BEGIN',                                    // 3
        '    NULL;',                                  // 4
        '  END p_inner;',                             // 5
        '  FUNCTION f_inner RETURN NUMBER IS',        // 6
        '  BEGIN',                                    // 7
        '    RETURN 1;',                              // 8
        '  END f_inner;',                             // 9
        'BEGIN',                                      // 10
        '  NULL;',                                    // 11
        'END pkg_demo;'                               // 12
    ].join('\n'));
    const f4 = computeFoldRanges(r4);
    rec.assert('c4_pkg_body_whole', 'Package Body 整体折叠 [1,12]',
        f4.some(r => r.startLine === 1 && r.endLine === 12), JSON.stringify(f4));
    rec.assert('c4_inner_subprograms', '包体内嵌子程序折叠 [2,5] / [6,9]',
        f4.some(r => r.startLine === 2 && r.endLine === 5) && f4.some(r => r.startLine === 6 && r.endLine === 9),
        JSON.stringify(f4));

    // ---- Case 5: 内联匿名块折叠 ----
    const r5 = await parseOne([
        'CREATE OR REPLACE PROCEDURE p_anon IS',      // 1
        'BEGIN',                                      // 2
        '  DECLARE',                                  // 3
        '    v_local NUMBER := 1;',                   // 4
        '  BEGIN',                                    // 5
        '    v_local := v_local + 1;',                // 6
        '  END;',                                     // 7
        '  NULL;',                                    // 8
        'END p_anon;'                                 // 9
    ].join('\n'));
    const f5 = computeFoldRanges(r5);
    rec.assert('c5_inline_anon', '内联匿名块折叠 [3,7]',
        f5.some(r => r.startLine === 3 && r.endLine === 7), JSON.stringify(f5));

    // ---- Case 6: Package Header（根节点 endLine 未闭合）不产生折叠 ----
    const r6 = await parseOne([
        'CREATE OR REPLACE PACKAGE pkg_spec IS',      // 1
        '  PROCEDURE p1;',                            // 2
        '  FUNCTION f1 RETURN NUMBER;',               // 3
        'END pkg_spec;'                               // 4
    ].join('\n'));
    const f6 = computeFoldRanges(r6);
    rec.assert('c6_spec_no_fold', 'Package Header（endLine 未闭合，已知正常行为）无折叠',
        f6.length === 0, JSON.stringify(f6));

    // ---- Case 7: null/空结果防御 ----
    rec.assert('c7_null_safe', 'computeFoldRanges(null) 返回空数组',
        Array.isArray(computeFoldRanges(null)) && computeFoldRanges(null).length === 0,
        JSON.stringify(computeFoldRanges(null)));

    // ---- Case 8: 排序契约（起始行升序，同起始行结束行降序）----
    const f8 = computeFoldRanges(fakeResult([
        fakeNode(NodeType.PROCEDURE, 1, 20, [
            fakeNode(NodeType.IF_STATEMENT, 5, 8),
            fakeNode(NodeType.LOOP_STATEMENT, 10, 15)
        ])
    ]));
    rec.assert('c8_sort_order', '排序：[1,20] → [5,8] → [10,15]',
        JSON.stringify(f8) === JSON.stringify([{ startLine: 1, endLine: 20 }, { startLine: 5, endLine: 8 }, { startLine: 10, endLine: 15 }]),
        JSON.stringify(f8));
    const f8b = computeFoldRanges(fakeResult([
        fakeNode(NodeType.ANONYMOUS_BLOCK, 2, 9, [
            fakeNode(NodeType.ANONYMOUS_BLOCK, 2, 5)
        ])
    ]));
    rec.assert('c8_same_start_outer_first', '同起始行外层块（结束行更大）在前',
        JSON.stringify(f8b) === JSON.stringify([{ startLine: 2, endLine: 9 }, { startLine: 2, endLine: 5 }]),
        JSON.stringify(f8b));

    // ---- Case 9: 去重与单行节点过滤 ----
    const f9 = computeFoldRanges(fakeResult([
        fakeNode(NodeType.PROCEDURE, 1, 6, [fakeNode(NodeType.PROCEDURE, 1, 6)]),
        fakeNode(NodeType.PROCEDURE, 7, 7)   // endLine == declarationLine → 不折叠
    ]));
    rec.assert('c9_dedupe', '重复范围去重为一条',
        f9.filter(r => r.startLine === 1).length === 1, JSON.stringify(f9));
    rec.assert('c9_single_line_skip', 'endLine == declarationLine 的单行节点不折叠',
        f9.every(r => r.endLine > r.startLine), JSON.stringify(f9));

    // ---- Case 10: IF 链行号不连续时不合并（防御性）----
    const f10 = computeFoldRanges(fakeResult(ifChain().map(n =>
        n.type === NodeType.ELSE_BRANCH ? fakeNode(NodeType.ELSE_BRANCH, 9, 10) : n)));
    rec.assert('c10_chain_break_no_merge', 'ELSE 行号与 IF 链不连续时不合并（IF 只到自身 endLine）',
        !f10.some(r => r.startLine === 4 && r.endLine === 10), JSON.stringify(f10));

    // ---- Case 11: 无 ELSE 的 ELSIF 链（链尾 ELSIF 的 endLine 即 END IF 行）----
    const chain = ifChain().filter(n => n.type !== NodeType.ELSE_BRANCH);
    const f11 = computeFoldRanges(fakeResult(chain));
    rec.assert('c11_elsif_tail', 'IF+ELSIF 链合并到 ELSIF 的 endLine [4,8]',
        f11.some(r => r.startLine === 4 && r.endLine === 8), JSON.stringify(f11));

    return { suiteName: 'folding_test', cases: rec.cases };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log('\n=== GMLTest: folding_test ===');
        cases.forEach(c => console.log('  ' + (c.passed ? '✓' : '✗') + ' ' + c.name + ': ' + c.desc + (c.passed ? '' : ' [' + c.actual + ']')));
        console.log('\n结果: ' + passed + '/' + cases.length + ' 通过');
        process.exitCode = passed === cases.length ? 0 : 1;
    }).catch(e => { console.error(e); process.exitCode = 1; });
}

module.exports = { run };

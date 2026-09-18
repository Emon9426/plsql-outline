/**
 * GMLTest: 内联匿名块（单元体内的 DECLARE 块）含子程序的 END 配对修复测试
 *
 * 根因（2026-09-18 修复）：handleSubFunctionProcedure 进入子程序时把 beginEndCounter
 * 归零并清空 anonBlockCounters 且从不恢复 —— 宿主单元的 BEGIN 计数永久丢失，父单元
 * 永不闭合（endLine=null）。修复：进入子程序保存 (计数器+匿名块水位)，其 END 闭合时
 * 恢复；BEGIN/EXCEPTION 归属判定感知内联匿名块水位。
 *
 * 覆盖：
 *  - A: 独立过程内联匿名块含 1 个子程序（原始复现，outer endLine 必须闭合）
 *  - B: 内联匿名块含 2 个子程序（帧保存/恢复逐个平衡）
 *  - C: 子程序体内再嵌内联匿名块（帧刻度嵌套）
 *  - D: 内联匿名块体 EXCEPTION（exceptionLine = 水位+1 规则）
 *  - E: 顶层匿名块含子程序回归（改走水位闭合路径，层级不漂移）+ 后随单元不受污染
 */
const { PLSQLParser } = require('../out/parser');
const { NodeType } = require('../out/types');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

async function parseOne(code) {
    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    return parser.parse(code, 'inline_anon_subprogram_test.sql');
}

function findNode(nodes, type, name) {
    for (const n of nodes) {
        if (n.type === type && (name === undefined || n.name === name)) return n;
        const found = findNode(n.children, type, name);
        if (found) return found;
    }
    return null;
}

async function run() {
    const rec = makeRecorder();

    // ---- A: 独立过程 + 内联匿名块(游标+子程序) —— 原始复现 ----
    const codeA = [
        'CREATE OR REPLACE PROCEDURE outer_proc IS',
        '    v_x NUMBER;',
        'BEGIN',
        '    DECLARE',
        '        CURSOR c_local IS SELECT 1 FROM dual;',
        '        PROCEDURE helper IS',
        '        BEGIN',
        '            NULL;',
        '        END helper;',
        '    BEGIN',
        '        OPEN c_local;',
        '        helper;',
        '    END;',
        '    v_x := 1;',
        'END outer_proc;',
        '/'
    ].join('\n');
    const rA = await parseOne(codeA);
    rec.assert('a_clean', 'A 解析零错误', rA.metadata.errors.length === 0, JSON.stringify(rA.metadata.errors));
    const outer = rA.nodes[0];
    rec.assert('a_outer_exists', 'A 顶层为 outer_proc', !!outer && outer.name === 'outer_proc', rA.nodes.map(n => n.type).join(','));
    if (outer) {
        // 修复前：outer_proc.endLine === null（永不闭合）
        rec.assert('a_outer_closed', '【核心】outer_proc 在 L15 闭合（修复前 endLine=null）',
            outer.endLine === 15, 'end=' + outer.endLine);
        rec.assert('a_outer_begin', 'outer_proc.beginLine = L3', outer.beginLine === 3, 'begin=' + outer.beginLine);
    }
    const anonA = findNode(rA.nodes, NodeType.ANONYMOUS_BLOCK);
    rec.assert('a_anon_exists', 'A 含内联匿名块', !!anonA, 'none');
    if (anonA) {
        rec.assert('a_anon_lines', '匿名块 decl=4/begin=10/end=13',
            anonA.declarationLine === 4 && anonA.beginLine === 10 && anonA.endLine === 13,
            `${anonA.declarationLine}/${anonA.beginLine}/${anonA.endLine}`);
        rec.assert('a_anon_cursor', '游标 c_local 记入匿名块变量表(L5)',
            anonA.variableTable && anonA.variableTable.get('c_local') && anonA.variableTable.get('c_local').line === 5,
            anonA.variableTable ? Array.from(anonA.variableTable.keys()).join(',') : 'no-table');
    }
    const helper = findNode(rA.nodes, NodeType.PROCEDURE, 'helper');
    rec.assert('a_helper_lines', 'helper decl=6/begin=7/end=9',
        !!helper && helper.declarationLine === 6 && helper.beginLine === 7 && helper.endLine === 9,
        helper ? `${helper.declarationLine}/${helper.beginLine}/${helper.endLine}` : 'missing');

    // ---- B: 内联匿名块含 2 个子程序（帧逐个保存/恢复）----
    const codeB = [
        'CREATE OR REPLACE PROCEDURE outer2 IS',
        'BEGIN',
        '    DECLARE',
        '        PROCEDURE s1 IS',
        '        BEGIN',
        '            NULL;',
        '        END s1;',
        '        PROCEDURE s2 IS',
        '        BEGIN',
        '            NULL;',
        '        END s2;',
        '    BEGIN',
        '        s1;',
        '        s2;',
        '    END;',
        '    NULL;',
        'END outer2;',
        '/'
    ].join('\n');
    const rB = await parseOne(codeB);
    const outer2 = rB.nodes[0];
    rec.assert('b_clean', 'B 解析零错误', rB.metadata.errors.length === 0, JSON.stringify(rB.metadata.errors));
    rec.assert('b_outer_closed', '【核心】outer2 在 L17 闭合（两个子程序后计数恢复）',
        !!outer2 && outer2.endLine === 17, 'end=' + (outer2 && outer2.endLine));
    const anonB = findNode(rB.nodes, NodeType.ANONYMOUS_BLOCK);
    rec.assert('b_anon_lines', 'B 匿名块 decl=3/begin=12/end=15',
        !!anonB && anonB.declarationLine === 3 && anonB.beginLine === 12 && anonB.endLine === 15,
        anonB ? `${anonB.declarationLine}/${anonB.beginLine}/${anonB.endLine}` : 'missing');
    const s2 = findNode(rB.nodes, NodeType.PROCEDURE, 's2');
    rec.assert('b_s2_lines', 's2 decl=8/begin=9/end=11',
        !!s2 && s2.declarationLine === 8 && s2.endLine === 11,
        s2 ? `${s2.declarationLine}/${s2.endLine}` : 'missing');

    // ---- C: 子程序体内再嵌内联匿名块（帧刻度嵌套）----
    const codeC = [
        'CREATE OR REPLACE PROCEDURE p2 IS',
        'BEGIN',
        '    DECLARE',
        '        PROCEDURE s1 IS',
        '        BEGIN',
        '            DECLARE',
        '                v_inner NUMBER;',
        '            BEGIN',
        '                v_inner := 1;',
        '            END;',
        '            NULL;',
        '        END s1;',
        '    BEGIN',
        '        s1;',
        '    END;',
        '    NULL;',
        'END p2;',
        '/'
    ].join('\n');
    const rC = await parseOne(codeC);
    const p2 = rC.nodes[0];
    rec.assert('c_clean', 'C 解析零错误', rC.metadata.errors.length === 0, JSON.stringify(rC.metadata.errors));
    rec.assert('c_p2_closed', '【核心】p2 在 L17 闭合（多层帧嵌套恢复）',
        !!p2 && p2.endLine === 17, 'end=' + (p2 && p2.endLine));
    const s1 = findNode(rC.nodes, NodeType.PROCEDURE, 's1');
    rec.assert('c_s1_lines', 's1 decl=4/begin=5/end=12',
        !!s1 && s1.declarationLine === 4 && s1.beginLine === 5 && s1.endLine === 12,
        s1 ? `${s1.declarationLine}/${s1.beginLine}/${s1.endLine}` : 'missing');
    const anons = [];
    (function collect(nodes) { for (const n of nodes) { if (n.type === NodeType.ANONYMOUS_BLOCK) anons.push(n); collect(n.children); } })(rC.nodes);
    const anonOuterC = anons.find(a => a.declarationLine === 3);
    const anonInnerC = anons.find(a => a.declarationLine === 6);
    rec.assert('c_anon_outer', '外层匿名块 decl=3/begin=13/end=15',
        !!anonOuterC && anonOuterC.beginLine === 13 && anonOuterC.endLine === 15,
        anonOuterC ? `${anonOuterC.beginLine}/${anonOuterC.endLine}` : 'missing');
    rec.assert('c_anon_inner', '内层匿名块 decl=6/begin=8/end=10',
        !!anonInnerC && anonInnerC.beginLine === 8 && anonInnerC.endLine === 10,
        anonInnerC ? `${anonInnerC.beginLine}/${anonInnerC.endLine}` : 'missing');
    rec.assert('c_inner_var', 'v_inner 记入内层匿名块变量表(L7)',
        !!anonInnerC && anonInnerC.variableTable && anonInnerC.variableTable.get('v_inner') && anonInnerC.variableTable.get('v_inner').line === 7,
        anonInnerC && anonInnerC.variableTable ? Array.from(anonInnerC.variableTable.keys()).join(',') : 'missing');

    // ---- D: 内联匿名块体 EXCEPTION（水位+1 归属规则）----
    const codeD = [
        'CREATE OR REPLACE PROCEDURE p3 IS',
        'BEGIN',
        '    DECLARE',
        '        e_local EXCEPTION;',
        '        PROCEDURE s IS',
        '        BEGIN',
        '            NULL;',
        '        END s;',
        '    BEGIN',
        '        s;',
        '    EXCEPTION',
        '        WHEN OTHERS THEN',
        '            NULL;',
        '    END;',
        '    NULL;',
        'END p3;',
        '/'
    ].join('\n');
    const rD = await parseOne(codeD);
    const p3 = rD.nodes[0];
    rec.assert('d_clean', 'D 解析零错误', rD.metadata.errors.length === 0, JSON.stringify(rD.metadata.errors));
    rec.assert('d_p3_closed', 'p3 在 L16 闭合', !!p3 && p3.endLine === 16, 'end=' + (p3 && p3.endLine));
    const anonD = findNode(rD.nodes, NodeType.ANONYMOUS_BLOCK);
    rec.assert('d_anon_exception', '内联匿名块 exceptionLine = L11（水位+1 规则）',
        !!anonD && anonD.exceptionLine === 11, 'exc=' + (anonD && anonD.exceptionLine));
    rec.assert('d_anon_lines', 'D 匿名块 decl=3/begin=9/end=14',
        !!anonD && anonD.declarationLine === 3 && anonD.beginLine === 9 && anonD.endLine === 14,
        anonD ? `${anonD.declarationLine}/${anonD.beginLine}/${anonD.endLine}` : 'missing');
    rec.assert('d_exc_var', '异常 e_local 记入匿名块变量表(L4)',
        !!anonD && anonD.variableTable && anonD.variableTable.get('e_local') && anonD.variableTable.get('e_local').line === 4,
        anonD && anonD.variableTable ? Array.from(anonD.variableTable.keys()).join(',') : 'missing');

    // ---- E: 顶层匿名块含子程序回归（水位闭合路径）+ 后随单元 ----
    const codeE = [
        'DECLARE',
        '    PROCEDURE h IS',
        '    BEGIN',
        '        NULL;',
        '    END h;',
        'BEGIN',
        '    h;',
        'END;',
        '/',
        'CREATE OR REPLACE PROCEDURE after_anon IS',
        'BEGIN',
        '    NULL;',
        'END after_anon;',
        '/'
    ].join('\n');
    const rE = await parseOne(codeE);
    rec.assert('e_clean', 'E 解析零错误', rE.metadata.errors.length === 0, JSON.stringify(rE.metadata.errors));
    rec.assert('e_two_roots', 'E 解析出 2 个顶层单元（匿名块+过程）', rE.nodes.length === 2, rE.nodes.map(n => n.type).join(','));
    const anonE = rE.nodes.find(n => n.type === NodeType.ANONYMOUS_BLOCK);
    rec.assert('e_anon_lines', '顶层匿名块 decl=1/begin=6/end=8/level=0',
        !!anonE && anonE.declarationLine === 1 && anonE.beginLine === 6 && anonE.endLine === 8 && anonE.level === 0,
        anonE ? `${anonE.declarationLine}/${anonE.beginLine}/${anonE.endLine}/L${anonE.level}` : 'missing');
    const h = findNode(rE.nodes, NodeType.PROCEDURE, 'h');
    rec.assert('e_sub_level', 'h decl=2/end=5/level=1',
        !!h && h.declarationLine === 2 && h.endLine === 5 && h.level === 1,
        h ? `${h.declarationLine}/${h.endLine}/L${h.level}` : 'missing');
    const after = rE.nodes.find(n => n.type === NodeType.PROCEDURE && n.name === 'after_anon');
    rec.assert('e_after_unit', '后随 after_anon decl=10/begin=11/end=13',
        !!after && after.declarationLine === 10 && after.beginLine === 11 && after.endLine === 13,
        after ? `${after.declarationLine}/${after.beginLine}/${after.endLine}` : 'missing');

    return { suiteName: 'inline_anon_subprogram_test', cases: rec.cases };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log(`\n=== GMLTest: inline_anon_subprogram ===`);
        cases.forEach(c => console.log(`  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.desc}${c.passed ? '' : ' [' + c.actual + ']'}`));
        console.log(`\n结果: ${passed}/${cases.length} 通过`);
        process.exit(passed === cases.length ? 0 : 1);
    }).catch(err => { console.error('测试异常:', err); process.exit(1); });
}

module.exports = { run };

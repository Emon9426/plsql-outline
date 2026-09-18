/**
 * GMLTest: 顶层匿名块强化测试（Issue #5）
 *
 * 验证匿名块支持的强化：
 *  - 顶层裸 BEGIN 块（无 DECLARE）被解析为根级 Anonymous Block 节点
 *  - 块内控制结构与 EXCEPTION 区正常追踪，BEGIN/END 行正确记录
 *  - 连续多个顶层块（含 / 分隔行的脚本习惯）各自成为根节点
 *  - 单元（包体/过程）结束后的匿名块作为根节点，不再误挂为已关闭单元的子节点
 *  - DECLARE 块内嵌 DECLARE 块（匿名块嵌套）正确配对
 *  - 回归：方法体内联 DECLARE 块仍为方法子节点（v1.6.2 行为保持）
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
    return parser.parse(code, 'top_level_anon_test.sql');
}

async function run() {
    const rec = makeRecorder();

    // ---- Case 1: 顶层裸 BEGIN 块 ----
    const code1 = [
        'BEGIN',
        '  DBMS_OUTPUT.PUT_LINE(\'hello\');',
        'END;'
    ].join('\n');
    const r1 = await parseOne(code1);
    rec.assert('c1_root_anon', '裸 BEGIN 块解析为根级 Anonymous Block',
        r1.nodes.length === 1 && r1.nodes[0].type === NodeType.ANONYMOUS_BLOCK,
        r1.nodes.map(n => n.type).join(','));
    if (r1.nodes.length === 1) {
        rec.assert('c1_lines', 'BEGIN/END 行正确（1/3）',
            r1.nodes[0].beginLine === 1 && r1.nodes[0].endLine === 3,
            r1.nodes[0].beginLine + '/' + r1.nodes[0].endLine);
    }
    rec.assert('c1_clean', 'Case1 解析零错误', r1.metadata.errors.length === 0, r1.metadata.errors.length);

    // ---- Case 2: 裸 BEGIN 块内控制结构 + EXCEPTION ----
    const code2 = [
        'BEGIN',
        '  FOR i IN 1 .. 10 LOOP',
        '    IF i > 5 THEN',
        '      NULL;',
        '    END IF;',
        '  END LOOP;',
        'EXCEPTION',
        '  WHEN OTHERS THEN',
        '    NULL;',
        'END;'
    ].join('\n');
    const r2 = await parseOne(code2);
    const anon2 = r2.nodes[0];
    rec.assert('c2_anon', '块节点存在', r2.nodes.length === 1 && anon2.type === NodeType.ANONYMOUS_BLOCK, r2.nodes.map(n => n.type).join(','));
    rec.assert('c2_for', '块内 FOR 循环被识别', anon2.children.some(c => c.type === NodeType.FOR_LOOP), anon2.children.map(c => c.type).join(','));
    // IF 嵌套在 FOR 内（孙节点），递归查找
    const hasIf2 = (anon2.children || []).some(c => (c.children || []).some(g => g.type === NodeType.IF_STATEMENT));
    rec.assert('c2_if', '块内 IF 被识别（FOR 内嵌套）', hasIf2, anon2.children.map(c => c.type + ':' + (c.children || []).map(g => g.type).join('/')).join(','));
    rec.assert('c2_exception', 'EXCEPTION 行被记录（第7行）', anon2.exceptionLine === 7, anon2.exceptionLine);

    // ---- Case 3: 连续多个顶层块（含 / 分隔行）----
    const code3 = [
        'BEGIN',
        '  NULL;',
        'END;',
        '/',
        'DECLARE',
        '  v NUMBER := 1;',
        'BEGIN',
        '  NULL;',
        'END;',
        '/'
    ].join('\n');
    const r3 = await parseOne(code3);
    rec.assert('c3_two_roots', '裸 BEGIN 块 + DECLARE 块各自成为根节点',
        r3.nodes.length === 2
            && r3.nodes[0].type === NodeType.ANONYMOUS_BLOCK
            && r3.nodes[1].type === NodeType.ANONYMOUS_BLOCK,
        r3.nodes.map(n => n.type).join(','));
    if (r3.nodes.length === 2) {
        rec.assert('c3_closed', '两个块均正确闭合',
            r3.nodes[0].endLine === 3 && r3.nodes[1].endLine === 9,
            r3.nodes[0].endLine + '/' + r3.nodes[1].endLine);
    }

    // ---- Case 4: DECLARE 块内嵌 DECLARE 块 ----
    const code4 = [
        'DECLARE',
        '  v_outer NUMBER := 1;',
        'BEGIN',
        '  DECLARE',
        '    v_inner NUMBER := 2;',
        '  BEGIN',
        '    NULL;',
        '  END;',
        '  NULL;',
        'END;'
    ].join('\n');
    const r4 = await parseOne(code4);
    const outer4 = r4.nodes[0];
    rec.assert('c4_outer', '外层匿名块为根', r4.nodes.length === 1 && outer4.type === NodeType.ANONYMOUS_BLOCK, r4.nodes.length);
    rec.assert('c4_nested', '内层 DECLARE 块为外层子节点',
        outer4.children.some(c => c.type === NodeType.ANONYMOUS_BLOCK),
        outer4.children.map(c => c.type).join(','));
    rec.assert('c4_outer_closed', '外层块正确闭合（第10行）', outer4.endLine === 10, outer4.endLine);
    rec.assert('c4_outer_vtable', '外层声明区记录 v_outer',
        outer4.variableTable && outer4.variableTable.has('v_outer'),
        outer4.variableTable ? outer4.variableTable.size : 'no-table');

    // ---- Case 5: 单元结束后的匿名块 ----
    const code5 = [
        'CREATE OR REPLACE PROCEDURE done_p IS',
        'BEGIN',
        '  NULL;',
        'END done_p;',
        '',
        'BEGIN',
        '  NULL;',
        'END;'
    ].join('\n');
    const r5 = await parseOne(code5);
    rec.assert('c5_two_roots', '过程与裸 BEGIN 块都是根节点',
        r5.nodes.length === 2 && r5.nodes[0].type === NodeType.PROCEDURE && r5.nodes[1].type === NodeType.ANONYMOUS_BLOCK,
        r5.nodes.map(n => n.type + ':' + (n.children || []).length).join(','));
    if (r5.nodes.length === 2) {
        rec.assert('c5_not_child', '匿名块不是过程的子节点', r5.nodes[0].children.length === 0, r5.nodes[0].children.length);
    }

    // ---- Case 6: 包体（无初始化块）结束后的裸 BEGIN 块 ----
    const code6 = [
        'CREATE OR REPLACE PACKAGE BODY pb AS',
        '  PROCEDURE inner_p IS',
        '  BEGIN',
        '    NULL;',
        '  END inner_p;',
        'END pb;',
        '',
        'BEGIN',
        '  NULL;',
        'END;'
    ].join('\n');
    const r6 = await parseOne(code6);
    rec.assert('c6_roots', '包体与裸 BEGIN 块都是根节点',
        r6.nodes.length === 2 && r6.nodes[0].type === NodeType.PACKAGE_BODY && r6.nodes[1].type === NodeType.ANONYMOUS_BLOCK,
        r6.nodes.map(n => n.type + ':' + (n.children || []).length).join(','));
    if (r6.nodes.length === 2) {
        const pkg = r6.nodes[0];
        const anon = r6.nodes[1];
        rec.assert('c6_not_pkg_child', '匿名块不是包体的子节点', pkg.children.length === 1, pkg.children.length);
        rec.assert('c6_anon_lines', '匿名块 BEGIN/END 行正确（8/10）',
            anon.beginLine === 8 && anon.endLine === 10, anon.beginLine + '/' + anon.endLine);
        rec.assert('c6_pkg_end', '包体 endLine 正确（第6行）', pkg.endLine === 6, pkg.endLine);
    }

    // ---- Case 7: 回归——方法体内联 DECLARE 块仍为方法子节点 ----
    const code7 = [
        'CREATE OR REPLACE PROCEDURE host_p IS',
        'BEGIN',
        '  DECLARE',
        '    v_inner NUMBER := 1;',
        '  BEGIN',
        '    NULL;',
        '  END;',
        '  NULL;',
        'END host_p;'
    ].join('\n');
    const r7 = await parseOne(code7);
    const proc7 = r7.nodes[0];
    rec.assert('c7_inline_child', '方法体内联 DECLARE 块仍为方法子节点（v1.6.2 行为）',
        r7.nodes.length === 1 && proc7.children.some(c => c.type === NodeType.ANONYMOUS_BLOCK),
        r7.nodes.length + ':' + proc7.children.map(c => c.type).join(','));

    return { suiteName: 'top_level_anon_test', cases: rec.cases };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log('\n=== GMLTest: top_level_anon ===');
        cases.forEach(c => console.log('  ' + (c.passed ? '✓' : '✗') + ' ' + c.name + ': ' + c.desc + (c.passed ? '' : ' [' + c.actual + ']')));
        console.log('\n结果: ' + passed + '/' + cases.length + ' 通过');
        process.exitCode = passed === cases.length ? 0 : 1;
    }).catch(e => { console.error(e); process.exitCode = 1; });
}

module.exports = { run };

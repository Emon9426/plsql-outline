/**
 * GMLTest: 结构关键字令牌级配对测试（Issue #55）
 *
 * 背景：行级状态机只认独占一行的 BEGIN/END（isBeginStatement/isEndStatement 整行
 * 正则），对两类真实世界形态盲视，在大文件中级联破坏大纲：
 *  1. `BEGIN 语句;` 同行 → 计数器不增长 → 成员永不闭合 → 后续成员链式吞为其
 *     嵌套子节点（误现 "Sub Program" 文件夹）；
 *  2. 多行 SQL/PLSQL CASE 表达式的裸 `END` / `END 列别名` 行被误当块 END →
 *     成员提前闭合，endLine/折叠/跳转锚点错位。
 *
 * 覆盖缺口成因：corpus（含 35 文件语料）与全部 unit/regression 套件均为
 * 格式化 PL/SQL——BEGIN/END 独占一行、SQL CASE 的 END 不在行首，行级判定的
 * 盲区从未被测试触及，故缺陷长期未暴露。本套件以压缩/生成代码形态锁定
 * 令牌级配对契约（scanStructuralTokens）。
 *
 * 契约：
 *  - BEGIN/END 不再要求独占整行（同行语句、全一行成员均可闭合）
 *  - CASE 与 END 深度配对：表达式 END（裸 END / END 别名）不动块计数器
 *  - DECLARE 行首令牌放宽（压缩匿名块）
 *  - 嵌套子程序/前置声明/TYPE BODY 成员等既有能力不回归
 */
const { PLSQLParser } = require('../../out/parser');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

async function parseOne(code) {
    return new PLSQLParser().parse(code, 'token_pairing_test.sql', { maxNestingDepth: 15 });
}

/** 统计 level>=3 的子程序数（被误吞为嵌套子程序的成员） */
function countSwallowed(nodes, out = []) {
    for (const n of nodes) {
        if ((n.type === 'FUNCTION' || n.type === 'PROCEDURE') && n.level >= 3) {
            out.push(n.name);
        }
        countSwallowed(n.children, out);
    }
    return out;
}

async function run() {
    const rec = makeRecorder();

    // ---- 1. BEGIN 与语句同行 + 独立 END 行 ----
    const src1 = [
        'CREATE OR REPLACE PACKAGE BODY pkg1 AS',  // 1
        '  PROCEDURE p1 IS',                        // 2
        '  BEGIN NULL; UPDATE t SET x = 1;',        // 3  ← 同行 BEGIN（修复前不可见）
        '    NULL;',                                // 4
        '  END p1;',                                // 5
        '  PROCEDURE p2 IS',                        // 6
        '  BEGIN',                                  // 7
        '    NULL;',                                // 8
        '  END p2;',                                // 9
        'END pkg1;'                                 // 10
    ].join('\n');
    const r1 = await parseOne(src1);
    const pkg1 = r1.nodes[0];
    rec.assert('t1_same_line_begin', '同行 BEGIN 成员正常闭合且 beginLine 指向 BEGIN 行',
        pkg1.children.length === 2 &&
        pkg1.children[0].name === 'p1' && pkg1.children[0].beginLine === 3 && pkg1.children[0].endLine === 5 &&
        pkg1.children[1].name === 'p2' && pkg1.children[1].level === 2,
        JSON.stringify(pkg1.children.map(c => [c.name, c.beginLine, c.endLine, c.level])));

    // ---- 2. 全一行成员 PROCEDURE p IS BEGIN ... END p; ----
    const src2 = [
        'CREATE OR REPLACE PACKAGE BODY pkg2 AS',      // 1
        '  PROCEDURE p1 IS BEGIN NULL; END p1;',       // 2  ← 签名+体全一行
        '  PROCEDURE p2 IS BEGIN NULL; END p2;',       // 3
        'END pkg2;'                                    // 4
    ].join('\n');
    const r2 = await parseOne(src2);
    rec.assert('t2_one_line_member', '全一行成员各自闭合、平铺不嵌套、包体闭合',
        r2.nodes[0].children.length === 2 &&
        r2.nodes[0].children.every(c => c.level === 2 && c.beginLine === c.declarationLine && c.endLine === c.declarationLine) &&
        r2.nodes[0].endLine === 4 && countSwallowed(r2.nodes).length === 0,
        JSON.stringify(r2.nodes[0]));

    // ---- 3. 多行 CASE 表达式：裸 END; 不提前闭合成员 ----
    const src3 = [
        'CREATE OR REPLACE PACKAGE BODY pkg3 AS',  // 1
        '  PROCEDURE p1 IS',                        // 2
        '    v VARCHAR2(10);',                      // 3
        '  BEGIN',                                  // 4
        '    v := CASE',                            // 5
        "           WHEN 1 = 1 THEN 'OK'",          // 6
        "           ELSE 'NO'",                     // 7
        '         END;',                            // 8  ← 表达式 END（修复前误闭成员）
        '    NULL;',                                // 9
        '  END p1;',                                // 10
        '  PROCEDURE p2 IS',                        // 11
        '  BEGIN',                                  // 12
        '    NULL;',                                // 13
        '  END p2;',                                // 14
        'END pkg3;'                                 // 15
    ].join('\n');
    const r3 = await parseOne(src3);
    rec.assert('t3_case_expr_end', 'CASE 表达式 END 不提前闭合（p1@10/p2@14/包体@15）',
        r3.nodes[0].endLine === 15 &&
        r3.nodes[0].children[0].endLine === 10 && r3.nodes[0].children[0].beginLine === 4 &&
        r3.nodes[0].children[1].endLine === 14,
        JSON.stringify(r3.nodes[0].children.map(c => [c.name, c.beginLine, c.endLine])));

    // ---- 4. SELECT CASE ... END 列别名（SQL 形态）----
    const src4 = [
        'CREATE OR REPLACE PACKAGE BODY pkg4 AS',  // 1
        '  PROCEDURE p1 IS',                        // 2
        '    v NUMBER;',                            // 3
        '  BEGIN',                                  // 4
        '    SELECT CASE',                          // 5
        '             WHEN t.a = 1 THEN 1',         // 6
        '             ELSE 0',                      // 7
        '           END status_flag',               // 8  ← END 别名（修复前误闭）
        '      INTO v FROM t_tab t;',               // 9
        '  END p1;',                                // 10
        'END pkg4;'                                 // 11
    ].join('\n');
    const r4 = await parseOne(src4);
    rec.assert('t4_case_alias_end', 'SQL CASE END 别名不动块计数（p1@10/包体@11）',
        r4.nodes[0].children[0].endLine === 10 && r4.nodes[0].endLine === 11,
        JSON.stringify(r4.nodes[0]));

    // ---- 5. 压缩匿名块（DECLARE 行首令牌放宽）----
    const src5 = [
        'DECLARE v NUMBER;',   // 1  ← 声明与块同行
        'BEGIN NULL; END;',    // 2  ← BEGIN 与 END 均同行
        '/'
    ].join('\n');
    const r5 = await parseOne(src5);
    rec.assert('t5_compressed_anon', '压缩匿名块建根节点且闭合（@1/2/2）',
        r5.nodes.length === 1 && r5.nodes[0].type === 'ANONYMOUS_BLOCK' &&
        r5.nodes[0].declarationLine === 1 && r5.nodes[0].beginLine === 2 && r5.nodes[0].endLine === 2,
        JSON.stringify(r5.nodes));

    // ---- 6. 声明区游标 SQL 内的 CASE ... END 不破坏单元 ----
    const src6 = [
        'CREATE OR REPLACE PACKAGE BODY pkg6 AS',      // 1
        '  PROCEDURE p1 IS',                            // 2
        '    CURSOR c1 IS',                             // 3
        '      SELECT CASE WHEN a = 1 THEN 1 ELSE 0',   // 4
        '             END flag FROM t_tab;',           // 5  ← 游标 SQL 的 END 别名
        '  BEGIN',                                      // 6
        '    OPEN c1;',                                 // 7
        '  END p1;',                                    // 8
        'END pkg6;'                                     // 9
    ].join('\n');
    const r6 = await parseOne(src6);
    rec.assert('t6_cursor_sql_case', '游标 SQL 内 CASE END 别名不影响（p1 beginLine=6/endLine=8）',
        r6.nodes[0].children[0].beginLine === 6 && r6.nodes[0].children[0].endLine === 8 &&
        r6.nodes[0].endLine === 9,
        JSON.stringify(r6.nodes[0].children.map(c => [c.name, c.beginLine, c.endLine])));

    // ---- 7. 嵌套 CASE + 同行 CASE（净零）+ 语句 CASE END CASE ----
    const src7 = [
        'CREATE OR REPLACE PACKAGE BODY pkg7 AS',   // 1
        '  PROCEDURE p1 IS',                         // 2
        '    v NUMBER;',                             // 3
        '  BEGIN',                                   // 4
        '    v := CASE WHEN 1 = 1 THEN CASE WHEN 2 = 2 THEN 2 ELSE 3 END ELSE 4 END;',  // 5 ← 同行双 CASE 双 END，净零
        '    v := CASE',                             // 6
        '           WHEN 1 = 1 THEN 1',              // 7
        '         END;',                             // 8
        '    CASE v',                                // 9  ← 语句 CASE
        "      WHEN 1 THEN NULL;",                   // 10
        '    END CASE;',                             // 11 ← END CASE（控制 END）
        '  END p1;',                                 // 12
        'END pkg7;'                                  // 13
    ].join('\n');
    const r7 = await parseOne(src7);
    rec.assert('t7_nested_case_mix', '嵌套/同行/语句 CASE 混排均不动块计数（p1@12/包体@13）',
        r7.nodes[0].children[0].endLine === 12 && r7.nodes[0].endLine === 13,
        JSON.stringify(r7.nodes[0]));

    // ---- 8. 综合大文件：两种缺陷形态混合，成员零误吞 ----
    const L = ['CREATE OR REPLACE PACKAGE BODY big_pkg AS'];
    for (let i = 1; i <= 30; i++) {
        L.push('');
        if (i === 7) {
            L.push(`  PROCEDURE proc_${i} IS`);
            L.push('    v VARCHAR2(10);');
            L.push('  BEGIN');
            L.push('    v := CASE');
            L.push("                   WHEN 1 = 1 THEN 'OK'");
            L.push("                   ELSE 'NO'");
            L.push('                 END;');
            L.push('    NULL;');
            L.push(`  END proc_${i};`);
        } else if (i === 15) {
            L.push(`  PROCEDURE proc_${i} IS`);
            L.push(`  BEGIN NULL; END proc_${i};`);
        } else {
            L.push(`  PROCEDURE proc_${i} IS`);
            L.push('    v_x NUMBER;');
            L.push('  BEGIN');
            L.push('    v_x := 1;');
            L.push(`  END proc_${i};`);
        }
    }
    L.push('');
    L.push('END big_pkg;');
    const r8 = await parseOne(L.join('\n') + '\n');
    const swallowed = countSwallowed(r8.nodes);
    rec.assert('t8_large_mix_zero_swallow', '30 成员混合两种缺陷形态：零成员被误吞为嵌套子程序',
        r8.nodes[0].children.length === 30 && swallowed.length === 0 && r8.nodes[0].endLine === L.length,
        `children=${r8.nodes[0].children.length} swallowed=${JSON.stringify(swallowed)} pkgEnd=${r8.nodes[0].endLine}/${L.length}`);

    // ---- 9. 嵌套子程序（既有能力不回归）：仍按声明区定义嵌套 ----
    const src9 = [
        'CREATE OR REPLACE PACKAGE BODY pkg9 AS',  // 1
        '  PROCEDURE outer IS',                     // 2
        '    PROCEDURE inner IS',                   // 3  ← 真嵌套子程序
        '    BEGIN',                                // 4
        '      NULL;',                              // 5
        '    END inner;',                           // 6
        '  BEGIN',                                  // 7
        '    inner;',                               // 8
        '  END outer;',                             // 9
        'END pkg9;'                                 // 10
    ].join('\n');
    const r9 = await parseOne(src9);
    const outer9 = r9.nodes[0].children[0];
    rec.assert('t9_nested_subprogram_kept', '真嵌套子程序仍嵌套（inner 挂 outer 下 level=3）',
        outer9.name === 'outer' && outer9.children.length === 1 &&
        outer9.children[0].name === 'inner' && outer9.children[0].level === 3 &&
        outer9.endLine === 9,
        JSON.stringify(outer9));

    // ---- 10. 前置声明 + 同名定义原位替换（既有能力不回归）----
    const src10 = [
        'CREATE OR REPLACE PACKAGE BODY pkg10 AS',  // 1
        '  PROCEDURE fwd;',                          // 2  ← 前置声明
        '  PROCEDURE p1 IS',                         // 3
        '  BEGIN',                                   // 4
        '    fwd;',                                  // 5
        '  END p1;',                                 // 6
        '  PROCEDURE fwd IS',                        // 7  ← 同名真实定义
        '  BEGIN NULL; END fwd;',                    // 8  ← 同行 BEGIN
        'END pkg10;'                                 // 9
    ].join('\n');
    const r10 = await parseOne(src10);
    const names10 = r10.nodes[0].children.map(c => c.name);
    rec.assert('t10_forward_decl_replace', '前置声明原位替换且不重复（fwd 定义体@7-8）',
        names10.filter(n => n === 'fwd').length === 1 &&
        r10.nodes[0].children.find(c => c.name === 'fwd').type === 'PROCEDURE' &&
        r10.nodes[0].children.find(c => c.name === 'fwd').endLine === 8,
        JSON.stringify(r10.nodes[0].children.map(c => [c.name, c.type, c.declarationLine, c.endLine])));

    // ---- 11. 子程序内 CASE 深度闭合后，宿主包体 END 正确（帧恢复）----
    const src11 = [
        'CREATE OR REPLACE PACKAGE BODY pkg11 AS',  // 1
        '  PROCEDURE p1 IS',                         // 2
        '  BEGIN',                                   // 3
        '    DECLARE',                               // 4  ← 内联匿名块
        '      l VARCHAR2(10);',                     // 5
        '    BEGIN',                                 // 6
        '      l := CASE WHEN 1 = 1 THEN 1',         // 7
        '               ELSE 0 END;',                // 8  ← 块内表达式 END
        '    END;',                                  // 9  ← 闭匿名块
        '    UPDATE t SET x = 1;',                   // 10
        '  END p1;',                                 // 11
        'END pkg11;'                                 // 12
    ].join('\n');
    const r11 = await parseOne(src11);
    const p11 = r11.nodes[0].children[0];
    const anon11 = p11.children.find(c => c.type === 'ANONYMOUS_BLOCK');
    rec.assert('t11_anon_case_depth_frame', '匿名块内 CASE 深度随帧恢复（匿名块@4-9，p1@11，包体@12）',
        !!anon11 && anon11.declarationLine === 4 && anon11.endLine === 9 &&
        p11.endLine === 11 && r11.nodes[0].endLine === 12,
        JSON.stringify(p11));

    // ---- 12. TYPE BODY 成员方法 + 同行 BEGIN（MEMBER 前缀不回归）----
    const src12 = [
        'CREATE OR REPLACE TYPE BODY t12 AS',      // 1
        '  MEMBER FUNCTION get_val RETURN NUMBER IS',  // 2
        '  BEGIN RETURN 1; END;',                  // 3  ← 同行 BEGIN + 裸 END
        '  MEMBER FUNCTION get_two RETURN NUMBER IS',  // 4
        '  BEGIN',                                 // 5
        '    RETURN 2;',                           // 6
        '  END;',                                  // 7
        'END;'                                     // 8
    ].join('\n');
    const r12 = await parseOne(src12);
    const tb = r12.nodes[0];
    rec.assert('t12_type_body_member', 'TYPE BODY 成员同行 BEGIN 正常闭合（get_val@3、get_two@7）',
        tb.type === 'TYPE_BODY' && tb.children.length === 2 &&
        tb.children[0].name === 'get_val' && tb.children[0].beginLine === 3 && tb.children[0].endLine === 3 &&
        tb.children[1].name === 'get_two' && tb.children[1].endLine === 7,
        JSON.stringify(tb.children.map(c => [c.name, c.beginLine, c.endLine])));

    return { suiteName: 'token_pairing_test', cases: rec.cases };
}

module.exports = { run };

if (require.main === module) {
    run().then(r => {
        for (const c of r.cases) {
            console.log(`  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.desc}${c.passed ? '' : ' — ' + c.actual}`);
        }
        const pass = r.cases.filter(c => c.passed).length;
        console.log(`\n结果: ${pass}/${r.cases.length} 通过`);
        process.exit(pass === r.cases.length ? 0 : 1);
    }).catch(e => { console.error(e); process.exit(1); });
}

/**
 * GMLTest: dbms_metadata.get_ddl 导出源码解析回归测试（Issue #1 / Issue #19）
 *
 * 背景：Oracle 12c+ 的 DBMS_METADATA.GET_DDL 默认输出带有前导修饰词：
 *   CREATE OR REPLACE FORCE EDITIONABLE PACKAGE BODY "APPS"."PKG" AS
 * FORCE（11g 即有）与 EDITIONABLE/NONEDITIONABLE（12c+）此前无法匹配，
 * 包体被误判为顶层匿名块（结构错乱且无提示）、规格解析为 0 节点。
 *
 * 本套件锁定契约：
 *  - FORCE / EDITIONABLE / NONEDITIONABLE 修饰词任意组合均可识别
 *  - 识别出的根类型正确（杜绝此前误判为 ANONYMOUS_BLOCK 的错乱形态）
 *  - TYPE 的名称后置 FORCE 不影响识别
 *  - CRLF 行尾（Windows/实机导出）正确解析
 */
const { PLSQLParser } = require('../../out/parser');
const { NodeType } = require('../../out/types');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

const pkgBody = (header, ender, crlf = false) => {
    const lines = [
        header,
        `    g_flag VARCHAR2(1) := 'N';`,
        `    PROCEDURE p1 IS`,
        `    BEGIN`,
        `        NULL;`,
        `    END p1;`,
        ender
    ];
    return lines.join(crlf ? '\r\n' : '\n');
};

const withForce = (kw) => `CREATE OR REPLACE FORCE EDITIONABLE ${kw} "APPS".`;

async function run() {
    const rec = makeRecorder();

    // ---- Case 1: FORCE + EDITIONABLE 组合 ----
    const r1 = await new PLSQLParser().parse(
        pkgBody('CREATE OR REPLACE FORCE EDITIONABLE PACKAGE BODY "APPS"."XXCUST_TEST_PKG" AS', 'END "XXCUST_TEST_PKG";'),
        'x.pck');
    const root1 = r1.nodes[0];
    rec.assert('c1_pkg_body', 'get_ddl 包体识别为 PACKAGE_BODY（不再是误判的 ANONYMOUS_BLOCK）',
        !!root1 && root1.type === NodeType.PACKAGE_BODY && root1.name === 'XXCUST_TEST_PKG',
        root1 ? `${root1.type}:${root1.name}` : '(无)');
    rec.assert('c1_closed', 'get_ddl 包体完整闭合、成员完整',
        !!root1 && root1.endLine != null &&
        root1.children.some(c => c.type === NodeType.PROCEDURE && c.name === 'p1' && c.endLine != null),
        root1 ? `end=${root1.endLine}` : 'no root');

    const r2 = await new PLSQLParser().parse(
        'CREATE OR REPLACE FORCE EDITIONABLE PACKAGE "APPS"."XX_PKG" AS\r\n    PROCEDURE p1;\r\nEND "XX_PKG";',
        'x.pck');
    rec.assert('c2_pkg_spec', 'get_ddl 包规格识别为 PACKAGE_HEADER（CRLF）',
        !!r2.nodes[0] && r2.nodes[0].type === NodeType.PACKAGE_HEADER && r2.nodes[0].name === 'XX_PKG',
        r2.nodes[0] ? `${r2.nodes[0].type}:${r2.nodes[0].name}` : '(无)');

    const r3 = await new PLSQLParser().parse(
        'CREATE OR REPLACE FORCE EDITIONABLE PROCEDURE "APPS"."P1" IS\r\nBEGIN\r\n    NULL;\r\nEND "P1";',
        'x.prc');
    const root3 = r3.nodes[0];
    rec.assert('c3_procedure', 'get_ddl 过程识别为 PROCEDURE（CRLF）',
        !!root3 && root3.type === NodeType.PROCEDURE && root3.name === 'P1' && root3.endLine != null,
        root3 ? `${root3.type}:${root3.name}` : '(无)');

    const r4 = await new PLSQLParser().parse(
        'CREATE OR REPLACE FORCE EDITIONABLE FUNCTION "APPS"."F1" RETURN NUMBER IS\r\nBEGIN\r\n    RETURN 1;\r\nEND "F1";',
        'x.fnc');
    const root4 = r4.nodes[0];
    rec.assert('c4_function', 'get_ddl 函数识别为 FUNCTION',
        !!root4 && root4.type === NodeType.FUNCTION && root4.name === 'F1',
        root4 ? `${root4.type}:${root4.name}` : '(无)');

    const r5 = await new PLSQLParser().parse(
        'CREATE OR REPLACE FORCE EDITIONABLE TRIGGER "APPS"."TRG1" BEFORE INSERT ON t1 FOR EACH ROW\r\nBEGIN\r\n    NULL;\r\nEND;',
        'x.trg');
    rec.assert('c5_trigger', 'get_ddl 触发器识别为 TRIGGER',
        !!r5.nodes[0] && r5.nodes[0].type === NodeType.TRIGGER && r5.nodes[0].name === 'TRG1',
        r5.nodes[0] ? `${r5.nodes[0].type}:${r5.nodes[0].name}` : '(无)');

    // ---- Case 6: TYPE 的名称后置 FORCE（get_ddl 特有形态）----
    const r6 = await new PLSQLParser().parse(
        'CREATE OR REPLACE FORCE NONEDITIONABLE TYPE "APPS"."T1" FORCE AS OBJECT(\r\n    id NUMBER\r\n) NOT FINAL;',
        'x.typ');
    rec.assert('c6_type_trailing_force', 'TYPE 前导 FORCE/NONEDITIONABLE + 名称后置 FORCE 均识别',
        !!r6.nodes[0] && r6.nodes[0].type === NodeType.TYPE && r6.nodes[0].name === 'T1',
        r6.nodes[0] ? `${r6.nodes[0].type}:${r6.nodes[0].name}` : '(无)');

    const r7 = await new PLSQLParser().parse(
        'CREATE OR REPLACE FORCE EDITIONABLE VIEW "APPS"."V1" AS SELECT id FROM t1',
        'x.sql');
    rec.assert('c7_view', 'get_ddl 视图识别为 VIEW',
        !!r7.nodes[0] && r7.nodes[0].type === NodeType.VIEW && r7.nodes[0].name === 'V1',
        r7.nodes[0] ? `${r7.nodes[0].type}:${r7.nodes[0].name}` : '(无)');

    // ---- Case 8: 修饰词独立可选 ----
    const r8a = await new PLSQLParser().parse(
        pkgBody('CREATE OR REPLACE FORCE PACKAGE BODY APPS.P1 AS', 'END P1;'), 'a.pkb');
    rec.assert('c8_force_only', '仅 FORCE（无 EDITIONABLE）可识别',
        !!r8a.nodes[0] && r8a.nodes[0].type === NodeType.PACKAGE_BODY && r8a.nodes[0].name === 'P1',
        r8a.nodes[0] ? `${r8a.nodes[0].type}:${r8a.nodes[0].name}` : '(无)');

    const r8b = await new PLSQLParser().parse(
        pkgBody('CREATE OR REPLACE EDITIONABLE PACKAGE BODY APPS.P1 AS', 'END P1;'), 'a.pkb');
    rec.assert('c8_editionable_only', '仅 EDITIONABLE（无 FORCE）可识别',
        !!r8b.nodes[0] && r8b.nodes[0].type === NodeType.PACKAGE_BODY && r8b.nodes[0].name === 'P1',
        r8b.nodes[0] ? `${r8b.nodes[0].type}:${r8b.nodes[0].name}` : '(无)');

    const r8c = await new PLSQLParser().parse(
        pkgBody('CREATE OR REPLACE NONEDITIONABLE PACKAGE BODY APPS.P1 AS', 'END P1;'), 'a.pkb');
    rec.assert('c8_noneditionable_only', '仅 NONEDITIONABLE 可识别',
        !!r8c.nodes[0] && r8c.nodes[0].type === NodeType.PACKAGE_BODY && r8c.nodes[0].name === 'P1',
        r8c.nodes[0] ? `${r8c.nodes[0].type}:${r8c.nodes[0].name}` : '(无)');

    // ---- Case 9: CRLF 完整回归（实机导出文件行尾）----
    const r9 = await new PLSQLParser().parse(
        pkgBody('CREATE OR REPLACE FORCE EDITIONABLE PACKAGE BODY "APPS"."XXCUST_TEST_PKG" AS', 'END "XXCUST_TEST_PKG";', true),
        'x.pck');
    rec.assert('c9_crlf', 'CRLF 行尾完整解析（闭合 + 成员 + 无警告）',
        !!r9.nodes[0] && r9.nodes[0].endLine != null &&
        r9.metadata.errors.length === 0 && r9.metadata.warnings.length === 0,
        r9.nodes[0] ? `end=${r9.nodes[0].endLine}` : '(无)');

    // ---- Case 10: 旧形态回归（无修饰词不受影响）----
    const r10 = await new PLSQLParser().parse(
        pkgBody('CREATE OR REPLACE PACKAGE BODY XXCUST_TEST_PKG AS', 'END XXCUST_TEST_PKG;'), 'x.pck');
    rec.assert('c10_legacy_form', '无修饰词的旧形态不受影响',
        !!r10.nodes[0] && r10.nodes[0].type === NodeType.PACKAGE_BODY && r10.nodes[0].name === 'XXCUST_TEST_PKG',
        r10.nodes[0] ? `${r10.nodes[0].type}:${r10.nodes[0].name}` : '(无)');

    return { suiteName: 'get_ddl_test', cases: rec.cases, parseTime: 0 };
}

module.exports = { run };

/**
 * GMLTest: 带引号标识符解析回归测试（Issue #18，承接 PR #2 场景）
 *
 * 背景：.pck（Package Complete，spec+body 二合一）文件中包名为
 * "APPS"."XXCUST_TEST_PKG" 带引号形态，此前 CREATE 正则用 \w+ 匹配不到，
 * 大纲静默为空（metadata.errors 为空，用户无从知晓原因）。
 *
 * 本套件锁定契约：
 *  - CREATE 四种形态（引号/schema 组合）均能识别，名称去引号
 *  - END "别名" 引号形态能正常闭合包体
 *  - 真实 .pck 语料（spec+body 双根）完整解析
 *  - 内容含 CREATE 但 0 节点时产生 warning（静默失败修复），正常文件不误报
 */
const { PLSQLParser } = require('../../out/parser');
const { NodeType } = require('../../out/types');
const fs = require('fs');
const path = require('path');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

const FORMS = {
    '引号 schema 前缀': 'CREATE OR REPLACE PACKAGE BODY "APPS"."XXCUST_TEST_PKG" AS',
    '引号无 schema': 'CREATE OR REPLACE PACKAGE BODY "XXCUST_TEST_PKG" AS',
    'schema 无引号': 'CREATE OR REPLACE PACKAGE BODY APPS.XXCUST_TEST_PKG AS',
    '简单名': 'CREATE OR REPLACE PACKAGE BODY XXCUST_TEST_PKG AS'
};

function pkgBody(header, ender) {
    return [
        header,
        `    g_flag VARCHAR2(1) := 'N';`,
        `    PROCEDURE p1 IS`,
        `    BEGIN`,
        `        NULL;`,
        `    END p1;`,
        ender
    ].join('\n');
}

async function run() {
    const rec = makeRecorder();

    // ---- Case 1: 四种 CREATE 形态 ----
    let i = 0;
    for (const [label, header] of Object.entries(FORMS)) {
        i++;
        const ender = label.startsWith('引号') ? 'END "XXCUST_TEST_PKG";' : 'END XXCUST_TEST_PKG;';
        const r = await new PLSQLParser().parse(pkgBody(header, ender), 'x.pck');
        const root = r.nodes[0];
        const p1 = root ? root.children.find(c => c.type === NodeType.PROCEDURE) : null;
        rec.assert(`c1_form_${i}`, `包体（${label}）识别为 PACKAGE_BODY 且名称去引号`,
            !!root && root.type === NodeType.PACKAGE_BODY && root.name === 'XXCUST_TEST_PKG',
            root ? `${root.type}:${root.name}` : '(无)');
        rec.assert(`c1_form_${i}_closed`, `包体（${label}）经 END 正常闭合且成员完整`,
            !!root && root.endLine != null && !!p1 && p1.endLine != null && r.metadata.errors.length === 0,
            root ? `end=${root.endLine} p1end=${p1 ? p1.endLine : 'x'}` : 'no root');
    }

    // ---- Case 2: 包规格与 FUNCTION/PROCEDURE/TRIGGER 引号形态 ----
    const spec = await new PLSQLParser().parse(
        'CREATE OR REPLACE PACKAGE "APPS"."XX_PKG" AS\n    PROCEDURE p1; \nEND "XX_PKG";', 's.pck');
    rec.assert('c2_spec_quoted', '包规格引号形态识别为 PACKAGE_HEADER',
        !!spec.nodes[0] && spec.nodes[0].type === NodeType.PACKAGE_HEADER && spec.nodes[0].name === 'XX_PKG',
        spec.nodes[0] ? `${spec.nodes[0].type}:${spec.nodes[0].name}` : '(无)');

    const fn = await new PLSQLParser().parse(
        'CREATE OR REPLACE FUNCTION "APPS"."calc_total" RETURN NUMBER IS\nBEGIN\n    RETURN 1;\nEND "calc_total";', 'f.pck');
    rec.assert('c2_function_quoted', '函数引号形态（含小写与 $ 场景基础）识别正确',
        !!fn.nodes[0] && fn.nodes[0].type === NodeType.FUNCTION && fn.nodes[0].name === 'calc_total',
        fn.nodes[0] ? `${fn.nodes[0].type}:${fn.nodes[0].name}` : '(无)');

    const trg = await new PLSQLParser().parse(
        'CREATE OR REPLACE TRIGGER "APPS"."trg_bi" BEFORE INSERT ON t1 FOR EACH ROW\nBEGIN\n    NULL;\nEND;', 't.pck');
    rec.assert('c2_trigger_quoted', '触发器引号形态识别正确',
        !!trg.nodes[0] && trg.nodes[0].type === NodeType.TRIGGER && trg.nodes[0].name === 'trg_bi',
        trg.nodes[0] ? `${trg.nodes[0].type}:${trg.nodes[0].name}` : '(无)');

    // ---- Case 3: 真实 .pck 语料（spec + body 双根，APP 环境 201 行）----
    const pckPath = path.join(__dirname, '..', 'corpus', 'package_complete', 'XXCUST_TEST_PKG.pck');
    const pckSrc = fs.readFileSync(pckPath, 'utf8');
    const r3 = await new PLSQLParser().parse(pckSrc, 'XXCUST_TEST_PKG.pck');
    const header = r3.nodes.find(n => n.type === NodeType.PACKAGE_HEADER);
    const body = r3.nodes.find(n => n.type === NodeType.PACKAGE_BODY);
    rec.assert('c3_spec_root', '语料 spec 根：PACKAGE_HEADER/XXCUST_TEST_PKG（引号去净）',
        !!header && header.name === 'XXCUST_TEST_PKG',
        header ? `${header.type}:${header.name}` : '(无)');
    rec.assert('c3_body_root', '语料 body 根：PACKAGE_BODY/XXCUST_TEST_PKG 完整闭合',
        !!body && body.name === 'XXCUST_TEST_PKG' && body.endLine != null,
        body ? `end=${body.endLine}` : '(无)');
    const memberNames = body ? body.children.filter(c => c.type === NodeType.PROCEDURE || c.type === NodeType.FUNCTION).map(c => c.name.toLowerCase()) : [];
    rec.assert('c3_members', '语料 body 六个成员全部识别（Main/Output/Log/Get_Msg/Set_Msg/Process_Request）',
        ['main', 'output', 'log', 'get_msg', 'set_msg', 'process_request'].every(m => memberNames.includes(m)),
        memberNames.join(',') || '(无)');
    rec.assert('c3_no_errors', '语料解析零错误零警告',
        r3.metadata.errors.length === 0 && r3.metadata.warnings.length === 0,
        `err=${r3.metadata.errors.length} warn=${r3.metadata.warnings.length}`);

    // ---- Case 4: 静默失败修复——CREATE 存在但 0 节点 → warning ----
    const empty = await new PLSQLParser().parse('CREATE OR REPLACE LIBRARY some_lib', 'lib.pck');
    rec.assert('c4_warning_emitted', 'CREATE 无法识别为程序单元时产生 warning（不再静默空白）',
        r3_w0(empty), `warn=${empty.metadata.warnings.length}`);
    const normal = await new PLSQLParser().parse(pkgBody(FORMS['简单名'], 'END XXCUST_TEST_PKG;'), 'x.pck');
    rec.assert('c4_no_false_positive', '正常文件不误报 warning',
        normal.metadata.warnings.length === 0, `warn=${normal.metadata.warnings.length}`);
    const noCreate = await new PLSQLParser().parse('SELECT 1 FROM dual;', 'q.sql');
    rec.assert('c4_plain_sql_no_warn', '纯 SQL 脚本（无 CREATE）不误报 warning',
        noCreate.metadata.warnings.length === 0, `warn=${noCreate.metadata.warnings.length}`);

    function r3_w0(r) { return r.nodes.length === 0 && r.metadata.warnings.length === 1; }

    return { suiteName: 'quoted_identifier_test', cases: rec.cases, parseTime: 0 };
}

module.exports = { run };

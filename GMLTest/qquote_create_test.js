/**
 * GMLTest: Q-quote 字符串 + CREATE TYPE/VIEW + 真实代码鲁棒性测试
 *
 * 验证 v1.6.0 修复：
 *  1. Q-quote 替代引用（q 方括号、q 大括号、q 圆括号、nq）含双横线与斜杠星号时不破坏解析
 *  2. 多行长签名 CREATE（多于5行参数）不再被丢弃
 *  3. CREATE TYPE、TYPE BODY、VIEW 被识别为程序单元
 *  4. 带标签的 END IF 标签、END LOOP 标签 不误关闭节点
 *
 * 根因（用户截图）：Q-quote 不支持导致字符串内注释标记被当注释剥离，删真实代码，大纲塌陷
 */
const path = require('path');
const fs = require('fs');

const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class { constructor(l, c) { this.label = l; this.collapsibleState = c; } },
    ThemeIcon: class { constructor(id) { this.id = id; } },
    EventEmitter: class { constructor() { this.l = []; } event(x) { this.l.push(x); return { dispose() {} }; } fire(d) { this.l.forEach(x => x(d)); } dispose() { this.l = []; } },
    workspace: { getConfiguration: () => ({ get: (k, d) => d }), fs: {}, createFileSystemWatcher: () => ({ onDidCreate() {}, onDidChange() {}, onDidDelete() {}, dispose() {} }) },
    window: { createOutputChannel: () => ({ appendLine() {}, dispose() {} }), createTreeView: () => ({ visible: true, reveal() {}, onDidChangeVisibility() {}, dispose() {} }), showQuickPick: async () => undefined, showInformationMessage() {}, showWarningMessage() {}, showErrorMessage() {} },
    commands: { registerCommand: () => ({ dispose() {} }) },
    RelativePattern: class { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f, toString: () => f }) },
    Position: class { constructor(l, c) { this.line = l; this.character = c; } },
    Location: class { constructor(u, r) { this.uri = u; this.range = r; } },
    Range: class { constructor(s, e) { this.start = s; this.end = e; } },
    MarkdownString: class { constructor(s) { this.value = s; } },
    Hover: class { constructor(c, r) { this.contents = c; this.range = r; } },
    ViewColumn: { One: 1, Two: 2, Beside: -2 }
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (r) { if (r === 'vscode') return 'vscode_mock'; return originalResolve.apply(this, arguments); };
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../out/parser');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

async function parse(parser, src, file) {
    return parser.parse(src, file);
}

async function run() {
    const rec = makeRecorder();
    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);

    // ===== 1. Q-quote 字符串不破坏解析 =====
    console.log('--- Q-quote 字符串 ---');
    const qpkg = `CREATE OR REPLACE PACKAGE BODY qtest IS
  PROCEDURE run_dyn(p_tn IN VARCHAR2) IS
    v_count NUMBER;
    v_sql   VARCHAR2(4000);
  BEGIN
    v_sql := q'[-- dynamic comment
    SELECT COUNT(*) FROM all_tables WHERE table_name = :tn /* inline */]';
    EXECUTE IMMEDIATE v_sql INTO v_count USING p_tn;
    IF v_count > 0 THEN
      v_count := 1;
    END IF;
  END run_dyn;

  FUNCTION build_msg(p_name IN VARCHAR2) RETURN VARCHAR2 IS
  BEGIN
    RETURN q'{Hello, "world" -- not a comment}';
  END build_msg;
END qtest;
/`;
    const t0 = Date.now();
    const qr = await parse(parser, qpkg, 'qtest.pkb');
    const qtime = Date.now() - t0;
    rec.assert('qquote_parse_clean', 'Q-quote 包解析零错误', qr.metadata.errors.length === 0, `errors=${qr.metadata.errors.length} ${JSON.stringify(qr.metadata.errors)}`);
    rec.assert('qquote_root', 'Q-quote 包根 qtest 闭合', qr.nodes[0] && qr.nodes[0].name === 'qtest' && qr.nodes[0].endLine != null, qr.nodes[0] && qr.nodes[0].name);
    const runDyn = qr.nodes[0] && qr.nodes[0].children.find(c => c.name === 'run_dyn');
    rec.assert('qquote_proc_closed', 'run_dyn 过程闭合（END 未被误删）', runDyn && runDyn.endLine != null, runDyn && runDyn.endLine);
    rec.assert('qquote_if_survives', 'run_dyn 内 IF 控制结构存活（代码未被注释剥离删除）',
        runDyn && runDyn.children.some(c => c.type === 'IF_STATEMENT'), runDyn && runDyn.children.map(c => c.type).join(','));
    const buildMsg = qr.nodes[0] && qr.nodes[0].children.find(c => c.name === 'build_msg');
    rec.assert('qquote_func_closed', 'build_msg 函数闭合', buildMsg && buildMsg.endLine != null, buildMsg && buildMsg.endLine);
    rec.assert('qquote_perf', 'Q-quote 包解析 < 200ms', qtime < 200, `${qtime}ms`);

    // ===== 2. 多行长签名 CREATE（>5 行参数）不被丢弃 =====
    console.log('--- 多行长签名 CREATE ---');
    const longSig = `CREATE OR REPLACE FUNCTION very_long_signature(
    p_param_01 IN VARCHAR2,
    p_param_02 IN NUMBER,
    p_param_03 IN DATE,
    p_param_04 IN OUT CLOB,
    p_param_05 IN BOOLEAN DEFAULT FALSE,
    p_param_06 IN VARCHAR2 DEFAULT 'x',
    p_param_07 IN NUMBER DEFAULT 0
) RETURN NUMBER
DETERMINISTIC
IS
    v_result NUMBER := 0;
BEGIN
    RETURN v_result;
END very_long_signature;
/`;
    const lr = await parse(parser, longSig, 'longsig.fnc');
    rec.assert('longsig_parse_clean', '长签名函数解析零错误', lr.metadata.errors.length === 0, `errors=${lr.metadata.errors.length}`);
    rec.assert('longsig_recognized', '长签名 CREATE 被识别为 FUNCTION（非丢弃）',
        lr.nodes[0] && lr.nodes[0].type === 'FUNCTION' && lr.nodes[0].name === 'very_long_signature',
        lr.nodes[0] && lr.nodes[0].type + '/' + (lr.nodes[0] && lr.nodes[0].name));
    rec.assert('longsig_closed', '长签名函数闭合', lr.nodes[0] && lr.nodes[0].endLine != null, lr.nodes[0] && lr.nodes[0].endLine);

    // ===== 3. CREATE TYPE / TYPE BODY / VIEW =====
    console.log('--- CREATE TYPE / TYPE BODY / VIEW ---');
    const typeSrc = `CREATE OR REPLACE TYPE address_t AS OBJECT (
    street VARCHAR2(200),
    city   VARCHAR2(100)
);
/`;
    const tr = await parse(parser, typeSrc, 'address.tps');
    rec.assert('type_recognized', 'CREATE TYPE 被识别为 TYPE 节点',
        tr.nodes[0] && tr.nodes[0].type === 'TYPE' && tr.nodes[0].name === 'address_t',
        tr.nodes[0] && tr.nodes[0].type);

    const typeBodySrc = `CREATE OR REPLACE TYPE BODY address_t IS
    MEMBER FUNCTION full_addr RETURN VARCHAR2 IS
    BEGIN
        RETURN SELF.street || ', ' || SELF.city;
    END;
END;
/`;
    const tbr = await parse(parser, typeBodySrc, 'address.tpb');
    rec.assert('typebody_recognized', 'CREATE TYPE BODY 被识别为 TYPE_BODY 节点',
        tbr.nodes[0] && tbr.nodes[0].type === 'TYPE_BODY' && tbr.nodes[0].name === 'address_t',
        tbr.nodes[0] && tbr.nodes[0].type);
    rec.assert('typebody_member_func', 'TYPE BODY 内 MEMBER FUNCTION 被识别',
        tbr.nodes[0] && tbr.nodes[0].children.some(c => c.name === 'full_addr'),
        tbr.nodes[0] && tbr.nodes[0].children.map(c => c.name).join(','));

    const viewSrc = `CREATE OR REPLACE VIEW active_orders_v AS
    SELECT id, status FROM orders WHERE status = 'ACTIVE';
/`;
    const vr = await parse(parser, viewSrc, 'active_orders.sql');
    rec.assert('view_recognized', 'CREATE VIEW 被识别为 VIEW 节点（非丢弃）',
        vr.nodes[0] && vr.nodes[0].type === 'VIEW' && vr.nodes[0].name === 'active_orders_v',
        vr.nodes[0] && vr.nodes[0].type);

    // ===== 4. 带标签的 END IF lbl; / END LOOP lbl; 不误关闭节点 =====
    console.log('--- 带标签的 END ---');
    const labeledSrc = `CREATE OR REPLACE PROCEDURE labeled_test(p IN NUMBER) IS
BEGIN
    <<outer_loop>>
    FOR i IN 1..10 LOOP
        <<inner_if>>
        IF i > p THEN
            EXIT outer_loop;
        END IF inner_if;
    END LOOP outer_loop;
END labeled_test;
/`;
    const labr = await parse(parser, labeledSrc, 'labeled.prc');
    rec.assert('labeled_parse_clean', '带标签 END 解析零错误', labr.metadata.errors.length === 0, `errors=${labr.metadata.errors.length}`);
    const labProc = labr.nodes[0];
    rec.assert('labeled_proc_closed', '带标签过程正确闭合（END IF lbl/END LOOP lbl 未误关闭节点）',
        labProc && labProc.endLine != null, labProc && labProc.endLine);

    // ===== 5. 字符串内含 -- 与 /* 的标准字符串（回归保护）=====
    console.log('--- 标准字符串含注释标记 ---');
    const stdStrSrc = `CREATE OR REPLACE PROCEDURE std_str_test IS
    v_s VARCHAR2(100);
BEGIN
    v_s := 'this -- is not a comment';
    v_s := 'this /* is not a comment */ either';
END std_str_test;
/`;
    const ssr = await parse(parser, stdStrSrc, 'stdstr.prc');
    rec.assert('stdstr_parse_clean', '标准字符串含 -- /* 解析零错误', ssr.metadata.errors.length === 0, `errors=${ssr.metadata.errors.length}`);
    rec.assert('stdstr_closed', '标准字符串过程闭合', ssr.nodes[0] && ssr.nodes[0].endLine != null, ssr.nodes[0] && ssr.nodes[0].endLine);

    return { suiteName: 'qquote_create_test', cases: rec.cases, parseTime: qtime };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log(`\n=== GMLTest: qquote_create ===`);
        cases.forEach(c => console.log(`  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.desc}${c.passed ? '' : ' [' + c.actual + ']'}`));
        console.log(`\n结果: ${passed}/${cases.length} 通过`);
        process.exit(passed === cases.length ? 0 : 1);
    }).catch(err => { console.error('测试异常:', err); process.exit(1); });
}

module.exports = { run };

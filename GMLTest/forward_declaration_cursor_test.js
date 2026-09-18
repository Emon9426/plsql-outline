/**
 * GMLTest: 前置声明幽灵节点 + 不连续游标 + 游标声明形式扩展
 *
 * 验证 v1.6.4 修复：
 *  1. 声明区夹有前置声明（PROCEDURE/FUNCTION ... ; 无 IS/AS 体）时，
 *     不再创建"幽灵节点"导致其后的游标（C4/C5）丢失或错位
 *  2. 前置声明显示为声明节点，同名真实定义出现时原位替换（合并，不重复）
 *  3. 游标声明支持 RETURN 子句（CURSOR c RETURN t%ROWTYPE IS）
 *  4. 游标参数支持嵌套括号（VARCHAR2(10)）
 *  5. 游标参数跨行（CURSOR name ( ... ) IS）
 *  6. 对照回归：变量/TYPE/完整嵌套过程穿插不破坏游标归属；Package Header 行为不变
 *
 * 根因（用户报告）：C1 C2 C3 [其他代码] C4 C5 只识别 C1-C3 和 C4/C5 的部分。
 * "其他代码"中的前置声明让 handleSubFunctionProcedure 切换 currentActiveNode 到
 * 一个永不闭合的节点，C4/C5 被记入该幽灵节点的 variableTable。
 */
const { PLSQLParser } = require('../out/parser');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

/** 收集指定节点下所有 category=CURSOR 的声明项（含子孙节点，用于检测游标是否被劫持） */
function collectCursorsEverywhere(nodes, bag) {
    for (const n of nodes) {
        if (n.variableTable) {
            for (const v of n.variableTable.values()) {
                if (v.category === 'cursor') { bag.push({ owner: n, v }); }
            }
        }
        collectCursorsEverywhere(n.children || [], bag);
    }
    return bag;
}

async function run() {
    const rec = makeRecorder();
    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    const t0 = Date.now();

    // ===== 1. 包体：C1-C3 + 单行前置声明 + 变量 + C4/C5 =====
    console.log('--- 包体：单行前置声明 ---');
    const pkgSrc = `CREATE OR REPLACE PACKAGE BODY test_pkg AS
  CURSOR c1 IS SELECT * FROM emp;
  CURSOR c2 IS SELECT * FROM dept;
  CURSOR c3 IS SELECT * FROM bonus;

  PROCEDURE helper(p_num IN NUMBER);   -- 前置声明（无 IS/BEGIN 体）

  v_count NUMBER;
  CURSOR c4 IS SELECT * FROM sal;
  CURSOR c5 IS SELECT * FROM job;

  PROCEDURE helper(p_num IN NUMBER) IS
  BEGIN
    NULL;
  END helper;
END test_pkg;
/`;
    const pr = await parser.parse(pkgSrc, 'test_pkg.pkb');
    const pkg = pr.nodes.find(n => n.name === 'test_pkg');
    rec.assert('pkg_root_ok', '包根节点解析成功且零错误', !!pkg && pr.metadata.errors.length === 0,
        `errors=${JSON.stringify(pr.metadata.errors)}`);
    const pkgCursors = pkg && pkg.variableTable
        ? Array.from(pkg.variableTable.values()).filter(v => v.category === 'cursor').map(v => v.name)
        : [];
    rec.assert('pkg_all_cursors', '包体声明区 5 个游标全部归属包节点（C1-C5 无丢失）',
        ['c1', 'c2', 'c3', 'c4', 'c5'].every(c => pkgCursors.includes(c)), pkgCursors.join(','));
    const helpers = pkg ? pkg.children.filter(c => c.name === 'helper') : [];
    rec.assert('pkg_helper_merged', 'helper 只出现一个节点且为真实定义（前置声明已合并）',
        helpers.length === 1 && helpers[0].type === 'PROCEDURE' && helpers[0].beginLine != null,
        helpers.map(h => h.type + '@' + h.declarationLine).join(','));
    rec.assert('pkg_no_ghost_hijack', '无幽灵节点持有游标（所有游标 scope 均为包）',
        collectCursorsEverywhere(pr.nodes, []).every(x => x.owner.name === 'test_pkg'),
        collectCursorsEverywhere(pr.nodes, []).map(x => x.v.name + '->' + x.owner.name).join(','));

    // ===== 2. 独立过程：FUNCTION 前置声明穿插 =====
    console.log('--- 独立过程：FUNCTION 前置声明 ---');
    const procSrc = `CREATE OR REPLACE PROCEDURE outer_proc AS
  CURSOR c1 IS SELECT * FROM t1;
  CURSOR c2 IS SELECT * FROM t2;
  CURSOR c3 IS SELECT * FROM t3;

  FUNCTION sub_f RETURN NUMBER;        -- 前置声明

  CURSOR c4 IS SELECT * FROM t4;
  CURSOR c5 IS SELECT * FROM t5;

  FUNCTION sub_f RETURN NUMBER IS
  BEGIN
    RETURN 1;
  END sub_f;
BEGIN
  NULL;
END outer_proc;
/`;
    const or_ = await parser.parse(procSrc, 'outer_proc.prc');
    const outer = or_.nodes.find(n => n.name === 'outer_proc');
    const outerCursors = outer && outer.variableTable
        ? Array.from(outer.variableTable.values()).filter(v => v.category === 'cursor').map(v => v.name)
        : [];
    rec.assert('proc_all_cursors', '独立过程：5 个游标全部归属外层过程',
        ['c1', 'c2', 'c3', 'c4', 'c5'].every(c => outerCursors.includes(c)), outerCursors.join(','));
    const subfs = outer ? outer.children.filter(c => c.name === 'sub_f') : [];
    rec.assert('proc_subf_merged', 'sub_f 只出现一个节点且为真实定义',
        subfs.length === 1 && subfs[0].type === 'FUNCTION' && subfs[0].beginLine != null,
        subfs.map(h => h.type + '@' + h.declarationLine).join(','));
    rec.assert('proc_closed', '外层过程正常闭合（树未被幽灵节点破坏）',
        outer && outer.endLine != null, outer && outer.endLine);

    // ===== 3. 多行签名前置声明 =====
    console.log('--- 多行签名前置声明 ---');
    const multiDeclSrc = `CREATE OR REPLACE PACKAGE BODY multi_pkg AS
  CURSOR c1 IS SELECT * FROM m1;
  CURSOR c2 IS SELECT * FROM m2;

  PROCEDURE big_helper(
    p_a IN NUMBER,
    p_b IN VARCHAR2
  );                                  -- 多行签名前置声明

  CURSOR c3 IS SELECT * FROM m3;
  CURSOR c4 IS SELECT * FROM m4;

  PROCEDURE big_helper(
    p_a IN NUMBER,
    p_b IN VARCHAR2
  ) IS
  BEGIN
    NULL;
  END big_helper;
END multi_pkg;
/`;
    const mr = await parser.parse(multiDeclSrc, 'multi_pkg.pkb');
    const mpkg = mr.nodes.find(n => n.name === 'multi_pkg');
    const mCursors = mpkg && mpkg.variableTable
        ? Array.from(mpkg.variableTable.values()).filter(v => v.category === 'cursor').map(v => v.name)
        : [];
    rec.assert('multiline_fwd_cursors', '多行签名前置声明：4 个游标全部归属包节点',
        ['c1', 'c2', 'c3', 'c4'].every(c => mCursors.includes(c)), mCursors.join(','));
    const bigHelpers = mpkg ? mpkg.children.filter(c => c.name === 'big_helper') : [];
    rec.assert('multiline_fwd_merged', 'big_helper 只出现一个节点（多行声明同样合并）',
        bigHelpers.length === 1 && bigHelpers[0].type === 'PROCEDURE',
        bigHelpers.map(h => h.type).join(','));

    // ===== 4. 声明节点可见（定义未到达时） =====
    console.log('--- 声明节点（定义未到达） ---');
    const declOnlySrc = `CREATE OR REPLACE PACKAGE BODY decl_pkg AS
  PROCEDURE not_yet_defined(p IN NUMBER);   -- 只有前置声明

  CURSOR c1 IS SELECT * FROM d1;
END decl_pkg;
/`;
    const dr = await parser.parse(declOnlySrc, 'decl_pkg.pkb');
    const dpkg = dr.nodes.find(n => n.name === 'decl_pkg');
    const declNodes = dpkg ? dpkg.children.filter(c => c.name === 'not_yet_defined') : [];
    rec.assert('decl_node_visible', '仅有前置声明时显示为声明节点（PROCEDURE_DECLARATION）',
        declNodes.length === 1 && declNodes[0].type === 'PROCEDURE_DECLARATION',
        declNodes.map(d => d.type).join(','));
    const dCursors = dpkg && dpkg.variableTable
        ? Array.from(dpkg.variableTable.values()).filter(v => v.category === 'cursor').map(v => v.name)
        : [];
    rec.assert('decl_node_no_hijack', '声明节点不劫持后续游标（c1 仍归属包）',
        dCursors.includes('c1'), dCursors.join(','));

    // ===== 5. 游标声明形式扩展 =====
    console.log('--- 游标声明形式扩展 ---');
    const cursorFormsSrc = `CREATE OR REPLACE PROCEDURE cursor_forms AS
  CURSOR c_return IS SELECT * FROM emp WHERE ROWNUM = 1;
  CURSOR c_rowtype RETURN emp%ROWTYPE IS SELECT * FROM emp;
  CURSOR c_nested(p_status VARCHAR2(10)) IS SELECT * FROM orders WHERE status = p_status;
  CURSOR c_multi(
    p_from DATE,
    p_to   DATE
  ) IS SELECT * FROM audit WHERE created BETWEEN p_from AND p_to;
BEGIN
  NULL;
END cursor_forms;
/`;
    const cfr = await parser.parse(cursorFormsSrc, 'cursor_forms.prc');
    const cfp = cfr.nodes.find(n => n.name === 'cursor_forms');
    const cfCursors = cfp && cfp.variableTable
        ? Array.from(cfp.variableTable.values()).filter(v => v.category === 'cursor')
        : [];
    const cfNames = cfCursors.map(v => v.name);
    rec.assert('cursor_return_clause', 'RETURN 子句游标被识别（c_rowtype）',
        cfNames.includes('c_rowtype'), cfNames.join(','));
    rec.assert('cursor_nested_paren', '嵌套括号参数游标被识别（c_nested VARCHAR2(10)）',
        cfNames.includes('c_nested'), cfNames.join(','));
    const multiLineCursor = cfCursors.find(v => v.name === 'c_multi');
    rec.assert('cursor_multiline_params', '多行参数游标被识别且行号为起始行',
        !!multiLineCursor && multiLineCursor.line === 5,
        multiLineCursor ? 'L' + multiLineCursor.line : 'missing');
    rec.assert('cursor_plain_survives', '普通游标回归（c_return）',
        cfNames.includes('c_return'), cfNames.join(','));

    // ===== 6. 对照回归：变量/TYPE/完整嵌套过程穿插 =====
    console.log('--- 对照回归 ---');
    const controlSrc = `CREATE OR REPLACE PACKAGE BODY ctrl_pkg AS
  CURSOR k1 IS SELECT * FROM k1t;
  v_tmp NUMBER;
  TYPE t_rec IS RECORD (id NUMBER, name VARCHAR2(30));
  CURSOR k2 IS SELECT * FROM k2t;

  PROCEDURE full_nested IS
    v_inner NUMBER;
  BEGIN
    IF 1 = 1 THEN
      NULL;
    END IF;
  END full_nested;

  CURSOR k3 IS SELECT * FROM k3t;
  PRAGMA SERIALLY_REUSABLE;
  CURSOR k4 IS SELECT * FROM k4t;
END ctrl_pkg;
/`;
    const cr_ = await parser.parse(controlSrc, 'ctrl_pkg.pkb');
    const cpkg = cr_.nodes.find(n => n.name === 'ctrl_pkg');
    const kCursors = cpkg && cpkg.variableTable
        ? Array.from(cpkg.variableTable.values()).filter(v => v.category === 'cursor').map(v => v.name)
        : [];
    rec.assert('control_cursors_survive', '变量/TYPE/完整嵌套过程/PRAGMA 穿插：4 个游标全部归属包',
        ['k1', 'k2', 'k3', 'k4'].every(c => kCursors.includes(c)), kCursors.join(','));
    const nested = cpkg ? cpkg.children.find(c => c.name === 'full_nested') : null;
    rec.assert('control_nested_intact', '穿插的完整嵌套过程正常（含 IF 控制结构）',
        !!nested && nested.beginLine != null && nested.children.some(c => c.type === 'IF_STATEMENT'),
        nested ? nested.children.map(c => c.type).join(',') : 'missing');

    // ===== 7. Package Header 行为不变 =====
    console.log('--- Package Header 回归 ---');
    const hdrSrc = `CREATE OR REPLACE PACKAGE hdr_pkg AS
  PROCEDURE do_a(p IN NUMBER);
  FUNCTION do_b RETURN VARCHAR2;
END hdr_pkg;
/`;
    const hr = await parser.parse(hdrSrc, 'hdr_pkg.pks');
    const hpkg = hr.nodes.find(n => n.name === 'hdr_pkg');
    const hChildren = hpkg ? hpkg.children.map(c => c.type) : [];
    rec.assert('header_decls_unchanged', 'Package Header 子程序仍为声明节点',
        hpkg && hpkg.children.length === 2 &&
        hpkg.children[0].type === 'PROCEDURE_DECLARATION' &&
        hpkg.children[1].type === 'FUNCTION_DECLARATION',
        hChildren.join(','));

    const parseTime = Date.now() - t0;
    return { suiteName: 'forward_declaration_cursor_test', cases: rec.cases, parseTime };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log(`\n=== GMLTest: forward_declaration_cursor ===`);
        cases.forEach(c => console.log(`  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.desc}${c.passed ? '' : ' [' + c.actual + ']'}`));
        console.log(`\n结果: ${passed}/${cases.length} 通过`);
        process.exit(passed === cases.length ? 0 : 1);
    }).catch(err => { console.error('测试异常:', err); process.exit(1); });
}

module.exports = { run };

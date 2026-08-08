/**
 * GMLTest: Q-quote 边界场景与真实动态 SQL 鲁棒性测试
 *
 * 在 qquote_create_test 基础上补充更刁钻的真实场景：
 *  - 五种配对定界符 + 任意字符定界符
 *  - Q-quote 内含嵌套定界符、含分号、含 BEGIN/END 关键字
 *  - Q-quote 内含双横线与斜杠星号混合（最危险场景）
 *  - 多个 Q-quote 同行
 *  - Q-quote 与标准字符串混合
 *  - 真实 EXECUTE IMMEDIATE 动态 SQL 包
 *  - 性能（大量 Q-quote 行）
 */
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
    Uri: { file: (f) => ({ fsPath: f, toString: () => f }) }
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

// 直接测试 preprocessContent 的字符串剥离（通过原型访问私有方法）
function getClean(parser, src) {
    const proto = Object.getPrototypeOf(parser);
    const res = proto.preprocessContent.call(parser, src);
    return res.cleanLines;
}

async function run() {
    const rec = makeRecorder();
    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);

    // ===== 1. 五种配对定界符 + 任意字符定界符 =====
    console.log('--- Q-quote 定界符变体 ---');
    const delimCases = [
        { name: 'bracket', src: "v := q'[data]';", expect: 'v := "";' },
        { name: 'brace', src: "v := q'{data}';", expect: 'v := "";' },
        { name: 'angle', src: "v := q'<data>';", expect: 'v := "";' },
        { name: 'paren', src: "v := q'(data)';", expect: 'v := "";' },
        { name: 'pipe', src: "v := q'|data|';", expect: 'v := "";' },
        { name: 'hash', src: "v := q'#data#';", expect: 'v := "";' },  // 任意字符定界
        { name: 'nq_prefix', src: "v := nq'[data]';", expect: 'v := "";' },
        { name: 'NQ_upper', src: "v := NQ'[DATA]';", expect: 'v := "";' },
        { name: 'Q_upper', src: "v := Q'[DATA]';", expect: 'v := "";' }
    ];
    for (const c of delimCases) {
        const clean = getClean(parser, c.src);
        rec.assert('delim_' + c.name, `定界符 ${c.name}：${c.src} → 剥离正确`,
            clean[0] === c.expect, `got="${clean[0]}"`);
    }

    // ===== 2. Q-quote 内含危险内容（双横线、斜杠星号、分号、关键字）=====
    console.log('--- Q-quote 内含危险内容 ---');
    const dangerCases = [
        // Q-quote 内含双横线（最危险，原 Bug 会把后续当代码注释删掉）
        { name: 'dash_in_qq', src: "v := q'[a -- b]';", expect: 'v := "";' },
        // Q-quote 内含 斜杠星号（同样危险）
        { name: 'slashstar_in_qq', src: "v := q'[a /* b */ c]';", expect: 'v := "";' },
        // Q-quote 内含分号
        { name: 'semicolon_in_qq', src: "v := q'[a; b]';", expect: 'v := "";' },
        // Q-quote 内含 BEGIN/END（原 Bug 会误平衡）
        { name: 'begin_end_in_qq', src: "v := q'[BEGIN x; END;]';", expect: 'v := "";' },
        // Q-quote 内含单引号
        { name: 'quote_in_qq', src: "v := q'[it's ok]';", expect: 'v := "";' },
        // 混合：Q-quote 内既有 双横线 又有 斜杠星号
        { name: 'mixed_in_qq', src: "v := q'[-- c1 /* c2 */ x]';", expect: 'v := "";' }
    ];
    for (const c of dangerCases) {
        const clean = getClean(parser, c.src);
        rec.assert('danger_' + c.name, `危险内容 ${c.name}：Q-quote 内注释标记不外泄`,
            clean[0] === c.expect, `got="${clean[0]}"`);
    }

    // ===== 3. Q-quote 后接真实代码（验证剥离后代码保留）=====
    console.log('--- Q-quote 后代码保留 ---');
    const afterCases = [
        { name: 'code_after_qq', src: "v := q'[x]'; real_code := 1;", expect: 'v := ""; real_code := 1;' },
        { name: 'qq_then_end', src: "v := q'[END;]'; END proc;", expect: 'v := ""; END proc;' }
    ];
    for (const c of afterCases) {
        const clean = getClean(parser, c.src);
        rec.assert('after_' + c.name, `Q-quote 后代码保留：${c.name}`,
            clean[0] === c.expect, `got="${clean[0]}"`);
    }

    // ===== 4. 多个 Q-quote 同行 + 与标准字符串混合 =====
    console.log('--- 多 Q-quote 与混合 ---');
    const mixedCases = [
        { name: 'two_qq', src: "v := q'[a]' || q'[b]';", expect: 'v := "" || "";' },
        { name: 'qq_and_std', src: "v := q'[a]' || 'std';", expect: 'v := "" || "";' },
        { name: 'std_and_qq', src: "v := 'std' || q'[a]';", expect: 'v := "" || "";' }
    ];
    for (const c of mixedCases) {
        const clean = getClean(parser, c.src);
        rec.assert('mixed_' + c.name, `混合 ${c.name}`,
            clean[0] === c.expect, `got="${clean[0]}"`);
    }

    // ===== 5. 真实 EXECUTE IMMEDIATE 动态 SQL 包（端到端）=====
    console.log('--- 真实动态 SQL 包 ---');
    const dynPkg = `CREATE OR REPLACE PACKAGE BODY dyn_sql_pkg IS
  PROCEDURE exec_count(p_tn IN VARCHAR2, p_cnt OUT NUMBER) IS
    v_sql VARCHAR2(4000);
  BEGIN
    v_sql := q'[SELECT COUNT(*) FROM all_tables WHERE table_name = :1 -- filter]';
    EXECUTE IMMEDIATE v_sql INTO p_cnt USING p_tn;
  EXCEPTION
    WHEN OTHERS THEN p_cnt := -1;
  END exec_count;

  PROCEDURE exec_ddl(p_stmt IN VARCHAR2) IS
    v_full VARCHAR2(32000);
  BEGIN
    v_full := q'{CREATE TABLE tmp_}' || TO_CHAR(SYSDATE, 'YYYYMMDD') || q'{ (id NUMBER)}';
    EXECUTE IMMEDIATE v_full;
    IF p_stmt IS NOT NULL THEN
      EXECUTE IMMEDIATE p_stmt;
    END IF;
  END exec_ddl;
END dyn_sql_pkg;
/`;
    const t0 = Date.now();
    const r = await parser.parse(dynPkg, 'dyn_sql_pkg.pkb');
    const dt = Date.now() - t0;
    rec.assert('dynpkg_clean', '动态 SQL 包解析零错误', r.metadata.errors.length === 0, `errors=${r.metadata.errors.length}`);
    rec.assert('dynpkg_root', '包根 dyn_sql_pkg 闭合', r.nodes[0] && r.nodes[0].name === 'dyn_sql_pkg' && r.nodes[0].endLine != null, r.nodes[0] && r.nodes[0].name);
    const execCount = r.nodes[0] && r.nodes[0].children.find(c => c.name === 'exec_count');
    rec.assert('dynpkg_exec_count_closed', 'exec_count 过程闭合', execCount && execCount.endLine != null, execCount && execCount.endLine);
    rec.assert('dynpkg_exec_count_exc', 'exec_count 含 EXCEPTION（代码未被注释删除）',
        execCount && execCount.exceptionLine != null, execCount && execCount.exceptionLine);
    const execDdl = r.nodes[0] && r.nodes[0].children.find(c => c.name === 'exec_ddl');
    rec.assert('dynpkg_exec_ddl_closed', 'exec_ddl 过程闭合', execDdl && execDdl.endLine != null, execDdl && execDdl.endLine);
    rec.assert('dynpkg_exec_ddl_if', 'exec_ddl 含 IF（代码存活）',
        execDdl && execDdl.children.some(c => c.type === 'IF_STATEMENT'), execDdl && execDdl.children.map(c => c.type).join(','));
    rec.assert('dynpkg_perf', '动态 SQL 包解析 < 200ms', dt < 200, `${dt}ms`);

    // ===== 6. 性能：大量 Q-quote 行 =====
    console.log('--- 性能：大量 Q-quote ---');
    let bigSrc = 'CREATE OR REPLACE PACKAGE big_qq IS\n';
    bigSrc += '  PROCEDURE run_many IS\n    v_sql VARCHAR2(4000);\n  BEGIN\n';
    for (let i = 1; i <= 200; i++) {
        bigSrc += `    v_sql := q'[-- loop ${i}\n    SELECT ${i} FROM dual /* hint ${i} ]';\n`;
    }
    bigSrc += '  END run_many;\nEND big_qq;\n/\n';
    const pt0 = Date.now();
    const pr = await parser.parse(bigSrc, 'big_qq.pkb');
    const ptime = Date.now() - pt0;
    rec.assert('perf_bigqq_clean', '200 个 Q-quote 包解析零错误', pr.metadata.errors.length === 0, `errors=${pr.metadata.errors.length}`);
    rec.assert('perf_bigqq_closed', '200 个 Q-quote 包闭合', pr.nodes[0] && pr.nodes[0].endLine != null, pr.nodes[0] && pr.nodes[0].endLine);
    rec.assert('perf_bigqq_time', '200 个 Q-quote 解析 < 500ms', ptime < 500, `${ptime}ms`);

    return { suiteName: 'qquote_edge_test', cases: rec.cases, parseTime: dt };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log(`\n=== GMLTest: qquote_edge ===`);
        cases.forEach(c => console.log(`  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.desc}${c.passed ? '' : ' [' + c.actual + ']'}`));
        console.log(`\n结果: ${passed}/${cases.length} 通过`);
        process.exit(passed === cases.length ? 0 : 1);
    }).catch(err => { console.error('测试异常:', err); process.exit(1); });
}

module.exports = { run };

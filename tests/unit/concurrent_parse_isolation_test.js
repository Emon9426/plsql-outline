/**
 * GMLTest: 并发解析隔离回归测试（Issue #15）
 *
 * 背景：扩展层此前全局共享一个 PLSQLParser 实例，parseCurrentFile 与
 * parseDocumentQuiet 并发时在同一实例上交错推进——不同文档的解析经共享
 * processedLines 按行号互相"吞行"，BEGIN/END 计数断链，产生成员丢失/杂交树
 * （实机 APPLY_PREMIUM.pkb 1.19MiB 大纲错乱、刷新后自愈）。v1.7.3 起扩展层
 * 每次解析使用独立实例。
 *
 * 本套件锁定解析层的隔离契约：
 *  - 不同实例并发解析不同文档 → 两棵树都完整正确（扩展层修复后的使用模式）
 *  - 同文档在独立实例上重复解析 → 结果一致（幂等）
 *  - 交错启动（A 启动后数个事件循环再启动 B）不破坏任一结果
 *  - 附：共享实例并发解析不同文档会互相污染（警示注释，不作断言——
 *    若未来解析器本身支持可重入，此限制自然解除）
 */
const { PLSQLParser } = require('../../out/parser');
const { NodeType } = require('../../out/types');

function buildPackage(name, memberCount, declCount) {
    const parts = [`CREATE OR REPLACE PACKAGE BODY ${name} AS`];
    for (let i = 0; i < declCount; i++) parts.push(`    g_var_${i} NUMBER := ${i};`);
    for (let m = 0; m < memberCount; m++) {
        parts.push(`    PROCEDURE member_${m} IS`);
        parts.push(`        v_local NUMBER := 0;`);
        parts.push(`    BEGIN`);
        for (let k = 0; k < 12; k++) {
            parts.push(`        IF v_local = ${k} THEN`);
            parts.push(`            v_local := v_local + ${k + 1};`);
            parts.push(`        END IF;`);
        }
        parts.push(`    END member_${m};`);
        parts.push(``);
    }
    parts.push(`END ${name};`);
    return parts.join('\n');
}

function memberNamesOf(result, rootName) {
    const root = result.nodes[0];
    if (!root) return [];
    // 包体正确性：根类型/根名 + 顶层成员完整（名字与顺序）
    if (root.type !== NodeType.PACKAGE_BODY || root.name !== rootName) return null;
    const members = root.children.filter(c => c.type === NodeType.PROCEDURE || c.type === NodeType.FUNCTION);
    return members.map(m => m.name);
}

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

async function run() {
    const rec = makeRecorder();
    const SRC_A = buildPackage('pkg_a', 25, 241);
    const SRC_B = buildPackage('pkg_b', 25, 80);
    const expect = Array.from({ length: 25 }, (_, i) => `member_${i}`);

    // ---- Case 1: 独立实例并发解析不同文档（扩展层 v1.7.3 起的使用模式）----
    const pA = new PLSQLParser().parse(SRC_A, 'a.pkb');
    const pB = new PLSQLParser().parse(SRC_B, 'b.pkb');
    const [rA, rB] = await Promise.all([pA, pB]);
    const namesA = memberNamesOf(rA, 'pkg_a');
    const namesB = memberNamesOf(rB, 'pkg_b');
    rec.assert('c1_a_complete', '并发解析 A：根正确且 25 个成员完整、顺序正确',
        !!namesA && namesA.length === 25 && namesA.join() === expect.join(),
        namesA ? `members=${namesA.length}` : 'root wrong');
    rec.assert('c1_b_complete', '并发解析 B：根正确且 25 个成员完整、顺序正确',
        !!namesB && namesB.length === 25 && namesB.join() === expect.join(),
        namesB ? `members=${namesB.length}` : 'root wrong');
    rec.assert('c1_no_errors', '并发双方解析零错误',
        rA.metadata.errors.length === 0 && rB.metadata.errors.length === 0,
        `${rA.metadata.errors.length}/${rB.metadata.errors.length}`);
    rec.assert('c1_closed', '并发双方无未闭合节点（BEGIN/END 配对完整）',
        countOpen(rA) === 0 && countOpen(rB) === 0,
        `${countOpen(rA)}/${countOpen(rB)}`);

    // ---- Case 2: 交错启动（A 运行中启动 B）----
    const lateA = new PLSQLParser().parse(SRC_A, 'a2.pkb');
    await new Promise(r => setImmediate(r));
    await new Promise(r => setImmediate(r));
    const lateB = new PLSQLParser().parse(SRC_B, 'b2.pkb');
    const [rA2, rB2] = await Promise.all([lateA, lateB]);
    const namesA2 = memberNamesOf(rA2, 'pkg_a');
    const namesB2 = memberNamesOf(rB2, 'pkg_b');
    rec.assert('c2_staggered_a', '交错启动：A 结果完整', !!namesA2 && namesA2.join() === expect.join(),
        namesA2 ? `members=${namesA2.length}` : 'root wrong');
    rec.assert('c2_staggered_b', '交错启动：B 结果完整', !!namesB2 && namesB2.join() === expect.join(),
        namesB2 ? `members=${namesB2.length}` : 'root wrong');

    // ---- Case 3: 同文档独立实例重复解析幂等 ----
    const r1 = await new PLSQLParser().parse(SRC_A, 'same.pkb');
    const r2 = await new PLSQLParser().parse(SRC_A, 'same.pkb');
    const n1 = memberNamesOf(r1, 'pkg_a'), n2 = memberNamesOf(r2, 'pkg_a');
    rec.assert('c3_idempotent', '同文档重复解析结果一致（幂等）',
        !!n1 && !!n2 && n1.join() === n2.join() && n1.join() === expect.join(),
        `${n1 ? n1.length : 'x'}/${n2 ? n2.length : 'x'}`);

    return { suiteName: 'concurrent_parse_isolation_test', cases: rec.cases, parseTime: 0 };
}

function countOpen(result) {
    let open = 0;
    const walk = (n) => { if (n.endLine === null && n.type !== NodeType.PACKAGE_BODY) open++; for (const c of n.children) walk(c); };
    for (const n of result.nodes) walk(n);
    return open;
}

module.exports = { run };

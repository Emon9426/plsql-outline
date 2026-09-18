/**
 * GMLTest: 内联匿名块 currentLevel 泄漏回归测试
 *
 * 背景：startAnonymousBlock 会将 currentLevel 抬升到宿主+1，但匿名块闭合
 * 分支此前只恢复 currentActiveNode，不恢复 currentLevel——包体内每个含
 * 内联 DECLARE..END; 的成员永久泄漏 +1 层级，累积约 13 个成员即触发
 * "嵌套深度超过限制(15)"使整文件解析为 0 节点，且存活成员 level 漂移。
 *
 * 本套件锁定层级契约：
 *  - 多成员各含内联匿名块 → 全部成员完整且 level 一致（不随内联块数量漂移）
 *  - 超过旧失败阈值（≥13 个成员）不再触发嵌套深度限制
 *  - 内联块节点 level = 宿主成员 level + 1
 *  - 内联块内嵌套子程序闭合后，后续成员仍不受影响
 */
const { PLSQLParser } = require('../../out/parser');
const { NodeType } = require('../../out/types');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

/** 包体：memberCount 个成员，每个成员体内各含一个内联 DECLARE..END; 块 */
function buildPkgWithInlineAnon(name, memberCount) {
    const parts = [`CREATE OR REPLACE PACKAGE BODY ${name} AS`];
    for (let m = 0; m < memberCount; m++) {
        parts.push(`    PROCEDURE member_${m} IS`);
        parts.push(`        v_local NUMBER := 0;`);
        parts.push(`    BEGIN`);
        parts.push(`        DECLARE`);
        parts.push(`            v_inner NUMBER := ${m};`);
        parts.push(`        BEGIN`);
        parts.push(`            v_local := v_local + v_inner;`);
        parts.push(`        END;`);
        parts.push(`        v_local := v_local + 1;`);
        parts.push(`    END member_${m};`);
        parts.push(``);
    }
    parts.push(`END ${name};`);
    return parts.join('\n');
}

/** 包体：member_0 含内联块且块内再嵌套子程序，member_1 为普通成员 */
function buildPkgWithNestedSubInAnon(name) {
    return [
        `CREATE OR REPLACE PACKAGE BODY ${name} AS`,
        `    PROCEDURE member_0 IS`,
        `        v_local NUMBER := 0;`,
        `    BEGIN`,
        `        DECLARE`,
        `            FUNCTION inner_f RETURN NUMBER IS`,
        `            BEGIN`,
        `                RETURN 42;`,
        `            END inner_f;`,
        `            v_inner NUMBER := 0;`,
        `        BEGIN`,
        `            v_inner := inner_f();`,
        `            v_local := v_local + v_inner;`,
        `        END;`,
        `    END member_0;`,
        `    PROCEDURE member_1 IS`,
        `    BEGIN`,
        `        NULL;`,
        `    END member_1;`,
        `END ${name};`
    ].join('\n');
}

function membersOf(result, rootName) {
    const root = result.nodes[0];
    if (!root || root.type !== NodeType.PACKAGE_BODY || root.name !== rootName) return null;
    return root.children.filter(c => c.type === NodeType.PROCEDURE || c.type === NodeType.FUNCTION);
}

function countOpen(result) {
    let open = 0;
    const walk = (n) => { if (n.endLine === null && n.type !== NodeType.PACKAGE_BODY) open++; for (const c of n.children) walk(c); };
    for (const n of result.nodes) walk(n);
    return open;
}

async function run() {
    const rec = makeRecorder();

    // ---- Case 1: 18 个成员各含内联块（超过旧阈值 13）----
    const r1 = await new PLSQLParser().parse(buildPkgWithInlineAnon('pkg_leak', 18), 'leak.pkb');
    const m1 = membersOf(r1, 'pkg_leak');
    const expectNames = Array.from({ length: 18 }, (_, i) => `member_${i}`);
    rec.assert('c1_complete', '18 个含内联块的成员全部完整（旧缺陷整文件解析为 0 节点）',
        !!m1 && m1.length === 18 && m1.map(x => x.name).join() === expectNames.join(),
        m1 ? `members=${m1.length}` : 'root wrong');
    rec.assert('c1_levels_uniform', '所有成员 level 一致（层级不随内联块数量漂移）',
        !!m1 && m1.every(x => x.level === m1[0].level),
        m1 ? m1.map(x => x.level).join(',') : 'n/a');
    rec.assert('c1_no_errors', '解析零错误（不再触发嵌套深度限制）',
        r1.metadata.errors.length === 0,
        r1.metadata.errors.join(' | ') || '0');
    rec.assert('c1_closed', '无未闭合节点（BEGIN/END 配对完整）',
        countOpen(r1) === 0, String(countOpen(r1)));
    const anonLevels1 = [];
    if (m1) for (const mem of m1) for (const c of mem.children) {
        if (c.type === NodeType.ANONYMOUS_BLOCK) anonLevels1.push(c.level - mem.level);
    }
    rec.assert('c1_anon_is_child_level', '内联块 level = 宿主成员 level + 1',
        anonLevels1.length === 18 && anonLevels1.every(d => d === 1),
        anonLevels1.join(','));

    // ---- Case 2: 内联块内嵌套子程序，闭合后层级不受影响 ----
    const r2 = await new PLSQLParser().parse(buildPkgWithNestedSubInAnon('pkg_nest'), 'nest.pkb');
    const m2 = membersOf(r2, 'pkg_nest');
    rec.assert('c2_both_members', '嵌套场景两个成员均完整',
        !!m2 && m2.length === 2 && m2[0].name === 'member_0' && m2[1].name === 'member_1',
        m2 ? m2.map(x => x.name).join() : 'root wrong');
    rec.assert('c2_levels_uniform', '嵌套场景成员 level 一致',
        !!m2 && m2.every(x => x.level === m2[0].level),
        m2 ? m2.map(x => x.level).join(',') : 'n/a');
    rec.assert('c2_no_errors', '嵌套场景解析零错误',
        r2.metadata.errors.length === 0, r2.metadata.errors.join(' | ') || '0');
    rec.assert('c2_closed', '嵌套场景无未闭合节点',
        countOpen(r2) === 0, String(countOpen(r2)));

    return { suiteName: 'inline_anon_level_test', cases: rec.cases, parseTime: 0 };
}

module.exports = { run };

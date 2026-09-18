/**
 * 回归 / 边界场景验证
 * 验证修复没有破坏: 有初始化块的Package、独立Function、IS/AS在签名行尾等场景
 */
const { PLSQLParser } = require('../../out/parser');

let totalTests = 0, passedTests = 0;
const failedTests = [];
function assert(cond, msg) {
    totalTests++;
    if (cond) passedTests++;
    else { failedTests.push(msg); console.error(`  FAIL: ${msg}`); }
}

async function run(content, label) {
    const parser = new PLSQLParser();
    return await parser.parse(content, label);
}

async function main() {
    console.log('回归 / 边界场景验证');
    console.log('============================');

    // 1. 有初始化块的 Package (原有逻辑必须仍然工作)
    console.log('\n--- 场景1: 有初始化块的 Package ---');
    {
        const content = `CREATE OR REPLACE PACKAGE BODY pkg_with_init
IS
    PROCEDURE helper IS
    BEGIN
        NULL;
    END helper;
BEGIN
    helper();
END pkg_with_init;
/`;
        const r = await run(content, 'init');
        const pkg = r.nodes[0];
        assert(pkg && pkg.name === 'pkg_with_init', 'Package 名正确');
        assert(pkg.endLine !== null, `Package endLine 不为 null (实际: ${pkg && pkg.endLine})`);
        const procs = pkg.children.filter(n => n.type === 'PROCEDURE');
        assertEqualSafe(procs.length, 1, 'helper 过程存在');
        if (procs[0]) assert(procs[0].endLine !== null, 'helper 正确闭合');
    }

    // 2. 独立 Function (无 Package)
    console.log('\n--- 场景2: 独立 Function ---');
    {
        const content = `CREATE OR REPLACE FUNCTION standalone_f(p_in IN NUMBER) RETURN NUMBER
IS
    v_x NUMBER;
BEGIN
    IF p_in IS NULL THEN
        RETURN 0;
    END IF;
    RETURN p_in * 2;
END standalone_f;
/`;
        const r = await run(content, 'standalone');
        assert(r.nodes.length === 1, '根节点 1 个');
        const f = r.nodes[0];
        assertEqualSafe(f.type, 'FUNCTION', '类型为 FUNCTION');
        assertEqualSafe(f.name, 'standalone_f', '函数名正确');
        assert(f.endLine !== null, `独立 Function endLine (实际: ${f.endLine})`);
        const ifs = f.children.filter(n => n.type === 'IF_STATEMENT');
        assert(ifs.length === 1, `IF (p_in IS NULL) 被识别 (实际: ${ifs.length})`);
    }

    // 3. 签名行尾的 IS/AS (必须仍被识别为声明关键字)
    console.log('\n--- 场景3: 签名行尾 IS ---');
    {
        const content = `CREATE OR REPLACE PACKAGE BODY sig_pkg IS
    PROCEDURE p1 IS
    BEGIN
        IF 1 = 1 THEN
            NULL;
        END IF;
    END p1;
END sig_pkg;
/`;
        const r = await run(content, 'sig');
        const pkg = r.nodes[0];
        assertEqualSafe(pkg.name, 'sig_pkg', 'IS结尾的Package名');
        assert(pkg.endLine !== null, `Package 闭合 (实际: ${pkg.endLine})`);
        const procs = pkg.children.filter(n => n.type === 'PROCEDURE');
        assertEqualSafe(procs.length, 1, '识别出1个PROCEDURE');
        if (procs[0]) {
            assert(procs[0].endLine !== null, 'p1 闭合');
            assert(procs[0].beginLine !== null, 'p1 有 beginLine');
        }
    }

    // 4. 同行 RETURN ... IS 的 Function
    console.log('\n--- 场景4: FUNCTION ... RETURN x IS (同行) ---');
    {
        const content = `CREATE OR REPLACE PACKAGE BODY ret_pkg IS
    FUNCTION get_val RETURN VARCHAR2 IS
    BEGIN
        IF 1 = 1 THEN
            RETURN 'x';
        END IF;
        RETURN NULL;
    END get_val;
END ret_pkg;
/`;
        const r = await run(content, 'ret');
        const pkg = r.nodes[0];
        const funcs = pkg.children.filter(n => n.type === 'FUNCTION');
        assertEqualSafe(funcs.length, 1, '识别出1个FUNCTION');
        if (funcs[0]) {
            assertEqualSafe(funcs[0].name, 'get_val', '函数名');
            assert(funcs[0].endLine !== null, 'get_val 闭合');
            const ifs = funcs[0].children.filter(n => n.type === 'IF_STATEMENT');
            assertEqualSafe(ifs.length, 1, 'get_val 内的 IF 被识别');
        }
    }

    // 5. ELSIF/ELSE 多分支
    console.log('\n--- 场景5: 多分支 ELSIF/ELSE ---');
    {
        const content = `CREATE OR REPLACE PROCEDURE multi_branch(p IN NUMBER) IS
BEGIN
    IF p = 1 THEN
        NULL;
    ELSIF p = 2 THEN
        NULL;
    ELSIF p = 3 THEN
        NULL;
    ELSE
        NULL;
    END IF;
END multi_branch;
/`;
        const r = await run(content, 'multi');
        const proc = r.nodes[0];
        const ifs = proc.children.filter(n => n.type === 'IF_STATEMENT');
        const elsifs = proc.children.filter(n => n.type === 'ELSIF_BRANCH');
        const elses = proc.children.filter(n => n.type === 'ELSE_BRANCH');
        assertEqualSafe(ifs.length, 1, '1个IF');
        assertEqualSafe(elsifs.length, 2, `2个ELSIF (实际: ${elsifs.length})`);
        assertEqualSafe(elses.length, 1, `1个ELSE (实际: ${elses.length})`);
    }

    // 6. CASE WHEN ... IS NULL (BUG-A 在CASE中的应用)
    console.log('\n--- 场景6: CASE WHEN ... IS NULL ---');
    {
        const content = `CREATE OR REPLACE PROCEDURE case_null IS
    v VARCHAR2(10);
BEGIN
    CASE
        WHEN v IS NULL THEN
            NULL;
        WHEN v = 'A' THEN
            NULL;
        ELSE
            NULL;
    END CASE;
END case_null;
/`;
        const r = await run(content, 'casenull');
        const proc = r.nodes[0];
        const cases = proc.children.filter(n => n.type === 'CASE_STATEMENT');
        assertEqualSafe(cases.length, 1, '1个CASE');
        if (cases[0]) {
            const whens = cases[0].children.filter(n => n.type === 'WHEN_BRANCH');
            assertEqualSafe(whens.length, 2, `2个WHEN (实际: ${whens.length})`);
        }
    }

    // 结果
    console.log('\n============================');
    console.log(`测试结果: ${passedTests}/${totalTests} 通过`);
    if (failedTests.length > 0) {
        console.log(`\n失败的测试 (${failedTests.length}):`);
        failedTests.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
        process.exit(1);
    } else {
        console.log('\n所有测试通过!');
        process.exit(0);
    }

    function assertEqualSafe(actual, expected, msg) {
        totalTests++;
        if (actual === expected) passedTests++;
        else {
            failedTests.push(`${msg} (expected: ${expected}, got: ${actual})`);
            console.error(`  FAIL: ${msg} (expected: ${expected}, got: ${actual})`);
        }
    }
}

main().catch(e => { console.error(e); process.exit(2); });

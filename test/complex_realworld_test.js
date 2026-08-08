/**
 * 复杂真实场景测试 - 验证解析器在大代码量、复杂 Sub Function 场景下的 Bug
 *
 * 本测试刻意覆盖现有测试遗漏的边界场景:
 *   1. IF v_x IS NULL / IS NOT NULL  (触发 BUG-A)
 *   2. Package Body 无初始化块       (触发 BUG-B)
 *   3. 3 层子程序嵌套 (package -> func -> sub_func -> sub_sub_func)
 *   4. 多行参数列表
 *   5. EXCEPTION 处理块 + 嵌套匿名 BEGIN/END
 *   6. CASE WHEN ... IS NULL THEN
 *   7. Cursor FOR loop
 */
const path = require('path');
const fs = require('fs');

const { PLSQLParser } = require('../out/parser');

let totalTests = 0;
let passedTests = 0;
const failedTests = [];

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
    } else {
        failedTests.push(message);
        console.error(`  FAIL: ${message}`);
    }
}

function assertEqual(actual, expected, message) {
    totalTests++;
    if (actual === expected) {
        passedTests++;
    } else {
        failedTests.push(`${message} (expected: ${expected}, got: ${actual})`);
        console.error(`  FAIL: ${message} (expected: ${expected}, got: ${actual})`);
    }
}

function findNodesByType(nodes, type) {
    let results = [];
    for (const node of nodes) {
        if (node.type === type) results.push(node);
        if (node.children && node.children.length > 0) {
            results = results.concat(findNodesByType(node.children, type));
        }
    }
    return results;
}

function findNodeByName(nodes, name) {
    for (const node of nodes) {
        if (node.name === name) return node;
        if (node.children && node.children.length > 0) {
            const found = findNodeByName(node.children, name);
            if (found) return found;
        }
    }
    return null;
}

function countAllNodes(nodes) {
    let count = 0;
    for (const node of nodes) {
        count++;
        if (node.children && node.children.length > 0) {
            count += countAllNodes(node.children);
        }
    }
    return count;
}

function printTree(nodes, indent = '') {
    for (const node of nodes) {
        const end = node.endLine != null ? `-${node.endLine}` : '';
        const begin = node.beginLine != null ? ` begin=${node.beginLine}` : '';
        console.log(`${indent}${node.type}: ${node.name} [${node.declarationLine}${end}]${begin}`);
        if (node.children && node.children.length > 0) {
            printTree(node.children, indent + '  ');
        }
    }
}

async function main() {
    console.log('复杂真实场景解析测试');
    console.log('============================');

    const content = fs.readFileSync(
        path.join(__dirname, 'complex_realworld_pkg.pkb'), 'utf8');

    const parser = new PLSQLParser();
    const t0 = Date.now();
    const result = await parser.parse(content, 'complex_realworld_pkg.pkb');
    const elapsed = Date.now() - t0;

    console.log(`\n解析时间: ${elapsed}ms`);
    console.log(`总节点数: ${countAllNodes(result.nodes)}`);
    console.log(`错误数:   ${result.metadata.errors.length}`);
    if (result.metadata.errors.length > 0) {
        for (const e of result.metadata.errors) {
            console.log(`  ERROR line ${e.line}: ${e.message}`);
        }
    }

    console.log('\n节点树:');
    printTree(result.nodes, '  ');

    // ============ 基础断言 ============
    console.log('\n--- 基础断言 ---');
    assert(result.nodes.length > 0, '解析结果非空');
    assertEqual(result.nodes.length, 1, '根节点数量为1 (单个Package Body)');

    const pkg = result.nodes[0];
    assertEqual(pkg.type, 'PACKAGE_BODY', '根节点类型为 PACKAGE_BODY');
    assertEqual(pkg.name, 'order_mgmt_pkg', 'Package名正确 (schema前缀剥离)');

    // ============ BUG-B: 无初始化块的 Package 必须正确闭合 ============
    console.log('\n--- BUG-B: 无初始化块的 Package 闭合 ---');
    assert(pkg.endLine !== null && pkg.endLine !== undefined,
        `BUG-B: Package节点必须有 endLine (实际: ${pkg.endLine})`);
    if (pkg.endLine != null) {
        assert(pkg.endLine > pkg.declarationLine,
            `Package endLine(${pkg.endLine}) > declarationLine(${pkg.declarationLine})`);
    }

    // ============ 顶层子程序数量 ============
    console.log('\n--- 顶层子程序 ---');
    const topProcs = pkg.children.filter(n => n.type === 'PROCEDURE');
    const topFuncs = pkg.children.filter(n => n.type === 'FUNCTION');
    assertEqual(topProcs.length, 2, `顶层 Procedure 数量为2 (validate_order, cancel_order), 实际: ${topProcs.length}`);
    assertEqual(topFuncs.length, 1, `顶层 Function 数量为1 (calculate_total), 实际: ${topFuncs.length}`);

    // ============ 每个顶层子程序必须正确闭合 ============
    console.log('\n--- 子程序闭合检查 ---');
    for (const child of pkg.children) {
        if (child.type === 'PROCEDURE' || child.type === 'FUNCTION') {
            assert(child.endLine !== null && child.endLine !== undefined,
                `${child.name}: 必须有 endLine (实际: ${child.endLine})`);
            assert(child.beginLine !== null && child.beginLine !== undefined,
                `${child.name}: 必须有 beginLine (实际: ${child.beginLine})`);
        }
    }

    // ============ BUG-A: IF x IS NULL / IS NOT NULL 控制结构必须被识别 ============
    console.log('\n--- BUG-A: IF ... IS NULL 控制结构识别 ---');
    const validateOrder = findNodeByName(pkg.children, 'validate_order');
    assert(validateOrder !== null, '找到 validate_order 过程');
    if (validateOrder) {
        const ifs = validateOrder.children.filter(n => n.type === 'IF_STATEMENT');
        const cases = validateOrder.children.filter(n => n.type === 'CASE_STATEMENT');
        console.log(`  validate_order: IF=${ifs.length}, CASE=${cases.length}`);
        // validate_order 有4个独立的 IF (含嵌套) + 1个CASE, 但顶层IF至少3个
        assert(ifs.length >= 2,
            `BUG-A: validate_order 至少识别2个顶层 IF (IS NULL/IS NOT NULL), 实际: ${ifs.length}`);
        assert(cases.length >= 1,
            `BUG-A: validate_order 应识别1个 CASE (含 WHEN ... IS NULL), 实际: ${cases.length}`);
    }

    // ============ 3层嵌套子程序 ============
    console.log('\n--- 3层子程序嵌套 ---');
    const calculateTotal = findNodeByName(pkg.children, 'calculate_total');
    assert(calculateTotal !== null, '找到 calculate_total 函数');

    if (calculateTotal) {
        // 1st level sub: compute_line_total (FUNCTION) + accumulate (PROCEDURE)
        const subFuncs = calculateTotal.children.filter(n => n.type === 'FUNCTION');
        const subProcs = calculateTotal.children.filter(n => n.type === 'PROCEDURE');
        assertEqual(subFuncs.length, 1, `calculate_total 有1个 Sub Function (compute_line_total), 实际: ${subFuncs.length}`);
        assertEqual(subProcs.length, 1, `calculate_total 有1个 Sub Procedure (accumulate), 实际: ${subProcs.length}`);

        // 2nd level sub-sub-function: apply_rounding
        if (subFuncs.length > 0) {
            const computeLineTotal = subFuncs[0];
            const subSubFuncs = computeLineTotal.children.filter(n => n.type === 'FUNCTION');
            assertEqual(subSubFuncs.length, 1,
                `BUG: compute_line_total 有1个 Sub-Sub Function (apply_rounding, 第3层), 实际: ${subSubFuncs.length}`);
            if (subSubFuncs.length > 0) {
                const applyRounding = subSubFuncs[0];
                assertEqual(applyRounding.name, 'apply_rounding',
                    `Sub-Sub Function 名称为 apply_rounding, 实际: ${applyRounding.name}`);
                assert(applyRounding.endLine !== null,
                    `apply_rounding 必须正确闭合 (endLine: ${applyRounding.endLine})`);

                // apply_rounding 内部应有 IF (IS NULL) 和 IF (MOD...)
                const innerIFs = applyRounding.children.filter(n => n.type === 'IF_STATEMENT');
                assert(innerIFs.length >= 1,
                    `BUG-A (深层): apply_rounding 内的 IF (p_value IS NULL) 应被识别, 实际 IF: ${innerIFs.length}`);
            }

            // compute_line_total 之后必须正确闭合，回到 calculate_total
            assert(computeLineTotal.endLine !== null,
                `compute_line_total 必须正确闭合 (endLine: ${computeLineTotal.endLine})`);
        }

        // accumulate (sub procedure) 也应正确闭合
        if (subProcs.length > 0) {
            assert(subProcs[0].endLine !== null,
                `accumulate 必须正确闭合 (endLine: ${subProcs[0].endLine})`);
            // accumulate 内部有 IF (p_line IS NOT NULL)
            const accIFs = subProcs[0].children.filter(n => n.type === 'IF_STATEMENT');
            assert(accIFs.length >= 1,
                `BUG-A: accumulate 内的 IF (p_line IS NOT NULL) 应被识别, 实际: ${accIFs.length}`);
        }

        // calculate_total 自身的控制结构 (FOR loop, IF tax IS NOT NULL, etc.)
        const forLoops = calculateTotal.children.filter(n => n.type === 'FOR_LOOP');
        assert(forLoops.length >= 1,
            `calculate_total 有 FOR loop, 实际: ${forLoops.length}`);

        // 关键: p_tax_rate IS NOT NULL 的 IF 应被识别 (BUG-A 在顶层 func)
        const taxIFs = calculateTotal.children.filter(
            n => n.type === 'IF_STATEMENT' && n.conditionText && n.conditionText.includes('p_tax_rate')
        );
        assert(taxIFs.length >= 1,
            `BUG-A: calculate_total 中 IF (p_tax_rate IS NOT NULL) 应被识别, 实际: ${taxIFs.length}`);
    }

    // ============ cancel_order (验证状态恢复) ============
    console.log('\n--- 状态恢复 (cancel_order) ---');
    const cancelOrder = findNodeByName(pkg.children, 'cancel_order');
    assert(cancelOrder !== null, '找到 cancel_order 过程');
    if (cancelOrder) {
        assert(cancelOrder.endLine !== null,
            `cancel_order 正确闭合 (endLine: ${cancelOrder.endLine})`);
        // 内部 IF v_rows = 0
        const ifs = cancelOrder.children.filter(n => n.type === 'IF_STATEMENT');
        assert(ifs.length >= 1, `cancel_order 有 IF, 实际: ${ifs.length}`);
    }

    // ============ 性能 ============
    console.log('\n--- 性能 ---');
    assert(elapsed < 1000, `解析时间 < 1000ms (实际: ${elapsed}ms)`);

    // ============ 结果 ============
    console.log('\n============================');
    console.log(`测试结果: ${passedTests}/${totalTests} 通过`);
    if (failedTests.length > 0) {
        console.log(`\n失败的测试 (${failedTests.length}):`);
        failedTests.forEach((msg, i) => console.log(`  ${i + 1}. ${msg}`));
        process.exit(1);
    } else {
        console.log('\n所有测试通过!');
        process.exit(0);
    }
}

main().catch(err => {
    console.error('致命错误:', err);
    process.exit(2);
});

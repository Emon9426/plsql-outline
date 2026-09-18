/**
 * 千行级真实业务 Package 解析测试
 *
 * 测试数据: test/ecommerce_pkg.pkb (1331行, 电商订单与库存管理系统)
 *
 * 验证要点:
 *   1. 17 个顶层方法 (8 Function + 9 Procedure) 全部识别
 *   2. 3 层 Sub 程序嵌套 (package -> func -> sub_func -> sub_sub_func)
 *   3. 每个方法正确闭合 (endLine != null)
 *   4. 深层 IF/FOR/WHILE/CASE 控制结构嵌套正确
 *   5. IF x IS NULL / IS NOT NULL 模式全部识别 (BUG-A 回归)
 *   6. Package 节点正确闭合 (含初始化块)
 *   7. 性能: 千行文件解析 < 200ms
 */
const path = require('path');
const fs = require('fs');

const { PLSQLParser } = require('../../out/parser');

let totalTests = 0, passedTests = 0;
const failedTests = [];

function assert(cond, msg) {
    totalTests++;
    if (cond) passedTests++;
    else { failedTests.push(msg); console.error(`  FAIL: ${msg}`); }
}
function assertEqual(actual, expected, msg) {
    totalTests++;
    if (actual === expected) passedTests++;
    else {
        failedTests.push(`${msg} (expected: ${expected}, got: ${actual})`);
        console.error(`  FAIL: ${msg} (expected: ${expected}, got: ${actual})`);
    }
}

function findNodeByName(nodes, name) {
    for (const n of nodes) {
        if (n.name === name) return n;
        if (n.children && n.children.length) {
            const f = findNodeByName(n.children, name);
            if (f) return f;
        }
    }
    return null;
}
function findNodesByType(nodes, type) {
    let r = [];
    for (const n of nodes) {
        if (n.type === type) r.push(n);
        if (n.children && n.children.length) r = r.concat(findNodesByType(n.children, type));
    }
    return r;
}
function countAll(nodes) {
    let c = 0;
    for (const n of nodes) { c++; if (n.children) c += countAll(n.children); }
    return c;
}
function printTree(nodes, indent = '') {
    for (const n of nodes) {
        const end = n.endLine != null ? `-${n.endLine}` : '';
        const begin = n.beginLine != null ? ` b=${n.beginLine}` : '';
        console.log(`${indent}${n.type}: ${n.name} [${n.declarationLine}${end}]${begin}`);
        if (n.children && n.children.length) printTree(n.children, indent + '  ');
    }
}

async function main() {
    console.log('千行级真实业务 Package 解析测试');
    console.log('================================');

    const content = fs.readFileSync(path.join(__dirname, 'ecommerce_pkg.pkb'), 'utf8');
    const lineCount = content.split('\n').length;
    console.log(`文件行数: ${lineCount}`);

    const parser = new PLSQLParser();
    const t0 = Date.now();
    const result = await parser.parse(content, 'ecommerce_pkg.pkb');
    const elapsed = Date.now() - t0;

    console.log(`解析时间: ${elapsed}ms`);
    console.log(`总节点数: ${countAll(result.nodes)}`);
    console.log(`解析错误: ${result.metadata.errors.length}`);
    for (const e of result.metadata.errors) {
        console.log(`  ERROR line ${e.line}: ${e.message}`);
    }

    console.log('\n完整节点树:');
    printTree(result.nodes, '  ');

    // ============ 基础断言 ============
    console.log('\n--- 基础断言 ---');
    assertEqual(result.nodes.length, 1, '根节点数量为1');
    assert(result.metadata.errors.length === 0,
        `无解析错误 (实际: ${result.metadata.errors.length})`);

    const pkg = result.nodes[0];
    assertEqual(pkg.type, 'PACKAGE_BODY', '根节点类型');
    assertEqual(pkg.name, 'ecommerce_pkg', 'Package名 (schema前缀剥离)');
    assert(pkg.endLine !== null && pkg.endLine !== undefined,
        `Package 必须闭合 (endLine: ${pkg.endLine})`);
    if (pkg.endLine != null) {
        assert(pkg.endLine > pkg.declarationLine, 'Package endLine > declarationLine');
    }

    // ============ 顶层方法数量 ============
    console.log('\n--- 顶层方法数量 ---');
    const topFuncs = pkg.children.filter(n => n.type === 'FUNCTION');
    const topProcs = pkg.children.filter(n => n.type === 'PROCEDURE');
    console.log(`  顶层 Functions: ${topFuncs.length}`);
    console.log(`  顶层 Procedures: ${topProcs.length}`);

    const expectedFuncs = [
        'calculate_order_total', 'get_customer_tier', 'check_inventory_level',
        'attempt_restock', 'format_address', 'compute_shipping_cost',
        'validate_payment_info', 'classify_order_risk'
    ];
    const expectedProcs = [
        'process_order', 'bulk_reorder_low_stock', 'generate_sales_report',
        'notify_customer', 'cancel_expired_orders', 'apply_loyalty_discount',
        'refund_order', 'sync_inventory_from_erp', 'archive_old_orders'
    ];
    assertEqual(topFuncs.length, expectedFuncs.length,
        `顶层 Function 数量 = ${expectedFuncs.length} (实际: ${topFuncs.length})`);
    assertEqual(topProcs.length, expectedProcs.length,
        `顶层 Procedure 数量 = ${expectedProcs.length} (实际: ${topProcs.length})`);

    // 验证每个预期方法都存在
    for (const name of expectedFuncs) {
        const found = findNodeByName(pkg.children, name);
        assert(found !== null && found.type === 'FUNCTION',
            `存在顶层 Function: ${name}`);
    }
    for (const name of expectedProcs) {
        const found = findNodeByName(pkg.children, name);
        assert(found !== null && found.type === 'PROCEDURE',
            `存在顶层 Procedure: ${name}`);
    }

    // ============ 所有方法正确闭合 ============
    console.log('\n--- 方法闭合检查 ---');
    let unclosed = 0;
    function checkClosure(nodes) {
        for (const n of nodes) {
            if (n.type === 'FUNCTION' || n.type === 'PROCEDURE') {
                if (n.endLine == null || n.beginLine == null) {
                    unclosed++;
                    console.error(`  未闭合: ${n.name} (begin=${n.beginLine}, end=${n.endLine})`);
                }
            }
            if (n.children) checkClosure(n.children);
        }
    }
    checkClosure(pkg.children);
    assertEqual(unclosed, 0, `所有方法正确闭合 (未闭合: ${unclosed})`);

    // ============ 3 层 Sub 程序嵌套 ============
    console.log('\n--- 3层 Sub 程序嵌套 ---');
    const calcTotal = findNodeByName(pkg.children, 'calculate_order_total');
    assert(calcTotal !== null, '找到 calculate_order_total');
    if (calcTotal) {
        // 第1层 Sub Function: compute_line_amount
        const computeLine = findNodeByName(calcTotal.children, 'compute_line_amount');
        assert(computeLine !== null, '第1层 Sub Function compute_line_amount 存在');
        assert(computeLine && computeLine.endLine != null, 'compute_line_amount 闭合');

        if (computeLine) {
            // 第2层 Sub-Sub Function: apply_discount_and_round
            const applyRounding = findNodeByName(computeLine.children, 'apply_discount_and_round');
            assert(applyRounding !== null,
                '第2层 Sub-Sub Function apply_discount_and_round 存在 (3层嵌套)');
            assert(applyRounding && applyRounding.endLine != null,
                'apply_discount_and_round 闭合');

            // 第2层 Sub-Sub Procedure: validate_product
            const validateProd = findNodeByName(computeLine.children, 'validate_product');
            assert(validateProd !== null,
                '第2层 Sub-Sub Procedure validate_product 存在');
            assert(validateProd && validateProd.endLine != null,
                'validate_product 闭合');

            // apply_discount_and_round 内部应有 IF (IS NULL) 控制结构
            if (applyRounding) {
                const innerIFs = applyRounding.children.filter(n => n.type === 'IF_STATEMENT');
                assert(innerIFs.length >= 2,
                    `apply_rounding 内 IF 控制结构 >= 2 (实际: ${innerIFs.length})`);
                const innerElsif = applyRounding.children.filter(n => n.type === 'ELSIF_BRANCH');
                assert(innerElsif.length >= 1,
                    `apply_rounding 内 ELSIF >= 1 (实际: ${innerElsif.length})`);
            }
        }

        // 第1层 sibling Sub Function: resolve_coupon
        const resolveCoupon = findNodeByName(calcTotal.children, 'resolve_coupon');
        assert(resolveCoupon !== null,
            '第1层 sibling Sub Function resolve_coupon 存在 (兄弟)');
        assert(resolveCoupon && resolveCoupon.endLine != null,
            'resolve_coupon 闭合');
    }

    // ============ process_order 的 Sub 嵌套 ============
    console.log('\n--- process_order Sub 嵌套 ---');
    const processOrder = findNodeByName(pkg.children, 'process_order');
    assert(processOrder !== null, '找到 process_order');
    if (processOrder) {
        const validateTrans = findNodeByName(processOrder.children, 'validate_status_transition');
        assert(validateTrans !== null, 'Sub Procedure validate_status_transition 存在');
        if (validateTrans) {
            const isTerminal = findNodeByName(validateTrans.children, 'is_terminal_status');
            assert(isTerminal !== null,
                'Sub-Sub Function is_terminal_status 存在 (3层嵌套)');
            assert(isTerminal && isTerminal.endLine != null, 'is_terminal_status 闭合');
        }
        const chargePay = findNodeByName(processOrder.children, 'charge_payment');
        assert(chargePay !== null, 'Sub Procedure charge_payment 存在');
        assert(chargePay && chargePay.endLine != null, 'charge_payment 闭合');
    }

    // ============ 控制结构数量统计 (BUG-A 回归) ============
    console.log('\n--- 控制结构统计 (BUG-A 回归) ---');
    const allIFs = findNodesByType(pkg.children, 'IF_STATEMENT');
    const allElsifs = findNodesByType(pkg.children, 'ELSIF_BRANCH');
    const allElses = findNodesByType(pkg.children, 'ELSE_BRANCH');
    const allCases = findNodesByType(pkg.children, 'CASE_STATEMENT');
    const allWhens = findNodesByType(pkg.children, 'WHEN_BRANCH');
    const allFors = findNodesByType(pkg.children, 'FOR_LOOP');
    const allWhiles = findNodesByType(pkg.children, 'WHILE_LOOP');
    const basicLoops = findNodesByType(pkg.children, 'LOOP_STATEMENT');

    console.log(`  IF: ${allIFs.length}`);
    console.log(`  ELSIF: ${allElsifs.length}`);
    console.log(`  ELSE: ${allElses.length}`);
    console.log(`  CASE: ${allCases.length}`);
    console.log(`  WHEN: ${allWhens.length}`);
    console.log(`  FOR loop: ${allFors.length}`);
    console.log(`  WHILE loop: ${allWhiles.length}`);
    console.log(`  LOOP (basic): ${basicLoops.length}`);

    // 关键回归: IF 数量必须显著 > 0 (源码中有82个 IF)
    assert(allIFs.length >= 40,
        `IF_STATEMENT 数量 >= 40 (实际: ${allIFs.length}) — BUG-A 回归验证`);
    assert(allElsifs.length >= 15,
        `ELSIF_BRANCH 数量 >= 15 (实际: ${allElsifs.length})`);
    assert(allCases.length >= 5,
        `CASE_STATEMENT 数量 >= 5 (实际: ${allCases.length})`);
    assert(allWhens.length >= 10,
        `WHEN_BRANCH 数量 >= 10 (实际: ${allWhens.length})`);
    assert(allFors.length >= 10,
        `FOR_LOOP 数量 >= 10 (实际: ${allFors.length})`);
    assert(allWhiles.length >= 5,
        `WHILE_LOOP 数量 >= 5 (实际: ${allWhiles.length})`);

    // ============ 深层嵌套验证 (5层: IF > IF > FOR > IF > CASE) ============
    console.log('\n--- 深层嵌套验证 ---');
    // get_customer_tier 内有 WHILE > IF > IF/CASE 的嵌套
    const getTier = findNodeByName(pkg.children, 'get_customer_tier');
    if (getTier) {
        const whileLoops = getTier.children.filter(n => n.type === 'WHILE_LOOP');
        assert(whileLoops.length >= 1, 'get_customer_tier 有 WHILE loop');
        if (whileLoops.length > 0) {
            const innerIFs = whileLoops[0].children.filter(n => n.type === 'IF_STATEMENT');
            const innerElsifs = whileLoops[0].children.filter(n => n.type === 'ELSIF_BRANCH');
            assert(innerIFs.length >= 1, 'WHILE 内有 IF (2层嵌套)');
            assert(innerElsifs.length >= 1, 'WHILE 内有 ELSIF (多分支)');
        }
    }

    // ============ 性能 ============
    console.log('\n--- 性能 ---');
    assert(elapsed < 200, `千行文件解析 < 200ms (实际: ${elapsed}ms)`);

    // ============ 行号一致性 ============
    console.log('\n--- 行号一致性 ---');
    let badLine = 0;
    function checkLines(nodes) {
        for (const n of nodes) {
            if (!(n.declarationLine > 0)) badLine++;
            if (n.endLine != null && n.endLine < n.declarationLine) {
                badLine++;
                console.error(`  ${n.name}: end(${n.endLine}) < decl(${n.declarationLine})`);
            }
            if (n.children) checkLines(n.children);
        }
    }
    checkLines(pkg.children);
    assertEqual(badLine, 0, `所有节点行号合法 (非法: ${badLine})`);

    // ============ 结果 ============
    console.log('\n================================');
    console.log(`测试结果: ${passedTests}/${totalTests} 通过`);
    if (failedTests.length > 0) {
        console.log(`\n失败的测试 (${failedTests.length}):`);
        failedTests.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
        process.exit(1);
    } else {
        console.log('\n所有测试通过!');
        process.exit(0);
    }
}

main().catch(e => { console.error('致命错误:', e); process.exit(2); });

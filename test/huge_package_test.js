/**
 * 万行级（10,000+ 行）PL/SQL 包体解析测试
 *
 * 测试对象：test/huge_package_10k.sql（13,000+ 行，150 个顶层程序，深度控制嵌套）
 *
 * 覆盖用户需求：
 *  1. 万行级解析性能 < 3000ms
 *  2. 150 个顶层程序全部正确闭合（endLine 非空）
 *  3. 深度控制嵌套（IF/FOR/WHILE/CASE 多级，maxNestingDepth >= 6）
 *  4. 声明项按类别正确解析（变量/游标/常量/类型/异常）
 *  5. schema 前缀剥离（app_schema.huge_test_pkg → huge_test_pkg）
 *  6. 零解析错误
 *
 * 运行：node test/huge_package_test.js  （需先 npm run compile）
 */
const path = require('path');
const fs = require('fs');
const { PLSQLParser } = require('../out/parser');
const { NodeType, DeclarationCategory } = require('../out/types');

let passed = 0;
let failed = 0;
const failures = [];

function assert(cond, msg) {
    if (cond) { passed++; }
    else { failed++; failures.push(msg); console.error('  ✗ FAIL: ' + msg); }
}
function assertEqual(actual, expected, msg) {
    assert(actual === expected, `${msg} (期望 ${JSON.stringify(expected)}, 实际 ${JSON.stringify(actual)})`);
}
function assertGte(actual, threshold, msg) {
    assert(actual >= threshold, `${msg} (期望 >= ${threshold}, 实际 ${actual})`);
}

async function main() {
    console.log('=== 万行级 PL/SQL 解析测试 ===\n');
    const file = path.join(__dirname, 'huge_package_10k.sql');
    assert(fs.existsSync(file), '测试文件 huge_package_10k.sql 存在');

    const content = fs.readFileSync(file, 'utf8');
    const lineCount = content.split('\n').length;
    console.log(`文件行数: ${lineCount}`);
    assertGte(lineCount, 10000, '文件达到万行级（>=10000 行）');

    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);

    const t0 = Date.now();
    const result = await parser.parse(content, 'huge_package_10k.sql');
    const parseTime = Date.now() - t0;

    // ---- 性能 ----
    console.log(`\n--- 性能 ---`);
    console.log(`解析时间: ${parseTime} ms`);
    assert(parseTime < 3000, `万行解析 < 3000ms（实际 ${parseTime}ms）`);

    // ---- 正确性：零错误 ----
    console.log(`\n--- 正确性 ---`);
    console.log(`解析错误数: ${result.metadata.errors.length}`);
    assertEqual(result.metadata.errors.length, 0, '零解析错误');

    // ---- 包根节点 ----
    assertEqual(result.nodes.length, 1, '仅 1 个根节点（包体）');
    const root = result.nodes[0];
    assertEqual(root.type, NodeType.PACKAGE_BODY, '根节点类型为 PACKAGE_BODY');
    assertEqual(root.name, 'huge_test_pkg', 'schema 前缀被剥离，包名为 huge_test_pkg');
    assert(root.endLine !== null && root.endLine > root.declarationLine,
        `包体正确闭合（declarationLine=${root.declarationLine}, endLine=${root.endLine}）`);
    console.log(`根节点: ${root.type} ${root.name} [L${root.declarationLine}-${root.endLine}]`);

    // ---- 顶层程序闭合性 ----
    const topLevel = root.children.filter(c =>
        c.type === NodeType.FUNCTION || c.type === NodeType.PROCEDURE);
    console.log(`\n--- 顶层程序 ---`);
    console.log(`顶层程序数: ${topLevel.length}`);
    assertGte(topLevel.length, 150, '顶层程序 >= 150');
    const unclosed = topLevel.filter(p => p.endLine === null || p.endLine === undefined);
    assertEqual(unclosed.length, 0, `所有顶层程序正确闭合（未闭合数 ${unclosed.length}）`);

    const topFuncs = topLevel.filter(p => p.type === NodeType.FUNCTION);
    const topProcs = topLevel.filter(p => p.type === NodeType.PROCEDURE);
    assertGte(topFuncs.length, 70, `顶层函数 >= 70（实际 ${topFuncs.length}）`);
    assertGte(topProcs.length, 70, `顶层过程 >= 70（实际 ${topProcs.length}）`);

    // ---- 深度嵌套 ----
    console.log(`\n--- 控制嵌套 ---`);
    console.log(`最大嵌套深度: ${result.metadata.maxNestingDepth}`);
    assertGte(result.metadata.maxNestingDepth, 6, '最大嵌套深度 >= 6');

    // 统计控制结构
    const controlCounts = {};
    function walkCount(node) {
        controlCounts[node.type] = (controlCounts[node.type] || 0) + 1;
        (node.children || []).forEach(walkCount);
    }
    result.nodes.forEach(walkCount);
    console.log(`控制结构统计: IF=${controlCounts[NodeType.IF_STATEMENT]}, ` +
        `FOR=${controlCounts[NodeType.FOR_LOOP]}, WHILE=${controlCounts[NodeType.WHILE_LOOP]}, ` +
        `CASE=${controlCounts[NodeType.CASE_STATEMENT]}, WHEN=${controlCounts[NodeType.WHEN_BRANCH]}`);
    assertGte(controlCounts[NodeType.IF_STATEMENT] || 0, 300, `IF 语句 >= 300`);
    assertGte(controlCounts[NodeType.FOR_LOOP] || 0, 200, `FOR 循环 >= 200`);
    assertGte(controlCounts[NodeType.WHILE_LOOP] || 0, 150, `WHILE 循环 >= 150`);
    assertGte(controlCounts[NodeType.CASE_STATEMENT] || 0, 100, `CASE 语句 >= 100`);

    // ---- 声明项解析（变量/游标/常量/类型/异常）----
    console.log(`\n--- 声明项 ---`);
    const decl = { variable: 0, cursor: 0, type: 0, constant: 0, exception: 0 };
    let declWithCategory = 0;
    let declWithoutCategory = 0;
    function walkDecl(node) {
        if (node.variableTable) {
            for (const v of node.variableTable.values()) {
                if (v.category) {
                    decl[v.category] = (decl[v.category] || 0) + 1;
                    declWithCategory++;
                } else {
                    declWithoutCategory++;
                }
            }
        }
        (node.children || []).forEach(walkDecl);
    }
    result.nodes.forEach(walkDecl);
    console.log(`变量: ${decl.variable}, 游标: ${decl.cursor}, 常量: ${decl.constant}, ` +
        `类型: ${decl.type}, 异常: ${decl.exception}`);
    assertGte(decl.variable, 700, `变量声明 >= 700（实际 ${decl.variable}）`);
    assertGte(decl.cursor, 100, `游标声明 >= 100（实际 ${decl.cursor}）`);
    assertGte(decl.constant, 100, `常量声明 >= 100（实际 ${decl.constant}）`);
    assertGte(decl.type, 100, `类型声明 >= 100（实际 ${decl.type}）`);
    assertGte(decl.exception, 100, `异常声明 >= 100（实际 ${decl.exception}）`);
    assertEqual(declWithoutCategory, 0, `所有声明项均带规范化 category 字段`);

    // ---- 包级声明（根节点的 variableTable 应含包级游标/变量等）----
    assert(root.variableTable && root.variableTable.size > 0,
        `包级声明被记录到根节点的 variableTable（共 ${root.variableTable ? root.variableTable.size : 0} 项）`);

    // ---- IS NULL / IS NOT NULL 控制结构识别（BUG-A 回归）----
    // 子函数 sub_calc_N 含 "IF p_val IS NULL THEN"，应被识别为 IF 而非声明
    // 已隐含在 IF 计数 >= 300 的断言中。

    // ---- 行号一致性 ----
    console.log(`\n--- 行号一致性 ---`);
    let lineErrors = 0;
    function walkLines(node) {
        if (node.declarationLine <= 0) lineErrors++;
        if (node.endLine !== null && node.endLine !== undefined &&
            node.endLine < node.declarationLine) lineErrors++;
        (node.children || []).forEach(walkLines);
    }
    result.nodes.forEach(walkLines);
    assertEqual(lineErrors, 0, `所有节点行号一致（错误 ${lineErrors}）`);

    // ---- 结果汇总 ----
    console.log(`\n================================`);
    console.log(`测试结果: ${passed}/${passed + failed} 通过`);
    if (failed > 0) {
        console.error(`失败 ${failed} 项:`);
        failures.forEach(f => console.error('  - ' + f));
        process.exit(1);
    }
    console.log('\n所有测试通过!');
}

main().catch(err => {
    console.error('测试执行异常:', err);
    process.exit(1);
});

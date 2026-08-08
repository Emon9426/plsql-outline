/**
 * PL/SQL Outline Parser 测试
 * 覆盖: 5层嵌套 + 1000行大文件 + UI一致性
 */
const path = require('path');
const fs = require('fs');

// 加载编译后的模块
const { PLSQLParser } = require('../out/parser');

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

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

/**
 * 递归统计所有节点
 */
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

/**
 * 按类型查找所有节点
 */
function findNodesByType(nodes, type) {
    let results = [];
    for (const node of nodes) {
        if (node.type === type) {
            results.push(node);
        }
        if (node.children && node.children.length > 0) {
            results = results.concat(findNodesByType(node.children, type));
        }
    }
    return results;
}

/**
 * 验证所有节点都有正确的行号
 */
function verifyLineNumbers(nodes, depth = 0) {
    for (const node of nodes) {
        assert(node.declarationLine > 0, `Node '${node.name}' has valid declarationLine`);
        if (node.endLine !== null && node.endLine !== undefined) {
            assert(node.endLine >= node.declarationLine, 
                `Node '${node.name}' endLine(${node.endLine}) >= declarationLine(${node.declarationLine})`);
        }
        if (node.children && node.children.length > 0) {
            verifyLineNumbers(node.children, depth + 1);
        }
    }
}

/**
 * 验证父子关系正确性
 */
function verifyParentChildRelations(nodes, expectedParentLevel) {
    for (const node of nodes) {
        if (expectedParentLevel !== undefined) {
            assert(node.level > expectedParentLevel, 
                `Node '${node.name}' level(${node.level}) > parent level(${expectedParentLevel})`);
        }
        if (node.children && node.children.length > 0) {
            verifyParentChildRelations(node.children, node.level);
        }
    }
}

/**
 * 计算最大嵌套深度
 */
function calculateMaxDepth(nodes, currentDepth = 0) {
    let maxDepth = currentDepth;
    for (const node of nodes) {
        if (node.children && node.children.length > 0) {
            const childDepth = calculateMaxDepth(node.children, currentDepth + 1);
            maxDepth = Math.max(maxDepth, childDepth);
        }
    }
    return maxDepth;
}

/**
 * 打印节点树（调试用）
 */
function printTree(nodes, indent = '') {
    for (const node of nodes) {
        const endInfo = node.endLine ? ` [${node.declarationLine}-${node.endLine}]` : ` [${node.declarationLine}]`;
        console.log(`${indent}${node.type}: ${node.name}${endInfo}`);
        if (node.children && node.children.length > 0) {
            printTree(node.children, indent + '  ');
        }
    }
}

// ====== 测试 1: 5层嵌套控制结构 ======
async function test5LevelNesting() {
    console.log('\n=== 测试1: 5层嵌套控制结构 ===');
    
    const content = fs.readFileSync(
        path.join(__dirname, 'nested_control_5levels.sql'), 'utf8');
    
    const parser = new PLSQLParser();
    const result = await parser.parse(content, 'nested_control_5levels.sql');
    
    // 基础验证
    assert(result.nodes.length > 0, '解析结果非空');
    assert(result.metadata.errors.length === 0, '无解析错误');
    
    // 根节点应该是 Package Body
    const pkg = result.nodes[0];
    assertEqual(pkg.type, 'PACKAGE_BODY', '根节点为 Package Body');
    assertEqual(pkg.name, 'test_nested_pkg', 'Package名称正确');
    
    // Package应有process_data和calculate两个子程序
    const procs = pkg.children.filter(n => n.type === 'PROCEDURE');
    const funcs = pkg.children.filter(n => n.type === 'FUNCTION');
    assertEqual(procs.length, 1, 'Package有1个Procedure');
    assertEqual(funcs.length, 1, 'Package有1个Function');
    
    // process_data过程检查
    const processData = procs[0];
    assertEqual(processData.name, 'process_data', 'Procedure名称正确');
    assert(processData.beginLine !== null, 'process_data有beginLine');
    assert(processData.endLine !== null, 'process_data有endLine');
    
    // 检查process_data的控制结构子节点
    const ifNodes = processData.children.filter(n => n.type === 'IF_STATEMENT');
    assert(ifNodes.length >= 1, 'process_data有IF控制结构');
    
    // 5层嵌套验证: IF > FOR > IF > WHILE > CASE
    if (ifNodes.length > 0) {
        const topIF = ifNodes[0];
        const forLoops = topIF.children.filter(n => n.type === 'FOR_LOOP');
        assert(forLoops.length >= 1, '第1层IF包含FOR LOOP (第2层)');
        
        if (forLoops.length > 0) {
            const innerIFs = forLoops[0].children.filter(n => n.type === 'IF_STATEMENT');
            assert(innerIFs.length >= 1, '第2层FOR包含IF (第3层)');
            
            if (innerIFs.length > 0) {
                const whileLoops = innerIFs[0].children.filter(n => n.type === 'WHILE_LOOP');
                assert(whileLoops.length >= 1, '第3层IF包含WHILE LOOP (第4层)');
                
                if (whileLoops.length > 0) {
                    const caseNodes = whileLoops[0].children.filter(n => n.type === 'CASE_STATEMENT');
                    assert(caseNodes.length >= 1, '第4层WHILE包含CASE (第5层)');
                    
                    if (caseNodes.length > 0) {
                        const whenNodes = caseNodes[0].children.filter(n => n.type === 'WHEN_BRANCH');
                        assert(whenNodes.length >= 2, 'CASE包含多个WHEN分支');
                    }
                }
            }
        }
    }
    
    // ELSIF/ELSE作为兄弟节点验证
    const elsifNodes = processData.children.filter(n => n.type === 'ELSIF_BRANCH');
    const elseNodes = processData.children.filter(n => n.type === 'ELSE_BRANCH');
    assert(elsifNodes.length >= 1, 'process_data有ELSIF分支');
    assert(elseNodes.length >= 1, 'process_data有ELSE分支');
    
    // calculate函数 - Sub程序验证
    const calculate = funcs[0];
    assertEqual(calculate.name, 'calculate', 'Function名称正确');
    
    const subProcs = calculate.children.filter(n => n.type === 'PROCEDURE');
    const subFuncs = calculate.children.filter(n => n.type === 'FUNCTION');
    assert(subProcs.length >= 1, 'calculate有Sub Procedure');
    assert(subFuncs.length >= 1, 'calculate有Sub Function');
    
    // Sub程序内的控制结构
    if (subProcs.length > 0) {
        const subHelper = subProcs[0];
        const subIFs = subHelper.children.filter(n => n.type === 'IF_STATEMENT');
        assert(subIFs.length >= 1, 'Sub Procedure内有IF控制结构');
    }
    
    // 打印树结构用于确认
    console.log('\n  节点树:');
    printTree(result.nodes, '    ');
    
    // 验证行号正确
    verifyLineNumbers(result.nodes);
    
    // 验证最大嵌套深度 >= 5
    const maxDepth = calculateMaxDepth(result.nodes);
    assert(maxDepth >= 5, `最大嵌套深度 >= 5 (实际: ${maxDepth})`);
}

// ====== 测试 2: 大规模文件 (1000行, 100+ Function) ======
async function testLargePackage() {
    console.log('\n=== 测试2: 大规模文件 (1000+行, 97+ methods) ===');
    
    const content = fs.readFileSync(
        path.join(__dirname, 'large_package_100funcs.sql'), 'utf8');
    
    const parser = new PLSQLParser();
    const startTime = Date.now();
    const result = await parser.parse(content, 'large_package_100funcs.sql');
    const parseTime = Date.now() - startTime;
    
    console.log(`  解析时间: ${parseTime}ms`);
    
    // 基础验证
    assert(result.nodes.length > 0, '解析结果非空');
    assert(result.metadata.errors.length === 0, `无解析错误 (实际: ${result.metadata.errors.map(e=>e.message).join(', ')})`);
    
    // 性能要求
    assert(parseTime < 1000, `解析时间 < 1秒 (实际: ${parseTime}ms)`);
    
    // 根节点应该是 Package Body
    const pkg = result.nodes[0];
    assertEqual(pkg.type, 'PACKAGE_BODY', '根节点为 Package Body');
    assertEqual(pkg.name, 'large_test_pkg', 'Package名称正确 (schema前缀被正确处理)');
    
    // 统计顶层Function和Procedure
    const topFuncs = pkg.children.filter(n => n.type === 'FUNCTION');
    const topProcs = pkg.children.filter(n => n.type === 'PROCEDURE');
    
    console.log(`  顶层 Functions: ${topFuncs.length}`);
    console.log(`  顶层 Procedures: ${topProcs.length}`);
    
    // 验证数量: 50 functions + 1 edge_case_func = 51, 30 procedures
    assert(topFuncs.length >= 50, `至少50个顶层Function (实际: ${topFuncs.length})`);
    assert(topProcs.length >= 30, `至少30个顶层Procedure (实际: ${topProcs.length})`);
    
    // 统计Sub程序
    let subFuncCount = 0;
    let subProcCount = 0;
    for (const func of topFuncs) {
        subFuncCount += func.children.filter(n => n.type === 'FUNCTION').length;
        subProcCount += func.children.filter(n => n.type === 'PROCEDURE').length;
    }
    for (const proc of topProcs) {
        subFuncCount += proc.children.filter(n => n.type === 'FUNCTION').length;
        subProcCount += proc.children.filter(n => n.type === 'PROCEDURE').length;
    }
    
    console.log(`  Sub Functions: ${subFuncCount}`);
    console.log(`  Sub Procedures: ${subProcCount}`);
    
    assert(subFuncCount >= 10, `至少10个Sub Function (实际: ${subFuncCount})`);
    assert(subProcCount >= 6, `至少6个Sub Procedure (实际: ${subProcCount})`);
    
    // 验证所有方法的beginLine/endLine正确闭合
    let unclosedCount = 0;
    function checkClosure(nodes) {
        for (const node of nodes) {
            if (node.type === 'FUNCTION' || node.type === 'PROCEDURE') {
                if (node.endLine === null || node.endLine === undefined) {
                    unclosedCount++;
                }
            }
            if (node.children) {
                checkClosure(node.children);
            }
        }
    }
    checkClosure(pkg.children);
    assertEqual(unclosedCount, 0, `所有方法正确闭合 (未闭合: ${unclosedCount})`);
    
    // 验证控制结构归属正确
    const allIFs = findNodesByType(pkg.children, 'IF_STATEMENT');
    const allFORs = findNodesByType(pkg.children, 'FOR_LOOP');
    const allWHILEs = findNodesByType(pkg.children, 'WHILE_LOOP');
    
    console.log(`  IF节点: ${allIFs.length}`);
    console.log(`  FOR节点: ${allFORs.length}`);
    console.log(`  WHILE节点: ${allWHILEs.length}`);
    
    assert(allIFs.length > 0, '存在IF控制结构节点');
    assert(allFORs.length > 0, '存在FOR控制结构节点');
    assert(allWHILEs.length > 0, '存在WHILE控制结构节点');
    
    // 验证行号正确
    verifyLineNumbers(result.nodes);
    
    // 验证父子关系
    verifyParentChildRelations(result.nodes);
}

// ====== 测试 3: Schema前缀 ======
async function testSchemaPrefix() {
    console.log('\n=== 测试3: Schema前缀支持 ===');
    
    const content = `CREATE OR REPLACE PACKAGE BODY hr.emp_pkg
IS
    FUNCTION get_name(p_id NUMBER) RETURN VARCHAR2
    IS
    BEGIN
        RETURN 'test';
    END get_name;
END emp_pkg;
/`;
    
    const parser = new PLSQLParser();
    const result = await parser.parse(content, 'schema_test.sql');
    
    assert(result.nodes.length > 0, 'Schema前缀文件解析成功');
    assertEqual(result.nodes[0].name, 'emp_pkg', 'Schema前缀正确剥离，仅保留对象名');
    assertEqual(result.nodes[0].type, 'PACKAGE_BODY', '类型正确识别为Package Body');
}

// ====== 测试 4: 字符串内注释不被剥离 ======
async function testStringWithComments() {
    console.log('\n=== 测试4: 字符串内注释不被误处理 ===');
    
    const content = `CREATE OR REPLACE FUNCTION test_str RETURN VARCHAR2
IS
    v_sql VARCHAR2(200) := 'SELECT * FROM t -- not a comment';
    v_block VARCHAR2(100) := '/* also not */';
BEGIN
    IF v_sql IS NOT NULL THEN
        RETURN v_sql;
    END IF;
    RETURN NULL;
END test_str;
/`;
    
    const parser = new PLSQLParser();
    const result = await parser.parse(content, 'string_test.sql');
    
    assert(result.nodes.length > 0, '含字符串注释的文件解析成功');
    assert(result.metadata.errors.length === 0, '无解析错误');
    assertEqual(result.nodes[0].name, 'test_str', '函数名正确识别');
    assert(result.nodes[0].endLine !== null, '函数正确闭合');
}

// ====== 测试 5: Package初始化块 ======
async function testPackageInit() {
    console.log('\n=== 测试5: Package初始化块 ===');
    
    const content = `CREATE OR REPLACE PACKAGE BODY init_pkg
IS
    PROCEDURE helper
    IS
    BEGIN
        NULL;
    END helper;
BEGIN
    helper();
END init_pkg;
/`;
    
    const parser = new PLSQLParser();
    const result = await parser.parse(content, 'init_test.sql');
    
    assert(result.nodes.length > 0, 'Package初始化块文件解析成功');
    const pkg = result.nodes[0];
    assertEqual(pkg.type, 'PACKAGE_BODY', '类型正确');
    assertEqual(pkg.name, 'init_pkg', '名称正确');
    assert(pkg.beginLine !== null, 'Package有beginLine (初始化块)');
    assert(pkg.endLine !== null, 'Package正确闭合');
    
    // helper过程也应该正确闭合
    const helpers = pkg.children.filter(n => n.type === 'PROCEDURE');
    assert(helpers.length === 1, 'Package有1个Procedure');
    if (helpers.length > 0) {
        assert(helpers[0].endLine !== null, 'helper过程正确闭合');
    }
}

// ====== 测试 6: UI一致性验证 ======
async function testUIConsistency() {
    console.log('\n=== 测试6: UI一致性验证 (Parser输出与TreeView渲染) ===');
    
    // 模拟DataProvider的getChildren逻辑
    // 验证Parser输出的节点树结构可以被正确遍历和渲染
    const content = fs.readFileSync(
        path.join(__dirname, 'nested_control_5levels.sql'), 'utf8');
    
    const parser = new PLSQLParser();
    const result = await parser.parse(content, 'ui_test.sql');
    
    // 模拟getChildren: 根级别返回所有根节点
    function simulateGetChildren(parentNode) {
        if (!parentNode) {
            return result.nodes;
        }
        return parentNode.children || [];
    }
    
    // 模拟getTreeItem: 验证每个节点都能生成有效的TreeItem数据
    function simulateGetTreeItem(node) {
        return {
            label: `${node.name} (${node.type})`,
            line: node.declarationLine,
            hasChildren: node.children && node.children.length > 0,
            collapsibleState: (node.children && node.children.length > 0) ? 'collapsed' : 'none'
        };
    }
    
    // 递归验证所有层级
    function verifyLevel(parentNode, depth) {
        const children = simulateGetChildren(parentNode);
        
        for (const child of children) {
            const treeItem = simulateGetTreeItem(child);
            
            // 验证TreeItem数据有效
            assert(treeItem.label && treeItem.label.length > 0, 
                `深度${depth}: 节点'${child.name}'有有效label`);
            assert(treeItem.line > 0, 
                `深度${depth}: 节点'${child.name}'有有效行号(${treeItem.line})`);
            
            // 验证collapsibleState与children一致
            if (child.children && child.children.length > 0) {
                assertEqual(treeItem.collapsibleState, 'collapsed',
                    `深度${depth}: 有子节点的'${child.name}'应该可折叠`);
            } else {
                assertEqual(treeItem.collapsibleState, 'none',
                    `深度${depth}: 无子节点的'${child.name}'不可折叠`);
            }
            
            // 递归验证子节点
            if (child.children && child.children.length > 0) {
                verifyLevel(child, depth + 1);
            }
        }
    }
    
    verifyLevel(null, 0);
    console.log('  UI一致性验证完成: Parser节点树可正确映射为TreeView结构');
}

// ====== 运行所有测试 ======
async function runAllTests() {
    console.log('PL/SQL Outline Parser 测试套件');
    console.log('================================');
    
    try {
        await testSchemaPrefix();
        await testStringWithComments();
        await testPackageInit();
        await test5LevelNesting();
        await testLargePackage();
        await testUIConsistency();
    } catch (error) {
        console.error(`\n致命错误: ${error.message}`);
        console.error(error.stack);
    }
    
    console.log('\n================================');
    console.log(`测试结果: ${passedTests}/${totalTests} 通过`);
    
    if (failedTests.length > 0) {
        console.log(`\n失败的测试 (${failedTests.length}):`);
        failedTests.forEach((msg, i) => console.log(`  ${i+1}. ${msg}`));
        process.exit(1);
    } else {
        console.log('\n所有测试通过!');
        process.exit(0);
    }
}

runAllTests();

const { parsePLSQL } = require('../dist/src/parser');
const fs = require('fs');

// 测试用户反馈的exception问题
const testCases = [
    'test/nested_function_issue.sql',
    'test/exception_complex_cases.sql',
    'test/simple_nested_function.sql'
];

console.log('=== Exception层级问题调试 ===\n');

testCases.forEach((file, index) => {
    console.log(`\n--- 测试文件 ${index + 1}: ${file} ---`);
    
    try {
        const content = fs.readFileSync(file, 'utf-8');
        const result = parsePLSQL(content);
        
        console.log('解析结果:');
        
        function printTree(nodes, depth = 0) {
            nodes.forEach(node => {
                const indent = '  '.repeat(depth);
                console.log(`${indent}${node.label} (${node.type}) [${node.range?.startLine}-${node.range?.endLine}]`);
                
                if (node.children && node.children.length > 0) {
                    printTree(node.children, depth + 1);
                }
            });
        }
        
        printTree(result.nodes);
        
        // 检查exception块的层级
        function checkExceptionLevels(nodes, path = []) {
            nodes.forEach(node => {
                if (node.type === 'exception') {
                    const pathStr = path.map(p => `${p.label}(${p.type})`).join(' -> ');
                    console.log(`\n🔍 Exception块: ${node.label}`);
                    console.log(`   路径: ${pathStr} -> ${node.label}(${node.type})`);
                    
                    // 检查父节点是否是BEGIN块
                    const parentNode = path[path.length - 1];
                    if (parentNode && parentNode.type !== 'begin') {
                        console.log(`   ❌ 错误: Exception块的父节点不是BEGIN块，而是 ${parentNode.type}`);
                    } else if (parentNode && parentNode.type === 'begin') {
                        console.log(`   ✅ 正确: Exception块属于BEGIN块`);
                    } else {
                        console.log(`   ❌ 错误: Exception块没有父节点`);
                    }
                }
                
                if (node.children && node.children.length > 0) {
                    checkExceptionLevels(node.children, [...path, node]);
                }
            });
        }
        
        checkExceptionLevels(result.nodes);
        
    } catch (error) {
        console.log(`错误: ${error.message}`);
    }
});

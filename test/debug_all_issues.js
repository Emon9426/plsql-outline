const fs = require('fs');
const path = require('path');

// 导入独立解析器
const { parsePLSQL } = require('./standalone_parser.js');

console.log('=== 全面问题调试 ===\n');

// 测试文件列表
const testFiles = [
    'test/nested_function_issue.sql',
    'test/exception_complex_cases.sql',
    'test/simple_nested_function.sql',
    'test/complex_nested_functions.sql',
    'test/multiline_function_test.sql',
    'test/extreme_multiline_test.sql',
    'test/comma_leading_params_test.sql'
];

function analyzeNode(node, depth = 0, path = '') {
    const indent = '  '.repeat(depth);
    const currentPath = path ? `${path} -> ${node.label}(${node.type})` : `${node.label}(${node.type})`;
    
    console.log(`${indent}${node.label} (${node.type}) [${node.range?.startLine}-${node.range?.endLine}]`);
    
    // 检查问题1：函数是否被正确识别
    if (node.type === 'function') {
        console.log(`${indent}  ✓ 函数被识别: ${node.label}`);
    }
    
    // 检查问题2：Exception块的子节点情况
    if (node.type === 'exception' && node.children && node.children.length > 0) {
        const whenChildren = node.children.filter(child => child.type === 'when');
        const nonWhenChildren = node.children.filter(child => child.type !== 'when');
        
        console.log(`${indent}  📍 EXCEPTION 块详情:`);
        console.log(`${indent}     路径: ${currentPath}`);
        console.log(`${indent}     WHEN 子节点数量: ${whenChildren.length}`);
        console.log(`${indent}     其他子节点数量: ${nonWhenChildren.length}`);
        
        if (whenChildren.length > 0) {
            console.log(`${indent}     ✅ WHEN 子节点:`);
            whenChildren.forEach(child => {
                console.log(`${indent}       - ${child.label} (${child.type})`);
            });
        }
        
        if (nonWhenChildren.length > 0) {
            console.log(`${indent}     ⚠️  非WHEN子节点 (可能有问题):`);
            nonWhenChildren.forEach(child => {
                console.log(`${indent}       - ${child.label} (${child.type})`);
            });
        }
    }
    
    // 检查问题3：函数是否在错误的位置
    if (node.type === 'function' && depth > 0) {
        console.log(`${indent}  📍 嵌套函数位置: ${currentPath}`);
    }
    
    // 递归检查子节点
    if (node.children) {
        node.children.forEach(child => {
            analyzeNode(child, depth + 1, currentPath);
        });
    }
}

function checkMissingFunctions(text, parsedNodes) {
    console.log('\n🔍 检查遗漏的函数声明:');
    
    // 查找所有FUNCTION关键字
    const lines = text.split('\n');
    const functionDeclarations = [];
    
    lines.forEach((line, index) => {
        const cleanLine = line.trim().toUpperCase();
        if (cleanLine.includes('FUNCTION ') && !cleanLine.startsWith('--')) {
            const match = line.match(/FUNCTION\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
            if (match) {
                functionDeclarations.push({
                    name: match[1],
                    line: index,
                    text: line.trim()
                });
            }
        }
    });
    
    console.log(`   发现 ${functionDeclarations.length} 个FUNCTION声明:`);
    functionDeclarations.forEach(func => {
        console.log(`   - 第${func.line + 1}行: ${func.name} (${func.text})`);
    });
    
    // 检查解析结果中的函数
    const parsedFunctions = [];
    function collectFunctions(nodes) {
        nodes.forEach(node => {
            if (node.type === 'function') {
                parsedFunctions.push(node.label);
            }
            if (node.children) {
                collectFunctions(node.children);
            }
        });
    }
    collectFunctions(parsedNodes);
    
    console.log(`   解析到 ${parsedFunctions.length} 个函数:`);
    parsedFunctions.forEach(func => {
        console.log(`   - ${func}`);
    });
    
    // 检查遗漏
    const missing = functionDeclarations.filter(declared => 
        !parsedFunctions.some(parsed => parsed.toLowerCase() === declared.name.toLowerCase())
    );
    
    if (missing.length > 0) {
        console.log(`   ❌ 遗漏的函数 (${missing.length}个):`);
        missing.forEach(func => {
            console.log(`   - ${func.name} (第${func.line + 1}行)`);
        });
    } else {
        console.log(`   ✅ 所有函数都被正确识别`);
    }
}

// 测试每个文件
testFiles.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  文件不存在: ${filePath}`);
        return;
    }
    
    console.log(`\n--- 测试文件: ${filePath} ---`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const result = parsePLSQL(content);
        
        console.log('解析结果:');
        result.nodes.forEach(node => {
            analyzeNode(node);
        });
        
        // 检查遗漏的函数
        checkMissingFunctions(content, result.nodes);
        
        if (result.errors.length > 0) {
            console.log('\n❌ 解析错误:');
            result.errors.forEach(error => {
                console.log(`   - ${error}`);
            });
        }
        
    } catch (error) {
        console.error(`❌ 处理文件时出错: ${error.message}`);
    }
});

console.log('\n=== 调试完成 ===');

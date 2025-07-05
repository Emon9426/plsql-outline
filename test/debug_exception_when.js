const fs = require('fs');
const { parsePLSQL } = require('./standalone_parser');

console.log('=== EXCEPTION WHEN 语句测试 ===\n');

const testFile = 'test/exception_when_test.sql';
const content = fs.readFileSync(testFile, 'utf8');

console.log('文件内容:');
const lines = content.split('\n');
lines.forEach((line, index) => {
    if (line.trim()) {
        console.log(`第${index + 1}行: ${line}`);
    }
});

console.log('\n解析结果:');
const result = parsePLSQL(content);

function printStructure(nodes, depth = 0) {
    nodes.forEach(node => {
        const indent = '  '.repeat(depth);
        console.log(`${indent}${node.label} (${node.type}) [${node.range?.startLine}-${node.range?.endLine}]`);
        if (node.children && node.children.length > 0) {
            printStructure(node.children, depth + 1);
        }
    });
}

printStructure(result.nodes);

console.log('\n🔍 详细分析:');

// 检查 EXCEPTION 块的结构
function analyzeExceptionBlocks(nodes, path = '') {
    nodes.forEach(node => {
        const currentPath = path ? `${path} -> ${node.label}(${node.type})` : `${node.label}(${node.type})`;
        
        if (node.type === 'exception') {
            console.log(`\n📍 发现 EXCEPTION 块: ${currentPath}`);
            console.log(`   范围: [${node.range?.startLine}-${node.range?.endLine}]`);
            console.log(`   子节点数量: ${node.children?.length || 0}`);
            
            if (node.children && node.children.length > 0) {
                console.log(`   子节点:`);
                node.children.forEach(child => {
                    console.log(`     - ${child.label} (${child.type}) [${child.range?.startLine}-${child.range?.endLine}]`);
                });
            } else {
                console.log(`   ⚠️  没有子节点 - 这可能是问题所在！`);
            }
        }
        
        if (node.children && node.children.length > 0) {
            analyzeExceptionBlocks(node.children, currentPath);
        }
    });
}

analyzeExceptionBlocks(result.nodes);

console.log('\n🔍 检查 WHEN 语句识别:');

// 检查文件中的 WHEN 语句
const whenStatements = [];
lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('WHEN ') && trimmed.includes(' THEN')) {
        whenStatements.push({
            line: index + 1,
            content: trimmed
        });
    }
});

console.log(`发现 ${whenStatements.length} 个 WHEN 语句:`);
whenStatements.forEach(when => {
    console.log(`  第${when.line}行: ${when.content}`);
});

console.log('\n❓ 问题分析:');
console.log('1. EXCEPTION 块是否正确识别？');
console.log('2. WHEN 语句是否被正确解析为 EXCEPTION 块的子节点？');
console.log('3. 多个 WHEN 语句是否都被识别？');
console.log('4. WHEN 语句后的代码是否被正确归属？');

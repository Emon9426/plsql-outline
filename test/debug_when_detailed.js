const fs = require('fs');
const { parsePLSQL } = require('./standalone_parser');

console.log('=== 详细 WHEN 语句调试 ===\n');

const testFile = 'test/exception_when_test.sql';
const content = fs.readFileSync(testFile, 'utf8');
const lines = content.split('\n');

console.log('逐行分析:');
lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('WHEN ') && trimmed.includes(' THEN')) {
        console.log(`第${index + 1}行: ${trimmed} ← WHEN语句`);
    } else if (trimmed.startsWith('EXCEPTION')) {
        console.log(`第${index + 1}行: ${trimmed} ← EXCEPTION块`);
    } else if (trimmed.startsWith('BEGIN')) {
        console.log(`第${index + 1}行: ${trimmed} ← BEGIN块`);
    } else if (trimmed.startsWith('END')) {
        console.log(`第${index + 1}行: ${trimmed} ← END语句`);
    }
});

console.log('\n解析结果:');
const result = parsePLSQL(content);

function printDetailedStructure(nodes, depth = 0) {
    nodes.forEach(node => {
        const indent = '  '.repeat(depth);
        const childCount = node.children ? node.children.length : 0;
        console.log(`${indent}${node.label} (${node.type}) [${node.range?.startLine}-${node.range?.endLine}] - ${childCount} 个子节点`);
        
        if (node.type === 'exception') {
            console.log(`${indent}  📍 EXCEPTION 块详情:`);
            if (node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    console.log(`${indent}    - ${child.label} (${child.type}) [${child.range?.startLine}-${child.range?.endLine}]`);
                });
            } else {
                console.log(`${indent}    ⚠️  没有子节点！`);
            }
        }
        
        if (node.children && node.children.length > 0) {
            printDetailedStructure(node.children, depth + 1);
        }
    });
}

printDetailedStructure(result.nodes);

console.log('\n🔍 问题分析:');
console.log('预期应该有 3 个 EXCEPTION 块，每个都应该有对应的 WHEN 子节点：');
console.log('1. 第5行的 EXCEPTION 应该有 4 个 WHEN 子节点 (第6,8,10,12行)');
console.log('2. 第25行的 EXCEPTION 应该有 2 个 WHEN 子节点 (第26,28行)');
console.log('3. 第32行的 EXCEPTION 应该有 3 个 WHEN 子节点 (第33,35,37行)');

// 统计实际识别的 WHEN 节点
let whenCount = 0;
function countWhenNodes(nodes) {
    nodes.forEach(node => {
        if (node.type === 'when') {
            whenCount++;
        }
        if (node.children) {
            countWhenNodes(node.children);
        }
    });
}

countWhenNodes(result.nodes);
console.log(`\n实际识别的 WHEN 节点数量: ${whenCount}`);
console.log(`预期的 WHEN 节点数量: 9`);
console.log(`缺失的 WHEN 节点数量: ${9 - whenCount}`);

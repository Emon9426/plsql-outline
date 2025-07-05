const { parsePLSQL } = require('../dist/src/parser');
const fs = require('fs');

const content = fs.readFileSync('test/nested_function_issue.sql', 'utf-8');
const result = parsePLSQL(content);

console.log('=== 检查children数组状态 ===');

function checkChildren(node, depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${node.label} (${node.type})`);
    console.log(`${indent}  - children存在: ${!!node.children}`);
    console.log(`${indent}  - children长度: ${node.children ? node.children.length : 'N/A'}`);
    console.log(`${indent}  - children数组: ${JSON.stringify(node.children ? node.children.map(c => c.label) : null)}`);
    
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => checkChildren(child, depth + 1));
    }
}

result.nodes.forEach(node => checkChildren(node));

console.log('\n=== TreeItem状态模拟 ===');
function simulateTreeItem(node, depth = 0) {
    const indent = '  '.repeat(depth);
    const hasChildren = node.children && node.children.length > 0;
    const collapsibleState = hasChildren ? 'Collapsed' : 'None';
    
    console.log(`${indent}${node.label}: ${collapsibleState} (实际子节点: ${node.children ? node.children.length : 0})`);
    
    if (node.children && node.children.length > 0) {
        node.children.forEach(child => simulateTreeItem(child, depth + 1));
    }
}

result.nodes.forEach(node => simulateTreeItem(node));

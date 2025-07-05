const { parsePLSQL } = require('../dist/src/parser');
const fs = require('fs');

// 读取用户的测试文件
const content = fs.readFileSync('test/nested_function_issue.sql', 'utf-8');
const result = parsePLSQL(content);

console.log('=== 调试树结构 ===');
console.log('根节点数量:', result.nodes.length);

function printNode(node, depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${node.label} (${node.type})`);
    console.log(`${indent}  - children: ${node.children ? node.children.length : 0}`);
    console.log(`${indent}  - parent: ${node.parent ? node.parent.label : 'undefined'}`);
    console.log(`${indent}  - range: ${node.range ? `${node.range.startLine}-${node.range.endLine}` : 'undefined'}`);
    
    if (node.children) {
        node.children.forEach(child => printNode(child, depth + 1));
    }
}

result.nodes.forEach(node => printNode(node));

// 检查特定的函数节点
function findFunction(nodes, name) {
    for (const node of nodes) {
        if (node.type === 'function' && node.label === name) {
            return node;
        }
        if (node.children) {
            const found = findFunction(node.children, name);
            if (found) return found;
        }
    }
    return null;
}

const funcXxx = findFunction(result.nodes, 'xxx');
console.log('\n=== 查找 FUNCTION xxx ===');
if (funcXxx) {
    console.log('✅ 找到 FUNCTION xxx');
    console.log('父节点:', funcXxx.parent ? funcXxx.parent.label : 'undefined');
    console.log('子节点数量:', funcXxx.children ? funcXxx.children.length : 0);
} else {
    console.log('❌ 未找到 FUNCTION xxx');
}

const fs = require('fs');
const { parsePLSQL } = require('./standalone_parser.js');

console.log('=== 简单END语句测试 ===\n');

const testFile = 'test/simple_end_test.sql';
const content = fs.readFileSync(testFile, 'utf8');
const lines = content.split('\n');

console.log('文件内容:');
lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('--')) {
        console.log(`第${index + 1}行: ${trimmed}`);
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

console.log('\n期望的结构:');
console.log('main_proc (procedure)');
console.log('  nested_func (function)');
console.log('    BEGIN (begin)');
console.log('  BEGIN (begin)');
console.log('standalone_func (function)');
console.log('  BEGIN (begin)');

console.log('\n分析:');
console.log('- 第8行的END; 应该结束 nested_func');
console.log('- 第12行的END; 应该结束 main_proc');
console.log('- 第16行的END; 应该结束 standalone_func');

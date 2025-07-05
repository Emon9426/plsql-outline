const fs = require('fs');
const { parsePLSQL } = require('./standalone_parser.js');

console.log('=== END语句匹配调试 ===\n');

const testFile = 'test/comma_leading_params_test.sql';
const content = fs.readFileSync(testFile, 'utf8');
const lines = content.split('\n');

console.log('文件内容分析:');
lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.includes('CREATE OR REPLACE') || 
        trimmed.includes('FUNCTION') || 
        trimmed.includes('PROCEDURE') || 
        trimmed.includes('PACKAGE') ||
        trimmed.match(/^END(\s|;)/i)) {
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
console.log('comma_leading_func (function)');
console.log('comma_leading_proc (procedure)');
console.log('main_comma_proc (procedure)');
console.log('  nested_comma_func (function)');
console.log('comma_test_pkg (package body)');
console.log('  pkg_comma_func (function)');
console.log('mixed_comma_func (function)');
console.log('extreme_comma_func (function)');

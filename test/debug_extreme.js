const fs = require('fs');
const { parsePLSQL } = require('../dist/src/parser');

// 读取极端测试文件
const content = fs.readFileSync('test/extreme_comment_nesting.fcn', 'utf-8');
const lines = content.split('\n');

console.log('=== 检查注释状态 ===');
let inMultiLineComment = false;
let commentDepth = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let lineInComment = inMultiLineComment;
    
    // 简单检查多行注释开始和结束
    let tempInComment = inMultiLineComment;
    for (let j = 0; j < line.length - 1; j++) {
        if (line[j] === '/' && line[j + 1] === '*') {
            tempInComment = true;
            commentDepth++;
        } else if (line[j] === '*' && line[j + 1] === '/') {
            commentDepth--;
            if (commentDepth <= 0) {
                tempInComment = false;
                commentDepth = 0;
            }
        }
    }
    inMultiLineComment = tempInComment;
    
    // 检查问题行
    if (i + 1 === 273 || i + 1 === 388 || (i >= 270 && i <= 290) || (i >= 385 && i <= 395)) {
        console.log(`行 ${i + 1}: inComment=${lineInComment} -> ${inMultiLineComment}, depth=${commentDepth}`);
        console.log(`  内容: "${line}"`);
        
        // 检查是否包含CREATE关键字
        if (line.toUpperCase().includes('CREATE')) {
            console.log(`  *** 发现CREATE关键字在注释中! ***`);
        }
    }
}

console.log('\n=== 解析结果中的问题节点 ===');
const result = parsePLSQL(content);
result.nodes.forEach(node => {
    console.log(`顶级节点: ${node.label} (${node.type}) 行${node.range?.startLine}-${node.range?.endLine}`);
    
    function printChildren(children, indent = '  ') {
        if (!children) return;
        children.forEach(child => {
            console.log(`${indent}${child.label} (${child.type}) 行${child.range?.startLine}-${child.range?.endLine}`);
            if (child.label === 'fake_package' || child.label === 'trg_fake_table_audit') {
                console.log(`${indent}*** 这是假代码，不应该被识别! ***`);
            }
            printChildren(child.children, indent + '  ');
        });
    }
    
    printChildren(node.children);
});

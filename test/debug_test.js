const fs = require('fs');
const { parsePLSQL } = require('../dist/src/parser');

// 读取调试文件
const content = fs.readFileSync('test/debug_comment.sql', 'utf-8');

console.log('=== 原始内容 ===');
console.log(content);

console.log('\n=== 解析结果 ===');
const result = parsePLSQL(content);
console.log(JSON.stringify(result, null, 2));

console.log('\n=== 逐行调试注释处理 ===');
const lines = content.split('\n');
let inMultiLineComment = false;

for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i];
    
    // 模拟removeComments函数的处理
    let result = '';
    let newInMultiLineComment = inMultiLineComment;
    let inString = false;
    let stringChar = '';
    let j = 0;
    
    while (j < originalLine.length) {
        const char = originalLine[j];
        const nextChar = j + 1 < originalLine.length ? originalLine[j + 1] : '';
        
        // 如果已经在多行注释中
        if (newInMultiLineComment) {
            if (char === '*' && nextChar === '/') {
                // 多行注释结束
                newInMultiLineComment = false;
                j++; // 跳过 '/'
            }
            // 在多行注释中，跳过所有字符
            j++;
            continue;
        }
        
        // 检查字符串状态（只有在不在注释中时才处理字符串）
        if (!inString) {
            if (char === "'" || char === '"') {
                inString = true;
                stringChar = char;
                result += char;
            } else if (char === '/' && nextChar === '*') {
                // 多行注释开始
                newInMultiLineComment = true;
                j++; // 跳过 '*'
            } else if (char === '-' && nextChar === '-') {
                // 单行注释开始，忽略行的剩余部分
                break;
            } else {
                result += char;
            }
        } else {
            // 在字符串中
            if (char === stringChar) {
                // 检查是否是转义的引号
                if (j + 1 < originalLine.length && originalLine[j + 1] === stringChar) {
                    // 转义的引号，保留两个字符
                    result += char + originalLine[j + 1];
                    j++;
                } else {
                    // 字符串结束
                    inString = false;
                    stringChar = '';
                    result += char;
                }
            } else {
                result += char;
            }
        }
        j++;
    }
    
    console.log(`行 ${i + 1}: inComment=${inMultiLineComment} -> ${newInMultiLineComment}`);
    console.log(`  原始: "${originalLine}"`);
    console.log(`  处理: "${result}"`);
    
    inMultiLineComment = newInMultiLineComment;
}

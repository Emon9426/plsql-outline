const fs = require('fs');

// 直接导入解析器模块进行调试
const parserModule = require('../dist/src/parser');

// 读取极端测试文件的特定行
const content = fs.readFileSync('test/extreme_comment_nesting.fcn', 'utf-8');
const lines = content.split('\n');

console.log('=== 调试解析器逐行处理 ===');

// 模拟解析器的主循环
let inMultiLineComment = false;

// 重点关注问题行周围
const problemLines = [270, 271, 272, 273, 274, 275, 385, 386, 387, 388, 389, 390];

for (let i = 0; i < lines.length; i++) {
    if (!problemLines.includes(i)) continue;
    
    const originalLine = lines[i];
    
    // 调用实际的removeComments函数（需要模拟，因为它不是导出的）
    // 我们需要手动实现相同的逻辑
    let cleanLine, newCommentState;
    
    // 如果整行都在多行注释中，直接返回空字符串
    if (inMultiLineComment) {
        // 检查是否有注释结束符
        const endIndex = originalLine.indexOf('*/');
        if (endIndex !== -1) {
            // 注释在这一行结束，处理剩余部分
            const remainingLine = originalLine.substring(endIndex + 2);
            // 递归调用处理剩余部分（简化版）
            cleanLine = remainingLine; // 简化处理
            newCommentState = false;
        } else {
            // 整行都在注释中
            cleanLine = '';
            newCommentState = true;
        }
    } else {
        // 简化的注释处理逻辑
        let result = '';
        let tempInComment = false;
        let j = 0;
        
        while (j < originalLine.length) {
            const char = originalLine[j];
            const nextChar = j + 1 < originalLine.length ? originalLine[j + 1] : '';
            
            if (char === '/' && nextChar === '*') {
                // 多行注释开始
                const afterCommentStart = originalLine.substring(j + 2);
                const endIndex = afterCommentStart.indexOf('*/');
                
                if (endIndex !== -1) {
                    // 注释在同一行结束
                    const afterComment = afterCommentStart.substring(endIndex + 2);
                    result += afterComment;
                    j = originalLine.length; // 结束循环
                } else {
                    // 注释跨行
                    tempInComment = true;
                    break;
                }
            } else if (char === '-' && nextChar === '-') {
                // 单行注释开始，忽略行的剩余部分
                break;
            } else {
                result += char;
            }
            j++;
        }
        
        cleanLine = result;
        newCommentState = tempInComment;
    }
    
    console.log(`行 ${i + 1}: inComment=${inMultiLineComment} -> ${newCommentState}`);
    console.log(`  原始: "${originalLine}"`);
    console.log(`  清理: "${cleanLine}"`);
    
    // 检查清理后的行是否包含CREATE关键字
    if (cleanLine.trim().toUpperCase().includes('CREATE')) {
        console.log(`  *** 警告: 清理后仍包含CREATE关键字! ***`);
    }
    
    // 检查是否会匹配PLSQL_OBJECT_REGEX
    const PLSQL_OBJECT_REGEX = /CREATE\s+(OR\s+REPLACE\s+)?(PACKAGE\s+BODY|PACKAGE|PROCEDURE|FUNCTION|TRIGGER)\s+([^\s(]+)/i;
    const match = cleanLine.match(PLSQL_OBJECT_REGEX);
    if (match) {
        console.log(`  *** 错误: 匹配了PLSQL_OBJECT_REGEX! 识别为: ${match[3]} (${match[2]}) ***`);
    }
    
    inMultiLineComment = newCommentState;
    console.log('');
}

console.log('\n=== 测试实际解析器 ===');
const result = parserModule.parsePLSQL(content);
console.log('解析出的顶级节点数量:', result.nodes.length);
result.nodes.forEach(node => {
    console.log(`- ${node.label} (${node.type})`);
});

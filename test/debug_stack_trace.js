const fs = require('fs');

console.log('=== 栈变化详细调试 ===\n');

// 简化的解析器，专门用于调试栈变化
function debugParsePLSQL(text) {
    const lines = text.split('\n');
    const stack = [];
    const rootNodes = [];
    
    console.log('逐行解析过程:');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('--')) continue;
        
        console.log(`\n第${i + 1}行: "${line}"`);
        console.log(`处理前栈状态: [${stack.map(n => `${n.label}(${n.type})`).join(', ')}]`);
        
        // 检查各种匹配
        const objectMatch = line.match(/CREATE\s+(OR\s+REPLACE\s+)?(PACKAGE\s+BODY|PACKAGE|PROCEDURE|FUNCTION)\s+([^\s(]+)/i);
        const nestedMatch = line.match(/\b(PROCEDURE|FUNCTION)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i);
        const blockMatch = line.match(/^\s*(DECLARE|BEGIN|EXCEPTION)\s*$/i);
        const endMatch = line.match(/END(\s+[^\s;]+)?\s*;/i);
        
        if (objectMatch) {
            let type = objectMatch[2].toLowerCase();
            if (type.includes('package body')) type = 'package body';
            else if (type.includes('package')) type = 'package';
            
            const node = { label: objectMatch[3], type, line: i };
            console.log(`  -> 创建顶级对象: ${node.label} (${node.type})`);
            
            if (stack.length > 0) {
                console.log(`  -> 添加到父节点: ${stack[stack.length - 1].label}`);
            } else {
                console.log(`  -> 添加到根节点`);
                rootNodes.push(node);
            }
            stack.push(node);
            
        } else if (nestedMatch && line.includes('IS')) {
            const node = { label: nestedMatch[2], type: nestedMatch[1].toLowerCase(), line: i };
            console.log(`  -> 创建嵌套对象: ${node.label} (${node.type})`);
            stack.push(node);
            
        } else if (blockMatch) {
            const node = { label: blockMatch[1], type: blockMatch[1].toLowerCase(), line: i };
            console.log(`  -> 创建代码块: ${node.label} (${node.type})`);
            if (node.type !== 'exception') {
                stack.push(node);
            }
            
        } else if (endMatch) {
            const endName = endMatch[1]?.trim();
            console.log(`  -> 遇到END语句, 名称: "${endName || '无名称'}"`);
            
            if (endName) {
                console.log(`  -> 有名称的END，查找匹配的节点`);
                for (let j = stack.length - 1; j >= 0; j--) {
                    if (stack[j].label === endName) {
                        console.log(`  -> 找到匹配节点: ${stack[j].label} (位置${j})`);
                        while (stack.length > j + 1) {
                            const popped = stack.pop();
                            console.log(`    -> 弹出: ${popped.label} (${popped.type})`);
                        }
                        const matched = stack.pop();
                        console.log(`    -> 弹出匹配节点: ${matched.label} (${matched.type})`);
                        break;
                    }
                }
            } else {
                console.log(`  -> 无名称的END，检查栈顶`);
                if (stack.length > 0) {
                    const topNode = stack[stack.length - 1];
                    console.log(`  -> 栈顶节点: ${topNode.label} (${topNode.type})`);
                    
                    if (topNode.type === 'begin' || topNode.type === 'declare' || topNode.type === 'exception') {
                        const blockNode = stack.pop();
                        console.log(`    -> 弹出代码块: ${blockNode.label} (${blockNode.type})`);
                        
                        // 检查是否应该同时结束函数/过程
                        if (stack.length > 0) {
                            const nextTop = stack[stack.length - 1];
                            console.log(`    -> 新栈顶: ${nextTop.label} (${nextTop.type})`);
                            
                            if ((nextTop.type === 'function' || nextTop.type === 'procedure') && 
                                blockNode.type === 'begin') {
                                console.log(`    -> 检查是否应该同时结束函数/过程`);
                                // 这里是关键逻辑，需要判断是否应该结束函数/过程
                                console.log(`    -> 决定: 同时结束函数/过程`);
                                const funcNode = stack.pop();
                                console.log(`    -> 弹出函数/过程: ${funcNode.label} (${funcNode.type})`);
                            }
                        }
                    } else {
                        const poppedNode = stack.pop();
                        console.log(`    -> 直接弹出: ${poppedNode.label} (${poppedNode.type})`);
                    }
                }
            }
        }
        
        console.log(`处理后栈状态: [${stack.map(n => `${n.label}(${n.type})`).join(', ')}]`);
    }
    
    return { stack, rootNodes };
}

const testFile = 'test/comma_leading_params_test.sql';
const content = fs.readFileSync(testFile, 'utf8');
const result = debugParsePLSQL(content);

console.log('\n=== 最终结果 ===');
console.log('剩余栈:', result.stack.map(n => `${n.label}(${n.type})`));
console.log('根节点:', result.rootNodes.map(n => `${n.label}(${n.type})`));

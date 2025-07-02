import * as vscode from 'vscode';
import { PLSQLNode, ParserResult } from './types';

const PLSQL_OBJECT_REGEX = /CREATE\s+(OR\s+REPLACE\s+)?(PACKAGE\s+BODY|PACKAGE|PROCEDURE|FUNCTION|TRIGGER)\s+([^\s(]+)/i;
const NESTED_OBJECT_REGEX = /(PROCEDURE|FUNCTION)\s+([^\s(]+)/i;
const BLOCK_START_REGEX = /\b(DECLARE|BEGIN|EXCEPTION)\b/i;
const END_REGEX = /END(\s+[^\s;]+)?\s*;/i;

export function parsePLSQL(text: string): ParserResult {
    const lines = text.split('\n');
    const stack: PLSQLNode[] = [];
    const rootNodes: PLSQLNode[] = [];
    const errors: string[] = [];
    let inMultiLineComment = false;

    for (let i = 0; i < lines.length; i++) {
        const [cleanLine, newCommentState] = removeComments(lines[i], inMultiLineComment);
        inMultiLineComment = newCommentState;
        
        // 移除字符串字面量
        const lineWithoutStrings = removeStringLiterals(cleanLine);
        const line = lineWithoutStrings.trim();
        if (!line) continue; // 跳过空行
        const objectMatch = line.match(PLSQL_OBJECT_REGEX);
        const nestedMatch = line.match(NESTED_OBJECT_REGEX);
        const blockMatch = line.match(BLOCK_START_REGEX);
        const endMatch = line.match(END_REGEX);

        if (objectMatch) {
            const type = objectMatch[2].toLowerCase().includes('package') ? 'package' : objectMatch[2].toLowerCase();
            const node = createNode(objectMatch[3], type, i);
            addNodeToParent(stack, rootNodes, node);
            stack.push(node);
        } else if (nestedMatch) {
            // 处理嵌套的函数和过程，优先级高于BEGIN块
            const node = createNode(nestedMatch[2], nestedMatch[1].toLowerCase(), i);
            addNodeToParent(stack, rootNodes, node);
            stack.push(node);
        } else if (blockMatch) {
            // 处理所有BEGIN/DECLARE/EXCEPTION块
            const node = createNode(blockMatch[1], blockMatch[1].toLowerCase(), i);
            addNodeToParent(stack, rootNodes, node);
            stack.push(node);
        }
        
        if (endMatch && stack.length > 0) {
            const endName = endMatch[1]?.trim();
            if (endName) {
                // 有名称的END语句，弹出从匹配节点到栈顶的所有节点
                for (let j = stack.length - 1; j >= 0; j--) {
                    if (stack[j].label === endName) {
                        // 弹出从匹配节点到栈顶的所有节点
                        const nodesToPop = stack.splice(j);
                        nodesToPop.forEach(node => {
                            // 保持原始开始位置，只更新结束位置
                            const startLine = node.range?.start.line || 0;
                            node.range = new vscode.Range(
                                new vscode.Position(startLine, 0),
                                new vscode.Position(i, line.length)
                            );
                        });
                        break;
                    }
                }
            } else {
                // 无名称的END语句，使用优先级匹配策略
                let foundIndex = -1;
                
                // 优先匹配最近的function或procedure
                for (let j = stack.length - 1; j >= 0; j--) {
                    if (stack[j].type === 'function' || stack[j].type === 'procedure') {
                        foundIndex = j;
                        break;
                    }
                }
                
                // 如果没找到function/procedure，则匹配最近的非package块
                if (foundIndex === -1) {
                    for (let j = stack.length - 1; j >= 0; j--) {
                        if (stack[j].type !== 'package') {
                            foundIndex = j;
                            break;
                        }
                    }
                }
                
                if (foundIndex !== -1) {
                    const poppedNode = stack.splice(foundIndex, 1)[0];
                    // 保持原始开始位置，只更新结束位置
                    const startLine = poppedNode.range?.start.line || 0;
                    poppedNode.range = new vscode.Range(
                        new vscode.Position(startLine, 0),
                        new vscode.Position(i, line.length)
                    );
                }
            }
        }
    }

    return { nodes: rootNodes, errors };
}

function removeStringLiterals(line: string): string {
    let result = '';
    let inString = false;
    let i = 0;
    
    while (i < line.length) {
        if (line[i] === "'" && (i === 0 || line[i-1] !== '\\')) {
            if (inString) {
                // 字符串结束
                inString = false;
                result += ' '; // 用空格替换字符串内容
            } else {
                // 字符串开始
                inString = true;
                result += ' ';
            }
        } else if (!inString) {
            result += line[i];
        } else {
            result += ' '; // 字符串内容用空格替换
        }
        i++;
    }
    
    return result;
}

function removeComments(line: string, inMultiLineComment: boolean): [string, boolean] {
    let result = line;
    let newInMultiLineComment = inMultiLineComment;
    
    // 处理多行注释
    if (newInMultiLineComment) {
        const endIndex = result.indexOf('*/');
        if (endIndex !== -1) {
            result = result.substring(endIndex + 2);
            newInMultiLineComment = false;
        } else {
            return ['', newInMultiLineComment]; // 整行都在注释中
        }
    }
    
    // 处理单行注释
    const singleLineIndex = result.indexOf('--');
    if (singleLineIndex !== -1) {
        result = result.substring(0, singleLineIndex);
    }
    
    // 处理多行注释开始
    const multiLineStartIndex = result.indexOf('/*');
    if (multiLineStartIndex !== -1) {
        const multiLineEndIndex = result.indexOf('*/', multiLineStartIndex + 2);
        if (multiLineEndIndex !== -1) {
            result = result.substring(0, multiLineStartIndex) + 
                     result.substring(multiLineEndIndex + 2);
        } else {
            result = result.substring(0, multiLineStartIndex);
            newInMultiLineComment = true;
        }
    }
    
    return [result, newInMultiLineComment];
}

function isInsideFunctionOrProcedure(stack: PLSQLNode[]): boolean {
    return stack.some(node => node.type === 'function' || node.type === 'procedure');
}

function createNode(label: string, type: string, line: number): PLSQLNode {
    const icon = getIconForType(type);
    return {
        label,
        type,
        icon,
        children: [],
        range: new vscode.Range(
            new vscode.Position(line, 0),
            new vscode.Position(line, label.length)
        )
    };
}

function addNodeToParent(stack: PLSQLNode[], rootNodes: PLSQLNode[], node: PLSQLNode) {
    if (stack.length > 0) {
        let parent = stack[stack.length - 1];
        
        // 对于函数和过程，需要找到合适的父节点
        if (node.type === 'function' || node.type === 'procedure') {
            // 在package body中，函数和过程应该直接属于package
            // 跳过所有的begin/declare/exception块，找到package或其他合适的父节点
            while (parent && (parent.type === 'begin' || parent.type === 'declare' || parent.type === 'exception')) {
                if (parent.parent) {
                    parent = parent.parent;
                } else {
                    break;
                }
            }
        }
        // 对于BEGIN块，需要找到最近的function/procedure作为父节点
        else if (node.type === 'begin') {
            // 跳过其他begin/declare/exception块，找到function/procedure
            while (parent && (parent.type === 'begin' || parent.type === 'declare' || parent.type === 'exception')) {
                if (parent.parent) {
                    parent = parent.parent;
                } else {
                    break;
                }
            }
        }
        // 对于EXCEPTION块，需要与BEGIN块处于同一层级
        else if (node.type === 'exception') {
            // 跳过BEGIN/DECLARE块，找到函数/过程节点作为父节点
            while (parent && (parent.type === 'begin' || parent.type === 'declare')) {
                if (parent.parent) {
                    parent = parent.parent;
                } else {
                    break;
                }
            }
        }
        
        parent.children?.push(node);
        node.parent = parent;
    } else {
        rootNodes.push(node);
    }
}

function getIconForType(type: string): string {
    switch (type.toLowerCase()) {
        case 'package': return 'package';
        case 'procedure': return 'symbol-method';
        case 'function': return 'symbol-function';
        case 'trigger': return 'zap';
        case 'declare': return 'symbol-variable';
        case 'begin': return 'symbol-namespace';
        case 'exception': return 'error';
        default: return 'symbol-misc';
    }
}

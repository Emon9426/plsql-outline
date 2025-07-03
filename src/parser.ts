import * as vscode from 'vscode';
import { PLSQLNode, ParserResult } from './types';

const PLSQL_OBJECT_REGEX = /CREATE\s+(OR\s+REPLACE\s+)?(PACKAGE\s+BODY|PACKAGE|PROCEDURE|FUNCTION|TRIGGER)\s+([^\s(]+)/i;
const NESTED_OBJECT_START_REGEX = /\b(PROCEDURE|FUNCTION)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i;
const IS_AS_KEYWORD_REGEX = /\b(IS|AS)\b/i;
const BLOCK_START_REGEX = /\b(DECLARE|BEGIN|EXCEPTION)\b/i;
const END_REGEX = /END(\s+[^\s;]+)?\s*;/i;

export function parsePLSQL(text: string): ParserResult {
    const lines = text.split('\n');
    const stack: PLSQLNode[] = [];
    const rootNodes: PLSQLNode[] = [];
    const errors: string[] = [];
    let inMultiLineComment = false;
    
    // 多行函数/过程声明缓冲
    let functionBuffer = '';
    let inFunctionDeclaration = false;
    let functionStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
        const [cleanLine, newCommentState] = removeComments(lines[i], inMultiLineComment);
        inMultiLineComment = newCommentState;
        
        // 移除字符串字面量
        const lineWithoutStrings = removeStringLiterals(cleanLine);
        const line = lineWithoutStrings.trim();
        if (!line) continue; // 跳过空行
        
        // 检查是否在函数/过程声明中
        if (inFunctionDeclaration) {
            functionBuffer += ' ' + line;
            if (line.match(IS_AS_KEYWORD_REGEX)) {
                // 处理完整的函数声明
                const funcNode = processFunctionDeclaration(functionBuffer, functionStartLine);
                if (funcNode) {
                    addNodeToParent(stack, rootNodes, funcNode);
                    stack.push(funcNode);
                }
                inFunctionDeclaration = false;
                functionBuffer = '';
                continue;
            }
            // 如果当前行不包含IS/AS，继续收集
            continue;
        }
        
        const objectMatch = line.match(PLSQL_OBJECT_REGEX);
        const nestedMatch = line.match(NESTED_OBJECT_START_REGEX);
        const blockMatch = line.match(BLOCK_START_REGEX);
        const endMatch = line.match(END_REGEX);

        if (objectMatch) {
            const type = objectMatch[2].toLowerCase().includes('package') ? 'package' : objectMatch[2].toLowerCase();
            const node = createNode(objectMatch[3], type, i);
            addNodeToParent(stack, rootNodes, node);
            stack.push(node);
        } else if (nestedMatch) {
            // 检查是否包含IS/AS关键字
            if (line.match(IS_AS_KEYWORD_REGEX)) {
                // 单行函数/过程声明
                const node = createNode(nestedMatch[2], nestedMatch[1].toLowerCase(), i);
                addNodeToParent(stack, rootNodes, node);
                stack.push(node);
            } else {
                // 开始多行函数/过程声明
                inFunctionDeclaration = true;
                functionBuffer = line;
                functionStartLine = i;
            }
        } else if (blockMatch) {
            // 处理所有BEGIN/DECLARE/EXCEPTION块
            const node = createNode(blockMatch[1], blockMatch[1].toLowerCase(), i);
            addNodeToParent(stack, rootNodes, node);
            stack.push(node);
        }
        
        if (endMatch && stack.length > 0) {
            const endName = endMatch[1]?.trim();
            if (endName) {
                // 有名称的END语句，弹出匹配的节点及其后面的所有节点
                for (let j = stack.length - 1; j >= 0; j--) {
                    if (stack[j].label === endName) {
                        // 弹出从匹配节点之后到栈顶的所有节点
                        while (stack.length > j + 1) {
                            stack.pop();
                        }
                        // 弹出匹配的节点本身
                        const poppedNode = stack.pop();
                        if (poppedNode) {
                            // 保持原始开始位置，只更新结束位置
                            const startLine = poppedNode.range?.start.line || 0;
                            poppedNode.range = new vscode.Range(
                                new vscode.Position(startLine, 0),
                                new vscode.Position(i, line.length)
                            );
                        }
                        break;
                    }
                }
            } else {
                // 无名称的END语句，需要智能判断应该结束什么
                // 检查栈顶元素的类型来决定结束策略
                const topNode = stack[stack.length - 1];
                
                if (topNode.type === 'begin' || topNode.type === 'declare' || topNode.type === 'exception') {
                    // 如果栈顶是代码块，检查是否应该同时结束包含的函数/过程
                    // 查找最近的function/procedure
                    let functionIndex = -1;
                    for (let j = stack.length - 2; j >= 0; j--) {
                        if (stack[j].type === 'function' || stack[j].type === 'procedure') {
                            functionIndex = j;
                            break;
                        }
                    }
                    
                    // 弹出代码块
                    const blockNode = stack.pop()!;
                    const startLine = blockNode.range?.start.line || 0;
                    blockNode.range = new vscode.Range(
                        new vscode.Position(startLine, 0),
                        new vscode.Position(i, line.length)
                    );
                    
                    // 对于EXCEPTION块，通常意味着整个函数/过程的结束
                    // 对于BEGIN块，需要检查是否是函数/过程的唯一主体
                    if (functionIndex !== -1 && functionIndex < stack.length) {
                        const funcNode = stack[functionIndex];
                        
                        if (blockNode.type === 'exception') {
                            // EXCEPTION块通常是函数/过程的最后部分，弹出整个函数/过程
                            const poppedFunc = stack.splice(functionIndex, 1)[0];
                            const funcStartLine = poppedFunc.range?.start.line || 0;
                            poppedFunc.range = new vscode.Range(
                                new vscode.Position(funcStartLine, 0),
                                new vscode.Position(i, line.length)
                            );
                        } else if (blockNode.type === 'begin') {
                            // 对于BEGIN块，检查是否是函数/过程的唯一主体
                            if (funcNode.children && funcNode.children.length === 1 && 
                                funcNode.children[0] === blockNode) {
                                // 弹出function/procedure
                                const poppedFunc = stack.splice(functionIndex, 1)[0];
                                const funcStartLine = poppedFunc.range?.start.line || 0;
                                poppedFunc.range = new vscode.Range(
                                    new vscode.Position(funcStartLine, 0),
                                    new vscode.Position(i, line.length)
                                );
                            }
                        }
                    }
                } else {
                    // 如果栈顶是function/procedure/package，直接弹出
                    const poppedNode = stack.pop()!;
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

function processFunctionDeclaration(declaration: string, lineNumber: number): PLSQLNode | null {
    // 移除注释和字符串
    const cleanDeclaration = removeStringLiterals(removeComments(declaration, false)[0]);
    
    // 提取函数/过程名
    const match = cleanDeclaration.match(NESTED_OBJECT_START_REGEX);
    if (match) {
        return createNode(match[2], match[1].toLowerCase(), lineNumber);
    }
    return null;
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
            // 检查是否在package body的顶级
            // 如果栈中只有package，或者栈中有package但没有其他function/procedure，则是顶级
            let packageIndex = -1;
            let hasNestedFunctionProcedure = false;
            
            for (let i = 0; i < stack.length; i++) {
                if (stack[i].type === 'package') {
                    packageIndex = i;
                } else if (stack[i].type === 'function' || stack[i].type === 'procedure') {
                    hasNestedFunctionProcedure = true;
                }
            }
            
            if (packageIndex !== -1) {
                if (!hasNestedFunctionProcedure) {
                    // 顶级函数/过程，直接属于package
                    parent = stack[packageIndex];
                } else {
                    // 嵌套函数/过程，属于最近的function/procedure
                    for (let i = stack.length - 1; i >= 0; i--) {
                        if (stack[i].type === 'function' || stack[i].type === 'procedure') {
                            parent = stack[i];
                            break;
                        }
                    }
                }
            }
        }
        // 对于BEGIN块，需要智能判断父节点
        else if (node.type === 'begin') {
            // 如果栈顶是函数/过程，需要判断这个BEGIN是否是该函数/过程的主体
            if (parent.type === 'function' || parent.type === 'procedure') {
                // 检查是否已经有嵌套的函数/过程
                const hasNestedFunctions = parent.children?.some(child => 
                    child.type === 'function' || child.type === 'procedure'
                ) || false;
                
                if (hasNestedFunctions) {
                    // 如果有嵌套函数/过程，这个BEGIN是主体BEGIN，直接添加到当前函数/过程
                    parent = stack[stack.length - 1];
                } else {
                    // 如果没有嵌套函数/过程，这个BEGIN属于当前函数/过程
                    parent = stack[stack.length - 1];
                }
            } else {
                // 如果栈顶不是函数/过程，直接使用栈顶元素
                parent = stack[stack.length - 1];
            }
        }
        // 对于EXCEPTION块，找到最近的function/procedure/package作为父节点，跳过BEGIN块
        else if (node.type === 'exception') {
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].type === 'function' || stack[i].type === 'procedure' || stack[i].type === 'package') {
                    parent = stack[i];
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

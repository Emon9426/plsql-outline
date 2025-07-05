import { PLSQLNode, ParserResult } from './types';


const PLSQL_OBJECT_REGEX = /CREATE\s+(OR\s+REPLACE\s+)?(PACKAGE\s+BODY|PACKAGE|PROCEDURE|FUNCTION|TRIGGER)\s+([^\s(]+)/i;
const NESTED_OBJECT_START_REGEX = /\b(PROCEDURE|FUNCTION)\s+([a-zA-Z_][a-zA-Z0-9_]*)/i;
const IS_AS_KEYWORD_REGEX = /\b(IS|AS)\b/i;
const BLOCK_START_REGEX = /^\s*(DECLARE|BEGIN|EXCEPTION)\s*$/i; 
const END_REGEX = /END(\s+[^\s;]+)?\s*;/i;
const WHEN_REGEX = /^\s*WHEN\s+(.+?)\s+THEN\s*$/i;

// 包规范声明元素的正则表达式
const CONSTANT_REGEX = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+CONSTANT\s+/i;
const TYPE_REGEX = /^\s*TYPE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+IS\s+/i;
const EXCEPTION_REGEX = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+EXCEPTION\s*;/i;
const FUNCTION_DECLARATION_REGEX = /^\s*FUNCTION\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/i;
const PROCEDURE_DECLARATION_REGEX = /^\s*PROCEDURE\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/i;
const FUNCTION_DECLARATION_END_REGEX = /RETURN\s+[^;]+;$/i;
const PROCEDURE_DECLARATION_END_REGEX = /\)\s*;$/i;

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
    let pendingFunctionKeyword = false; // 新增：标记是否遇到了单独的FUNCTION/PROCEDURE关键字

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
                pendingFunctionKeyword = false;
                continue;
            }
            // 如果当前行不包含IS/AS，继续收集
            continue;
        }
        
        // 检查是否有单独的FUNCTION/PROCEDURE关键字（用于处理函数名在下一行的情况）
        if (pendingFunctionKeyword) {
            // 检查当前行是否是函数名
            const nameMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/i);
            if (nameMatch) {
                // 开始多行函数声明
                inFunctionDeclaration = true;
                functionBuffer = functionBuffer + ' ' + line;
                pendingFunctionKeyword = false;
                continue;
            } else {
                // 不是函数名，重置状态
                pendingFunctionKeyword = false;
                functionBuffer = '';
            }
        }
        
        const objectMatch = line.match(PLSQL_OBJECT_REGEX);
        const nestedMatch = line.match(NESTED_OBJECT_START_REGEX);
        const blockMatch = line.match(BLOCK_START_REGEX);
        const endMatch = line.match(END_REGEX);


        if (objectMatch) {
            // 正确识别包体和包规范
            let type = objectMatch[2].toLowerCase();
            if (type.includes('package body')) {
                type = 'package body';
            } else if (type.includes('package')) {
                type = 'package';
            }
            const node = createNode(objectMatch[3], type, i);
            
            // 对于顶级对象（PACKAGE、FUNCTION、PROCEDURE），清空栈并添加到根节点
            stack.length = 0;
            rootNodes.push(node);
            stack.push(node);
        } else if (nestedMatch) {
            // 检查是否包含IS/AS关键字
            if (line.match(IS_AS_KEYWORD_REGEX)) {
                // 单行函数/过程声明
                const node = createNode(nestedMatch[2], nestedMatch[1].toLowerCase(), i);
                addNodeToParent(stack, rootNodes, node);
                stack.push(node);
            } else if (stack.length > 0 && stack[0].type === 'package' && line.trim().endsWith(';')) {
                // 包规范中的函数/过程声明（以分号结尾）
                const node = createNode(nestedMatch[2], nestedMatch[1].toLowerCase(), i);
                addNodeToParent(stack, rootNodes, node);
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
            
            // 所有块都应该被推入栈中，包括EXCEPTION块（它可以有WHEN子节点）
            stack.push(node);
        } else {
            // 检查WHEN语句
            const whenMatch = line.match(WHEN_REGEX);
            if (whenMatch) {
                // 创建WHEN节点
                const whenCondition = whenMatch[1].trim();
                const node = createNode(`WHEN ${whenCondition}`, 'when', i);
                addNodeToParent(stack, rootNodes, node);
                // WHEN节点不需要推入栈中，因为它们通常是叶子节点
                continue;
            }
            // 检查是否是单独的FUNCTION/PROCEDURE关键字（用于处理函数名在下一行的情况）
            const standaloneKeywordMatch = line.match(/^(CREATE\s+(OR\s+REPLACE\s+)?)?(\s*)(FUNCTION|PROCEDURE)\s*$/i);
            if (standaloneKeywordMatch) {
                pendingFunctionKeyword = true;
                functionBuffer = line;
                functionStartLine = i;
            }
            // 检查包规范中的声明元素（只在包规范中处理）
            else if (stack.length > 0 && stack[0].type === 'package') {
                const constantMatch = line.match(CONSTANT_REGEX);
                const typeMatch = line.match(TYPE_REGEX);
                const exceptionMatch = line.match(EXCEPTION_REGEX);
                
                if (constantMatch) {
                    const node = createNode(constantMatch[1], 'constant', i);
                    addNodeToParent(stack, rootNodes, node);
                } else if (typeMatch) {
                    const node = createNode(typeMatch[1], 'type', i);
                    addNodeToParent(stack, rootNodes, node);
                } else if (exceptionMatch) {
                    const node = createNode(exceptionMatch[1], 'exception', i);
                    addNodeToParent(stack, rootNodes, node);
                }
            }
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
                            const startLine = poppedNode.range?.startLine || i;
                            poppedNode.range = { startLine, endLine: i };
                        }
                        break;
                    }
                }
            } else {
                // 无名称的END语句，需要智能判断应该结束什么
                // 检查栈顶元素的类型来决定结束策略
                const topNode = stack[stack.length - 1];
                
                if (topNode.type === 'begin' || topNode.type === 'declare' || topNode.type === 'exception') {
                    // 如果栈顶是代码块，弹出代码块
                    const blockNode = stack.pop()!;
                    const startLine = blockNode.range?.startLine || i;
                    blockNode.range = { startLine, endLine: i };
                    
                    // 检查是否还有栈顶元素，以及是否应该同时结束包含的函数/过程
                    if (stack.length > 0) {
                        const nextTopNode = stack[stack.length - 1];
                        
                        // 如果栈顶现在是function/procedure，并且刚弹出的是BEGIN块
                        if ((nextTopNode.type === 'function' || nextTopNode.type === 'procedure') && 
                            blockNode.type === 'begin') {
                            
                            // 简化判断：如果BEGIN块是函数/过程的直接子节点，则认为是主体BEGIN块
                            // 检查这个BEGIN块是否是该函数/过程的直接子节点
                            const funcChildren = nextTopNode.children || [];
                            const isDirectChild = funcChildren.includes(blockNode);
                            
                            if (isDirectChild) {
                                // 这是主体BEGIN块，同时结束函数/过程
                                const funcNode = stack.pop()!;
                                const funcStartLine = funcNode.range?.startLine || i;
                                funcNode.range = { startLine: funcStartLine, endLine: i };
                            }
                        }
                    }
                } else {
                    // 如果栈顶是function/procedure/package，直接弹出
                    const poppedNode = stack.pop()!;
                    const startLine = poppedNode.range?.startLine || i;
                    poppedNode.range = { startLine, endLine: i };
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
    let stringChar = '';
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        
        if (!inString) {
            // 检查字符串开始
            if (char === "'" || char === '"') {
                inString = true;
                stringChar = char;
                result += ' '; // 用空格替换字符串开始符号
            } else if (char === 'q' || char === 'Q') {
                // 检查替代引用语法 q'[...]'
                if (i + 2 < line.length && line[i + 1] === "'" && line[i + 2] === '[') {
                    // 找到对应的结束符 ]'
                    let endIndex = line.indexOf("]'", i + 3);
                    if (endIndex !== -1) {
                        // 替换整个q'[...]'为空格
                        result += ' '.repeat(endIndex - i + 2);
                        i = endIndex + 1;
                        continue;
                    }
                }
                result += char;
            } else {
                result += char;
            }
        } else {
            // 在字符串中
            if (char === stringChar) {
                // 检查是否是转义的引号
                if (i + 1 < line.length && line[i + 1] === stringChar) {
                    // 转义的引号，跳过两个字符
                    result += '  ';
                    i++;
                } else {
                    // 字符串结束
                    inString = false;
                    stringChar = '';
                    result += ' ';
                }
            } else {
                result += ' '; // 字符串内容用空格替换
            }
        }
        i++;
    }
    
    return result;
}

function removeComments(line: string, inMultiLineComment: boolean): [string, boolean] {
    // 如果整行都在多行注释中，直接返回空字符串
    if (inMultiLineComment) {
        // 检查是否有注释结束符
        const endIndex = line.indexOf('*/');
        if (endIndex !== -1) {
            // 注释在这一行结束，处理剩余部分
            const remainingLine = line.substring(endIndex + 2);
            return removeComments(remainingLine, false);
        } else {
            // 整行都在注释中
            return ['', true];
        }
    }
    
    let result = '';
    let newInMultiLineComment = false;
    let inString = false;
    let stringChar = '';
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        const nextChar = i + 1 < line.length ? line[i + 1] : '';
        
        // 检查字符串状态
        if (!inString) {
            if (char === "'" || char === '"') {
                inString = true;
                stringChar = char;
                result += char;
            } else if (char === 'q' || char === 'Q') {
                // 检查替代引用语法 q'[...]'
                if (i + 2 < line.length && line[i + 1] === "'" && line[i + 2] === '[') {
                    // 找到对应的结束符 ]'
                    let endIndex = line.indexOf("]'", i + 3);
                    if (endIndex !== -1) {
                        // 保留整个q'[...]'
                        result += line.substring(i, endIndex + 2);
                        i = endIndex + 1;
                        i++;
                        continue;
                    }
                }
                result += char;
            } else if (char === '/' && nextChar === '*') {
                // 多行注释开始，处理剩余部分
                const beforeComment = result;
                const afterCommentStart = line.substring(i + 2);
                const endIndex = afterCommentStart.indexOf('*/');
                
                if (endIndex !== -1) {
                    // 注释在同一行结束
                    const afterComment = afterCommentStart.substring(endIndex + 2);
                    const [processedAfter, commentState] = removeComments(afterComment, false);
                    return [beforeComment + processedAfter, commentState];
                } else {
                    // 注释跨行
                    return [beforeComment, true];
                }
            } else if (char === '-' && nextChar === '-') {
                // 单行注释开始，忽略行的剩余部分
                break;
            } else {
                result += char;
            }
        } else {
            // 在字符串中，注释符号无效
            if (char === stringChar) {
                // 检查是否是转义的引号
                if (i + 1 < line.length && line[i + 1] === stringChar) {
                    // 转义的引号，保留两个字符
                    result += char + line[i + 1];
                    i++;
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
        i++;
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
        range: { startLine: line, endLine: line }
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
        // 对于EXCEPTION块，应该属于最近的BEGIN块
        else if (node.type === 'exception') {
            // Exception块必须属于BEGIN块，找到最近的BEGIN块
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].type === 'begin') {
                    parent = stack[i];
                    break;
                }
            }
            // 如果没有找到BEGIN块，则使用栈顶元素（这种情况不应该发生）
            if (parent === stack[stack.length - 1]) {
                parent = stack[stack.length - 1];
            }
        }
        // 对于WHEN节点，应该属于最近的EXCEPTION块
        else if (node.type === 'when') {
            // WHEN节点必须属于EXCEPTION块，找到最近的EXCEPTION块
            for (let i = stack.length - 1; i >= 0; i--) {
                if (stack[i].type === 'exception') {
                    parent = stack[i];
                    break;
                }
            }
            // 如果没有找到EXCEPTION块，则使用栈顶元素（这种情况不应该发生）
            if (parent.type !== 'exception') {
                parent = stack[stack.length - 1];
            }
        }
        // 对于其他类型的节点，检查是否在Exception块中
        else if (stack.length > 0 && stack[stack.length - 1].type === 'exception') {
            // 非WHEN节点不应该属于Exception块
            // 新节点应该成为Exception块的同级节点，即Exception块的父节点的子节点
            for (let i = stack.length - 2; i >= 0; i--) {
                if (stack[i].type === 'begin') {
                    parent = stack[i];
                    break;
                }
            }
            // 如果没有找到BEGIN块，使用栈中Exception块之前的节点
            if (parent === stack[stack.length - 1]) {
                if (stack.length > 1) {
                    parent = stack[stack.length - 2];
                } else {
                    rootNodes.push(node);
                    return;
                }
            }
        }
        
        parent.children?.push(node);
        // 设置parent属性以支持VS Code TreeDataProvider
        node.parent = parent;
    } else {
        rootNodes.push(node);
    }
}

function getIconForType(type: string): string {
    switch (type.toLowerCase()) {
        case 'package': return 'package';
        case 'package body': return 'package';
        case 'procedure': return 'symbol-method';
        case 'function': return 'symbol-function';
        case 'trigger': return 'zap';
        case 'declare': return 'symbol-variable';
        case 'begin': return 'symbol-namespace';
        case 'exception': return 'error';
        case 'when': return 'arrow-right';
        case 'constant': return 'symbol-constant';
        case 'type': return 'symbol-class';
        default: return 'symbol-misc';
    }
}

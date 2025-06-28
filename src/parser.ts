import * as vscode from 'vscode';
import { PLSQLNode, ParserResult } from './types';

const PLSQL_OBJECT_REGEX = /CREATE\s+(OR\s+REPLACE\s+)?(PACKAGE|PROCEDURE|FUNCTION|TRIGGER)\s+([^\s(]+)/i;
const NESTED_OBJECT_REGEX = /(PROCEDURE|FUNCTION)\s+([^\s(]+)/i;
const BLOCK_START_REGEX = /(DECLARE|BEGIN|EXCEPTION)/i;
const END_REGEX = /END(\s+[^\s;]+)?\s*;/i;

export function parsePLSQL(text: string): ParserResult {
    const lines = text.split('\n');
    const stack: PLSQLNode[] = [];
    const rootNodes: PLSQLNode[] = [];
    const errors: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const objectMatch = line.match(PLSQL_OBJECT_REGEX);
        const blockMatch = line.match(BLOCK_START_REGEX);
        const endMatch = line.match(END_REGEX);

        if (objectMatch) {
            const node = createNode(objectMatch[3], objectMatch[2].toLowerCase(), i);
            addNodeToParent(stack, rootNodes, node);
            stack.push(node);
        } else if (blockMatch) {
            const node = createNode(blockMatch[1], blockMatch[1].toLowerCase(), i);
            addNodeToParent(stack, rootNodes, node);
            stack.push(node);
        } else {
            const nestedMatch = line.match(NESTED_OBJECT_REGEX);
            if (nestedMatch) {
                const node = createNode(nestedMatch[2], nestedMatch[1].toLowerCase(), i);
                addNodeToParent(stack, rootNodes, node);
                stack.push(node);
            }
        }
        
        if (endMatch && stack.length > 0) {
            const endName = endMatch[1]?.trim();
            if (endName) {
                // 有名称的END语句，弹出到对应的过程/函数
                while (stack.length > 0) {
                    const poppedNode = stack.pop();
                    if (poppedNode) {
                        poppedNode.range = new vscode.Range(
                            new vscode.Position(poppedNode.range?.start.line || i, 0),
                            new vscode.Position(i, line.length)
                        );
                        if (poppedNode.label === endName) {
                            break;
                        }
                    }
                }
            } else {
                // 无名称的END语句，只弹出最近的节点
                const poppedNode = stack.pop();
                if (poppedNode) {
                    poppedNode.range = new vscode.Range(
                        new vscode.Position(poppedNode.range?.start.line || i, 0),
                        new vscode.Position(i, line.length)
                    );
                }
            }
        }
    }

    return { nodes: rootNodes, errors };
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
        // 如果当前父节点是begin/declare/exception，则使用其父节点作为真正的父节点
        if (parent.type === 'begin' || parent.type === 'declare' || parent.type === 'exception') {
            // 如果栈顶节点有父节点（即栈顶节点不是根节点）
            if (parent.parent) {
                parent = parent.parent;
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

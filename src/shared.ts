import { ParseNode, NodeType } from './types';

/**
 * 默认支持解析的文件扩展名（package.json fileExtensions 默认值同源）
 */
export const DEFAULT_FILE_EXTENSIONS = ['.sql', '.fnc', '.fcn', '.prc', '.pks', '.pkb', '.typ'] as const;

/**
 * 可调用节点（有名字、可跳转定义的子程序），含声明形态（前向声明/包规格声明）
 */
export function isCallableNode(node: ParseNode): boolean {
    return node.type === NodeType.FUNCTION ||
        node.type === NodeType.PROCEDURE ||
        node.type === NodeType.FUNCTION_DECLARATION ||
        node.type === NodeType.PROCEDURE_DECLARATION;
}

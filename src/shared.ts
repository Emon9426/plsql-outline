import { ParseNode, NodeType } from './types';

/**
 * 默认支持解析的文件扩展名（package.json fileExtensions 默认值同源）
 */
export const DEFAULT_FILE_EXTENSIONS = ['.sql', '.fnc', '.fcn', '.prc', '.pks', '.pkb', '.pck', '.typ'] as const;

/**
 * 可调用节点（有名字、可跳转定义的子程序），含声明形态（前向声明/包规格声明）
 */
export function isCallableNode(node: ParseNode): boolean {
    return node.type === NodeType.FUNCTION ||
        node.type === NodeType.PROCEDURE ||
        node.type === NodeType.FUNCTION_DECLARATION ||
        node.type === NodeType.PROCEDURE_DECLARATION;
}

/**
 * 构造 SQL 的 markdown 代码块（Issue #33 游标悬浮）。
 * 围栏长度取 max(3, 文本内最长反引号连串 + 1)，避免 SQL 中的 ``` 序列提前闭合代码块。
 */
export function buildSqlMarkdownBlock(sql: string): string {
    let maxRun = 0;
    for (const run of sql.match(/`+/g) || []) {
        maxRun = Math.max(maxRun, run.length);
    }
    const fence = '`'.repeat(Math.max(3, maxRun + 1));
    return `${fence}sql\n${sql}\n${fence}`;
}

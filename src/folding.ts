import { ParseNode, ParseResult, NodeType } from './types';

/**
 * 折叠范围（1-based 闭区间行号，与解析器 declarationLine/endLine 口径一致）
 */
export interface FoldRange {
    startLine: number;
    endLine: number;
}

/**
 * 不产生独立折叠的分支节点类型：
 * ELSIF/ELSE/WHEN 属于 IF/CASE 的内部结构，其行范围已包含在宿主折叠范围内，
 * 单独折叠会造成同层级碎片化的折叠箭头（Issue #23）。
 */
const NON_FOLDABLE_TYPES: ReadonlySet<NodeType> = new Set<NodeType>([
    NodeType.ELSIF_BRANCH,
    NodeType.ELSE_BRANCH,
    NodeType.WHEN_BRANCH
]);

/**
 * 从解析结果计算块结构折叠范围（纯函数，vscode-free，供单元测试直接覆盖）。
 *
 * 规则（Issue #23）：
 * - 凡解析器已闭合的节点（endLine 非空且大于声明行）均产生折叠范围：
 *   Function/Procedure → END、LOOP/WHILE/FOR → END LOOP、CASE → END CASE、
 *   匿名块 → END、Package Body → 结束 END。
 * - IF 行折叠需到达 END IF 行：解析器把 IF/ELSIF/ELSE 拆为同级兄弟节点
 *   （每个分支在下一分支出现时闭合，因此后一分支的 declarationLine 恰为
 *   前一节点的 endLine），须把 IF 与后续连续 ELSIF/ELSE 兄弟链合并，取链上
 *   最后一个分支的 endLine（即 END IF 行）。行号不连续的同级 ELSE（如 CASE
 *   的 ELSE 与其内嵌 IF）不会误合并。
 * - endLine 为空（未闭合，如 Package Header/Trigger/Type Body 根节点——解析器
 *   已知正常行为）或与声明行相同的节点不产生折叠。
 * - 输出按起始行升序、同起始行按结束行降序排序（外层块在前），并去重。
 */
export function computeFoldRanges(parseResult: ParseResult | null): FoldRange[] {
    const ranges: FoldRange[] = [];
    const seen: Set<string> = new Set();

    const isIfChainBranch = (n: ParseNode): boolean =>
        n.type === NodeType.ELSIF_BRANCH || n.type === NodeType.ELSE_BRANCH;

    const pushRange = (startLine: number, endLine: number | null | undefined): void => {
        if (endLine === null || endLine === undefined || endLine <= startLine) {
            return;
        }
        const key = `${startLine}:${endLine}`;
        if (!seen.has(key)) {
            seen.add(key);
            ranges.push({ startLine, endLine });
        }
    };

    const visit = (nodes: ParseNode[]): void => {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node.type === NodeType.IF_STATEMENT) {
                // IF 链合并：沿兄弟数组向后吸收连续 ELSIF/ELSE（行号必须首尾相接）
                let mergedEnd = node.endLine;
                let j = i + 1;
                while (j < nodes.length && isIfChainBranch(nodes[j]) &&
                    nodes[j].declarationLine === mergedEnd) {
                    mergedEnd = nodes[j].endLine ?? mergedEnd;
                    j++;
                }
                pushRange(node.declarationLine, mergedEnd);
            } else if (!NON_FOLDABLE_TYPES.has(node.type)) {
                pushRange(node.declarationLine, node.endLine);
            }
            visit(node.children);
        }
    };

    if (parseResult && parseResult.nodes) {
        visit(parseResult.nodes);
    }

    ranges.sort((a, b) => a.startLine - b.startLine || b.endLine - a.endLine);
    return ranges;
}

/**
 * 书签核心逻辑（vscode-free，Issue：书签功能 v1.17.0）
 *
 * 与 folding.ts/highlight.ts 同惯例：不 import 'vscode'，单元测试直接 require。
 * 包含两块纯逻辑：
 *  1. applyDocumentChanges —— 书签行跟随文档编辑迁移（含整行删除随之删签）
 *  2. findEnclosingSymbol / buildSummaryChain —— 书签所属子程序与结构链路摘要
 *
 * 交互说明（2026-10-06 实测定稿）：行号单击切换书签（每次点未选中的行号必产生
 * 一个整行选事件）；双击不可检测——VS Code 对同选区点击零事件，双击第二击
 * 完全不可见（GutterClickDetector 状态机已随双击方案删除）。
 *
 * 行号口径：内部一律 0-based（bookmark.line），显示层 +1。
 */
import { ParseNode, NodeType } from './types';

/**
 * 书签数据（可 JSON 序列化，直接持久化到 workspaceState）
 */
export interface BookmarkData {
    /** 0-based 行号 */
    line: number;
    /** 用户命名；空串 = 未命名（显示层回退为行内容预览） */
    name: string;
    /** 用户备注；空串 = 无 */
    note: string;
    /** 创建时间戳（毫秒） */
    createdAt: number;
}

/**
 * 文档内容变更的 vscode-free 镜像（TextDocumentContentChangeEvent 的位置子集）
 */
export interface BookmarkContentChange {
    startLine: number;
    startChar: number;
    endLine: number;
    endChar: number;
    /** 替换后的新文本 */
    text: string;
}

/**
 * 跟随算法结果：存活书签（已按新行号调整）与被删除数量
 */
export interface BookmarkChangeResult {
    kept: BookmarkData[];
    removedCount: number;
}

/**
 * 应用一次文档变更序列，迁移书签行号。
 *
 * 书签锚定"行内容"而非行号（用户示例：bbb 行书签，其上插入一行 → 书签 2→3）。
 * 规则（0-based 行号 L，变更区间 [S,E)，新文本含 newLines 个换行，
 * delta = newLines - (E.line - S.line)）：
 *  a. 变更起点在锚点 (L,0) 之后（同行列 >0 或更靠下的行）      → 不变
 *  b. 恰在 (L,0) 纯插入：新文本以 \n 结尾（推挤本行内容）      → L += newLines
 *  c. 恰在 (L,0) 行内编辑/整行文本替换（E 与 S 同行）           → 不变（行仍在）
 *  d. S == (L,0) 且 E.line > L（吞掉了本行的换行符）            → 整行删除 → 删签
 *  e. 变更完全在本行上方结束（E < (L,0)，含 E 恰为 (L,0) 的删行）→ L += delta
 *  f. S 在上方且 E.line > L（区间整体吞掉本行）                 → 删签
 *  g. S 在上方且 E 落在本行中部（上行删除 + 本行头部被吞）       → L = S.line + newLines
 *     （本行尾部内容上移合并到该行，书签跟内容走）
 *
 * "整行删除"判定口径：变更区间吞掉了本行的换行符（行作为一整行消失）。
 * 只删行内文本（不含换行）时行仍存在（可能变空行），书签保留。
 *
 * 多变更（多光标）：内部按起点位置降序归一后逐个应用——下方变更先调整其下方
 * 书签，不影响上方变更的坐标；对 VS Code 给定的天然降序数组为恒等变换。
 *
 * @param lineCount 变更后的文档总行数（防御性裁剪：越界书签丢弃）
 */
export function applyDocumentChanges(
    bookmarks: BookmarkData[],
    changes: BookmarkContentChange[],
    lineCount: number
): BookmarkChangeResult {
    if (changes.length === 0) {
        return { kept: prune(bookmarks, lineCount), removedCount: 0 };
    }
    const sorted = [...changes].sort((a, b) =>
        b.startLine - a.startLine || b.startChar - a.startChar);

    let kept = bookmarks.map(b => ({ ...b }));
    let removedCount = 0;

    for (const change of sorted) {
        const newLines = countNewlines(change.text);
        const next: BookmarkData[] = [];
        for (const bm of kept) {
            const r = translateBookmark(bm.line, change, newLines);
            if (r === 'removed') {
                removedCount++;
            } else {
                bm.line = r;
                next.push(bm);
            }
        }
        kept = next;
    }
    kept = prune(kept, lineCount);
    return { kept, removedCount };
}

/** 单个书签行在单个变更下的迁移：返回新行号或 'removed' */
function translateBookmark(
    line: number,
    change: BookmarkContentChange,
    newLines: number
): number | 'removed' {
    const { startLine: sl, startChar: sc, endLine: el, endChar: ec, text } = change;

    // (a) 变更起点在锚点 (line,0) 之后
    if (sl > line || (sl === line && sc > 0)) {
        return line;
    }
    if (sl === line) {
        // 起点恰为 (line,0)
        if (el === line && ec === 0 && sc === 0) {
            // (b) 纯插入：新文本以换行结尾 → 本行内容被推到下方
            if (newLines > 0 && text.endsWith('\n')) {
                return line + newLines;
            }
            return line;
        }
        if (el === line) {
            // (c) 行内编辑（含整行文本替换，不吞换行）：行仍在
            return line;
        }
        // (d) 吞掉本行换行 → 整行消失
        return 'removed';
    }
    // 起点在上方（sl < line）
    if (el < line || (el === line && ec === 0)) {
        // (e) 完全在本行上方结束
        const delta = newLines - (el - sl);
        return line + delta;
    }
    if (el > line) {
        // (f) 区间吞掉整个本行
        return 'removed';
    }
    // (g) E 落在本行中部：本行尾部内容合并到 sl + newLines 行
    return sl + newLines;
}

function countNewlines(text: string): number {
    let n = 0;
    for (let i = text.indexOf('\n'); i >= 0; i = text.indexOf('\n', i + 1)) {
        n++;
    }
    return n;
}

/** 防御性裁剪：越界（文档缩短后不存在）的书签丢弃 */
function prune(bookmarks: BookmarkData[], lineCount: number): BookmarkData[] {
    if (lineCount <= 0) {
        return bookmarks.length === 0 ? bookmarks : [];
    }
    return bookmarks.filter(b => b.line >= 0 && b.line < lineCount);
}

/* ------------------------------------------------------------------ */
/* 所属子程序与结构链路摘要（基于大纲解析树，实时计算不落盘）              */
/* ------------------------------------------------------------------ */

/** 控制结构类型的链路标签（与显示层合并展示口径无关，按解析树原始节点取标签） */
const CONTROL_TYPE_LABELS: ReadonlyMap<NodeType, string> = new Map([
    [NodeType.IF_STATEMENT, 'IF'],
    [NodeType.ELSIF_BRANCH, 'ELSIF'],
    [NodeType.ELSE_BRANCH, 'ELSE'],
    [NodeType.LOOP_STATEMENT, 'LOOP'],
    [NodeType.WHILE_LOOP, 'WHILE'],
    [NodeType.FOR_LOOP, 'FOR'],
    [NodeType.CASE_STATEMENT, 'CASE'],
    [NodeType.WHEN_BRANCH, 'WHEN']
]);

function isControlType(type: NodeType): boolean {
    return CONTROL_TYPE_LABELS.has(type);
}

/** 节点行范围（1-based 闭区间，与 extension.isNodeScopeContainsLine 同口径）是否包含该行 */
function nodeContainsLine(node: ParseNode, line: number): boolean {
    const start = node.declarationLine;
    let end = node.endLine || node.declarationLine;
    if (node.children.length > 0) {
        const last = lastDescendantEndLine(node);
        end = Math.max(end, last);
    }
    return line >= start && line <= end;
}

function lastDescendantEndLine(node: ParseNode): number {
    let end = node.endLine || node.declarationLine;
    for (const child of node.children) {
        end = Math.max(end, lastDescendantEndLine(child));
    }
    return end;
}

/**
 * 沿包含链收集祖先节点（根 → 最内层）。
 * 行号 1-based（与解析树 declarationLine 同口径）。
 */
export function collectAncestorsByLine(nodes: ParseNode[], line: number): ParseNode[] {
    for (const node of nodes) {
        if (nodeContainsLine(node, line)) {
            return [node, ...collectAncestorsByLine(node.children, line)];
        }
    }
    return [];
}

/**
 * 书签所属 Function/Procedure：包含该行的最内层可调用节点（含嵌套子程序、
 * 声明形态）；无可调用祖先时兜底取最外层容器（包体/触发器/匿名块等），
 * 都没有（顶层裸行）返回 null。
 */
export function findEnclosingSymbol(nodes: ParseNode[], line: number): ParseNode | null {
    const chain = collectAncestorsByLine(nodes, line);
    if (chain.length === 0) {
        return null;
    }
    for (let i = chain.length - 1; i >= 0; i--) {
        const node = chain[i];
        if (isCallableNodeType(node.type)) {
            return node;
        }
    }
    // 无可调用祖先：最外层容器兜底（控制结构不作为"所属"）
    const root = chain[0];
    return isControlType(root.type) ? null : root;
}

function isCallableNodeType(type: NodeType): boolean {
    return type === NodeType.FUNCTION ||
        type === NodeType.PROCEDURE ||
        type === NodeType.FUNCTION_DECLARATION ||
        type === NodeType.PROCEDURE_DECLARATION;
}

/**
 * 书签摘要：根 → 最内层的结构链路文本，如 `order_mgr → calc_total → IF`。
 * 命名节点取名称，控制结构取关键字标签。
 */
export function buildSummaryChain(nodes: ParseNode[], line: number): string {
    const chain = collectAncestorsByLine(nodes, line);
    const labels = chain.map(node => {
        const control = CONTROL_TYPE_LABELS.get(node.type);
        if (control) {
            return control;
        }
        return node.name || node.type;
    });
    return labels.join(' → ');
}

/* ------------------------------------------------------------------ */
/* 行文本展示辅助                                                       */
/* ------------------------------------------------------------------ */

/** 书签默认名：行内容 trim 后前 40 字符；空行显示占位符 */
export function defaultBookmarkName(lineText: string): string {
    const trimmed = lineText.trim();
    if (!trimmed) {
        return '(空行)';
    }
    return trimmed.length > 40 ? trimmed.slice(0, 40) + '…' : trimmed;
}

/** 行内容预览：trim 后前 80 字符（空行返回空串，显示层自行占位） */
export function previewLineText(lineText: string): string {
    const trimmed = lineText.trim();
    return trimmed.length > 80 ? trimmed.slice(0, 80) + '…' : trimmed;
}

/** 所属子程序的显示文本：`PROCEDURE calc_total`；无所属返回 '（顶层）' */
export function enclosingSymbolLabel(node: ParseNode | null): string {
    if (!node) {
        return '（顶层）';
    }
    const kind = node.type === NodeType.FUNCTION || node.type === NodeType.FUNCTION_DECLARATION
        ? 'FUNCTION'
        : node.type === NodeType.PROCEDURE || node.type === NodeType.PROCEDURE_DECLARATION
            ? 'PROCEDURE'
            : node.type === NodeType.PACKAGE_BODY
                ? 'PACKAGE BODY'
                : node.type === NodeType.PACKAGE_HEADER
                    ? 'PACKAGE'
                    : node.type === NodeType.TRIGGER
                        ? 'TRIGGER'
                        : node.type === NodeType.ANONYMOUS_BLOCK
                            ? '匿名块'
                            : node.type;
    return node.name ? `${kind} ${node.name}` : kind;
}

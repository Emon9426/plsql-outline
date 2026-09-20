import { ParseNode, ParseResult, NodeType } from './types';
import { PLSQLParser } from './parser';

/**
 * 结构关键字配对高亮（Issue #31）——纯函数模块，vscode-free，供单元测试直接覆盖。
 *
 * 两个职责：
 * 1. maskLiteralsAndComments：把字符串字面量（标准 '' 与 Q-quote，含跨行）与注释
 *    （-- 与 /\*\*\/，含跨行）替换为等长空格——列位置与原文一一对应，后续关键字
 *    定位/词提取天然跳过非代码区域。Q-quote 语义复用 PLSQLParser 的静态扫描器，
 *    与解析器保持同一口径（含 q'[...含 -- 或 /* ...]' 不被误判）。
 * 2. buildKeywordGroups / findKeywordGroupAt：从解析树构造关键字配对组——
 *    - block 组（DECLARE/BEGIN/EXCEPTION/END）：凡 beginLine 非空的节点
 *      （子程序/匿名块/包体初始化节/触发器等）一组，匿名块含 DECLARE；
 *    - if 组（IF/ELSIF/ELSE/END IF）：IF_STATEMENT + 行号首尾相接的
 *      ELSIF/ELSE 兄弟链（与 folding.ts 合并口径一致）；
 *    - loop 组（FOR|WHILE + LOOP + END LOOP）：三类循环节点各一组。
 *
 * 命中规则：光标词与某组内同行 span 重叠即命中该组（覆盖「END IF / END LOOP
 * 复合关键字中的 END 或 IF/LOOP」与「FOR..LOOP 行中的任一关键字」）。
 * 未命中由调用方返回空数组——VS Code 对空结果回退原生词高亮，原生行为不受影响。
 */

/**
 * 关键字范围：1-based 行号（与解析器口径一致）+ 0-based 半开字符区间 [start, end)
 */
export interface KeywordSpan {
    line: number;
    start: number;
    end: number;
}

export type KeywordGroupKind = 'block' | 'if' | 'loop';

export interface KeywordGroup {
    kind: KeywordGroupKind;
    spans: KeywordSpan[];
}

const LOOP_TYPES: ReadonlySet<NodeType> = new Set<NodeType>([
    NodeType.LOOP_STATEMENT,
    NodeType.WHILE_LOOP,
    NodeType.FOR_LOOP
]);

/**
 * 字符串/注释掩码（等长空格替换，保留换行结构）。
 * 跨行状态：多行注释与未闭合字符串（Q-quote/标准）与 parser 预处理同口径。
 */
export function maskLiteralsAndComments(content: string): string[] {
    const lines = content.split('\n');
    const out: string[] = new Array<string>(lines.length);
    let inComment = false;
    // 未闭合字符串的闭合序列（Q-quote 为 定界符+'；标准字符串为 '）
    let closeSeq: string | null = null;

    for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        const chars = line.split('');
        const mask = (from: number, to: number): void => {
            for (let k = from; k < to && k < chars.length; k++) {
                chars[k] = ' ';
            }
        };

        let i = 0;
        while (i < line.length) {
            if (inComment) {
                const close = line.indexOf('*/', i);
                if (close === -1) {
                    mask(i, line.length);
                    i = line.length;
                } else {
                    mask(i, close + 2);
                    i = close + 2;
                    inComment = false;
                }
                continue;
            }
            if (closeSeq !== null) {
                const close = line.indexOf(closeSeq, i);
                if (close === -1) {
                    mask(i, line.length);
                    i = line.length;
                } else {
                    mask(i, close + closeSeq.length);
                    i = close + closeSeq.length;
                    closeSeq = null;
                }
                continue;
            }
            const two = line.substring(i, i + 2);
            if (two === '--') {
                mask(i, line.length);
                i = line.length;
                continue;
            }
            if (two === '/*') {
                inComment = true;
                continue; // 进入 inComment 分支完成本行掩码
            }
            const q = PLSQLParser.matchQStringStart(line, i);
            if (q !== null || line[i] === '\'') {
                if (q !== null) {
                    const end = PLSQLParser.scanQStringEnd(line, i, q);
                    if (end > i) {
                        mask(i, end + 1);
                        i = end + 1;
                    } else {
                        closeSeq = q.close + '\'';
                        mask(i, line.length);
                        i = line.length;
                    }
                    continue;
                }
                // 标准字符串（'' 为转义引号）
                const end = scanStdStringEnd(line, i);
                if (end !== -1) {
                    mask(i, end + 1);
                    i = end + 1;
                } else {
                    closeSeq = '\'';
                    mask(i, line.length);
                    i = line.length;
                }
                continue;
            }
            i++;
        }
        out[li] = chars.join('');
    }
    return out;
}

/** 标准字符串闭合扫描（'' 转义），返回闭合 ' 索引，未闭合返回 -1 */
function scanStdStringEnd(line: string, start: number): number {
    let j = start + 1;
    while (j < line.length) {
        if (line[j] === '\'') {
            if (line[j + 1] === '\'') {
                j += 2;
                continue;
            }
            return j;
        }
        j++;
    }
    return -1;
}

/** 掩码行上按 \b 词边界查找关键字首个出现，返回 span 或 null */
function findToken(maskedLine: string, word: string): KeywordSpan | null {
    const re = new RegExp(`\\b${word}\\b`, 'i');
    const m = re.exec(maskedLine);
    return m ? { line: 0, start: m.index, end: m.index + m[0].length } : null;
}

/** 掩码行上查找复合关键字（如 END IF / END LOOP），返回 span 或 null */
function findPattern(maskedLine: string, pattern: string): KeywordSpan | null {
    const re = new RegExp(pattern, 'i');
    const m = re.exec(maskedLine);
    return m ? { line: 0, start: m.index, end: m.index + m[0].length } : null;
}

/**
 * 块级 END 定位：只接受裸 END / END 名称 / END;，
 * 不接受 END IF / END LOOP / END CASE（属于内层结构，避免块组误吃内层 END 行）。
 */
function findBlockEndToken(maskedLine: string): KeywordSpan | null {
    const m = /\bEND\b/i.exec(maskedLine);
    if (!m) {
        return null;
    }
    const after = maskedLine.substring(m.index + 3).trimStart().toUpperCase();
    if (after.startsWith('IF') || after.startsWith('LOOP') || after.startsWith('CASE')) {
        return null;
    }
    return { line: 0, start: m.index, end: m.index + 3 };
}

/** 行取 span（1-based 行号便捷封装） */
function spanAt(line: number, span: KeywordSpan | null): KeywordSpan | null {
    return span ? { line, start: span.start, end: span.end } : null;
}

/**
 * 从解析结果构造全部关键字配对组
 */
export function buildKeywordGroups(parseResult: ParseResult | null, maskedLines: string[]): KeywordGroup[] {
    const groups: KeywordGroup[] = [];

    const lineAt = (line: number): string => maskedLines[line - 1] ?? '';

    const isIfChainBranch = (n: ParseNode): boolean =>
        n.type === NodeType.ELSIF_BRANCH || n.type === NodeType.ELSE_BRANCH;

    const visit = (nodes: ParseNode[]): void => {
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            // ---- block 组：DECLARE/BEGIN/EXCEPTION/END ----
            if (node.beginLine !== null && node.beginLine !== undefined) {
                const spans: KeywordSpan[] = [];
                if (node.type === NodeType.ANONYMOUS_BLOCK) {
                    const sp = spanAt(node.declarationLine, findToken(lineAt(node.declarationLine), 'DECLARE'));
                    if (sp) { spans.push(sp); }
                }
                const begin = spanAt(node.beginLine, findToken(lineAt(node.beginLine), 'BEGIN'));
                if (begin) { spans.push(begin); }
                if (node.exceptionLine !== null && node.exceptionLine !== undefined) {
                    const exc = spanAt(node.exceptionLine, findToken(lineAt(node.exceptionLine), 'EXCEPTION'));
                    if (exc) { spans.push(exc); }
                }
                if (node.endLine !== null && node.endLine !== undefined) {
                    const end = spanAt(node.endLine, findBlockEndToken(lineAt(node.endLine)));
                    if (end) { spans.push(end); }
                }
                // 单一 span 无配对意义（如未闭合触发器仅 BEGIN），不建组
                if (spans.length >= 2) {
                    groups.push({ kind: 'block', spans });
                }
            }

            // ---- if 组：IF + ELSIF/ELSE 链 + END IF ----
            if (node.type === NodeType.IF_STATEMENT) {
                const spans: KeywordSpan[] = [];
                const ifTok = spanAt(node.declarationLine, findToken(lineAt(node.declarationLine), 'IF'));
                if (ifTok) { spans.push(ifTok); }
                // 兄弟链合并口径与 folding.ts 一致：行号首尾相接的连续 ELSIF/ELSE
                let mergedEnd = node.endLine;
                let j = i + 1;
                while (j < nodes.length && isIfChainBranch(nodes[j]) &&
                    nodes[j].declarationLine === mergedEnd) {
                    const branchWord = nodes[j].type === NodeType.ELSIF_BRANCH ? 'ELSIF' : 'ELSE';
                    const sp = spanAt(nodes[j].declarationLine, findToken(lineAt(nodes[j].declarationLine), branchWord));
                    if (sp) { spans.push(sp); }
                    mergedEnd = nodes[j].endLine ?? mergedEnd;
                    j++;
                }
                if (mergedEnd !== null && mergedEnd !== undefined) {
                    const endIf = spanAt(mergedEnd, findPattern(lineAt(mergedEnd), '\\bEND\\s+IF\\b'));
                    if (endIf) { spans.push(endIf); }
                }
                if (spans.length >= 2) {
                    groups.push({ kind: 'if', spans });
                }
            }

            // ---- loop 组：FOR|WHILE + LOOP + END LOOP ----
            if (LOOP_TYPES.has(node.type)) {
                const spans: KeywordSpan[] = [];
                const declLine = lineAt(node.declarationLine);
                const headWord = node.type === NodeType.FOR_LOOP ? 'FOR'
                    : node.type === NodeType.WHILE_LOOP ? 'WHILE' : null;
                if (headWord) {
                    const head = spanAt(node.declarationLine, findToken(declLine, headWord));
                    if (head) { spans.push(head); }
                }
                const loopTok = spanAt(node.declarationLine, findToken(declLine, 'LOOP'));
                if (loopTok) { spans.push(loopTok); }
                if (node.endLine !== null && node.endLine !== undefined) {
                    const endLoop = spanAt(node.endLine, findPattern(lineAt(node.endLine), '\\bEND\\s+LOOP\\b'));
                    if (endLoop) { spans.push(endLoop); }
                }
                if (spans.length >= 2) {
                    groups.push({ kind: 'loop', spans });
                }
            }

            visit(node.children);
        }
    };

    if (parseResult && parseResult.nodes) {
        visit(parseResult.nodes);
    }
    return groups;
}

/**
 * 光标词 → 配对组：词区间与某组同行 span 重叠即命中。
 * line 为 1-based；start/end 为 0-based 半开区间。
 */
export function matchKeywordGroup(
    groups: KeywordGroup[],
    line: number,
    wordStart: number,
    wordEnd: number
): KeywordGroup | null {
    for (const g of groups) {
        for (const s of g.spans) {
            if (s.line === line && wordStart < s.end && wordEnd > s.start) {
                return g;
            }
        }
    }
    return null;
}

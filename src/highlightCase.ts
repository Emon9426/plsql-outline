import { KeywordSpan, KeywordGroup } from './highlight';

/**
 * CASE 关键字配对组（Issue #55）——纯函数模块，vscode-free。
 *
 * 表达式 CASE（v := CASE ... END / SQL 列 CASE ... END 别名）没有解析树节点，
 * 语句 CASE（CASE ... END CASE）虽有控制树节点但行级 WHEN/ELSE 归属分散——
 * 两者统一由掩码行上的词法级 CASE↔END 栈式配对构造 case 组
 * （CASE + WHEN×n + ELSE + END/END CASE）：
 *  - CASE（"END CASE" 中的 CASE 除外）压栈；
 *  - 区间内（栈非空时）的 WHEN/ELSE 挂到栈顶（嵌套 CASE 归属最近的未闭合 CASE）；
 *  - END CASE 闭合语句 CASE（复合 span 覆盖整个复合词），
 *    裸 END / END 别名 在栈非空时闭合表达式 CASE（span 只含 END 令牌）；
 *  - EXCEPTION 异常分支的 WHEN（WHEN OTHERS 等）不在任何 CASE 区间内，天然排除。
 * 掩码行与原文等长，span 列位置精确。
 */

/** case 配对令牌词法：引号标识符整体跳过（与解析器 STRUCT_TOKEN_RE 同构） */
const CASE_PAIR_TOKEN_RE = /"[^"]*"|[A-Za-z][A-Za-z0-9_$#]*/g;
/** END 令牌后随词捕获（复合词判定：END CASE / END IF / END LOOP / END 别名） */
const AFTER_END_WORD_RE = /^\s+([A-Za-z][A-Za-z0-9_$#]*)/;

/** 未闭合 CASE 的配对帧：CASE 开启 span + 区间内已收集的 WHEN/ELSE */
interface CaseFrame {
    caseSpan: KeywordSpan;
    whens: KeywordSpan[];
    elses: KeywordSpan[];
}

/** 构造全部 case 配对组（独立于解析树） */
export function buildCaseGroups(maskedLines: string[]): KeywordGroup[] {
    const groups: KeywordGroup[] = [];
    const stack: CaseFrame[] = [];
    let prevUpper = '';

    for (let li = 0; li < maskedLines.length; li++) {
        const line = maskedLines[li];
        // matchAll 快照整行令牌（含列位置），prev/next 由下标回看/前看得到；
        // prevUpper 每行重置——"END CASE" 复合词只在同一行内成立，
        // 上一行行尾的 END 不得误伤下一行行首的 CASE
        const toks = Array.from(line.matchAll(CASE_PAIR_TOKEN_RE));
        for (let t = 0; t < toks.length; t++) {
            const raw = toks[t][0];
            const tok = raw.toUpperCase();
            const start = toks[t].index ?? 0;
            const tokEnd = start + raw.length;
            if (tok === 'CASE') {
                if (prevUpper !== 'END') {
                    stack.push({ caseSpan: { line: li + 1, start, end: tokEnd }, whens: [], elses: [] });
                }
                // "END CASE" 中的 CASE：前一令牌是 END，不压栈
            } else if (tok === 'END') {
                const after = line.substring(tokEnd).match(AFTER_END_WORD_RE);
                const nextUpper = after ? after[1].toUpperCase() : '';
                const afterLen = after ? after[0].length : 0;
                if (nextUpper === 'CASE') {
                    // 语句 CASE 闭合：复合 span 覆盖 "END" + 空白 + "CASE"
                    const frame = stack.pop();
                    if (frame) {
                        const compoundEnd = tokEnd + afterLen;
                        groups.push({
                            kind: 'case',
                            spans: [frame.caseSpan, ...frame.whens, ...frame.elses,
                                { line: li + 1, start, end: compoundEnd }]
                        });
                    }
                } else if (nextUpper !== 'IF' && nextUpper !== 'LOOP') {
                    // 控制结构 END 不参与 CASE 配对；裸 END / END 别名在栈非空时
                    // 闭合表达式 CASE；栈空则为块 END（block 组职责），忽略
                    const frame = stack.pop();
                    if (frame) {
                        groups.push({
                            kind: 'case',
                            spans: [frame.caseSpan, ...frame.whens, ...frame.elses,
                                { line: li + 1, start, end: tokEnd }]
                        });
                    }
                }
            } else if (tok === 'WHEN' && stack.length > 0) {
                stack[stack.length - 1].whens.push({ line: li + 1, start, end: tokEnd });
            } else if (tok === 'ELSE' && stack.length > 0) {
                stack[stack.length - 1].elses.push({ line: li + 1, start, end: tokEnd });
            }
            prevUpper = tok;
        }
        prevUpper = '';
    }
    return groups;
}

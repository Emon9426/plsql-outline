import { PLSQLParser } from './parser';
import { ParseNode, ParseResult, NodeType, DeclarationCategory } from './types';

/**
 * 轻量符号扫描器（Issue #39）
 *
 * 索引构建的快路径：不建完整大纲树，只提取跳转所需的顶层符号——
 * 包（规格/体）+ 包直接成员 + 独立函数/过程/触发器。清洗层与
 * CREATE/子程序匹配全部复用 PLSQLParser 的 ForScan 包装（单一事实源）。
 *
 * 与全量解析的口径差异（有意为之，均有兜底或为良性差异）：
 * - 包体内嵌套子程序（成员体内的成员）会被一并提取：解析器只索引包直接
 *   子级；多出的条目行号正确，跳转仍落在真实定义行，属良性超集；
 * - 游标声明（Emon 决策纳入 Ctrl+T 搜索）：包内带所属包、包外无所属包，
 *   类型为 NodeType.CURSOR 的"仅搜索条目"——SymbolIndex.lookup 过滤后
 *   不参与跳转，仅 searchSymbols（Ctrl+T）可见；
 * - 扫描零产出但文件含 CREATE 时，extractFileSymbols 退回全量解析器
 *   best-effort 提取，覆盖扫描器未识别的形态。
 */

/** 扫描产出的符号（SymbolEntry 的磁盘无关部分同构） */
export interface ScannedSymbol {
    name: string;
    type: NodeType;
    packageName?: string;
    /** 原文 1-based 声明行 */
    line: number;
}

/** 全量解析结果 → 索引符号（兜底路径；与 SymbolIndex 的抽取口径一致）。
 *  游标从 variableTable 按 CURSOR 类别提取（仅搜索条目，Issue #39） */
export function symbolsFromParseResult(result: ParseResult): ScannedSymbol[] {
    const out: ScannedSymbol[] = [];
    const walk = (node: ParseNode, pkg: string | undefined): void => {
        const isPackage = node.type === NodeType.PACKAGE_BODY || node.type === NodeType.PACKAGE_HEADER;
        const isUnit = node.type === NodeType.FUNCTION ||
            node.type === NodeType.PROCEDURE ||
            node.type === NodeType.FUNCTION_DECLARATION ||
            node.type === NodeType.PROCEDURE_DECLARATION ||
            node.type === NodeType.TRIGGER;
        if (isPackage || isUnit) {
            out.push({ name: node.name, type: node.type, packageName: pkg, line: node.declarationLine });
        }
        if (node.variableTable) {
            // 包自身表里的游标属于该包；成员表里的游标由父级传入的 pkg 提供所属包
            const cursorPkg = isPackage ? node.name : pkg;
            for (const info of node.variableTable.values()) {
                if (info.category === DeclarationCategory.CURSOR) {
                    out.push({ name: info.name, type: NodeType.CURSOR, packageName: cursorPkg, line: info.line });
                }
            }
        }
        // 只递归包的直接子节点（与 SymbolIndex.extractSymbolsInto 同口径）
        if (isPackage) {
            for (const child of node.children) {
                walk(child, node.name);
            }
        }
    };
    for (const node of result.nodes) {
        walk(node, undefined);
    }
    return out;
}

export interface ScanOutcome {
    symbols: ScannedSymbol[];
    /** 清洗后是否存在 CREATE 行（全零产出时的兜底判定依据，与解析器警告判定同口径） */
    sawCreate: boolean;
}

/**
 * 快路径扫描：纯行级提取，不建树、不建变量表
 */
export function scanSymbols(content: string): ScanOutcome {
    const { cleanLines, lineMapping } = PLSQLParser.preprocessContentForScan(content);
    const result: ScannedSymbol[] = [];
    let sawCreate = false;

    // 当前包作用域内累积的成员：作用域结束（END 包名 / 下一个 CREATE / 文件尾）
    // 时做前置声明去重。.pck 中规格与体是两个作用域实例，同名的规格声明与
    // 体定义都要保留（解析器两侧各自建节点，均入索引）
    let scopeMembers: ScannedSymbol[] = [];
    let scopePkg: string | null = null;
    let pkgIsSpec = false;
    let pkgEndRe: RegExp | null = null;

    const closeScope = (): void => {
        if (scopePkg !== null) {
            result.push(...dedupForwardDeclarations(scopeMembers));
        }
        scopeMembers = [];
        scopePkg = null;
        pkgEndRe = null;
    };

    for (let i = 0; i < cleanLines.length; i++) {
        const line = cleanLines[i];

        // CREATE（单行或跨行签名，跨行拼接与 parser.checkMultiLineCreate 同口径）
        const multi = checkMultiLineCreate(cleanLines, i);
        const create = multi ? multi.match : PLSQLParser.matchCreateForScan(line);
        if (create) {
            sawCreate = true;
            closeScope();
            // 与解析器索引口径一致：TYPE/TYPE_BODY/VIEW 不入索引（识别以推进行指针）
            if (create.type !== NodeType.TYPE && create.type !== NodeType.TYPE_BODY && create.type !== NodeType.VIEW) {
                result.push({ name: create.name, type: create.type, packageName: undefined, line: lineMapping[i] });
            }
            if (create.type === NodeType.PACKAGE_BODY || create.type === NodeType.PACKAGE_HEADER) {
                scopePkg = create.name;
                pkgIsSpec = create.type === NodeType.PACKAGE_HEADER;
                pkgEndRe = new RegExp(`^END\\s+${escapeRegExp(create.name)}\\s*;?\\s*$`, 'i');
            }
            if (multi) {
                i = multi.endIndex;
            }
            continue;
        }

        // 游标声明（Issue #39，Emon 决策纳入 Ctrl+T 搜索）：包内带所属包名，
        // 包外（独立单元/匿名块声明区）无所属包；参数跨行时与解析器同参拼接。
        // 游标是仅搜索条目，SymbolIndex.lookup 过滤后不参与跳转解析
        const multiCursor = checkMultiLineCursor(cleanLines, i);
        const cursor = multiCursor
            ? PLSQLParser.matchCursorDeclarationForScan(multiCursor.combinedText)
            : PLSQLParser.matchCursorDeclarationForScan(line);
        if (cursor) {
            result.push({ name: cursor.name, type: NodeType.CURSOR, packageName: scopePkg ?? undefined, line: lineMapping[i] });
            if (multiCursor) {
                i = multiCursor.endIndex;
            }
            continue;
        }

        if (!scopePkg) {
            // 顶层非 CREATE 的 FUNCTION/PROCEDURE（匿名块内联子程序等）：
            // 解析器不索引（非包直接子级），扫描器保持同口径跳过
            continue;
        }

        // END <包名>：包作用域结束（成员的 END 带成员名，不会误触）
        if (pkgEndRe && pkgEndRe.test(line)) {
            closeScope();
            continue;
        }

        // 包成员：规格内一律声明；体内按前置声明前瞻判定（与解析器同参 ≤15 行）
        const sub = PLSQLParser.matchSubprogramForScan(line);
        if (sub) {
            const isDecl = pkgIsSpec || isForwardDeclaration(cleanLines, i);
            const type = sub.type === NodeType.FUNCTION
                ? (isDecl ? NodeType.FUNCTION_DECLARATION : NodeType.FUNCTION)
                : (isDecl ? NodeType.PROCEDURE_DECLARATION : NodeType.PROCEDURE);
            scopeMembers.push({ name: sub.name, type, packageName: scopePkg, line: lineMapping[i] });
        }
    }
    closeScope();

    return { symbols: result, sawCreate };
}

/**
 * 提取文件符号（索引构建入口）：快路径扫描，零产出且含 CREATE 时退回全量解析器
 */
export async function extractFileSymbols(content: string): Promise<ScannedSymbol[]> {
    const scan = scanSymbols(content);
    if (scan.symbols.length > 0 || !scan.sawCreate) {
        return scan.symbols;
    }
    try {
        // 每次解析独立实例（Issue #15 铁律）
        const result = await new PLSQLParser().parse(content, 'symbol-scan-fallback');
        return symbolsFromParseResult(result);
    } catch {
        return [];
    }
}

/**
 * 跨行 CREATE 拼接（与 parser.checkMultiLineCreate 同口径）：
 * ≤15 行 / 2000 字符，遇 FUNCTION/PROCEDURE 行或 IS/AS 等终止关键字停止
 */
function checkMultiLineCreate(lines: string[], startIndex: number): { match: { type: NodeType; name: string }; endIndex: number } | null {
    const startLine = lines[startIndex];
    if (!/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?/i.test(startLine)) {
        return null;
    }
    if (PLSQLParser.matchCreateForScan(startLine)) {
        return null;
    }

    let combined = startLine;
    let endIndex = startIndex;
    const maxLookAhead = Math.min(15, lines.length - startIndex - 1);
    for (let i = 1; i <= maxLookAhead; i++) {
        const nextLine = lines[startIndex + i];
        if (/^\s*(FUNCTION|PROCEDURE)\s+\w+/i.test(nextLine)) {
            break;
        }
        if (/^\s*(IS|AS|AUTHID|DETERMINISTIC|RESULT_CACHE|PIPELINED|PARALLEL_ENABLE|AGGREGATE|ACCESSIBLE)\b/i.test(nextLine)) {
            break;
        }
        combined += ' ' + nextLine;
        if (combined.length > 2000) {
            break;
        }
        endIndex = startIndex + i;
        const createMatch = PLSQLParser.matchCreateForScan(combined);
        if (createMatch) {
            return { match: createMatch, endIndex };
        }
    }
    return null;
}

/**
 * 跨行 CURSOR 声明拼接（与 parser.checkMultiLineCursor 同口径）：
 * 行首 CURSOR name( 且单行不完整时，≤10 行 / 2000 字符内拼接至完整
 */
function checkMultiLineCursor(lines: string[], startIndex: number): { combinedText: string; endIndex: number } | null {
    const startLine = lines[startIndex];
    if (!/^\s*CURSOR\s+\w+\s*\(/i.test(startLine)) {
        return null;
    }
    if (PLSQLParser.matchCursorDeclarationForScan(startLine)) {
        return null;
    }

    let combined = startLine;
    const maxLookAhead = Math.min(10, lines.length - startIndex - 1);
    for (let i = 1; i <= maxLookAhead; i++) {
        combined += ' ' + lines[startIndex + i];
        if (combined.length > 2000) {
            return null;
        }
        if (PLSQLParser.matchCursorDeclarationForScan(combined)) {
            return { combinedText: combined, endIndex: startIndex + i };
        }
    }
    return null;
}

/**
 * 前置声明判定（与 parser.isForwardDeclaration 同口径）：
 * 从成员行起 ≤15 行内，首个分号先于 IS/AS 出现 → 前置声明
 */
function isForwardDeclaration(lines: string[], startIndex: number): boolean {
    const maxLookAhead = Math.min(15, lines.length - startIndex - 1);
    for (let j = startIndex; j <= startIndex + maxLookAhead; j++) {
        const text = lines[j];
        const isAsIndex = text.search(/\b(?:IS|AS)\b/i);
        const semiIndex = text.indexOf(';');

        if (semiIndex >= 0 && (isAsIndex < 0 || semiIndex < isAsIndex)) {
            return true;
        }
        if (isAsIndex >= 0) {
            return false;
        }
    }
    return false;
}

/**
 * 包成员同名去重：解析器对"前置声明 + 同名真实定义"做原位替换，
 * 索引口径最终只保留定义节点；纯声明（无定义）与重复定义保持原样
 */
function dedupForwardDeclarations(symbols: ScannedSymbol[]): ScannedSymbol[] {
    const hasRealDef = new Set<string>();
    for (const s of symbols) {
        if (s.packageName && (s.type === NodeType.FUNCTION || s.type === NodeType.PROCEDURE)) {
            hasRealDef.add(`${s.packageName.toUpperCase()}\u0000${s.name.toUpperCase()}`);
        }
    }
    return symbols.filter(s => {
        if (!s.packageName) {
            return true;
        }
        if (s.type === NodeType.FUNCTION_DECLARATION || s.type === NodeType.PROCEDURE_DECLARATION) {
            return !hasRealDef.has(`${s.packageName.toUpperCase()}\u0000${s.name.toUpperCase()}`);
        }
        return true;
    });
}

function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

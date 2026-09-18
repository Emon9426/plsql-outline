import {
    ParseResult,
    ParseNode,
    NodeType,
    VariableInfo,
    DeclarationCategory
} from './types';

/**
 * 关键字匹配模式（模块级常量，单一事实源；仅保留解析器实际使用的成员）。
 * 注意：与 parser 的行级判定逻辑强耦合（如 END 语句接受 [;/] 结尾、
 * 类型声明含 RECORD/TABLE OF 变体），修改前先读 .ai/parser-playbook.md。
 */
const PATTERNS = {
    // ====== 声明判定（顺序敏感：常量先于变量）======
    VARIABLE_DECLARATION: /^\s*(\w+)\s+([\w\.%]+(?:\([^)]*\))?)\s*(?::=\s*.+?|DEFAULT\s+.+?)?;\s*$/i,
    CONSTANT_DECLARATION: /^\s*(\w+)\s+CONSTANT\s+([\w\.%]+(?:\([^)]*\))?(?:\s+NOT\s+NULL)?)\s*(?::=\s*(.+?)|DEFAULT\s+(.+?))?;\s*$/i,
    TYPE_DECLARATION: /^\s*(?:TYPE\s+)?(\w+)\s+IS\s+(RECORD|TABLE\s+OF|VARRAY|REF\s+CURSOR|OBJECT)\b/i,
    CURSOR_DECLARATION: /^\s*CURSOR\s+(\w+)\s*(?:\((?:[^()]|\([^()]*\))*\))?\s*(?:RETURN\s+[\w$#\.]+(?:\s*%\w+)?)?\s*IS\b/i,
    EXCEPTION_DECLARATION: /^\s*(\w+)\s+EXCEPTION\s*;\s*$/i,
    // ====== 控制结构 ======
    IF_START: /^\s*IF\s+(.+?)\s+THEN\s*$/i,
    ELSIF_START: /^\s*ELSIF\s+(.+?)\s+THEN\s*$/i,
    ELSE_START: /^\s*ELSE\s*$/i,
    BASIC_LOOP_START: /^\s*LOOP\s*$/i,
    WHILE_LOOP_START: /^\s*WHILE\s+(.+?)\s+LOOP\s*$/i,
    FOR_LOOP_START: /^\s*FOR\s+(\w+)\s+IN\s+(.+?)\s+LOOP\s*$/i,
    CASE_START: /^\s*CASE\s*(.*?)\s*$/i,
    WHEN_START: /^\s*WHEN\s+(.+?)\s+THEN\s*$/i,
    END_IF: /^\s*END\s+IF\s*;\s*$/i,
    END_LOOP: /^\s*END\s+LOOP\s*(?:\s+\w+)?\s*;\s*$/i,
    END_CASE: /^\s*END\s+CASE\s*;\s*$/i
} as const;

/**
 * 用户取消解析时抛出（parse 会原样上抛，不并入 metadata.errors）
 */
export class ParseCancelledError extends Error {
    constructor() {
        super('解析已取消');
        this.name = 'ParseCancelledError';
    }
}

/**
 * PL/SQL解析器 - 基于handler架构的内存优化版本
 * 支持控制结构(IF/LOOP/CASE)识别
 */
export class PLSQLParser {
    // 全局变量定义
    private currentLevel: number = 0;
    private beginEndCounter: number = 0;
    private nodeStack: ParseNode[] = [];
    private currentActiveNode: ParseNode | null = null;
    private rootNodes: ParseNode[] = [];
    private packageNode: ParseNode | null = null;
    private packageInitFlag: boolean = false;

    // 控制结构相关
    private controlStack: ParseNode[] = [];
    private showControlStructures: boolean = true;
    private controlStructureMaxDepth: number = 10;

    // BUG-D修复: 记录每个内联匿名块(DECLARE/BEGIN块)声明时的 beginEndCounter。
    // 当 END 让计数器回到该值时,关闭对应的匿名块而非外层方法。
    private anonBlockCounters: number[] = [];

    // 子程序上下文保存栈：进入子程序时保存外层的 beginEndCounter 与匿名块水位，
    // 子程序 END 闭合时恢复。此前进入子程序直接清零/清空且从不恢复，导致
    // "单元内联匿名块内含子程序"时宿主单元的 BEGIN 计数永久丢失，父单元永不闭合
    // （endLine=null，其后的 END 计数漂移为负）。
    private unitStateStack: Array<{ beginEndCounter: number; anonBlockCounters: number[]; currentLevel: number }> = [];

    private version: string = '2.1.0';

    // 内存优化相关
    private processedLines: Set<number> = new Set();

    // 让步策略：距上次让步不足该毫秒数时不让出事件循环，
    // 中小文件单轮同步完成（原先每 50 行强制 setImmediate，使耗时近乎翻倍）
    private static readonly YIELD_INTERVAL_MS = 8;
    private lastYieldTime = 0;

    // 最大嵌套深度（parsing.maxNestingDepth 配置传入；默认与 package.json 声明一致）
    private maxNestingDepth: number = 15;

    // 取消令牌（v1.8.0：大文件解析可中断）
    private cancellationToken?: { isCancellationRequested: boolean };

    /**
     * 设置控制结构配置
     */
    setControlStructureConfig(show: boolean, maxDepth: number = 10): void {
        this.showControlStructures = show;
        this.controlStructureMaxDepth = maxDepth;
    }

    /**
     * 解析PL/SQL代码
     */
    async parse(content: string, sourceFile: string = 'unknown', options?: {
        maxNestingDepth?: number;
        /** 结构化取消令牌（鸭子类型兼容 vscode.CancellationToken，测试无需 vscode 模块） */
        cancellationToken?: { isCancellationRequested: boolean };
    }): Promise<ParseResult> {
        const startTime = Date.now();

        try {
            this.initializeGlobalVariables();

            if (options && typeof options.maxNestingDepth === 'number' && options.maxNestingDepth > 0) {
                this.maxNestingDepth = options.maxNestingDepth;
            }
            this.cancellationToken = options?.cancellationToken;
            
            if (content.length > 10 * 1024 * 1024) {
                throw new Error('文件过大，超过10MB限制');
            }
            
            const { cleanLines, lineMapping } = this.preprocessContent(content);
            
            if (cleanLines.length > 50000) {
                throw new Error(`文件行数过多(${cleanLines.length})，超过50000行限制`);
            }
            
            await this.parseLines(cleanLines, lineMapping);
            
            const parseTime = Date.now() - startTime;
            const result: ParseResult = {
                nodes: this.rootNodes,
                metadata: {
                    sourceFile,
                    parseTime,
                    version: this.version,
                    errors: [],
                    warnings: [],
                    totalLines: cleanLines.length,
                    maxNestingDepth: this.calculateMaxNestingDepth(this.rootNodes)
                }
            };

            this.cleanup();
            return result;

        } catch (error) {
            this.cleanup();

            // 用户主动取消不吞掉：向上传递由扩展层决定 UI 行为
            if (error instanceof ParseCancelledError) {
                throw error;
            }

            const parseTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : '未知解析错误';
            
            return {
                nodes: [],
                metadata: {
                    sourceFile,
                    parseTime,
                    version: this.version,
                    errors: [{ line: 0, message: errorMessage, severity: 'error' }],
                    warnings: [],
                    totalLines: content.split('\n').length,
                    maxNestingDepth: 0
                }
            };
        }
    }

    /**
     * 初始化所有全局变量
     */
    private initializeGlobalVariables(): void {
        this.currentLevel = 0;
        this.beginEndCounter = 0;
        this.nodeStack = [];
        this.currentActiveNode = null;
        this.rootNodes = [];
        this.packageNode = null;
        this.packageInitFlag = false;
        this.controlStack = [];
        this.anonBlockCounters = [];
        this.unitStateStack = [];
        this.processedLines.clear();
        this.lastYieldTime = Date.now();
    }

    /**
     * 内存清理
     */
    private cleanup(): void {
        this.processedLines.clear();
        this.nodeStack = [];
        this.controlStack = [];
        this.anonBlockCounters = [];
        this.unitStateStack = [];
        this.currentActiveNode = null;
        this.packageNode = null;
    }

    /**
     * 预处理内容：去除注释、空行等，但保持原始行号映射
     * BUG-7修复：字符串字面量移除在注释剥离之前执行
     * Q-quote修复：支持 Oracle 替代引用 q'[...]' / q'{...}' / q'<...>' / q'(...)' / q'|...|'（及 nq'...'）
     * —— 旧正则 /'[^']*(?:''[^']*)*'/g 不识别 Q-quote，遇到 q'[...含 -- 或 /* ...]' 时会提前结束，
     *    残留的 -- /* 被当作注释剥离，删除真实代码，导致 BEGIN/END 平衡崩溃、大纲塌陷。
     */
    private preprocessContent(content: string): { cleanLines: string[], lineMapping: number[] } {
        const lines = content.split('\n');
        const cleanLines: string[] = [];
        const lineMapping: number[] = [];
        // 跨行状态：多行注释 + 未闭合的字符串（Q-quote 或标准字符串可能跨行）
        const state: {
            inMultiLineComment: boolean;
            // 未闭合字符串：kind='q' 为 Q-quote（含闭合定界符序列），kind='std' 为标准字符串
            openString: { kind: 'q' | 'std'; closeSeq: string } | null;
        } = { inMultiLineComment: false, openString: null };

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const originalLineNumber = i + 1;

            // 跨行状态处理：先消耗上一行遗留的状态
            // 1) 多行注释继续中
            if (state.inMultiLineComment) {
                const endIndex = line.indexOf('*/');
                if (endIndex !== -1) {
                    state.inMultiLineComment = false;
                    line = line.substring(endIndex + 2);
                } else {
                    continue;
                }
            }
            // 2) 未闭合的字符串（跨行 Q-quote / 标准字符串）继续中：本行先处于字符串内，
            //    跳过到闭合定界符（字符串内容整体丢弃，不触发注释/字符串识别）
            if (state.openString) {
                const os = state.openString;
                const closeIdx = line.indexOf(os.closeSeq);
                if (closeIdx !== -1) {
                    // 本行闭合：消耗到闭合序列之后，继续扫描剩余
                    state.openString = null;
                    line = line.substring(closeIdx + os.closeSeq.length);
                    // 剩余部分继续走正常剥离
                    line = this.stripLiteralsAndComments(line, state);
                } else {
                    // 本行整行仍在字符串内：整行丢弃，状态保持
                    continue;
                }
            } else {
                // 单遍字符级扫描：同步识别并剥离字符串字面量、-- 单行注释、/* */ 注释。
                line = this.stripLiteralsAndComments(line, state);
            }

            // 去除首尾空白并检查是否为空行
            line = line.trim();
            if (line.length > 0) {
                cleanLines.push(line);
                lineMapping.push(originalLineNumber);
            }
        }

        return { cleanLines, lineMapping };
    }

    /**
     * 字符级剥离器：在单行内同步处理
     *  - 标准字符串（单引号包裹，双单引号为转义引号）
     *  - Q-quote 字符串：前缀 nq 或 q + 单引号 + 配对定界符包裹内容
     *  - 双横线单行注释（到行尾）
     *  - 斜杠星 多行注释（可能跨行，跨行时设置 state.inMultiLineComment）
     * 字符串替换为空串，注释移除。字符串内的注释标记与引号不触发识别。
     * 若 Q-quote 或标准字符串在本行未闭合（跨行），设置 state.openString 供下一行继续。
     */
    private stripLiteralsAndComments(line: string, state: { inMultiLineComment: boolean; openString: { kind: 'q' | 'std'; closeSeq: string } | null }): string {
        let out = '';
        let i = 0;
        const n = line.length;
        while (i < n) {
            const ch = line[i];
            const two = line.substring(i, i + 2);

            // 双横线单行注释：到行尾
            if (two === '--') {
                break;
            }

            // 斜杠星 多行注释
            if (two === '/*') {
                const close = line.indexOf('*/', i + 2);
                if (close !== -1) {
                    i = close + 2; // 本行内闭合，跳过
                    continue;
                } else {
                    state.inMultiLineComment = true; // 跨行：本行剩余丢弃
                    return out;
                }
            }

            // 字符串字面量（标准 单引号 或 Q-quote [n]q'...'）
            const qStart = this.matchQStringStart(line, i);
            if (ch === '\'' || qStart !== null) {
                if (qStart !== null) {
                    const end = this.scanQStringEnd(line, i, qStart);
                    if (end > i) {
                        out += '""';
                        i = end + 1;
                        continue;
                    }
                    // Q-quote 未在本行闭合：记录闭合序列（定界符+引号），整行剩余归入字符串
                    state.openString = { kind: 'q', closeSeq: qStart.close + '\'' };
                    return out;
                }
                // 标准字符串
                const end = this.scanStdStringEnd(line, i);
                if (end > i) {
                    out += '""';
                    i = end + 1;
                    continue;
                }
                // 标准字符串未闭合（行尾奇数引号，可能跨行拼接）：记录闭合序列（单引号）
                state.openString = { kind: 'std', closeSeq: '\'' };
                return out;
            }

            out += ch;
            i++;
        }
        return out;
    }

    /**
     * 检测 position 是否为 Q-quote 字符串起始（[n]q'<delim>）。
     * 返回定界符信息 { prefixLen, open, close } 或 null。
     * 支持：q' / nq' / Q' / NQ'（大小写不敏感）。open 为起始定界符（[ { < ( 或其他字符），close 为对应闭合定界符。
     */
    private matchQStringStart(line: string, i: number): { prefixLen: number; open: string; close: string } | null {
        // 尝试匹配可选 N + Q（共 1~2 个字符前缀）后跟 '
        const lower = line.toLowerCase();
        // 模式：[n]q'  → 前缀长度 1 (q) 或 2 (nq)
        // 先试 2 字符前缀 nq'
        if (i + 2 < line.length && (lower[i] === 'n' && lower[i + 1] === 'q' && line[i + 2] === '\'')) {
            return this.qDelimAt(line, i + 3, 2);
        }
        // 1 字符前缀 q'
        if (i + 1 < line.length && lower[i] === 'q' && line[i + 1] === '\'') {
            return this.qDelimAt(line, i + 2, 1);
        }
        return null;
    }

    /**
     * 在 q' 之后的 position 读取定界符，返回 { prefixLen, open, close }。
     * 配对定界符：[ ]、{ }、< >、( )；其他字符 c 则 open=close=c。
     */
    private qDelimAt(line: string, pos: number, prefixLen: number): { prefixLen: number; open: string; close: string } | null {
        if (pos >= line.length) { return null; }
        const open = line[pos];
        let close: string;
        switch (open) {
            case '[': close = ']'; break;
            case '{': close = '}'; break;
            case '<': close = '>'; break;
            case '(': close = ')'; break;
            default: close = open; break;
        }
        return { prefixLen, open, close };
    }

    /**
     * 扫描 Q-quote 字符串结束位置，返回闭合 ' 的索引（不含），未闭合返回 -1。
     * start 为前缀起始索引（指向 n 或 q），delim 为定界符信息。
     * Q-quote 闭合形式：close'（先出现 close 定界符再紧跟 '）。无需转义。
     */
    private scanQStringEnd(line: string, start: number, delim: { prefixLen: number; open: string; close: string }): number {
        // 内容起始 = start + prefixLen + 1(q') + 1(open)
        const j = start + delim.prefixLen + 1 + 1;
        const closeSeq = delim.close + '\'';
        const idx = line.indexOf(closeSeq, j);
        return idx !== -1 ? idx + 1 : -1; // 返回闭合 ' 的索引
    }

    /**
     * 扫描标准字符串 '...' 结束位置（处理 '' 转义），返回闭合 ' 的索引，未闭合返回 -1。
     */
    private scanStdStringEnd(line: string, start: number): number {
        let j = start + 1; // 跳过起始 '
        while (j < line.length) {
            if (line[j] === '\'') {
                if (line[j + 1] === '\'') {
                    j += 2; // 转义引号 ''
                    continue;
                }
                return j; // 闭合 '
            }
            j++;
        }
        return -1; // 未闭合（行尾奇数引号）
    }

    /**
     * 逐行解析
     */
    private async parseLines(lines: string[], lineMapping: number[]): Promise<void> {
        let lastProcessedLine = -1;
        let stuckCounter = 0;
        const maxStuckCount = 10;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const originalLineNumber = lineMapping[i];

            if (this.processedLines.has(originalLineNumber)) {
                continue;
            }

            if (i === lastProcessedLine) {
                stuckCounter++;
                if (stuckCounter > maxStuckCount) {
                    throw new Error(`解析在第${originalLineNumber}行卡住`);
                }
            } else {
                stuckCounter = 0;
                lastProcessedLine = i;
            }

            // 检查跨行CREATE语句
            const multiLineCreateMatch = this.checkMultiLineCreate(lines, i, lineMapping);
            if (multiLineCreateMatch) {
                const originalStartLine = lineMapping[multiLineCreateMatch.startIndex];
                await this.handleCreateStatement(multiLineCreateMatch.match, originalStartLine);

                for (let j = multiLineCreateMatch.startIndex; j <= multiLineCreateMatch.endIndex; j++) {
                    this.processedLines.add(lineMapping[j]);
                }

                i = multiLineCreateMatch.endIndex;
                continue;
            }

            // 检查跨行CURSOR声明（参数列表换行：CURSOR name ( ... ) IS）
            const multiLineCursor = this.checkMultiLineCursor(lines, i);
            if (multiLineCursor) {
                this.checkAndRecordCursorDeclaration(multiLineCursor.combinedText, originalLineNumber);

                for (let j = i + 1; j <= multiLineCursor.endIndex; j++) {
                    this.processedLines.add(lineMapping[j]);
                }

                i = multiLineCursor.endIndex;
                continue;
            }

            await this.parseLine(line, originalLineNumber, lines, i);
            this.processedLines.add(originalLineNumber);

            if (i % 50 === 0) {
                await this.yield();
                if (this.cancellationToken?.isCancellationRequested) {
                    throw new ParseCancelledError();
                }
            }
        }
    }

    /**
     * 检查跨行CREATE语句
     * BUG-5修复：最大5行前瞻，遇到关键字终止，总长度限制
     */
    private checkMultiLineCreate(lines: string[], startIndex: number, _lineMapping: number[]): { match: { type: NodeType; name: string }, startIndex: number, endIndex: number } | null {
        const startLine = lines[startIndex];
        
        if (!/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?/i.test(startLine)) {
            return null;
        }

        const singleLineMatch = this.matchCreateStatement(startLine);
        if (singleLineMatch) {
            return null;
        }

        let combinedLine = startLine;
        let endIndex = startIndex;

        // 放宽前瞻：最大 15 行（原 5 行在真实长签名 CREATE 上会过早放弃，导致程序单元被丢弃）
        const maxLookAhead = Math.min(15, lines.length - startIndex - 1);
        for (let i = 1; i <= maxLookAhead; i++) {
            const nextLineIndex = startIndex + i;
            const nextLine = lines[nextLineIndex];

            if (/^\s*(FUNCTION|PROCEDURE)\s+\w+/i.test(nextLine)) {
                break;
            }

            // 遇到这些关键字终止拼接（补充 PARALLEL_ENABLE/AGGREGATE/ACCESSIBLE 等真实子句）
            if (/^\s*(IS|AS|AUTHID|DETERMINISTIC|RESULT_CACHE|PIPELINED|PARALLEL_ENABLE|AGGREGATE|ACCESSIBLE)\b/i.test(nextLine)) {
                break;
            }

            combinedLine += ' ' + nextLine;

            // 放宽长度上限：2000 字符（原 500 在多参数签名上会过早放弃）
            if (combinedLine.length > 2000) {
                break;
            }
            
            endIndex = nextLineIndex;
            
            const createMatch = this.matchCreateStatement(combinedLine);
            if (createMatch) {
                return {
                    match: createMatch,
                    startIndex: startIndex,
                    endIndex: endIndex
                };
            }
        }
        
        return null;
    }

    /**
     * 检查跨行CURSOR声明：参数列表未在一行内闭合时，向后拼接直到匹配完整声明。
     * 仅做声明记录（不建节点），SELECT 体仍按普通行流动。
     */
    private checkMultiLineCursor(lines: string[], startIndex: number): { combinedText: string, endIndex: number } | null {
        const startLine = lines[startIndex];

        // 行首为 CURSOR name ( 且单行不构成完整声明
        if (!/^\s*CURSOR\s+\w+\s*\(/i.test(startLine)) {
            return null;
        }
        if (PATTERNS.CURSOR_DECLARATION.test(startLine)) {
            return null;
        }

        let combinedLine = startLine;
        const maxLookAhead = Math.min(10, lines.length - startIndex - 1);
        for (let i = 1; i <= maxLookAhead; i++) {
            combinedLine += ' ' + lines[startIndex + i];

            if (combinedLine.length > 2000) {
                return null;
            }

            if (PATTERNS.CURSOR_DECLARATION.test(combinedLine)) {
                return {
                    combinedText: combinedLine,
                    endIndex: startIndex + i
                };
            }
        }

        return null;
    }

    /**
     * 匹配CREATE语句（支持schema前缀）
     */
    private matchCreateStatement(line: string): { type: NodeType; name: string } | null {
        // 必须先匹配PACKAGE BODY（因为包含PACKAGE关键字）
        let match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?PACKAGE\s+BODY\s+(?:\w+\.)?(\w+)/i);
        if (match) {
            return { type: NodeType.PACKAGE_BODY, name: match[1] };
        }

        match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?PACKAGE\s+(?!BODY\s)(?:\w+\.)?(\w+)/i);
        if (match) {
            return { type: NodeType.PACKAGE_HEADER, name: match[1] };
        }

        match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:\w+\.)?(\w+)/i);
        if (match) {
            return { type: NodeType.FUNCTION, name: match[1] };
        }

        match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?PROCEDURE\s+(?:\w+\.)?(\w+)/i);
        if (match) {
            return { type: NodeType.PROCEDURE, name: match[1] };
        }

        match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER\s+(?:\w+\.)?(\w+)/i);
        if (match) {
            return { type: NodeType.TRIGGER, name: match[1] };
        }

        // CREATE TYPE BODY（先匹配，因含 TYPE 关键字）
        match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?TYPE\s+BODY\s+(?:\w+\.)?(\w+)/i);
        if (match) {
            return { type: NodeType.TYPE_BODY, name: match[1] };
        }

        // CREATE TYPE（对象类型/集合类型）
        match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?TYPE\s+(?!BODY\s)(?:\w+\.)?(\w+)/i);
        if (match) {
            return { type: NodeType.TYPE, name: match[1] };
        }

        // CREATE VIEW / MATERIALIZED VIEW（视图非 PL/SQL 程序单元，但识别以免被丢弃）
        match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?(?:MATERIALIZED\s+)?VIEW\s+(?:\w+\.)?(\w+)/i);
        if (match) {
            return { type: NodeType.VIEW, name: match[1] };
        }

        return null;
    }

    /**
     * 匹配FUNCTION/PROCEDURE关键字（子程序）
     * 性能修复：静态正则缓存（原实现每行 new RegExp，大文件热点）
     */
    private static readonly SUB_FUNCTION_RE = /^\s*(?:MEMBER|STATIC|FINAL|OVERRIDING|CONSTRUCTOR|MAP)?\s*FUNCTION\s+(\w+)/i;
    private static readonly SUB_PROCEDURE_RE = /^\s*(?:MEMBER|STATIC|FINAL|OVERRIDING|CONSTRUCTOR|MAP)?\s*PROCEDURE\s+(\w+)/i;

    private matchFunctionProcedure(line: string): { type: NodeType; name: string } | null {
        let match = line.match(PLSQLParser.SUB_FUNCTION_RE);
        if (match) {
            return { type: NodeType.FUNCTION, name: match[1] };
        }

        match = line.match(PLSQLParser.SUB_PROCEDURE_RE);
        if (match) {
            return { type: NodeType.PROCEDURE, name: match[1] };
        }

        return null;
    }

    /**
     * 解析单行 - handler-based 架构
     */
    private async parseLine(line: string, lineNumber: number, lines?: string[], lineIndex?: number): Promise<void> {
        // 检查变量/游标/异常/常量/类型声明
        // 顺序：常量必须在普通变量之前（避免常量被误判为变量）；类型需在游标之前（TYPE...IS 与 CURSOR...IS 形式不同，互不冲突）
        this.checkAndRecordConstantDeclaration(line, lineNumber);
        this.checkAndRecordVariableDeclaration(line, lineNumber);
        this.checkAndRecordTypeDeclaration(line, lineNumber);
        this.checkAndRecordCursorDeclaration(line, lineNumber);
        this.checkAndRecordExceptionDeclaration(line, lineNumber);

        // CREATE语句处理
        const createMatch = this.matchCreateStatement(line);
        if (createMatch) {
            await this.handleCreateStatement(createMatch, lineNumber);
            return;
        }

        // DECLARE匿名块处理
        if (this.isDeclareStatement(line)) {
            this.handleDeclareStatement(lineNumber);
            return;
        }

        // 顶层裸 BEGIN 匿名块（无 DECLARE，Issue #5）：脚本文件中常见的块形式。
        // 仅在无"未闭合"活动节点时创建节点——单元（包体/过程）END 之后
        // currentActiveNode 仍指向已关闭单元，此时顶层 BEGIN 属于新匿名块；
        // 方法体内的内联裸 BEGIN 仍走原计数路径，不产生匿名块节点。
        const hasOpenUnit = this.currentActiveNode != null && this.currentActiveNode.endLine == null;
        if (!hasOpenUnit && this.isBeginStatement(line)) {
            this.startAnonymousBlock(lineNumber);
            await this.handleBeginStatement(lineNumber);
            return;
        }

        // 如果没有当前活动节点，跳过后续处理
        if (!this.currentActiveNode) {
            return;
        }

        // FUNCTION/PROCEDURE 关键字处理（子函数/过程）
        const functionMatch = this.matchFunctionProcedure(line);
        if (functionMatch) {
            await this.handleSubFunctionProcedure(functionMatch, lineNumber, lines, lineIndex);
            return;
        }

        // IS/AS 关键字处理
        // 仅在未进入方法体(beginEndCounter === 0)时识别为声明关键字。
        // 否则方法体中的 "IF x IS NULL" / "x AS y" 等会被误判，吞掉控制结构。
        if (this.beginEndCounter === 0 && this.isIsAsStatement(line)) {
            await this.handleIsAsStatement(lineNumber);
            return;
        }

        // BEGIN 关键字处理
        if (this.isBeginStatement(line)) {
            await this.handleBeginStatement(lineNumber);
            return;
        }

        // EXCEPTION 关键字处理
        if (this.isExceptionStatement(line)) {
            await this.handleExceptionStatement(lineNumber);
            return;
        }

        // END 关键字处理（排除控制结构END）
        if (this.isEndStatement(line)) {
            await this.handleEndStatement(lineNumber);
            return;
        }

        // 控制结构处理（仅在方法体内）
        if (this.showControlStructures && this.beginEndCounter > 0) {
            this.parseControlStructures(line, lineNumber);
        }
    }

    // ====== Handler 方法 ======

    /**
     * 处理CREATE语句
     */
    private async handleCreateStatement(createMatch: { type: NodeType; name: string }, lineNumber: number): Promise<void> {
        const node = this.createNode(createMatch.type, createMatch.name, lineNumber, 1);
        this.currentLevel = 1;
        this.currentActiveNode = node;
        this.rootNodes.push(node);

        if (createMatch.type === NodeType.PACKAGE_BODY) {
            this.packageNode = node;
        }

        this.beginEndCounter = 0;
        this.controlStack = [];
        this.anonBlockCounters = [];
        // 新单元开始：丢弃上一个未正确闭合单元遗留的上下文帧
        this.unitStateStack = [];
    }

    /**
     * 处理子函数/过程
     *
     * 前置声明修复：声明区的 `PROCEDURE xxx(...);` / `FUNCTION xxx ...;`（无 IS/AS 体）
     * 此前会被当作真实定义创建节点并切换 currentActiveNode，且永远等不到自己的 END，
     * 导致其后的所有声明（如游标 C4/C5）被记入这个"幽灵节点"而丢失。
     * 现在按用户决策：前置声明创建声明节点（不切换状态），同名真实定义出现时原位替换。
     */
    private async handleSubFunctionProcedure(functionMatch: { type: NodeType; name: string }, lineNumber: number, lines?: string[], lineIndex?: number): Promise<void> {
        if (this.currentLevel >= this.maxNestingDepth) {
            throw new Error(`嵌套深度超过限制(${this.currentLevel})`);
        }

        // Package Header中的声明
        if (this.currentActiveNode && this.currentActiveNode.type === NodeType.PACKAGE_HEADER) {
            const declarationType = functionMatch.type === NodeType.FUNCTION ?
                NodeType.FUNCTION_DECLARATION : NodeType.PROCEDURE_DECLARATION;
            const declarationNode = this.createNode(declarationType, functionMatch.name, lineNumber, 2);
            this.currentActiveNode.children.push(declarationNode);
            return;
        }

        // 前置声明（... ; 无 IS/AS 体，含多行签名）：只挂声明节点，不切换 currentActiveNode
        const isForwardDecl = lines !== undefined && lineIndex !== undefined &&
            this.isForwardDeclaration(lines, lineIndex);
        if (isForwardDecl && this.currentActiveNode) {
            const declarationType = functionMatch.type === NodeType.FUNCTION ?
                NodeType.FUNCTION_DECLARATION : NodeType.PROCEDURE_DECLARATION;
            const declarationNode = this.createNode(declarationType, functionMatch.name, lineNumber, this.currentLevel + 1);
            this.currentActiveNode.children.push(declarationNode);
            return;
        }

        // 普通的子函数/过程处理；若存在同名前置声明节点（同一父节点下）则原位替换
        const newNode = this.createNode(functionMatch.type, functionMatch.name, lineNumber, this.currentLevel + 1);

        if (this.currentActiveNode) {
            const siblings = this.currentActiveNode.children;
            const declIndex = siblings.findIndex(c =>
                (c.type === NodeType.FUNCTION_DECLARATION || c.type === NodeType.PROCEDURE_DECLARATION) &&
                c.name === functionMatch.name);
            if (declIndex >= 0) {
                siblings[declIndex] = newNode;
            } else {
                siblings.push(newNode);
            }
            this.nodeStack.push(this.currentActiveNode);
        }

        this.currentActiveNode = newNode;
        // 保存宿主层级（进入前），子程序 END 闭合时按帧恢复，
        // 防止方法体内的任何层级漂移带出宿主边界
        const hostLevel = this.currentLevel;
        this.currentLevel = hostLevel + 1;
        // 保存外层上下文（计数器+匿名块水位+层级），子程序 END 闭合时恢复；
        // 直接清零会丢弃宿主单元的 BEGIN 计数与外层内联匿名块的水位
        this.unitStateStack.push({
            beginEndCounter: this.beginEndCounter,
            anonBlockCounters: this.anonBlockCounters,
            currentLevel: hostLevel
        });
        this.beginEndCounter = 0;
        // 子程序拥有独立的控制结构与匿名块水位刻度
        this.controlStack = [];
        this.anonBlockCounters = [];
    }

    /**
     * 判断 FUNCTION/PROCEDURE 行是否为前置声明（... ; 无 IS/AS 体）。
     * 从该行起向后扫描（≤15 行，字符串/注释已由预处理剥离）：
     * 首个出现的 IS/AS 关键字 → 真实定义；首个分号 → 前置声明。
     * 单行与多行签名均覆盖；超窗未定则按真实定义处理（保持旧行为）。
     */
    private isForwardDeclaration(lines: string[], startIndex: number): boolean {
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
     * 处理IS/AS语句
     */
    private async handleIsAsStatement(_lineNumber: number): Promise<void> {
        // 初始化当前节点的变量表
        if (this.currentActiveNode && !this.currentActiveNode.variableTable) {
            this.currentActiveNode.variableTable = new Map<string, VariableInfo>();
        }
    }

    /**
     * 处理BEGIN语句
     * BUG-2修复：Package初始化块使用直接赋值而非递增
     */
    private async handleBeginStatement(lineNumber: number): Promise<void> {
        // 检查是否为包体初始化段
        // Issue #5：包体已 END（endLine 已置位）后跟随的顶层裸 BEGIN 属于
        // 新的匿名块，不能误判为包初始化段
        if (this.currentLevel === 1 && this.packageNode && !this.packageInitFlag
            && this.packageNode.endLine == null
            && this.currentActiveNode && this.currentActiveNode.type !== NodeType.ANONYMOUS_BLOCK) {
            this.packageInitFlag = true;
            this.packageNode.beginLine = lineNumber;
            this.beginEndCounter = 1;
            return;
        }

        // 普通BEGIN处理
        // BEGIN 归属：计数器为 0（单元自身首个 BEGIN），或活动节点为内联匿名块
        // 且计数器恰在其水位（宿主单元已计数，匿名块体的首个 BEGIN）
        const isAnonBodyStart = this.currentActiveNode != null &&
            this.currentActiveNode.type === NodeType.ANONYMOUS_BLOCK &&
            this.anonBlockCounters.length > 0 &&
            this.beginEndCounter === this.anonBlockCounters[this.anonBlockCounters.length - 1];
        if (this.currentActiveNode && (this.beginEndCounter === 0 || isAnonBodyStart)) {
            this.currentActiveNode.beginLine = lineNumber;
        }
        this.beginEndCounter = this.beginEndCounter + 1;
    }

    /**
     * 处理EXCEPTION语句
     */
    private async handleExceptionStatement(lineNumber: number): Promise<void> {
        // EXCEPTION 归属：内联匿名块体内（计数器 = 水位+1），或单元体首个层级（计数器 1）
        if (this.currentActiveNode && this.currentActiveNode.type === NodeType.ANONYMOUS_BLOCK
            && this.anonBlockCounters.length > 0
            && this.beginEndCounter === this.anonBlockCounters[this.anonBlockCounters.length - 1] + 1) {
            this.currentActiveNode.exceptionLine = lineNumber;
            return;
        }
        if (this.beginEndCounter === 1 && this.currentActiveNode) {
            this.currentActiveNode.exceptionLine = lineNumber;
        }
    }

    /**
     * 处理END语句
     * BUG-B修复: Package Body 无初始化块时，最终的 END pkg_name; 会让
     * beginEndCounter 减为 -1，原 ===0 判断无法关闭 Package 节点。
     * 现增加对 Package 顶层 END 的显式处理。
     *
     * BUG-D修复: 方法体内的内联 DECLARE...BEGIN...END; 块会让 beginEndCounter
     * 提前下降，但不会归零(因方法自己的 BEGIN 已 +1)。原逻辑只在归零时关闭
     * 节点，导致内联块的 END 被忽略，最终方法的 END 错误地关闭匿名块。
     * 现通过 anonBlockCounters 栈精确追踪: 每个 DECLARE 记录当时的 bec 作为
     * 匿名块的"开始水位", 匿名块的 BEGIN 让 bec+1, 当 END 让 bec 回到水位时
     * 即关闭匿名块(弹出水位并恢复 currentActiveNode)。
     */
    private async handleEndStatement(lineNumber: number): Promise<void> {
        // Package 顶层 END: currentLevel===1 表示在 Package 节点本身，
        // nodeStack 为空表示没有未闭合的子程序。
        // 此分支覆盖无初始化块的 Package Body 场景。
        // Issue #5：包体已闭合后（其后跟随顶层匿名块时），匿名块的 END
        // 不能再次进入此分支覆盖包体 endLine。
        if (this.currentLevel === 1 && this.nodeStack.length === 0 && this.packageNode
            && this.packageNode.endLine == null) {
            this.packageNode.endLine = lineNumber;
            this.beginEndCounter = 0;
            this.currentActiveNode = this.packageNode;
            this.controlStack = [];
            this.unitStateStack = [];
            return;
        }

        this.beginEndCounter = this.beginEndCounter - 1;

        // BUG-D: 检查此 END 是否关闭一个内联匿名块(DECLARE块)。
        // 匿名块的水位 = DECLARE 时的 bec。匿名块的 BEGIN 让 bec = 水位+1,
        // 其 END 让 bec 回到水位 → 此时关闭匿名块,恢复外层方法的 active 状态。
        if (this.anonBlockCounters.length > 0) {
            const topAnonWatermark = this.anonBlockCounters[this.anonBlockCounters.length - 1];
            if (this.beginEndCounter === topAnonWatermark &&
                this.currentActiveNode &&
                this.currentActiveNode.type === NodeType.ANONYMOUS_BLOCK) {
                // 关闭匿名块
                this.currentActiveNode.endLine = lineNumber;
                this.anonBlockCounters.pop();
                this.controlStack = [];
                // 恢复外层方法为活动节点(它在 DECLARE 时被压入 nodeStack)
                const parentNode = this.nodeStack.pop();
                this.currentActiveNode = parentNode || this.packageNode;
                // 内联匿名块泄漏修复（ZCodeTest pkg_body_long 场景）：
                // startAnonymousBlock 将 currentLevel 抬升到宿主+1，
                // 闭合时必须恢复宿主层级，否则宿主内每个内联块
                // 永久泄漏 +1，累积后触发"嵌套深度超过限制"使整文件解析为 0 节点
                if (parentNode) {
                    this.currentLevel = parentNode.level;
                }
                return;
            }
        }

        if (this.beginEndCounter === 0) {
            if (this.currentActiveNode) {
                this.currentActiveNode.endLine = lineNumber;
            }

            this.currentLevel = this.currentLevel - 1;

            const parentNode = this.nodeStack.pop();
            if (parentNode) {
                this.currentActiveNode = parentNode;
            } else {
                this.currentActiveNode = this.packageNode;
            }

            // 子程序闭合：恢复进入它时保存的外层上下文（计数器+匿名块水位+层级），
            // 使宿主单元/外层内联匿名块的 END 配对回到正确的计数刻度，
            // 层级按进入前的宿主值恢复（帧值优先于递减值，自愈体内漂移）
            const savedUnitState = this.unitStateStack.pop();
            if (savedUnitState) {
                this.beginEndCounter = savedUnitState.beginEndCounter;
                this.anonBlockCounters = savedUnitState.anonBlockCounters;
                this.currentLevel = savedUnitState.currentLevel;
            }

            // 方法结束时清空控制栈
            this.controlStack = [];
        }
    }

    /**
     * 处理DECLARE语句（匿名块）
     * BUG-D修复: 记录 DECLARE 时的 beginEndCounter 作为匿名块的"水位",
     * 供 handleEndStatement 精确识别匿名块的 END。
     */
    private handleDeclareStatement(lineNumber: number): void {
        this.startAnonymousBlock(lineNumber);
    }

    /**
     * 创建并激活一个匿名块节点（DECLARE 引导与顶层裸 BEGIN 共用，Issue #5）
     *
     * 宿主规则：当前活动节点"未闭合"（endLine 为空）时才作为其子节点——
     * 覆盖方法体内联 DECLARE 块（v1.6.2 场景）；单元（包体/过程）已 END
     * 之后跟随的匿名块作为根节点，不再误挂为已关闭单元的子节点。
     *
     * 水位机制（BUG-D）：记录创建时的 beginEndCounter，匿名块的 BEGIN 使
     * bec+1，其 END 使 bec 回到水位即闭合。
     */
    private startAnonymousBlock(lineNumber: number): void {
        const anonBlockNode: ParseNode = {
            type: NodeType.ANONYMOUS_BLOCK,
            name: 'Anonymous Block',
            declarationLine: lineNumber,
            level: this.currentLevel,
            children: []
        };

        anonBlockNode.variableTable = new Map<string, VariableInfo>();

        if (this.currentActiveNode && this.currentActiveNode.endLine == null) {
            anonBlockNode.level = this.currentActiveNode.level + 1;
            this.currentActiveNode.children.push(anonBlockNode);
            this.nodeStack.push(this.currentActiveNode);
        } else {
            this.rootNodes.push(anonBlockNode);
        }
        this.currentActiveNode = anonBlockNode;
        this.currentLevel = anonBlockNode.level;

        // 记录匿名块水位: 匿名块的 BEGIN 会让 bec +1, 其 END 应让 bec 回到该值
        this.anonBlockCounters.push(this.beginEndCounter);
    }

    // ====== 判断方法 ======

    /**
     * 检查是否为IS/AS语句
     * BUG-A修复: 收紧匹配，避免误判方法体内的 "IF x IS NULL"、
     * "x AS y" 等正常表达式为声明关键字。
     * IS/AS 作为声明关键字时只可能:
     *   1) 独占一行:  "IS" / "AS"
     *   2) 位于签名行尾:  "...) RETURN NUMBER IS" / "... AS"
     * 配合 parseLine 中的 beginEndCounter === 0 约束双重保险。
     */
    private isIsAsStatement(line: string): boolean {
        // 1) 独占一行的 IS/AS
        if (/^\s*(IS|AS)\s*$/i.test(line)) {
            return true;
        }
        // 2) 行尾以 IS/AS 结尾（前面需有内容，即签名行）
        //    例如: "FUNCTION f RETURN NUMBER IS"  或 ") RETURN VARCHAR2 AS"
        //    要求 IS/AS 前必须有非空白字符，避免把空行算进去
        if (/\S\s+(IS|AS)\s*$/i.test(line)) {
            return true;
        }
        return false;
    }

    /**
     * 检查是否为BEGIN语句
     */
    private isBeginStatement(line: string): boolean {
        return /^\s*BEGIN\s*$/i.test(line);
    }

    /**
     * 检查是否为EXCEPTION语句
     */
    private isExceptionStatement(line: string): boolean {
        return /^\s*EXCEPTION\s*$/i.test(line);
    }

    /**
     * 检查是否为END语句（排除控制结构END IF/LOOP/CASE）
     * BUG-3修复：添加WHILE到排除列表
     * BUG-4修复：分号/斜杠可选
     */
    private isEndStatement(line: string): boolean {
        // 排除控制结构的END语句（含带标签形式：END IF lbl; / END LOOP lbl; / END CASE lbl;）
        if (/^\s*END\s+(IF|LOOP|CASE|WHILE)(\s+\w+)?\s*;?\s*$/i.test(line)) {
            return false;
        }
        // 匹配函数/过程/包/类型的END语句（分号/斜杠可选）
        return /^\s*END(\s+\w+)?\s*[;/]?\s*$/i.test(line);
    }

    /**
     * 检查是否为DECLARE语句
     */
    private isDeclareStatement(line: string): boolean {
        return /^\s*DECLARE\s*$/i.test(line);
    }

    // ====== 控制结构解析 ======

    /**
     * 解析控制结构 (IF/LOOP/CASE)
     */
    private parseControlStructures(line: string, lineNumber: number): boolean {
        // END IF
        if (PATTERNS.END_IF.test(line)) {
            this.popControlStack(lineNumber, 'IF');
            return true;
        }

        // END LOOP
        if (PATTERNS.END_LOOP.test(line)) {
            this.popControlStack(lineNumber, 'LOOP');
            return true;
        }

        // END CASE
        if (PATTERNS.END_CASE.test(line)) {
            this.popControlStack(lineNumber, 'CASE');
            return true;
        }

        // ELSIF
        const elsifMatch = line.match(PATTERNS.ELSIF_START);
        if (elsifMatch) {
            this.handleElsifBranch(elsifMatch[1], lineNumber);
            return true;
        }

        // ELSE：按栈顶上下文区分 IF 的 ELSE 与 CASE 的 ELSE
        // Issue #3 修复：CASE 的 ELSE 原先误走 IF 分支被压入 controlStack，
        // 而 popControlStack('CASE') 不接受 ELSE_BRANCH，END CASE 弹不出栈，
        // 残留栈帧会把后续同级控制结构（WHILE、异常区 IF 等）挂到 ELSE 分支下。
        if (PATTERNS.ELSE_START.test(line)) {
            const top = this.controlStack[this.controlStack.length - 1];
            if (top && top.type === NodeType.CASE_STATEMENT) {
                this.handleCaseElseBranch(lineNumber);
            } else {
                this.handleElseBranch(lineNumber);
            }
            return true;
        }

        // IF START
        const ifMatch = line.match(PATTERNS.IF_START);
        if (ifMatch) {
            this.pushControlNode(NodeType.IF_STATEMENT, 'IF', ifMatch[1], lineNumber);
            return true;
        }

        // WHILE LOOP
        const whileMatch = line.match(PATTERNS.WHILE_LOOP_START);
        if (whileMatch) {
            this.pushControlNode(NodeType.WHILE_LOOP, 'WHILE', whileMatch[1], lineNumber);
            return true;
        }

        // FOR LOOP (单行: FOR x IN ... LOOP)
        const forMatch = line.match(PATTERNS.FOR_LOOP_START);
        if (forMatch) {
            const conditionText = `${forMatch[1]} IN ${forMatch[2]}`;
            this.pushControlNode(NodeType.FOR_LOOP, 'FOR', conditionText, lineNumber);
            return true;
        }

        // FOR LOOP (cursor子查询形式, 跨多行): FOR x IN (SELECT ...) LOOP
        // 起始行形如 "FOR rec IN (" 不以 LOOP 结尾, 其 END LOOP 仍能正确弹出。
        const forCursorMatch = line.match(/^\s*FOR\s+(\w+)\s+IN\s*\(/i);
        if (forCursorMatch) {
            this.pushControlNode(NodeType.FOR_LOOP, 'FOR',
                `${forCursorMatch[1]} IN (subquery)`, lineNumber);
            return true;
        }

        // BASIC LOOP
        if (PATTERNS.BASIC_LOOP_START.test(line)) {
            this.pushControlNode(NodeType.LOOP_STATEMENT, 'LOOP', '', lineNumber);
            return true;
        }

        // CASE
        const caseMatch = line.match(PATTERNS.CASE_START);
        if (caseMatch && caseMatch[0].trim().toUpperCase() !== 'CASE') {
            // CASE with expression
            this.pushControlNode(NodeType.CASE_STATEMENT, 'CASE', caseMatch[1] || '', lineNumber);
            return true;
        } else if (caseMatch && caseMatch[0].trim().toUpperCase() === 'CASE') {
            // Simple CASE (might be just the keyword)
            if (line.trim().toUpperCase().startsWith('CASE')) {
                this.pushControlNode(NodeType.CASE_STATEMENT, 'CASE', caseMatch[1] || '', lineNumber);
                return true;
            }
        }

        // WHEN（仅在CASE上下文中）
        const whenMatch = line.match(PATTERNS.WHEN_START);
        if (whenMatch && this.isInCaseContext()) {
            this.handleWhenBranch(whenMatch[1], lineNumber);
            return true;
        }

        return false;
    }

    /**
     * 压入控制结构节点
     */
    private pushControlNode(type: NodeType, name: string, conditionText: string, lineNumber: number): void {
        if (this.controlStack.length >= this.controlStructureMaxDepth) {
            return; // 超出最大深度限制，忽略
        }

        const displayName = conditionText 
            ? `${name} ${this.truncateCondition(conditionText)}`
            : name;

        const node: ParseNode = {
            type,
            name: displayName,
            declarationLine: lineNumber,
            level: this.getControlNodeLevel(),
            children: [],
            conditionText: conditionText || undefined
        };

        this.addControlNodeToParent(node);
        this.controlStack.push(node);
    }

    /**
     * 弹出控制结构栈
     */
    private popControlStack(lineNumber: number, expectedType: string): void {
        if (this.controlStack.length === 0) return;

        const top = this.controlStack[this.controlStack.length - 1];
        
        // 验证栈顶类型匹配
        // Issue #3：CASE 分支补充 ELSE_BRANCH —— 仅作防御（CASE 的 ELSE 已不再压栈），
        // 避免历史遗留的 ELSE 栈顶让 END CASE 静默失败
        const isMatch = (expectedType === 'IF' && (top.type === NodeType.IF_STATEMENT || top.type === NodeType.ELSIF_BRANCH || top.type === NodeType.ELSE_BRANCH)) ||
                       (expectedType === 'LOOP' && (top.type === NodeType.LOOP_STATEMENT || top.type === NodeType.WHILE_LOOP || top.type === NodeType.FOR_LOOP)) ||
                       (expectedType === 'CASE' && (top.type === NodeType.CASE_STATEMENT || top.type === NodeType.WHEN_BRANCH || top.type === NodeType.ELSE_BRANCH));

        if (isMatch) {
            const popped = this.controlStack.pop()!;
            popped.endLine = lineNumber;
        }
    }

    /**
     * 处理ELSIF分支
     */
    private handleElsifBranch(condition: string, lineNumber: number): void {
        // 关闭当前IF/ELSIF节点
        if (this.controlStack.length > 0) {
            const top = this.controlStack[this.controlStack.length - 1];
            if (top.type === NodeType.IF_STATEMENT || top.type === NodeType.ELSIF_BRANCH) {
                top.endLine = lineNumber;
                this.controlStack.pop();
            }
        }

        const displayName = `ELSIF ${this.truncateCondition(condition)}`;
        const node: ParseNode = {
            type: NodeType.ELSIF_BRANCH,
            name: displayName,
            declarationLine: lineNumber,
            level: this.getControlNodeLevel(),
            children: [],
            conditionText: condition
        };

        this.addControlNodeToParent(node);
        this.controlStack.push(node);
    }

    /**
     * 处理ELSE分支
     */
    private handleElseBranch(lineNumber: number): void {
        // 关闭当前IF/ELSIF节点
        if (this.controlStack.length > 0) {
            const top = this.controlStack[this.controlStack.length - 1];
            if (top.type === NodeType.IF_STATEMENT || top.type === NodeType.ELSIF_BRANCH) {
                top.endLine = lineNumber;
                this.controlStack.pop();
            }
        }

        const node: ParseNode = {
            type: NodeType.ELSE_BRANCH,
            name: 'ELSE',
            declarationLine: lineNumber,
            level: this.getControlNodeLevel(),
            children: []
        };

        this.addControlNodeToParent(node);
        this.controlStack.push(node);
    }

    /**
     * 处理WHEN分支
     */
    private handleWhenBranch(condition: string, lineNumber: number): void {
        const displayName = `WHEN ${this.truncateCondition(condition)}`;
        const node: ParseNode = {
            type: NodeType.WHEN_BRANCH,
            name: displayName,
            declarationLine: lineNumber,
            level: this.getControlNodeLevel() + 1,
            children: [],
            conditionText: condition
        };

        // WHEN作为CASE的子节点
        if (this.controlStack.length > 0) {
            const caseNode = this.controlStack[this.controlStack.length - 1];
            if (caseNode.type === NodeType.CASE_STATEMENT) {
                caseNode.children.push(node);
            }
        }
    }

    /**
     * 处理CASE的ELSE分支（Issue #3）
     * 与 WHEN 分支保持一致：仅作为 CASE 的子节点，不压入 controlStack。
     * CASE 的 BEGIN/END 配对由 CASE 节点自身承担（END CASE 弹出 CASE），
     * ELSE 分支不参与栈平衡。
     */
    private handleCaseElseBranch(lineNumber: number): void {
        const node: ParseNode = {
            type: NodeType.ELSE_BRANCH,
            name: 'ELSE',
            declarationLine: lineNumber,
            level: this.getControlNodeLevel() + 1,
            children: []
        };

        if (this.controlStack.length > 0) {
            const caseNode = this.controlStack[this.controlStack.length - 1];
            if (caseNode.type === NodeType.CASE_STATEMENT) {
                caseNode.children.push(node);
            }
        }
    }

    /**
     * 获取控制节点的层级
     */
    private getControlNodeLevel(): number {
        if (this.controlStack.length > 0) {
            return this.controlStack[this.controlStack.length - 1].level + 1;
        }
        return this.currentActiveNode ? this.currentActiveNode.level + 1 : this.currentLevel + 1;
    }

    /**
     * 将控制节点添加到正确的父节点
     */
    private addControlNodeToParent(node: ParseNode): void {
        if (this.controlStack.length > 0) {
            // 添加为controlStack栈顶节点的子节点
            this.controlStack[this.controlStack.length - 1].children.push(node);
        } else if (this.currentActiveNode) {
            // 添加为当前方法节点的子节点
            this.currentActiveNode.children.push(node);
        }
    }

    /**
     * 检查是否在CASE上下文中
     */
    private isInCaseContext(): boolean {
        for (let i = this.controlStack.length - 1; i >= 0; i--) {
            if (this.controlStack[i].type === NodeType.CASE_STATEMENT) {
                return true;
            }
        }
        return false;
    }

    /**
     * 截断条件文本到60字符
     */
    private truncateCondition(text: string): string {
        const trimmed = text.trim();
        if (trimmed.length > 60) {
            return trimmed.substring(0, 57) + '...';
        }
        return trimmed;
    }

    // ====== 变量/常量/类型/游标/异常声明记录 ======

    /**
     * PL/SQL 保留关键字集合（大写），用于排除被 VARIABLE_DECLARATION 宽松正则
     * 误捕获的语句（如 PRAGMA EXCEPTION_INIT(...)、END IF;、ELSIF x THEN; 等）。
     */
    private static readonly PLSQL_RESERVED = new Set<string>([
        'END', 'IF', 'ELSIF', 'ELSE', 'THEN', 'LOOP', 'WHILE', 'FOR', 'CASE',
        'WHEN', 'EXCEPTION', 'BEGIN', 'DECLARE', 'IS', 'AS', 'RETURN', 'NULL',
        'PRAGMA', 'EXIT', 'GOTO', 'OPEN', 'FETCH', 'CLOSE', 'EXECUTE', 'IMMEDIATE',
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'MERGE', 'FROM', 'WHERE', 'INTO',
        'VALUES', 'SET', 'AND', 'OR', 'NOT', 'IN', 'OUT', 'BETWEEN', 'LIKE',
        'PROCEDURE', 'FUNCTION', 'PACKAGE', 'BODY', 'TRIGGER', 'TYPE', 'CURSOR',
        'CONSTANT', 'RECORD', 'TABLE', 'DEFAULT', 'DESC', 'ASC', 'ORDER', 'GROUP',
        'HAVING', 'BY', 'ON', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER'
    ]);

    private isReservedWord(word: string): boolean {
        return PLSQLParser.PLSQL_RESERVED.has(word.toUpperCase());
    }

    /**
     * 确保当前活动节点拥有 variableTable 并返回之
     */
    private ensureVariableTable(): Map<string, VariableInfo> | null {
        if (!this.currentActiveNode) {
            return null;
        }
        if (!this.currentActiveNode.variableTable) {
            this.currentActiveNode.variableTable = new Map<string, VariableInfo>();
        }
        return this.currentActiveNode.variableTable;
    }

    private checkAndRecordConstantDeclaration(line: string, lineNumber: number): void {
        const constMatch = line.match(PATTERNS.CONSTANT_DECLARATION);
        if (constMatch && this.currentActiveNode) {
            const table = this.ensureVariableTable();
            if (!table) { return; }
            // 提取初值：优先 := 形式，其次 DEFAULT 形式
            const initialValue = constMatch[3] !== undefined ? constMatch[3]
                : (constMatch[4] !== undefined ? constMatch[4] : undefined);
            const info: VariableInfo = {
                name: constMatch[1],
                line: lineNumber,
                type: constMatch[2],
                scope: this.currentActiveNode.name,
                category: DeclarationCategory.CONSTANT,
                initialValue
            };
            table.set(constMatch[1], info);
        }
    }

    private checkAndRecordVariableDeclaration(line: string, lineNumber: number): void {
        // 注意：VARIABLE_DECLARATION 正则要求行尾以 ';' 结尾，因此此处直接使用原始行（仅去除首尾空白），
        // 不再预先剥离 ';'。
        const cleanLine = line.trim();
        const varMatch = cleanLine.match(PATTERNS.VARIABLE_DECLARATION);
        if (varMatch && this.currentActiveNode) {
            // 排除保留关键字：避免 PRAGMA EXCEPTION_INIT(...);、END IF; 等被误判为变量声明
            if (this.isReservedWord(varMatch[1])) {
                return;
            }
            // 若已被常量/类型等更具体规则记录，则跳过，避免覆盖
            if (this.currentActiveNode.variableTable?.has(varMatch[1])) {
                return;
            }
            const table = this.ensureVariableTable();
            if (!table) { return; }
            // 提取初值文本（:= 或 DEFAULT），从剥离 ';' 后的文本中匹配
            let initialValue: string | undefined;
            const noSemicolon = cleanLine.replace(/;\s*$/, '');
            const assignMatch = noSemicolon.match(/(?::=|DEFAULT)\s*(.+?)\s*$/i);
            if (assignMatch) {
                initialValue = assignMatch[1];
            }
            const variableInfo: VariableInfo = {
                name: varMatch[1],
                line: lineNumber,
                type: varMatch[2],
                scope: this.currentActiveNode.name,
                category: DeclarationCategory.VARIABLE,
                initialValue
            };
            table.set(varMatch[1], variableInfo);
        }
    }

    private checkAndRecordTypeDeclaration(line: string, lineNumber: number): void {
        const typeMatch = line.match(PATTERNS.TYPE_DECLARATION);
        if (typeMatch && this.currentActiveNode) {
            const table = this.ensureVariableTable();
            if (!table) { return; }
            // 避免 TYPE 与 IS NULL 控制结构冲突：仅当首词为 TYPE 或形式为 `name IS RECORD/TABLE OF/...`
            const trimmed = line.trim();
            const isTypeKeyword = /^\s*TYPE\s+/i.test(trimmed);
            // 若不显式以 TYPE 开头，则要求整行非控制语句（不含 THEN / 不以 LOOP 结尾）
            if (!isTypeKeyword) {
                if (/THEN\s*$/i.test(trimmed) || /LOOP\s*$/i.test(trimmed)) {
                    return;
                }
            }
            const name = typeMatch[1];
            const kind = typeMatch[2];
            const typeStr = `IS ${kind}`;
            table.set(name, {
                name,
                line: lineNumber,
                type: typeStr,
                scope: this.currentActiveNode.name,
                category: DeclarationCategory.TYPE
            });
        }
    }

    private checkAndRecordCursorDeclaration(line: string, lineNumber: number): void {
        const cursorMatch = line.match(PATTERNS.CURSOR_DECLARATION);
        if (cursorMatch && this.currentActiveNode) {
            const table = this.ensureVariableTable();
            if (!table) { return; }
            const cursorInfo: VariableInfo = {
                name: cursorMatch[1],
                line: lineNumber,
                type: 'CURSOR',
                scope: this.currentActiveNode.name,
                category: DeclarationCategory.CURSOR
            };
            table.set(cursorMatch[1], cursorInfo);
        }
    }

    private checkAndRecordExceptionDeclaration(line: string, lineNumber: number): void {
        const exceptionMatch = line.match(PATTERNS.EXCEPTION_DECLARATION);
        if (exceptionMatch && this.currentActiveNode) {
            const table = this.ensureVariableTable();
            if (!table) { return; }
            const exceptionInfo: VariableInfo = {
                name: exceptionMatch[1],
                line: lineNumber,
                type: 'EXCEPTION',
                scope: this.currentActiveNode.name,
                category: DeclarationCategory.EXCEPTION
            };
            table.set(exceptionMatch[1], exceptionInfo);
        }
    }

    // ====== 工具方法 ======

    /**
     * 创建节点
     */
    private createNode(type: NodeType, name: string, declarationLine: number, level: number): ParseNode {
        return {
            type,
            name: name,
            declarationLine,
            beginLine: null,
            exceptionLine: null,
            endLine: null,
            level,
            children: []
        };
    }

    /**
     * 计算最大嵌套深度
     */
    private calculateMaxNestingDepth(nodes: ParseNode[]): number {
        let maxDepth = 0;
        const stack: { node: ParseNode, depth: number }[] = [];
        
        for (const node of nodes) {
            stack.push({ node, depth: node.level });
        }

        while (stack.length > 0) {
            const { node, depth } = stack.pop()!;
            maxDepth = Math.max(maxDepth, depth);
            
            for (const child of node.children) {
                stack.push({ node: child, depth: child.level });
            }
        }

        return maxDepth;
    }

    /**
     * 让出控制权：仅在距上次让步超过 YIELD_INTERVAL_MS 时才让出事件循环，
     * 保证大文件解析期间 UI 仍可响应，同时消除中小文件上的事件循环往返开销
     */
    private async yield(): Promise<void> {
        const now = Date.now();
        if (now - this.lastYieldTime < PLSQLParser.YIELD_INTERVAL_MS) {
            return;
        }
        this.lastYieldTime = now;
        return new Promise(resolve => setImmediate(resolve));
    }
}

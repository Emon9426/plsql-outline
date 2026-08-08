import {
    ParseResult,
    ParseNode,
    NodeType,
    FileType,
    ParseContext,
    ParseState,
    ParseError,
    SafetyConfig,
    VariableInfo,
    DeclarationCategory
} from './types';
import { KeywordPatterns } from './patterns';

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

    private version: string = '2.1.0';

    // 内存优化相关
    private processedLines: Set<number> = new Set();
    private stringCache: Map<string, string> = new Map();
    private maxCacheSize: number = 1000;

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
    async parse(content: string, sourceFile: string = 'unknown'): Promise<ParseResult> {
        const startTime = Date.now();
        
        try {
            this.initializeGlobalVariables();
            
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
        this.processedLines.clear();
        this.stringCache.clear();
    }

    /**
     * 内存清理
     */
    private cleanup(): void {
        this.processedLines.clear();
        this.stringCache.clear();
        this.nodeStack = [];
        this.controlStack = [];
        this.anonBlockCounters = [];
        this.currentActiveNode = null;
        this.packageNode = null;
    }

    /**
     * 字符串缓存优化
     */
    private getCachedString(str: string): string {
        if (this.stringCache.has(str)) {
            return this.stringCache.get(str)!;
        }
        
        if (this.stringCache.size >= this.maxCacheSize) {
            const entries = Array.from(this.stringCache.entries());
            this.stringCache.clear();
            for (let i = Math.floor(entries.length / 2); i < entries.length; i++) {
                this.stringCache.set(entries[i][0], entries[i][1]);
            }
        }
        
        this.stringCache.set(str, str);
        return str;
    }

    /**
     * 预处理内容：去除注释、空行等，但保持原始行号映射
     * BUG-7修复：字符串字面量移除在注释剥离之前执行
     */
    private preprocessContent(content: string): { cleanLines: string[], lineMapping: number[] } {
        const lines = content.split('\n');
        const cleanLines: string[] = [];
        const lineMapping: number[] = [];
        let inMultiLineComment = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const originalLineNumber = i + 1;
            
            // 处理多行注释（继续中的）
            if (inMultiLineComment) {
                const endIndex = line.indexOf('*/');
                if (endIndex !== -1) {
                    inMultiLineComment = false;
                    line = line.substring(endIndex + 2);
                } else {
                    continue;
                }
            }

            // BUG-7修复：先移除字符串字面量，再处理注释
            // 使用支持PL/SQL转义引号('')的正则
            line = line.replace(/'[^']*(?:''[^']*)*'/g, '""');

            // 检查多行注释开始
            const startIndex = line.indexOf('/*');
            if (startIndex !== -1) {
                const endIndex = line.indexOf('*/', startIndex + 2);
                if (endIndex !== -1) {
                    line = line.substring(0, startIndex) + line.substring(endIndex + 2);
                } else {
                    inMultiLineComment = true;
                    line = line.substring(0, startIndex);
                }
            }

            // 移除单行注释
            const commentIndex = line.indexOf('--');
            if (commentIndex !== -1) {
                line = line.substring(0, commentIndex);
            }

            // 去除首尾空白并检查是否为空行
            line = line.trim();
            if (line.length > 0) {
                cleanLines.push(this.getCachedString(line));
                lineMapping.push(originalLineNumber);
            }
        }

        return { cleanLines, lineMapping };
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

            await this.parseLine(line, originalLineNumber);
            this.processedLines.add(originalLineNumber);

            if (i % 50 === 0) {
                await this.yield();
                if (i % 500 === 0 && this.stringCache.size > this.maxCacheSize) {
                    this.stringCache.clear();
                }
            }
        }
    }

    /**
     * 检查跨行CREATE语句
     * BUG-5修复：最大5行前瞻，遇到关键字终止，总长度限制
     */
    private checkMultiLineCreate(lines: string[], startIndex: number, lineMapping: number[]): { match: { type: NodeType; name: string }, startIndex: number, endIndex: number } | null {
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
        
        // BUG-5修复：最大前瞻5行
        const maxLookAhead = Math.min(5, lines.length - startIndex - 1);
        for (let i = 1; i <= maxLookAhead; i++) {
            const nextLineIndex = startIndex + i;
            const nextLine = lines[nextLineIndex];
            
            if (/^\s*(FUNCTION|PROCEDURE)\s+\w+/i.test(nextLine)) {
                break;
            }
            
            // BUG-5修复：遇到这些关键字终止拼接
            if (/^\s*(IS|AS|AUTHID|DETERMINISTIC|RESULT_CACHE|PIPELINED)\s*/i.test(nextLine)) {
                break;
            }
            
            combinedLine += ' ' + nextLine;
            
            // BUG-5修复：总长度超过500字符放弃
            if (combinedLine.length > 500) {
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

        return null;
    }

    /**
     * 匹配FUNCTION/PROCEDURE关键字（子程序）
     */
    private matchFunctionProcedure(line: string): { type: NodeType; name: string } | null {
        let match = line.match(/^\s*FUNCTION\s+(\w+)/i);
        if (match) {
            return { type: NodeType.FUNCTION, name: match[1] };
        }

        match = line.match(/^\s*PROCEDURE\s+(\w+)/i);
        if (match) {
            return { type: NodeType.PROCEDURE, name: match[1] };
        }

        return null;
    }

    /**
     * 解析单行 - handler-based 架构
     */
    private async parseLine(line: string, lineNumber: number): Promise<void> {
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

        // 如果没有当前活动节点，跳过后续处理
        if (!this.currentActiveNode) {
            return;
        }

        // FUNCTION/PROCEDURE 关键字处理（子函数/过程）
        const functionMatch = this.matchFunctionProcedure(line);
        if (functionMatch) {
            await this.handleSubFunctionProcedure(functionMatch, lineNumber);
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
    }

    /**
     * 处理子函数/过程
     */
    private async handleSubFunctionProcedure(functionMatch: { type: NodeType; name: string }, lineNumber: number): Promise<void> {
        if (this.currentLevel >= 20) {
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

        // 普通的子函数/过程处理
        const newNode = this.createNode(functionMatch.type, functionMatch.name, lineNumber, this.currentLevel + 1);

        if (this.currentActiveNode) {
            this.nodeStack.push(this.currentActiveNode);
            this.currentActiveNode.children.push(newNode);
        }

        this.currentActiveNode = newNode;
        this.currentLevel = this.currentLevel + 1;
        this.beginEndCounter = 0;
        // 进入新子程序时清空控制栈与匿名块水位
        this.controlStack = [];
        this.anonBlockCounters = [];
    }

    /**
     * 处理IS/AS语句
     */
    private async handleIsAsStatement(lineNumber: number): Promise<void> {
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
        if (this.currentLevel === 1 && this.packageNode && !this.packageInitFlag) {
            this.packageInitFlag = true;
            this.packageNode.beginLine = lineNumber;
            this.beginEndCounter = 1;
            return;
        }

        // 普通BEGIN处理
        if (this.beginEndCounter === 0 && this.currentActiveNode) {
            this.currentActiveNode.beginLine = lineNumber;
        }
        this.beginEndCounter = this.beginEndCounter + 1;
    }

    /**
     * 处理EXCEPTION语句
     */
    private async handleExceptionStatement(lineNumber: number): Promise<void> {
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
        if (this.currentLevel === 1 && this.nodeStack.length === 0 && this.packageNode) {
            this.packageNode.endLine = lineNumber;
            this.beginEndCounter = 0;
            this.currentActiveNode = this.packageNode;
            this.controlStack = [];
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
        const anonBlockNode: ParseNode = {
            type: NodeType.ANONYMOUS_BLOCK,
            name: 'Anonymous Block',
            declarationLine: lineNumber,
            level: this.currentLevel,
            children: []
        };

        anonBlockNode.variableTable = new Map<string, VariableInfo>();

        if (this.currentActiveNode) {
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
        // 排除控制结构的END语句
        if (/^\s*END\s+(IF|LOOP|CASE|WHILE)\s*[;]?\s*$/i.test(line)) {
            return false;
        }
        // 匹配函数/过程/包的END语句（分号/斜杠可选）
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
        if (KeywordPatterns.END_IF.test(line)) {
            this.popControlStack(lineNumber, 'IF');
            return true;
        }

        // END LOOP
        if (KeywordPatterns.END_LOOP.test(line)) {
            this.popControlStack(lineNumber, 'LOOP');
            return true;
        }

        // END CASE
        if (KeywordPatterns.END_CASE.test(line)) {
            this.popControlStack(lineNumber, 'CASE');
            return true;
        }

        // ELSIF
        const elsifMatch = line.match(KeywordPatterns.ELSIF_START);
        if (elsifMatch) {
            this.handleElsifBranch(elsifMatch[1], lineNumber);
            return true;
        }

        // ELSE（仅在IF上下文中）
        if (KeywordPatterns.ELSE_START.test(line)) {
            this.handleElseBranch(lineNumber);
            return true;
        }

        // IF START
        const ifMatch = line.match(KeywordPatterns.IF_START);
        if (ifMatch) {
            this.pushControlNode(NodeType.IF_STATEMENT, 'IF', ifMatch[1], lineNumber);
            return true;
        }

        // WHILE LOOP
        const whileMatch = line.match(KeywordPatterns.WHILE_LOOP_START);
        if (whileMatch) {
            this.pushControlNode(NodeType.WHILE_LOOP, 'WHILE', whileMatch[1], lineNumber);
            return true;
        }

        // FOR LOOP (单行: FOR x IN ... LOOP)
        const forMatch = line.match(KeywordPatterns.FOR_LOOP_START);
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
        if (KeywordPatterns.BASIC_LOOP_START.test(line)) {
            this.pushControlNode(NodeType.LOOP_STATEMENT, 'LOOP', '', lineNumber);
            return true;
        }

        // CASE
        const caseMatch = line.match(KeywordPatterns.CASE_START);
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
        const whenMatch = line.match(KeywordPatterns.WHEN_START);
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
        const isMatch = (expectedType === 'IF' && (top.type === NodeType.IF_STATEMENT || top.type === NodeType.ELSIF_BRANCH || top.type === NodeType.ELSE_BRANCH)) ||
                       (expectedType === 'LOOP' && (top.type === NodeType.LOOP_STATEMENT || top.type === NodeType.WHILE_LOOP || top.type === NodeType.FOR_LOOP)) ||
                       (expectedType === 'CASE' && (top.type === NodeType.CASE_STATEMENT || top.type === NodeType.WHEN_BRANCH));

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
        const constMatch = line.match(KeywordPatterns.CONSTANT_DECLARATION);
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
        const varMatch = cleanLine.match(KeywordPatterns.VARIABLE_DECLARATION);
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
        const typeMatch = line.match(KeywordPatterns.TYPE_DECLARATION);
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
        const cursorMatch = line.match(KeywordPatterns.CURSOR_DECLARATION);
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
        const exceptionMatch = line.match(KeywordPatterns.EXCEPTION_DECLARATION);
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
            name: this.getCachedString(name),
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
     * 让出控制权
     */
    private async yield(): Promise<void> {
        return new Promise(resolve => setImmediate(resolve));
    }
}

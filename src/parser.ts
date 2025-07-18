import { 
    ParseResult, 
    ParseNode, 
    NodeType, 
    FileType, 
    ParseContext, 
    ParseState, 
    ParseError, 
    SafetyConfig 
} from './types';

/**
 * 按照技术设计文档重新实现的PL/SQL解析器
 */
export class PLSQLParser {
    // 全局变量定义（按照技术设计文档）
    private currentLevel: number = 0;                    // 层级的全局变量
    private beginEndCounter: number = 0;                // BEGIN_END_COUNTER
    private nodeStack: ParseNode[] = [];                // 节点栈：用于管理父子节点关系
    private currentActiveNode: ParseNode | null = null; // 当前活动节点指针
    private rootNodes: ParseNode[] = [];                // 根节点集合
    private packageNode: ParseNode | null = null;       // 包体节点指针
    private packageInitFlag: boolean = false;           // 包体初始化段标识

    private version: string = '2.0.0';

    /**
     * 解析PL/SQL代码
     */
    async parse(content: string, sourceFile: string = 'unknown'): Promise<ParseResult> {
        const startTime = Date.now();
        
        try {
            // 初始化处理
            this.initializeGlobalVariables();
            
            // 预处理：分割行并清理
            const { cleanLines, lineMapping } = this.preprocessContent(content);
            
            // 逐行解析
            await this.parseLines(cleanLines, lineMapping);
            
            // 构建解析结果
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

            return result;

        } catch (error) {
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
    }

    /**
     * 预处理内容：去除注释、空行等，但保持原始行号映射
     */
    private preprocessContent(content: string): { cleanLines: string[], lineMapping: number[] } {
        const lines = content.split('\n');
        const cleanLines: string[] = [];
        const lineMapping: number[] = []; // 映射清理后的行号到原始行号
        let inMultiLineComment = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            const originalLineNumber = i + 1;
            
            // 处理多行注释
            if (inMultiLineComment) {
                const endIndex = line.indexOf('*/');
                if (endIndex !== -1) {
                    inMultiLineComment = false;
                    line = line.substring(endIndex + 2);
                } else {
                    continue; // 跳过注释中的行
                }
            }

            // 检查多行注释开始
            const startIndex = line.indexOf('/*');
            if (startIndex !== -1) {
                const endIndex = line.indexOf('*/', startIndex + 2);
                if (endIndex !== -1) {
                    // 单行内的完整多行注释
                    line = line.substring(0, startIndex) + line.substring(endIndex + 2);
                } else {
                    // 多行注释开始
                    inMultiLineComment = true;
                    line = line.substring(0, startIndex);
                }
            }

            // 移除单行注释
            const commentIndex = line.indexOf('--');
            if (commentIndex !== -1) {
                line = line.substring(0, commentIndex);
            }

            // 移除字符串字面量中的内容（避免误识别）
            line = this.removeStringLiterals(line);

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
     * 移除字符串字面量
     */
    private removeStringLiterals(line: string): string {
        return line.replace(/'([^'\\]|\\.)*'/g, '""');
    }

    /**
     * 逐行解析
     */
    private async parseLines(lines: string[], lineMapping: number[]): Promise<void> {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const originalLineNumber = lineMapping[i];

            // 检查跨行CREATE语句
            const multiLineCreateMatch = await this.checkMultiLineCreate(lines, i);
            if (multiLineCreateMatch) {
                const originalStartLine = lineMapping[multiLineCreateMatch.startIndex];
                await this.handleCreateStatement(multiLineCreateMatch.match, originalStartLine);
                i = multiLineCreateMatch.endIndex; // 跳过已处理的行
                continue;
            }

            await this.parseLine(line, originalLineNumber);

            // 让出控制权防止阻塞
            if (i % 100 === 0) {
                await this.yield();
            }
        }
    }
    /**
     * 检查跨行CREATE语句
     */
    private async checkMultiLineCreate(lines: string[], startIndex: number): Promise<{ match: { type: NodeType; name: string }, startIndex: number, endIndex: number } | null> {
        const startLine = lines[startIndex];
        
        // 检查是否以CREATE开头
        if (!/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?/i.test(startLine)) {
            return null;
        }

        // 先检查当前行是否已经是完整的CREATE语句
        const singleLineMatch = this.matchCreateStatement(startLine);
        if (singleLineMatch) {
            return null; // 单行CREATE语句，不需要跨行处理
        }

        // 尝试组合多行来匹配完整的CREATE语句
        let combinedLine = startLine;
        let endIndex = startIndex;
        
        // 最多向前查找5行（减少跳过的行数）
        for (let i = startIndex + 1; i < Math.min(startIndex + 5, lines.length); i++) {
            const nextLine = lines[i];
            
            // 如果遇到嵌套的FUNCTION/PROCEDURE，停止查找
            if (/^\s*(FUNCTION|PROCEDURE)\s+\w+/i.test(nextLine)) {
                break;
            }
            
            // 如果遇到其他关键字，停止查找
            if (/^\s*(IS|AS|BEGIN)\s/i.test(nextLine)) {
                break;
            }
            
            combinedLine += ' ' + nextLine;
            endIndex = i;
            
            // 尝试匹配完整的CREATE语句
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
     * 解析单行
     */
    private async parseLine(line: string, lineNumber: number): Promise<void> {
        // CREATE OR REPLACE 处理
        const createMatch = this.matchCreateStatement(line);
        if (createMatch) {
            await this.handleCreateStatement(createMatch, lineNumber);
            return;
        }

        // 如果没有当前活动节点，跳过
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
        if (this.isIsAsStatement(line)) {
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

        // END 关键字处理
        if (this.isEndStatement(line)) {
            await this.handleEndStatement(lineNumber);
            return;
        }
    }

    /**
     * 匹配CREATE语句
     */
    private matchCreateStatement(line: string): { type: NodeType; name: string } | null {
        // CREATE OR REPLACE PACKAGE BODY (必须先匹配，因为包含PACKAGE关键字)
        let match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?PACKAGE\s+BODY\s+(\w+)/i);
        if (match) {
            return { type: NodeType.PACKAGE_BODY, name: match[1] };
        }

        // CREATE OR REPLACE PACKAGE (不包含BODY)
        match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?PACKAGE\s+(?!BODY\s)(\w+)/i);
        if (match) {
            return { type: NodeType.PACKAGE_HEADER, name: match[1] };
        }

        // CREATE OR REPLACE FUNCTION
        match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(\w+)/i);
        if (match) {
            return { type: NodeType.FUNCTION, name: match[1] };
        }

        // CREATE OR REPLACE PROCEDURE
        match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?PROCEDURE\s+(\w+)/i);
        if (match) {
            return { type: NodeType.PROCEDURE, name: match[1] };
        }

        // CREATE OR REPLACE TRIGGER
        match = line.match(/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER\s+(\w+)/i);
        if (match) {
            return { type: NodeType.TRIGGER, name: match[1] };
        }

        return null;
    }

    /**
     * 匹配FUNCTION/PROCEDURE关键字
     */
    private matchFunctionProcedure(line: string): { type: NodeType; name: string } | null {
        // FUNCTION
        let match = line.match(/^\s*FUNCTION\s+(\w+)/i);
        if (match) {
            return { type: NodeType.FUNCTION, name: match[1] };
        }

        // PROCEDURE
        match = line.match(/^\s*PROCEDURE\s+(\w+)/i);
        if (match) {
            return { type: NodeType.PROCEDURE, name: match[1] };
        }

        return null;
    }

    /**
     * 处理CREATE语句
     */
    private async handleCreateStatement(createMatch: { type: NodeType; name: string }, lineNumber: number): Promise<void> {
        // 创建节点对象
        const node = this.createNode(createMatch.type, createMatch.name, lineNumber, 1);
        
        // 设置全局变量
        this.currentLevel = 1;
        this.currentActiveNode = node;
        this.rootNodes.push(node);

        // 如果是包体，设置包体节点指针
        if (createMatch.type === NodeType.PACKAGE_BODY) {
            this.packageNode = node;
        }

        // 重置BEGIN_END_COUNTER
        this.beginEndCounter = 0;
    }

    /**
     * 处理子函数/过程
     */
    private async handleSubFunctionProcedure(functionMatch: { type: NodeType; name: string }, lineNumber: number): Promise<void> {
        // 检查是否为Package Header中的声明
        if (this.currentActiveNode && this.currentActiveNode.type === NodeType.PACKAGE_HEADER) {
            // Package Header中的函数/过程声明
            const declarationType = functionMatch.type === NodeType.FUNCTION ? 
                NodeType.FUNCTION_DECLARATION : NodeType.PROCEDURE_DECLARATION;
            
            const declarationNode = this.createNode(
                declarationType,
                functionMatch.name,
                lineNumber,
                2
            );
            
            this.currentActiveNode.children.push(declarationNode);
            // Package Header中的声明不需要改变当前活动节点
            return;
        }

        // 普通的子函数/过程处理
        const newNode = this.createNode(
            functionMatch.type, 
            functionMatch.name, 
            lineNumber, 
            this.currentLevel + 1
        );

        // 将当前活动节点压入节点栈
        if (this.currentActiveNode) {
            this.nodeStack.push(this.currentActiveNode);
            this.currentActiveNode.children.push(newNode);
        }

        // 设置新节点为当前活动节点
        this.currentActiveNode = newNode;

        // 更新层级
        this.currentLevel = this.currentLevel + 1;

        // 重置BEGIN_END_COUNTER
        this.beginEndCounter = 0;
    }

    /**
     * 处理IS/AS语句
     */
    private async handleIsAsStatement(lineNumber: number): Promise<void> {
        // IS/AS语句处理已移除，保留方法以维持代码结构
        // 如果需要，可以在此处添加其他逻辑
    }

    /**
     * 处理BEGIN语句
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
        // 只有当BEGIN_END_COUNTER等于1时才处理
        if (this.beginEndCounter === 1 && this.currentActiveNode) {
            this.currentActiveNode.exceptionLine = lineNumber;
        }
    }

    /**
     * 处理END语句
     */
    private async handleEndStatement(lineNumber: number): Promise<void> {
        this.beginEndCounter = this.beginEndCounter - 1;

        // 只有当BEGIN_END_COUNTER等于0时才处理
        if (this.beginEndCounter === 0) {
            if (this.currentActiveNode) {
                this.currentActiveNode.endLine = lineNumber;
            }

            // 更新层级
            this.currentLevel = this.currentLevel - 1;

            // 从节点栈中弹出父节点
            const parentNode = this.nodeStack.pop();
            if (parentNode) {
                this.currentActiveNode = parentNode;
            } else {
                // 如果是包体，设置为包体节点
                this.currentActiveNode = this.packageNode;
            }
        }
    }

    /**
     * 检查是否为IS/AS语句
     */
    private isIsAsStatement(line: string): boolean {
        return /^\s*(IS|AS)\s*$/i.test(line) || /\b(IS|AS)\b/i.test(line);
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
     * 检查是否为END语句（函数/过程/包的结束，不包括控制结构）
     */
    private isEndStatement(line: string): boolean {
        // 排除控制结构的END语句
        if (/^\s*END\s+(IF|LOOP|CASE)\s*[;]?\s*$/i.test(line)) {
            return false;
        }
        
        // 匹配函数/过程/包的END语句
        return /^\s*END(\s+\w+)?\s*[;/]?\s*$/i.test(line);
    }

    /**
     * 创建节点
     */
    private createNode(type: NodeType, name: string, declarationLine: number, level: number): ParseNode {
        return {
            type,
            name,
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

        const traverse = (node: ParseNode): number => {
            let depth = node.level;
            for (const child of node.children) {
                depth = Math.max(depth, traverse(child));
            }
            return depth;
        };

        for (const node of nodes) {
            maxDepth = Math.max(maxDepth, traverse(node));
        }

        return maxDepth;
    }

    /**
     * 让出控制权（防止阻塞）
     */
    private async yield(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 0));
    }
}

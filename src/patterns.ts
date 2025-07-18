import { KeywordPattern, FileType, NodeType } from './types';

/**
 * 关键字匹配模式定义
 */
export class KeywordPatterns {
    /**
     * CREATE OR REPLACE PACKAGE 模式
     */
    static readonly CREATE_PACKAGE = /^\s*CREATE\s+OR\s+REPLACE\s+PACKAGE\s+(\w+)\s*(?:AS|IS)?\s*$/i;

    /**
     * CREATE OR REPLACE PACKAGE BODY 模式
     */
    static readonly CREATE_PACKAGE_BODY = /^\s*CREATE\s+OR\s+REPLACE\s+PACKAGE\s+BODY\s+(\w+)\s*(?:AS|IS)?\s*$/i;

    /**
     * CREATE OR REPLACE FUNCTION 模式
     */
    static readonly CREATE_FUNCTION = /^\s*CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(\w+)/i;

    /**
     * CREATE OR REPLACE PROCEDURE 模式
     */
    static readonly CREATE_PROCEDURE = /^\s*CREATE\s+(?:OR\s+REPLACE\s+)?PROCEDURE\s+(\w+)/i;

    /**
     * CREATE OR REPLACE TRIGGER 模式
     */
    static readonly CREATE_TRIGGER = /^\s*CREATE\s+OR\s+REPLACE\s+TRIGGER\s+(\w+)/i;

    /**
     * 内部函数/过程声明模式
     */
    static readonly INTERNAL_FUNCTION = /^\s*FUNCTION\s+(\w+)/i;
    static readonly INTERNAL_PROCEDURE = /^\s*PROCEDURE\s+(\w+)/i;

    /**
     * 函数/过程声明（以分号结尾）模式
     */
    static readonly FUNCTION_DECLARATION = /^\s*FUNCTION\s+(\w+).*;\s*$/i;
    static readonly PROCEDURE_DECLARATION = /^\s*PROCEDURE\s+(\w+).*;\s*$/i;

    /**
     * IS/AS 语句模式
     */
    static readonly IS_AS_STATEMENT = /^\s*(IS|AS)\s*$/i;
    
    /**
     * 包含IS/AS的行模式（可能在同一行）
     */
    static readonly CONTAINS_IS_AS = /\b(IS|AS)\b/i;

    /**
     * BEGIN 语句模式
     */
    static readonly BEGIN_STATEMENT = /^\s*BEGIN\s*$/i;

    /**
     * EXCEPTION 语句模式
     */
    static readonly EXCEPTION_STATEMENT = /^\s*EXCEPTION\s*$/i;

    /**
     * END 语句模式（函数/过程/包的结束，不包括控制结构）
     */
    static readonly END_STATEMENT = /^\s*END(\s+\w+)?\s*[;/]\s*$/i;

    /**
     * 控制结构的END语句模式
     */
    static readonly CONTROL_END_STATEMENT = /^\s*END\s+(IF|LOOP|CASE)\s*[;]?\s*$/i;

    /**
     * DECLARE 语句模式（匿名块开始）
     */
    static readonly DECLARE_STATEMENT = /^\s*DECLARE\s*$/i;

    /**
     * 注释模式
     */
    static readonly SINGLE_LINE_COMMENT = /^\s*--.*$/;
    static readonly MULTI_LINE_COMMENT_START = /^\s*\/\*/;
    static readonly MULTI_LINE_COMMENT_END = /\*\/\s*$/;
    static readonly FULL_MULTI_LINE_COMMENT = /^\s*\/\*.*\*\/\s*$/;

    /**
     * 空行模式
     */
    static readonly EMPTY_LINE = /^\s*$/;

    /**
     * 字符串字面量模式（用于排除字符串中的关键字）
     */
    static readonly STRING_LITERAL = /'([^'\\]|\\.)*'/g;

    /**
     * 分号结束模式
     */
    static readonly SEMICOLON_END = /;\s*$/;

    /**
     * 斜杠结束模式（匿名块）
     */
    static readonly SLASH_END = /^\s*\/\s*$/;
}

/**
 * 文件类型识别器
 */
export class FileTypeDetector {
    /**
     * 根据文件内容检测文件类型
     */
    static detectFileType(content: string): FileType {
        const lines = content.split('\n');
        
        // 预处理：移除注释和空行
        const cleanLines = this.removeCommentsAndEmptyLines(lines);
        
        if (cleanLines.length === 0) {
            return FileType.UNKNOWN;
        }

        // 统计各种CREATE语句的数量
        let packageCount = 0;
        let packageBodyCount = 0;
        let functionCount = 0;
        let procedureCount = 0;
        let triggerCount = 0;
        let hasAnonymousBlock = false;

        // 扫描所有行来统计CREATE语句
        for (const line of cleanLines) {
            const trimmedLine = line.trim();
            
            // Package Header
            if (KeywordPatterns.CREATE_PACKAGE.test(trimmedLine)) {
                packageCount++;
            }
            // Package Body
            else if (KeywordPatterns.CREATE_PACKAGE_BODY.test(trimmedLine)) {
                packageBodyCount++;
            }
            // Function
            else if (KeywordPatterns.CREATE_FUNCTION.test(trimmedLine)) {
                functionCount++;
            }
            // Procedure
            else if (KeywordPatterns.CREATE_PROCEDURE.test(trimmedLine)) {
                procedureCount++;
            }
            // Trigger
            else if (KeywordPatterns.CREATE_TRIGGER.test(trimmedLine)) {
                triggerCount++;
            }
            // Anonymous Block (以DECLARE或BEGIN开始)
            else if (KeywordPatterns.DECLARE_STATEMENT.test(trimmedLine) || 
                     KeywordPatterns.BEGIN_STATEMENT.test(trimmedLine)) {
                hasAnonymousBlock = true;
            }
        }

        // 计算总的CREATE语句数量
        const totalCreateStatements = functionCount + procedureCount + packageCount + packageBodyCount + triggerCount;
        
        // 如果有多个CREATE语句，使用通用解析处理
        if (totalCreateStatements > 1) {
            return FileType.UNKNOWN; // 使用通用解析处理多个CREATE语句
        }
        
        // 单个CREATE语句的情况
        if (packageBodyCount === 1) {
            return FileType.PACKAGE_BODY;
        }
        if (packageCount === 1) {
            return FileType.PACKAGE_HEADER;
        }
        if (triggerCount === 1) {
            return FileType.TRIGGER;
        }
        if (functionCount === 1) {
            return FileType.STANDALONE_FUNCTION;
        }
        if (procedureCount === 1) {
            return FileType.STANDALONE_PROCEDURE;
        }
        
        // 匿名块
        if (hasAnonymousBlock) {
            return FileType.ANONYMOUS_BLOCK;
        }

        return FileType.UNKNOWN;
    }

    /**
     * 根据文件扩展名推测文件类型
     */
    static detectFileTypeByExtension(fileName: string): FileType {
        const extension = fileName.toLowerCase().split('.').pop();
        
        switch (extension) {
            case 'pks':
                return FileType.PACKAGE_HEADER;
            case 'pkb':
                return FileType.PACKAGE_BODY;
            case 'prc':
                return FileType.STANDALONE_PROCEDURE;
            case 'fnc':
                return FileType.STANDALONE_FUNCTION;
            case 'trg':
                return FileType.TRIGGER;
            case 'sql':
                return FileType.UNKNOWN; // 需要通过内容检测
            default:
                return FileType.UNKNOWN;
        }
    }

    /**
     * 移除注释和空行
     */
    private static removeCommentsAndEmptyLines(lines: string[]): string[] {
        const result: string[] = [];
        let inMultiLineComment = false;

        for (const line of lines) {
            let cleanLine = line;

            // 处理多行注释
            if (inMultiLineComment) {
                if (KeywordPatterns.MULTI_LINE_COMMENT_END.test(line)) {
                    inMultiLineComment = false;
                    // 移除注释结束符后的内容
                    cleanLine = line.replace(/.*\*\//, '');
                } else {
                    continue; // 跳过多行注释中的行
                }
            }

            // 检查多行注释开始
            if (KeywordPatterns.MULTI_LINE_COMMENT_START.test(cleanLine)) {
                if (KeywordPatterns.FULL_MULTI_LINE_COMMENT.test(cleanLine)) {
                    // 单行内的完整多行注释
                    cleanLine = cleanLine.replace(KeywordPatterns.FULL_MULTI_LINE_COMMENT, '');
                } else {
                    // 多行注释开始
                    inMultiLineComment = true;
                    cleanLine = cleanLine.replace(/\/\*.*$/, '');
                }
            }

            // 移除单行注释
            if (KeywordPatterns.SINGLE_LINE_COMMENT.test(cleanLine)) {
                cleanLine = cleanLine.replace(/--.*$/, '');
            }

            // 移除字符串字面量中的内容（避免误识别）
            cleanLine = this.removeStringLiterals(cleanLine);

            // 检查是否为空行
            if (!KeywordPatterns.EMPTY_LINE.test(cleanLine)) {
                result.push(cleanLine.trim());
            }
        }

        return result;
    }

    /**
     * 移除字符串字面量
     */
    private static removeStringLiterals(line: string): string {
        return line.replace(KeywordPatterns.STRING_LITERAL, '""');
    }
}

/**
 * 关键字匹配器
 */
export class KeywordMatcher {
    /**
     * 匹配CREATE语句
     */
    static matchCreateStatement(line: string): { type: NodeType; name: string } | null {
        // Package Header
        const packageMatch = KeywordPatterns.CREATE_PACKAGE.exec(line);
        if (packageMatch) {
            return { type: NodeType.PACKAGE_HEADER, name: packageMatch[1] };
        }

        // Package Body
        const packageBodyMatch = KeywordPatterns.CREATE_PACKAGE_BODY.exec(line);
        if (packageBodyMatch) {
            return { type: NodeType.PACKAGE_BODY, name: packageBodyMatch[1] };
        }

        // Function
        const functionMatch = KeywordPatterns.CREATE_FUNCTION.exec(line);
        if (functionMatch) {
            return { type: NodeType.FUNCTION, name: functionMatch[1] };
        }

        // Procedure
        const procedureMatch = KeywordPatterns.CREATE_PROCEDURE.exec(line);
        if (procedureMatch) {
            return { type: NodeType.PROCEDURE, name: procedureMatch[1] };
        }

        // Trigger
        const triggerMatch = KeywordPatterns.CREATE_TRIGGER.exec(line);
        if (triggerMatch) {
            return { type: NodeType.TRIGGER, name: triggerMatch[1] };
        }

        return null;
    }

    /**
     * 匹配内部函数/过程声明
     */
    static matchInternalDeclaration(line: string): { type: NodeType; name: string } | null {
        // Internal Function
        const functionMatch = KeywordPatterns.INTERNAL_FUNCTION.exec(line);
        if (functionMatch) {
            return { type: NodeType.FUNCTION, name: functionMatch[1] };
        }

        // Internal Procedure
        const procedureMatch = KeywordPatterns.INTERNAL_PROCEDURE.exec(line);
        if (procedureMatch) {
            return { type: NodeType.PROCEDURE, name: procedureMatch[1] };
        }

        return null;
    }

    /**
     * 匹配Package Header中的声明
     */
    static matchPackageHeaderDeclaration(line: string): { type: NodeType; name: string } | null {
        // Function Declaration
        const functionMatch = KeywordPatterns.INTERNAL_FUNCTION.exec(line);
        if (functionMatch) {
            return { type: NodeType.FUNCTION_DECLARATION, name: functionMatch[1] };
        }

        // Procedure Declaration
        const procedureMatch = KeywordPatterns.INTERNAL_PROCEDURE.exec(line);
        if (procedureMatch) {
            return { type: NodeType.PROCEDURE_DECLARATION, name: procedureMatch[1] };
        }

        return null;
    }

    /**
     * 检查是否为IS/AS语句
     */
    static isIsAsStatement(line: string): boolean {
        return KeywordPatterns.IS_AS_STATEMENT.test(line);
    }

    /**
     * 检查是否为BEGIN语句
     */
    static isBeginStatement(line: string): boolean {
        return KeywordPatterns.BEGIN_STATEMENT.test(line);
    }

    /**
     * 检查是否为EXCEPTION语句
     */
    static isExceptionStatement(line: string): boolean {
        return KeywordPatterns.EXCEPTION_STATEMENT.test(line);
    }

    /**
     * 检查是否为END语句
     */
    static isEndStatement(line: string): boolean {
        return KeywordPatterns.END_STATEMENT.test(line);
    }

    /**
     * 检查是否为DECLARE语句
     */
    static isDeclareStatement(line: string): boolean {
        return KeywordPatterns.DECLARE_STATEMENT.test(line);
    }

    /**
     * 检查是否为注释行
     */
    static isComment(line: string): boolean {
        return KeywordPatterns.SINGLE_LINE_COMMENT.test(line) ||
               KeywordPatterns.FULL_MULTI_LINE_COMMENT.test(line);
    }

    /**
     * 检查是否为空行
     */
    static isEmptyLine(line: string): boolean {
        return KeywordPatterns.EMPTY_LINE.test(line);
    }

    /**
     * 检查是否应该跳过该行（注释或空行）
     */
    static shouldSkipLine(line: string): boolean {
        return this.isComment(line) || this.isEmptyLine(line);
    }

    /**
     * 预处理行内容（移除注释和多余空格）
     */
    static preprocessLine(line: string): string {
        let processed = line;

        // 移除单行注释
        processed = processed.replace(/--.*$/, '');

        // 移除字符串字面量中的内容
        processed = processed.replace(KeywordPatterns.STRING_LITERAL, '""');

        // 移除多余的空格
        processed = processed.trim();

        return processed;
    }

    /**
     * 提取END语句中的名称
     */
    static extractEndName(line: string): string | null {
        const match = KeywordPatterns.END_STATEMENT.exec(line);
        if (match && match[1]) {
            return match[1].trim();
        }
        return null;
    }

    /**
     * 检查是否为分号结束
     */
    static isSemicolonEnd(line: string): boolean {
        return KeywordPatterns.SEMICOLON_END.test(line);
    }

    /**
     * 检查是否为斜杠结束（匿名块）
     */
    static isSlashEnd(line: string): boolean {
        return KeywordPatterns.SLASH_END.test(line);
    }

    /**
     * 检查是否为函数/过程声明（以分号结尾）
     */
    static isFunctionDeclaration(line: string): boolean {
        return KeywordPatterns.FUNCTION_DECLARATION.test(line);
    }

    static isProcedureDeclaration(line: string): boolean {
        return KeywordPatterns.PROCEDURE_DECLARATION.test(line);
    }

    static isDeclarationOnly(line: string): boolean {
        return this.isFunctionDeclaration(line) || this.isProcedureDeclaration(line);
    }
}

/**
 * 多行注释处理器
 */
export class MultiLineCommentProcessor {
    private inComment: boolean = false;

    /**
     * 处理一行，返回处理后的内容
     */
    processLine(line: string): string | null {
        let result = line;

        // 如果当前在多行注释中
        if (this.inComment) {
            if (KeywordPatterns.MULTI_LINE_COMMENT_END.test(line)) {
                this.inComment = false;
                // 返回注释结束符后的内容
                result = line.replace(/.*\*\//, '');
                return result.trim() || null;
            } else {
                return null; // 跳过注释中的行
            }
        }

        // 检查多行注释开始
        if (KeywordPatterns.MULTI_LINE_COMMENT_START.test(result)) {
            if (KeywordPatterns.FULL_MULTI_LINE_COMMENT.test(result)) {
                // 单行内的完整多行注释
                result = result.replace(KeywordPatterns.FULL_MULTI_LINE_COMMENT, '');
            } else {
                // 多行注释开始
                this.inComment = true;
                result = result.replace(/\/\*.*$/, '');
            }
        }

        return result.trim() || null;
    }

    /**
     * 重置状态
     */
    reset(): void {
        this.inComment = false;
    }

    /**
     * 检查是否在注释中
     */
    isInComment(): boolean {
        return this.inComment;
    }
}

/**
 * 节点类型枚举
 */
export enum NodeType {
    PACKAGE_HEADER = 'PACKAGE_HEADER',
    PACKAGE_BODY = 'PACKAGE_BODY',
    FUNCTION = 'FUNCTION',
    PROCEDURE = 'PROCEDURE',
    FUNCTION_DECLARATION = 'FUNCTION_DECLARATION',
    PROCEDURE_DECLARATION = 'PROCEDURE_DECLARATION',
    TRIGGER = 'TRIGGER',
    ANONYMOUS_BLOCK = 'ANONYMOUS_BLOCK'
}

/**
 * 结构块类型
 */
export enum StructureBlockType {
    BEGIN = 'BEGIN',
    EXCEPTION = 'EXCEPTION',
    END = 'END',
    PACKAGE_INITIALIZATION = 'Package Initialization'
}

/**
 * 解析节点接口
 */
export interface ParseNode {
    type: NodeType;
    name: string;
    declarationLine: number;
    beginLine?: number | null;
    exceptionLine?: number | null;
    endLine?: number | null;
    level: number;
    children: ParseNode[];
}

/**
 * 结构块节点（用于视图渲染）
 */
export interface StructureBlock {
    type: StructureBlockType;
    line: number;
    parentNode: ParseNode;
}

/**
 * 解析错误
 */
export interface ParseError {
    line: number;
    message: string;
    severity: 'error' | 'warning';
}

/**
 * 解析结果
 */
export interface ParseResult {
    nodes: ParseNode[];
    metadata: {
        sourceFile: string;
        parseTime: number;
        version: string;
        errors: ParseError[];
        warnings: ParseError[];
        totalLines: number;
        maxNestingDepth: number;
    };
}

/**
 * 文件类型枚举
 */
export enum FileType {
    STANDALONE_FUNCTION = 'standalone_function',
    STANDALONE_PROCEDURE = 'standalone_procedure',
    PACKAGE_HEADER = 'package_header',
    PACKAGE_BODY = 'package_body',
    TRIGGER = 'trigger',
    ANONYMOUS_BLOCK = 'anonymous_block',
    UNKNOWN = 'unknown'
}

/**
 * 安全配置
 */
export interface SafetyConfig {
    maxLines: number;
    maxNestingDepth: number;
    maxParseTime: number;
    maxBeginEndCounter: number;
    maxStackDepth: number;
    maxIterations: number;
    progressCheckInterval: number;
}

/**
 * 调试配置
 */
export interface DebugConfig {
    enabled: boolean;
    outputPath: string;
    logLevel: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
    keepFiles: boolean;
    maxFiles: number;
}

/**
 * 日志级别
 */
export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3
}

/**
 * 解析状态
 */
export enum ParseState {
    INITIAL = 'initial',
    PACKAGE_START = 'package_start',
    READING_DECLARATIONS = 'reading_declarations',
    FUNCTION_PROCEDURE_START = 'function_procedure_start',
    READING_BODY = 'reading_body',
    PACKAGE_END = 'package_end',
    COMPLETED = 'completed'
}

/**
 * 关键字匹配模式
 */
export interface KeywordPattern {
    pattern: RegExp;
    type: string;
    captureGroups: string[];
}

/**
 * 解析上下文
 */
export interface ParseContext {
    currentLine: number;
    totalLines: number;
    currentLevel: number;
    beginEndCounter: number;
    nodeStack: ParseNode[];
    currentActiveNode: ParseNode | null;
    packageNode: ParseNode | null;
    isPackageInitialization: boolean;
    state: ParseState;
    errors: ParseError[];
    warnings: ParseError[];
}

/**
 * 树视图项数据
 */
export interface TreeItemData {
    node?: ParseNode;
    structureBlock?: StructureBlock;
    isStructureBlock: boolean;
    label: string;
    line?: number;
}

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
    ANONYMOUS_BLOCK = 'ANONYMOUS_BLOCK',
    TYPE = 'TYPE',
    TYPE_BODY = 'TYPE_BODY',
    VIEW = 'VIEW',
    // 控制结构类型
    IF_STATEMENT = 'IF_STATEMENT',
    ELSIF_BRANCH = 'ELSIF_BRANCH',
    ELSE_BRANCH = 'ELSE_BRANCH',
    LOOP_STATEMENT = 'LOOP_STATEMENT',
    WHILE_LOOP = 'WHILE_LOOP',
    FOR_LOOP = 'FOR_LOOP',
    CASE_STATEMENT = 'CASE_STATEMENT',
    WHEN_BRANCH = 'WHEN_BRANCH'
}

/**
 * 声明项类别（用于大纲视图按类别分组展示）
 */
export enum DeclarationCategory {
    VARIABLE = 'variable',
    CURSOR = 'cursor',
    CONSTANT = 'constant',
    TYPE = 'type',
    EXCEPTION = 'exception'
}

/**
 * 变量信息接口
 * - type: 原始类型字符串（如 NUMBER、CURSOR、EXCEPTION、IS RECORD(...)）
 * - category: 规范化类别，供大纲分组使用
 */
export interface VariableInfo {
    name: string;
    line: number;
    type: string;
    scope: string;
    category: DeclarationCategory;
    /** 可选：常量/带初值变量的初值文本，如 '0'、'''N''' */
    initialValue?: string;
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
    variableTable?: Map<string, VariableInfo>;
    conditionText?: string;  // 控制结构的条件文本
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
 * 调试配置
 */
export interface DebugConfig {
    enabled: boolean;
    logLevel: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
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
 * 树视图项数据
 */
export interface TreeItemData {
    node?: ParseNode;
    structureBlock?: StructureBlock;
    isStructureBlock: boolean;
    label: string;
    line?: number;
    mergedChildren?: ParseNode[];  // IF合并后的子节点
    parentNode?: ParseNode;        // 分组节点的父引用
    // 声明项分组（Declaration 区域内按类别分组：Variables/Cursors/Constants/Types/Exceptions）
    isDeclarationGroup?: boolean;
    declarationCategory?: DeclarationCategory;
    declarationEntries?: VariableInfo[];  // 该分组下的声明项
    isDeclarationEntry?: boolean;
    declarationEntry?: VariableInfo;       // 单个声明项（叶节点）
    // 新扁平化结构：Declaration 包裹文件夹
    isDeclarationSection?: boolean;        // "Declaration" 包裹文件夹
    // 新扁平化结构：程序文件夹（Sub Program / Body）
    isProgramGroup?: boolean;
    programGroupKind?: 'subprogram' | 'body';
    programGroupChildren?: ParseNode[];    // 该文件夹下的 ParseNode 子项（子程序或控制结构）
}

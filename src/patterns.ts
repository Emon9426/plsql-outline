/**
 * 关键字匹配模式定义
 */
export class KeywordPatterns {
    /**
     * CREATE OR REPLACE PACKAGE 模式（支持 schema 前缀）
     */
    static readonly CREATE_PACKAGE = /^\s*CREATE\s+(?:OR\s+REPLACE\s+)?PACKAGE\s+(?!BODY\s)(?:\w+\.)?(\w+)/i;

    /**
     * CREATE OR REPLACE PACKAGE BODY 模式（支持 schema 前缀）
     */
    static readonly CREATE_PACKAGE_BODY = /^\s*CREATE\s+(?:OR\s+REPLACE\s+)?PACKAGE\s+BODY\s+(?:\w+\.)?(\w+)/i;

    /**
     * CREATE OR REPLACE FUNCTION 模式（支持 schema 前缀）
     */
    static readonly CREATE_FUNCTION = /^\s*CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:\w+\.)?(\w+)/i;

    /**
     * CREATE OR REPLACE PROCEDURE 模式（支持 schema 前缀）
     */
    static readonly CREATE_PROCEDURE = /^\s*CREATE\s+(?:OR\s+REPLACE\s+)?PROCEDURE\s+(?:\w+\.)?(\w+)/i;

    /**
     * CREATE OR REPLACE TRIGGER 模式（支持 schema 前缀）
     */
    static readonly CREATE_TRIGGER = /^\s*CREATE\s+(?:OR\s+REPLACE\s+)?TRIGGER\s+(?:\w+\.)?(\w+)/i;

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
    static readonly CONTROL_END_STATEMENT = /^\s*END\s+(IF|LOOP|CASE|WHILE)\s*[;]?\s*$/i;

    /**
     * DECLARE 语句模式（匿名块开始）
     */
    static readonly DECLARE_STATEMENT = /^\s*DECLARE\s*$/i;

    // ====== 控制结构模式 ======

    /**
     * IF 开始模式
     */
    static readonly IF_START = /^\s*IF\s+(.+?)\s+THEN\s*$/i;

    /**
     * ELSIF 模式
     */
    static readonly ELSIF_START = /^\s*ELSIF\s+(.+?)\s+THEN\s*$/i;

    /**
     * ELSE 模式
     */
    static readonly ELSE_START = /^\s*ELSE\s*$/i;

    /**
     * 基础 LOOP 模式
     */
    static readonly BASIC_LOOP_START = /^\s*LOOP\s*$/i;

    /**
     * WHILE LOOP 模式
     */
    static readonly WHILE_LOOP_START = /^\s*WHILE\s+(.+?)\s+LOOP\s*$/i;

    /**
     * FOR LOOP 模式
     */
    static readonly FOR_LOOP_START = /^\s*FOR\s+(\w+)\s+IN\s+(.+?)\s+LOOP\s*$/i;

    /**
     * CASE 模式
     */
    static readonly CASE_START = /^\s*CASE\s*(.*?)\s*$/i;

    /**
     * WHEN 模式
     */
    static readonly WHEN_START = /^\s*WHEN\s+(.+?)\s+THEN\s*$/i;

    /**
     * END IF 模式
     */
    static readonly END_IF = /^\s*END\s+IF\s*;\s*$/i;

    /**
     * END LOOP 模式
     */
    static readonly END_LOOP = /^\s*END\s+LOOP\s*(?:\s+\w+)?\s*;\s*$/i;

    /**
     * END CASE 模式
     */
    static readonly END_CASE = /^\s*END\s+CASE\s*;\s*$/i;

    /**
     * 变量声明模式（非常量）：`name type [:= expr | DEFAULT expr];`
     */
    static readonly VARIABLE_DECLARATION = /^\s*(\w+)\s+([\w\.%]+(?:\([^)]*\))?)\s*(?::=\s*.+?|DEFAULT\s+.+?)?;\s*$/i;

    /**
     * 常量声明模式：`name type CONSTANT [:= expr | DEFAULT expr];`
     * 必须出现在 VARIABLE_DECLARATION 之前匹配，以区分常量与变量。
     */
    static readonly CONSTANT_DECLARATION = /^\s*(\w+)\s+([\w\.%]+(?:\([^)]*\))?)\s+CONSTANT\b\s*(?::=\s*(.+?)|DEFAULT\s+(.+?))?;\s*$/i;

    /**
     * 自定义类型声明模式：
     *   `TYPE name IS (RECORD|TABLE OF|VARRAY|REF CURSOR|OBJECT ...)`
     *   `name IS RECORD(...)` / `name IS TABLE OF ...`（ subtype 形式也归为 type 类别）
     */
    static readonly TYPE_DECLARATION = /^\s*(?:TYPE\s+)?(\w+)\s+IS\s+(RECORD|TABLE\s+OF|VARRAY|REF\s+CURSOR|OBJECT)\b/i;

    /**
     * 参数声明模式
     */
    static readonly PARAMETER_DECLARATION = /^\s*(\w+)\s+([\w\.%]+(?:\([^)]*\))?)\s*(?:IN|OUT|IN OUT)?\s*(?:DEFAULT\s+.+?|:=\s*.+?)?$/i;

    /**
     * 游标声明模式
     *   `CURSOR name [(params)] [RETURN type[%ROWTYPE|%TYPE]] IS SELECT...` (SELECT 可换行)
     *   `CURSOR name IS` (IS 可在行尾，SELECT 在后续行)
     * 参数列表支持一层嵌套括号（如 VARCHAR2(10)）。
     */
    static readonly CURSOR_DECLARATION = /^\s*CURSOR\s+(\w+)\s*(?:\((?:[^()]|\([^()]*\))*\))?\s*(?:RETURN\s+[\w$#\.]+(?:\s*%\w+)?)?\s*IS\b/i;

    /**
     * 异常声明模式
     */
    static readonly EXCEPTION_DECLARATION = /^\s*(\w+)\s+EXCEPTION\s*;\s*$/i;

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
     * PL/SQL 用双单引号 '' 作为引号转义（非反斜杠转义）。
     */
    static readonly STRING_LITERAL = /'[^']*(?:''[^']*)*'/g;

    /**
     * 分号结束模式
     */
    static readonly SEMICOLON_END = /;\s*$/;

    /**
     * 斜杠结束模式（匿名块）
     */
    static readonly SLASH_END = /^\s*\/\s*$/;
}

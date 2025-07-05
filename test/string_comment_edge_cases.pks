-- 字符串与注释边界测试包规范
-- 测试字符串字面量与注释符号的复杂交互

CREATE OR REPLACE PACKAGE string_comment_test IS
    
    /* 包规范开始 - 测试各种字符串与注释的组合 */
    
    -- 常量声明中的字符串包含注释符号
    C_SQL_TEMPLATE CONSTANT VARCHAR2(1000) := 
        'SELECT /* 这是SQL中的注释 */ * FROM table WHERE id = :1 -- 行尾注释';
    
    C_COMMENT_CHARS CONSTANT VARCHAR2(100) := '/* */ -- /* -- */ /* -- */';
    
    /* 多行注释中包含字符串示例
     * 'string with /* comment chars */ inside'
     * "double quoted string with -- comment"
     * q'[alternative quoting with /* and -- inside]'
     */
    
    -- 类型声明
    TYPE t_comment_record IS RECORD (
        sql_text VARCHAR2(4000), -- 'SQL: /* comment */ SELECT * FROM dual'
        comment_text VARCHAR2(1000) -- '-- This is not a comment in string'
    );
    
    TYPE t_string_array IS TABLE OF VARCHAR2(500); -- 'Array of /* strings */'
    
    -- 异常声明
    e_string_parse_error EXCEPTION; -- 'Error: /* parsing failed */'
    
    /* 函数声明 - 参数默认值包含注释符号 */
    FUNCTION parse_sql_with_comments(
        p_sql_text VARCHAR2 DEFAULT 'SELECT /* hint */ * FROM dual -- comment',
        p_remove_comments BOOLEAN DEFAULT TRUE -- 'Remove /* comments */ or not'
    ) RETURN VARCHAR2;
    
    -- 过程声明 - 测试字符串参数
    PROCEDURE process_comment_strings(
        p_input_array t_string_array, -- 'Array: [/* item1 */, -- item2]'
        p_output_text OUT VARCHAR2 -- 'Result: /* processed */ text'
    );
    
    /* 重载函数 - 不同的字符串参数 */
    FUNCTION extract_comments(
        p_text VARCHAR2 -- 'Text with /* comments */ and -- line comments'
    ) RETURN t_string_array;
    
    FUNCTION extract_comments(
        p_text CLOB, -- 'Large text with /* many */ -- comments'
        p_comment_type VARCHAR2 DEFAULT 'ALL' -- 'Type: /* BLOCK */ or -- LINE'
    ) RETURN t_string_array;
    
    -- 游标声明
    CURSOR c_sql_with_comments(
        p_table_name VARCHAR2 DEFAULT 'test_table' -- 'Table: /* schema.table */'
    ) IS
        SELECT 'Column /* comment */ value' as col1, -- 'Select with comments'
               '-- This is data, not comment' as col2
        FROM dual
        WHERE 1=1; -- 'WHERE /* condition */ clause'
    
    /* 高级字符串测试 - 替代引用语法 */
    C_COMPLEX_STRING CONSTANT VARCHAR2(2000) := q'[
        This is a complex string that contains:
        /* Multi-line comment symbols */
        -- Single line comment symbols  
        'Single quotes'
        "Double quotes"
        /* Nested /* comment */ symbols */
        And even more /* complex -- mixed */ comment patterns
    ]';
    
    -- 包含转义字符的字符串
    C_ESCAPED_STRING CONSTANT VARCHAR2(500) := 
        'String with escaped quotes: ''/* not comment */'' and "-- not comment"';
    
    /* 条件编译风格的注释（虽然不是真正的条件编译）
     * $IF CONDITION $THEN
     *   C_CONDITIONAL CONSTANT VARCHAR2(100) := 'Value /* if true */';
     * $ELSE  
     *   C_CONDITIONAL CONSTANT VARCHAR2(100) := 'Value /* if false */';
     * $END
     */
    
    -- 函数返回复杂字符串
    FUNCTION get_complex_sql_template RETURN VARCHAR2;
    /* 返回包含注释符号的SQL模板:
     * 'SELECT /*+ HINT */ col1, col2 -- columns
     *  FROM table_name /* table comment */
     *  WHERE condition = ''/* not a comment */'''
     */
    
    -- 过程处理字符串中的假注释
    PROCEDURE clean_fake_comments(
        p_input IN OUT VARCHAR2 -- 'Input: /* fake comment */ text'
    );
    
END string_comment_test;
/

/* 包规范结束注释
 * 这个包专门测试字符串字面量与注释符号的交互
 * 
 * 测试要点:
 * 1. 字符串中的注释符号不应被识别为注释
 * 2. 注释中的字符串分隔符不应影响注释解析
 * 3. 替代引用语法 q'[...]' 的正确处理
 * 4. 转义字符与注释符号的交互
 * 5. 多行字符串与多行注释的边界
 * 
 * 期望解析结果:
 * - 包名: string_comment_test
 * - 常量: C_SQL_TEMPLATE, C_COMMENT_CHARS, C_COMPLEX_STRING, C_ESCAPED_STRING
 * - 类型: t_comment_record, t_string_array  
 * - 异常: e_string_parse_error
 * - 函数: parse_sql_with_comments, extract_comments (2个重载), get_complex_sql_template
 * - 过程: process_comment_strings, clean_fake_comments
 * - 游标: c_sql_with_comments
 */

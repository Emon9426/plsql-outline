-- 复杂注释测试用例
-- 测试解析器对各种注释情况的处理能力

/* 
 * 多行注释中包含PL/SQL关键字测试
 * CREATE OR REPLACE FUNCTION fake_function RETURN NUMBER IS
 * BEGIN
 *   RETURN 1;
 * END fake_function;
 * 
 * PROCEDURE fake_procedure IS
 * BEGIN
 *   NULL;
 * END;
 */

CREATE OR REPLACE PROCEDURE comment_test_procedure IS
    -- 这是一个真实的过程声明
    
    /* 嵌套多行注释测试
       /* 内层注释 - 包含关键字 FUNCTION test_func RETURN NUMBER */
       外层注释继续 - BEGIN END EXCEPTION
    */
    
    v_test_var NUMBER := 1; -- 行尾注释包含关键字: CREATE FUNCTION BEGIN
    
    -- 函数声明，但被注释干扰
    FUNCTION /* 注释在中间 */ calculate_value(
        p_input NUMBER -- 参数注释: RETURN BEGIN END
    ) RETURN NUMBER IS
        -- 局部变量
        v_result NUMBER;
        
        /* 多行注释包含完整代码块
        FUNCTION another_fake_func RETURN VARCHAR2 IS
        BEGIN
            RETURN 'fake';
        EXCEPTION
            WHEN OTHERS THEN
                RETURN NULL;
        END another_fake_func;
        */
        
    BEGIN
        -- 字符串中包含注释符号
        v_result := LENGTH('/* 这不是注释 */ -- 这也不是注释');
        
        /* 注释中包含字符串分隔符 ' " 和转义 \' \" */
        
        -- 计算逻辑
        IF p_input > 0 THEN -- 条件判断 /* 混合注释 */
            v_result := p_input * 2;
        ELSE
            /* 
             * 多行注释中的假代码
             * BEGIN
             *   DECLARE
             *     fake_var NUMBER;
             *   BEGIN
             *     fake_var := 999;
             *   END;
             * END;
             */
            v_result := 0;
        END IF;
        
        RETURN v_result;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- 异常处理中的注释
            /* 注释中的假异常处理
            EXCEPTION
                WHEN NO_DATA_FOUND THEN
                    RETURN -1;
                WHEN TOO_MANY_ROWS THEN
                    RETURN -2;
            */
            RETURN -999;
    END calculate_value;
    
    -- 另一个嵌套过程
    PROCEDURE /* 注释分割关键字 */ nested_proc(
        p_param VARCHAR2 -- 参数: 'test /* not comment */ value'
    ) IS
        -- 局部声明
        v_local_var VARCHAR2(100);
        
        /* 文档风格注释
         * @param p_param 输入参数
         * @description 这个过程演示注释处理
         * 
         * 假代码块:
         * DECLARE
         *   fake_cursor CURSOR FOR SELECT * FROM dual;
         * BEGIN
         *   OPEN fake_cursor;
         *   CLOSE fake_cursor;
         * END;
         */
        
    BEGIN
        -- 连续单行注释测试
        -- 第一行注释 CREATE FUNCTION
        -- 第二行注释 BEGIN END
        -- 第三行注释 EXCEPTION WHEN
        
        v_local_var := p_param;
        
        /* 条件编译风格注释
        $IF DBMS_DB_VERSION.VERSION >= 12 $THEN
            v_local_var := 'Oracle 12c+';
        $ELSE
            v_local_var := 'Oracle 11g-';
        $END
        */
        
        -- 嵌套块
        DECLARE
            v_nested_var NUMBER; -- 嵌套变量 /* 混合注释风格 */
        BEGIN
            /* 深层嵌套注释
               包含假的END语句和结构
               END nested_proc;
               END comment_test_procedure;
               /
            */
            v_nested_var := 42;
            
            -- 字符串与注释混合
            DBMS_OUTPUT.PUT_LINE('输出: /* 不是注释 */ -- 也不是注释');
            
        EXCEPTION
            WHEN OTHERS THEN
                /* 异常块中的注释
                   包含假的异常处理:
                   WHEN NO_DATA_FOUND THEN NULL;
                   WHEN TOO_MANY_ROWS THEN NULL;
                */
                NULL;
        END;
        
    END nested_proc;

BEGIN
    -- 主过程体开始
    
    /* 提示风格注释 (Oracle Hint 风格)
     * /*+ FIRST_ROWS(10) INDEX(t, idx_name) */
     * 这不是真正的提示，只是注释
     */
    
    -- 调用嵌套函数
    DECLARE
        v_result NUMBER;
        v_test_string VARCHAR2(200);
    BEGIN
        -- 包含注释符号的字符串
        v_test_string := 'BEGIN /* 假开始 */ END -- 假结束';
        
        /* 多行字符串与注释
           这里测试多行注释与字符串的边界
           'string content /* not comment */'
        */
        
        v_result := calculate_value(100); -- 调用函数 /* 行尾混合注释 */
        
        -- 调用过程
        nested_proc('test /* 参数中的假注释 */ value');
        
        /* 注释中包含完整的匿名块
        DECLARE
            temp_var NUMBER;
        BEGIN
            temp_var := 1;
            WHILE temp_var < 10 LOOP
                temp_var := temp_var + 1;
            END LOOP;
        EXCEPTION
            WHEN OTHERS THEN
                ROLLBACK;
        END;
        /
        */
        
    EXCEPTION
        WHEN OTHERS THEN
            -- 异常处理
            /* 注释中的假ROLLBACK和COMMIT
               ROLLBACK;
               COMMIT;
               SAVEPOINT sp1;
            */
            RAISE;
    END;
    
EXCEPTION
    WHEN OTHERS THEN
        /* 主异常处理块
           注释中包含假的异常处理逻辑:
           
           WHEN NO_DATA_FOUND THEN
               DBMS_OUTPUT.PUT_LINE('No data');
           WHEN TOO_MANY_ROWS THEN  
               DBMS_OUTPUT.PUT_LINE('Too many rows');
           WHEN VALUE_ERROR THEN
               DBMS_OUTPUT.PUT_LINE('Value error');
        */
        
        -- 记录错误
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        
        /* 最后的多行注释
         * 包含假的过程结束:
         * END comment_test_procedure;
         * /
         * 
         * CREATE OR REPLACE FUNCTION fake_end_func
         * RETURN NUMBER IS
         * BEGIN
         *   RETURN 0;
         * END;
         */
        
END comment_test_procedure;
/

/* 文件末尾的多行注释
 * 包含假的包声明:
 * 
 * CREATE OR REPLACE PACKAGE fake_package IS
 *   FUNCTION fake_func RETURN NUMBER;
 *   PROCEDURE fake_proc;
 * END fake_package;
 * /
 * 
 * CREATE OR REPLACE PACKAGE BODY fake_package IS
 *   FUNCTION fake_func RETURN NUMBER IS
 *   BEGIN
 *     RETURN 1;
 *   END;
 *   
 *   PROCEDURE fake_proc IS
 *   BEGIN
 *     NULL;
 *   END;
 * END fake_package;
 * /
 */

-- 单行注释结尾: CREATE FUNCTION END PROCEDURE BEGIN EXCEPTION

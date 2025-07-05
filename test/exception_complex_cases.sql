-- Exception处理复杂测试用例
-- 测试各种Exception块的嵌套和层级关系

-- 测试1：基础Exception场景
CREATE OR REPLACE FUNCTION basic_exception_test RETURN NUMBER IS
    v_result NUMBER := 0;
BEGIN
    v_result := 10 / 0; -- 会引发除零异常
    RETURN v_result;
EXCEPTION
    WHEN ZERO_DIVIDE THEN
        RETURN -1;
    WHEN OTHERS THEN
        RETURN -2;
END basic_exception_test;
/

-- 测试2：过程中的Exception
CREATE OR REPLACE PROCEDURE proc_with_exception(p_value IN NUMBER) IS
    v_temp NUMBER;
BEGIN
    v_temp := p_value * 2;
    DBMS_OUTPUT.PUT_LINE('计算结果: ' || v_temp);
EXCEPTION
    WHEN VALUE_ERROR THEN
        DBMS_OUTPUT.PUT_LINE('数值错误');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('其他错误: ' || SQLERRM);
END proc_with_exception;
/

-- 测试3：嵌套BEGIN块中的Exception
CREATE OR REPLACE FUNCTION nested_begin_exception RETURN NUMBER IS
    v_outer NUMBER := 0;
BEGIN
    -- 外层BEGIN块
    v_outer := 100;
    
    -- 内层BEGIN块1
    BEGIN
        v_outer := v_outer / 0;
    EXCEPTION
        WHEN ZERO_DIVIDE THEN
            v_outer := -1;
            DBMS_OUTPUT.PUT_LINE('内层异常1被捕获');
    END;
    
    -- 内层BEGIN块2
    DECLARE
        v_inner NUMBER;
    BEGIN
        v_inner := v_outer * 2;
        v_outer := v_inner;
    EXCEPTION
        WHEN VALUE_ERROR THEN
            v_outer := -2;
            DBMS_OUTPUT.PUT_LINE('内层异常2被捕获');
    END;
    
    RETURN v_outer;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('外层异常被捕获');
        RETURN -999;
END nested_begin_exception;
/

-- 测试4：多层嵌套函数中的Exception
CREATE OR REPLACE FUNCTION deep_nested_exception RETURN NUMBER IS
    v_result NUMBER := 0;
    
    -- 嵌套函数1
    FUNCTION level1_func(p_val NUMBER) RETURN NUMBER IS
        v_level1 NUMBER;
        
        -- 嵌套函数2
        FUNCTION level2_func(p_val NUMBER) RETURN NUMBER IS
        BEGIN
            RETURN p_val / 0; -- 故意引发异常
        EXCEPTION
            WHEN ZERO_DIVIDE THEN
                RETURN -1;
        END level2_func;
        
    BEGIN
        v_level1 := level2_func(p_val);
        RETURN v_level1 * 2;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN -2;
    END level1_func;
    
BEGIN
    v_result := level1_func(10);
    
    -- 主函数中的额外BEGIN块
    BEGIN
        IF v_result < 0 THEN
            RAISE VALUE_ERROR;
        END IF;
    EXCEPTION
        WHEN VALUE_ERROR THEN
            v_result := -3;
    END;
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN -999;
END deep_nested_exception;
/

-- 测试5：Package中的Exception处理
CREATE OR REPLACE PACKAGE BODY exception_test_pkg AS
    
    -- 包级变量
    g_error_count NUMBER := 0;
    
    -- 包内函数
    FUNCTION pkg_func_with_exception(p_input NUMBER) RETURN NUMBER IS
        v_temp NUMBER;
    BEGIN
        v_temp := p_input * 100;
        
        -- 嵌套BEGIN块
        BEGIN
            IF v_temp > 1000 THEN
                RAISE TOO_MANY_ROWS;
            END IF;
        EXCEPTION
            WHEN TOO_MANY_ROWS THEN
                v_temp := 1000;
                g_error_count := g_error_count + 1;
        END;
        
        RETURN v_temp;
    EXCEPTION
        WHEN OTHERS THEN
            g_error_count := g_error_count + 1;
            RETURN -1;
    END pkg_func_with_exception;
    
    -- 包内过程
    PROCEDURE pkg_proc_with_exception IS
        v_counter NUMBER := 0;
        
        -- 嵌套过程
        PROCEDURE inner_proc IS
        BEGIN
            v_counter := v_counter + 1;
            IF v_counter > 5 THEN
                RAISE PROGRAM_ERROR;
            END IF;
        EXCEPTION
            WHEN PROGRAM_ERROR THEN
                DBMS_OUTPUT.PUT_LINE('内部过程异常');
        END inner_proc;
        
    BEGIN
        FOR i IN 1..10 LOOP
            inner_proc();
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('外部过程异常');
    END pkg_proc_with_exception;
    
END exception_test_pkg;
/

-- 测试6：Exception块后还有代码的情况
CREATE OR REPLACE PROCEDURE exception_with_code_after IS
    v_step NUMBER := 1;
BEGIN
    DBMS_OUTPUT.PUT_LINE('步骤: ' || v_step);
    
    -- 第一个BEGIN块
    BEGIN
        v_step := 2;
        RAISE NO_DATA_FOUND;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_step := 3;
            DBMS_OUTPUT.PUT_LINE('异常处理: ' || v_step);
    END;
    
    -- Exception块后的代码
    v_step := 4;
    DBMS_OUTPUT.PUT_LINE('异常后继续: ' || v_step);
    
    -- 第二个BEGIN块
    BEGIN
        v_step := 5;
        DBMS_OUTPUT.PUT_LINE('第二个块: ' || v_step);
    EXCEPTION
        WHEN OTHERS THEN
            v_step := 6;
    END;
    
    -- 最后的代码
    DBMS_OUTPUT.PUT_LINE('最终步骤: ' || v_step);
    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('主异常: ' || SQLERRM);
END exception_with_code_after;
/

-- 测试7：复杂的Exception嵌套
CREATE OR REPLACE FUNCTION complex_exception_nesting RETURN NUMBER IS
    v_result NUMBER := 0;
BEGIN
    -- 第一层BEGIN
    BEGIN
        v_result := 1;
        
        -- 第二层BEGIN
        BEGIN
            v_result := 2;
            
            -- 第三层BEGIN
            DECLARE
                v_inner NUMBER;
            BEGIN
                v_inner := 10 / 0;
            EXCEPTION
                WHEN ZERO_DIVIDE THEN
                    v_result := 3;
                    
                    -- Exception块中的BEGIN
                    BEGIN
                        v_result := v_result + 1;
                    EXCEPTION
                        WHEN OTHERS THEN
                            v_result := v_result + 10;
                    END;
            END;
            
        EXCEPTION
            WHEN OTHERS THEN
                v_result := 20;
        END;
        
    EXCEPTION
        WHEN OTHERS THEN
            v_result := 30;
    END;
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN -1;
END complex_exception_nesting;
/

-- 测试8：边界情况 - Exception紧跟BEGIN
CREATE OR REPLACE PROCEDURE edge_case_exception IS
BEGIN
    NULL;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END edge_case_exception;
/

-- 测试9：多个连续的Exception处理
CREATE OR REPLACE FUNCTION multiple_exceptions RETURN NUMBER IS
    v_result NUMBER := 0;
BEGIN
    -- 第一个异常块
    BEGIN
        v_result := 1;
        RAISE VALUE_ERROR;
    EXCEPTION
        WHEN VALUE_ERROR THEN
            v_result := 2;
    END;
    
    -- 第二个异常块
    BEGIN
        v_result := v_result + 1;
        RAISE NO_DATA_FOUND;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_result := v_result + 2;
    END;
    
    -- 第三个异常块
    BEGIN
        v_result := v_result * 2;
    EXCEPTION
        WHEN OTHERS THEN
            v_result := -1;
    END;
    
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN -999;
END multiple_exceptions;
/

-- 测试10：注释中的Exception关键字
CREATE OR REPLACE FUNCTION comment_exception_test RETURN NUMBER IS
    /* 
     * 这个注释包含Exception关键字
     * BEGIN
     *   RAISE VALUE_ERROR;
     * EXCEPTION
     *   WHEN VALUE_ERROR THEN
     *     NULL;
     * END;
     */
    v_result NUMBER := 0;
BEGIN
    v_result := 42;
    -- 单行注释中的EXCEPTION关键字
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN -1;
END comment_exception_test;
/

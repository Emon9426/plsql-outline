-- 极端跨行函数/过程声明测试

-- 测试1: 非常复杂的参数跨行
CREATE OR REPLACE FUNCTION complex_multiline_func
(
    p_param1 IN VARCHAR2,
    p_param2 IN NUMBER DEFAULT 100,
    p_param3 IN OUT CLOB,
    p_param4 IN DATE := SYSDATE,
    p_param5 IN BOOLEAN DEFAULT TRUE
)
RETURN VARCHAR2
IS
    v_result VARCHAR2(4000);
BEGIN
    RETURN v_result;
END;

-- 测试2: 大小写混合且跨行很多
create or replace procedure MIXED_case_proc
(
    P_INPUT in varchar2,
    p_output OUT number,
    P_INOUT in out clob
)
as
    V_LOCAL varchar2(100);
begin
    null;
end;

-- 测试3: 函数名和参数在不同行
CREATE OR REPLACE FUNCTION
    separated_name_func
(
    p_val IN NUMBER
)
RETURN NUMBER
IS
BEGIN
    RETURN p_val;
END;

-- 测试4: 嵌套函数的复杂跨行
CREATE OR REPLACE PROCEDURE main_complex_proc IS
    
    -- 嵌套函数1
    FUNCTION nested_complex_func
    (
        p_input_param IN VARCHAR2,
        p_numeric_param IN NUMBER,
        p_date_param IN DATE
    )
    RETURN VARCHAR2
    IS
        v_local_var VARCHAR2(200);
    BEGIN
        RETURN v_local_var;
    END nested_complex_func;
    
    -- 嵌套过程
    PROCEDURE nested_complex_proc
    (
        p_param1 IN VARCHAR2,
        p_param2 OUT NUMBER
    )
    AS
    BEGIN
        p_param2 := 1;
    END nested_complex_proc;
    
BEGIN
    NULL;
END main_complex_proc;

-- 测试5: 没有参数但跨行的函数
CREATE OR REPLACE FUNCTION
    no_params_multiline
RETURN VARCHAR2
IS
BEGIN
    RETURN 'test';
END;

-- 测试6: 只有一个参数但跨行
CREATE OR REPLACE FUNCTION single_param_multiline
(
    p_single IN VARCHAR2
)
RETURN VARCHAR2
IS
BEGIN
    RETURN p_single;
END;

-- 测试7: 包中的跨行函数
CREATE OR REPLACE PACKAGE BODY test_pkg IS

    FUNCTION pkg_multiline_func
    (
        p_pkg_param1 IN VARCHAR2,
        p_pkg_param2 IN NUMBER
    )
    RETURN VARCHAR2
    IS
    BEGIN
        RETURN 'package function';
    END;
    
    PROCEDURE pkg_multiline_proc
    (
        p_proc_param IN VARCHAR2
    )
    AS
    BEGIN
        NULL;
    END;

END test_pkg;

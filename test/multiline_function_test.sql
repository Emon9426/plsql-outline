-- 测试跨行函数/过程声明

-- 单行声明（应该能识别）
CREATE OR REPLACE FUNCTION simple_func RETURN VARCHAR2 IS
BEGIN
    RETURN 'test';
END;

-- 跨行声明（可能无法识别）
CREATE OR REPLACE FUNCTION multiline_func(
    p_param1 IN VARCHAR2,
    p_param2 IN NUMBER,
    p_param3 IN DATE
) RETURN VARCHAR2
IS
BEGIN
    RETURN 'multiline test';
END;

-- 更复杂的跨行声明
CREATE OR REPLACE PROCEDURE complex_proc(
    p_input_param IN VARCHAR2 DEFAULT 'default_value',
    p_output_param OUT NUMBER,
    p_inout_param IN OUT CLOB
)
AS
    v_local_var VARCHAR2(100);
BEGIN
    NULL;
END;

-- 大小写混合的跨行声明
create or replace function Mixed_Case_Func(
    P_PARAM1 in varchar2,
    p_param2 IN NUMBER
)
return number
is
begin
    return 1;
end;

-- 嵌套函数的跨行声明
CREATE OR REPLACE PROCEDURE main_proc IS
    
    FUNCTION nested_multiline_func(
        p_val IN NUMBER,
        p_name IN VARCHAR2
    ) RETURN VARCHAR2
    IS
    BEGIN
        RETURN p_name || p_val;
    END;
    
BEGIN
    NULL;
END;

-- 测试逗号开头的参数列表格式

-- 测试1: 标准的逗号开头参数格式
CREATE OR REPLACE FUNCTION comma_leading_func
(
    p_param1 IN VARCHAR2
    , p_param2 IN NUMBER
    , p_param3 IN DATE
    , p_param4 OUT VARCHAR2
)
RETURN NUMBER
IS
    v_result NUMBER;
BEGIN
    RETURN v_result;
END;

-- 测试2: 更复杂的逗号开头格式
CREATE OR REPLACE PROCEDURE comma_leading_proc
(
    p_input_param IN VARCHAR2
    , p_numeric_param IN NUMBER DEFAULT 100
    , p_date_param IN DATE := SYSDATE
    , p_output_param OUT VARCHAR2
    , p_inout_param IN OUT CLOB
)
AS
    v_local VARCHAR2(100);
BEGIN
    NULL;
END;

-- 测试3: 嵌套函数的逗号开头格式
CREATE OR REPLACE PROCEDURE main_comma_proc IS
    
    FUNCTION nested_comma_func
    (
        p_param1 IN VARCHAR2
        , p_param2 IN NUMBER
        , p_param3 IN DATE
    )
    RETURN VARCHAR2
    IS
    BEGIN
        RETURN 'test';
    END;
    
BEGIN
    NULL;
END;

-- 测试4: 包中的逗号开头格式
CREATE OR REPLACE PACKAGE BODY comma_test_pkg IS

    FUNCTION pkg_comma_func
    (
        p_pkg_param1 IN VARCHAR2
        , p_pkg_param2 IN NUMBER
        , p_pkg_param3 IN DATE
    )
    RETURN VARCHAR2
    IS
    BEGIN
        RETURN 'package function';
    END;

END comma_test_pkg;

-- 测试5: 混合格式 - 有些参数同行，有些逗号开头
CREATE OR REPLACE FUNCTION mixed_comma_func
(
    p_param1 IN VARCHAR2, p_param2 IN NUMBER
    , p_param3 IN DATE
    , p_param4 OUT VARCHAR2
)
RETURN NUMBER
IS
BEGIN
    RETURN 1;
END;

-- 测试6: 极端情况 - 函数名也分行 + 逗号开头参数
CREATE OR REPLACE FUNCTION
    extreme_comma_func
(
    p_param1 IN VARCHAR2
    , p_param2 IN NUMBER
    , p_param3 IN DATE
)
RETURN VARCHAR2
IS
BEGIN
    RETURN 'extreme';
END;

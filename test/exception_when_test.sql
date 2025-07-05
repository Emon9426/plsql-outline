CREATE OR REPLACE FUNCTION test_multiple_when RETURN NUMBER IS
BEGIN
    -- 一些代码
    RETURN 1;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 0;
    WHEN TOO_MANY_ROWS THEN
        RETURN -1;
    WHEN VALUE_ERROR THEN
        RETURN -2;
    WHEN OTHERS THEN
        RETURN -999;
END;

CREATE OR REPLACE PROCEDURE complex_exception_proc IS
    v_result NUMBER;
BEGIN
    -- 主要逻辑
    v_result := test_multiple_when();
    
    BEGIN
        -- 嵌套块
        NULL;
    EXCEPTION
        WHEN INVALID_NUMBER THEN
            NULL;
        WHEN OTHERS THEN
            NULL;
    END;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No data found');
    WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('Too many rows');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Other error');
END;

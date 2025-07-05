-- 简单的END语句测试

CREATE OR REPLACE PROCEDURE main_proc IS
    
    FUNCTION nested_func RETURN VARCHAR2 IS
    BEGIN
        RETURN 'test';
    END;
    
BEGIN
    NULL;
END;

CREATE OR REPLACE FUNCTION standalone_func RETURN VARCHAR2 IS
BEGIN
    RETURN 'standalone';
END;

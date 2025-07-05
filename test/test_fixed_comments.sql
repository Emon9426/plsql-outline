CREATE OR REPLACE FUNCTION test_function RETURN NUMBER IS
BEGIN
    /* 这是一个多行注释
     * 包含假的包结构:
     * 
     * CREATE OR REPLACE PACKAGE BODY fake_package IS
     *   FUNCTION fake_func RETURN NUMBER IS
     *   BEGIN
     *     RETURN 1;
     *   END;
     * END fake_package;
     */
    
    RETURN 42;
END test_function;
/

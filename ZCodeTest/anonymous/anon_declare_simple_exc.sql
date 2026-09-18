-- =============================================================================
-- 用例: 匿名块 / DECLARE..BEGIN..END + Exception (anon_declare_simple_exc.sql)
-- 结构: DECLARE(常量/变量) + BEGIN + FOR 循环 + EXCEPTION(WHEN OTHERS) + END
-- 预期大纲:
--   Anonymous Block
--   ├ Declaration: c_step(常量) / v_count(变量)
--   ├ Body: FOR i IN 1 .. 5 ...
--   └ Exception: WHEN OTHERS
-- =============================================================================
DECLARE
    c_step   CONSTANT NUMBER := 2;
    v_count  NUMBER := 0;
BEGIN
    FOR i IN 1 .. 5 LOOP
        v_count := v_count + c_step;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('count=' || v_count);
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('error');
END;
/

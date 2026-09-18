-- =============================================================================
-- 用例: 匿名块 / DECLARE..BEGIN..END 无 Exception (anon_declare_simple_noexc.sql)
-- 结构: DECLARE + BEGIN + WHILE 循环 + END (无异常段, 边界用例:
--       预期大纲无 Exception 分组, exceptionLine 为空)
-- 预期大纲:
--   Anonymous Block
--   ├ Declaration: v_i / v_sum
--   └ Body: WHILE v_i <= 10 ...
-- =============================================================================
DECLARE
    v_i    NUMBER := 1;
    v_sum  NUMBER := 0;
BEGIN
    WHILE v_i <= 10 LOOP
        v_sum := v_sum + v_i;
        v_i := v_i + 1;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('sum=' || v_sum);
END;
/

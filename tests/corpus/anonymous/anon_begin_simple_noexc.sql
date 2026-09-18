-- =============================================================================
-- 用例: 匿名块 / BEGIN..END(顶层裸 BEGIN) 无 Exception (anon_begin_simple_noexc.sql)
-- 结构: 顶层裸 BEGIN + 基础 LOOP..EXIT WHEN + END (无声明区无异常段,
--       边界用例: 最小匿名块形态)
-- 预期大纲:
--   Anonymous Block
--   └ Body: LOOP ...
-- =============================================================================
BEGIN
    DBMS_OUTPUT.PUT_LINE('start');

    LOOP
        EXIT WHEN 1 = 1;
        NULL;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('done');
END;
/

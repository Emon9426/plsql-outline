-- =============================================================================
-- 用例: 匿名块 / BEGIN..END(顶层裸 BEGIN) + Exception (anon_begin_simple_exc.sql)
-- 结构: 顶层裸 BEGIN(无 DECLARE, Issue #5 场景) + FOR/IF + EXCEPTION + END
-- 预期大纲:
--   Anonymous Block
--   ├ Body: FOR i IN 1 .. 3 ...
--   └ Exception: WHEN OTHERS
-- =============================================================================
BEGIN
    FOR i IN 1 .. 3 LOOP
        IF MOD(i, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('even ' || i);
        ELSE
            DBMS_OUTPUT.PUT_LINE('odd ' || i);
        END IF;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
END;
/

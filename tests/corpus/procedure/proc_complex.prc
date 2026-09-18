-- =============================================================================
-- 用例: Procedure / 复杂结构 (proc_complex.prc)
-- 覆盖点(与 func_complex 对称, 另外增加):
--   [1] 多行签名(参数逐行) + OUT 参数
--   [2] 声明区: 变量/常量(标准语序, 含 Q-quote 初值)/游标(多行 SELECT)/
--       TYPE TABLE OF / 命名异常
--   [3] 前置声明 PROCEDURE fwd_write_log; 与同名真实定义(声明节点原位替换)
--   [4] 嵌套子程序 3 层: sub_next_id(函数) > sub_flush(过程) > sub_verify(函数)
--   [5] 循环: 基础 LOOP..EXIT WHEN(BULK COLLECT 批处理) / WHILE / FOR /
--       游标 FOR(跨行子查询)
--   [6] 嵌套 3 层循环: FOR > FOR > WHILE
--   [7] 注释: 单行/多行/注释掉正常代码结构(IF 块、整段循环、整个子过程)
--   [8] Q-quote 字符串 / CASE ELSE(Issue #3 场景)
--   [9] 内联匿名块(含嵌套子程序) + EXCEPTION 多 WHEN
-- 预期大纲:
--   PROC_MIGRATE_BATCH (Procedure)
--   ├ Declaration: c_max_retry/c_tag(常量) v_*(变量) c_src(游标)
--   │             t_id_tab(类型) e_abort(异常)
--   ├ Sub Program: fwd_write_log(前置声明→真实定义)
--   │             sub_next_id > sub_flush > sub_verify
--   ├ Body: LOOP/FOR/WHILE/CASE + 内联匿名块
--   └ Exception: WHEN e_abort / WHEN OTHERS
-- =============================================================================
CREATE OR REPLACE PROCEDURE proc_migrate_batch(
    p_src_table  IN  VARCHAR2,
    p_batch_size IN  NUMBER DEFAULT 1000,
    p_migrated   OUT NUMBER
) IS
    c_max_retry  CONSTANT NUMBER := 3;
    c_tag        CONSTANT VARCHAR2(60) := q'[MIGRATE /*stage*/ --v2]';

    v_rows       NUMBER := 0;
    v_done       NUMBER := 0;
    v_retry      NUMBER := 0;
    v_dbg        VARCHAR2(2000);

    CURSOR c_src IS
        SELECT id, data
          FROM migrate_stage
         WHERE status = 'READY';

    TYPE t_id_tab IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    t_ids        t_id_tab;

    e_abort      EXCEPTION;

    -- 前置声明(先挂声明节点, 真实定义出现时原位替换)
    PROCEDURE fwd_write_log;

    -- ----- 嵌套子程序 第 1 层: 子函数 -----
    FUNCTION sub_next_id(p_seq IN NUMBER) RETURN NUMBER IS
        v_id  NUMBER;

        -- ----- 嵌套子程序 第 2 层: 子过程(位于子函数内) -----
        PROCEDURE sub_flush(p_buffer IN OUT NUMBER) IS

            -- ----- 嵌套子程序 第 3 层: 子函数(位于子过程内) -----
            FUNCTION sub_verify(p_n IN NUMBER) RETURN BOOLEAN IS
            BEGIN
                RETURN p_n IS NOT NULL AND p_n > 0;
            EXCEPTION
                WHEN OTHERS THEN
                    RETURN FALSE;
            END sub_verify;
        BEGIN
            IF sub_verify(p_buffer) THEN
                p_buffer := p_buffer + 1;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_flush;
    BEGIN
        v_id := p_seq * 10;
        sub_flush(v_id);
        RETURN v_id;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN -1;
    END sub_next_id;

    -- 前置声明的真实定义(替换同名声明节点)
    PROCEDURE fwd_write_log IS
    BEGIN
        v_dbg := 'batch done at ' || TO_CHAR(SYSDATE, 'HH24:MI:SS');
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END fwd_write_log;

BEGIN
    -- 被单行注释注释掉的代码结构(不应出现在大纲)
    -- IF p_batch_size > 10000 THEN
    --     p_batch_size := 10000;
    -- END IF;
    --
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;

    /*
       被块注释注释掉的整个子过程(不应出现在大纲):
       PROCEDURE legacy_report IS
       BEGIN
           NULL;
       END legacy_report;
    */

    OPEN c_src;
    LOOP
        FETCH c_src BULK COLLECT INTO t_ids LIMIT p_batch_size;
        EXIT WHEN t_ids.COUNT = 0;

        -- 嵌套 3 层循环: FOR > FOR > WHILE
        FOR i IN 1 .. t_ids.COUNT LOOP
            FOR j IN 1 .. 2 LOOP
                WHILE v_retry < c_max_retry LOOP
                    v_retry := v_retry + 1;
                END LOOP;
                v_retry := 0;
            END LOOP;
            v_done := v_done + sub_next_id(i);
        END LOOP;

        -- CASE ELSE(Issue #3: CASE 的 ELSE 不得破坏控制栈)
        CASE MOD(v_done, 3)
            WHEN 0 THEN
                v_rows := v_rows + 1;
            WHEN 1 THEN
                v_rows := v_rows + 2;
            ELSE
                v_rows := 0;
        END CASE;

        -- 内联匿名块(含嵌套子程序与自己的 EXCEPTION)
        DECLARE
            v_local  NUMBER := 0;

            PROCEDURE sub_local_mark(p_in IN NUMBER) IS
            BEGIN
                v_local := v_local + p_in;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_local_mark;
        BEGIN
            sub_local_mark(1);
            v_done := v_done + v_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        COMMIT;
    END LOOP;
    CLOSE c_src;

    -- 游标 FOR(跨行内联子查询)
    FOR rec IN (
        SELECT id
          FROM migrate_stage
         WHERE status = 'DONE'
    ) LOOP
        v_done := v_done + 1;
    END LOOP;

    fwd_write_log;
    p_migrated := v_done;
EXCEPTION
    WHEN e_abort THEN
        p_migrated := -1;
        ROLLBACK;
    WHEN OTHERS THEN
        p_migrated := -99;
        ROLLBACK;
END proc_migrate_batch;
/

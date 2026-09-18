-- =============================================================================
-- 用例: 匿名块 / DECLARE..BEGIN..END 复杂结构 (anon_declare_complex.sql)
-- 覆盖点:
--   [1] 声明区全家桶: 常量(标准语序)/变量/游标(多行 SELECT)/TYPE RECORD/命名异常
--   [2] 嵌套子程序 3 层: sub_accum(过程) > sub_label(函数) > sub_check(过程)
--   [3] 循环: 基础 LOOP..EXIT WHEN / 游标 WHILE FETCH / FOR
--   [4] 嵌套 3 层循环: FOR > WHILE > FOR
--   [5] 注释: 单行/多行/注释掉的代码结构(IF 块/子过程)
--   [6] Q-quote 字符串 / CASE ELSE(Issue #3 场景)
--   [7] 内联匿名块 + EXCEPTION 多 WHEN
-- 预期大纲:
--   Anonymous Block
--   ├ Declaration: c_step/v_*(变量) c_src(游标) t_row(类型) e_bad(异常)
--   ├ Sub Program: sub_accum > sub_label > sub_check
--   ├ Body: LOOP/WHILE/CASE/FOR + 内联匿名块
--   └ Exception: WHEN e_bad / WHEN OTHERS
-- =============================================================================
DECLARE
    c_step   CONSTANT NUMBER := 2;
    v_total  NUMBER := 0;
    v_text   VARCHAR2(1000);

    CURSOR c_src IS
        SELECT id, amount
          FROM stage_orders
         WHERE status = 'READY';

    TYPE t_row IS RECORD (
        id      NUMBER,
        amount  NUMBER
    );
    r_row  t_row;

    e_bad  EXCEPTION;

    -- ----- 嵌套子程序 第 1 层: 子过程 -----
    PROCEDURE sub_accum(p_amt IN NUMBER) IS

        -- ----- 嵌套子程序 第 2 层: 子函数(位于子过程内) -----
        FUNCTION sub_label(p_id IN NUMBER) RETURN VARCHAR2 IS

            -- ----- 嵌套子程序 第 3 层: 子过程(位于子函数内) -----
            PROCEDURE sub_check(p_v IN NUMBER) IS
            BEGIN
                IF p_v < 0 THEN
                    RAISE e_bad;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_check;
        BEGIN
            sub_check(p_id);
            RETURN 'row-' || TO_CHAR(p_id);
        EXCEPTION
            WHEN OTHERS THEN
                RETURN '?';
        END sub_label;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR i IN 1 .. 3 LOOP
            WHILE v_total < 100 LOOP
                FOR j IN 1 .. 2 LOOP
                    v_total := v_total + p_amt + i * j;
                END LOOP;
            END LOOP;
        END LOOP;
    EXCEPTION
        WHEN e_bad THEN
            NULL;
        WHEN OTHERS THEN
            NULL;
    END sub_accum;

BEGIN
    -- 被单行注释注释掉的代码结构(不应出现在大纲)
    -- IF v_total > 1000 THEN
    --     v_total := 1000;
    -- END IF;

    /*
       被块注释注释掉的子过程(不应出现在大纲):
       PROCEDURE legacy_reset IS
       BEGIN
           v_total := 0;
       END legacy_reset;
    */

    OPEN c_src;
    LOOP
        FETCH c_src INTO r_row;
        EXIT WHEN c_src%NOTFOUND;
        sub_accum(r_row.amount);
        v_text := sub_label(r_row.id);
    END LOOP;
    CLOSE c_src;

    -- Q-quote + CASE ELSE
    v_text := q'[done -- stage /*ok*/ ]';
    CASE MOD(v_total, 2)
        WHEN 0 THEN
            DBMS_OUTPUT.PUT_LINE('even');
        ELSE
            DBMS_OUTPUT.PUT_LINE('odd');
    END CASE;

    -- 内联匿名块(含嵌套子程序)
    DECLARE
        v_local  NUMBER := 1;

        PROCEDURE sub_scale(p_in IN NUMBER) IS
        BEGIN
            v_local := v_local + p_in;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_scale;
    BEGIN
        FOR k IN 1 .. 3 LOOP
            sub_scale(k);
        END LOOP;
        v_total := v_total + v_local;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    DBMS_OUTPUT.PUT_LINE('total=' || v_total);
EXCEPTION
    WHEN e_bad THEN
        DBMS_OUTPUT.PUT_LINE('bad');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('error');
END;
/

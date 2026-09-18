-- =============================================================================
-- 用例: 匿名块 / BEGIN..END(顶层裸 BEGIN) 复杂结构 (anon_begin_complex.sql)
-- 说明: 顶层裸 BEGIN 无 DECLARE 区 → 无变量/子程序声明, 复杂度全部通过
--       体内内联 DECLARE 块(含嵌套子程序)、控制结构、注释、Q-quote 表达。
-- 覆盖点:
--   [1] 顶层直接控制结构(FOR/IF/基础 LOOP..EXIT WHEN)
--   [2] 内联匿名块 1: 含变量 + 嵌套子程序 2 层 + EXCEPTION
--   [3] 内联匿名块 2: 嵌套 3 层循环(FOR>FOR>WHILE) + CASE ELSE + Q-quote
--   [4] 注释: 单行/多行/注释掉的代码结构(FOR 块/整个匿名块)
--   [5] 顶层 EXCEPTION
-- 预期大纲:
--   Anonymous Block
--   ├ Body: FOR/IF/LOOP + 两个内联匿名块
--   └ Exception: WHEN OTHERS
-- =============================================================================
BEGIN
    -- 单行注释掉的代码结构(不应出现在大纲)
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;

    /*
       被块注释注释掉的匿名块(不应出现在大纲):
       DECLARE
           v_legacy NUMBER;
       BEGIN
           NULL;
       END;
    */

    -- 顶层直接控制结构
    FOR i IN 1 .. 3 LOOP
        IF MOD(i, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('even ' || i);
        ELSE
            DBMS_OUTPUT.PUT_LINE('odd ' || i);
        END IF;
    END LOOP;

    -- 内联匿名块 1: 含变量 + 嵌套子程序 2 层 + EXCEPTION
    DECLARE
        v_acc  NUMBER := 0;

        PROCEDURE sub_step(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner;
        BEGIN
            sub_step_inner(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc := v_acc + k;
            sub_step(k);
        END LOOP;
        DBMS_OUTPUT.PUT_LINE('acc=' || v_acc);
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 内联匿名块 2: 嵌套 3 层循环 + CASE ELSE + Q-quote
    DECLARE
        v_n  NUMBER := 0;
        v_s  VARCHAR2(200);
    BEGIN
        FOR a IN 1 .. 3 LOOP
            FOR b IN 1 .. 3 LOOP
                WHILE v_n < 30 LOOP
                    v_n := v_n + a * b;
                END LOOP;
            END LOOP;
        END LOOP;

        v_s := q'[summary -- inline /*block*/ ]';
        CASE MOD(v_n, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(v_s);
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 基础 LOOP + EXIT WHEN
    LOOP
        EXIT;
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
END;
/

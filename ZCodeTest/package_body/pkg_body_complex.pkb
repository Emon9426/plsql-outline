-- =============================================================================
-- 用例: Package Body / 复杂结构 (pkg_body_complex.pkb)
-- 覆盖点:
--   [1] 包级声明(变量/常量/类型/异常) + 包初始化块(BEGIN..EXCEPTION..END)
--   [2] 前置声明(过程+函数) 与同名真实定义(声明节点原位替换)
--   [3] 成员过程内嵌套子程序 3 层: impl_score > impl_format > impl_check
--   [4] 嵌套 3 层循环(FOR>WHILE>FOR) / 基础 LOOP / 游标 FOR(跨行子查询)
--   [5] 注释: 单行/多行/注释掉的成员与代码结构
--   [6] Q-quote 字符串 / CASE ELSE(Issue #3 场景)
--   [7] 内联匿名块(含嵌套子程序) / 各成员自己的 EXCEPTION
-- 预期大纲:
--   PKG_ORDER_API_COMPLEX (Package Body)
--   ├ Declaration(包级): g_*(变量) c_*(常量) t_*(类型) e_internal(异常)
--   ├ 成员: fwd_validate_order / fwd_cache_get / impl_score / get_order_total /
--   │       close_order / validate_and_migrate
--   │   └ Sub Program: impl_score > impl_format > impl_check (3 层)
--   └ Package Initialization(初始化块, 含 Exception)
-- =============================================================================
CREATE OR REPLACE PACKAGE BODY pkg_order_api_complex IS

    -- ============================ 包级声明 ============================
    g_call_count  NUMBER := 0;
    g_last_run    DATE;
    c_pkg_owner   CONSTANT VARCHAR2(30) := 'ZC_TEST';
    c_trace_tag   CONSTANT VARCHAR2(100) := q'[TRACE /*pkg*/ --body]';

    TYPE t_cache_rec IS RECORD (
        key    VARCHAR2(100),
        value  NUMBER
    );
    TYPE t_cache_tab IS TABLE OF t_cache_rec INDEX BY PLS_INTEGER;

    e_internal  EXCEPTION;

    -- 前置声明(先挂声明节点, 真实定义原位替换)
    PROCEDURE fwd_validate_order;
    FUNCTION fwd_cache_get;

    -- 成员过程: 含 3 层嵌套子程序
    PROCEDURE impl_score(
        p_order_id IN NUMBER,
        p_score    OUT NUMBER
    ) IS
        v_step  NUMBER := 0;

        -- ----- 嵌套子程序 第 2 层: 子函数 -----
        FUNCTION impl_format(p_v IN NUMBER) RETURN VARCHAR2 IS
            v_txt  VARCHAR2(100);

            -- ----- 嵌套子程序 第 3 层: 子过程(位于子函数内) -----
            PROCEDURE impl_check(p_v IN NUMBER) IS
            BEGIN
                IF p_v < 0 THEN
                    RAISE e_internal;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END impl_check;
        BEGIN
            impl_check(p_v);
            v_txt := 'score=' || TO_CHAR(p_v);
            RETURN v_txt;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN '?';
        END impl_format;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR i IN 1 .. 4 LOOP
            WHILE v_step < 10 LOOP
                FOR j IN 1 .. 2 LOOP
                    v_step := v_step + i * j;
                END LOOP;
            END LOOP;
            v_step := 0;
        END LOOP;

        p_score := v_step + LENGTH(impl_format(v_step));
    EXCEPTION
        WHEN e_internal THEN
            p_score := -1;
        WHEN OTHERS THEN
            p_score := -99;
    END impl_score;

    -- 前置声明(过程)的真实定义
    PROCEDURE fwd_validate_order IS
        v_dummy  NUMBER;
    BEGIN
        impl_score(1, v_dummy);
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END fwd_validate_order;

    -- 前置声明(函数)的真实定义
    FUNCTION fwd_cache_get RETURN NUMBER IS
    BEGIN
        RETURN g_call_count;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN -1;
    END fwd_cache_get;

    -- 成员函数: 游标 FOR(跨行) + CASE ELSE
    FUNCTION get_order_total(p_order_id IN NUMBER) RETURN NUMBER IS
        v_total  NUMBER := 0;
    BEGIN
        FOR rec IN (
            SELECT amount
              FROM order_lines
             WHERE order_id = p_order_id
        ) LOOP
            v_total := v_total + rec.amount;
        END LOOP;

        CASE MOD(v_total, 2)
            WHEN 0 THEN
                g_call_count := g_call_count + 1;
            ELSE
                g_call_count := g_call_count + 2;
        END CASE;

        g_last_run := SYSDATE;
        RETURN v_total;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN -1;
    END get_order_total;

    -- 成员过程: 内联匿名块(含嵌套子程序) + 基础 LOOP
    PROCEDURE close_order(p_order_id IN NUMBER) IS
        v_guard  NUMBER := 0;
    BEGIN
        LOOP
            v_guard := v_guard + 1;
            EXIT WHEN v_guard >= 3;

            DECLARE
                v_local  NUMBER := 0;

                PROCEDURE sub_local_bump(p_in IN NUMBER) IS
                BEGIN
                    v_local := v_local + p_in;
                EXCEPTION
                    WHEN OTHERS THEN
                        NULL;
                END sub_local_bump;
            BEGIN
                sub_local_bump(p_order_id);
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END;
        END LOOP;

        -- 以下为被单行注释注释掉的历史成员(不应出现在大纲):
        -- PROCEDURE legacy_archive IS
        -- BEGIN
        --     NULL;
        -- END legacy_archive;
        NULL;
    EXCEPTION
        WHEN e_not_allowed THEN
            RAISE;
        WHEN OTHERS THEN
            NULL;
    END close_order;

    /* 被块注释注释掉的整个成员(不应出现在大纲):
    PROCEDURE legacy_purge(p_days IN NUMBER) IS
    BEGIN
        DELETE FROM orders WHERE created < SYSDATE - p_days;
    END legacy_purge;
    */

    PROCEDURE validate_and_migrate(
        p_batch_size IN NUMBER DEFAULT 500,
        p_dry_run    IN VARCHAR2 := 'Y'
    ) IS
        v_done  NUMBER := 0;
    BEGIN
        WHILE v_done < p_batch_size LOOP
            v_done := v_done + fwd_cache_get;
        END LOOP;
        fwd_validate_order;
    EXCEPTION
        WHEN OTHERS THEN
            v_done := -1;
    END validate_and_migrate;

    -- ======================= 包初始化块 =======================
BEGIN
    g_call_count := 0;
    g_last_run := SYSDATE;

    IF c_trace_tag IS NOT NULL THEN
        DBMS_OUTPUT.PUT_LINE(c_trace_tag);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        g_call_count := -1;
END pkg_order_api_complex;
/

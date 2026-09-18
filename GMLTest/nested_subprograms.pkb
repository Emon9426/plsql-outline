CREATE OR REPLACE PACKAGE BODY gml_test_pkg
IS
    -- ===== 包级声明（验证 Declaration 包裹层）=====
    g_pkg_count   NUMBER := 0;
    c_max_retry   CONSTANT NUMBER := 3;
    CURSOR c_pkg_orders (p_status VARCHAR2) IS
        SELECT id, status, amount
          FROM orders
         WHERE status = p_status;
    TYPE t_order_rec IS RECORD (
        id      NUMBER,
        status  VARCHAR2(30),
        amount  NUMBER(15,2)
    );
    TYPE t_id_tab IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    e_pkg_error   EXCEPTION;

    -- ===== 顶层子程序 =====

    PROCEDURE outer_proc(p_param IN NUMBER) IS
        -- L1 局部声明
        v_local_1   NUMBER := p_param;
        v_local_2   VARCHAR2(100) := 'init';
        c_local_lim CONSTANT NUMBER := 1000;
        CURSOR c_local IS SELECT level FROM dual CONNECT BY level <= 10;
        e_local_err EXCEPTION;

        -- L2 子程序：Function（在 outer_proc 的 Sub Program 下）
        FUNCTION inner_func(x IN NUMBER) RETURN NUMBER IS
            -- L2 局部声明
            v_inner   NUMBER := x;
            v_accum   NUMBER := 0;
            TYPE t_inner_tab IS TABLE OF NUMBER INDEX BY PLS_INTEGER;

            -- L3 子程序：Procedure（在 inner_func 的 Sub Program 下 = Sub Program 嵌套）
            PROCEDURE deepest_proc(y IN NUMBER) IS
                -- L3 局部声明
                v_deep NUMBER := y;
                c_deep CONSTANT NUMBER := 500;

                -- L4 子程序：Function（最深嵌套）
                FUNCTION leaf_func(z IN NUMBER) RETURN VARCHAR2 IS
                    v_str VARCHAR2(50);
                BEGIN
                    IF z IS NULL THEN
                        v_str := 'null';
                    ELSIF z > 0 THEN
                        v_str := 'positive';
                    ELSE
                        v_str := 'non-positive';
                    END IF;
                    RETURN v_str;
                END leaf_func;
            BEGIN
                -- L3 Body：控制结构
                FOR i IN 1 .. y LOOP
                    v_deep := v_deep + i;
                END LOOP;

                IF v_deep > c_deep THEN
                    WHILE v_deep > c_deep LOOP
                        v_deep := v_deep - 1;
                    END LOOP;
                END IF;

                -- 调用 L4 子程序
                v_deep := v_deep + LENGTH(leaf_func(v_deep));
            EXCEPTION
                WHEN OTHERS THEN
                    v_deep := -1;
            END deepest_proc;
        BEGIN
            -- L2 Body：控制结构 + 调用 L3
            CASE
                WHEN x > 100 THEN
                    v_inner := 100;
                WHEN x > 50 THEN
                    v_inner := 50;
                ELSE
                    v_inner := 0;
            END CASE;

            FOR i IN 1 .. x LOOP
                v_accum := v_accum + i;
            END LOOP;

            -- 调用 L3 子程序（Sub Program 嵌套调用）
            deepest_proc(v_inner + v_accum);
            RETURN v_inner;
        END inner_func;

        -- L2 子程序：Procedure（outer_proc 的另一个子程序）
        PROCEDURE sibling_proc(q IN NUMBER) IS
            v_q NUMBER := q;
        BEGIN
            IF q IS NOT NULL THEN
                v_q := q * 2;
            END IF;
        END sibling_proc;
    BEGIN
        -- L1 Body：控制结构 + 调用 L2
        FOR i IN 1 .. p_param LOOP
            v_local_1 := v_local_1 + i;
        END LOOP;

        IF p_param > c_local_lim THEN
            v_local_1 := c_local_lim;
        ELSIF p_param > 0 THEN
            v_local_1 := inner_func(p_param);
        ELSE
            v_local_1 := 0;
        END IF;

        sibling_proc(v_local_1);
    EXCEPTION
        WHEN e_local_err THEN
            v_local_1 := -1;
        WHEN OTHERS THEN
            v_local_1 := -2;
    END outer_proc;

    -- ===== 另一个顶层子程序（Function）=====
    FUNCTION top_func(a IN NUMBER, b IN NUMBER) RETURN NUMBER IS
        v_result NUMBER := 0;
    BEGIN
        FOR i IN a .. b LOOP
            v_result := v_result + i;
        END LOOP;
        RETURN v_result;
    END top_func;

END gml_test_pkg;
/

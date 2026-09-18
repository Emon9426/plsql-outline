-- =============================================================================
-- 用例: Package Body / 长代码+复杂结构 (package_body/pkg_body_long_complex.pkb)
-- 本文件由 ZCodeTest/generate-long.js 确定性生成(10,000+ 行), 请勿手工编辑;
-- 再生: node ZCodeTest/generate-long.js
-- 覆盖: 约两百个成员(每 6 个含 1 个复杂成员: 嵌套子程序/3层循环/注释风暴/内联匿名块)
-- 覆盖: 包级声明 + 前置声明对
-- 覆盖: 包初始化块(BEGIN..EXCEPTION..END)
-- 覆盖: 各成员自己的 EXCEPTION
-- =============================================================================
CREATE OR REPLACE PACKAGE BODY pkg_long_api_cx IS

    g_run_id    NUMBER := 0;
    g_last_run  DATE;
    c_owner     CONSTANT VARCHAR2(30) := 'ZC_TEST';
    c_trace     CONSTANT VARCHAR2(100) := q'[TRACE /*pkg*/ --long]';


    TYPE g_rec IS RECORD (
        id   NUMBER,
        val  NUMBER
    );

    -- 前置声明(声明节点, 真实定义原位替换)
    PROCEDURE g_fwd_reset;

    PROCEDURE g_fwd_reset IS
    BEGIN
        g_run_id := 0;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END g_fwd_reset;

    -- ==================== [0001] 成员过程 ====================
    PROCEDURE pr_impl_0001(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0010: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0011: 条件循环
    WHILE l_a > 11 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0012: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0001;

    -- ==================== [0002] 成员函数 ====================
    FUNCTION fn_impl_0002(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0020: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0021: 赋值与分支
    l_a := l_a + 21;
    IF l_a > 21 THEN
        l_b := l_b + 1;
    ELSIF l_a = 21 THEN
        l_c := 0;
    ELSE
        l_b := 42;
    END IF;

    -- 段落 0022: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0002;

    -- ==================== [0003] 成员过程 ====================
    PROCEDURE pr_impl_0003(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0030: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0031: 条件循环
    WHILE l_a > 31 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0032: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0003;

    -- ==================== [0004] 成员函数 ====================
    FUNCTION fn_impl_0004(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0040: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0041: 赋值与分支
    l_a := l_a + 41;
    IF l_a > 41 THEN
        l_b := l_b + 1;
    ELSIF l_a = 41 THEN
        l_c := 0;
    ELSE
        l_b := 82;
    END IF;

    -- 段落 0042: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0004;

    -- ==================== [0005] 成员过程 ====================
    PROCEDURE pr_impl_0005(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0050: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0051: 条件循环
    WHILE l_a > 51 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0052: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0005;

    -- ==================== [0006] 复杂成员 ====================
    PROCEDURE pr_cx_0006(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0006(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0006(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0006;
        BEGIN
            l_inner := p_v;
            sub_proc_0006(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0006;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0006 IS
        BEGIN
            NULL;
        END legacy_cx_0006;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0006(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0006;

    -- ==================== [0007] 成员过程 ====================
    PROCEDURE pr_impl_0007(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0070: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0071: 条件循环
    WHILE l_a > 71 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0072: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0007;

    -- ==================== [0008] 成员函数 ====================
    FUNCTION fn_impl_0008(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0080: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0081: 赋值与分支
    l_a := l_a + 81;
    IF l_a > 81 THEN
        l_b := l_b + 1;
    ELSIF l_a = 81 THEN
        l_c := 0;
    ELSE
        l_b := 162;
    END IF;

    -- 段落 0082: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0008;

    -- ==================== [0009] 成员过程 ====================
    PROCEDURE pr_impl_0009(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0090: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0091: 条件循环
    WHILE l_a > 91 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0092: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0009;

    -- ==================== [0010] 成员函数 ====================
    FUNCTION fn_impl_0010(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0100: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0101: 赋值与分支
    l_a := l_a + 101;
    IF l_a > 101 THEN
        l_b := l_b + 1;
    ELSIF l_a = 101 THEN
        l_c := 0;
    ELSE
        l_b := 202;
    END IF;

    -- 段落 0102: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0010;

    -- ==================== [0011] 成员过程 ====================
    PROCEDURE pr_impl_0011(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0110: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0111: 条件循环
    WHILE l_a > 111 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0112: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0011;

    -- ==================== [0012] 复杂成员 ====================
    PROCEDURE pr_cx_0012(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0012(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0012(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0012;
        BEGIN
            l_inner := p_v;
            sub_proc_0012(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0012;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0012 IS
        BEGIN
            NULL;
        END legacy_cx_0012;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0012(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0012;

    -- ==================== [0013] 成员过程 ====================
    PROCEDURE pr_impl_0013(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0130: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0131: 条件循环
    WHILE l_a > 131 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0132: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0013;

    -- ==================== [0014] 成员函数 ====================
    FUNCTION fn_impl_0014(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0140: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0141: 赋值与分支
    l_a := l_a + 141;
    IF l_a > 141 THEN
        l_b := l_b + 1;
    ELSIF l_a = 141 THEN
        l_c := 0;
    ELSE
        l_b := 282;
    END IF;

    -- 段落 0142: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0014;

    -- ==================== [0015] 成员过程 ====================
    PROCEDURE pr_impl_0015(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0150: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0151: 条件循环
    WHILE l_a > 151 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0152: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0015;

    -- ==================== [0016] 成员函数 ====================
    FUNCTION fn_impl_0016(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0160: 基础循环
    DECLARE
        l_guard_0060 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0060 := l_guard_0060 + 1;
            l_a := l_a + l_guard_0060;
            EXIT WHEN l_guard_0060 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0161: 赋值与分支
    l_a := l_a + 161;
    IF l_a > 161 THEN
        l_b := l_b + 1;
    ELSIF l_a = 161 THEN
        l_c := 0;
    ELSE
        l_b := 322;
    END IF;

    -- 段落 0162: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0016;

    -- ==================== [0017] 成员过程 ====================
    PROCEDURE pr_impl_0017(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0170: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0171: 条件循环
    WHILE l_a > 171 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0172: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0017;

    -- ==================== [0018] 复杂成员 ====================
    PROCEDURE pr_cx_0018(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0018(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0018(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0018;
        BEGIN
            l_inner := p_v;
            sub_proc_0018(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0018;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0018 IS
        BEGIN
            NULL;
        END legacy_cx_0018;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0018(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0018;

    -- ==================== [0019] 成员过程 ====================
    PROCEDURE pr_impl_0019(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0190: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0191: 条件循环
    WHILE l_a > 191 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0192: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0019;

    -- ==================== [0020] 成员函数 ====================
    FUNCTION fn_impl_0020(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0200: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0201: 赋值与分支
    l_a := l_a + 201;
    IF l_a > 201 THEN
        l_b := l_b + 1;
    ELSIF l_a = 201 THEN
        l_c := 0;
    ELSE
        l_b := 402;
    END IF;

    -- 段落 0202: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0020;

    -- ==================== [0021] 成员过程 ====================
    PROCEDURE pr_impl_0021(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0210: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0211: 条件循环
    WHILE l_a > 211 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0212: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0021;

    -- ==================== [0022] 成员函数 ====================
    FUNCTION fn_impl_0022(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0220: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0221: 赋值与分支
    l_a := l_a + 221;
    IF l_a > 221 THEN
        l_b := l_b + 1;
    ELSIF l_a = 221 THEN
        l_c := 0;
    ELSE
        l_b := 442;
    END IF;

    -- 段落 0222: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0022;

    -- ==================== [0023] 成员过程 ====================
    PROCEDURE pr_impl_0023(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0230: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0231: 条件循环
    WHILE l_a > 231 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0232: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0023;

    -- ==================== [0024] 复杂成员 ====================
    PROCEDURE pr_cx_0024(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0024(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0024(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0024;
        BEGIN
            l_inner := p_v;
            sub_proc_0024(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0024;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0024 IS
        BEGIN
            NULL;
        END legacy_cx_0024;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0024(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0024;

    -- ==================== [0025] 成员过程 ====================
    PROCEDURE pr_impl_0025(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0250: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0251: 条件循环
    WHILE l_a > 251 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0252: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0025;

    -- ==================== [0026] 成员函数 ====================
    FUNCTION fn_impl_0026(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0260: 基础循环
    DECLARE
        l_guard_0060 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0060 := l_guard_0060 + 1;
            l_a := l_a + l_guard_0060;
            EXIT WHEN l_guard_0060 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0261: 赋值与分支
    l_a := l_a + 261;
    IF l_a > 261 THEN
        l_b := l_b + 1;
    ELSIF l_a = 261 THEN
        l_c := 0;
    ELSE
        l_b := 522;
    END IF;

    -- 段落 0262: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0026;

    -- ==================== [0027] 成员过程 ====================
    PROCEDURE pr_impl_0027(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0270: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0271: 条件循环
    WHILE l_a > 271 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0272: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0027;

    -- ==================== [0028] 成员函数 ====================
    FUNCTION fn_impl_0028(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0280: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0281: 赋值与分支
    l_a := l_a + 281;
    IF l_a > 281 THEN
        l_b := l_b + 1;
    ELSIF l_a = 281 THEN
        l_c := 0;
    ELSE
        l_b := 562;
    END IF;

    -- 段落 0282: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0028;

    -- ==================== [0029] 成员过程 ====================
    PROCEDURE pr_impl_0029(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0290: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0291: 条件循环
    WHILE l_a > 291 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0292: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0029;

    -- ==================== [0030] 复杂成员 ====================
    PROCEDURE pr_cx_0030(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0030(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0030(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0030;
        BEGIN
            l_inner := p_v;
            sub_proc_0030(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0030;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0030 IS
        BEGIN
            NULL;
        END legacy_cx_0030;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0030(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0030;

    -- ==================== [0031] 成员过程 ====================
    PROCEDURE pr_impl_0031(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0310: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0311: 条件循环
    WHILE l_a > 311 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0312: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0031;

    -- ==================== [0032] 成员函数 ====================
    FUNCTION fn_impl_0032(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0320: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0321: 赋值与分支
    l_a := l_a + 321;
    IF l_a > 321 THEN
        l_b := l_b + 1;
    ELSIF l_a = 321 THEN
        l_c := 0;
    ELSE
        l_b := 642;
    END IF;

    -- 段落 0322: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0032;

    -- ==================== [0033] 成员过程 ====================
    PROCEDURE pr_impl_0033(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0330: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0331: 条件循环
    WHILE l_a > 331 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0332: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0033;

    -- ==================== [0034] 成员函数 ====================
    FUNCTION fn_impl_0034(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0340: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0341: 赋值与分支
    l_a := l_a + 341;
    IF l_a > 341 THEN
        l_b := l_b + 1;
    ELSIF l_a = 341 THEN
        l_c := 0;
    ELSE
        l_b := 682;
    END IF;

    -- 段落 0342: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0034;

    -- ==================== [0035] 成员过程 ====================
    PROCEDURE pr_impl_0035(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0350: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0351: 条件循环
    WHILE l_a > 351 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0352: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0035;

    -- ==================== [0036] 复杂成员 ====================
    PROCEDURE pr_cx_0036(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0036(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0036(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0036;
        BEGIN
            l_inner := p_v;
            sub_proc_0036(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0036;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0036 IS
        BEGIN
            NULL;
        END legacy_cx_0036;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0036(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0036;

    -- ==================== [0037] 成员过程 ====================
    PROCEDURE pr_impl_0037(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0370: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0371: 条件循环
    WHILE l_a > 371 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0372: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0037;

    -- ==================== [0038] 成员函数 ====================
    FUNCTION fn_impl_0038(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0380: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0381: 赋值与分支
    l_a := l_a + 381;
    IF l_a > 381 THEN
        l_b := l_b + 1;
    ELSIF l_a = 381 THEN
        l_c := 0;
    ELSE
        l_b := 762;
    END IF;

    -- 段落 0382: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0038;

    -- ==================== [0039] 成员过程 ====================
    PROCEDURE pr_impl_0039(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0390: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0391: 条件循环
    WHILE l_a > 391 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0392: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0039;

    -- ==================== [0040] 成员函数 ====================
    FUNCTION fn_impl_0040(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0400: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0401: 赋值与分支
    l_a := l_a + 401;
    IF l_a > 401 THEN
        l_b := l_b + 1;
    ELSIF l_a = 401 THEN
        l_c := 0;
    ELSE
        l_b := 802;
    END IF;

    -- 段落 0402: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0040;

    -- ==================== [0041] 成员过程 ====================
    PROCEDURE pr_impl_0041(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0410: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0411: 条件循环
    WHILE l_a > 411 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0412: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0041;

    -- ==================== [0042] 复杂成员 ====================
    PROCEDURE pr_cx_0042(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0042(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0042(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0042;
        BEGIN
            l_inner := p_v;
            sub_proc_0042(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0042;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0042 IS
        BEGIN
            NULL;
        END legacy_cx_0042;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0042(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0042;

    -- ==================== [0043] 成员过程 ====================
    PROCEDURE pr_impl_0043(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0430: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0431: 条件循环
    WHILE l_a > 431 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0432: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0043;

    -- ==================== [0044] 成员函数 ====================
    FUNCTION fn_impl_0044(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0440: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0441: 赋值与分支
    l_a := l_a + 441;
    IF l_a > 441 THEN
        l_b := l_b + 1;
    ELSIF l_a = 441 THEN
        l_c := 0;
    ELSE
        l_b := 882;
    END IF;

    -- 段落 0442: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0044;

    -- ==================== [0045] 成员过程 ====================
    PROCEDURE pr_impl_0045(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0450: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0451: 条件循环
    WHILE l_a > 451 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0452: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0045;

    -- ==================== [0046] 成员函数 ====================
    FUNCTION fn_impl_0046(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0460: 基础循环
    DECLARE
        l_guard_0060 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0060 := l_guard_0060 + 1;
            l_a := l_a + l_guard_0060;
            EXIT WHEN l_guard_0060 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0461: 赋值与分支
    l_a := l_a + 461;
    IF l_a > 461 THEN
        l_b := l_b + 1;
    ELSIF l_a = 461 THEN
        l_c := 0;
    ELSE
        l_b := 922;
    END IF;

    -- 段落 0462: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0046;

    -- ==================== [0047] 成员过程 ====================
    PROCEDURE pr_impl_0047(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0470: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0471: 条件循环
    WHILE l_a > 471 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0472: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0047;

    -- ==================== [0048] 复杂成员 ====================
    PROCEDURE pr_cx_0048(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0048(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0048(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0048;
        BEGIN
            l_inner := p_v;
            sub_proc_0048(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0048;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0048 IS
        BEGIN
            NULL;
        END legacy_cx_0048;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0048(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0048;

    -- ==================== [0049] 成员过程 ====================
    PROCEDURE pr_impl_0049(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0490: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0491: 条件循环
    WHILE l_a > 491 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0492: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0049;

    -- ==================== [0050] 成员函数 ====================
    FUNCTION fn_impl_0050(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0500: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0501: 赋值与分支
    l_a := l_a + 501;
    IF l_a > 501 THEN
        l_b := l_b + 1;
    ELSIF l_a = 501 THEN
        l_c := 0;
    ELSE
        l_b := 1002;
    END IF;

    -- 段落 0502: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0050;

    -- ==================== [0051] 成员过程 ====================
    PROCEDURE pr_impl_0051(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0510: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0511: 条件循环
    WHILE l_a > 511 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0512: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0051;

    -- ==================== [0052] 成员函数 ====================
    FUNCTION fn_impl_0052(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0520: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0521: 赋值与分支
    l_a := l_a + 521;
    IF l_a > 521 THEN
        l_b := l_b + 1;
    ELSIF l_a = 521 THEN
        l_c := 0;
    ELSE
        l_b := 1042;
    END IF;

    -- 段落 0522: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0052;

    -- ==================== [0053] 成员过程 ====================
    PROCEDURE pr_impl_0053(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0530: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0531: 条件循环
    WHILE l_a > 531 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0532: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0053;

    -- ==================== [0054] 复杂成员 ====================
    PROCEDURE pr_cx_0054(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0054(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0054(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0054;
        BEGIN
            l_inner := p_v;
            sub_proc_0054(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0054;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0054 IS
        BEGIN
            NULL;
        END legacy_cx_0054;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0054(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0054;

    -- ==================== [0055] 成员过程 ====================
    PROCEDURE pr_impl_0055(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0550: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0551: 条件循环
    WHILE l_a > 551 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0552: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0055;

    -- ==================== [0056] 成员函数 ====================
    FUNCTION fn_impl_0056(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0560: 基础循环
    DECLARE
        l_guard_0060 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0060 := l_guard_0060 + 1;
            l_a := l_a + l_guard_0060;
            EXIT WHEN l_guard_0060 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0561: 赋值与分支
    l_a := l_a + 561;
    IF l_a > 561 THEN
        l_b := l_b + 1;
    ELSIF l_a = 561 THEN
        l_c := 0;
    ELSE
        l_b := 1122;
    END IF;

    -- 段落 0562: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0056;

    -- ==================== [0057] 成员过程 ====================
    PROCEDURE pr_impl_0057(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0570: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0571: 条件循环
    WHILE l_a > 571 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0572: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0057;

    -- ==================== [0058] 成员函数 ====================
    FUNCTION fn_impl_0058(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0580: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0581: 赋值与分支
    l_a := l_a + 581;
    IF l_a > 581 THEN
        l_b := l_b + 1;
    ELSIF l_a = 581 THEN
        l_c := 0;
    ELSE
        l_b := 1162;
    END IF;

    -- 段落 0582: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0058;

    -- ==================== [0059] 成员过程 ====================
    PROCEDURE pr_impl_0059(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0590: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0591: 条件循环
    WHILE l_a > 591 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0592: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0059;

    -- ==================== [0060] 复杂成员 ====================
    PROCEDURE pr_cx_0060(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0060(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0060(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0060;
        BEGIN
            l_inner := p_v;
            sub_proc_0060(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0060;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0060 IS
        BEGIN
            NULL;
        END legacy_cx_0060;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0060(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0060;

    -- ==================== [0061] 成员过程 ====================
    PROCEDURE pr_impl_0061(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0610: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0611: 条件循环
    WHILE l_a > 611 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0612: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0061;

    -- ==================== [0062] 成员函数 ====================
    FUNCTION fn_impl_0062(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0620: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0621: 赋值与分支
    l_a := l_a + 621;
    IF l_a > 621 THEN
        l_b := l_b + 1;
    ELSIF l_a = 621 THEN
        l_c := 0;
    ELSE
        l_b := 1242;
    END IF;

    -- 段落 0622: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0062;

    -- ==================== [0063] 成员过程 ====================
    PROCEDURE pr_impl_0063(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0630: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0631: 条件循环
    WHILE l_a > 631 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0632: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0063;

    -- ==================== [0064] 成员函数 ====================
    FUNCTION fn_impl_0064(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0640: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0641: 赋值与分支
    l_a := l_a + 641;
    IF l_a > 641 THEN
        l_b := l_b + 1;
    ELSIF l_a = 641 THEN
        l_c := 0;
    ELSE
        l_b := 1282;
    END IF;

    -- 段落 0642: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0064;

    -- ==================== [0065] 成员过程 ====================
    PROCEDURE pr_impl_0065(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0650: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0651: 条件循环
    WHILE l_a > 651 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0652: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0065;

    -- ==================== [0066] 复杂成员 ====================
    PROCEDURE pr_cx_0066(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0066(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0066(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0066;
        BEGIN
            l_inner := p_v;
            sub_proc_0066(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0066;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0066 IS
        BEGIN
            NULL;
        END legacy_cx_0066;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0066(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0066;

    -- ==================== [0067] 成员过程 ====================
    PROCEDURE pr_impl_0067(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0670: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0671: 条件循环
    WHILE l_a > 671 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0672: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0067;

    -- ==================== [0068] 成员函数 ====================
    FUNCTION fn_impl_0068(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0680: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0681: 赋值与分支
    l_a := l_a + 681;
    IF l_a > 681 THEN
        l_b := l_b + 1;
    ELSIF l_a = 681 THEN
        l_c := 0;
    ELSE
        l_b := 1362;
    END IF;

    -- 段落 0682: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0068;

    -- ==================== [0069] 成员过程 ====================
    PROCEDURE pr_impl_0069(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0690: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0691: 条件循环
    WHILE l_a > 691 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0692: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0069;

    -- ==================== [0070] 成员函数 ====================
    FUNCTION fn_impl_0070(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0700: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0701: 赋值与分支
    l_a := l_a + 701;
    IF l_a > 701 THEN
        l_b := l_b + 1;
    ELSIF l_a = 701 THEN
        l_c := 0;
    ELSE
        l_b := 1402;
    END IF;

    -- 段落 0702: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0070;

    -- ==================== [0071] 成员过程 ====================
    PROCEDURE pr_impl_0071(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0710: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0711: 条件循环
    WHILE l_a > 711 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0712: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0071;

    -- ==================== [0072] 复杂成员 ====================
    PROCEDURE pr_cx_0072(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0072(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0072(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0072;
        BEGIN
            l_inner := p_v;
            sub_proc_0072(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0072;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0072 IS
        BEGIN
            NULL;
        END legacy_cx_0072;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0072(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0072;

    -- ==================== [0073] 成员过程 ====================
    PROCEDURE pr_impl_0073(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0730: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0731: 条件循环
    WHILE l_a > 731 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0732: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0073;

    -- ==================== [0074] 成员函数 ====================
    FUNCTION fn_impl_0074(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0740: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0741: 赋值与分支
    l_a := l_a + 741;
    IF l_a > 741 THEN
        l_b := l_b + 1;
    ELSIF l_a = 741 THEN
        l_c := 0;
    ELSE
        l_b := 1482;
    END IF;

    -- 段落 0742: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0074;

    -- ==================== [0075] 成员过程 ====================
    PROCEDURE pr_impl_0075(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0750: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0751: 条件循环
    WHILE l_a > 751 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0752: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0075;

    -- ==================== [0076] 成员函数 ====================
    FUNCTION fn_impl_0076(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0760: 基础循环
    DECLARE
        l_guard_0060 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0060 := l_guard_0060 + 1;
            l_a := l_a + l_guard_0060;
            EXIT WHEN l_guard_0060 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0761: 赋值与分支
    l_a := l_a + 761;
    IF l_a > 761 THEN
        l_b := l_b + 1;
    ELSIF l_a = 761 THEN
        l_c := 0;
    ELSE
        l_b := 1522;
    END IF;

    -- 段落 0762: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0076;

    -- ==================== [0077] 成员过程 ====================
    PROCEDURE pr_impl_0077(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0770: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0771: 条件循环
    WHILE l_a > 771 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0772: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0077;

    -- ==================== [0078] 复杂成员 ====================
    PROCEDURE pr_cx_0078(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0078(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0078(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0078;
        BEGIN
            l_inner := p_v;
            sub_proc_0078(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0078;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0078 IS
        BEGIN
            NULL;
        END legacy_cx_0078;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0078(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0078;

    -- ==================== [0079] 成员过程 ====================
    PROCEDURE pr_impl_0079(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0790: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0791: 条件循环
    WHILE l_a > 791 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0792: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0079;

    -- ==================== [0080] 成员函数 ====================
    FUNCTION fn_impl_0080(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0800: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0801: 赋值与分支
    l_a := l_a + 801;
    IF l_a > 801 THEN
        l_b := l_b + 1;
    ELSIF l_a = 801 THEN
        l_c := 0;
    ELSE
        l_b := 1602;
    END IF;

    -- 段落 0802: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0080;

    -- ==================== [0081] 成员过程 ====================
    PROCEDURE pr_impl_0081(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0810: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0811: 条件循环
    WHILE l_a > 811 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0812: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0081;

    -- ==================== [0082] 成员函数 ====================
    FUNCTION fn_impl_0082(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0820: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0821: 赋值与分支
    l_a := l_a + 821;
    IF l_a > 821 THEN
        l_b := l_b + 1;
    ELSIF l_a = 821 THEN
        l_c := 0;
    ELSE
        l_b := 1642;
    END IF;

    -- 段落 0822: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0082;

    -- ==================== [0083] 成员过程 ====================
    PROCEDURE pr_impl_0083(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0830: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0831: 条件循环
    WHILE l_a > 831 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0832: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0083;

    -- ==================== [0084] 复杂成员 ====================
    PROCEDURE pr_cx_0084(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0084(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0084(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0084;
        BEGIN
            l_inner := p_v;
            sub_proc_0084(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0084;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0084 IS
        BEGIN
            NULL;
        END legacy_cx_0084;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0084(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0084;

    -- ==================== [0085] 成员过程 ====================
    PROCEDURE pr_impl_0085(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0850: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0851: 条件循环
    WHILE l_a > 851 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0852: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0085;

    -- ==================== [0086] 成员函数 ====================
    FUNCTION fn_impl_0086(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0860: 基础循环
    DECLARE
        l_guard_0060 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0060 := l_guard_0060 + 1;
            l_a := l_a + l_guard_0060;
            EXIT WHEN l_guard_0060 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0861: 赋值与分支
    l_a := l_a + 861;
    IF l_a > 861 THEN
        l_b := l_b + 1;
    ELSIF l_a = 861 THEN
        l_c := 0;
    ELSE
        l_b := 1722;
    END IF;

    -- 段落 0862: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0086;

    -- ==================== [0087] 成员过程 ====================
    PROCEDURE pr_impl_0087(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0870: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0871: 条件循环
    WHILE l_a > 871 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0872: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0087;

    -- ==================== [0088] 成员函数 ====================
    FUNCTION fn_impl_0088(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0880: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0881: 赋值与分支
    l_a := l_a + 881;
    IF l_a > 881 THEN
        l_b := l_b + 1;
    ELSIF l_a = 881 THEN
        l_c := 0;
    ELSE
        l_b := 1762;
    END IF;

    -- 段落 0882: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0088;

    -- ==================== [0089] 成员过程 ====================
    PROCEDURE pr_impl_0089(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0890: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0891: 条件循环
    WHILE l_a > 891 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0892: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0089;

    -- ==================== [0090] 复杂成员 ====================
    PROCEDURE pr_cx_0090(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0090(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0090(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0090;
        BEGIN
            l_inner := p_v;
            sub_proc_0090(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0090;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0090 IS
        BEGIN
            NULL;
        END legacy_cx_0090;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0090(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0090;

    -- ==================== [0091] 成员过程 ====================
    PROCEDURE pr_impl_0091(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0910: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0911: 条件循环
    WHILE l_a > 911 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0912: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0091;

    -- ==================== [0092] 成员函数 ====================
    FUNCTION fn_impl_0092(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0920: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0921: 赋值与分支
    l_a := l_a + 921;
    IF l_a > 921 THEN
        l_b := l_b + 1;
    ELSIF l_a = 921 THEN
        l_c := 0;
    ELSE
        l_b := 1842;
    END IF;

    -- 段落 0922: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0092;

    -- ==================== [0093] 成员过程 ====================
    PROCEDURE pr_impl_0093(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0930: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0931: 条件循环
    WHILE l_a > 931 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0932: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0093;

    -- ==================== [0094] 成员函数 ====================
    FUNCTION fn_impl_0094(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0940: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0941: 赋值与分支
    l_a := l_a + 941;
    IF l_a > 941 THEN
        l_b := l_b + 1;
    ELSIF l_a = 941 THEN
        l_c := 0;
    ELSE
        l_b := 1882;
    END IF;

    -- 段落 0942: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0094;

    -- ==================== [0095] 成员过程 ====================
    PROCEDURE pr_impl_0095(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0950: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0951: 条件循环
    WHILE l_a > 951 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0952: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0095;

    -- ==================== [0096] 复杂成员 ====================
    PROCEDURE pr_cx_0096(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0096(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0096(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0096;
        BEGIN
            l_inner := p_v;
            sub_proc_0096(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0096;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0096 IS
        BEGIN
            NULL;
        END legacy_cx_0096;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0096(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0096;

    -- ==================== [0097] 成员过程 ====================
    PROCEDURE pr_impl_0097(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0970: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0971: 条件循环
    WHILE l_a > 971 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0972: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0097;

    -- ==================== [0098] 成员函数 ====================
    FUNCTION fn_impl_0098(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0980: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0981: 赋值与分支
    l_a := l_a + 981;
    IF l_a > 981 THEN
        l_b := l_b + 1;
    ELSIF l_a = 981 THEN
        l_c := 0;
    ELSE
        l_b := 1962;
    END IF;

    -- 段落 0982: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0098;

    -- ==================== [0099] 成员过程 ====================
    PROCEDURE pr_impl_0099(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 0990: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 0991: 条件循环
    WHILE l_a > 991 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 0992: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0099;

    -- ==================== [0100] 成员函数 ====================
    FUNCTION fn_impl_0100(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1000: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1001: 赋值与分支
    l_a := l_a + 1001;
    IF l_a > 1001 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1001 THEN
        l_c := 0;
    ELSE
        l_b := 2002;
    END IF;

    -- 段落 1002: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0100;

    -- ==================== [0101] 成员过程 ====================
    PROCEDURE pr_impl_0101(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1010: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1011: 条件循环
    WHILE l_a > 1011 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1012: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0101;

    -- ==================== [0102] 复杂成员 ====================
    PROCEDURE pr_cx_0102(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0102(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0102(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0102;
        BEGIN
            l_inner := p_v;
            sub_proc_0102(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0102;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0102 IS
        BEGIN
            NULL;
        END legacy_cx_0102;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0102(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0102;

    -- ==================== [0103] 成员过程 ====================
    PROCEDURE pr_impl_0103(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1030: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1031: 条件循环
    WHILE l_a > 1031 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1032: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0103;

    -- ==================== [0104] 成员函数 ====================
    FUNCTION fn_impl_0104(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1040: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1041: 赋值与分支
    l_a := l_a + 1041;
    IF l_a > 1041 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1041 THEN
        l_c := 0;
    ELSE
        l_b := 2082;
    END IF;

    -- 段落 1042: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0104;

    -- ==================== [0105] 成员过程 ====================
    PROCEDURE pr_impl_0105(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1050: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1051: 条件循环
    WHILE l_a > 1051 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1052: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0105;

    -- ==================== [0106] 成员函数 ====================
    FUNCTION fn_impl_0106(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1060: 基础循环
    DECLARE
        l_guard_0060 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0060 := l_guard_0060 + 1;
            l_a := l_a + l_guard_0060;
            EXIT WHEN l_guard_0060 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1061: 赋值与分支
    l_a := l_a + 1061;
    IF l_a > 1061 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1061 THEN
        l_c := 0;
    ELSE
        l_b := 2122;
    END IF;

    -- 段落 1062: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0106;

    -- ==================== [0107] 成员过程 ====================
    PROCEDURE pr_impl_0107(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1070: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1071: 条件循环
    WHILE l_a > 1071 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1072: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0107;

    -- ==================== [0108] 复杂成员 ====================
    PROCEDURE pr_cx_0108(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0108(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0108(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0108;
        BEGIN
            l_inner := p_v;
            sub_proc_0108(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0108;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0108 IS
        BEGIN
            NULL;
        END legacy_cx_0108;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0108(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0108;

    -- ==================== [0109] 成员过程 ====================
    PROCEDURE pr_impl_0109(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1090: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1091: 条件循环
    WHILE l_a > 1091 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1092: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0109;

    -- ==================== [0110] 成员函数 ====================
    FUNCTION fn_impl_0110(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1100: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1101: 赋值与分支
    l_a := l_a + 1101;
    IF l_a > 1101 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1101 THEN
        l_c := 0;
    ELSE
        l_b := 2202;
    END IF;

    -- 段落 1102: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0110;

    -- ==================== [0111] 成员过程 ====================
    PROCEDURE pr_impl_0111(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1110: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1111: 条件循环
    WHILE l_a > 1111 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1112: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0111;

    -- ==================== [0112] 成员函数 ====================
    FUNCTION fn_impl_0112(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1120: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1121: 赋值与分支
    l_a := l_a + 1121;
    IF l_a > 1121 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1121 THEN
        l_c := 0;
    ELSE
        l_b := 2242;
    END IF;

    -- 段落 1122: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0112;

    -- ==================== [0113] 成员过程 ====================
    PROCEDURE pr_impl_0113(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1130: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1131: 条件循环
    WHILE l_a > 1131 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1132: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0113;

    -- ==================== [0114] 复杂成员 ====================
    PROCEDURE pr_cx_0114(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0114(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0114(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0114;
        BEGIN
            l_inner := p_v;
            sub_proc_0114(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0114;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0114 IS
        BEGIN
            NULL;
        END legacy_cx_0114;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0114(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0114;

    -- ==================== [0115] 成员过程 ====================
    PROCEDURE pr_impl_0115(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1150: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1151: 条件循环
    WHILE l_a > 1151 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1152: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0115;

    -- ==================== [0116] 成员函数 ====================
    FUNCTION fn_impl_0116(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1160: 基础循环
    DECLARE
        l_guard_0060 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0060 := l_guard_0060 + 1;
            l_a := l_a + l_guard_0060;
            EXIT WHEN l_guard_0060 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1161: 赋值与分支
    l_a := l_a + 1161;
    IF l_a > 1161 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1161 THEN
        l_c := 0;
    ELSE
        l_b := 2322;
    END IF;

    -- 段落 1162: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0116;

    -- ==================== [0117] 成员过程 ====================
    PROCEDURE pr_impl_0117(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1170: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1171: 条件循环
    WHILE l_a > 1171 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1172: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0117;

    -- ==================== [0118] 成员函数 ====================
    FUNCTION fn_impl_0118(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1180: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1181: 赋值与分支
    l_a := l_a + 1181;
    IF l_a > 1181 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1181 THEN
        l_c := 0;
    ELSE
        l_b := 2362;
    END IF;

    -- 段落 1182: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0118;

    -- ==================== [0119] 成员过程 ====================
    PROCEDURE pr_impl_0119(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1190: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1191: 条件循环
    WHILE l_a > 1191 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1192: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0119;

    -- ==================== [0120] 复杂成员 ====================
    PROCEDURE pr_cx_0120(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0120(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0120(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0120;
        BEGIN
            l_inner := p_v;
            sub_proc_0120(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0120;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0120 IS
        BEGIN
            NULL;
        END legacy_cx_0120;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0120(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0120;

    -- ==================== [0121] 成员过程 ====================
    PROCEDURE pr_impl_0121(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1210: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1211: 条件循环
    WHILE l_a > 1211 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1212: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0121;

    -- ==================== [0122] 成员函数 ====================
    FUNCTION fn_impl_0122(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1220: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1221: 赋值与分支
    l_a := l_a + 1221;
    IF l_a > 1221 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1221 THEN
        l_c := 0;
    ELSE
        l_b := 2442;
    END IF;

    -- 段落 1222: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0122;

    -- ==================== [0123] 成员过程 ====================
    PROCEDURE pr_impl_0123(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1230: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1231: 条件循环
    WHILE l_a > 1231 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1232: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0123;

    -- ==================== [0124] 成员函数 ====================
    FUNCTION fn_impl_0124(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1240: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1241: 赋值与分支
    l_a := l_a + 1241;
    IF l_a > 1241 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1241 THEN
        l_c := 0;
    ELSE
        l_b := 2482;
    END IF;

    -- 段落 1242: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0124;

    -- ==================== [0125] 成员过程 ====================
    PROCEDURE pr_impl_0125(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1250: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1251: 条件循环
    WHILE l_a > 1251 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1252: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0125;

    -- ==================== [0126] 复杂成员 ====================
    PROCEDURE pr_cx_0126(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0126(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0126(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0126;
        BEGIN
            l_inner := p_v;
            sub_proc_0126(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0126;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0126 IS
        BEGIN
            NULL;
        END legacy_cx_0126;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0126(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0126;

    -- ==================== [0127] 成员过程 ====================
    PROCEDURE pr_impl_0127(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1270: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1271: 条件循环
    WHILE l_a > 1271 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1272: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0127;

    -- ==================== [0128] 成员函数 ====================
    FUNCTION fn_impl_0128(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1280: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1281: 赋值与分支
    l_a := l_a + 1281;
    IF l_a > 1281 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1281 THEN
        l_c := 0;
    ELSE
        l_b := 2562;
    END IF;

    -- 段落 1282: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0128;

    -- ==================== [0129] 成员过程 ====================
    PROCEDURE pr_impl_0129(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1290: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1291: 条件循环
    WHILE l_a > 1291 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1292: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0129;

    -- ==================== [0130] 成员函数 ====================
    FUNCTION fn_impl_0130(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1300: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1301: 赋值与分支
    l_a := l_a + 1301;
    IF l_a > 1301 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1301 THEN
        l_c := 0;
    ELSE
        l_b := 2602;
    END IF;

    -- 段落 1302: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0130;

    -- ==================== [0131] 成员过程 ====================
    PROCEDURE pr_impl_0131(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1310: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1311: 条件循环
    WHILE l_a > 1311 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1312: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0131;

    -- ==================== [0132] 复杂成员 ====================
    PROCEDURE pr_cx_0132(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0132(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0132(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0132;
        BEGIN
            l_inner := p_v;
            sub_proc_0132(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0132;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0132 IS
        BEGIN
            NULL;
        END legacy_cx_0132;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0132(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0132;

    -- ==================== [0133] 成员过程 ====================
    PROCEDURE pr_impl_0133(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1330: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1331: 条件循环
    WHILE l_a > 1331 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1332: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0133;

    -- ==================== [0134] 成员函数 ====================
    FUNCTION fn_impl_0134(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1340: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1341: 赋值与分支
    l_a := l_a + 1341;
    IF l_a > 1341 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1341 THEN
        l_c := 0;
    ELSE
        l_b := 2682;
    END IF;

    -- 段落 1342: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0134;

    -- ==================== [0135] 成员过程 ====================
    PROCEDURE pr_impl_0135(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1350: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1351: 条件循环
    WHILE l_a > 1351 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1352: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0135;

    -- ==================== [0136] 成员函数 ====================
    FUNCTION fn_impl_0136(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1360: 基础循环
    DECLARE
        l_guard_0060 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0060 := l_guard_0060 + 1;
            l_a := l_a + l_guard_0060;
            EXIT WHEN l_guard_0060 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1361: 赋值与分支
    l_a := l_a + 1361;
    IF l_a > 1361 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1361 THEN
        l_c := 0;
    ELSE
        l_b := 2722;
    END IF;

    -- 段落 1362: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0136;

    -- ==================== [0137] 成员过程 ====================
    PROCEDURE pr_impl_0137(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1370: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1371: 条件循环
    WHILE l_a > 1371 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1372: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0137;

    -- ==================== [0138] 复杂成员 ====================
    PROCEDURE pr_cx_0138(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0138(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0138(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0138;
        BEGIN
            l_inner := p_v;
            sub_proc_0138(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0138;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0138 IS
        BEGIN
            NULL;
        END legacy_cx_0138;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0138(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0138;

    -- ==================== [0139] 成员过程 ====================
    PROCEDURE pr_impl_0139(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1390: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1391: 条件循环
    WHILE l_a > 1391 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1392: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0139;

    -- ==================== [0140] 成员函数 ====================
    FUNCTION fn_impl_0140(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1400: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1401: 赋值与分支
    l_a := l_a + 1401;
    IF l_a > 1401 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1401 THEN
        l_c := 0;
    ELSE
        l_b := 2802;
    END IF;

    -- 段落 1402: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0140;

    -- ==================== [0141] 成员过程 ====================
    PROCEDURE pr_impl_0141(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1410: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1411: 条件循环
    WHILE l_a > 1411 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1412: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0141;

    -- ==================== [0142] 成员函数 ====================
    FUNCTION fn_impl_0142(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1420: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1421: 赋值与分支
    l_a := l_a + 1421;
    IF l_a > 1421 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1421 THEN
        l_c := 0;
    ELSE
        l_b := 2842;
    END IF;

    -- 段落 1422: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0142;

    -- ==================== [0143] 成员过程 ====================
    PROCEDURE pr_impl_0143(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1430: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1431: 条件循环
    WHILE l_a > 1431 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1432: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0143;

    -- ==================== [0144] 复杂成员 ====================
    PROCEDURE pr_cx_0144(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0144(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0144(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0144;
        BEGIN
            l_inner := p_v;
            sub_proc_0144(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0144;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0144 IS
        BEGIN
            NULL;
        END legacy_cx_0144;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0144(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0144;

    -- ==================== [0145] 成员过程 ====================
    PROCEDURE pr_impl_0145(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1450: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1451: 条件循环
    WHILE l_a > 1451 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1452: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0145;

    -- ==================== [0146] 成员函数 ====================
    FUNCTION fn_impl_0146(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1460: 基础循环
    DECLARE
        l_guard_0060 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0060 := l_guard_0060 + 1;
            l_a := l_a + l_guard_0060;
            EXIT WHEN l_guard_0060 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1461: 赋值与分支
    l_a := l_a + 1461;
    IF l_a > 1461 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1461 THEN
        l_c := 0;
    ELSE
        l_b := 2922;
    END IF;

    -- 段落 1462: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0146;

    -- ==================== [0147] 成员过程 ====================
    PROCEDURE pr_impl_0147(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1470: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1471: 条件循环
    WHILE l_a > 1471 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1472: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0147;

    -- ==================== [0148] 成员函数 ====================
    FUNCTION fn_impl_0148(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1480: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1481: 赋值与分支
    l_a := l_a + 1481;
    IF l_a > 1481 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1481 THEN
        l_c := 0;
    ELSE
        l_b := 2962;
    END IF;

    -- 段落 1482: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0148;

    -- ==================== [0149] 成员过程 ====================
    PROCEDURE pr_impl_0149(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1490: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1491: 条件循环
    WHILE l_a > 1491 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1492: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0149;

    -- ==================== [0150] 复杂成员 ====================
    PROCEDURE pr_cx_0150(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0150(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0150(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0150;
        BEGIN
            l_inner := p_v;
            sub_proc_0150(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0150;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0150 IS
        BEGIN
            NULL;
        END legacy_cx_0150;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0150(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0150;

    -- ==================== [0151] 成员过程 ====================
    PROCEDURE pr_impl_0151(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1510: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1511: 条件循环
    WHILE l_a > 1511 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1512: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0151;

    -- ==================== [0152] 成员函数 ====================
    FUNCTION fn_impl_0152(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1520: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1521: 赋值与分支
    l_a := l_a + 1521;
    IF l_a > 1521 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1521 THEN
        l_c := 0;
    ELSE
        l_b := 3042;
    END IF;

    -- 段落 1522: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0152;

    -- ==================== [0153] 成员过程 ====================
    PROCEDURE pr_impl_0153(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1530: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1531: 条件循环
    WHILE l_a > 1531 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1532: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0153;

    -- ==================== [0154] 成员函数 ====================
    FUNCTION fn_impl_0154(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1540: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1541: 赋值与分支
    l_a := l_a + 1541;
    IF l_a > 1541 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1541 THEN
        l_c := 0;
    ELSE
        l_b := 3082;
    END IF;

    -- 段落 1542: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0154;

    -- ==================== [0155] 成员过程 ====================
    PROCEDURE pr_impl_0155(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1550: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1551: 条件循环
    WHILE l_a > 1551 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1552: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0155;

    -- ==================== [0156] 复杂成员 ====================
    PROCEDURE pr_cx_0156(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0156(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0156(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0156;
        BEGIN
            l_inner := p_v;
            sub_proc_0156(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0156;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0156 IS
        BEGIN
            NULL;
        END legacy_cx_0156;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0156(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0156;

    -- ==================== [0157] 成员过程 ====================
    PROCEDURE pr_impl_0157(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1570: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1571: 条件循环
    WHILE l_a > 1571 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1572: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0157;

    -- ==================== [0158] 成员函数 ====================
    FUNCTION fn_impl_0158(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1580: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1581: 赋值与分支
    l_a := l_a + 1581;
    IF l_a > 1581 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1581 THEN
        l_c := 0;
    ELSE
        l_b := 3162;
    END IF;

    -- 段落 1582: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0158;

    -- ==================== [0159] 成员过程 ====================
    PROCEDURE pr_impl_0159(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1590: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1591: 条件循环
    WHILE l_a > 1591 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1592: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0159;

    -- ==================== [0160] 成员函数 ====================
    FUNCTION fn_impl_0160(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1600: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1601: 赋值与分支
    l_a := l_a + 1601;
    IF l_a > 1601 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1601 THEN
        l_c := 0;
    ELSE
        l_b := 3202;
    END IF;

    -- 段落 1602: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0160;

    -- ==================== [0161] 成员过程 ====================
    PROCEDURE pr_impl_0161(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1610: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1611: 条件循环
    WHILE l_a > 1611 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1612: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0161;

    -- ==================== [0162] 复杂成员 ====================
    PROCEDURE pr_cx_0162(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0162(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0162(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0162;
        BEGIN
            l_inner := p_v;
            sub_proc_0162(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0162;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0162 IS
        BEGIN
            NULL;
        END legacy_cx_0162;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0162(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0162;

    -- ==================== [0163] 成员过程 ====================
    PROCEDURE pr_impl_0163(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1630: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1631: 条件循环
    WHILE l_a > 1631 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1632: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0163;

    -- ==================== [0164] 成员函数 ====================
    FUNCTION fn_impl_0164(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1640: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1641: 赋值与分支
    l_a := l_a + 1641;
    IF l_a > 1641 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1641 THEN
        l_c := 0;
    ELSE
        l_b := 3282;
    END IF;

    -- 段落 1642: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0164;

    -- ==================== [0165] 成员过程 ====================
    PROCEDURE pr_impl_0165(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1650: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1651: 条件循环
    WHILE l_a > 1651 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1652: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0165;

    -- ==================== [0166] 成员函数 ====================
    FUNCTION fn_impl_0166(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1660: 基础循环
    DECLARE
        l_guard_0060 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0060 := l_guard_0060 + 1;
            l_a := l_a + l_guard_0060;
            EXIT WHEN l_guard_0060 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1661: 赋值与分支
    l_a := l_a + 1661;
    IF l_a > 1661 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1661 THEN
        l_c := 0;
    ELSE
        l_b := 3322;
    END IF;

    -- 段落 1662: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0166;

    -- ==================== [0167] 成员过程 ====================
    PROCEDURE pr_impl_0167(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1670: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1671: 条件循环
    WHILE l_a > 1671 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1672: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0167;

    -- ==================== [0168] 复杂成员 ====================
    PROCEDURE pr_cx_0168(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0168(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0168(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0168;
        BEGIN
            l_inner := p_v;
            sub_proc_0168(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0168;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0168 IS
        BEGIN
            NULL;
        END legacy_cx_0168;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0168(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0168;

    -- ==================== [0169] 成员过程 ====================
    PROCEDURE pr_impl_0169(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1690: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1691: 条件循环
    WHILE l_a > 1691 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1692: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0169;

    -- ==================== [0170] 成员函数 ====================
    FUNCTION fn_impl_0170(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1700: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1701: 赋值与分支
    l_a := l_a + 1701;
    IF l_a > 1701 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1701 THEN
        l_c := 0;
    ELSE
        l_b := 3402;
    END IF;

    -- 段落 1702: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0170;

    -- ==================== [0171] 成员过程 ====================
    PROCEDURE pr_impl_0171(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1710: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1711: 条件循环
    WHILE l_a > 1711 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1712: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0171;

    -- ==================== [0172] 成员函数 ====================
    FUNCTION fn_impl_0172(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1720: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1721: 赋值与分支
    l_a := l_a + 1721;
    IF l_a > 1721 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1721 THEN
        l_c := 0;
    ELSE
        l_b := 3442;
    END IF;

    -- 段落 1722: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0172;

    -- ==================== [0173] 成员过程 ====================
    PROCEDURE pr_impl_0173(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1730: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1731: 条件循环
    WHILE l_a > 1731 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1732: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0173;

    -- ==================== [0174] 复杂成员 ====================
    PROCEDURE pr_cx_0174(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0174(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0174(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0174;
        BEGIN
            l_inner := p_v;
            sub_proc_0174(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0174;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0174 IS
        BEGIN
            NULL;
        END legacy_cx_0174;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0174(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0174;

    -- ==================== [0175] 成员过程 ====================
    PROCEDURE pr_impl_0175(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1750: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1751: 条件循环
    WHILE l_a > 1751 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1752: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0175;

    -- ==================== [0176] 成员函数 ====================
    FUNCTION fn_impl_0176(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1760: 基础循环
    DECLARE
        l_guard_0060 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0060 := l_guard_0060 + 1;
            l_a := l_a + l_guard_0060;
            EXIT WHEN l_guard_0060 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1761: 赋值与分支
    l_a := l_a + 1761;
    IF l_a > 1761 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1761 THEN
        l_c := 0;
    ELSE
        l_b := 3522;
    END IF;

    -- 段落 1762: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0176;

    -- ==================== [0177] 成员过程 ====================
    PROCEDURE pr_impl_0177(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1770: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1771: 条件循环
    WHILE l_a > 1771 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1772: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0177;

    -- ==================== [0178] 成员函数 ====================
    FUNCTION fn_impl_0178(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1780: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1781: 赋值与分支
    l_a := l_a + 1781;
    IF l_a > 1781 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1781 THEN
        l_c := 0;
    ELSE
        l_b := 3562;
    END IF;

    -- 段落 1782: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0178;

    -- ==================== [0179] 成员过程 ====================
    PROCEDURE pr_impl_0179(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1790: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1791: 条件循环
    WHILE l_a > 1791 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1792: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0179;

    -- ==================== [0180] 复杂成员 ====================
    PROCEDURE pr_cx_0180(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0180(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0180(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0180;
        BEGIN
            l_inner := p_v;
            sub_proc_0180(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0180;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0180 IS
        BEGIN
            NULL;
        END legacy_cx_0180;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0180(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0180;

    -- ==================== [0181] 成员过程 ====================
    PROCEDURE pr_impl_0181(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1810: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1811: 条件循环
    WHILE l_a > 1811 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1812: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0181;

    -- ==================== [0182] 成员函数 ====================
    FUNCTION fn_impl_0182(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1820: 基础循环
    DECLARE
        l_guard_0020 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0020 := l_guard_0020 + 1;
            l_a := l_a + l_guard_0020;
            EXIT WHEN l_guard_0020 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1821: 赋值与分支
    l_a := l_a + 1821;
    IF l_a > 1821 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1821 THEN
        l_c := 0;
    ELSE
        l_b := 3642;
    END IF;

    -- 段落 1822: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0182;

    -- ==================== [0183] 成员过程 ====================
    PROCEDURE pr_impl_0183(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1830: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1831: 条件循环
    WHILE l_a > 1831 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1832: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0183;

    -- ==================== [0184] 成员函数 ====================
    FUNCTION fn_impl_0184(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1840: 基础循环
    DECLARE
        l_guard_0040 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0040 := l_guard_0040 + 1;
            l_a := l_a + l_guard_0040;
            EXIT WHEN l_guard_0040 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1841: 赋值与分支
    l_a := l_a + 1841;
    IF l_a > 1841 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1841 THEN
        l_c := 0;
    ELSE
        l_b := 3682;
    END IF;

    -- 段落 1842: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0184;

    -- ==================== [0185] 成员过程 ====================
    PROCEDURE pr_impl_0185(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1850: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1851: 条件循环
    WHILE l_a > 1851 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1852: 基础循环
    DECLARE
        l_guard_0052 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0052 := l_guard_0052 + 1;
            l_a := l_a + l_guard_0052;
            EXIT WHEN l_guard_0052 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0185;

    -- ==================== [0186] 复杂成员 ====================
    PROCEDURE pr_cx_0186(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0186(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0186(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0186;
        BEGIN
            l_inner := p_v;
            sub_proc_0186(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0186;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0186 IS
        BEGIN
            NULL;
        END legacy_cx_0186;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0186(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0186;

    -- ==================== [0187] 成员过程 ====================
    PROCEDURE pr_impl_0187(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1870: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1871: 条件循环
    WHILE l_a > 1871 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1872: 基础循环
    DECLARE
        l_guard_0072 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0072 := l_guard_0072 + 1;
            l_a := l_a + l_guard_0072;
            EXIT WHEN l_guard_0072 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0187;

    -- ==================== [0188] 成员函数 ====================
    FUNCTION fn_impl_0188(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1880: 基础循环
    DECLARE
        l_guard_0080 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0080 := l_guard_0080 + 1;
            l_a := l_a + l_guard_0080;
            EXIT WHEN l_guard_0080 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1881: 赋值与分支
    l_a := l_a + 1881;
    IF l_a > 1881 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1881 THEN
        l_c := 0;
    ELSE
        l_b := 3762;
    END IF;

    -- 段落 1882: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0188;

    -- ==================== [0189] 成员过程 ====================
    PROCEDURE pr_impl_0189(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1890: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1891: 条件循环
    WHILE l_a > 1891 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1892: 基础循环
    DECLARE
        l_guard_0092 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0092 := l_guard_0092 + 1;
            l_a := l_a + l_guard_0092;
            EXIT WHEN l_guard_0092 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0189;

    -- ==================== [0190] 成员函数 ====================
    FUNCTION fn_impl_0190(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) RETURN NUMBER IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1900: 基础循环
    DECLARE
        l_guard_0000 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0000 := l_guard_0000 + 1;
            l_a := l_a + l_guard_0000;
            EXIT WHEN l_guard_0000 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1901: 赋值与分支
    l_a := l_a + 1901;
    IF l_a > 1901 THEN
        l_b := l_b + 1;
    ELSIF l_a = 1901 THEN
        l_c := 0;
    ELSE
        l_b := 3802;
    END IF;

    -- 段落 1902: 计数循环
    FOR k IN 1 .. 5 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END fn_impl_0190;

    -- ==================== [0191] 成员过程 ====================
    PROCEDURE pr_impl_0191(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1910: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1911: 条件循环
    WHILE l_a > 1911 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1912: 基础循环
    DECLARE
        l_guard_0012 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0012 := l_guard_0012 + 1;
            l_a := l_a + l_guard_0012;
            EXIT WHEN l_guard_0012 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0191;

    -- ==================== [0192] 复杂成员 ====================
    PROCEDURE pr_cx_0192(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 0;
        l_b  NUMBER := 0;

        -- 嵌套子程序: 函数 > 过程(2 层)
        FUNCTION sub_fn_0192(p_v IN NUMBER) RETURN NUMBER IS
            l_inner  NUMBER;

            PROCEDURE sub_proc_0192(p_v2 IN OUT NUMBER) IS
            BEGIN
                IF p_v2 < 0 THEN
                    p_v2 := 0;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_proc_0192;
        BEGIN
            l_inner := p_v;
            sub_proc_0192(l_inner);
            RETURN l_inner * 2;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN -1;
        END sub_fn_0192;
    BEGIN
        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR a IN 1 .. 3 LOOP
            WHILE l_a < 10 LOOP
                FOR b IN 1 .. 2 LOOP
                    l_a := l_a + a * b;
                END LOOP;
            END LOOP;
            l_a := 0;
        END LOOP;

        -- 被注释掉的代码结构(不应出现在大纲)
        -- IF l_b > 100 THEN
        --     l_b := 100;
        -- END IF;
        /*
        PROCEDURE legacy_cx_0192 IS
        BEGIN
            NULL;
        END legacy_cx_0192;
        */

        -- 体内内联匿名块
        DECLARE
            l_local  NUMBER := 0;
        BEGIN
            FOR q IN 1 .. 3 LOOP
                l_local := l_local + q;
            END LOOP;
            l_b := l_b + l_local;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END;

        p_out := sub_fn_0192(p_in) + l_b;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
    END pr_cx_0192;

    -- ==================== [0193] 成员过程 ====================
    PROCEDURE pr_impl_0193(
        p_in  IN  NUMBER,
        p_out OUT NUMBER
    ) IS
        l_a  NUMBER := 1;
        l_b  NUMBER := 2;
        l_c  NUMBER := 0;
        l_d  NUMBER := 0;
    BEGIN
    -- 段落 1930: 计数循环
    FOR k IN 1 .. 3 LOOP
        l_a := l_a + k;
        IF MOD(k, 2) = 0 THEN
            l_b := l_b + 1;
        END IF;
    END LOOP;

    -- 段落 1931: 条件循环
    WHILE l_a > 1931 LOOP
        l_a := l_a - 1;
        l_b := l_b + 2;
    END LOOP;

    -- 段落 1932: 基础循环
    DECLARE
        l_guard_0032 NUMBER := 0;
    BEGIN
        LOOP
            l_guard_0032 := l_guard_0032 + 1;
            l_a := l_a + l_guard_0032;
            EXIT WHEN l_guard_0032 >= 2;
        END LOOP;
        l_b := l_b + 1;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

        p_out := l_a + l_b + l_c + l_d;
        RETURN 0;
    EXCEPTION
        WHEN OTHERS THEN
            p_out := -1;
            RETURN -1;
    END pr_impl_0193;

    -- ======================= 包初始化块 =======================
BEGIN
    g_run_id := g_run_id + 1;
    g_last_run := SYSDATE;

    IF g_run_id > 0 THEN
        g_run_id := g_run_id * 2;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        g_run_id := -1;
END pkg_long_api_cx;
/

-- =============================================================================
-- 用例: 匿名块 BEGIN..END(顶层裸 BEGIN, Issue #5) / 长代码+复杂结构 (anonymous/anon_begin_long_complex.sql)
-- 本文件由 ZCodeTest/generate-long.js 确定性生成(10,000+ 行), 请勿手工编辑;
-- 再生: node ZCodeTest/generate-long.js
-- 覆盖: 无 DECLARE 区: 复杂度经内联 DECLARE 块(含嵌套子程序)表达
-- 覆盖: 复杂段落轮转: 自包含3层循环/注释风暴/内联匿名块(嵌套子程序+CASE ELSE+Q-quote)
-- 覆盖: 顶层 EXCEPTION
-- =============================================================================
BEGIN
    -- ========== 长代码区段 0001 ==========
    -- 段落 0001: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0001 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0002: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0002 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0003: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (3, 'seg-0003');

    -- 段落 0004: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0004 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0005: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0005 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0006: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (6, 'seg-0006');

    -- 段落 0007: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0007 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0008: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0008 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0009: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0010: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0010 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0011: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0011 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0012: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (12, 'seg-0012');

    -- 段落 0013: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0013 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0014: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0014 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0015: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (15, 'seg-0015');

    -- 段落 0016: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0016 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0017: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0017 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0018: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0018 NUMBER := 0;

        PROCEDURE sub_step_0018(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0018(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0018 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0018;
        BEGIN
            sub_step_inner_0018(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0018;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0018 := v_acc_0018 + k;
            sub_step_0018(k);
        END LOOP;

        CASE MOD(v_acc_0018, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0018]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0019: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0019 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0020: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0020 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0021: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (21, 'seg-0021');

    -- 段落 0022: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0022 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0023: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0023 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0024: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (24, 'seg-0024');

    -- 段落 0025: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0025 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0026: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0026 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0027: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0027 NUMBER := 0;

        PROCEDURE sub_step_0027(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0027(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0027 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0027;
        BEGIN
            sub_step_inner_0027(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0027;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0027 := v_acc_0027 + k;
            sub_step_0027(k);
        END LOOP;

        CASE MOD(v_acc_0027, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0027]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0028: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0028 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0029: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0029 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0030: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (30, 'seg-0030');

    -- 段落 0031: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0031 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0032: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0032 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0033: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (33, 'seg-0033');

    -- 段落 0034: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0034 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0035: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0035 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0036: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0037: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0037 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0038: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0038 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0039: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (39, 'seg-0039');

    -- 段落 0040: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0040 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0041 ==========
    -- 段落 0041: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0041 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0042: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (42, 'seg-0042');

    -- 段落 0043: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0043 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0044: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0044 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0045: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0046: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0046 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0047: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0047 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0048: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (48, 'seg-0048');

    -- 段落 0049: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0049 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0050: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0050 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0051: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (51, 'seg-0051');

    -- 段落 0052: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0052 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0053: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0053 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0054: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0055: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0055 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0056: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0056 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0057: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (57, 'seg-0057');

    -- 段落 0058: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0058 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0059: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0059 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0060: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (60, 'seg-0060');

    -- 段落 0061: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0061 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0062: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0062 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0063: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0063 NUMBER := 0;

        PROCEDURE sub_step_0063(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0063(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0063 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0063;
        BEGIN
            sub_step_inner_0063(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0063;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0063 := v_acc_0063 + k;
            sub_step_0063(k);
        END LOOP;

        CASE MOD(v_acc_0063, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0063]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0064: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0064 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0065: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0065 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0066: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (66, 'seg-0066');

    -- 段落 0067: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0067 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0068: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0068 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0069: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (69, 'seg-0069');

    -- 段落 0070: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0070 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0071: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0071 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0072: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0072 NUMBER := 0;

        PROCEDURE sub_step_0072(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0072(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0072 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0072;
        BEGIN
            sub_step_inner_0072(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0072;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0072 := v_acc_0072 + k;
            sub_step_0072(k);
        END LOOP;

        CASE MOD(v_acc_0072, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0072]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0073: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0073 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0074: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0074 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0075: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (75, 'seg-0075');

    -- 段落 0076: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0076 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0077: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0077 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0078: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (78, 'seg-0078');

    -- 段落 0079: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0079 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0080: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0080 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0081: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0082: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0082 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0083: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0083 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0084: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (84, 'seg-0084');

    -- 段落 0085: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0085 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0086: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0086 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0087: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (87, 'seg-0087');

    -- 段落 0088: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0088 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0089: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0089 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0090: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0091: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0091 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0092: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0092 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0093: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (93, 'seg-0093');

    -- 段落 0094: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0094 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0095: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0095 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0096: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (96, 'seg-0096');

    -- 段落 0097: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0097 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0098: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0098 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0099: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0100: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0100 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0101: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0101 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0102: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (102, 'seg-0102');

    -- 段落 0103: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0103 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0104: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0104 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0105: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (105, 'seg-0105');

    -- 段落 0106: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0106 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0107: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0107 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0108: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0108 NUMBER := 0;

        PROCEDURE sub_step_0108(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0108(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0108 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0108;
        BEGIN
            sub_step_inner_0108(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0108;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0108 := v_acc_0108 + k;
            sub_step_0108(k);
        END LOOP;

        CASE MOD(v_acc_0108, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0108]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0109: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0109 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0110: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0110 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0111: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (111, 'seg-0111');

    -- 段落 0112: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0112 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0113: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0113 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0114: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (114, 'seg-0114');

    -- 段落 0115: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0115 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0116: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0116 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0117: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0117 NUMBER := 0;

        PROCEDURE sub_step_0117(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0117(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0117 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0117;
        BEGIN
            sub_step_inner_0117(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0117;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0117 := v_acc_0117 + k;
            sub_step_0117(k);
        END LOOP;

        CASE MOD(v_acc_0117, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0117]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0118: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0118 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0119: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0119 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0120: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (120, 'seg-0120');

    -- ========== 长代码区段 0121 ==========
    -- 段落 0121: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0121 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0122: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0122 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0123: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (123, 'seg-0123');

    -- 段落 0124: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0124 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0125: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0125 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0126: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0127: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0127 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0128: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0128 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0129: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (129, 'seg-0129');

    -- 段落 0130: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0130 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0131: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0131 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0132: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (132, 'seg-0132');

    -- 段落 0133: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0133 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0134: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0134 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0135: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0136: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0136 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0137: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0137 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0138: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (138, 'seg-0138');

    -- 段落 0139: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0139 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0140: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0140 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0141: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (141, 'seg-0141');

    -- 段落 0142: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0142 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0143: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0143 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0144: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0145: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0145 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0146: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0146 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0147: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (147, 'seg-0147');

    -- 段落 0148: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0148 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0149: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0149 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0150: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (150, 'seg-0150');

    -- 段落 0151: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0151 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0152: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0152 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0153: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0153 NUMBER := 0;

        PROCEDURE sub_step_0153(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0153(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0153 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0153;
        BEGIN
            sub_step_inner_0153(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0153;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0153 := v_acc_0153 + k;
            sub_step_0153(k);
        END LOOP;

        CASE MOD(v_acc_0153, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0153]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0154: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0154 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0155: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0155 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0156: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (156, 'seg-0156');

    -- 段落 0157: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0157 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0158: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0158 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0159: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (159, 'seg-0159');

    -- 段落 0160: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0160 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0161 ==========
    -- 段落 0161: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0161 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0162: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0162 NUMBER := 0;

        PROCEDURE sub_step_0162(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0162(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0162 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0162;
        BEGIN
            sub_step_inner_0162(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0162;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0162 := v_acc_0162 + k;
            sub_step_0162(k);
        END LOOP;

        CASE MOD(v_acc_0162, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0162]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0163: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0163 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0164: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0164 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0165: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (165, 'seg-0165');

    -- 段落 0166: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0166 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0167: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0167 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0168: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (168, 'seg-0168');

    -- 段落 0169: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0169 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0170: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0170 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0171: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0172: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0172 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0173: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0173 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0174: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (174, 'seg-0174');

    -- 段落 0175: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0175 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0176: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0176 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0177: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (177, 'seg-0177');

    -- 段落 0178: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0178 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0179: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0179 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0180: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0181: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0181 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0182: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0182 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0183: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (183, 'seg-0183');

    -- 段落 0184: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0184 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0185: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0185 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0186: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (186, 'seg-0186');

    -- 段落 0187: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0187 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0188: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0188 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0189: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0190: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0190 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0191: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0191 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0192: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (192, 'seg-0192');

    -- 段落 0193: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0193 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0194: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0194 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0195: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (195, 'seg-0195');

    -- 段落 0196: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0196 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0197: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0197 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0198: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0198 NUMBER := 0;

        PROCEDURE sub_step_0198(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0198(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0198 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0198;
        BEGIN
            sub_step_inner_0198(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0198;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0198 := v_acc_0198 + k;
            sub_step_0198(k);
        END LOOP;

        CASE MOD(v_acc_0198, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0198]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0199: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0199 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0200: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0200 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0201 ==========
    -- 段落 0201: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (201, 'seg-0201');

    -- 段落 0202: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0202 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0203: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0203 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0204: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (204, 'seg-0204');

    -- 段落 0205: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0205 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0206: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0206 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0207: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0207 NUMBER := 0;

        PROCEDURE sub_step_0207(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0207(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0207 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0207;
        BEGIN
            sub_step_inner_0207(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0207;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0207 := v_acc_0207 + k;
            sub_step_0207(k);
        END LOOP;

        CASE MOD(v_acc_0207, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0207]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0208: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0208 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0209: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0209 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0210: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (210, 'seg-0210');

    -- 段落 0211: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0211 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0212: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0212 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0213: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (213, 'seg-0213');

    -- 段落 0214: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0214 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0215: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0215 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0216: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0217: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0217 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0218: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0218 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0219: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (219, 'seg-0219');

    -- 段落 0220: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0220 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0221: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0221 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0222: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (222, 'seg-0222');

    -- 段落 0223: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0223 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0224: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0224 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0225: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0226: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0226 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0227: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0227 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0228: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (228, 'seg-0228');

    -- 段落 0229: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0229 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0230: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0230 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0231: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (231, 'seg-0231');

    -- 段落 0232: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0232 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0233: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0233 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0234: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0235: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0235 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0236: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0236 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0237: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (237, 'seg-0237');

    -- 段落 0238: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0238 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0239: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0239 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0240: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (240, 'seg-0240');

    -- ========== 长代码区段 0241 ==========
    -- 段落 0241: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0241 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0242: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0242 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0243: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0243 NUMBER := 0;

        PROCEDURE sub_step_0243(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0243(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0243 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0243;
        BEGIN
            sub_step_inner_0243(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0243;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0243 := v_acc_0243 + k;
            sub_step_0243(k);
        END LOOP;

        CASE MOD(v_acc_0243, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0243]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0244: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0244 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0245: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0245 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0246: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (246, 'seg-0246');

    -- 段落 0247: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0247 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0248: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0248 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0249: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (249, 'seg-0249');

    -- 段落 0250: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0250 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0251: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0251 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0252: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0252 NUMBER := 0;

        PROCEDURE sub_step_0252(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0252(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0252 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0252;
        BEGIN
            sub_step_inner_0252(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0252;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0252 := v_acc_0252 + k;
            sub_step_0252(k);
        END LOOP;

        CASE MOD(v_acc_0252, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0252]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0253: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0253 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0254: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0254 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0255: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (255, 'seg-0255');

    -- 段落 0256: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0256 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0257: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0257 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0258: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (258, 'seg-0258');

    -- 段落 0259: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0259 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0260: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0260 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0261: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0262: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0262 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0263: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0263 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0264: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (264, 'seg-0264');

    -- 段落 0265: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0265 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0266: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0266 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0267: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (267, 'seg-0267');

    -- 段落 0268: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0268 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0269: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0269 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0270: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0271: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0271 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0272: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0272 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0273: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (273, 'seg-0273');

    -- 段落 0274: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0274 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0275: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0275 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0276: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (276, 'seg-0276');

    -- 段落 0277: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0277 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0278: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0278 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0279: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0280: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0280 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0281 ==========
    -- 段落 0281: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0281 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0282: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (282, 'seg-0282');

    -- 段落 0283: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0283 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0284: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0284 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0285: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (285, 'seg-0285');

    -- 段落 0286: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0286 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0287: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0287 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0288: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0288 NUMBER := 0;

        PROCEDURE sub_step_0288(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0288(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0288 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0288;
        BEGIN
            sub_step_inner_0288(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0288;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0288 := v_acc_0288 + k;
            sub_step_0288(k);
        END LOOP;

        CASE MOD(v_acc_0288, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0288]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0289: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0289 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0290: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0290 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0291: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (291, 'seg-0291');

    -- 段落 0292: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0292 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0293: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0293 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0294: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (294, 'seg-0294');

    -- 段落 0295: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0295 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0296: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0296 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0297: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0297 NUMBER := 0;

        PROCEDURE sub_step_0297(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0297(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0297 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0297;
        BEGIN
            sub_step_inner_0297(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0297;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0297 := v_acc_0297 + k;
            sub_step_0297(k);
        END LOOP;

        CASE MOD(v_acc_0297, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0297]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0298: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0298 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0299: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0299 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0300: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (300, 'seg-0300');

    -- 段落 0301: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0301 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0302: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0302 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0303: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (303, 'seg-0303');

    -- 段落 0304: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0304 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0305: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0305 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0306: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0307: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0307 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0308: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0308 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0309: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (309, 'seg-0309');

    -- 段落 0310: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0310 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0311: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0311 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0312: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (312, 'seg-0312');

    -- 段落 0313: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0313 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0314: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0314 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0315: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0316: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0316 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0317: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0317 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0318: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (318, 'seg-0318');

    -- 段落 0319: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0319 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0320: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0320 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0321 ==========
    -- 段落 0321: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (321, 'seg-0321');

    -- 段落 0322: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0322 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0323: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0323 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0324: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0325: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0325 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0326: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0326 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0327: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (327, 'seg-0327');

    -- 段落 0328: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0328 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0329: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0329 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0330: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (330, 'seg-0330');

    -- 段落 0331: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0331 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0332: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0332 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0333: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0333 NUMBER := 0;

        PROCEDURE sub_step_0333(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0333(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0333 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0333;
        BEGIN
            sub_step_inner_0333(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0333;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0333 := v_acc_0333 + k;
            sub_step_0333(k);
        END LOOP;

        CASE MOD(v_acc_0333, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0333]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0334: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0334 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0335: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0335 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0336: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (336, 'seg-0336');

    -- 段落 0337: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0337 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0338: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0338 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0339: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (339, 'seg-0339');

    -- 段落 0340: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0340 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0341: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0341 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0342: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0342 NUMBER := 0;

        PROCEDURE sub_step_0342(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0342(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0342 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0342;
        BEGIN
            sub_step_inner_0342(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0342;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0342 := v_acc_0342 + k;
            sub_step_0342(k);
        END LOOP;

        CASE MOD(v_acc_0342, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0342]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0343: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0343 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0344: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0344 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0345: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (345, 'seg-0345');

    -- 段落 0346: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0346 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0347: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0347 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0348: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (348, 'seg-0348');

    -- 段落 0349: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0349 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0350: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0350 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0351: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0352: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0352 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0353: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0353 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0354: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (354, 'seg-0354');

    -- 段落 0355: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0355 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0356: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0356 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0357: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (357, 'seg-0357');

    -- 段落 0358: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0358 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0359: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0359 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0360: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- ========== 长代码区段 0361 ==========
    -- 段落 0361: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0361 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0362: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0362 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0363: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (363, 'seg-0363');

    -- 段落 0364: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0364 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0365: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0365 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0366: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (366, 'seg-0366');

    -- 段落 0367: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0367 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0368: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0368 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0369: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0370: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0370 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0371: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0371 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0372: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (372, 'seg-0372');

    -- 段落 0373: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0373 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0374: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0374 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0375: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (375, 'seg-0375');

    -- 段落 0376: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0376 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0377: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0377 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0378: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0378 NUMBER := 0;

        PROCEDURE sub_step_0378(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0378(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0378 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0378;
        BEGIN
            sub_step_inner_0378(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0378;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0378 := v_acc_0378 + k;
            sub_step_0378(k);
        END LOOP;

        CASE MOD(v_acc_0378, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0378]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0379: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0379 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0380: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0380 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0381: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (381, 'seg-0381');

    -- 段落 0382: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0382 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0383: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0383 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0384: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (384, 'seg-0384');

    -- 段落 0385: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0385 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0386: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0386 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0387: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0387 NUMBER := 0;

        PROCEDURE sub_step_0387(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0387(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0387 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0387;
        BEGIN
            sub_step_inner_0387(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0387;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0387 := v_acc_0387 + k;
            sub_step_0387(k);
        END LOOP;

        CASE MOD(v_acc_0387, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0387]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0388: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0388 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0389: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0389 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0390: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (390, 'seg-0390');

    -- 段落 0391: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0391 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0392: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0392 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0393: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (393, 'seg-0393');

    -- 段落 0394: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0394 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0395: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0395 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0396: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0397: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0397 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0398: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0398 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0399: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (399, 'seg-0399');

    -- 段落 0400: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0400 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0401 ==========
    -- 段落 0401: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0401 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0402: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (402, 'seg-0402');

    -- 段落 0403: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0403 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0404: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0404 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0405: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0406: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0406 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0407: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0407 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0408: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (408, 'seg-0408');

    -- 段落 0409: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0409 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0410: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0410 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0411: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (411, 'seg-0411');

    -- 段落 0412: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0412 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0413: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0413 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0414: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0415: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0415 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0416: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0416 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0417: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (417, 'seg-0417');

    -- 段落 0418: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0418 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0419: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0419 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0420: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (420, 'seg-0420');

    -- 段落 0421: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0421 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0422: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0422 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0423: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0423 NUMBER := 0;

        PROCEDURE sub_step_0423(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0423(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0423 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0423;
        BEGIN
            sub_step_inner_0423(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0423;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0423 := v_acc_0423 + k;
            sub_step_0423(k);
        END LOOP;

        CASE MOD(v_acc_0423, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0423]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0424: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0424 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0425: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0425 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0426: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (426, 'seg-0426');

    -- 段落 0427: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0427 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0428: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0428 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0429: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (429, 'seg-0429');

    -- 段落 0430: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0430 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0431: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0431 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0432: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0432 NUMBER := 0;

        PROCEDURE sub_step_0432(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0432(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0432 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0432;
        BEGIN
            sub_step_inner_0432(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0432;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0432 := v_acc_0432 + k;
            sub_step_0432(k);
        END LOOP;

        CASE MOD(v_acc_0432, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0432]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0433: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0433 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0434: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0434 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0435: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (435, 'seg-0435');

    -- 段落 0436: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0436 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0437: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0437 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0438: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (438, 'seg-0438');

    -- 段落 0439: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0439 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0440: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0440 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0441: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0442: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0442 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0443: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0443 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0444: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (444, 'seg-0444');

    -- 段落 0445: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0445 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0446: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0446 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0447: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (447, 'seg-0447');

    -- 段落 0448: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0448 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0449: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0449 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0450: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0451: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0451 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0452: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0452 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0453: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (453, 'seg-0453');

    -- 段落 0454: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0454 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0455: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0455 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0456: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (456, 'seg-0456');

    -- 段落 0457: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0457 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0458: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0458 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0459: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0460: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0460 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0461: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0461 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0462: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (462, 'seg-0462');

    -- 段落 0463: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0463 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0464: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0464 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0465: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (465, 'seg-0465');

    -- 段落 0466: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0466 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0467: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0467 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0468: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0468 NUMBER := 0;

        PROCEDURE sub_step_0468(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0468(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0468 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0468;
        BEGIN
            sub_step_inner_0468(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0468;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0468 := v_acc_0468 + k;
            sub_step_0468(k);
        END LOOP;

        CASE MOD(v_acc_0468, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0468]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0469: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0469 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0470: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0470 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0471: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (471, 'seg-0471');

    -- 段落 0472: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0472 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0473: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0473 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0474: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (474, 'seg-0474');

    -- 段落 0475: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0475 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0476: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0476 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0477: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0477 NUMBER := 0;

        PROCEDURE sub_step_0477(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0477(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0477 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0477;
        BEGIN
            sub_step_inner_0477(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0477;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0477 := v_acc_0477 + k;
            sub_step_0477(k);
        END LOOP;

        CASE MOD(v_acc_0477, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0477]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0478: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0478 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0479: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0479 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0480: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (480, 'seg-0480');

    -- ========== 长代码区段 0481 ==========
    -- 段落 0481: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0481 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0482: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0482 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0483: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (483, 'seg-0483');

    -- 段落 0484: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0484 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0485: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0485 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0486: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0487: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0487 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0488: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0488 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0489: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (489, 'seg-0489');

    -- 段落 0490: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0490 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0491: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0491 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0492: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (492, 'seg-0492');

    -- 段落 0493: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0493 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0494: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0494 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0495: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0496: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0496 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0497: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0497 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0498: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (498, 'seg-0498');

    -- 段落 0499: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0499 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0500: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0500 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0501: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (501, 'seg-0501');

    -- 段落 0502: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0502 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0503: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0503 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0504: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0505: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0505 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0506: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0506 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0507: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (507, 'seg-0507');

    -- 段落 0508: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0508 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0509: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0509 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0510: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (510, 'seg-0510');

    -- 段落 0511: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0511 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0512: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0512 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0513: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0513 NUMBER := 0;

        PROCEDURE sub_step_0513(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0513(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0513 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0513;
        BEGIN
            sub_step_inner_0513(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0513;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0513 := v_acc_0513 + k;
            sub_step_0513(k);
        END LOOP;

        CASE MOD(v_acc_0513, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0513]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0514: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0514 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0515: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0515 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0516: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (516, 'seg-0516');

    -- 段落 0517: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0517 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0518: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0518 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0519: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (519, 'seg-0519');

    -- 段落 0520: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0520 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0521 ==========
    -- 段落 0521: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0521 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0522: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0522 NUMBER := 0;

        PROCEDURE sub_step_0522(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0522(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0522 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0522;
        BEGIN
            sub_step_inner_0522(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0522;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0522 := v_acc_0522 + k;
            sub_step_0522(k);
        END LOOP;

        CASE MOD(v_acc_0522, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0522]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0523: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0523 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0524: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0524 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0525: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (525, 'seg-0525');

    -- 段落 0526: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0526 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0527: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0527 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0528: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (528, 'seg-0528');

    -- 段落 0529: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0529 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0530: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0530 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0531: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0532: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0532 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0533: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0533 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0534: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (534, 'seg-0534');

    -- 段落 0535: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0535 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0536: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0536 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0537: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (537, 'seg-0537');

    -- 段落 0538: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0538 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0539: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0539 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0540: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0541: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0541 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0542: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0542 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0543: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (543, 'seg-0543');

    -- 段落 0544: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0544 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0545: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0545 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0546: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (546, 'seg-0546');

    -- 段落 0547: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0547 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0548: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0548 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0549: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0550: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0550 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0551: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0551 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0552: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (552, 'seg-0552');

    -- 段落 0553: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0553 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0554: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0554 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0555: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (555, 'seg-0555');

    -- 段落 0556: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0556 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0557: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0557 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0558: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0558 NUMBER := 0;

        PROCEDURE sub_step_0558(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0558(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0558 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0558;
        BEGIN
            sub_step_inner_0558(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0558;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0558 := v_acc_0558 + k;
            sub_step_0558(k);
        END LOOP;

        CASE MOD(v_acc_0558, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0558]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0559: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0559 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0560: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0560 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0561 ==========
    -- 段落 0561: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (561, 'seg-0561');

    -- 段落 0562: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0562 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0563: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0563 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0564: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (564, 'seg-0564');

    -- 段落 0565: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0565 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0566: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0566 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0567: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0567 NUMBER := 0;

        PROCEDURE sub_step_0567(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0567(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0567 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0567;
        BEGIN
            sub_step_inner_0567(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0567;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0567 := v_acc_0567 + k;
            sub_step_0567(k);
        END LOOP;

        CASE MOD(v_acc_0567, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0567]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0568: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0568 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0569: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0569 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0570: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (570, 'seg-0570');

    -- 段落 0571: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0571 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0572: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0572 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0573: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (573, 'seg-0573');

    -- 段落 0574: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0574 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0575: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0575 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0576: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0577: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0577 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0578: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0578 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0579: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (579, 'seg-0579');

    -- 段落 0580: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0580 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0581: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0581 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0582: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (582, 'seg-0582');

    -- 段落 0583: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0583 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0584: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0584 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0585: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0586: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0586 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0587: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0587 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0588: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (588, 'seg-0588');

    -- 段落 0589: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0589 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0590: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0590 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0591: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (591, 'seg-0591');

    -- 段落 0592: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0592 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0593: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0593 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0594: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0595: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0595 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0596: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0596 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0597: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (597, 'seg-0597');

    -- 段落 0598: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0598 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0599: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0599 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0600: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (600, 'seg-0600');

    -- ========== 长代码区段 0601 ==========
    -- 段落 0601: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0601 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0602: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0602 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0603: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0603 NUMBER := 0;

        PROCEDURE sub_step_0603(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0603(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0603 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0603;
        BEGIN
            sub_step_inner_0603(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0603;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0603 := v_acc_0603 + k;
            sub_step_0603(k);
        END LOOP;

        CASE MOD(v_acc_0603, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0603]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0604: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0604 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0605: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0605 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0606: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (606, 'seg-0606');

    -- 段落 0607: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0607 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0608: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0608 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0609: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (609, 'seg-0609');

    -- 段落 0610: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0610 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0611: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0611 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0612: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0612 NUMBER := 0;

        PROCEDURE sub_step_0612(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0612(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0612 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0612;
        BEGIN
            sub_step_inner_0612(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0612;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0612 := v_acc_0612 + k;
            sub_step_0612(k);
        END LOOP;

        CASE MOD(v_acc_0612, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0612]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0613: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0613 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0614: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0614 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0615: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (615, 'seg-0615');

    -- 段落 0616: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0616 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0617: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0617 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0618: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (618, 'seg-0618');

    -- 段落 0619: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0619 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0620: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0620 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0621: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0622: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0622 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0623: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0623 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0624: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (624, 'seg-0624');

    -- 段落 0625: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0625 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0626: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0626 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0627: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (627, 'seg-0627');

    -- 段落 0628: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0628 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0629: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0629 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0630: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0631: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0631 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0632: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0632 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0633: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (633, 'seg-0633');

    -- 段落 0634: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0634 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0635: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0635 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0636: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (636, 'seg-0636');

    -- 段落 0637: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0637 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0638: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0638 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0639: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0640: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0640 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0641 ==========
    -- 段落 0641: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0641 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0642: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (642, 'seg-0642');

    -- 段落 0643: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0643 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0644: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0644 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0645: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (645, 'seg-0645');

    -- 段落 0646: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0646 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0647: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0647 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0648: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0648 NUMBER := 0;

        PROCEDURE sub_step_0648(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0648(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0648 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0648;
        BEGIN
            sub_step_inner_0648(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0648;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0648 := v_acc_0648 + k;
            sub_step_0648(k);
        END LOOP;

        CASE MOD(v_acc_0648, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0648]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0649: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0649 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0650: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0650 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0651: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (651, 'seg-0651');

    -- 段落 0652: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0652 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0653: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0653 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0654: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (654, 'seg-0654');

    -- 段落 0655: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0655 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0656: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0656 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0657: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0657 NUMBER := 0;

        PROCEDURE sub_step_0657(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0657(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0657 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0657;
        BEGIN
            sub_step_inner_0657(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0657;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0657 := v_acc_0657 + k;
            sub_step_0657(k);
        END LOOP;

        CASE MOD(v_acc_0657, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0657]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0658: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0658 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0659: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0659 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0660: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (660, 'seg-0660');

    -- 段落 0661: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0661 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0662: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0662 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0663: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (663, 'seg-0663');

    -- 段落 0664: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0664 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0665: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0665 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0666: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0667: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0667 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0668: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0668 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0669: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (669, 'seg-0669');

    -- 段落 0670: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0670 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0671: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0671 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0672: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (672, 'seg-0672');

    -- 段落 0673: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0673 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0674: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0674 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0675: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0676: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0676 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0677: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0677 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0678: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (678, 'seg-0678');

    -- 段落 0679: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0679 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0680: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0680 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0681 ==========
    -- 段落 0681: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (681, 'seg-0681');

    -- 段落 0682: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0682 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0683: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0683 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0684: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0685: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0685 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0686: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0686 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0687: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (687, 'seg-0687');

    -- 段落 0688: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0688 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0689: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0689 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0690: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (690, 'seg-0690');

    -- 段落 0691: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0691 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0692: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0692 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0693: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0693 NUMBER := 0;

        PROCEDURE sub_step_0693(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0693(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0693 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0693;
        BEGIN
            sub_step_inner_0693(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0693;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0693 := v_acc_0693 + k;
            sub_step_0693(k);
        END LOOP;

        CASE MOD(v_acc_0693, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0693]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0694: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0694 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0695: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0695 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0696: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (696, 'seg-0696');

    -- 段落 0697: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0697 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0698: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0698 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0699: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (699, 'seg-0699');

    -- 段落 0700: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0700 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0701: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0701 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0702: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0702 NUMBER := 0;

        PROCEDURE sub_step_0702(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0702(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0702 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0702;
        BEGIN
            sub_step_inner_0702(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0702;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0702 := v_acc_0702 + k;
            sub_step_0702(k);
        END LOOP;

        CASE MOD(v_acc_0702, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0702]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0703: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0703 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0704: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0704 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0705: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (705, 'seg-0705');

    -- 段落 0706: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0706 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0707: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0707 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0708: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (708, 'seg-0708');

    -- 段落 0709: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0709 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0710: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0710 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0711: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0712: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0712 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0713: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0713 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0714: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (714, 'seg-0714');

    -- 段落 0715: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0715 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0716: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0716 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0717: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (717, 'seg-0717');

    -- 段落 0718: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0718 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0719: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0719 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0720: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- ========== 长代码区段 0721 ==========
    -- 段落 0721: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0721 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0722: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0722 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0723: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (723, 'seg-0723');

    -- 段落 0724: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0724 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0725: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0725 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0726: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (726, 'seg-0726');

    -- 段落 0727: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0727 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0728: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0728 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0729: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0730: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0730 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0731: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0731 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0732: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (732, 'seg-0732');

    -- 段落 0733: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0733 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0734: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0734 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0735: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (735, 'seg-0735');

    -- 段落 0736: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0736 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0737: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0737 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0738: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0738 NUMBER := 0;

        PROCEDURE sub_step_0738(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0738(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0738 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0738;
        BEGIN
            sub_step_inner_0738(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0738;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0738 := v_acc_0738 + k;
            sub_step_0738(k);
        END LOOP;

        CASE MOD(v_acc_0738, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0738]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0739: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0739 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0740: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0740 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0741: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (741, 'seg-0741');

    -- 段落 0742: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0742 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0743: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0743 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0744: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (744, 'seg-0744');

    -- 段落 0745: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0745 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0746: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0746 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0747: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0747 NUMBER := 0;

        PROCEDURE sub_step_0747(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0747(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0747 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0747;
        BEGIN
            sub_step_inner_0747(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0747;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0747 := v_acc_0747 + k;
            sub_step_0747(k);
        END LOOP;

        CASE MOD(v_acc_0747, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0747]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0748: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0748 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0749: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0749 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0750: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (750, 'seg-0750');

    -- 段落 0751: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0751 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0752: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0752 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0753: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (753, 'seg-0753');

    -- 段落 0754: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0754 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0755: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0755 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0756: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0757: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0757 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0758: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0758 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0759: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (759, 'seg-0759');

    -- 段落 0760: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0760 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0761 ==========
    -- 段落 0761: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0761 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0762: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (762, 'seg-0762');

    -- 段落 0763: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0763 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0764: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0764 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0765: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0766: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0766 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0767: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0767 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0768: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (768, 'seg-0768');

    -- 段落 0769: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0769 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0770: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0770 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0771: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (771, 'seg-0771');

    -- 段落 0772: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0772 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0773: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0773 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0774: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0775: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0775 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0776: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0776 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0777: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (777, 'seg-0777');

    -- 段落 0778: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0778 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0779: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0779 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0780: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (780, 'seg-0780');

    -- 段落 0781: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0781 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0782: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0782 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0783: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0783 NUMBER := 0;

        PROCEDURE sub_step_0783(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0783(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0783 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0783;
        BEGIN
            sub_step_inner_0783(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0783;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0783 := v_acc_0783 + k;
            sub_step_0783(k);
        END LOOP;

        CASE MOD(v_acc_0783, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0783]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0784: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0784 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0785: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0785 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0786: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (786, 'seg-0786');

    -- 段落 0787: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0787 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0788: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0788 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0789: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (789, 'seg-0789');

    -- 段落 0790: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0790 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0791: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0791 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0792: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0792 NUMBER := 0;

        PROCEDURE sub_step_0792(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0792(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0792 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0792;
        BEGIN
            sub_step_inner_0792(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0792;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0792 := v_acc_0792 + k;
            sub_step_0792(k);
        END LOOP;

        CASE MOD(v_acc_0792, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0792]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0793: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0793 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0794: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0794 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0795: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (795, 'seg-0795');

    -- 段落 0796: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0796 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0797: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0797 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0798: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (798, 'seg-0798');

    -- 段落 0799: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0799 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0800: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0800 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0801: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0802: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0802 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0803: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0803 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0804: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (804, 'seg-0804');

    -- 段落 0805: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0805 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0806: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0806 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0807: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (807, 'seg-0807');

    -- 段落 0808: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0808 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0809: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0809 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0810: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0811: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0811 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0812: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0812 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0813: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (813, 'seg-0813');

    -- 段落 0814: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0814 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0815: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0815 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0816: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (816, 'seg-0816');

    -- 段落 0817: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0817 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0818: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0818 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0819: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0820: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0820 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0821: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0821 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0822: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (822, 'seg-0822');

    -- 段落 0823: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0823 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0824: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0824 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0825: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (825, 'seg-0825');

    -- 段落 0826: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0826 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0827: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0827 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0828: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0828 NUMBER := 0;

        PROCEDURE sub_step_0828(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0828(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0828 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0828;
        BEGIN
            sub_step_inner_0828(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0828;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0828 := v_acc_0828 + k;
            sub_step_0828(k);
        END LOOP;

        CASE MOD(v_acc_0828, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0828]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0829: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0829 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0830: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0830 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0831: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (831, 'seg-0831');

    -- 段落 0832: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0832 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0833: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0833 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0834: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (834, 'seg-0834');

    -- 段落 0835: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0835 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0836: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0836 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0837: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0837 NUMBER := 0;

        PROCEDURE sub_step_0837(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0837(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0837 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0837;
        BEGIN
            sub_step_inner_0837(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0837;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0837 := v_acc_0837 + k;
            sub_step_0837(k);
        END LOOP;

        CASE MOD(v_acc_0837, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0837]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0838: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0838 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0839: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0839 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0840: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (840, 'seg-0840');

    -- ========== 长代码区段 0841 ==========
    -- 段落 0841: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0841 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0842: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0842 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0843: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (843, 'seg-0843');

    -- 段落 0844: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0844 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0845: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0845 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0846: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0847: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0847 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0848: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0848 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0849: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (849, 'seg-0849');

    -- 段落 0850: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0850 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0851: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0851 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0852: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (852, 'seg-0852');

    -- 段落 0853: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0853 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0854: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0854 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0855: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0856: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0856 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0857: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0857 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0858: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (858, 'seg-0858');

    -- 段落 0859: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0859 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0860: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0860 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0861: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (861, 'seg-0861');

    -- 段落 0862: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0862 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0863: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0863 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0864: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0865: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0865 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0866: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0866 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0867: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (867, 'seg-0867');

    -- 段落 0868: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0868 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0869: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0869 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0870: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (870, 'seg-0870');

    -- 段落 0871: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0871 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0872: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0872 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0873: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0873 NUMBER := 0;

        PROCEDURE sub_step_0873(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0873(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0873 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0873;
        BEGIN
            sub_step_inner_0873(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0873;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0873 := v_acc_0873 + k;
            sub_step_0873(k);
        END LOOP;

        CASE MOD(v_acc_0873, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0873]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0874: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0874 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0875: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0875 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0876: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (876, 'seg-0876');

    -- 段落 0877: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0877 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0878: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0878 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0879: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (879, 'seg-0879');

    -- 段落 0880: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0880 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0881 ==========
    -- 段落 0881: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0881 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0882: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0882 NUMBER := 0;

        PROCEDURE sub_step_0882(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0882(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0882 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0882;
        BEGIN
            sub_step_inner_0882(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0882;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0882 := v_acc_0882 + k;
            sub_step_0882(k);
        END LOOP;

        CASE MOD(v_acc_0882, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0882]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0883: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0883 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0884: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0884 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0885: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (885, 'seg-0885');

    -- 段落 0886: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0886 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0887: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0887 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0888: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (888, 'seg-0888');

    -- 段落 0889: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0889 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0890: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0890 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0891: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0892: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0892 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0893: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0893 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0894: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (894, 'seg-0894');

    -- 段落 0895: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0895 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0896: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0896 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0897: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (897, 'seg-0897');

    -- 段落 0898: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0898 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0899: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0899 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0900: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0901: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0901 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0902: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0902 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0903: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (903, 'seg-0903');

    -- 段落 0904: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0904 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0905: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0905 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0906: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (906, 'seg-0906');

    -- 段落 0907: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0907 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0908: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0908 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0909: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0910: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0910 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0911: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0911 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0912: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (912, 'seg-0912');

    -- 段落 0913: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0913 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0914: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0914 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0915: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (915, 'seg-0915');

    -- 段落 0916: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0916 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0917: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0917 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0918: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0918 NUMBER := 0;

        PROCEDURE sub_step_0918(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0918(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0918 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0918;
        BEGIN
            sub_step_inner_0918(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0918;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0918 := v_acc_0918 + k;
            sub_step_0918(k);
        END LOOP;

        CASE MOD(v_acc_0918, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0918]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0919: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0919 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0920: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0920 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 0921 ==========
    -- 段落 0921: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (921, 'seg-0921');

    -- 段落 0922: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0922 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0923: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0923 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0924: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (924, 'seg-0924');

    -- 段落 0925: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0925 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0926: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0926 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0927: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0927 NUMBER := 0;

        PROCEDURE sub_step_0927(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0927(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0927 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0927;
        BEGIN
            sub_step_inner_0927(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0927;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0927 := v_acc_0927 + k;
            sub_step_0927(k);
        END LOOP;

        CASE MOD(v_acc_0927, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0927]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0928: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0928 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0929: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0929 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0930: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (930, 'seg-0930');

    -- 段落 0931: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0931 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0932: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0932 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0933: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (933, 'seg-0933');

    -- 段落 0934: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0934 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0935: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0935 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0936: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0937: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0937 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0938: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0938 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0939: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (939, 'seg-0939');

    -- 段落 0940: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0940 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0941: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0941 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0942: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (942, 'seg-0942');

    -- 段落 0943: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0943 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0944: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0944 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0945: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0946: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0946 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0947: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0947 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0948: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (948, 'seg-0948');

    -- 段落 0949: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0949 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0950: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0950 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0951: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (951, 'seg-0951');

    -- 段落 0952: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0952 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0953: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0953 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0954: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 0955: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0955 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0956: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0956 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0957: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (957, 'seg-0957');

    -- 段落 0958: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0958 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0959: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0959 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0960: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (960, 'seg-0960');

    -- ========== 长代码区段 0961 ==========
    -- 段落 0961: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0961 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0962: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0962 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0963: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0963 NUMBER := 0;

        PROCEDURE sub_step_0963(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0963(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0963 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0963;
        BEGIN
            sub_step_inner_0963(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0963;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0963 := v_acc_0963 + k;
            sub_step_0963(k);
        END LOOP;

        CASE MOD(v_acc_0963, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0963]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0964: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0964 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0965: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0965 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0966: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (966, 'seg-0966');

    -- 段落 0967: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0967 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0968: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0968 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0969: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (969, 'seg-0969');

    -- 段落 0970: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0970 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0971: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0971 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0972: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_0972 NUMBER := 0;

        PROCEDURE sub_step_0972(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_0972(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 0972 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_0972;
        BEGIN
            sub_step_inner_0972(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_0972;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_0972 := v_acc_0972 + k;
            sub_step_0972(k);
        END LOOP;

        CASE MOD(v_acc_0972, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 0972]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 0973: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0973 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0974: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0974 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0975: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (975, 'seg-0975');

    -- 段落 0976: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0976 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0977: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0977 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0978: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (978, 'seg-0978');

    -- 段落 0979: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0979 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0980: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0980 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0981: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0982: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0982 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0983: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0983 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0984: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (984, 'seg-0984');

    -- 段落 0985: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0985 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0986: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0986 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0987: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (987, 'seg-0987');

    -- 段落 0988: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0988 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0989: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0989 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 0990: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 0991: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0991 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0992: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0992 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0993: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (993, 'seg-0993');

    -- 段落 0994: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0994 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0995: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0995 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0996: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (996, 'seg-0996');

    -- 段落 0997: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0997 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 0998: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 0998 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 0999: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 1000: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1000 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 1001 ==========
    -- 段落 1001: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1001 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1002: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1002, 'seg-1002');

    -- 段落 1003: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1003 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1004: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1004 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1005: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1005, 'seg-1005');

    -- 段落 1006: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1006 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1007: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1007 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 1008: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_1008 NUMBER := 0;

        PROCEDURE sub_step_1008(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_1008(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 1008 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_1008;
        BEGIN
            sub_step_inner_1008(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_1008;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_1008 := v_acc_1008 + k;
            sub_step_1008(k);
        END LOOP;

        CASE MOD(v_acc_1008, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 1008]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1009: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1009 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1010: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1010 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1011: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1011, 'seg-1011');

    -- 段落 1012: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1012 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1013: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1013 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1014: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1014, 'seg-1014');

    -- 段落 1015: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1015 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1016: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1016 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 1017: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_1017 NUMBER := 0;

        PROCEDURE sub_step_1017(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_1017(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 1017 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_1017;
        BEGIN
            sub_step_inner_1017(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_1017;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_1017 := v_acc_1017 + k;
            sub_step_1017(k);
        END LOOP;

        CASE MOD(v_acc_1017, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 1017]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1018: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1018 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1019: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1019 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1020: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1020, 'seg-1020');

    -- 段落 1021: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1021 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1022: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1022 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1023: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1023, 'seg-1023');

    -- 段落 1024: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1024 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1025: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1025 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 1026: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 1027: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1027 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1028: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1028 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1029: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1029, 'seg-1029');

    -- 段落 1030: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1030 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1031: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1031 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1032: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1032, 'seg-1032');

    -- 段落 1033: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1033 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1034: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1034 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 1035: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 1036: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1036 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1037: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1037 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1038: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1038, 'seg-1038');

    -- 段落 1039: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1039 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1040: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1040 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ========== 长代码区段 1041 ==========
    -- 段落 1041: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1041, 'seg-1041');

    -- 段落 1042: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1042 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1043: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1043 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 1044: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 1045: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1045 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1046: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1046 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1047: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1047, 'seg-1047');

    -- 段落 1048: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1048 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1049: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1049 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1050: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1050, 'seg-1050');

    -- 段落 1051: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1051 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1052: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1052 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 1053: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_1053 NUMBER := 0;

        PROCEDURE sub_step_1053(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_1053(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 1053 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_1053;
        BEGIN
            sub_step_inner_1053(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_1053;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_1053 := v_acc_1053 + k;
            sub_step_1053(k);
        END LOOP;

        CASE MOD(v_acc_1053, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 1053]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1054: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1054 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1055: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1055 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1056: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1056, 'seg-1056');

    -- 段落 1057: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1057 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1058: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1058 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1059: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1059, 'seg-1059');

    -- 段落 1060: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1060 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1061: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1061 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 1062: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_1062 NUMBER := 0;

        PROCEDURE sub_step_1062(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_1062(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 1062 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_1062;
        BEGIN
            sub_step_inner_1062(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_1062;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_1062 := v_acc_1062 + k;
            sub_step_1062(k);
        END LOOP;

        CASE MOD(v_acc_1062, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 1062]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    -- 段落 1063: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1063 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1064: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1064 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1065: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1065, 'seg-1065');

    -- 段落 1066: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1066 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1067: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1067 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1068: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1068, 'seg-1068');

    -- 段落 1069: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1069 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1070: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1070 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 1071: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 段落 1072: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1072 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1073: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1073 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1074: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1074, 'seg-1074');

    -- 段落 1075: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1075 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1076: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1076 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1077: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1077, 'seg-1077');

    -- 段落 1078: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1078 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1079: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1079 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 1080: 自包含嵌套 3 层循环(FOR > FOR > FOR)
    FOR a3 IN 1 .. 3 LOOP
        FOR b3 IN 1 .. 3 LOOP
            FOR c3 IN 1 .. 2 LOOP
                IF MOD(a3 + b3 + c3, 2) = 0 THEN
                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

    -- ========== 长代码区段 1081 ==========
    -- 段落 1081: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1081 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1082: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1082 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1083: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1083, 'seg-1083');

    -- 段落 1084: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1084 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1085: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1085 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1086: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1086, 'seg-1086');

    -- 段落 1087: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1087 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1088: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1088 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- ================================================================
    -- 复杂段 1089: 注释风暴(自包含)
    -- ================================================================
    -- FOR legacy IN 1 .. 10 LOOP
    --     NULL;
    -- END LOOP;
    /*
    DECLARE
        v_legacy NUMBER;
    BEGIN
        NULL;
    END;
    */
    NULL;  -- 行尾注释

    -- 段落 1090: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1090 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1091: 自包含计数循环
    FOR k IN 1 .. 6 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1091 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1092: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1092, 'seg-1092');

    -- 段落 1093: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1093 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1094: 自包含计数循环
    FOR k IN 1 .. 5 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1094 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1095: DML 语句
    INSERT INTO zc_long_log(id, tag) VALUES (1095, 'seg-1095');

    -- 段落 1096: 自包含计数循环
    FOR k IN 1 .. 3 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1096 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 段落 1097: 自包含计数循环
    FOR k IN 1 .. 4 LOOP
        IF MOD(k, 2) = 0 THEN
            DBMS_OUTPUT.PUT_LINE('seg 1097 k=' || k);
        ELSE
            NULL;
        END IF;
    END LOOP;

    -- 复杂段 1098: 内联匿名块(含嵌套子程序)
    DECLARE
        v_acc_1098 NUMBER := 0;

        PROCEDURE sub_step_1098(p_in IN NUMBER) IS

            PROCEDURE sub_step_inner_1098(p_in2 IN NUMBER) IS
            BEGIN
                IF p_in2 > 0 THEN
                    DBMS_OUTPUT.PUT_LINE('step 1098 ' || p_in2);
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END sub_step_inner_1098;
        BEGIN
            sub_step_inner_1098(p_in);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_step_1098;
    BEGIN
        FOR k IN 1 .. 5 LOOP
            v_acc_1098 := v_acc_1098 + k;
            sub_step_1098(k);
        END LOOP;

        CASE MOD(v_acc_1098, 3)
            WHEN 0 THEN
                DBMS_OUTPUT.PUT_LINE('mod0');
            ELSE
                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ 1098]');
        END CASE;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
END;
/

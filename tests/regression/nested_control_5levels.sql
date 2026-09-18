CREATE OR REPLACE PACKAGE BODY hr.test_nested_pkg
IS
    -- 测试5层控制结构嵌套
    PROCEDURE process_data(p_mode IN VARCHAR2)
    IS
        v_count NUMBER := 0;
        v_flag BOOLEAN := TRUE;
        v_type VARCHAR2(10);
    BEGIN
        IF p_mode = 'FULL' THEN
            FOR i IN 1..10 LOOP
                IF v_count > 5 THEN
                    WHILE v_flag LOOP
                        CASE v_type
                            WHEN 'A' THEN
                                v_count := v_count + 1;
                            WHEN 'B' THEN
                                v_count := v_count + 2;
                            WHEN 'C' THEN
                                v_count := v_count + 3;
                        END CASE;
                        v_flag := FALSE;
                    END LOOP;
                ELSIF v_count = 5 THEN
                    LOOP
                        v_count := v_count - 1;
                        EXIT WHEN v_count = 0;
                    END LOOP;
                ELSE
                    v_count := v_count + 1;
                END IF;
            END LOOP;
        ELSIF p_mode = 'PARTIAL' THEN
            FOR j IN REVERSE 1..5 LOOP
                IF j > 3 THEN
                    NULL;
                ELSE
                    NULL;
                END IF;
            END LOOP;
        ELSE
            NULL;
        END IF;
    END process_data;

    -- 测试Sub Procedure内的控制结构
    FUNCTION calculate(p_input IN NUMBER) RETURN NUMBER
    IS
        v_result NUMBER := 0;

        PROCEDURE sub_helper(p_val IN OUT NUMBER)
        IS
        BEGIN
            IF p_val > 100 THEN
                WHILE p_val > 50 LOOP
                    p_val := p_val - 10;
                END LOOP;
            ELSE
                FOR k IN 1..p_val LOOP
                    IF MOD(k, 2) = 0 THEN
                        p_val := p_val + k;
                    END IF;
                END LOOP;
            END IF;
        END sub_helper;

        FUNCTION sub_calc(p_x IN NUMBER) RETURN NUMBER
        IS
            v_tmp NUMBER;
        BEGIN
            CASE
                WHEN p_x > 0 THEN
                    v_tmp := p_x * 2;
                WHEN p_x = 0 THEN
                    v_tmp := 1;
                ELSE
                    v_tmp := -p_x;
            END CASE;
            RETURN v_tmp;
        END sub_calc;

    BEGIN
        v_result := p_input;
        sub_helper(v_result);
        v_result := sub_calc(v_result);
        RETURN v_result;
    END calculate;

BEGIN
    -- Package initialization block
    NULL;
END test_nested_pkg;
/

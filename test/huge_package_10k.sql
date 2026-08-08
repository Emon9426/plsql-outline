CREATE OR REPLACE PACKAGE BODY app_schema.huge_test_pkg
IS

-- ===== 包级声明（验证游标/变量/常量/类型/异常解析）=====

    e_pkg_error_01 EXCEPTION;
    e_pkg_error_02 EXCEPTION;
    e_pkg_error_03 EXCEPTION;
    e_pkg_error_04 EXCEPTION;
    e_pkg_error_05 EXCEPTION;
    e_pkg_error_06 EXCEPTION;
    e_pkg_error_07 EXCEPTION;
    e_pkg_error_08 EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_pkg_error_01, -20001);

    c_const_01 NUMBER CONSTANT := 100;
    c_const_02 NUMBER CONSTANT := 200;
    c_const_03 NUMBER CONSTANT := 300;
    c_const_04 NUMBER CONSTANT := 400;
    c_const_05 NUMBER CONSTANT := 500;
    c_const_06 NUMBER CONSTANT := 600;
    c_const_07 NUMBER CONSTANT := 700;
    c_const_08 NUMBER CONSTANT := 800;
    c_const_09 NUMBER CONSTANT := 900;
    c_const_10 NUMBER CONSTANT := 1000;
    c_const_11 NUMBER CONSTANT := 1100;
    c_const_12 NUMBER CONSTANT := 1200;

    v_pkg_var_01 NUMBER := 1;
    v_pkg_var_02 NUMBER := 2;
    v_pkg_var_03 NUMBER := 3;
    v_pkg_var_04 NUMBER := 4;
    v_pkg_var_05 NUMBER := 5;
    v_pkg_var_06 NUMBER := 6;
    v_pkg_var_07 NUMBER := 7;
    v_pkg_var_08 NUMBER := 8;
    v_pkg_var_09 NUMBER := 9;
    v_pkg_var_10 NUMBER := 10;
    v_pkg_var_11 NUMBER := 11;
    v_pkg_var_12 NUMBER := 12;
    v_pkg_var_13 NUMBER := 13;
    v_pkg_var_14 NUMBER := 14;
    v_pkg_var_15 NUMBER := 15;
    v_pkg_var_16 NUMBER := 16;
    v_pkg_var_17 NUMBER := 17;
    v_pkg_var_18 NUMBER := 18;
    v_pkg_var_19 NUMBER := 19;
    v_pkg_var_20 NUMBER := 20;

    TYPE t_rec_01 IS RECORD (
        id      NUMBER,
        name    VARCHAR2(200),
        amount  NUMBER(15,2)
    );
    TYPE t_rec_02 IS RECORD (
        id      NUMBER,
        name    VARCHAR2(200),
        amount  NUMBER(15,2)
    );
    TYPE t_rec_03 IS RECORD (
        id      NUMBER,
        name    VARCHAR2(200),
        amount  NUMBER(15,2)
    );
    TYPE t_rec_04 IS RECORD (
        id      NUMBER,
        name    VARCHAR2(200),
        amount  NUMBER(15,2)
    );
    TYPE t_rec_05 IS RECORD (
        id      NUMBER,
        name    VARCHAR2(200),
        amount  NUMBER(15,2)
    );
    TYPE t_rec_06 IS RECORD (
        id      NUMBER,
        name    VARCHAR2(200),
        amount  NUMBER(15,2)
    );

    TYPE t_tab_01 IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    TYPE t_tab_02 IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    TYPE t_tab_03 IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
    TYPE t_tab_04 IS TABLE OF NUMBER INDEX BY PLS_INTEGER;

    CURSOR c_pkg_cursor_01 (p_status VARCHAR2) IS
        SELECT id, status, amount
          FROM orders
         WHERE status = p_status;
    CURSOR c_pkg_cursor_02 (p_status VARCHAR2) IS
        SELECT id, status, amount
          FROM orders
         WHERE status = p_status;
    CURSOR c_pkg_cursor_03 (p_status VARCHAR2) IS
        SELECT id, status, amount
          FROM orders
         WHERE status = p_status;
    CURSOR c_pkg_cursor_04 (p_status VARCHAR2) IS
        SELECT id, status, amount
          FROM orders
         WHERE status = p_status;
    CURSOR c_pkg_cursor_05 (p_status VARCHAR2) IS
        SELECT id, status, amount
          FROM orders
         WHERE status = p_status;
    CURSOR c_pkg_cursor_06 (p_status VARCHAR2) IS
        SELECT id, status, amount
          FROM orders
         WHERE status = p_status;
    CURSOR c_pkg_cursor_07 (p_status VARCHAR2) IS
        SELECT id, status, amount
          FROM orders
         WHERE status = p_status;
    CURSOR c_pkg_cursor_08 (p_status VARCHAR2) IS
        SELECT id, status, amount
          FROM orders
         WHERE status = p_status;
    CURSOR c_pkg_cursor_09 (p_status VARCHAR2) IS
        SELECT id, status, amount
          FROM orders
         WHERE status = p_status;
    CURSOR c_pkg_cursor_10 (p_status VARCHAR2) IS
        SELECT id, status, amount
          FROM orders
         WHERE status = p_status;

    PROCEDURE proc_001(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_001_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1001;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_1(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_1;

        PROCEDURE sub_proc_1(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_1(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_1;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_1(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_1;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_1(v_local_1);
        sub_proc_1(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_001;

    FUNCTION func_001(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_001_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1002;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_2(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_2;

        PROCEDURE sub_proc_2(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_2(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_2;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_2(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_2;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_2(v_local_1);
        sub_proc_2(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_001;

    PROCEDURE proc_002(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_002_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1003;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_3(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_3;

        PROCEDURE sub_proc_3(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_3(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_3;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_3(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_3;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_3(v_local_1);
        sub_proc_3(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_002;

    FUNCTION func_002(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_002_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1004;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_4(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_4;

        PROCEDURE sub_proc_4(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_4(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_4;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_4(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_4;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_4(v_local_1);
        sub_proc_4(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_002;

    PROCEDURE proc_003(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_003_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1005;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_5(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_5;

        PROCEDURE sub_proc_5(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_5(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_5;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_5(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_5;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_5(v_local_1);
        sub_proc_5(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_003;

    FUNCTION func_003(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_003_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1006;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_6(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_6;

        PROCEDURE sub_proc_6(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_6(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_6;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_6(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_6;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_6(v_local_1);
        sub_proc_6(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_003;

    PROCEDURE proc_004(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_004_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1007;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_7(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_7;

        PROCEDURE sub_proc_7(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_7(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_7;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_7(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_7;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_7(v_local_1);
        sub_proc_7(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_004;

    FUNCTION func_004(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_004_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1008;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_8(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_8;

        PROCEDURE sub_proc_8(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_8(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_8;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_8(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_8;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_8(v_local_1);
        sub_proc_8(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_004;

    PROCEDURE proc_005(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_005_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1009;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_9(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_9;

        PROCEDURE sub_proc_9(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_9(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_9;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_9(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_9;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_9(v_local_1);
        sub_proc_9(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_005;

    FUNCTION func_005(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_005_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1010;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_10(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_10;

        PROCEDURE sub_proc_10(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_10(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_10;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_10(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_10;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_10(v_local_1);
        sub_proc_10(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_005;

    PROCEDURE proc_006(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_006_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1011;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_11(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_11;

        PROCEDURE sub_proc_11(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_11(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_11;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_11(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_11;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_11(v_local_1);
        sub_proc_11(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_006;

    FUNCTION func_006(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_006_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1012;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_12(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_12;

        PROCEDURE sub_proc_12(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_12(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_12;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_12(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_12;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_12(v_local_1);
        sub_proc_12(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_006;

    PROCEDURE proc_007(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_007_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1013;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_13(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_13;

        PROCEDURE sub_proc_13(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_13(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_13;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_13(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_13;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_13(v_local_1);
        sub_proc_13(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_007;

    FUNCTION func_007(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_007_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1014;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_14(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_14;

        PROCEDURE sub_proc_14(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_14(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_14;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_14(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_14;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_14(v_local_1);
        sub_proc_14(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_007;

    PROCEDURE proc_008(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_008_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1015;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_15(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_15;

        PROCEDURE sub_proc_15(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_15(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_15;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_15(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_15;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_15(v_local_1);
        sub_proc_15(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_008;

    FUNCTION func_008(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_008_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1016;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_16(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_16;

        PROCEDURE sub_proc_16(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_16(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_16;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_16(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_16;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_16(v_local_1);
        sub_proc_16(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_008;

    PROCEDURE proc_009(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_009_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1017;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_17(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_17;

        PROCEDURE sub_proc_17(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_17(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_17;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_17(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_17;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_17(v_local_1);
        sub_proc_17(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_009;

    FUNCTION func_009(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_009_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1018;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_18(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_18;

        PROCEDURE sub_proc_18(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_18(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_18;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_18(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_18;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_18(v_local_1);
        sub_proc_18(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_009;

    PROCEDURE proc_010(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_010_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1019;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_19(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_19;

        PROCEDURE sub_proc_19(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_19(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_19;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_19(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_19;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_19(v_local_1);
        sub_proc_19(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_010;

    FUNCTION func_010(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_010_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1020;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_20(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_20;

        PROCEDURE sub_proc_20(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_20(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_20;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_20(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_20;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_20(v_local_1);
        sub_proc_20(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_010;

    PROCEDURE proc_011(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_011_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1021;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_21(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_21;

        PROCEDURE sub_proc_21(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_21(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_21;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_21(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_21;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_21(v_local_1);
        sub_proc_21(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_011;

    FUNCTION func_011(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_011_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1022;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_22(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_22;

        PROCEDURE sub_proc_22(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_22(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_22;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_22(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_22;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_22(v_local_1);
        sub_proc_22(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_011;

    PROCEDURE proc_012(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_012_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1023;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_23(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_23;

        PROCEDURE sub_proc_23(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_23(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_23;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_23(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_23;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_23(v_local_1);
        sub_proc_23(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_012;

    FUNCTION func_012(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_012_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1024;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_24(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_24;

        PROCEDURE sub_proc_24(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_24(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_24;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_24(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_24;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_24(v_local_1);
        sub_proc_24(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_012;

    PROCEDURE proc_013(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_013_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1025;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_25(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_25;

        PROCEDURE sub_proc_25(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_25(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_25;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_25(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_25;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_25(v_local_1);
        sub_proc_25(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_013;

    FUNCTION func_013(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_013_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1026;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_26(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_26;

        PROCEDURE sub_proc_26(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_26(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_26;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_26(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_26;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_26(v_local_1);
        sub_proc_26(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_013;

    PROCEDURE proc_014(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_014_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1027;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_27(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_27;

        PROCEDURE sub_proc_27(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_27(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_27;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_27(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_27;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_27(v_local_1);
        sub_proc_27(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_014;

    FUNCTION func_014(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_014_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1028;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_28(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_28;

        PROCEDURE sub_proc_28(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_28(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_28;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_28(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_28;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_28(v_local_1);
        sub_proc_28(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_014;

    PROCEDURE proc_015(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_015_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1029;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_29(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_29;

        PROCEDURE sub_proc_29(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_29(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_29;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_29(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_29;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_29(v_local_1);
        sub_proc_29(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_015;

    FUNCTION func_015(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_015_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1030;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_30(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_30;

        PROCEDURE sub_proc_30(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_30(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_30;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_30(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_30;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_30(v_local_1);
        sub_proc_30(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_015;

    PROCEDURE proc_016(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_016_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1031;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_31(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_31;

        PROCEDURE sub_proc_31(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_31(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_31;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_31(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_31;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_31(v_local_1);
        sub_proc_31(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_016;

    FUNCTION func_016(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_016_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1032;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_32(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_32;

        PROCEDURE sub_proc_32(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_32(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_32;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_32(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_32;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_32(v_local_1);
        sub_proc_32(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_016;

    PROCEDURE proc_017(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_017_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1033;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_33(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_33;

        PROCEDURE sub_proc_33(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_33(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_33;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_33(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_33;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_33(v_local_1);
        sub_proc_33(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_017;

    FUNCTION func_017(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_017_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1034;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_34(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_34;

        PROCEDURE sub_proc_34(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_34(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_34;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_34(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_34;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_34(v_local_1);
        sub_proc_34(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_017;

    PROCEDURE proc_018(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_018_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1035;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_35(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_35;

        PROCEDURE sub_proc_35(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_35(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_35;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_35(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_35;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_35(v_local_1);
        sub_proc_35(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_018;

    FUNCTION func_018(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_018_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1036;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_36(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_36;

        PROCEDURE sub_proc_36(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_36(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_36;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_36(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_36;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_36(v_local_1);
        sub_proc_36(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_018;

    PROCEDURE proc_019(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_019_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1037;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_37(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_37;

        PROCEDURE sub_proc_37(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_37(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_37;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_37(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_37;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_37(v_local_1);
        sub_proc_37(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_019;

    FUNCTION func_019(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_019_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1038;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_38(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_38;

        PROCEDURE sub_proc_38(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_38(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_38;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_38(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_38;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_38(v_local_1);
        sub_proc_38(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_019;

    PROCEDURE proc_020(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_020_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1039;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_39(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_39;

        PROCEDURE sub_proc_39(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_39(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_39;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_39(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_39;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_39(v_local_1);
        sub_proc_39(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_020;

    FUNCTION func_020(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_020_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1040;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_40(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_40;

        PROCEDURE sub_proc_40(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_40(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_40;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_40(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_40;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_40(v_local_1);
        sub_proc_40(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_020;

    PROCEDURE proc_021(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_021_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1041;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_41(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_41;

        PROCEDURE sub_proc_41(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_41(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_41;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_41(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_41;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_41(v_local_1);
        sub_proc_41(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_021;

    FUNCTION func_021(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_021_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1042;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_42(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_42;

        PROCEDURE sub_proc_42(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_42(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_42;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_42(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_42;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_42(v_local_1);
        sub_proc_42(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_021;

    PROCEDURE proc_022(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_022_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1043;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_43(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_43;

        PROCEDURE sub_proc_43(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_43(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_43;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_43(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_43;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_43(v_local_1);
        sub_proc_43(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_022;

    FUNCTION func_022(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_022_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1044;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_44(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_44;

        PROCEDURE sub_proc_44(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_44(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_44;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_44(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_44;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_44(v_local_1);
        sub_proc_44(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_022;

    PROCEDURE proc_023(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_023_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1045;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_45(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_45;

        PROCEDURE sub_proc_45(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_45(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_45;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_45(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_45;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_45(v_local_1);
        sub_proc_45(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_023;

    FUNCTION func_023(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_023_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1046;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_46(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_46;

        PROCEDURE sub_proc_46(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_46(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_46;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_46(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_46;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_46(v_local_1);
        sub_proc_46(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_023;

    PROCEDURE proc_024(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_024_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1047;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_47(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_47;

        PROCEDURE sub_proc_47(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_47(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_47;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_47(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_47;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_47(v_local_1);
        sub_proc_47(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_024;

    FUNCTION func_024(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_024_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1048;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_48(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_48;

        PROCEDURE sub_proc_48(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_48(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_48;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_48(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_48;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_48(v_local_1);
        sub_proc_48(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_024;

    PROCEDURE proc_025(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_025_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1049;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_49(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_49;

        PROCEDURE sub_proc_49(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_49(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_49;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_49(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_49;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_49(v_local_1);
        sub_proc_49(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_025;

    FUNCTION func_025(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_025_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1050;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_50(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_50;

        PROCEDURE sub_proc_50(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_50(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_50;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_50(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_50;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_50(v_local_1);
        sub_proc_50(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_025;

    PROCEDURE proc_026(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_026_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1051;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_51(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_51;

        PROCEDURE sub_proc_51(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_51(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_51;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_51(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_51;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_51(v_local_1);
        sub_proc_51(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_026;

    FUNCTION func_026(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_026_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1052;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_52(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_52;

        PROCEDURE sub_proc_52(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_52(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_52;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_52(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_52;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_52(v_local_1);
        sub_proc_52(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_026;

    PROCEDURE proc_027(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_027_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1053;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_53(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_53;

        PROCEDURE sub_proc_53(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_53(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_53;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_53(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_53;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_53(v_local_1);
        sub_proc_53(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_027;

    FUNCTION func_027(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_027_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1054;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_54(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_54;

        PROCEDURE sub_proc_54(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_54(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_54;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_54(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_54;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_54(v_local_1);
        sub_proc_54(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_027;

    PROCEDURE proc_028(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_028_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1055;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_55(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_55;

        PROCEDURE sub_proc_55(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_55(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_55;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_55(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_55;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_55(v_local_1);
        sub_proc_55(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_028;

    FUNCTION func_028(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_028_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1056;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_56(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_56;

        PROCEDURE sub_proc_56(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_56(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_56;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_56(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_56;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_56(v_local_1);
        sub_proc_56(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_028;

    PROCEDURE proc_029(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_029_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1057;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_57(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_57;

        PROCEDURE sub_proc_57(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_57(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_57;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_57(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_57;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_57(v_local_1);
        sub_proc_57(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_029;

    FUNCTION func_029(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_029_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1058;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_58(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_58;

        PROCEDURE sub_proc_58(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_58(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_58;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_58(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_58;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_58(v_local_1);
        sub_proc_58(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_029;

    PROCEDURE proc_030(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_030_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1059;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_59(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_59;

        PROCEDURE sub_proc_59(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_59(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_59;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_59(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_59;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_59(v_local_1);
        sub_proc_59(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_030;

    FUNCTION func_030(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_030_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1060;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_60(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_60;

        PROCEDURE sub_proc_60(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_60(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_60;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_60(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_60;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_60(v_local_1);
        sub_proc_60(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_030;

    PROCEDURE proc_031(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_031_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1061;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_61(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_61;

        PROCEDURE sub_proc_61(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_61(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_61;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_61(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_61;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_61(v_local_1);
        sub_proc_61(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_031;

    FUNCTION func_031(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_031_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1062;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_62(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_62;

        PROCEDURE sub_proc_62(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_62(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_62;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_62(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_62;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_62(v_local_1);
        sub_proc_62(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_031;

    PROCEDURE proc_032(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_032_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1063;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_63(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_63;

        PROCEDURE sub_proc_63(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_63(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_63;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_63(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_63;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_63(v_local_1);
        sub_proc_63(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_032;

    FUNCTION func_032(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_032_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1064;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_64(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_64;

        PROCEDURE sub_proc_64(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_64(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_64;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_64(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_64;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_64(v_local_1);
        sub_proc_64(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_032;

    PROCEDURE proc_033(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_033_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1065;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_65(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_65;

        PROCEDURE sub_proc_65(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_65(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_65;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_65(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_65;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_65(v_local_1);
        sub_proc_65(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_033;

    FUNCTION func_033(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_033_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1066;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_66(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_66;

        PROCEDURE sub_proc_66(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_66(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_66;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_66(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_66;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_66(v_local_1);
        sub_proc_66(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_033;

    PROCEDURE proc_034(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_034_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1067;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_67(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_67;

        PROCEDURE sub_proc_67(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_67(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_67;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_67(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_67;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_67(v_local_1);
        sub_proc_67(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_034;

    FUNCTION func_034(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_034_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1068;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_68(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_68;

        PROCEDURE sub_proc_68(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_68(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_68;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_68(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_68;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_68(v_local_1);
        sub_proc_68(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_034;

    PROCEDURE proc_035(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_035_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1069;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_69(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_69;

        PROCEDURE sub_proc_69(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_69(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_69;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_69(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_69;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_69(v_local_1);
        sub_proc_69(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_035;

    FUNCTION func_035(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_035_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1070;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_70(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_70;

        PROCEDURE sub_proc_70(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_70(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_70;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_70(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_70;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_70(v_local_1);
        sub_proc_70(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_035;

    PROCEDURE proc_036(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_036_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1071;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_71(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_71;

        PROCEDURE sub_proc_71(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_71(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_71;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_71(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_71;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_71(v_local_1);
        sub_proc_71(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_036;

    FUNCTION func_036(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_036_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1072;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_72(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_72;

        PROCEDURE sub_proc_72(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_72(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_72;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_72(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_72;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_72(v_local_1);
        sub_proc_72(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_036;

    PROCEDURE proc_037(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_037_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1073;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_73(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_73;

        PROCEDURE sub_proc_73(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_73(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_73;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_73(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_73;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_73(v_local_1);
        sub_proc_73(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_037;

    FUNCTION func_037(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_037_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1074;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_74(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_74;

        PROCEDURE sub_proc_74(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_74(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_74;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_74(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_74;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_74(v_local_1);
        sub_proc_74(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_037;

    PROCEDURE proc_038(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_038_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1075;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_75(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_75;

        PROCEDURE sub_proc_75(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_75(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_75;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_75(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_75;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_75(v_local_1);
        sub_proc_75(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_038;

    FUNCTION func_038(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_038_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1076;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_76(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_76;

        PROCEDURE sub_proc_76(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_76(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_76;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_76(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_76;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_76(v_local_1);
        sub_proc_76(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_038;

    PROCEDURE proc_039(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_039_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1077;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_77(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_77;

        PROCEDURE sub_proc_77(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_77(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_77;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_77(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_77;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_77(v_local_1);
        sub_proc_77(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_039;

    FUNCTION func_039(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_039_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1078;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_78(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_78;

        PROCEDURE sub_proc_78(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_78(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_78;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_78(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_78;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_78(v_local_1);
        sub_proc_78(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_039;

    PROCEDURE proc_040(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_040_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1079;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_79(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_79;

        PROCEDURE sub_proc_79(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_79(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_79;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_79(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_79;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_79(v_local_1);
        sub_proc_79(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_040;

    FUNCTION func_040(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_040_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1080;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_80(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_80;

        PROCEDURE sub_proc_80(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_80(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_80;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_80(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_80;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_80(v_local_1);
        sub_proc_80(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_040;

    PROCEDURE proc_041(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_041_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1081;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_81(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_81;

        PROCEDURE sub_proc_81(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_81(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_81;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_81(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_81;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_81(v_local_1);
        sub_proc_81(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_041;

    FUNCTION func_041(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_041_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1082;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_82(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_82;

        PROCEDURE sub_proc_82(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_82(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_82;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_82(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_82;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_82(v_local_1);
        sub_proc_82(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_041;

    PROCEDURE proc_042(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_042_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1083;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_83(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_83;

        PROCEDURE sub_proc_83(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_83(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_83;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_83(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_83;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_83(v_local_1);
        sub_proc_83(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_042;

    FUNCTION func_042(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_042_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1084;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_84(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_84;

        PROCEDURE sub_proc_84(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_84(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_84;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_84(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_84;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_84(v_local_1);
        sub_proc_84(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_042;

    PROCEDURE proc_043(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_043_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1085;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_85(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_85;

        PROCEDURE sub_proc_85(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_85(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_85;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_85(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_85;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_85(v_local_1);
        sub_proc_85(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_043;

    FUNCTION func_043(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_043_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1086;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_86(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_86;

        PROCEDURE sub_proc_86(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_86(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_86;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_86(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_86;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_86(v_local_1);
        sub_proc_86(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_043;

    PROCEDURE proc_044(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_044_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1087;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_87(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_87;

        PROCEDURE sub_proc_87(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_87(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_87;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_87(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_87;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_87(v_local_1);
        sub_proc_87(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_044;

    FUNCTION func_044(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_044_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1088;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_88(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_88;

        PROCEDURE sub_proc_88(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_88(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_88;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_88(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_88;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_88(v_local_1);
        sub_proc_88(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_044;

    PROCEDURE proc_045(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_045_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1089;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_89(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_89;

        PROCEDURE sub_proc_89(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_89(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_89;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_89(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_89;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_89(v_local_1);
        sub_proc_89(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_045;

    FUNCTION func_045(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_045_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1090;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_90(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_90;

        PROCEDURE sub_proc_90(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_90(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_90;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_90(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_90;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_90(v_local_1);
        sub_proc_90(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_045;

    PROCEDURE proc_046(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_046_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1091;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_91(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_91;

        PROCEDURE sub_proc_91(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_91(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_91;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_91(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_91;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_91(v_local_1);
        sub_proc_91(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_046;

    FUNCTION func_046(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_046_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1092;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_92(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_92;

        PROCEDURE sub_proc_92(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_92(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_92;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_92(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_92;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_92(v_local_1);
        sub_proc_92(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_046;

    PROCEDURE proc_047(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_047_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1093;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_93(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_93;

        PROCEDURE sub_proc_93(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_93(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_93;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_93(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_93;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_93(v_local_1);
        sub_proc_93(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_047;

    FUNCTION func_047(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_047_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1094;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_94(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_94;

        PROCEDURE sub_proc_94(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_94(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_94;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_94(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_94;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_94(v_local_1);
        sub_proc_94(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_047;

    PROCEDURE proc_048(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_048_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1095;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_95(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_95;

        PROCEDURE sub_proc_95(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_95(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_95;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_95(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_95;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_95(v_local_1);
        sub_proc_95(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_048;

    FUNCTION func_048(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_048_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1096;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_96(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_96;

        PROCEDURE sub_proc_96(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_96(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_96;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_96(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_96;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_96(v_local_1);
        sub_proc_96(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_048;

    PROCEDURE proc_049(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_049_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1097;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_97(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_97;

        PROCEDURE sub_proc_97(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_97(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_97;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_97(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_97;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_97(v_local_1);
        sub_proc_97(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_049;

    FUNCTION func_049(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_049_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1098;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_98(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_98;

        PROCEDURE sub_proc_98(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_98(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_98;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_98(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_98;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_98(v_local_1);
        sub_proc_98(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_049;

    PROCEDURE proc_050(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_050_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1099;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_99(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_99;

        PROCEDURE sub_proc_99(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_99(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_99;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_99(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_99;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_99(v_local_1);
        sub_proc_99(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_050;

    FUNCTION func_050(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_050_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1100;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_100(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_100;

        PROCEDURE sub_proc_100(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_100(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_100;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_100(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_100;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_100(v_local_1);
        sub_proc_100(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_050;

    PROCEDURE proc_051(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_051_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1101;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_101(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_101;

        PROCEDURE sub_proc_101(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_101(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_101;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_101(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_101;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_101(v_local_1);
        sub_proc_101(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_051;

    FUNCTION func_051(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_051_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1102;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_102(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_102;

        PROCEDURE sub_proc_102(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_102(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_102;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_102(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_102;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_102(v_local_1);
        sub_proc_102(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_051;

    PROCEDURE proc_052(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_052_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1103;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_103(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_103;

        PROCEDURE sub_proc_103(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_103(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_103;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_103(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_103;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_103(v_local_1);
        sub_proc_103(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_052;

    FUNCTION func_052(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_052_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1104;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_104(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_104;

        PROCEDURE sub_proc_104(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_104(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_104;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_104(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_104;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_104(v_local_1);
        sub_proc_104(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_052;

    PROCEDURE proc_053(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_053_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1105;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_105(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_105;

        PROCEDURE sub_proc_105(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_105(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_105;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_105(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_105;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_105(v_local_1);
        sub_proc_105(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_053;

    FUNCTION func_053(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_053_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1106;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_106(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_106;

        PROCEDURE sub_proc_106(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_106(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_106;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_106(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_106;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_106(v_local_1);
        sub_proc_106(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_053;

    PROCEDURE proc_054(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_054_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1107;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_107(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_107;

        PROCEDURE sub_proc_107(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_107(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_107;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_107(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_107;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_107(v_local_1);
        sub_proc_107(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_054;

    FUNCTION func_054(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_054_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1108;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_108(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_108;

        PROCEDURE sub_proc_108(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_108(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_108;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_108(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_108;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_108(v_local_1);
        sub_proc_108(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_054;

    PROCEDURE proc_055(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_055_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1109;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_109(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_109;

        PROCEDURE sub_proc_109(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_109(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_109;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_109(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_109;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_109(v_local_1);
        sub_proc_109(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_055;

    FUNCTION func_055(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_055_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1110;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_110(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_110;

        PROCEDURE sub_proc_110(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_110(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_110;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_110(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_110;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_110(v_local_1);
        sub_proc_110(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_055;

    PROCEDURE proc_056(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_056_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1111;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_111(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_111;

        PROCEDURE sub_proc_111(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_111(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_111;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_111(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_111;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_111(v_local_1);
        sub_proc_111(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_056;

    FUNCTION func_056(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_056_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1112;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_112(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_112;

        PROCEDURE sub_proc_112(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_112(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_112;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_112(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_112;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_112(v_local_1);
        sub_proc_112(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_056;

    PROCEDURE proc_057(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_057_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1113;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_113(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_113;

        PROCEDURE sub_proc_113(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_113(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_113;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_113(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_113;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_113(v_local_1);
        sub_proc_113(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_057;

    FUNCTION func_057(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_057_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1114;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_114(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_114;

        PROCEDURE sub_proc_114(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_114(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_114;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_114(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_114;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_114(v_local_1);
        sub_proc_114(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_057;

    PROCEDURE proc_058(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_058_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1115;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_115(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_115;

        PROCEDURE sub_proc_115(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_115(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_115;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_115(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_115;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_115(v_local_1);
        sub_proc_115(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_058;

    FUNCTION func_058(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_058_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1116;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_116(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_116;

        PROCEDURE sub_proc_116(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_116(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_116;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_116(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_116;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_116(v_local_1);
        sub_proc_116(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_058;

    PROCEDURE proc_059(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_059_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1117;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_117(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_117;

        PROCEDURE sub_proc_117(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_117(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_117;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_117(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_117;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_117(v_local_1);
        sub_proc_117(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_059;

    FUNCTION func_059(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_059_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1118;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_118(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_118;

        PROCEDURE sub_proc_118(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_118(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_118;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_118(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_118;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_118(v_local_1);
        sub_proc_118(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_059;

    PROCEDURE proc_060(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_060_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1119;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_119(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_119;

        PROCEDURE sub_proc_119(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_119(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_119;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_119(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_119;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_119(v_local_1);
        sub_proc_119(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_060;

    FUNCTION func_060(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_060_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1120;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_120(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_120;

        PROCEDURE sub_proc_120(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_120(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_120;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_120(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_120;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_120(v_local_1);
        sub_proc_120(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_060;

    PROCEDURE proc_061(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_061_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1121;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_121(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_121;

        PROCEDURE sub_proc_121(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_121(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_121;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_121(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_121;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_121(v_local_1);
        sub_proc_121(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_061;

    FUNCTION func_061(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_061_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1122;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_122(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_122;

        PROCEDURE sub_proc_122(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_122(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_122;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_122(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_122;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_122(v_local_1);
        sub_proc_122(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_061;

    PROCEDURE proc_062(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_062_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1123;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_123(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_123;

        PROCEDURE sub_proc_123(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_123(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_123;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_123(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_123;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_123(v_local_1);
        sub_proc_123(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_062;

    FUNCTION func_062(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_062_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1124;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_124(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_124;

        PROCEDURE sub_proc_124(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_124(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_124;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_124(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_124;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_124(v_local_1);
        sub_proc_124(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_062;

    PROCEDURE proc_063(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_063_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1125;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_125(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_125;

        PROCEDURE sub_proc_125(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_125(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_125;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_125(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_125;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_125(v_local_1);
        sub_proc_125(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_063;

    FUNCTION func_063(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_063_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1126;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_126(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_126;

        PROCEDURE sub_proc_126(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_126(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_126;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_126(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_126;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_126(v_local_1);
        sub_proc_126(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_063;

    PROCEDURE proc_064(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_064_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1127;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_127(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_127;

        PROCEDURE sub_proc_127(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_127(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_127;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_127(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_127;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_127(v_local_1);
        sub_proc_127(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_064;

    FUNCTION func_064(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_064_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1128;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_128(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_128;

        PROCEDURE sub_proc_128(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_128(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_128;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_128(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_128;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_128(v_local_1);
        sub_proc_128(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_064;

    PROCEDURE proc_065(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_065_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1129;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_129(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_129;

        PROCEDURE sub_proc_129(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_129(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_129;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_129(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_129;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_129(v_local_1);
        sub_proc_129(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_065;

    FUNCTION func_065(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_065_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1130;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_130(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_130;

        PROCEDURE sub_proc_130(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_130(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_130;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_130(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_130;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_130(v_local_1);
        sub_proc_130(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_065;

    PROCEDURE proc_066(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_066_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1131;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_131(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_131;

        PROCEDURE sub_proc_131(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_131(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_131;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_131(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_131;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_131(v_local_1);
        sub_proc_131(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_066;

    FUNCTION func_066(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_066_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1132;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_132(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_132;

        PROCEDURE sub_proc_132(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_132(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_132;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_132(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_132;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_132(v_local_1);
        sub_proc_132(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_066;

    PROCEDURE proc_067(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_067_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1133;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_133(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_133;

        PROCEDURE sub_proc_133(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_133(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_133;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_133(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_133;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_133(v_local_1);
        sub_proc_133(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_067;

    FUNCTION func_067(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_067_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1134;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_134(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_134;

        PROCEDURE sub_proc_134(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_134(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_134;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_134(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_134;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_134(v_local_1);
        sub_proc_134(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_067;

    PROCEDURE proc_068(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_068_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1135;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_135(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_135;

        PROCEDURE sub_proc_135(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_135(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_135;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_135(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_135;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_135(v_local_1);
        sub_proc_135(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_068;

    FUNCTION func_068(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_068_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1136;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_136(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_136;

        PROCEDURE sub_proc_136(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_136(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_136;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_136(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_136;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_136(v_local_1);
        sub_proc_136(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_068;

    PROCEDURE proc_069(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_069_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1137;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_137(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_137;

        PROCEDURE sub_proc_137(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_137(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_137;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_137(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_137;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_137(v_local_1);
        sub_proc_137(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_069;

    FUNCTION func_069(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_069_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1138;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_138(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_138;

        PROCEDURE sub_proc_138(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_138(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_138;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_138(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_138;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_138(v_local_1);
        sub_proc_138(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_069;

    PROCEDURE proc_070(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_070_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1139;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_139(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_139;

        PROCEDURE sub_proc_139(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_139(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_139;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_139(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_139;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_139(v_local_1);
        sub_proc_139(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_070;

    FUNCTION func_070(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_070_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1140;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_140(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_140;

        PROCEDURE sub_proc_140(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_140(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_140;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_140(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_140;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_140(v_local_1);
        sub_proc_140(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_070;

    PROCEDURE proc_071(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_071_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1141;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_141(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_141;

        PROCEDURE sub_proc_141(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_141(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_141;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_141(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_141;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_141(v_local_1);
        sub_proc_141(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_071;

    FUNCTION func_071(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_071_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1142;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_142(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_142;

        PROCEDURE sub_proc_142(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_142(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_142;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_142(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_142;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_142(v_local_1);
        sub_proc_142(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_071;

    PROCEDURE proc_072(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_072_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1143;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_143(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_143;

        PROCEDURE sub_proc_143(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_143(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_143;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_143(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_143;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_143(v_local_1);
        sub_proc_143(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_072;

    FUNCTION func_072(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_072_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1144;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_144(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_144;

        PROCEDURE sub_proc_144(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_144(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_144;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_144(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_144;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_144(v_local_1);
        sub_proc_144(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_072;

    PROCEDURE proc_073(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_073_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1145;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_145(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_145;

        PROCEDURE sub_proc_145(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_145(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_145;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_145(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_145;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_145(v_local_1);
        sub_proc_145(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_073;

    FUNCTION func_073(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_073_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1146;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_146(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_146;

        PROCEDURE sub_proc_146(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_146(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_146;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_146(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_146;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_146(v_local_1);
        sub_proc_146(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_073;

    PROCEDURE proc_074(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_074_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1147;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_147(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_147;

        PROCEDURE sub_proc_147(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_147(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_147;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_147(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_147;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_147(v_local_1);
        sub_proc_147(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_074;

    FUNCTION func_074(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_074_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1148;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_148(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_148;

        PROCEDURE sub_proc_148(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_148(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_148;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_148(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_148;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_148(v_local_1);
        sub_proc_148(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_074;

    PROCEDURE proc_075(p_param IN NUMBER)
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'proc_075_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1149;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_149(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_149;

        PROCEDURE sub_proc_149(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_149(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_149;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_149(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_149;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_149(v_local_1);
        sub_proc_149(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
    END proc_075;

    FUNCTION func_075(p_param IN NUMBER) RETURN NUMBER
    IS
        -- 局部声明
        v_local_1 NUMBER := 0;
        v_local_2 VARCHAR2(100) := 'func_075_init';
        v_local_3 DATE := SYSDATE;
        c_local_max NUMBER CONSTANT := 1150;
        TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));
        CURSOR c_local (p_id NUMBER) IS
            SELECT level AS lvl FROM dual CONNECT BY level <= p_id;
        e_local_error EXCEPTION;

        FUNCTION sub_calc_150(p_val IN NUMBER) RETURN NUMBER
        IS
            v_sub NUMBER := p_val;
        BEGIN
            IF p_val IS NULL THEN
                RETURN 0;
            ELSIF p_val > 0 THEN
                RETURN p_val * 2;
            ELSE
                RETURN -p_val;
            END IF;
        END sub_calc_150;

        PROCEDURE sub_proc_150(p_in IN NUMBER)
        IS
            v_acc NUMBER := 0;
            -- 直接的子子函数（第 3→4 级，声明后定义体）
            FUNCTION innermost_150(p_x NUMBER) RETURN NUMBER
            IS
            BEGIN
                IF p_x IS NULL THEN
                    RETURN 0;
                END IF;
                RETURN p_x * p_x;
            END innermost_150;
        BEGIN
            FOR j IN 1 .. p_in LOOP
                v_acc := v_acc + j;
            END LOOP;
            v_acc := v_acc + innermost_150(v_acc);
            WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP
                v_acc := v_acc - 1;
            END LOOP;
        END sub_proc_150;

    BEGIN
        FOR i IN 1 .. p_param LOOP
            IF p_param > 0 THEN
                FOR k IN REVERSE 1 .. 5 LOOP
                    v_local_1 := v_local_1 + k;
                    WHILE v_local_1 < c_local_max LOOP
                        v_local_1 := v_local_1 + 1;
                        CASE
                            WHEN MOD(v_local_1, 2) = 0 THEN
                                v_local_2 := 'branch_0';
                            WHEN MOD(v_local_1, 3) = 0 THEN
                                v_local_2 := 'branch_1';
                            WHEN MOD(v_local_1, 4) = 0 THEN
                                v_local_2 := 'branch_2';
                            ELSE
                                v_local_2 := 'default';
                        END CASE;
                    END LOOP;
                END LOOP;
            ELSE
                IF p_param IS NOT NULL THEN
                    v_local_1 := 0;
                    LOOP
                        EXIT WHEN v_local_1 >= ABS(p_param);
                        v_local_1 := v_local_1 + 1;
                    END LOOP;
                END IF;
            END IF;
        END LOOP;
        v_local_1 := sub_calc_150(v_local_1);
        sub_proc_150(p_param);
        v_local_2 := 'value -- not a comment';
        v_local_2 := v_local_2 || '/* also not a comment */';
        EXCEPTION
            WHEN e_local_error THEN
                v_local_1 := -1;
            WHEN OTHERS THEN
                v_local_1 := -2;
        RETURN v_local_1;
    END func_075;

BEGIN
    -- 包初始化
    v_pkg_var_01 := c_const_01;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
END huge_test_pkg;
/
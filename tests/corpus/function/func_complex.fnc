-- =============================================================================
-- 用例: Function / 复杂结构 (func_complex.fnc)
-- 覆盖点:
--   [1] 多行签名(参数逐行, 验证 CREATE 跨行前瞻) + DETERMINISTIC
--   [2] 声明区全家桶: 变量 / 常量(Oracle 标准语序) / 显式游标 / TYPE RECORD /
--       命名异常 / PRAGMA EXCEPTION_INIT
--   [3] 嵌套子程序 3 层: sub_calc_score(过程) > sub_format_line(函数) >
--       sub_inner_check(过程, 嵌套于子函数内)
--   [4] 循环: 基础 LOOP..EXIT WHEN / WHILE / FOR / 游标 FOR(子查询跨行)
--   [5] 嵌套 3 层循环: FOR > WHILE > FOR
--   [6] 注释: 单行 -- / 多行 /* */ / 注释掉正常代码结构
--       (单行注释掉的 IF 块 + 块注释掉的整个子过程)
--   [7] Q-quote 字符串 q'[...]' / q'{...}', 内含 -- 与 /* */
--   [8] 体内内联匿名块 DECLARE..BEGIN..EXCEPTION..END;
--   [9] EXCEPTION 多 WHEN 分支 + 各层嵌套子程序自己的 EXCEPTION
-- 预期大纲:
--   FUNC_ORDER_STATS (Function)
--   ├ Declaration: c_max_items/c_factor(常量) v_*(变量) c_items(游标)
--   │             t_score_rec(类型) e_bad_score(异常)
--   ├ Sub Program: sub_calc_score > sub_format_line > sub_inner_check
--   ├ Body: IF/FOR/WHILE/LOOP/游标FOR + 内联匿名块
--   └ Exception: WHEN e_bad_score / WHEN NO_DATA_FOUND / WHEN OTHERS
-- =============================================================================
CREATE OR REPLACE FUNCTION func_order_stats(
    p_order_id  IN  NUMBER,
    p_min_score IN  NUMBER DEFAULT 0,
    p_verbose   IN  VARCHAR2 := 'N'
)
RETURN NUMBER
DETERMINISTIC
IS
    -- 常量(Oracle 标准语序: name CONSTANT type := value)
    c_max_items  CONSTANT NUMBER := 500;
    c_factor     CONSTANT NUMBER := 1.5;

    -- 变量
    v_total      NUMBER := 0;
    v_weight     NUMBER := 10;
    v_text       VARCHAR2(4000);
    v_result     NUMBER;

    -- 显式游标(SELECT 体跨行)
    CURSOR c_items IS
        SELECT item_id, score, weight
          FROM order_items
         WHERE order_id = p_order_id;

    -- 自定义类型
    TYPE t_score_rec IS RECORD (
        item_id NUMBER,
        score   NUMBER(15, 2)
    );
    r_score      t_score_rec;

    -- 命名异常
    e_bad_score  EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_bad_score, -20100);

    -- ----- 嵌套子程序 第 1 层: 子过程 -----
    PROCEDURE sub_calc_score(
        p_score  IN  NUMBER,
        p_weight IN  NUMBER,
        p_result OUT NUMBER
    ) IS
        v_step  NUMBER := 0;
        v_line  VARCHAR2(200);

        -- ----- 嵌套子程序 第 2 层: 子函数(位于子过程内) -----
        FUNCTION sub_format_line(p_idx IN NUMBER) RETURN VARCHAR2 IS
            v_buf  VARCHAR2(200);

            -- ----- 嵌套子程序 第 3 层: 子过程(位于子函数内) -----
            PROCEDURE sub_inner_check(p_val IN NUMBER) IS
            BEGIN
                IF p_val < 0 THEN
                    RAISE e_bad_score;
                END IF;
            EXCEPTION
                WHEN e_bad_score THEN
                    NULL;
                WHEN OTHERS THEN
                    NULL;
            END sub_inner_check;
        BEGIN
            sub_inner_check(p_idx);
            v_buf := 'item #' || TO_CHAR(p_idx);
            RETURN v_buf;
        EXCEPTION
            WHEN OTHERS THEN
                RETURN '?';
        END sub_format_line;
    BEGIN
        v_step := p_score * p_weight;

        -- 基础 LOOP + EXIT WHEN
        LOOP
            v_step := v_step + 1;
            EXIT WHEN v_step >= p_score * c_factor;
        END LOOP;

        -- 嵌套 3 层循环: FOR > WHILE > FOR
        FOR i IN 1 .. 5 LOOP
            WHILE v_weight > 0 LOOP
                FOR j IN 1 .. 3 LOOP
                    v_step := v_step + i * j;
                END LOOP;
                v_weight := v_weight - 1;
            END LOOP;
            v_weight := v_weight + 2;
        END LOOP;

        v_line := sub_format_line(v_step);
        p_result := v_step + LENGTH(v_line);
    EXCEPTION
        WHEN e_bad_score THEN
            p_result := -1;
        WHEN OTHERS THEN
            p_result := -2;
    END sub_calc_score;

BEGIN
    -- 单行注释掉的 IF 块(不应出现在大纲中)
    -- IF v_total > c_max_items THEN
    --     v_total := c_max_items;
    -- END IF;

    /*
       块注释掉的整个子过程(不应出现在大纲中):
       PROCEDURE legacy_audit(p_id IN NUMBER) IS
       BEGIN
           NULL;
       END legacy_audit;
    */

    -- 游标 FOR 循环(内联子查询跨行)
    FOR rec IN (
        SELECT item_id, score
          FROM order_items
         WHERE order_id = p_order_id
    ) LOOP
        IF rec.score >= p_min_score THEN
            sub_calc_score(rec.score, 10, v_result);
            v_total := v_total + v_result;
        ELSE
            v_total := v_total + 1;
        END IF;
    END LOOP;

    -- Q-quote 字符串(内含 -- 与 /* */, 不应破坏解析)
    v_text := q'[raw -- value /* keep */ {order}]';
    v_text := v_text || q'{another (text) block}';

    -- 显式游标 OPEN/FETCH/CLOSE + WHILE
    OPEN c_items;
    FETCH c_items INTO r_score;
    WHILE c_items%FOUND LOOP
        v_total := v_total + r_score.score;
        FETCH c_items INTO r_score;
    END LOOP;
    CLOSE c_items;

    -- 体内内联匿名块(含自己的 EXCEPTION)
    DECLARE
        v_local  NUMBER := 0;
    BEGIN
        FOR k IN 1 .. 3 LOOP
            v_local := v_local + k;
        END LOOP;
        v_total := v_total + v_local;
    EXCEPTION
        WHEN OTHERS THEN
            NULL;
    END;

    RETURN v_total;
EXCEPTION
    WHEN e_bad_score THEN
        RETURN -1;
    WHEN NO_DATA_FOUND THEN
        RETURN -2;
    WHEN OTHERS THEN
        RETURN -99;
END func_order_stats;
/

-- =============================================================================
-- 用例: Trigger / 复杂结构 (trg_complex.trg)
-- 覆盖点:
--   [1] 多事件触发器(BEFORE INSERT OR UPDATE OF ...) + REFERENCING 别名
--   [2] 触发器 DECLARE 区完整声明(变量/常量/异常)
--   [3] 触发器匿名块内嵌套子程序 2 层: build_audit_text(函数) > append_tag(过程)
--   [4] 循环: 基础 LOOP..EXIT WHEN / WHILE / FOR + 嵌套 3 层循环(FOR>FOR>WHILE)
--   [5] 注释: 单行/多行/注释掉的代码结构(IF 块/子过程)
--   [6] Q-quote 字符串 / 搜索式 CASE + ELSE(Issue #3 场景)
--   [7] 内联匿名块(含嵌套子程序) + EXCEPTION 多 WHEN
-- 注: 触发器体在解析器中作为 Trigger 节点下的匿名块(ANONYMOUS_BLOCK)处理,
--     嵌套子程序位于该匿名块的声明区内。
-- 预期大纲:
--   TRG_ORDERS_AUDIT (Trigger)
--   └ Anonymous Block(触发器体)
--       ├ Declaration: v_*(变量) c_max_len(常量) e_too_big(异常)
--       ├ Sub Program: build_audit_text > append_tag
--       ├ Body: IF/CASE/FOR/WHILE + 内联匿名块
--       └ Exception: WHEN e_too_big / WHEN OTHERS
-- =============================================================================
CREATE OR REPLACE TRIGGER trg_orders_audit
BEFORE INSERT OR UPDATE OF status, amount ON orders
REFERENCING NEW AS n OLD AS o
FOR EACH ROW
DECLARE
    v_user     VARCHAR2(30);
    v_old_val  NUMBER;
    v_new_val  NUMBER;
    c_max_len  CONSTANT NUMBER := 200;
    v_buf      VARCHAR2(4000);

    e_too_big  EXCEPTION;

    -- ----- 嵌套子程序 第 1 层: 子函数 -----
    FUNCTION build_audit_text(p_field IN VARCHAR2) RETURN VARCHAR2 IS
        v_text  VARCHAR2(4000);

        -- ----- 嵌套子程序 第 2 层: 子过程(位于子函数内) -----
        PROCEDURE append_tag(p_tag IN VARCHAR2) IS
        BEGIN
            v_text := SUBSTR(v_text || ' [' || p_tag || ']', 1, c_max_len);
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END append_tag;
    BEGIN
        v_text := p_field || '@' || TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS');
        append_tag(v_user);
        RETURN v_text;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN '?';
    END build_audit_text;

BEGIN
    v_user := USER;
    v_old_val := :old.amount;
    v_new_val := :new.amount;

    -- 被单行注释注释掉的 IF 块(不应出现在大纲)
    -- IF :new.status = 'X' THEN
    --     :new.amount := 0;
    -- END IF;

    /*
       被块注释注释掉的子过程(不应出现在大纲):
       PROCEDURE legacy_touch IS
       BEGIN
           NULL;
       END legacy_touch;
    */

    -- Q-quote 字符串(内含注释标记)
    v_buf := q'[audit -- change /*delta*/ ]' || TO_CHAR(v_new_val - v_old_val);

    IF :new.status IS NULL THEN
        :new.status := 'NEW';
    END IF;

    -- 嵌套 3 层循环: FOR > FOR > WHILE(生成审计明细)
    FOR i IN 1 .. 3 LOOP
        FOR j IN 1 .. 2 LOOP
            WHILE LENGTH(v_buf) < c_max_len LOOP
                v_buf := v_buf || '.';
            END LOOP;
        END LOOP;
    END LOOP;

    -- 搜索式 CASE + ELSE
    CASE
        WHEN v_new_val > v_old_val THEN
            INSERT INTO orders_audit(order_id, note) VALUES (:new.order_id, build_audit_text('UP'));
        WHEN v_new_val < v_old_val THEN
            INSERT INTO orders_audit(order_id, note) VALUES (:new.order_id, build_audit_text('DOWN'));
        ELSE
            NULL;
    END CASE;

    -- 内联匿名块(含嵌套子程序与 EXCEPTION)
    DECLARE
        v_local  NUMBER := 0;

        PROCEDURE sub_guard(p_in IN NUMBER) IS
        BEGIN
            IF p_in > c_max_len THEN
                RAISE e_too_big;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                NULL;
        END sub_guard;
    BEGIN
        sub_guard(LENGTH(v_buf));
    EXCEPTION
        WHEN e_too_big THEN
            NULL;
        WHEN OTHERS THEN
            NULL;
    END;

    :new.audit_text := v_buf;
EXCEPTION
    WHEN e_too_big THEN
        :new.audit_text := SUBSTR(v_buf, 1, c_max_len);
    WHEN OTHERS THEN
        NULL;
END trg_orders_audit;
/

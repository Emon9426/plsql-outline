-- 匿名块：DECLARE ... BEGIN ... END（无 CREATE，无名称，顶层即匿名块）
DECLARE
    -- 声明部分
    v_total     NUMBER := 0;
    v_count     NUMBER := 0;
    c_batch_size CONSTANT NUMBER := 100;
    CURSOR c_orders IS
        SELECT id, amount, status
          FROM orders
         WHERE status = 'PENDING';
    TYPE t_summary_rec IS RECORD (
        total   NUMBER,
        counted NUMBER
    );
    e_batch_fail EXCEPTION;

    -- 匿名块内的嵌套子程序（验证匿名块也支持 Sub Program）
    FUNCTION is_valid_amount(p_amt IN NUMBER) RETURN BOOLEAN IS
    BEGIN
        RETURN p_amt IS NOT NULL AND p_amt > 0;
    END is_valid_amount;

    PROCEDURE accumulate(p_amt IN NUMBER) IS
    BEGIN
        IF is_valid_amount(p_amt) THEN
            v_total := v_total + p_amt;
            v_count := v_count + 1;
        END IF;
    END accumulate;
BEGIN
    -- 主程序体
    FOR rec IN c_orders LOOP
        accumulate(rec.amount);

        IF v_count >= c_batch_size THEN
            EXIT;
        END IF;
    END LOOP;

    -- WHILE 循环 + CASE
    WHILE v_count > 0 LOOP
        CASE
            WHEN v_count > 50 THEN
                v_count := v_count - 10;
            ELSE
                v_count := v_count - 1;
        END CASE;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('Total: ' || v_total);
EXCEPTION
    WHEN e_batch_fail THEN
        v_total := -1;
    WHEN OTHERS THEN
        NULL;
END;
/


-- 触发器：CREATE OR REPLACE TRIGGER ...（无包包裹，顶层即触发器）
CREATE OR REPLACE TRIGGER audit_order_trg
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
DECLARE
    v_user      VARCHAR2(30) := USER;
    v_timestamp DATE := SYSDATE;
    c_max_len   CONSTANT NUMBER := 50;
BEGIN
    -- 触发器体
    IF :new.created_by IS NULL THEN
        :new.created_by := v_user;
    END IF;

    IF :new.created_date IS NULL THEN
        :new.created_date := v_timestamp;
    END IF;

    IF LENGTH(:new.created_by) > c_max_len THEN
        :new.created_by := SUBSTR(:new.created_by, 1, c_max_len);
    END IF;
END;
/

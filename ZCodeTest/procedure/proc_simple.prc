-- =============================================================================
-- 用例: Procedure / 简单结构 (proc_simple.prc)
-- 结构: CREATE OR REPLACE PROCEDURE + IN/OUT 参数 + 声明区 + DML
--       + IF/ELSE + EXCEPTION(两个 WHEN 分支) + END
-- 预期大纲:
--   PROC_SYNC_CUSTOMER (Procedure)
--   ├ Declaration: v_name / v_rows
--   ├ Body: IF SQL%ROWCOUNT = 0 ...
--   └ Exception: WHEN NO_DATA_FOUND / WHEN OTHERS
-- =============================================================================
CREATE OR REPLACE PROCEDURE proc_sync_customer(p_customer_id IN NUMBER, p_status OUT VARCHAR2) IS
    v_name  VARCHAR2(100);
    v_rows  NUMBER := 0;
BEGIN
    SELECT customer_name
      INTO v_name
      FROM customers
     WHERE customer_id = p_customer_id;

    UPDATE customers
       SET last_sync_date = SYSDATE
     WHERE customer_id = p_customer_id;

    v_rows := SQL%ROWCOUNT;
    IF v_rows = 0 THEN
        p_status := 'NOT_FOUND';
    ELSE
        p_status := 'OK';
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_status := 'NOT_FOUND';
    WHEN OTHERS THEN
        p_status := 'ERROR';
END proc_sync_customer;
/

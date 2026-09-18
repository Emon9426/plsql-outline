-- =============================================================================
-- 用例: Trigger / 简单结构 (trg_simple.trg)
-- 结构: 单事件行级触发器 + DECLARE 区(变量/常量) + IF/ELSIF/ELSE + EXCEPTION
-- 预期大纲:
--   TRG_ORDERS_BI (Trigger)
--   └ Anonymous Block(触发器体)
--       ├ Declaration: v_user / c_max_len
--       ├ Body: IF :new.created_by IS NULL ...
--       └ Exception: WHEN OTHERS
-- =============================================================================
CREATE OR REPLACE TRIGGER trg_orders_bi
BEFORE INSERT ON orders
FOR EACH ROW
DECLARE
    v_user     VARCHAR2(30);
    c_max_len  CONSTANT NUMBER := 50;
BEGIN
    IF :new.created_by IS NULL THEN
        :new.created_by := USER;
    ELSIF LENGTH(:new.created_by) > c_max_len THEN
        :new.created_by := SUBSTR(:new.created_by, 1, c_max_len);
    ELSE
        NULL;
    END IF;

    IF :new.created_date IS NULL THEN
        :new.created_date := SYSDATE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        :new.created_by := 'SYSTEM';
END trg_orders_bi;
/

-- =============================================================================
-- 用例: CREATE VIEW(视图) / 简单结构 (view_simple.sql)
-- 说明: 补充覆盖 —— 视图非 PL/SQL 程序单元, 解析器识别为 VIEW 节点以免丢弃。
-- =============================================================================
CREATE OR REPLACE VIEW v_active_orders AS
SELECT order_id, customer_id, amount
  FROM orders
 WHERE status = 'ACTIVE';
/

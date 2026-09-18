-- =============================================================================
-- 用例: Package Body / 简单结构 (pkg_body_simple.pkb)
-- 结构: 包级变量 + 两个成员(函数/过程, 各含 EXCEPTION) + END 收尾
--       (无包初始化块, 验证 BUG-B: 无初始化块的包体顶层 END 正常闭合)
-- 预期大纲:
--   PKG_ORDER_API (Package Body)
--   ├ Declaration: g_call_count
--   ├ get_order_total (Function, 含 Exception)
--   └ close_order (Procedure, 含 Exception)
-- =============================================================================
CREATE OR REPLACE PACKAGE BODY pkg_order_api IS
    g_call_count  NUMBER := 0;

    FUNCTION get_order_total(p_order_id IN NUMBER) RETURN NUMBER IS
        v_total  NUMBER := 0;
    BEGIN
        SELECT NVL(SUM(amount), 0)
          INTO v_total
          FROM order_lines
         WHERE order_id = p_order_id;

        g_call_count := g_call_count + 1;
        RETURN v_total;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN -1;
    END get_order_total;

    PROCEDURE close_order(p_order_id IN NUMBER) IS
    BEGIN
        UPDATE orders
           SET status = 'CLOSED'
         WHERE order_id = p_order_id;

        IF SQL%ROWCOUNT = 0 THEN
            RAISE e_order_not_found;
        END IF;
    EXCEPTION
        WHEN e_order_not_found THEN
            RAISE;
        WHEN OTHERS THEN
            NULL;
    END close_order;
END pkg_order_api;
/

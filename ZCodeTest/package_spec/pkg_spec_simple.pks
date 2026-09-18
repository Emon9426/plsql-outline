-- =============================================================================
-- 用例: Package Spec / 简单结构 (pkg_spec_simple.pks)
-- 结构: CREATE OR REPLACE PACKAGE(schema 前缀) + 常量/异常/类型/游标
--       + 成员函数/过程声明, 以 END 收尾
-- 注: 包规格只有声明没有实现体 —— 不支持 Exception 段(由包体承担),
--     嵌套子程序体也只存在于包体中。
-- 预期大纲:
--   PKG_ORDER_API (Package Header)
--   ├ Declaration: c_pkg_version/c_max_retries(常量) t_order_rec(类型)
--   │             c_open_orders(游标) e_order_not_found(异常)
--   └ 成员声明: get_order_total / close_order
-- =============================================================================
CREATE OR REPLACE PACKAGE app_schema.pkg_order_api IS
    -- 常量
    c_pkg_version  CONSTANT VARCHAR2(20) := '1.0.0';
    c_max_retries  CONSTANT NUMBER := 3;

    -- 命名异常
    e_order_not_found  EXCEPTION;

    -- 类型
    TYPE t_order_rec IS RECORD (
        order_id  NUMBER,
        status    VARCHAR2(20)
    );

    -- 游标
    CURSOR c_open_orders IS
        SELECT order_id, status
          FROM orders
         WHERE status = 'OPEN';

    -- 成员函数声明
    FUNCTION get_order_total(p_order_id IN NUMBER) RETURN NUMBER;

    -- 成员过程声明
    PROCEDURE close_order(p_order_id IN NUMBER);
END pkg_order_api;
/

-- =============================================================================
-- 用例: Package Spec / 复杂结构 (pkg_spec_complex.pks)
-- 说明: 包规格只有声明没有实现体 —— 不支持 Exception 段与嵌套子程序体,
--       复杂度体现在: 注释(单行/多行/注释掉的成员)、多行签名、
--       常量(含 Q-quote 初值)、类型家族(RECORD/TABLE OF/VARRAY/REF CURSOR/
--       SUBTYPE)、显式游标、命名异常、成员函数/过程声明混合。
-- 预期大纲:
--   PKG_ORDER_API_COMPLEX (Package Header)
--   ├ Declaration: c_*(常量) e_*(异常) t_*(类型) c_open_orders(游标)
--   └ 成员声明: get_order_total / close_order / list_orders /
--               validate_and_migrate (被注释掉的成员不出现)
-- =============================================================================
CREATE OR REPLACE PACKAGE app_schema.pkg_order_api_complex IS

    -- ============================== 常量 ==============================
    c_version      CONSTANT VARCHAR2(20) := '2.0.0';
    c_max_lines    CONSTANT NUMBER := 999;
    c_default_hint CONSTANT VARCHAR2(200) := q'[OPTIMIZE /*+ FULL(t) */ -- default]';

    -- ============================== 异常 ==============================
    e_not_found    EXCEPTION;
    e_not_allowed  EXCEPTION;

    -- ============================== 类型 ==============================
    TYPE t_order_rec IS RECORD (
        order_id  NUMBER,
        status    VARCHAR2(20),
        amount    NUMBER(15, 2)
    );
    TYPE t_order_tab IS TABLE OF t_order_rec INDEX BY PLS_INTEGER;
    TYPE t_flag_list IS VARRAY(10) OF VARCHAR2(10);
    TYPE t_ref_cur   IS REF CURSOR RETURN t_order_rec;

    SUBTYPE t_status IS VARCHAR2(20);

    -- ============================== 游标 ==============================
    CURSOR c_open_orders IS
        SELECT order_id, status
          FROM orders
         WHERE status = 'OPEN';

    -- ============================ 成员声明 ============================
    -- 计算订单总额(多行签名)
    FUNCTION get_order_total(
        p_order_id     IN NUMBER,
        p_include_tax  IN VARCHAR2 DEFAULT 'N'
    ) RETURN NUMBER;

    -- 关闭订单(多行签名 + 默认值)
    PROCEDURE close_order(
        p_order_id  IN NUMBER,
        p_reason    IN VARCHAR2 DEFAULT NULL,
        p_closed_by IN VARCHAR2
    );

    -- 被单行注释注释掉的成员(不应出现在大纲):
    -- PROCEDURE purge_orders(p_days IN NUMBER);

    /* 被块注释注释掉的成员(不应出现在大纲):
    FUNCTION legacy_sum(p_order_id IN NUMBER) RETURN NUMBER;
    */

    -- 批量查询(返回引用游标)
    FUNCTION list_orders(p_status IN t_status) RETURN t_ref_cur;

    -- 校验并迁移(参数默认值含 Q-quote)
    PROCEDURE validate_and_migrate(
        p_batch_size IN NUMBER DEFAULT 500,
        p_dry_run    IN VARCHAR2 := q'[Y]'
    );
END pkg_order_api_complex;
/

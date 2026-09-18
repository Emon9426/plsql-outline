-- 语料：DBMS_METADATA.GET_DDL 默认输出形态（Issue #1 / Issue #19）
-- 特征：CREATE OR REPLACE FORCE EDITIONABLE 前导修饰词 + 带引号 schema 限定标识符
--       + END 带引号别名（实机 get_ddl 导出的标准签名，12c+ 默认）
-- 期望大纲：
--   根 PACKAGE_BODY: PKG_ORDER_API（引号去净）
--   ├─ Declaration（g_status）
--   ├─ get_order_total（含 IF/ELSE 与 EXCEPTION）
--   └─ close_order（含 UPDATE 与 EXCEPTION）
CREATE OR REPLACE FORCE EDITIONABLE PACKAGE BODY "SCOTT"."PKG_ORDER_API" AS

  g_status VARCHAR2(1) := 'N';

  PROCEDURE get_order_total(p_order_id IN NUMBER,
                            p_total    OUT NUMBER) IS
  BEGIN
    IF p_order_id IS NULL THEN
      p_total := 0;
    ELSE
      p_total := p_order_id * 2;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      p_total := -1;
  END get_order_total;

  PROCEDURE close_order(p_order_id IN NUMBER) IS
    v_closed VARCHAR2(1) := 'Y';
  BEGIN
    UPDATE orders
       SET status = v_closed
     WHERE order_id = p_order_id;
  EXCEPTION
    WHEN OTHERS THEN
      NULL;
  END close_order;

END "PKG_ORDER_API";
/

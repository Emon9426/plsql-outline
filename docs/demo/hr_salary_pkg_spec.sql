-- ============================================================
-- 演示文件：薪资管理包规范（package spec）
-- 展示 PL/SQL Outline 对包规范与子程序声明的解析
-- ============================================================
CREATE OR REPLACE PACKAGE hr_salary_pkg AS

  ------------------------------------------------------------
  -- 常量
  ------------------------------------------------------------
  c_max_salary CONSTANT NUMBER := 50000;
  c_min_salary CONSTANT NUMBER := 3000;

  ------------------------------------------------------------
  -- 自定义类型
  ------------------------------------------------------------
  TYPE t_emp_record IS RECORD (
    emp_id   NUMBER,
    emp_name VARCHAR2(100),
    salary   NUMBER
  );

  ------------------------------------------------------------
  -- 公有子程序声明
  ------------------------------------------------------------
  FUNCTION calc_annual_salary(p_monthly NUMBER,
                              p_bonus   NUMBER) RETURN NUMBER;

  PROCEDURE adjust_department_salary(
    p_dept_id IN NUMBER,
    p_percent IN NUMBER DEFAULT 10);

END hr_salary_pkg;

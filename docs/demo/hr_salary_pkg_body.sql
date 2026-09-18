-- ============================================================
-- 演示文件：薪资管理包体（package body）
-- 展示 PL/SQL Outline 对声明项 / 嵌套子程序 / 控制结构的解析
-- ============================================================
CREATE OR REPLACE PACKAGE BODY hr_salary_pkg AS

  ------------------------------------------------------------
  -- 常量
  ------------------------------------------------------------
  c_max_salary  CONSTANT NUMBER := 50000;
  c_min_salary  CONSTANT NUMBER := 3000;

  ------------------------------------------------------------
  -- 自定义类型
  ------------------------------------------------------------
  TYPE t_emp_record IS RECORD (
    emp_id   NUMBER,
    emp_name VARCHAR2(100),
    salary   NUMBER
  );

  TYPE t_salary_list IS TABLE OF NUMBER INDEX BY PLS_INTEGER;

  ------------------------------------------------------------
  -- 命名异常
  ------------------------------------------------------------
  e_salary_too_high EXCEPTION;
  PRAGMA EXCEPTION_INIT(e_salary_too_high, -20001);

  ------------------------------------------------------------
  -- 游标
  ------------------------------------------------------------
  CURSOR c_high_paid(p_dept_id NUMBER) IS
    SELECT employee_id, first_name, salary
      FROM employees
     WHERE department_id = p_dept_id
       AND salary > 10000
     ORDER BY salary DESC;

  ------------------------------------------------------------
  -- 全局变量
  ------------------------------------------------------------
  g_total_budget NUMBER;
  g_debug        BOOLEAN := TRUE;

  ------------------------------------------------------------
  -- 计算员工年薪（包内私有函数）
  ------------------------------------------------------------
  FUNCTION calc_annual_salary(p_monthly NUMBER,
                              p_bonus   NUMBER) RETURN NUMBER IS
    v_result NUMBER;
  BEGIN
    v_result := p_monthly * 12 + NVL(p_bonus, 0);

    IF v_result > c_max_salary THEN
      RAISE e_salary_too_high;
    ELSIF v_result < c_min_salary THEN
      v_result := c_min_salary;
    ELSE
      NULL;  -- 合理区间，直接返回
    END IF;

    RETURN v_result;
  EXCEPTION
    WHEN e_salary_too_high THEN
      RETURN c_max_salary;
    WHEN OTHERS THEN
      RETURN NULL;
  END calc_annual_salary;

  ------------------------------------------------------------
  -- 调整部门薪资（对外主过程）
  ------------------------------------------------------------
  PROCEDURE adjust_department_salary(
    p_dept_id IN NUMBER,
    p_percent IN NUMBER DEFAULT 10) IS
    v_emp  t_emp_record;
    v_list t_salary_list;
    v_idx  PLS_INTEGER := 0;
  BEGIN
    g_total_budget := 0;

    OPEN c_high_paid(p_dept_id);
    LOOP
      FETCH c_high_paid INTO v_emp;
      EXIT WHEN c_high_paid%NOTFOUND;

      v_idx := v_idx + 1;
      v_list(v_idx) := calc_annual_salary(v_emp.salary, 0);

      FOR i IN 1 .. v_idx LOOP
        CASE
          WHEN v_list(i) > 30000 THEN
            UPDATE employees
               SET salary = salary * 0.9
             WHERE employee_id = v_emp.emp_id;
          ELSE
            UPDATE employees
               SET salary = salary * (1 + p_percent / 100)
             WHERE employee_id = v_emp.emp_id;
        END CASE;
      END LOOP;
    END LOOP;
    CLOSE c_high_paid;

    -- 累计部门薪资总额（在 CASE/循环之后的同级 WHILE）
    WHILE v_idx > 0 LOOP
      g_total_budget := g_total_budget + v_list(v_idx);
      v_idx := v_idx - 1;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('Total budget: ' || g_total_budget);
  EXCEPTION
    WHEN OTHERS THEN
      IF c_high_paid%ISOPEN THEN
        CLOSE c_high_paid;
      END IF;
      RAISE;
  END adjust_department_salary;

END hr_salary_pkg;

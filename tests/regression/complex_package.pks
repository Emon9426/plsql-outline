/* 复杂包规范测试 */
CREATE OR REPLACE PACKAGE complex_package AS
  -- 常量声明
  MAX_VALUE CONSTANT NUMBER := 1000;
  
  -- 类型声明
  TYPE t_employee IS RECORD (
    id NUMBER,
    name VARCHAR2(100),
    salary NUMBER
  );
  
  TYPE t_employee_tab IS TABLE OF t_employee INDEX BY PLS_INTEGER;
  
  -- 异常声明
  invalid_value EXCEPTION;
  
  -- 函数声明
  FUNCTION calculate_bonus(p_salary NUMBER, p_factor NUMBER) RETURN NUMBER;
  
  -- 过程声明
  PROCEDURE process_employees(p_emp_tab IN OUT t_employee_tab);
  
  -- 嵌套函数声明
  FUNCTION format_name(p_name VARCHAR2) RETURN VARCHAR2;
  
  -- 注释中的关键字测试：BEGIN END FUNCTION PROCEDURE DECLARE
  /* 
   * 这是一个多行注释
   * 包含关键字：BEGIN 和 END
   * 以及 FUNCTION, PROCEDURE
   */
END complex_package;
/

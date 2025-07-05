/* 复杂包体测试 */
CREATE OR REPLACE PACKAGE BODY complex_package AS
  -- 实现计算奖金函数
  FUNCTION calculate_bonus(p_salary NUMBER, p_factor NUMBER) RETURN NUMBER IS
    v_bonus NUMBER;
    
    -- 嵌套函数：验证因子
    FUNCTION validate_factor(p_factor NUMBER) RETURN BOOLEAN IS
    BEGIN
      RETURN p_factor BETWEEN 0.1 AND 0.5;
    END validate_factor;
    
  BEGIN
    IF NOT validate_factor(p_factor) THEN
      RAISE invalid_value;
    END IF;
    
    v_bonus := p_salary * p_factor;
    RETURN v_bonus;
  END calculate_bonus;
  
  -- 实现处理员工过程
  PROCEDURE process_employees(p_emp_tab IN OUT t_employee_tab) IS
    v_index PLS_INTEGER;
    
    -- 嵌套过程：更新薪水
    PROCEDURE update_salary(emp IN OUT t_employee) IS
    BEGIN
      emp.salary := emp.salary * 1.1; -- 涨薪10%
    END update_salary;
    
  BEGIN
    v_index := p_emp_tab.FIRST;
    WHILE v_index IS NOT NULL LOOP
      -- 调用嵌套过程
      update_salary(p_emp_tab(v_index));
      v_index := p_emp_tab.NEXT(v_index);
    END LOOP;
  END process_employees;
  
  -- 实现格式化名称函数
  FUNCTION format_name(p_name VARCHAR2) RETURN VARCHAR2 IS
    v_formatted VARCHAR2(100);
    
    -- 深层嵌套函数：大写首字母
    FUNCTION capitalize(str VARCHAR2) RETURN VARCHAR2 IS
    BEGIN
      RETURN UPPER(SUBSTR(str, 1, 1)) || LOWER(SUBSTR(str, 2));
    END capitalize;
    
  BEGIN
    -- 处理姓名格式
    DECLARE
      v_names APEX_APPLICATION_GLOBAL.VC_ARR2;
      v_result VARCHAR2(100) := '';
    BEGIN
      v_names := APEX_STRING.SPLIT(p_name, ' ');
      FOR i IN 1..v_names.COUNT LOOP
        v_result := v_result || capitalize(v_names(i)) || ' ';
      END LOOP;
      RETURN TRIM(v_result);
    EXCEPTION
      WHEN OTHERS THEN
        RETURN p_name;
    END;
  END format_name;
  
  -- 注释中的关键字测试：BEGIN END FUNCTION PROCEDURE DECLARE
  /* 
   * 包体结束
   * 包含关键字：BEGIN 和 END
   */
END complex_package;
/

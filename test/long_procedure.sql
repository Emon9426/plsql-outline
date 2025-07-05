/* 超长过程文件测试 */
CREATE OR REPLACE PROCEDURE long_procedure AS
  -- 声明部分
  v_counter NUMBER := 0;
  v_result NUMBER;
  
  -- 嵌套函数：计算阶乘
  FUNCTION factorial(n NUMBER) RETURN NUMBER IS
    v_fact NUMBER := 1;
  BEGIN
    FOR i IN 1..n LOOP
      v_fact := v_fact * i;
    END LOOP;
    RETURN v_fact;
  END factorial;
  
  -- 嵌套过程：打印星号
  PROCEDURE print_stars(stars NUMBER) IS
  BEGIN
    FOR i IN 1..stars LOOP
      DBMS_OUTPUT.PUT('*');
    END LOOP;
    DBMS_OUTPUT.NEW_LINE;
  END print_stars;
  
BEGIN
  -- 主执行块
  DBMS_OUTPUT.PUT_LINE('开始执行长过程...');
  
  -- 复杂嵌套块
  DECLARE
    v_temp NUMBER := 10;
  BEGIN
    FOR i IN 1..5 LOOP
      -- 多层嵌套
      DECLARE
        v_inner NUMBER := i * 2;
      BEGIN
        v_result := factorial(v_inner);
        DBMS_OUTPUT.PUT_LINE(i || ' 的阶乘: ' || v_result);
        print_stars(i);
      END;
    END LOOP;
  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('内部块错误: ' || SQLERRM);
  END;
  
  -- 另一个嵌套块
  BEGIN
    SELECT COUNT(*) INTO v_counter FROM dual;
    DBMS_OUTPUT.PUT_LINE('计数: ' || v_counter);
  END;
  
  DBMS_OUTPUT.PUT_LINE('过程执行完成');
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('主块错误: ' || SQLERRM);
END long_procedure;
/

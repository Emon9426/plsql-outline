/* 边界情况测试 */
CREATE OR REPLACE PROCEDURE edge_case_procedure AS
  /* 注释中的关键字：BEGIN END FUNCTION PROCEDURE DECLARE */
  
  -- 情况1：只有END
  PROCEDURE simple_end IS
  BEGIN
    NULL;
  END; -- 只有END
  
  -- 情况2：END后跟函数名
  FUNCTION func_with_named_end RETURN NUMBER IS
  BEGIN
    RETURN 1;
  END func_with_named_end; -- END后跟函数名
  
  -- 情况3：多层嵌套与混合END
  PROCEDURE mixed_end IS
    FUNCTION inner_func RETURN NUMBER IS
    BEGIN
      RETURN 2;
    END inner_func; -- END后跟函数名
    
    PROCEDURE inner_proc IS
    BEGIN
      NULL;
    END; -- 只有END
  BEGIN
    DECLARE
      v_temp NUMBER := 0;
    BEGIN
      v_temp := inner_func();
      DBMS_OUTPUT.PUT_LINE('值: ' || v_temp);
    END; -- 只有END
  END mixed_end; -- END后跟过程名
  
  -- 情况4：注释中的嵌套结构
  /*
    FUNCTION commented_function IS
    BEGIN
      -- 这只是一个注释
      NULL;
    END commented_function;
  */
  
BEGIN
  -- 主执行块
  DECLARE
    v_result NUMBER;
  BEGIN
    v_result := func_with_named_end();
    DBMS_OUTPUT.PUT_LINE('函数结果: ' || v_result);
    mixed_end();
    
    -- 异常块测试
    BEGIN
      RAISE NO_DATA_FOUND;
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('捕获到NO_DATA_FOUND异常');
    END; -- 只有END
  END; -- 只有END
  
  /* 结束注释 */
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('主异常块: ' || SQLERRM);
END edge_case_procedure; -- END后跟过程名
/

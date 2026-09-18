-- =============================================================================
-- 用例: Function / 简单结构 (func_simple.fnc)
-- 结构: CREATE OR REPLACE FUNCTION + 单行签名 + 声明区(常量/变量)
--       + BEGIN + IF/ELSIF/ELSE + RETURN + EXCEPTION(WHEN OTHERS) + END
-- 预期大纲:
--   CALC_SIMPLE_TAX (Function)
--   ├ Declaration: c_tax_rate(常量) / v_tax(变量)
--   ├ Body: IF p_amount IS NULL ...
--   └ Exception: WHEN OTHERS
-- =============================================================================
CREATE OR REPLACE FUNCTION calc_simple_tax(p_amount IN NUMBER)
RETURN NUMBER IS
    c_tax_rate  CONSTANT NUMBER := 0.13;
    v_tax       NUMBER := 0;
BEGIN
    IF p_amount IS NULL THEN
        v_tax := 0;
    ELSIF p_amount < 0 THEN
        v_tax := NULL;
    ELSE
        v_tax := ROUND(p_amount * c_tax_rate, 2);
    END IF;

    RETURN v_tax;
EXCEPTION
    WHEN OTHERS THEN
        RETURN 0;
END calc_simple_tax;
/

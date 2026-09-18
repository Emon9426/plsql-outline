-- 独立存储过程：CREATE OR REPLACE PROCEDURE ...（无包包裹，顶层即程序）
CREATE OR REPLACE PROCEDURE calc_order_total(
    p_order_id IN NUMBER,
    p_discount IN NUMBER DEFAULT 0
) IS
    -- 局部声明
    v_subtotal   NUMBER := 0;
    v_tax        NUMBER := 0;
    v_total      NUMBER := 0;
    c_tax_rate   CONSTANT NUMBER := 0.08;
    CURSOR c_lines(p_id NUMBER) IS
        SELECT product_id, quantity, unit_price
          FROM order_lines
         WHERE order_id = p_id;
    TYPE t_line_rec IS RECORD (
        product_id NUMBER,
        quantity   NUMBER,
        unit_price NUMBER(15,2)
    );
    e_invalid    EXCEPTION;

    -- 嵌套子程序（验证独立程序也支持 Sub Program 嵌套）
    FUNCTION apply_discount(p_amount IN NUMBER) RETURN NUMBER IS
        v_result NUMBER := p_amount;
    BEGIN
        IF p_amount IS NULL THEN
            RETURN 0;
        ELSIF p_amount > 0 THEN
            v_result := p_amount - (p_amount * p_discount);
        END IF;
        RETURN v_result;
    END apply_discount;

    PROCEDURE accumulate(p_value IN NUMBER) IS
    BEGIN
        v_subtotal := v_subtotal + p_value;
    END accumulate;
BEGIN
    -- 主程序体
    FOR rec IN c_lines(p_order_id) LOOP
        accumulate(rec.quantity * rec.unit_price);
    END LOOP;

    v_subtotal := apply_discount(v_subtotal);
    v_tax := v_subtotal * c_tax_rate;
    v_total := v_subtotal + v_tax;

    IF v_total < 0 THEN
        RAISE e_invalid;
    END IF;
EXCEPTION
    WHEN e_invalid THEN
        v_total := 0;
    WHEN OTHERS THEN
        v_total := -1;
END calc_order_total;
/


-- 独立函数：CREATE OR REPLACE FUNCTION ...（无包包裹，顶层即程序）
CREATE OR REPLACE FUNCTION get_customer_tier(
    p_points IN NUMBER
) RETURN VARCHAR2 IS
    v_tier   VARCHAR2(20);
    c_gold   CONSTANT NUMBER := 1000;
    c_silver CONSTANT NUMBER := 500;
    e_bad    EXCEPTION;
BEGIN
    IF p_points IS NULL THEN
        RETURN 'NONE';
    ELSIF p_points >= c_gold THEN
        v_tier := 'GOLD';
    ELSIF p_points >= c_silver THEN
        v_tier := 'SILVER';
    ELSE
        v_tier := 'BRONZE';
    END IF;

    RETURN v_tier;
EXCEPTION
    WHEN e_bad THEN
        RETURN 'ERROR';
END get_customer_tier;
/

CREATE OR REPLACE PACKAGE BODY app_schema.order_mgmt_pkg
IS
    -- Package-level constants and variables
    g_default_tax_rate CONSTANT NUMBER := 0.08;
    g_debug            BOOLEAN := FALSE;

    -- Cursor declarations
    CURSOR c_open_orders(p_status VARCHAR2) IS
        SELECT order_id, customer_id, total_amount
          FROM orders
         WHERE status = p_status
         ORDER BY created_date;

    /*
     * Top-level Procedure: validate_order
     * Demonstrates: IF x IS NULL, EXCEPTION handler, no init block dependency
     */
    PROCEDURE validate_order(
        p_order_id  IN NUMBER,
        p_status    OUT VARCHAR2,
        p_message   OUT VARCHAR2
    )
    IS
        v_order_rec  orders%ROWTYPE;
        v_line_count NUMBER;
        v_is_valid   BOOLEAN := TRUE;
    BEGIN
        -- Fetch the order
        BEGIN
            SELECT *
              INTO v_order_rec
              FROM orders
             WHERE order_id = p_order_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_status  := 'NOT_FOUND';
                p_message := 'Order ' || p_order_id || ' does not exist';
                RETURN;
        END;

        -- Count order lines
        SELECT COUNT(*)
          INTO v_line_count
          FROM order_lines
         WHERE order_id = p_order_id;

        -- IF x IS NULL check (this is the pattern that triggers BUG-A)
        IF v_order_rec.customer_id IS NULL THEN
            p_status  := 'INVALID';
            p_message := 'Customer is null';
            RETURN;
        END IF;

        -- IF x IS NOT NULL check (also triggers BUG-A)
        IF v_order_rec.total_amount IS NOT NULL THEN
            IF v_line_count = 0 THEN
                v_is_valid := FALSE;
            END IF;
        END IF;

        -- CASE with IS NULL in WHEN clause
        CASE
            WHEN v_order_rec.status IS NULL THEN
                p_status := 'PENDING';
            WHEN v_line_count > 100 THEN
                p_status := 'LARGE';
            ELSE
                p_status := 'OK';
        END CASE;

        IF v_is_valid THEN
            p_message := 'Order is valid';
        ELSE
            p_message := 'Order has issues';
        END IF;
    END validate_order;

    /*
     * Top-level Function: calculate_total
     * Demonstrates: Sub-function with its own Sub-function (3 levels of nesting),
     * multi-line parameters, EXCEPTION, cursor FOR loop
     */
    FUNCTION calculate_total(
        p_order_id    IN NUMBER,
        p_tax_rate    IN NUMBER DEFAULT g_default_tax_rate,
        p_discount    IN NUMBER DEFAULT 0,
        p_round       IN BOOLEAN DEFAULT TRUE
    ) RETURN NUMBER
    IS
        v_subtotal   NUMBER := 0;
        v_tax        NUMBER := 0;
        v_total      NUMBER := 0;

        -- 1st level sub-function
        FUNCTION compute_line_total(
            p_line_id IN NUMBER
        ) RETURN NUMBER
        IS
            v_qty     NUMBER;
            v_price   NUMBER;
            v_result  NUMBER := 0;

            -- 2nd level sub-function (3 levels deep: package -> calculate_total -> compute_line_total -> apply_rounding)
            FUNCTION apply_rounding(p_value IN NUMBER) RETURN NUMBER
            IS
                v_scaled NUMBER;
            BEGIN
                -- IF x IS NULL inside a deeply nested sub-function
                IF p_value IS NULL THEN
                    RETURN 0;
                END IF;

                v_scaled := p_value * 100;
                IF MOD(ROUND(v_scaled), 10) >= 5 THEN
                    v_scaled := CEIL(v_scaled);
                ELSE
                    v_scaled := FLOOR(v_scaled);
                END IF;
                RETURN v_scaled / 100;
            EXCEPTION
                WHEN OTHERS THEN
                    RETURN p_value;
            END apply_rounding;
        BEGIN
            -- Fetch line details
            BEGIN
                SELECT quantity, unit_price
                  INTO v_qty, v_price
                  FROM order_lines
                 WHERE line_id = p_line_id;
            EXCEPTION
                WHEN NO_DATA_FOUND THEN
                    RETURN 0;
            END;

            -- Use the nested sub-function
            v_result := apply_rounding(v_qty * v_price);

            -- Loop with IS NULL check
            IF v_price IS NULL OR v_qty IS NULL THEN
                RETURN 0;
            END IF;

            RETURN v_result;
        END compute_line_total;

        -- 1st level sibling sub-procedure (after a sub-function)
        PROCEDURE accumulate(p_line IN NUMBER, p_running IN OUT NUMBER)
        IS
        BEGIN
            IF p_line IS NOT NULL THEN
                p_running := p_running + p_line;
            END IF;
        END accumulate;
    BEGIN
        -- Cursor FOR loop
        FOR rec IN c_open_orders('NEW') LOOP
            v_subtotal := v_subtotal + compute_line_total(rec.order_id);
        END LOOP;

        -- Numeric FOR loop with nested IF
        FOR i IN 1..10 LOOP
            IF i MOD 2 = 0 THEN
                accumulate(i, v_subtotal);
            ELSIF i = 5 THEN
                v_subtotal := v_subtotal + 50;
            ELSE
                v_subtotal := v_subtotal + 1;
            END IF;
        END LOOP;

        -- Tax calculation
        IF p_tax_rate IS NOT NULL THEN
            v_tax := v_subtotal * p_tax_rate;
        END IF;

        v_total := v_subtotal + v_tax - p_discount;

        IF p_round THEN
            v_total := ROUND(v_total, 2);
        END IF;

        RETURN v_total;
    END calculate_total;

    /*
     * Another top-level procedure to verify state restoration after nested subs
     */
    PROCEDURE cancel_order(p_order_id IN NUMBER)
    IS
        v_rows NUMBER;
    BEGIN
        UPDATE orders
           SET status = 'CANCELLED'
         WHERE order_id = p_order_id
           AND status IS NOT NULL;

        v_rows := SQL%ROWCOUNT;

        IF v_rows = 0 THEN
            DBMS_OUTPUT.PUT_LINE('No order cancelled');
        END IF;
    END cancel_order;

-- NOTE: This package body intentionally has NO initialization block.
-- It ends directly with END order_mgmt_pkg; (no BEGIN ... END order_mgmt_pkg;)
-- This triggers BUG-B: package node endLine should still be set.
END order_mgmt_pkg;
/

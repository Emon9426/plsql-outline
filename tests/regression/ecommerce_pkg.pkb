CREATE OR REPLACE PACKAGE BODY app_schema.ecommerce_pkg
IS
    -- ============================================================
    -- 电商订单与库存管理 Package Body
    -- 本文件用于测试 PL/SQL Outline 解析器对真实复杂代码的处理能力
    -- 包含: 多层 Sub Function/Procedure、深层 IF/FOR/WHILE/CASE 嵌套、
    --       EXCEPTION 处理、Cursor、IS NULL/IS NOT NULL 模式、初始化块
    -- ============================================================

    -- 包级常量与变量
    g_max_retry       CONSTANT NUMBER := 3;
    g_tax_rate        CONSTANT NUMBER := 0.08;
    g_default_ship    CONSTANT VARCHAR2(30) := 'STANDARD';
    g_pkg_initialized BOOLEAN := FALSE;

    -- 包级游标声明
    CURSOR c_pending_orders IS
        SELECT order_id, customer_id, total_amount, status
          FROM orders
         WHERE status IN ('PENDING', 'CONFIRMED')
         ORDER BY created_date;

    CURSOR c_low_stock_items(p_threshold NUMBER) IS
        SELECT product_id, sku, quantity_on_hand, reorder_point
          FROM inventory
         WHERE quantity_on_hand < p_threshold
         ORDER BY quantity_on_hand ASC;

    -- 包级异常定义
    e_invalid_order   EXCEPTION;
    e_insufficient_qty EXCEPTION;
    e_payment_failed  EXCEPTION;
    PRAGMA EXCEPTION_INIT(e_payment_failed, -20001);

    -- ============================================================
    -- 顶层 Function 1: calculate_order_total
    -- 演示: 多行参数、Sub Function、Sub-Sub Function (3层嵌套)、
    --       IF IS NULL、CASE、FOR loop、EXCEPTION
    -- ============================================================
    FUNCTION calculate_order_total(
        p_order_id    IN NUMBER,
        p_apply_tax   IN BOOLEAN DEFAULT TRUE,
        p_discount    IN NUMBER DEFAULT 0,
        p_coupon_code IN VARCHAR2 DEFAULT NULL
    ) RETURN NUMBER
    IS
        v_subtotal    NUMBER := 0;
        v_tax         NUMBER := 0;
        v_discount    NUMBER := 0;
        v_final       NUMBER := 0;
        v_line_count  NUMBER := 0;

        -- 第1层 Sub Function: 计算单行金额
        FUNCTION compute_line_amount(
            p_line_id IN NUMBER
        ) RETURN NUMBER
        IS
            v_qty      NUMBER;
            v_price    NUMBER;
            v_amount   NUMBER := 0;
            v_product  VARCHAR2(50);

            -- 第2层 Sub Function (第3层嵌套): 应用折扣与四舍五入
            FUNCTION apply_discount_and_round(
                p_amount   IN NUMBER,
                p_discount IN NUMBER
            ) RETURN NUMBER
            IS
                v_result  NUMBER;
                v_scaled  NUMBER;
            BEGIN
                -- IF x IS NULL 在最深层 Sub Function 中
                IF p_amount IS NULL THEN
                    RETURN 0;
                END IF;

                IF p_discount IS NOT NULL AND p_discount > 0 THEN
                    v_result := p_amount - (p_amount * p_discount);
                ELSE
                    v_result := p_amount;
                END IF;

                -- 多层 IF 嵌套
                v_scaled := v_result * 100;
                IF v_scaled > 0 THEN
                    IF MOD(ROUND(v_scaled), 10) >= 5 THEN
                        v_scaled := CEIL(v_scaled);
                    ELSE
                        v_scaled := FLOOR(v_scaled);
                    END IF;
                ELSIF v_scaled < 0 THEN
                    v_scaled := 0;
                END IF;

                RETURN v_scaled / 100;
            EXCEPTION
                WHEN VALUE_ERROR THEN
                    RETURN p_amount;
                WHEN OTHERS THEN
                    RETURN 0;
            END apply_discount_and_round;

            -- 第2层 Sub Procedure: 校验产品是否有效
            PROCEDURE validate_product(
                p_product IN VARCHAR2,
                p_valid   OUT BOOLEAN
            )
            IS
                v_count NUMBER;
            BEGIN
                p_valid := FALSE;
                IF p_product IS NULL THEN
                    RETURN;
                END IF;

                SELECT COUNT(*)
                  INTO v_count
                  FROM products
                 WHERE sku = p_product;

                IF v_count > 0 THEN
                    p_valid := TRUE;
                END IF;
            END validate_product;
        BEGIN
            -- 获取订单行信息
            BEGIN
                SELECT quantity, unit_price, product_sku
                  INTO v_qty, v_price, v_product
                  FROM order_lines
                 WHERE line_id = p_line_id;
            EXCEPTION
                WHEN NO_DATA_FOUND THEN
                    RETURN 0;
                WHEN TOO_MANY_ROWS THEN
                    RETURN 0;
            END;

            -- 校验产品
            DECLARE
                v_is_valid BOOLEAN;
            BEGIN
                validate_product(v_product, v_is_valid);
                IF NOT v_is_valid THEN
                    RETURN 0;
                END IF;
            END;

            -- 计算并应用折扣
            IF v_price IS NULL OR v_qty IS NULL THEN
                RETURN 0;
            END IF;

            v_amount := apply_discount_and_round(v_price * v_qty, p_discount);
            RETURN v_amount;
        END compute_line_amount;

        -- 第1层 Sub Function (sibling): 解析优惠券
        FUNCTION resolve_coupon(
            p_code IN VARCHAR2
        ) RETURN NUMBER
        IS
            v_rate NUMBER := 0;
        BEGIN
            IF p_code IS NULL THEN
                RETURN 0;
            END IF;

            CASE UPPER(p_code)
                WHEN 'SAVE10' THEN
                    v_rate := 0.10;
                WHEN 'SAVE20' THEN
                    v_rate := 0.20;
                WHEN 'VIP30' THEN
                    v_rate := 0.30;
                ELSE
                    v_rate := 0;
            END CASE;

            RETURN v_rate;
        END resolve_coupon;
    BEGIN
        -- 主逻辑: 累加所有订单行
        FOR rec IN (
            SELECT line_id
              FROM order_lines
             WHERE order_id = p_order_id
             ORDER BY line_id
        ) LOOP
            v_subtotal := v_subtotal + compute_line_amount(rec.line_id);
            v_line_count := v_line_count + 1;
        END LOOP;

        IF v_line_count = 0 THEN
            RETURN 0;
        END IF;

        -- 优惠券折扣
        IF p_coupon_code IS NOT NULL THEN
            v_discount := v_subtotal * resolve_coupon(p_coupon_code);
        END IF;

        -- 额外折扣
        IF p_discount > 0 THEN
            v_discount := v_discount + (v_subtotal * p_discount);
        END IF;

        -- 税费计算 (CASE + IF 嵌套)
        IF p_apply_tax THEN
            CASE
                WHEN v_subtotal > 1000 THEN
                    v_tax := v_subtotal * g_tax_rate;
                WHEN v_subtotal > 500 THEN
                    v_tax := v_subtotal * (g_tax_rate * 0.8);
                WHEN v_subtotal IS NULL THEN
                    v_tax := 0;
                ELSE
                    v_tax := 0;
            END CASE;
        END IF;

        v_final := v_subtotal + v_tax - v_discount;

        IF v_final < 0 THEN
            v_final := 0;
        END IF;

        RETURN ROUND(v_final, 2);
    EXCEPTION
        WHEN e_invalid_order THEN
            RETURN -1;
        WHEN OTHERS THEN
            RETURN -2;
    END calculate_order_total;

    -- ============================================================
    -- 顶层 Function 2: get_customer_tier
    -- 演示: WHILE 循环、深层 IF/ELSIF/ELSE、CASE、IS NULL
    -- ============================================================
    FUNCTION get_customer_tier(
        p_customer_id IN NUMBER
    ) RETURN VARCHAR2
    IS
        v_total    NUMBER := 0;
        v_orders   NUMBER := 0;
        v_tier     VARCHAR2(20);
        v_iter     NUMBER := 0;
        v_done     BOOLEAN := FALSE;
    BEGIN
        -- 聚合客户订单
        BEGIN
            SELECT NVL(SUM(total_amount), 0), COUNT(*)
              INTO v_total, v_orders
              FROM orders
             WHERE customer_id = p_customer_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                v_total := 0;
                v_orders := 0;
        END;

        -- WHILE 循环 + 嵌套 IF
        WHILE NOT v_done AND v_iter < g_max_retry LOOP
            v_iter := v_iter + 1;

            IF v_total IS NULL THEN
                v_done := TRUE;
            ELSIF v_total >= 10000 THEN
                IF v_orders >= 50 THEN
                    v_tier := 'PLATINUM';
                ELSIF v_orders >= 20 THEN
                    v_tier := 'GOLD';
                ELSE
                    v_tier := 'SILVER';
                END IF;
                v_done := TRUE;
            ELSIF v_total >= 5000 THEN
                CASE
                    WHEN v_orders >= 30 THEN
                        v_tier := 'GOLD';
                    WHEN v_orders >= 10 THEN
                        v_tier := 'SILVER';
                    ELSE
                        v_tier := 'BRONZE';
                END CASE;
                v_done := TRUE;
            ELSE
                IF v_orders > 0 THEN
                    v_tier := 'BRONZE';
                ELSE
                    v_tier := 'NEW';
                END IF;
                v_done := TRUE;
            END IF;
        END LOOP;

        IF v_tier IS NULL THEN
            v_tier := 'UNKNOWN';
        END IF;

        RETURN v_tier;
    END get_customer_tier;

    -- ============================================================
    -- 顶层 Function 3: check_inventory_level
    -- 演示: cursor FOR loop、嵌套 FOR、多层 IF、EXCEPTION
    -- ============================================================
    FUNCTION check_inventory_level(
        p_warehouse_id IN NUMBER
    ) RETURN NUMBER
    IS
        v_short_count  NUMBER := 0;
        v_total_count  NUMBER := 0;
        v_reorder      NUMBER;
    BEGIN
        -- 获取该仓库的重订货阈值
        BEGIN
            SELECT reorder_threshold
              INTO v_reorder
              FROM warehouses
             WHERE warehouse_id = p_warehouse_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                v_reorder := 10;
        END;

        -- cursor FOR loop
        FOR rec IN c_low_stock_items(v_reorder) LOOP
            v_total_count := v_total_count + 1;

            -- 嵌套 IF + CASE
            IF rec.quantity_on_hand IS NULL THEN
                v_short_count := v_short_count + 1;
            ELSIF rec.quantity_on_hand = 0 THEN
                v_short_count := v_short_count + 1;
                -- 触发紧急补货逻辑
                FOR i IN 1..3 LOOP
                    IF attempt_restock(rec.product_id, i * 10) THEN
                        EXIT;
                    END IF;
                END LOOP;
            ELSE
                CASE
                    WHEN rec.quantity_on_hand < rec.reorder_point / 2 THEN
                        v_short_count := v_short_count + 1;
                    WHEN rec.quantity_on_hand < rec.reorder_point THEN
                        NULL; -- 接近阈值，监控即可
                    ELSE
                        NULL; -- 库存充足
                END CASE;
            END IF;
        END LOOP;

        RETURN v_short_count;
    END check_inventory_level;

    -- ============================================================
    -- 顶层 Function 4: attempt_restock
    -- 被上面的 check_inventory_level 调用
    -- 演示: 简单逻辑但含 IS NULL 检查
    -- ============================================================
    FUNCTION attempt_restock(
        p_product_id IN NUMBER,
        p_quantity   IN NUMBER
    ) RETURN BOOLEAN
    IS
        v_supplier_id NUMBER;
    BEGIN
        IF p_product_id IS NULL OR p_quantity IS NULL THEN
            RETURN FALSE;
        END IF;

        IF p_quantity <= 0 THEN
            RETURN FALSE;
        END IF;

        BEGIN
            SELECT preferred_supplier_id
              INTO v_supplier_id
              FROM products
             WHERE product_id = p_product_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RETURN FALSE;
        END;

        IF v_supplier_id IS NULL THEN
            RETURN FALSE;
        END IF;

        -- 模拟下单
        RETURN TRUE;
    END attempt_restock;

    -- ============================================================
    -- 顶层 Function 5: format_address
    -- 演示: 深层 IF 嵌套、字符串拼接、多分支
    -- ============================================================
    FUNCTION format_address(
        p_street  IN VARCHAR2,
        p_city    IN VARCHAR2,
        p_state   IN VARCHAR2,
        p_zip     IN VARCHAR2,
        p_country IN VARCHAR2 DEFAULT 'US'
    ) RETURN VARCHAR2
    IS
        v_result VARCHAR2(500);
    BEGIN
        v_result := '';

        IF p_street IS NOT NULL THEN
            v_result := v_result || p_street;
        END IF;

        IF p_city IS NOT NULL THEN
            IF v_result IS NOT NULL THEN
                v_result := v_result || ', ';
            END IF;
            v_result := v_result || p_city;
        END IF;

        IF p_state IS NOT NULL AND p_zip IS NOT NULL THEN
            v_result := v_result || ' ' || p_state || ' ' || p_zip;
        ELSIF p_state IS NOT NULL THEN
            v_result := v_result || ', ' || p_state;
        ELSIF p_zip IS NOT NULL THEN
            v_result := v_result || ' ' || p_zip;
        END IF;

        IF p_country IS NOT NULL AND p_country <> 'US' THEN
            v_result := v_result || ', ' || p_country;
        END IF;

        RETURN v_result;
    END format_address;

    -- ============================================================
    -- 顶层 Procedure 1: process_order
    -- 演示: 深层嵌套、Sub Procedure (2层)、EXCEPTION、状态机
    -- ============================================================
    PROCEDURE process_order(
        p_order_id    IN NUMBER,
        p_action      IN VARCHAR2,
        p_result_code OUT NUMBER,
        p_message     OUT VARCHAR2
    )
    IS
        v_order_rec   orders%ROWTYPE;
        v_new_status  VARCHAR2(20);
        v_retry       NUMBER := 0;
        v_success     BOOLEAN := FALSE;

        -- 第1层 Sub Procedure: 校验订单状态转换合法性
        PROCEDURE validate_status_transition(
            p_current IN VARCHAR2,
            p_target  IN VARCHAR2,
            p_ok      OUT BOOLEAN
        )
        IS
            -- 第2层 Sub Function (第3层嵌套)
            FUNCTION is_terminal_status(
                p_status IN VARCHAR2
            ) RETURN BOOLEAN
            IS
            BEGIN
                IF p_status IS NULL THEN
                    RETURN FALSE;
                END IF;

                CASE p_status
                    WHEN 'CANCELLED' THEN
                        RETURN TRUE;
                    WHEN 'DELIVERED' THEN
                        RETURN TRUE;
                    WHEN 'RETURNED' THEN
                        RETURN TRUE;
                    ELSE
                        RETURN FALSE;
                END CASE;
            END is_terminal_status;
        BEGIN
            p_ok := FALSE;

            -- 终态订单不允许再转换
            IF is_terminal_status(p_current) THEN
                p_ok := FALSE;
                RETURN;
            END IF;

            -- 合法转换矩阵
            CASE p_current
                WHEN 'PENDING' THEN
                    IF p_target IN ('CONFIRMED', 'CANCELLED') THEN
                        p_ok := TRUE;
                    END IF;
                WHEN 'CONFIRMED' THEN
                    IF p_target IN ('SHIPPED', 'CANCELLED') THEN
                        p_ok := TRUE;
                    END IF;
                WHEN 'SHIPPED' THEN
                    IF p_target IN ('DELIVERED', 'RETURNED') THEN
                        p_ok := TRUE;
                    END IF;
                ELSE
                    p_ok := FALSE;
            END CASE;
        END validate_status_transition;

        -- 第1层 Sub Procedure: 执行支付
        PROCEDURE charge_payment(
            p_amount  IN NUMBER,
            p_charged OUT BOOLEAN
        )
        IS
            v_attempt NUMBER := 0;
        BEGIN
            p_charged := FALSE;

            IF p_amount IS NULL OR p_amount <= 0 THEN
                RETURN;
            END IF;

            -- 重试循环
            WHILE v_attempt < g_max_retry AND NOT p_charged LOOP
                v_attempt := v_attempt + 1;
                BEGIN
                    -- 模拟支付网关调用
                    IF MOD(v_attempt, 2) = 0 THEN
                        p_charged := TRUE;
                    END IF;
                EXCEPTION
                    WHEN e_payment_failed THEN
                        p_charged := FALSE;
                END;
            END LOOP;
        END charge_payment;
    BEGIN
        p_result_code := 0;
        p_message := '';

        -- 获取订单
        BEGIN
            SELECT *
              INTO v_order_rec
              FROM orders
             WHERE order_id = p_order_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_result_code := -1;
                p_message := 'Order not found: ' || p_order_id;
                RETURN;
        END;

        -- 根据动作决定目标状态
        CASE p_action
            WHEN 'CONFIRM' THEN
                v_new_status := 'CONFIRMED';
            WHEN 'SHIP' THEN
                v_new_status := 'SHIPPED';
            WHEN 'CANCEL' THEN
                v_new_status := 'CANCELLED';
            WHEN 'DELIVER' THEN
                v_new_status := 'DELIVERED';
            ELSE
                p_result_code := -2;
                p_message := 'Unknown action: ' || p_action;
                RETURN;
        END CASE;

        -- 校验状态转换
        DECLARE
            v_transition_ok BOOLEAN;
        BEGIN
            validate_status_transition(v_order_rec.status, v_new_status, v_transition_ok);
            IF NOT v_transition_ok THEN
                p_result_code := -3;
                p_message := 'Invalid status transition: ' || v_order_rec.status || ' -> ' || v_new_status;
                RETURN;
            END IF;
        END;

        -- 支付处理 (CONFIRM 时)
        IF v_new_status = 'CONFIRMED' THEN
            DECLARE
                v_paid BOOLEAN;
                v_amount NUMBER;
            BEGIN
                v_amount := calculate_order_total(p_order_id, TRUE, 0, v_order_rec.coupon_code);
                charge_payment(v_amount, v_paid);
                IF NOT v_paid THEN
                    p_result_code := -4;
                    p_message := 'Payment failed for order ' || p_order_id;
                    RETURN;
                END IF;
            END;
        END IF;

        -- 更新订单状态 (带重试)
        WHILE v_retry < g_max_retry AND NOT v_success LOOP
            v_retry := v_retry + 1;
            BEGIN
                UPDATE orders
                   SET status = v_new_status,
                       updated_date = SYSDATE
                 WHERE order_id = p_order_id;

                IF SQL%ROWCOUNT = 1 THEN
                    v_success := TRUE;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL; -- 重试
            END;
        END LOOP;

        IF v_success THEN
            p_result_code := 1;
            p_message := 'Order ' || p_order_id || ' -> ' || v_new_status;
        ELSE
            p_result_code := -5;
            p_message := 'Failed to update order ' || p_order_id;
        END IF;

        -- 触发后续处理
        IF v_success AND v_new_status = 'SHIPPED' THEN
            FOR rec IN c_pending_orders LOOP
                IF rec.order_id <> p_order_id THEN
                    notify_customer(rec.customer_id, 'Your related order is being processed.');
                END IF;
                EXIT WHEN rec.order_id > p_order_id + 100;
            END LOOP;
        END IF;
    EXCEPTION
        WHEN e_invalid_order THEN
            p_result_code := -10;
            p_message := 'Invalid order exception';
        WHEN OTHERS THEN
            p_result_code := -99;
            p_message := 'Unexpected error: ' || SQLERRM;
    END process_order;

    -- ============================================================
    -- 顶层 Procedure 2: bulk_reorder_low_stock
    -- 演示: cursor、FOR loop、嵌套 IF、批量操作
    -- ============================================================
    PROCEDURE bulk_reorder_low_stock(
        p_threshold   IN NUMBER DEFAULT 20,
        p_reorder_qty IN NUMBER DEFAULT 100,
        p_recount     OUT NUMBER,
        p_total_cost  OUT NUMBER
    )
    IS
        v_qty_to_order NUMBER;
        v_unit_cost    NUMBER;
        v_supplier     NUMBER;
    BEGIN
        p_recount := 0;
        p_total_cost := 0;

        FOR rec IN c_low_stock_items(p_threshold) LOOP
            v_qty_to_order := p_reorder_qty;

            -- 根据缺口动态调整补货量
            IF rec.reorder_point IS NOT NULL THEN
                IF rec.quantity_on_hand IS NULL THEN
                    v_qty_to_order := rec.reorder_point * 2;
                ELSIF (rec.reorder_point - rec.quantity_on_hand) > p_reorder_qty THEN
                    v_qty_to_order := rec.reorder_point - rec.quantity_on_hand + 50;
                END IF;
            END IF;

            -- 查找供应商与单价
            BEGIN
                SELECT preferred_supplier_id, unit_cost
                  INTO v_supplier, v_unit_cost
                  FROM products
                 WHERE product_id = rec.product_id;
            EXCEPTION
                WHEN NO_DATA_FOUND THEN
                    v_qty_to_order := 0;
            END;

            -- 下单
            IF v_qty_to_order > 0 AND v_supplier IS NOT NULL THEN
                BEGIN
                    INSERT INTO purchase_orders
                        (product_id, supplier_id, quantity, unit_cost, status, created_date)
                    VALUES
                        (rec.product_id, v_supplier, v_qty_to_order, v_unit_cost, 'OPEN', SYSDATE);

                    p_recount := p_recount + 1;
                    IF v_unit_cost IS NOT NULL THEN
                        p_total_cost := p_total_cost + (v_qty_to_order * v_unit_cost);
                    END IF;
                EXCEPTION
                    WHEN OTHERS THEN
                        NULL; -- 跳过失败的行
                END;
            END IF;
        END LOOP;
    END bulk_reorder_low_stock;

    -- ============================================================
    -- 顶层 Procedure 3: generate_sales_report
    -- 演示: 嵌套 FOR + IF + CASE + WHILE 综合嵌套、聚合
    -- ============================================================
    PROCEDURE generate_sales_report(
        p_start_date IN DATE,
        p_end_date   IN DATE,
        p_summary    OUT VARCHAR2
    )
    IS
        TYPE t_region_sales IS TABLE OF NUMBER INDEX BY VARCHAR2(30);
        v_region_map  t_region_sales;
        v_region      VARCHAR2(30);
        v_total       NUMBER := 0;
        v_count       NUMBER := 0;
        v_high_region VARCHAR2(30);
        v_high_sales  NUMBER := 0;
    BEGIN
        -- 嵌套游标循环: 订单 -> 订单行
        FOR ord IN (
            SELECT order_id, customer_id, region, total_amount
              FROM orders
             WHERE created_date BETWEEN p_start_date AND p_end_date
             ORDER BY order_id
        ) LOOP
            v_count := v_count + 1;

            IF ord.total_amount IS NULL THEN
                CONTINUE;
            END IF;

            v_total := v_total + ord.total_amount;

            -- 按 region 聚合
            IF ord.region IS NOT NULL THEN
                v_region := ord.region;
                IF v_region_map.EXISTS(v_region) THEN
                    v_region_map(v_region) := v_region_map(v_region) + ord.total_amount;
                ELSE
                    v_region_map(v_region) := ord.total_amount;
                END IF;
            END IF;

            -- 内层: 遍历订单行做进一步分析
            FOR line IN (
                SELECT product_id, quantity, unit_price
                  FROM order_lines
                 WHERE order_id = ord.order_id
            ) LOOP
                IF line.unit_price IS NULL OR line.quantity IS NULL THEN
                    CONTINUE;
                END IF;

                -- CASE 判断高价值商品
                CASE
                    WHEN line.unit_price >= 500 THEN
                        NULL; -- 高端商品
                    WHEN line.unit_price >= 100 THEN
                        NULL; -- 中端商品
                    ELSE
                        NULL; -- 普通商品
                END CASE;
            END LOOP;
        END LOOP;

        -- 找出销售额最高的 region
        v_high_region := '';
        v_high_sales := 0;
        v_region := v_region_map.FIRST;
        WHILE v_region IS NOT NULL LOOP
            IF v_region_map(v_region) > v_high_sales THEN
                v_high_sales := v_region_map(v_region);
                v_high_region := v_region;
            END IF;
            v_region := v_region_map.NEXT(v_region);
        END LOOP;

        -- 生成摘要
        IF v_count = 0 THEN
            p_summary := 'No orders in the specified period.';
        ELSIF v_high_region IS NULL OR v_high_region = '' THEN
            p_summary := 'Orders: ' || v_count || ', Total: ' || v_total;
        ELSE
            p_summary := 'Orders: ' || v_count || ', Total: ' || v_total ||
                         ', Top region: ' || v_high_region || ' (' || v_high_sales || ')';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            p_summary := 'Report generation failed: ' || SQLERRM;
    END generate_sales_report;

    -- ============================================================
    -- 顶层 Procedure 4: notify_customer
    -- 被前面的函数调用, 但定义在后 (前向引用)
    -- 演示: 简单结构 + IS NULL
    -- ============================================================
    PROCEDURE notify_customer(
        p_customer_id IN NUMBER,
        p_message     IN VARCHAR2
    )
    IS
        v_email   VARCHAR2(200);
        v_channel VARCHAR2(20);
    BEGIN
        IF p_customer_id IS NULL THEN
            RETURN;
        END IF;

        BEGIN
            SELECT email, preferred_channel
              INTO v_email, v_channel
              FROM customers
             WHERE customer_id = p_customer_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RETURN;
        END;

        IF v_email IS NULL THEN
            RETURN;
        END IF;

        CASE v_channel
            WHEN 'EMAIL' THEN
                NULL; -- send_email(v_email, p_message);
            WHEN 'SMS' THEN
                NULL; -- send_sms(...);
            ELSE
                NULL; -- 默认邮件
        END CASE;
    END notify_customer;

    -- ============================================================
    -- 顶层 Procedure 5: cancel_expired_orders
    -- 演示: FOR loop + 嵌套 IF + 调用其他过程
    -- ============================================================
    PROCEDURE cancel_expired_orders(
        p_days        IN NUMBER DEFAULT 30,
        p_cancelled   OUT NUMBER
    )
    IS
        v_cutoff DATE;
        v_result NUMBER;
        v_msg    VARCHAR2(500);
    BEGIN
        p_cancelled := 0;
        v_cutoff := SYSDATE - p_days;

        FOR rec IN (
            SELECT order_id, customer_id, status, total_amount
              FROM orders
             WHERE status = 'PENDING'
               AND created_date < v_cutoff
             ORDER BY order_id
        ) LOOP
            -- 嵌套 IF 决定是否取消
            IF rec.total_amount IS NULL THEN
                process_order(rec.order_id, 'CANCEL', v_result, v_msg);
                IF v_result > 0 THEN
                    p_cancelled := p_cancelled + 1;
                END IF;
            ELSIF rec.total_amount < 50 THEN
                -- 小额订单直接取消
                process_order(rec.order_id, 'CANCEL', v_result, v_msg);
                IF v_result > 0 THEN
                    p_cancelled := p_cancelled + 1;
                END IF;
            ELSE
                -- 大额订单通知客户
                IF rec.customer_id IS NOT NULL THEN
                    notify_customer(rec.customer_id,
                        'Order ' || rec.order_id || ' is pending and may be cancelled.');
                END IF;
            END IF;
        END LOOP;
    END cancel_expired_orders;

    -- ============================================================
    -- 顶层 Function 6: compute_shipping_cost
    -- 演示: 多分支 IF/CASE 组合
    -- ============================================================
    FUNCTION compute_shipping_cost(
        p_order_id    IN NUMBER,
        p_method      IN VARCHAR2 DEFAULT g_default_ship,
        p_destination IN VARCHAR2 DEFAULT 'DOMESTIC'
    ) RETURN NUMBER
    IS
        v_weight   NUMBER := 0;
        v_base     NUMBER := 0;
        v_surcharge NUMBER := 0;
        v_total    NUMBER := 0;
    BEGIN
        -- 计算订单总重量
        BEGIN
            SELECT NVL(SUM(quantity * weight), 0)
              INTO v_weight
              FROM order_lines ol
              JOIN products p ON ol.product_id = p.product_id
             WHERE ol.order_id = p_order_id;
        EXCEPTION
            WHEN OTHERS THEN
                v_weight := 0;
        END;

        -- 基础运费 (CASE)
        CASE p_method
            WHEN 'STANDARD' THEN
                v_base := 5.00;
            WHEN 'EXPRESS' THEN
                v_base := 15.00;
            WHEN 'OVERNIGHT' THEN
                v_base := 30.00;
            WHEN 'PICKUP' THEN
                v_base := 0;
            ELSE
                v_base := 5.00;
        END CASE;

        -- 重量附加费 (IF + WHILE)
        IF v_weight IS NULL THEN
            v_weight := 0;
        END IF;

        WHILE v_weight > 1 LOOP
            v_surcharge := v_surcharge + 2.50;
            v_weight := v_weight - 1;
        END LOOP;

        -- 国际附加费
        IF p_destination IS NOT NULL AND p_destination = 'INTERNATIONAL' THEN
            v_surcharge := v_surcharge + 20;
        END IF;

        v_total := v_base + v_surcharge;

        IF v_total < 0 THEN
            v_total := 0;
        END IF;

        RETURN v_total;
    END compute_shipping_cost;

    -- ============================================================
    -- 顶层 Procedure 6: apply_loyalty_discount
    -- 演示: FOR loop + 多层 IF/ELSIF/ELSE
    -- ============================================================
    PROCEDURE apply_loyalty_discount(
        p_processed OUT NUMBER
    )
    IS
        v_tier     VARCHAR2(20);
        v_discount NUMBER;
    BEGIN
        p_processed := 0;

        FOR rec IN (
            SELECT customer_id
              FROM customers
             WHERE is_active = 'Y'
             ORDER BY customer_id
        ) LOOP
            v_tier := get_customer_tier(rec.customer_id);
            v_discount := 0;

            IF v_tier IS NULL THEN
                CONTINUE;
            ELSIF v_tier = 'PLATINUM' THEN
                v_discount := 0.15;
            ELSIF v_tier = 'GOLD' THEN
                v_discount := 0.10;
            ELSIF v_tier = 'SILVER' THEN
                v_discount := 0.05;
            ELSIF v_tier = 'BRONZE' THEN
                v_discount := 0.02;
            ELSE
                v_discount := 0;
            END IF;

            IF v_discount > 0 THEN
                BEGIN
                    UPDATE customers
                       SET discount_rate = v_discount
                     WHERE customer_id = rec.customer_id;
                    p_processed := p_processed + 1;
                EXCEPTION
                    WHEN OTHERS THEN
                        NULL;
                END;
            END IF;
        END LOOP;
    END apply_loyalty_discount;

    -- ============================================================
    -- 顶层 Function 7: validate_payment_info
    -- 演示: 嵌套 IF + 正则校验模拟
    -- ============================================================
    FUNCTION validate_payment_info(
        p_card_number IN VARCHAR2,
        p_expiry      IN VARCHAR2,
        p_cvv         IN VARCHAR2
    ) RETURN BOOLEAN
    IS
        v_len NUMBER;
    BEGIN
        IF p_card_number IS NULL OR p_expiry IS NULL OR p_cvv IS NULL THEN
            RETURN FALSE;
        END IF;

        v_len := LENGTH(p_card_number);

        -- 卡号长度校验
        IF v_len < 13 OR v_len > 19 THEN
            RETURN FALSE;
        END IF;

        -- CVV 校验
        IF LENGTH(p_cvv) < 3 OR LENGTH(p_cvv) > 4 THEN
            RETURN FALSE;
        END IF;

        -- 有效期格式校验 (模拟)
        IF LENGTH(p_expiry) <> 5 THEN
            RETURN FALSE;
        END IF;

        -- Luhn 算法模拟
        DECLARE
            v_sum NUMBER := 0;
            v_digit NUMBER;
            v_odd BOOLEAN := FALSE;
        BEGIN
            FOR i IN REVERSE 1..v_len LOOP
                v_digit := TO_NUMBER(SUBSTR(p_card_number, i, 1));
                IF v_odd THEN
                    v_digit := v_digit * 2;
                    IF v_digit > 9 THEN
                        v_digit := v_digit - 9;
                    END IF;
                END IF;
                v_sum := v_sum + v_digit;
                v_odd := NOT v_odd;
            END LOOP;

            IF MOD(v_sum, 10) <> 0 THEN
                RETURN FALSE;
            END IF;
        END;

        RETURN TRUE;
    EXCEPTION
        WHEN VALUE_ERROR THEN
            RETURN FALSE;
    END validate_payment_info;

    -- ============================================================
    -- 顶层 Procedure 7: refund_order
    -- 演示: Sub Procedure + 嵌套 EXCEPTION
    -- ============================================================
    PROCEDURE refund_order(
        p_order_id   IN NUMBER,
        p_reason     IN VARCHAR2,
        p_refund_amt OUT NUMBER,
        p_status     OUT VARCHAR2
    )
    IS
        v_order_rec orders%ROWTYPE;

        -- Sub Procedure: 计算退款金额
        PROCEDURE compute_refund(
            p_order   IN orders%ROWTYPE,
            p_reason  IN VARCHAR2,
            p_amount  OUT NUMBER
        )
        IS
            v_ratio NUMBER;
        BEGIN
            p_amount := 0;

            IF p_order.total_amount IS NULL THEN
                RETURN;
            END IF;

            CASE p_reason
                WHEN 'DEFECTIVE' THEN
                    v_ratio := 1.0;
                WHEN 'WRONG_ITEM' THEN
                    v_ratio := 1.0;
                WHEN 'LATE_DELIVERY' THEN
                    v_ratio := 0.5;
                WHEN 'CUSTOMER_CHANGE' THEN
                    v_ratio := 0.8;
                ELSE
                    v_ratio := 0;
            END CASE;

            p_amount := ROUND(p_order.total_amount * v_ratio, 2);

            IF p_amount < 0 THEN
                p_amount := 0;
            END IF;
        END compute_refund;
    BEGIN
        p_refund_amt := 0;
        p_status := 'FAILED';

        BEGIN
            SELECT *
              INTO v_order_rec
              FROM orders
             WHERE order_id = p_order_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_status := 'NOT_FOUND';
                RETURN;
        END;

        -- 只有特定状态可退款
        IF v_order_rec.status IS NULL THEN
            p_status := 'INVALID_STATUS';
            RETURN;
        ELSIF v_order_rec.status NOT IN ('DELIVERED', 'SHIPPED') THEN
            p_status := 'NOT_REFUNDABLE';
            RETURN;
        END IF;

        -- 计算并执行退款
        compute_refund(v_order_rec, p_reason, p_refund_amt);

        IF p_refund_amt > 0 THEN
            BEGIN
                INSERT INTO refunds (order_id, amount, reason, refund_date)
                VALUES (p_order_id, p_refund_amt, p_reason, SYSDATE);
                p_status := 'REFUNDED';
            EXCEPTION
                WHEN OTHERS THEN
                    p_status := 'DB_ERROR';
            END;
        ELSE
            p_status := 'ZERO_REFUND';
        END IF;
    END refund_order;

    -- ============================================================
    -- 顶层 Procedure 8: sync_inventory_from_erp
    -- 演示: WHILE + FOR 嵌套、批量更新、EXCEPTION 容错
    -- ============================================================
    PROCEDURE sync_inventory_from_erp(
        p_batch_size IN NUMBER DEFAULT 100,
        p_synced     OUT NUMBER,
        p_failed     OUT NUMBER
    )
    IS
        v_offset  NUMBER := 0;
        v_done    BOOLEAN := FALSE;
    BEGIN
        p_synced := 0;
        p_failed := 0;

        WHILE NOT v_done LOOP
            DECLARE
                v_processed NUMBER := 0;
            BEGIN
                FOR rec IN (
                    SELECT product_id, sku, new_quantity
                      FROM erp_inventory_snapshot
                     WHERE product_id > v_offset
                     ORDER BY product_id
                     FETCH FIRST p_batch_size ROWS ONLY
                ) LOOP
                    v_offset := rec.product_id;
                    v_processed := v_processed + 1;

                    BEGIN
                        IF rec.new_quantity IS NULL THEN
                            p_failed := p_failed + 1;
                        ELSE
                            UPDATE inventory
                               SET quantity_on_hand = rec.new_quantity,
                                   last_sync_date = SYSDATE
                             WHERE product_id = rec.product_id;

                            IF SQL%ROWCOUNT = 0 THEN
                                INSERT INTO inventory (product_id, sku, quantity_on_hand, last_sync_date)
                                VALUES (rec.product_id, rec.sku, rec.new_quantity, SYSDATE);
                            END IF;

                            p_synced := p_synced + 1;
                        END IF;
                    EXCEPTION
                        WHEN OTHERS THEN
                            p_failed := p_failed + 1;
                    END;
                END LOOP;

                -- 一批少于 batch_size 说明处理完毕
                IF v_processed < p_batch_size THEN
                    v_done := TRUE;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    v_done := TRUE;
            END;
        END LOOP;
    END sync_inventory_from_erp;

    -- ============================================================
    -- 顶层 Function 8: classify_order_risk
    -- 演示: 综合多层 IF/CASE + 调用其他函数
    -- ============================================================
    FUNCTION classify_order_risk(
        p_order_id IN NUMBER
    ) RETURN VARCHAR2
    IS
        v_amount   NUMBER;
        v_tier     VARCHAR2(20);
        v_items    NUMBER;
        v_risk     VARCHAR2(10);
    BEGIN
        BEGIN
            SELECT total_amount
              INTO v_amount
              FROM orders
             WHERE order_id = p_order_id;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RETURN 'UNKNOWN';
        END;

        v_tier := get_customer_tier(
            (SELECT customer_id FROM orders WHERE order_id = p_order_id)
        );

        SELECT COUNT(*)
          INTO v_items
          FROM order_lines
         WHERE order_id = p_order_id;

        -- 风险评分矩阵
        IF v_amount IS NULL THEN
            v_risk := 'UNKNOWN';
        ELSIF v_amount > 5000 THEN
            IF v_tier = 'PLATINUM' THEN
                v_risk := 'LOW';
            ELSIF v_tier IN ('GOLD', 'SILVER') THEN
                CASE
                    WHEN v_items > 50 THEN
                        v_risk := 'HIGH';
                    WHEN v_items > 20 THEN
                        v_risk := 'MEDIUM';
                    ELSE
                        v_risk := 'LOW';
                END CASE;
            ELSE
                v_risk := 'HIGH';
            END IF;
        ELSIF v_amount > 1000 THEN
            IF v_tier IS NULL THEN
                v_risk := 'MEDIUM';
            ELSIF v_tier IN ('PLATINUM', 'GOLD') THEN
                v_risk := 'LOW';
            ELSE
                v_risk := 'MEDIUM';
            END IF;
        ELSE
            v_risk := 'LOW';
        END IF;

        RETURN v_risk;
    END classify_order_risk;

    -- ============================================================
    -- 顶层 Procedure 9: archive_old_orders
    -- 演示: 简单 FOR + IF 嵌套
    -- ============================================================
    PROCEDURE archive_old_orders(
        p_days       IN NUMBER DEFAULT 365,
        p_archived   OUT NUMBER
    )
    IS
        v_cutoff DATE;
    BEGIN
        p_archived := 0;
        v_cutoff := SYSDATE - p_days;

        FOR rec IN (
            SELECT order_id
              FROM orders
             WHERE status IN ('DELIVERED', 'CANCELLED', 'RETURNED')
               AND updated_date < v_cutoff
             ORDER BY order_id
        ) LOOP
            BEGIN
                INSERT INTO orders_archive
                SELECT * FROM orders WHERE order_id = rec.order_id;

                DELETE FROM orders WHERE order_id = rec.order_id;

                p_archived := p_archived + 1;
            EXCEPTION
                WHEN OTHERS THEN
                    NULL;
            END;
        END LOOP;
    END archive_old_orders;

    -- ============================================================
    -- Package 初始化块
    -- ============================================================
BEGIN
    -- 启动时加载配置
    g_pkg_initialized := TRUE;

    -- 校验关键配置
    IF g_tax_rate IS NULL THEN
        g_tax_rate := 0.08;
    END IF;

    IF g_max_retry IS NULL OR g_max_retry <= 0 THEN
        g_max_retry := 3;
    END IF;

    -- 记录启动日志
    INSERT INTO system_log (module, message, log_date)
    VALUES ('ECOMMERCE_PKG', 'Package initialized', SYSDATE);
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- 初始化失败不阻塞
END ecommerce_pkg;
/

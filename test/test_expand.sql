-- 测试PL/SQL文件，用于验证展开所有功能
CREATE OR REPLACE PACKAGE test_package AS
    -- Package header declarations
    FUNCTION get_user_name(p_user_id NUMBER) RETURN VARCHAR2;
    PROCEDURE update_user_status(p_user_id NUMBER, p_status VARCHAR2);
END test_package;
/

CREATE OR REPLACE PACKAGE BODY test_package AS
    
    FUNCTION get_user_name(p_user_id NUMBER) RETURN VARCHAR2 IS
        v_name VARCHAR2(100);
    BEGIN
        SELECT name INTO v_name 
        FROM users 
        WHERE user_id = p_user_id;
        
        RETURN v_name;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 'Unknown User';
        WHEN OTHERS THEN
            RAISE;
    END get_user_name;
    
    PROCEDURE update_user_status(p_user_id NUMBER, p_status VARCHAR2) IS
    BEGIN
        UPDATE users 
        SET status = p_status,
            updated_date = SYSDATE
        WHERE user_id = p_user_id;
        
        IF SQL%ROWCOUNT = 0 THEN
            RAISE_APPLICATION_ERROR(-20001, 'User not found');
        END IF;
        
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END update_user_status;
    
END test_package;
/

-- =============================================================================
-- 用例: CREATE TYPE BODY(对象类型体) / 简单结构 (type_body_simple.sql)
-- 说明: 补充覆盖 —— 解析器识别为 TYPE_BODY 节点, MEMBER FUNCTION 为成员方法。
-- =============================================================================
CREATE OR REPLACE TYPE BODY t_address IS
    MEMBER FUNCTION to_one_line RETURN VARCHAR2 IS
    BEGIN
        RETURN street || ', ' || city || ' ' || postal;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN '?';
    END to_one_line;
END;
/

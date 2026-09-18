-- =============================================================================
-- 用例: CREATE TYPE(对象类型) / 简单结构 (type_object_simple.sql)
-- 说明: 补充覆盖 —— 解析器识别为 TYPE 节点(对象规格), 成员方法为声明形式。
-- 注: .sql 扩展名保证 VS Code 语言关联(sql)触发大纲。
-- =============================================================================
CREATE OR REPLACE TYPE t_address AS OBJECT (
    street  VARCHAR2(200),
    city    VARCHAR2(50),
    postal  VARCHAR2(10),

    MEMBER FUNCTION to_one_line RETURN VARCHAR2
);
/

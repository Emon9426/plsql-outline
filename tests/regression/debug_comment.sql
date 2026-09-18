-- 简单的注释测试
/* 这是一个多行注释
 * CREATE OR REPLACE PACKAGE BODY fake_package IS
 *   FUNCTION fake_func RETURN NUMBER IS
 *   BEGIN
 *     RETURN 1;
 *   END;
 * END fake_package;
 */

CREATE OR REPLACE FUNCTION real_function RETURN NUMBER IS
BEGIN
    RETURN 42;
END real_function;
/

/* 文件末尾注释
 * CREATE OR REPLACE TRIGGER fake_trigger
 *   BEFORE UPDATE ON fake_table
 * BEGIN
 *   NULL;
 * END;
 */

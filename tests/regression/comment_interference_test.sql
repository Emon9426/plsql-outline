CREATE OR REPLACE procedure comment_test
IS
   /* 多行注释
      可能影响解析 */
   -- 单行注释
   FUNCTION commented_func return varchar2 is
   begin
      return 'test';
   end;
   
   /* 另一个多行注释 */
   FUNCTION func_after_comment(
      /* 参数注释 */
      p1 in varchar2, -- 行末注释
      p2 in number
   )
   return varchar2 is
   begin
      /* 函数体注释 */
      return p1 || to_char(p2);
   end;
BEGIN
   null;
END;

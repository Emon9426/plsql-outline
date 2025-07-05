CREATE OR REPLACE procedure complex_proc
IS
   FUNCTION func1 return varchar2 is
   begin
      return 'func1';
   end;
   
   FUNCTION func2(p1 in varchar2) return varchar2 is
      FUNCTION nested_func return varchar2 is
      begin
         return 'nested';
      end;
   begin
      return nested_func || p1;
   end;
BEGIN
   null;
END;

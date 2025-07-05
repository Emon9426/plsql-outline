CREATE OR REPLACE procedure test_proc
IS
FUNCTION simple_func return varchar2 is
begin
  return 'test';
end;
BEGIN
  null;
END;

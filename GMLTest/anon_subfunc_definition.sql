DECLARE
    v_total      NUMBER;
    v_emp_name   VARCHAR2(100);
    CURSOR c_emp IS SELECT ename FROM emp;

    PROCEDURE print_msg(p_msg IN VARCHAR2) IS
    BEGIN
        DBMS_OUTPUT.PUT_LINE(p_msg);
    END print_msg;

    FUNCTION calc_bonus(p_sal IN NUMBER) RETURN NUMBER IS
    BEGIN
        RETURN p_sal * 0.1;
    END calc_bonus;
BEGIN
    print_msg('start');
    OPEN c_emp;
    FETCH c_emp INTO v_emp_name;
    CLOSE c_emp;
    v_total := calc_bonus(5000);
    print_msg('total=' || v_total);
EXCEPTION
    WHEN OTHERS THEN
        print_msg('error');
END;
/

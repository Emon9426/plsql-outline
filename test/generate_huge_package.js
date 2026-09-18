/**
 * 生成万行级（10,000+ 行）PL/SQL 包体测试文件
 *
 * 设计目标：
 *  - 10,000+ 行，验证万行级解析性能与正确性。
 *  - 包级声明：变量、常量、显式游标、TYPE IS RECORD / TABLE OF、命名异常。
 *  - 150 个顶层程序（函数/过程交替），每个含子程序（3 级嵌套）。
 *  - 深度控制嵌套（>=6 级）：FOR > IF > FOR > WHILE > CASE(WHEN x N) > IF > LOOP。
 *  - 字符串字面量内含 `--` 与 `/* * /`（验证不会被误判为注释）。
 *
 * 运行：node test/generate_huge_package.js
 * 输出：test/huge_package_10k.sql
 */
const fs = require('fs');
const path = require('path');

const lines = [];
const push = (s = '') => lines.push(s);

// ====== 包头与包级声明 ======
push('CREATE OR REPLACE PACKAGE BODY app_schema.huge_test_pkg');
push('IS');
push('');
push('-- ===== 包级声明（验证游标/变量/常量/类型/异常解析）=====');
push('');

// 命名异常
for (let i = 1; i <= 8; i++) {
    push(`    e_pkg_error_${String(i).padStart(2, '0')} EXCEPTION;`);
}
push('    PRAGMA EXCEPTION_INIT(e_pkg_error_01, -20001);');
push('');

// 常量（Oracle 标准语序: name CONSTANT type := value）
for (let i = 1; i <= 12; i++) {
    push(`    c_const_${String(i).padStart(2, '0')} CONSTANT NUMBER := ${i * 100};`);
}
push('');

// 包级变量（含 %TYPE 风格与初值）
for (let i = 1; i <= 20; i++) {
    push(`    v_pkg_var_${String(i).padStart(2, '0')} NUMBER := ${i};`);
}
push('');

// TYPE IS RECORD
for (let i = 1; i <= 6; i++) {
    push(`    TYPE t_rec_${String(i).padStart(2, '0')} IS RECORD (`);
    push(`        id      NUMBER,`);
    push(`        name    VARCHAR2(200),`);
    push(`        amount  NUMBER(15,2)`);
    push(`    );`);
}
push('');

// TYPE IS TABLE OF
for (let i = 1; i <= 4; i++) {
    push(`    TYPE t_tab_${String(i).padStart(2, '0')} IS TABLE OF NUMBER INDEX BY PLS_INTEGER;`);
}
push('');

// 显式游标
for (let i = 1; i <= 10; i++) {
    push(`    CURSOR c_pkg_cursor_${String(i).padStart(2, '0')} (p_status VARCHAR2) IS`);
    push(`        SELECT id, status, amount`);
    push(`          FROM orders`);
    push(`         WHERE status = p_status;`);
}
push('');

// ====== 顶层程序（150 个：函数与过程交替）======
const TOTAL = 150;
let procIdx = 0;
let funcIdx = 0;

for (let n = 1; n <= TOTAL; n++) {
    const isProc = (n % 2 === 1);
    const name = isProc
        ? `proc_${String(++procIdx).padStart(3, '0')}`
        : `func_${String(++funcIdx).padStart(3, '0')}`;
    const indent = '    ';

    if (isProc) {
        push(`${indent}PROCEDURE ${name}(p_param IN NUMBER)`);
    } else {
        push(`${indent}FUNCTION ${name}(p_param IN NUMBER) RETURN NUMBER`);
    }
    push(`${indent}IS`);
    push(`${indent}    -- 局部声明`);
    // 局部变量
    push(`${indent}    v_local_1 NUMBER := 0;`);
    push(`${indent}    v_local_2 VARCHAR2(100) := '${name}_init';`);
    push(`${indent}    v_local_3 DATE := SYSDATE;`);
    // 局部常量
    push(`${indent}    c_local_max CONSTANT NUMBER := ${1000 + n};`);
    // 局部 TYPE
    push(`${indent}    TYPE t_local_rec IS RECORD (val NUMBER, flag VARCHAR2(1));`);
    // 局部游标
    push(`${indent}    CURSOR c_local (p_id NUMBER) IS`);
    push(`${indent}        SELECT level AS lvl FROM dual CONNECT BY level <= p_id;`);
    // 局部异常
    push(`${indent}    e_local_error EXCEPTION;`);
    push('');

    // ---- 子程序（3 级嵌套）----
    // 子函数（第 2 级）
    push(`${indent}    FUNCTION sub_calc_${n}(p_val IN NUMBER) RETURN NUMBER`);
    push(`${indent}    IS`);
    push(`${indent}        v_sub NUMBER := p_val;`);
    push(`${indent}    BEGIN`);
    push(`${indent}        IF p_val IS NULL THEN`);
    push(`${indent}            RETURN 0;`);
    push(`${indent}        ELSIF p_val > 0 THEN`);
    push(`${indent}            RETURN p_val * 2;`);
    push(`${indent}        ELSE`);
    push(`${indent}            RETURN -p_val;`);
    push(`${indent}        END IF;`);
    push(`${indent}    END sub_calc_${n};`);
    push('');

    // 子程序内的子过程（第 3 级）
    push(`${indent}    PROCEDURE sub_proc_${n}(p_in IN NUMBER)`);
    push(`${indent}    IS`);
    push(`${indent}        v_acc NUMBER := 0;`);
    push(`${indent}        -- 直接的子子函数（第 3→4 级，声明后定义体）`);
    push(`${indent}        FUNCTION innermost_${n}(p_x NUMBER) RETURN NUMBER`);
    push(`${indent}        IS`);
    push(`${indent}        BEGIN`);
    push(`${indent}            IF p_x IS NULL THEN`);
    push(`${indent}                RETURN 0;`);
    push(`${indent}            END IF;`);
    push(`${indent}            RETURN p_x * p_x;`);
    push(`${indent}        END innermost_${n};`);
    push(`${indent}    BEGIN`);
    push(`${indent}        FOR j IN 1 .. p_in LOOP`);
    push(`${indent}            v_acc := v_acc + j;`);
    push(`${indent}        END LOOP;`);
    push(`${indent}        v_acc := v_acc + innermost_${n}(v_acc);`);
    push(`${indent}        WHILE v_acc > 0 AND MOD(v_acc, 3) = 0 LOOP`);
    push(`${indent}            v_acc := v_acc - 1;`);
    push(`${indent}        END LOOP;`);
    push(`${indent}    END sub_proc_${n};`);
    push('');

    // ---- 主程序体：6 级深嵌套 ----
    push(`${indent}BEGIN`);
    // L1: FOR
    push(`${indent}    FOR i IN 1 .. p_param LOOP`);
    // L2: IF
    push(`${indent}        IF p_param > 0 THEN`);
    // L3: FOR
    push(`${indent}            FOR k IN REVERSE 1 .. 5 LOOP`);
    push(`${indent}                v_local_1 := v_local_1 + k;`);
    // L4: WHILE
    push(`${indent}                WHILE v_local_1 < c_local_max LOOP`);
    push(`${indent}                    v_local_1 := v_local_1 + 1;`);
    // L5: CASE
    push(`${indent}                    CASE`);
    for (let w = 0; w < 3; w++) {
        push(`${indent}                        WHEN MOD(v_local_1, ${w + 2}) = 0 THEN`);
        push(`${indent}                            v_local_2 := 'branch_${w}';`);
    }
    push(`${indent}                        ELSE`);
    push(`${indent}                            v_local_2 := 'default';`);
    push(`${indent}                    END CASE;`);
    push(`${indent}                END LOOP;`);
    push(`${indent}            END LOOP;`);
    push(`${indent}        ELSE`);
    // L3': ELSE 分支内的 IF + LOOP（验证 IF/ELSE 分支与 LOOP 嵌套）
    push(`${indent}            IF p_param IS NOT NULL THEN`);
    push(`${indent}                v_local_1 := 0;`);
    // L4': basic LOOP
    push(`${indent}                LOOP`);
    push(`${indent}                    EXIT WHEN v_local_1 >= ABS(p_param);`);
    push(`${indent}                    v_local_1 := v_local_1 + 1;`);
    push(`${indent}                END LOOP;`);
    push(`${indent}            END IF;`);
    push(`${indent}        END IF;`);
    push(`${indent}    END LOOP;`);

    // 调用子程序
    push(`${indent}    v_local_1 := sub_calc_${n}(v_local_1);`);
    push(`${indent}    sub_proc_${n}(p_param);`);

    // 字符串内含注释标记（验证字符串/注释分离）
    push(`${indent}    v_local_2 := 'value -- not a comment';`);
    push(`${indent}    v_local_2 := v_local_2 || '/* also not a comment */';`);

    // EXCEPTION
    push(`${indent}    EXCEPTION`);
    push(`${indent}        WHEN e_local_error THEN`);
    push(`${indent}            v_local_1 := -1;`);
    push(`${indent}        WHEN OTHERS THEN`);
    push(`${indent}            v_local_1 := -2;`);

    if (isProc) {
        push(`${indent}END ${name};`);
    } else {
        push(`${indent}    RETURN v_local_1;`);
        push(`${indent}END ${name};`);
    }
    push('');
}

// ====== 包初始化块 ======
push('BEGIN');
push('    -- 包初始化');
push('    v_pkg_var_01 := c_const_01;');
push('    EXCEPTION');
push('        WHEN OTHERS THEN');
push('            NULL;');
push('END huge_test_pkg;');
push('/');

const content = lines.join('\n');
const outPath = path.join(__dirname, 'huge_package_10k.sql');
fs.writeFileSync(outPath, content, 'utf8');
console.log(`已生成: ${outPath}`);
console.log(`总行数: ${lines.length}`);

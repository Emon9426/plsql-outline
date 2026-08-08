/**
 * 生成大规模PL/SQL测试文件
 * 目标: ~1000行, 100+ Function/Procedure, 含Sub程序和控制结构
 */
const fs = require('fs');
const path = require('path');

let lines = [];
let lineNum = 0;

function addLine(text) {
    lines.push(text);
    lineNum++;
}

// Package Header
addLine('CREATE OR REPLACE PACKAGE BODY schema_test.large_test_pkg');
addLine('IS');
addLine('');

// 生成50个Function
for (let i = 1; i <= 50; i++) {
    const funcName = `func_${String(i).padStart(3, '0')}`;
    addLine(`    FUNCTION ${funcName}(p_id IN NUMBER) RETURN VARCHAR2`);
    addLine('    IS');
    addLine(`        v_result VARCHAR2(200);`);
    
    // 每5个函数嵌入一个Sub Function
    if (i % 5 === 0) {
        const subName = `sub_func_${String(i).padStart(3, '0')}`;
        addLine(`        FUNCTION ${subName}(p_val IN NUMBER) RETURN NUMBER`);
        addLine('        IS');
        addLine('        BEGIN');
        addLine('            IF p_val > 0 THEN');
        addLine('                RETURN p_val * 2;');
        addLine('            ELSE');
        addLine('                RETURN 0;');
        addLine('            END IF;');
        addLine(`        END ${subName};`);
        addLine('');
    }
    
    addLine('    BEGIN');
    
    // 添加不同的控制结构
    if (i % 3 === 0) {
        // IF/ELSIF/ELSE
        addLine('        IF p_id > 100 THEN');
        addLine(`            v_result := '${funcName}_high';`);
        addLine('        ELSIF p_id > 50 THEN');
        addLine(`            v_result := '${funcName}_medium';`);
        addLine('        ELSE');
        addLine(`            v_result := '${funcName}_low';`);
        addLine('        END IF;');
    } else if (i % 3 === 1) {
        // FOR LOOP
        addLine('        FOR j IN 1..p_id LOOP');
        addLine(`            v_result := v_result || 'x';`);
        addLine('        END LOOP;');
    } else {
        // WHILE LOOP
        addLine('        WHILE LENGTH(v_result) < p_id LOOP');
        addLine(`            v_result := v_result || 'y';`);
        addLine('        END LOOP;');
    }
    
    addLine('        RETURN v_result;');
    addLine(`    END ${funcName};`);
    addLine('');
}

// 生成30个Procedure
for (let i = 1; i <= 30; i++) {
    const procName = `proc_${String(i).padStart(3, '0')}`;
    addLine(`    PROCEDURE ${procName}(p_input IN VARCHAR2, p_output OUT NUMBER)`);
    addLine('    IS');
    addLine('        v_temp NUMBER := 0;');
    
    // 每5个过程嵌入一个Sub Procedure
    if (i % 5 === 0) {
        const subName = `sub_proc_${String(i).padStart(3, '0')}`;
        addLine(`        PROCEDURE ${subName}(p_val IN OUT NUMBER)`);
        addLine('        IS');
        addLine('        BEGIN');
        addLine('            LOOP');
        addLine('                EXIT WHEN p_val <= 0;');
        addLine('                p_val := p_val - 1;');
        addLine('            END LOOP;');
        addLine(`        END ${subName};`);
        addLine('');
    }
    
    addLine('    BEGIN');
    
    // 添加控制结构
    if (i % 4 === 0) {
        // CASE statement
        addLine('        CASE p_input');
        addLine(`            WHEN 'A' THEN`);
        addLine('                v_temp := 1;');
        addLine(`            WHEN 'B' THEN`);
        addLine('                v_temp := 2;');
        addLine(`            WHEN 'C' THEN`);
        addLine('                v_temp := 3;');
        addLine('        END CASE;');
    } else if (i % 4 === 1) {
        // Nested IF inside FOR
        addLine('        FOR k IN 1..10 LOOP');
        addLine('            IF MOD(k, 2) = 0 THEN');
        addLine('                v_temp := v_temp + k;');
        addLine('            END IF;');
        addLine('        END LOOP;');
    } else {
        // Simple IF
        addLine('        IF p_input IS NOT NULL THEN');
        addLine('            v_temp := LENGTH(p_input);');
        addLine('        END IF;');
    }
    
    addLine('        p_output := v_temp;');
    addLine(`    END ${procName};`);
    addLine('');
}

// 字符串内含注释的边界场景
addLine('    -- 边界场景：字符串内含注释标记');
addLine(`    FUNCTION edge_case_func RETURN VARCHAR2`);
addLine('    IS');
addLine(`        v_sql VARCHAR2(200) := 'SELECT * FROM t -- not a comment';`);
addLine(`        v_block VARCHAR2(100) := '/* also not a comment */';`);
addLine('    BEGIN');
addLine('        RETURN v_sql;');
addLine('    END edge_case_func;');
addLine('');

// Package初始化块
addLine('BEGIN');
addLine('    -- Package initialization');
addLine('    NULL;');
addLine('END large_test_pkg;');
addLine('/');

// 写入文件
const outputPath = path.join(__dirname, 'large_package_100funcs.sql');
fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
console.log(`Generated ${lines.length} lines to ${outputPath}`);
console.log(`Functions: 50 top-level + 10 sub = 60`);
console.log(`Procedures: 30 top-level + 6 sub = 36`);
console.log(`Total methods: 96+ (including edge_case_func = 97)`);

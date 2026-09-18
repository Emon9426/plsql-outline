/**
 * tests/corpus 长代码测试文件生成器
 *
 * 生成 14 个 10,000+ 行的 PL/SQL 测试文件（确定性输出, 可重复再生）:
 *   function/func_long.fnc                函数 / 长代码(简单结构: 直线体+基础控制)
 *   function/func_long_complex.fnc        函数 / 长代码+复杂结构(嵌套子程序/3层循环/注释风暴/内联匿名块/Q-quote)
 *   procedure/proc_long.prc               过程 / 长代码(简单结构)
 *   procedure/proc_long_complex.prc       过程 / 长代码+复杂结构(另含前置声明对)
 *   package_spec/pkg_spec_long.pks        包规格 / 长代码(约千名成员声明)
 *   package_spec/pkg_spec_long_complex.pks 包规格 / 长代码+复杂结构(注释掉的成员/Q-quote 常量)
 *   package_body/pkg_body_long.pkb        包体 / 长代码(约两百个成员, 各含异常段)
 *   package_body/pkg_body_long_complex.pkb 包体 / 长代码+复杂结构(复杂成员+初始化块)
 *   trigger/trg_long.trg                  触发器 / 长代码(触发器体=匿名块)
 *   trigger/trg_long_complex.trg          触发器 / 长代码+复杂结构(匿名块内嵌套子程序)
 *   anonymous/anon_declare_long.sql       匿名块 DECLARE 形 / 长代码
 *   anonymous/anon_declare_long_complex.sql 匿名块 DECLARE 形 / 长代码+复杂结构
 *   anonymous/anon_begin_long.sql         匿名块顶层裸 BEGIN 形 / 长代码(自包含语句)
 *   anonymous/anon_begin_long_complex.sql  匿名块顶层裸 BEGIN 形 / 长代码+复杂结构
 *
 * 解析器约束(与 src/parser.ts 对齐, 生成内容必须满足):
 *   - BEGIN / EXCEPTION / DECLARE / IS / AS 独占一行; END [name]; 独占一行
 *   - IF..THEN / WHILE..LOOP / FOR..LOOP 单行完整; END IF/LOOP/CASE; 独占一行
 *   - 单文件 <= 50000 行, 嵌套深度 <= 15, 控制结构深度 <= 10
 *
 * 运行: node tests/corpus/generate-long.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const TARGET_LINES = 10100;   // 目标行数(要求 >= 10000, 留余量)
const ROOT = __dirname;

/** 4 位零填充编号 */
const pad = (n) => String(n).padStart(4, '0');

class Buf {
    constructor() { this.lines = []; }
    add(...ls) { this.lines.push(...ls); return this; }
    blank() { this.lines.push(''); return this; }
    get length() { return this.lines.length; }
}

// ====== 变量池命名 ======
const POOL_UNIT = 120;   // 函数/过程声明区变量池大小
const POOL_ANON = 80;    // 匿名块变量池大小
const POOL_TRG  = 60;    // 触发器变量池大小

const poolName = (i, size) => `v_pool_${pad(((Math.abs(i) - 1) % size) + 1)}`;
const poolVars = (i, size) => [1, 2, 3, 4].map(k => poolName(i + k - 1, size));
const poolDecls = (size) =>
    Array.from({ length: size }, (_, k) => `    v_pool_${pad(k + 1)} NUMBER := ${k + 1};`);

// ====== 普通填充段(长代码·简单结构) =========================================

/** 赋值 + IF/ELSIF/ELSE */
function fillerIf(i, [a, b, c]) {
    return [
        `    -- 段落 ${pad(i)}: 赋值与分支`,
        `    ${a} := ${a} + ${i};`,
        `    IF ${a} > ${i} THEN`,
        `        ${b} := ${b} + 1;`,
        `    ELSIF ${a} = ${i} THEN`,
        `        ${c} := 0;`,
        `    ELSE`,
        `        ${b} := ${i * 2};`,
        `    END IF;`,
        ``
    ];
}

/** FOR 循环 + 内嵌 IF */
function fillerFor(i, [a, b]) {
    return [
        `    -- 段落 ${pad(i)}: 计数循环`,
        `    FOR k IN 1 .. ${3 + (i % 5)} LOOP`,
        `        ${a} := ${a} + k;`,
        `        IF MOD(k, 2) = 0 THEN`,
        `            ${b} := ${b} + 1;`,
        `        END IF;`,
        `    END LOOP;`,
        ``
    ];
}

/** WHILE 循环 */
function fillerWhile(i, [a, b]) {
    return [
        `    -- 段落 ${pad(i)}: 条件循环`,
        `    WHILE ${a} > ${i} LOOP`,
        `        ${a} := ${a} - 1;`,
        `        ${b} := ${b} + 2;`,
        `    END LOOP;`,
        ``
    ];
}

/** 基础 LOOP + EXIT WHEN */
function fillerLoop(i, [a, b]) {
    return [
        `    -- 段落 ${pad(i)}: 基础循环`,
        `    DECLARE`,
        `        l_guard_${pad(i % 100)} NUMBER := 0;`,
        `    BEGIN`,
        `        LOOP`,
        `            l_guard_${pad(i % 100)} := l_guard_${pad(i % 100)} + 1;`,
        `            ${a} := ${a} + l_guard_${pad(i % 100)};`,
        `            EXIT WHEN l_guard_${pad(i % 100)} >= ${2 + (i % 4)};`,
        `        END LOOP;`,
        `        ${b} := ${b} + 1;`,
        `    EXCEPTION`,
        `        WHEN OTHERS THEN`,
        `            NULL;`,
        `    END;`,
        ``
    ];
}

const SIMPLE_FILLERS = [fillerIf, fillerFor, fillerWhile, fillerLoop];

// ====== 复杂段(长代码·复杂结构, 需变量池) ===================================

/** 嵌套 3 层循环: FOR > WHILE > FOR */
function segThreeLoops(i, [a, b]) {
    return [
        `    -- 复杂段 ${pad(i)}: 嵌套 3 层循环(FOR > WHILE > FOR)`,
        `    FOR i3 IN 1 .. 4 LOOP`,
        `        WHILE ${a} > 0 LOOP`,
        `            FOR j3 IN 1 .. 3 LOOP`,
        `                ${b} := ${b} + i3 * j3;`,
        `            END LOOP;`,
        `            ${a} := ${a} - 1;`,
        `        END LOOP;`,
        `        ${a} := ${a} + 2;`,
        `    END LOOP;`,
        ``
    ];
}

/** 注释风暴: 单行注释掉的代码结构 + 块注释掉的整个子过程 + 行尾注释 */
function segCommentStorm(i, [a]) {
    return [
        `    -- ================================================================`,
        `    -- 复杂段 ${pad(i)}: 注释风暴`,
        `    -- ================================================================`,
        `    -- 以下 IF 块被单行注释注释掉(不应出现在大纲):`,
        `    -- IF ${a} > 100 THEN`,
        `    --     ${a} := 100;`,
        `    -- END IF;`,
        `    /*`,
        `    以下整个子过程被块注释注释掉(不应出现在大纲):`,
        `    PROCEDURE legacy_proc_${pad(i)} IS`,
        `    BEGIN`,
        `        NULL;`,
        `    END legacy_proc_${pad(i)};`,
        `    */`,
        `    ${a} := ${a} + 1;  -- 行尾注释同样不影响`,
        ``
    ];
}

/** 内联匿名块(含嵌套子程序与自己的 EXCEPTION) */
function segInlineAnon(i, [a]) {
    return [
        `    -- 复杂段 ${pad(i)}: 体内内联匿名块(含嵌套子程序)`,
        `    DECLARE`,
        `        v_local_${pad(i)} NUMBER := 0;`,
        ``,
        `        PROCEDURE sub_bump_${pad(i)}(p_in IN NUMBER) IS`,
        `        BEGIN`,
        `            v_local_${pad(i)} := v_local_${pad(i)} + p_in;`,
        `        EXCEPTION`,
        `            WHEN OTHERS THEN`,
        `                NULL;`,
        `        END sub_bump_${pad(i)};`,
        `    BEGIN`,
        `        sub_bump_${pad(i)}(3);`,
        `        FOR k IN 1 .. 3 LOOP`,
        `            v_local_${pad(i)} := v_local_${pad(i)} + k;`,
        `        END LOOP;`,
        `        ${a} := ${a} + v_local_${pad(i)};`,
        `    EXCEPTION`,
        `        WHEN OTHERS THEN`,
        `            NULL;`,
        `    END;`,
        ``
    ];
}

/** Q-quote 字符串(内含注释标记) + CASE ELSE(Issue #3 场景) */
function segQquoteCase(i, [a, b]) {
    return [
        `    -- 复杂段 ${pad(i)}: Q-quote 字符串与 CASE ELSE`,
        `    ${a} := LENGTH(q'[value -- inline /* mark */ ${pad(i)}]');`,
        `    ${b} := ${b} + LENGTH(q'{paired (text) ${pad(i)}}');`,
        `    CASE MOD(${b}, 4)`,
        `        WHEN 0 THEN`,
        `            ${a} := ${a} + 1;`,
        `        WHEN 1 THEN`,
        `            ${a} := ${a} + 2;`,
        `        ELSE`,
        `            ${a} := 0;`,
        `    END CASE;`,
        ``
    ];
}

/** 游标 FOR 循环(内联子查询跨行) */
function segCursorFor(i, [a]) {
    return [
        `    -- 复杂段 ${pad(i)}: 游标 FOR 循环(内联子查询跨行)`,
        `    FOR rec_${pad(i)} IN (`,
        `        SELECT owner, object_name`,
        `          FROM all_objects`,
        `         WHERE object_id > ${i}`,
        `    ) LOOP`,
        `        ${a} := ${a} + 1;`,
        `    END LOOP;`,
        ``
    ];
}

const COMPLEX_SEGS = [segThreeLoops, segCommentStorm, segInlineAnon, segQquoteCase, segCursorFor];

// ====== 自包含段(顶层裸 BEGIN 形匿名块, 无变量声明区) ========================

function fillerSelfFor(i) {
    return [
        `    -- 段落 ${pad(i)}: 自包含计数循环`,
        `    FOR k IN 1 .. ${3 + (i % 4)} LOOP`,
        `        IF MOD(k, 2) = 0 THEN`,
        `            DBMS_OUTPUT.PUT_LINE('seg ${pad(i)} k=' || k);`,
        `        ELSE`,
        `            NULL;`,
        `        END IF;`,
        `    END LOOP;`,
        ``
    ];
}

function fillerSelfInsert(i) {
    return [
        `    -- 段落 ${pad(i)}: DML 语句`,
        `    INSERT INTO zc_long_log(id, tag) VALUES (${i}, 'seg-${pad(i)}');`,
        ``
    ];
}

/** 自包含 3 层循环: FOR > FOR > FOR */
function segSelfLoops3(i) {
    return [
        `    -- 复杂段 ${pad(i)}: 自包含嵌套 3 层循环(FOR > FOR > FOR)`,
        `    FOR a3 IN 1 .. 3 LOOP`,
        `        FOR b3 IN 1 .. 3 LOOP`,
        `            FOR c3 IN 1 .. 2 LOOP`,
        `                IF MOD(a3 + b3 + c3, 2) = 0 THEN`,
        `                    DBMS_OUTPUT.PUT_LINE('hit ' || a3 || b3 || c3);`,
        `                END IF;`,
        `            END LOOP;`,
        `        END LOOP;`,
        `    END LOOP;`,
        ``
    ];
}

/** 自包含注释风暴(不引用变量) */
function segSelfCommentStorm(i) {
    return [
        `    -- ================================================================`,
        `    -- 复杂段 ${pad(i)}: 注释风暴(自包含)`,
        `    -- ================================================================`,
        `    -- FOR legacy IN 1 .. 10 LOOP`,
        `    --     NULL;`,
        `    -- END LOOP;`,
        `    /*`,
        `    DECLARE`,
        `        v_legacy NUMBER;`,
        `    BEGIN`,
        `        NULL;`,
        `    END;`,
        `    */`,
        `    NULL;  -- 行尾注释`,
        ``
    ];
}

/** 自包含内联匿名块(含嵌套子程序 + 3 层循环 + CASE ELSE + Q-quote) */
function segSelfAnon(i) {
    return [
        `    -- 复杂段 ${pad(i)}: 内联匿名块(含嵌套子程序)`,
        `    DECLARE`,
        `        v_acc_${pad(i)} NUMBER := 0;`,
        ``,
        `        PROCEDURE sub_step_${pad(i)}(p_in IN NUMBER) IS`,
        ``,
        `            PROCEDURE sub_step_inner_${pad(i)}(p_in2 IN NUMBER) IS`,
        `            BEGIN`,
        `                IF p_in2 > 0 THEN`,
        `                    DBMS_OUTPUT.PUT_LINE('step ${pad(i)} ' || p_in2);`,
        `                END IF;`,
        `            EXCEPTION`,
        `                WHEN OTHERS THEN`,
        `                    NULL;`,
        `            END sub_step_inner_${pad(i)};`,
        `        BEGIN`,
        `            sub_step_inner_${pad(i)}(p_in);`,
        `        EXCEPTION`,
        `            WHEN OTHERS THEN`,
        `                NULL;`,
        `        END sub_step_${pad(i)};`,
        `    BEGIN`,
        `        FOR k IN 1 .. 5 LOOP`,
        `            v_acc_${pad(i)} := v_acc_${pad(i)} + k;`,
        `            sub_step_${pad(i)}(k);`,
        `        END LOOP;`,
        ``,
        `        CASE MOD(v_acc_${pad(i)}, 3)`,
        `            WHEN 0 THEN`,
        `                DBMS_OUTPUT.PUT_LINE('mod0');`,
        `            ELSE`,
        `                DBMS_OUTPUT.PUT_LINE(q'[other -- value /*x*/ ${pad(i)}]');`,
        `        END CASE;`,
        `    EXCEPTION`,
        `        WHEN OTHERS THEN`,
        `            NULL;`,
        `    END;`,
        ``
    ];
}

const SELF_COMPLEX_SEGS = [segSelfLoops3, segSelfCommentStorm, segSelfAnon, segSelfAnon, segSelfLoops3];

// ====== 声明区嵌套子程序(过程 > 函数 > 过程, 3 层) ===========================

function nestedTrio(id, poolSize) {
    const v = poolName(1, poolSize);
    return [
        `    -- ----- 嵌套子程序 第 1 层: 子过程 -----`,
        `    PROCEDURE sub_calc_${id}(`,
        `        p_in  IN  NUMBER,`,
        `        p_out OUT NUMBER`,
        `    ) IS`,
        `        v_step  NUMBER := 0;`,
        ``,
        `        -- ----- 嵌套子程序 第 2 层: 子函数(位于子过程内) -----`,
        `        FUNCTION sub_format_${id}(p_v IN NUMBER) RETURN VARCHAR2 IS`,
        `            v_txt  VARCHAR2(100);`,
        ``,
        `            -- ----- 嵌套子程序 第 3 层: 子过程(位于子函数内) -----`,
        `            PROCEDURE sub_check_${id}(p_v2 IN NUMBER) IS`,
        `            BEGIN`,
        `                IF p_v2 < 0 THEN`,
        `                    RAISE e_invalid;`,
        `                END IF;`,
        `            EXCEPTION`,
        `                WHEN OTHERS THEN`,
        `                    NULL;`,
        `            END sub_check_${id};`,
        `        BEGIN`,
        `            sub_check_${id}(p_v);`,
        `            v_txt := 'v=' || TO_CHAR(p_v);`,
        `            RETURN v_txt;`,
        `        EXCEPTION`,
        `            WHEN OTHERS THEN`,
        `                RETURN '?';`,
        `        END sub_format_${id};`,
        `    BEGIN`,
        `        v_step := p_in * 2;`,
        ``,
        `        FOR k IN 1 .. 3 LOOP`,
        `            v_step := v_step + k;`,
        `        END LOOP;`,
        ``,
        `        ${v} := ${v} + LENGTH(sub_format_${id}(v_step));`,
        `        p_out := v_step;`,
        `    EXCEPTION`,
        `        WHEN e_invalid THEN`,
        `            p_out := -1;`,
        `        WHEN OTHERS THEN`,
        `            p_out := -2;`,
        `    END sub_calc_${id};`,
        ``
    ];
}

// ====== 组装工具 ============================================================

/** 头/尾固定, 循环增长体直至总行数达到目标 */
function growBody(head, tail, growFn) {
    const body = [];
    let seq = 1;
    while (head.length + body.length + tail.length < TARGET_LINES) {
        body.push(...growFn(seq));
        seq++;
    }
    return [...head, ...body, ...tail];
}

/** 简单结构的增长函数: 4 种普通填充段轮转, 每 40 段插入区段横幅 */
function makeSimpleGrow(varsAt, poolSize) {
    return (seq) => {
        const v = varsAt(seq, poolSize);
        const out = [];
        if (seq % 40 === 1) {
            out.push(`    -- ========== 长代码区段 ${pad(seq)} ==========`);
        }
        out.push(...SIMPLE_FILLERS[(seq - 1) % SIMPLE_FILLERS.length](seq, v));
        return out;
    };
}

/** 复杂结构的增长函数: 每 9 段普通填充后插入一个复杂段(5 种轮转) */
function makeComplexGrow(varsAt, poolSize) {
    const simple = makeSimpleGrow(varsAt, poolSize);
    return (seq) => {
        if (seq % 9 === 0) {
            const seg = COMPLEX_SEGS[Math.floor(seq / 9) % COMPLEX_SEGS.length];
            return seg(seq, varsAt(seq, poolSize));
        }
        return simple(seq);
    };
}

const poolVarsAt = (seq, poolSize) => poolVars(seq, poolSize);

/** 自包含简单增长(顶层裸 BEGIN 形) */
function selfSimpleGrow(seq) {
    const out = [];
    if (seq % 40 === 1) {
        out.push(`    -- ========== 长代码区段 ${pad(seq)} ==========`);
    }
    if (seq % 3 === 0) {
        out.push(...fillerSelfInsert(seq));
    } else {
        out.push(...fillerSelfFor(seq));
    }
    return out;
}

/** 自包含复杂增长(顶层裸 BEGIN 形) */
function selfComplexGrow(seq) {
    if (seq % 9 === 0) {
        return SELF_COMPLEX_SEGS[Math.floor(seq / 9) % SELF_COMPLEX_SEGS.length](seq);
    }
    return selfSimpleGrow(seq);
}

/** 文件头横幅注释 */
function banner(title, points) {
    const out = [
        `-- =============================================================================`,
        `-- 用例: ${title}`,
        `-- 本文件由 tests/corpus/generate-long.js 确定性生成(10,000+ 行), 请勿手工编辑;`,
        `-- 再生: node tests/corpus/generate-long.js`,
    ];
    for (const p of points) {
        out.push(`-- 覆盖: ${p}`);
    }
    out.push(`-- =============================================================================`);
    return out;
}

// ====== 各文件构建器 ========================================================

function buildFunctionLong(complex) {
    const name = complex ? 'fn_long_complex_calc' : 'fn_long_serial_calc';
    const file = complex ? 'function/func_long_complex.fnc' : 'function/func_long.fnc';
    const head = [
        ...banner(
            `Function / ${complex ? '长代码+复杂结构' : '长代码(简单结构)'} (${file})`,
            complex
                ? ['多行签名', '声明区全家桶+嵌套子程序3层(过程>函数>过程)',
                   '普通段落(IF/FOR/WHILE/内联块)与复杂段落轮转:',
                   '3层循环/注释风暴(单行+块注释+注释掉的代码)/内联匿名块/Q-quote+CASE ELSE/游标FOR',
                   'EXCEPTION 多 WHEN']
                : ['多行签名', '声明区全家桶(变量池120/常量/游标/类型/异常)',
                   '直线体: 赋值/IF-ELSIF-ELSE/FOR/WHILE/基础LOOP/内联DECLARE块',
                   'EXCEPTION 多 WHEN(无嵌套子程序)']
        ),
        `CREATE OR REPLACE FUNCTION ${name}(`,
        `    p_start   IN  NUMBER,`,
        `    p_step    IN  NUMBER,`,
        `    p_rounds  IN  NUMBER DEFAULT 100`,
        `) RETURN NUMBER`,
        `DETERMINISTIC`,
        `IS`,
        `    c_limit    CONSTANT NUMBER := 1000000;`,
        `    c_retry    CONSTANT NUMBER := 3;`,
        `    v_result   NUMBER := 0;`,
        ...poolDecls(POOL_UNIT),
        ``,
        `    CURSOR c_seq IS`,
        `        SELECT seq_val`,
        `          FROM zc_seq_tab`,
        `         WHERE ROWNUM <= 10;`,
        ``,
        `    TYPE t_acc_tab IS TABLE OF NUMBER INDEX BY PLS_INTEGER;`,
        ``,
        `    e_overflow  EXCEPTION;`,
        ...(complex ? [`    e_invalid   EXCEPTION;`, ``] : []),
        ...(complex ? nestedTrio('fn', POOL_UNIT) : []),
        `BEGIN`,
    ];
    const tail = [
        `    v_result := v_pool_0001;`,
        `    RETURN v_result;`,
        `EXCEPTION`,
        `    WHEN e_overflow THEN`,
        `        RETURN -1;`,
        ...(complex ? [`    WHEN e_invalid THEN`, `        RETURN -2;`] : []),
        `    WHEN OTHERS THEN`,
        `        RETURN -99;`,
        `END ${name};`,
        `/`,
    ];
    const grow = complex ? makeComplexGrow(poolVarsAt, POOL_UNIT) : makeSimpleGrow(poolVarsAt, POOL_UNIT);
    return { file, lines: growBody(head, tail, grow) };
}

function buildProcedureLong(complex) {
    const name = complex ? 'pr_long_complex_migrate' : 'pr_long_batch_migrate';
    const file = complex ? 'procedure/proc_long_complex.prc' : 'procedure/proc_long.prc';
    const head = [
        ...banner(
            `Procedure / ${complex ? '长代码+复杂结构' : '长代码(简单结构)'} (${file})`,
            complex
                ? ['多行签名', '前置声明 PROCEDURE fwd_prepare; 与同名真实定义(声明节点原位替换)',
                   '嵌套子程序 3 层(过程>函数>过程)', '复杂段落轮转: 3层循环/注释风暴/内联匿名块/Q-quote/游标FOR',
                   'EXCEPTION 多 WHEN']
                : ['多行签名(含 OUT 参数)', '声明区全家桶(变量池120/常量/游标/类型/异常)',
                   '直线体: 赋值/IF/FOR/WHILE/基础LOOP/内联DECLARE块', 'EXCEPTION 多 WHEN']
        ),
        `CREATE OR REPLACE PROCEDURE ${name}(`,
        `    p_src        IN  VARCHAR2,`,
        `    p_batch_size IN  NUMBER DEFAULT 1000,`,
        `    p_done       OUT NUMBER`,
        `) IS`,
        `    c_max_rows  CONSTANT NUMBER := 500000;`,
        `    v_rows      NUMBER := 0;`,
        ...poolDecls(POOL_UNIT),
        ``,
        `    CURSOR c_src IS`,
        `        SELECT id, data`,
        `          FROM zc_stage_tab`,
        `         WHERE status = 'READY';`,
        ``,
        `    TYPE t_id_tab IS TABLE OF NUMBER INDEX BY PLS_INTEGER;`,
        ``,
        `    e_abort  EXCEPTION;`,
        ...(complex ? [`    e_invalid  EXCEPTION;`, ``] : []),
        ...(complex ? [
            `    -- 前置声明(先挂声明节点, 真实定义原位替换)`,
            `    PROCEDURE fwd_prepare;`,
            ``,
        ] : []),
        ...(complex ? nestedTrio('pr', POOL_UNIT) : []),
        ...(complex ? [
            `    -- 前置声明的真实定义`,
            `    PROCEDURE fwd_prepare IS`,
            `    BEGIN`,
            `        v_rows := v_rows + 1;`,
            `    EXCEPTION`,
            `        WHEN OTHERS THEN`,
            `            NULL;`,
            `    END fwd_prepare;`,
            ``,
        ] : []),
        `BEGIN`,
    ];
    const tail = [
        `    p_done := v_rows + v_pool_0001;`,
        `    COMMIT;`,
        `EXCEPTION`,
        `    WHEN e_abort THEN`,
        `        ROLLBACK;`,
        `        p_done := -1;`,
        ...(complex ? [`    WHEN e_invalid THEN`, `        p_done := -2;`] : []),
        `    WHEN OTHERS THEN`,
        `        ROLLBACK;`,
        `        p_done := -99;`,
        `END ${name};`,
        `/`,
    ];
    const grow = complex ? makeComplexGrow(poolVarsAt, POOL_UNIT) : makeSimpleGrow(poolVarsAt, POOL_UNIT);
    return { file, lines: growBody(head, tail, grow) };
}

// ---- 包规格 ----

function specMemberPair(i) {
    const n = pad(i);
    return [
        `    -- [${n}] 查询类接口`,
        `    FUNCTION get_metric_${n}(`,
        `        p_owner  IN VARCHAR2,`,
        `        p_key    IN NUMBER,`,
        `        p_mode   IN VARCHAR2 DEFAULT 'FAST'`,
        `    ) RETURN NUMBER;`,
        ``,
        `    -- [${n}] 维护类接口`,
        `    PROCEDURE set_metric_${n}(`,
        `        p_owner  IN VARCHAR2,`,
        `        p_key    IN NUMBER,`,
        `        p_value  IN NUMBER`,
        `    );`,
        ``
    ];
}

function specSegCommented(i) {
    const n = pad(i);
    return [
        `    -- ----------------------------------------------------------------`,
        `    -- [${n}] 以下成员被注释掉(不应出现在大纲):`,
        `    -- FUNCTION legacy_get_${n}(p_key IN NUMBER) RETURN NUMBER;`,
        `    /*`,
        `    PROCEDURE legacy_set_${n}(p_key IN NUMBER) IS`,
        `    BEGIN`,
        `        NULL;`,
        `    END legacy_set_${n};`,
        `    */`,
        ``
    ];
}

function specSegQquote(i) {
    const n = pad(i);
    return [
        `    -- [${n}] Q-quote 常量与默认值(内含注释标记)`,
        `    c_hint_${n}  CONSTANT VARCHAR2(200) := q'[HINT /*+ ALL_ROWS */ -- ${n}]';`,
        ``,
        `    FUNCTION eval_${n}(`,
        `        p_note  IN VARCHAR2 DEFAULT q'[n/a -- ${n}]'`,
        `    ) RETURN NUMBER;`,
        ``,
        `    PROCEDURE apply_${n}(`,
        `        p_hint  IN VARCHAR2,`,
        `        p_force IN VARCHAR2 DEFAULT 'N'`,
        `    );`,
        ``
    ];
}

function specSegSection(i) {
    const n = pad(i);
    return [
        `    /* ==================== SECTION ${n}: 报表接口 ==================== */`,
        `    TYPE t_rpt_rec_${n} IS RECORD (`,
        `        id    NUMBER,`,
        `        name  VARCHAR2(100)`,
        `    );`,
        ``,
        `    TYPE t_rpt_tab_${n} IS TABLE OF t_rpt_rec_${n} INDEX BY PLS_INTEGER;`,
        ``,
        `    CURSOR c_rpt_${n} IS`,
        `        SELECT id, name`,
        `          FROM zc_rpt_tab`,
        `         WHERE section_no = ${i};`,
        ``
    ];
}

function buildPackageSpecLong(complex) {
    const name = complex ? 'pkg_long_api_cx' : 'pkg_long_api';
    const file = complex ? 'package_spec/pkg_spec_long_complex.pks' : 'package_spec/pkg_spec_long.pks';
    const head = [
        ...banner(
            `Package Spec / ${complex ? '长代码+复杂结构' : '长代码(简单结构)'} (${file})`,
            complex
                ? ['约千名成员声明(函数/过程交替, 多行签名)',
                   '注释掉的成员(单行注释 + 块注释)', 'Q-quote 常量/参数默认值',
                   '类型家族(RECORD/TABLE OF)与游标区段']
                : ['约千名成员声明(函数/过程交替, 多行签名)', '常量/异常/类型/游标',
                   '包规格只有声明: 不含 Exception 段与子程序体']
        ),
        `CREATE OR REPLACE PACKAGE ${name} IS`,
        ``,
        `    c_version   CONSTANT VARCHAR2(20) := '3.0.0';`,
        `    c_max_rows  CONSTANT NUMBER := 1000000;`,
        ``,
        `    e_not_found  EXCEPTION;`,
        `    e_forbidden  EXCEPTION;`,
        ``,
        `    TYPE t_key_rec IS RECORD (`,
        `        owner  VARCHAR2(30),`,
        `        key    NUMBER`,
        `    );`,
        `    TYPE t_key_tab IS TABLE OF t_key_rec INDEX BY PLS_INTEGER;`,
        ``,
        `    CURSOR c_all_keys IS`,
        `        SELECT owner, key`,
        `          FROM zc_key_tab;`,
        ``,
    ];
    const tail = [
        `END ${name};`,
        `/`,
    ];
    const grow = complex
        ? (seq) => {
            if (seq % 6 === 0) {
                const segs = [specSegCommented, specSegQquote, specSegSection];
                return segs[Math.floor(seq / 6) % segs.length](seq);
            }
            return specMemberPair(seq);
        }
        : (seq) => specMemberPair(seq);
    return { file, lines: growBody(head, tail, grow) };
}

// ---- 包体 ----

/** 简单成员: 局部变量 + 普通填充段 + EXCEPTION */
function bodyMember(i, isFunc) {
    const n = pad(i);
    const kind = isFunc ? 'FUNCTION' : 'PROCEDURE';
    const name = `${isFunc ? 'fn' : 'pr'}_impl_${n}`;
    const fillers = [];
    for (let k = 0; k < 3; k++) {
        const seq = i * 10 + k;
        fillers.push(...SIMPLE_FILLERS[(seq - 1) % SIMPLE_FILLERS.length](seq, ['l_a', 'l_b', 'l_c', 'l_d']));
    }
    return [
        `    -- ==================== [${n}] 成员${isFunc ? '函数' : '过程'} ====================`,
        `    ${kind} ${name}(`,
        `        p_in  IN  NUMBER,`,
        isFunc ? `        p_out OUT NUMBER` : `        p_out OUT NUMBER`,
        `    )${isFunc ? ` RETURN NUMBER` : ''} IS`,
        `        l_a  NUMBER := 1;`,
        `        l_b  NUMBER := 2;`,
        `        l_c  NUMBER := 0;`,
        `        l_d  NUMBER := 0;`,
        `    BEGIN`,
        ...fillers,
        `        p_out := l_a + l_b + l_c + l_d;`,
        `        RETURN 0;`,
        `    EXCEPTION`,
        `        WHEN OTHERS THEN`,
        `            p_out := -1;`,
        `            RETURN -1;`,
        `    END ${name};`,
        ``
    ];
}

/** 复杂成员: 嵌套子程序(函数>过程) + 3 层循环 + 注释风暴 + 内联匿名块 */
function bodyMemberComplex(i) {
    const n = pad(i);
    const name = `pr_cx_${n}`;
    return [
        `    -- ==================== [${n}] 复杂成员 ====================`,
        `    PROCEDURE ${name}(`,
        `        p_in  IN  NUMBER,`,
        `        p_out OUT NUMBER`,
        `    ) IS`,
        `        l_a  NUMBER := 0;`,
        `        l_b  NUMBER := 0;`,
        ``,
        `        -- 嵌套子程序: 函数 > 过程(2 层)`,
        `        FUNCTION sub_fn_${n}(p_v IN NUMBER) RETURN NUMBER IS`,
        `            l_inner  NUMBER;`,
        ``,
        `            PROCEDURE sub_proc_${n}(p_v2 IN OUT NUMBER) IS`,
        `            BEGIN`,
        `                IF p_v2 < 0 THEN`,
        `                    p_v2 := 0;`,
        `                END IF;`,
        `            EXCEPTION`,
        `                WHEN OTHERS THEN`,
        `                    NULL;`,
        `            END sub_proc_${n};`,
        `        BEGIN`,
        `            l_inner := p_v;`,
        `            sub_proc_${n}(l_inner);`,
        `            RETURN l_inner * 2;`,
        `        EXCEPTION`,
        `            WHEN OTHERS THEN`,
        `                RETURN -1;`,
        `        END sub_fn_${n};`,
        `    BEGIN`,
        `        -- 嵌套 3 层循环: FOR > WHILE > FOR`,
        `        FOR a IN 1 .. 3 LOOP`,
        `            WHILE l_a < 10 LOOP`,
        `                FOR b IN 1 .. 2 LOOP`,
        `                    l_a := l_a + a * b;`,
        `                END LOOP;`,
        `            END LOOP;`,
        `            l_a := 0;`,
        `        END LOOP;`,
        ``,
        `        -- 被注释掉的代码结构(不应出现在大纲)`,
        `        -- IF l_b > 100 THEN`,
        `        --     l_b := 100;`,
        `        -- END IF;`,
        `        /*`,
        `        PROCEDURE legacy_cx_${n} IS`,
        `        BEGIN`,
        `            NULL;`,
        `        END legacy_cx_${n};`,
        `        */`,
        ``,
        `        -- 体内内联匿名块`,
        `        DECLARE`,
        `            l_local  NUMBER := 0;`,
        `        BEGIN`,
        `            FOR q IN 1 .. 3 LOOP`,
        `                l_local := l_local + q;`,
        `            END LOOP;`,
        `            l_b := l_b + l_local;`,
        `        EXCEPTION`,
        `            WHEN OTHERS THEN`,
        `                NULL;`,
        `        END;`,
        ``,
        `        p_out := sub_fn_${n}(p_in) + l_b;`,
        `    EXCEPTION`,
        `        WHEN OTHERS THEN`,
        `            p_out := -1;`,
        `    END ${name};`,
        ``
    ];
}

function buildPackageBodyLong(complex) {
    const name = complex ? 'pkg_long_api_cx' : 'pkg_long_api';
    const file = complex ? 'package_body/pkg_body_long_complex.pkb' : 'package_body/pkg_body_long.pkb';
    const head = [
        ...banner(
            `Package Body / ${complex ? '长代码+复杂结构' : '长代码(简单结构)'} (${file})`,
            complex
                ? ['约两百个成员(每 6 个含 1 个复杂成员: 嵌套子程序/3层循环/注释风暴/内联匿名块)',
                   '包级声明 + 前置声明对', '包初始化块(BEGIN..EXCEPTION..END)', '各成员自己的 EXCEPTION']
                : ['约两百个成员过程/函数(局部变量+IF/FOR/WHILE/内联块)', '包级声明',
                   '各成员自己的 EXCEPTION', '无初始化块(BUG-B: 顶层 END 正常闭合)']
        ),
        `CREATE OR REPLACE PACKAGE BODY ${name} IS`,
        ``,
        `    g_run_id    NUMBER := 0;`,
        `    g_last_run  DATE;`,
        `    c_owner     CONSTANT VARCHAR2(30) := 'ZC_TEST';`,
        ...(complex ? [`    c_trace     CONSTANT VARCHAR2(100) := q'[TRACE /*pkg*/ --long]';`, ``] : [``,]),
        ``,
        `    TYPE g_rec IS RECORD (`,
        `        id   NUMBER,`,
        `        val  NUMBER`,
        `    );`,
        ``,
        ...(complex ? [
            `    -- 前置声明(声明节点, 真实定义原位替换)`,
            `    PROCEDURE g_fwd_reset;`,
            ``,
            `    PROCEDURE g_fwd_reset IS`,
            `    BEGIN`,
            `        g_run_id := 0;`,
            `    EXCEPTION`,
            `        WHEN OTHERS THEN`,
            `            NULL;`,
            `    END g_fwd_reset;`,
            ``,
        ] : []),
    ];
    const tail = complex
        ? [
            `    -- ======================= 包初始化块 =======================`,
            `BEGIN`,
            `    g_run_id := g_run_id + 1;`,
            `    g_last_run := SYSDATE;`,
            ``,
            `    IF g_run_id > 0 THEN`,
            `        g_run_id := g_run_id * 2;`,
            `    END IF;`,
            `EXCEPTION`,
            `    WHEN OTHERS THEN`,
            `        g_run_id := -1;`,
            `END ${name};`,
            `/`,
        ]
        : [`END ${name};`, `/`];
    const grow = complex
        ? (seq) => (seq % 6 === 0 ? bodyMemberComplex(seq) : bodyMember(seq, seq % 2 === 0))
        : (seq) => bodyMember(seq, seq % 2 === 0);
    return { file, lines: growBody(head, tail, grow) };
}

// ---- 触发器 ----

function buildTriggerLong(complex) {
    const name = complex ? 'trg_long_complex_guard' : 'trg_long_guard';
    const file = complex ? 'trigger/trg_long_complex.trg' : 'trigger/trg_long.trg';
    const head = [
        ...banner(
            `Trigger / ${complex ? '长代码+复杂结构' : '长代码(简单结构)'} (${file})`,
            complex
                ? ['触发器体(DECLARE..BEGIN..EXCEPTION..END, 解析为 Trigger 下的匿名块)',
                   '匿名块声明区内嵌套子程序 3 层', '复杂段落轮转: 3层循环/注释风暴/内联匿名块/Q-quote/游标FOR',
                   ':new/:old 引用', 'EXCEPTION 多 WHEN']
                : ['触发器体(DECLARE..BEGIN..EXCEPTION..END, 解析为 Trigger 下的匿名块)',
                   '变量池 60 + 常量/异常', ':new 引用', '直线体: 赋值/IF/FOR/WHILE/内联块', 'EXCEPTION 多 WHEN']
        ),
        `CREATE OR REPLACE TRIGGER ${name}`,
        `BEFORE INSERT OR UPDATE ON zc_long_tab`,
        `FOR EACH ROW`,
        `DECLARE`,
        `    c_max_val  CONSTANT NUMBER := 1000000;`,
        ...poolDecls(POOL_TRG),
        ``,
        `    e_bad_val  EXCEPTION;`,
        ...(complex ? [`    e_invalid  EXCEPTION;`, ``] : []),
        ...(complex ? nestedTrio('trg', POOL_TRG) : []),
        `BEGIN`,
    ];
    const tail = [
        `    :new.col_0001 := v_pool_0001;`,
        `EXCEPTION`,
        `    WHEN e_bad_val THEN`,
        `        :new.col_0001 := 0;`,
        ...(complex ? [`    WHEN e_invalid THEN`, `        :new.col_0001 := -1;`] : []),
        `    WHEN OTHERS THEN`,
        `        NULL;`,
        `END ${name};`,
        `/`,
    ];
    const grow = complex ? makeComplexGrow(poolVarsAt, POOL_TRG) : makeSimpleGrow(poolVarsAt, POOL_TRG);
    return { file, lines: growBody(head, tail, grow) };
}

// ---- 匿名块 ----

function buildAnonDeclareLong(complex) {
    const file = complex ? 'anonymous/anon_declare_long_complex.sql' : 'anonymous/anon_declare_long.sql';
    const head = [
        ...banner(
            `匿名块 DECLARE..BEGIN..END / ${complex ? '长代码+复杂结构' : '长代码(简单结构)'} (${file})`,
            complex
                ? ['声明区全家桶 + 嵌套子程序 3 层', '复杂段落轮转: 3层循环/注释风暴/内联匿名块/Q-quote/游标FOR',
                   'EXCEPTION 多 WHEN']
                : ['声明区全家桶(变量池80/常量/游标/类型/异常)', '直线体: 赋值/IF/FOR/WHOLE/内联块',
                   'EXCEPTION 多 WHEN']
        ),
        `DECLARE`,
        `    c_step    CONSTANT NUMBER := 2;`,
        `    v_result  NUMBER := 0;`,
        ...poolDecls(POOL_ANON),
        ``,
        `    CURSOR c_src IS`,
        `        SELECT id, amount`,
        `          FROM zc_stage_orders`,
        `         WHERE status = 'READY';`,
        ``,
        `    TYPE t_row IS RECORD (`,
        `        id      NUMBER,`,
        `        amount  NUMBER`,
        `    );`,
        ``,
        `    e_bad  EXCEPTION;`,
        ...(complex ? [`    e_invalid  EXCEPTION;`, ``] : []),
        ...(complex ? nestedTrio('anon', POOL_ANON) : []),
        `BEGIN`,
    ];
    const tail = [
        `    v_result := v_pool_0001;`,
        `    DBMS_OUTPUT.PUT_LINE('result=' || v_result);`,
        `EXCEPTION`,
        `    WHEN e_bad THEN`,
        `        DBMS_OUTPUT.PUT_LINE('bad');`,
        ...(complex ? [`    WHEN e_invalid THEN`, `        DBMS_OUTPUT.PUT_LINE('invalid');`] : []),
        `    WHEN OTHERS THEN`,
        `        ROLLBACK;`,
        `END;`,
        `/`,
    ];
    const grow = complex ? makeComplexGrow(poolVarsAt, POOL_ANON) : makeSimpleGrow(poolVarsAt, POOL_ANON);
    return { file, lines: growBody(head, tail, grow) };
}

function buildAnonBeginLong(complex) {
    const file = complex ? 'anonymous/anon_begin_long_complex.sql' : 'anonymous/anon_begin_long.sql';
    const head = [
        ...banner(
            `匿名块 BEGIN..END(顶层裸 BEGIN, Issue #5) / ${complex ? '长代码+复杂结构' : '长代码(简单结构)'} (${file})`,
            complex
                ? ['无 DECLARE 区: 复杂度经内联 DECLARE 块(含嵌套子程序)表达',
                   '复杂段落轮转: 自包含3层循环/注释风暴/内联匿名块(嵌套子程序+CASE ELSE+Q-quote)',
                   '顶层 EXCEPTION']
                : ['无 DECLARE 区: 语句自包含(DBMS_OUTPUT/INSERT/FOR/IF)',
                   '直线体 + 基础控制结构', '顶层 EXCEPTION']
        ),
        `BEGIN`,
    ];
    const tail = [
        `    COMMIT;`,
        `EXCEPTION`,
        `    WHEN OTHERS THEN`,
        `        ROLLBACK;`,
        `END;`,
        `/`,
    ];
    const grow = complex ? selfComplexGrow : selfSimpleGrow;
    return { file, lines: growBody(head, tail, grow) };
}

// ====== 主流程 ==============================================================

const BUILDERS = [
    () => buildFunctionLong(false),
    () => buildFunctionLong(true),
    () => buildProcedureLong(false),
    () => buildProcedureLong(true),
    () => buildPackageSpecLong(false),
    () => buildPackageSpecLong(true),
    () => buildPackageBodyLong(false),
    () => buildPackageBodyLong(true),
    () => buildTriggerLong(false),
    () => buildTriggerLong(true),
    () => buildAnonDeclareLong(false),
    () => buildAnonDeclareLong(true),
    () => buildAnonBeginLong(false),
    () => buildAnonBeginLong(true),
];

function main() {
    const summary = [];
    let failed = 0;

    for (const build of BUILDERS) {
        const { file, lines } = build();
        if (lines.length < 10000) {
            console.error(`[FAIL] ${file} 仅 ${lines.length} 行 (< 10000)`);
            failed++;
        }
        const full = path.join(ROOT, file);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, lines.join('\n') + '\n', 'utf8');
        summary.push({ file, lines: lines.length, kb: Math.round(fs.statSync(full).size / 1024) });
    }

    console.log('生成的长代码测试文件:');
    console.table(summary);
    const total = summary.reduce((s, r) => s + r.lines, 0);
    console.log(`共 ${summary.length} 个文件, ${total} 行, 目标每个 >= 10000 行`);

    if (failed > 0) {
        process.exitCode = 1;
    }
}

main();

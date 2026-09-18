/**
 * GMLTest: 常量声明识别测试（Issue #4）
 *
 * 验证 Oracle 标准语序 `name CONSTANT type := value;` 在各上下文中被正确识别：
 *  - 包体 / 包规范 / 独立过程 / DECLARE 匿名块
 *  - %TYPE 锚定、NOT NULL 约束、DEFAULT 初值、带精度类型 VARCHAR2(30)
 *  - 常量不被误记为 VARIABLE 类别；初值文本正确提取
 */
const { PLSQLParser } = require('../../out/parser');
const { DeclarationCategory } = require('../../out/types');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

async function parseOne(code) {
    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    return parser.parse(code, 'constant_test.sql');
}

function findEntry(table, name) {
    return table ? table.get(name) : undefined;
}

async function run() {
    const rec = makeRecorder();

    // ---- Case 1: 包体 + 包规范：标准语序常量被记录为 CONSTANT ----
    const pkgCode = [
        'CREATE OR REPLACE PACKAGE BODY pkg_c AS',
        '  c_max CONSTANT NUMBER := 50000;',
        '  c_rate CONSTANT NUMBER(5,2) := 0.08;',
        '  c_name CONSTANT VARCHAR2(30) := \'STANDARD\';',
        '  v_x NUMBER;',
        'BEGIN',
        '  NULL;',
        'END pkg_c;'
    ].join('\n');
    const pkgResult = await parseOne(pkgCode);
    const pkgTable = pkgResult.nodes[0].variableTable;
    const cMax = findEntry(pkgTable, 'c_max');
    const cRate = findEntry(pkgTable, 'c_rate');
    const cName = findEntry(pkgTable, 'c_name');
    rec.assert('pkg_c_max_recorded', '包体标准语序常量 c_max 被记录', !!cMax, cMax ? 'ok' : 'missing');
    rec.assert('pkg_c_max_category', 'c_max 类别为 CONSTANT', cMax && cMax.category === DeclarationCategory.CONSTANT, cMax && cMax.category);
    rec.assert('pkg_c_max_type', 'c_max 类型为 NUMBER', cMax && cMax.type === 'NUMBER', cMax && cMax.type);
    rec.assert('pkg_c_max_init', 'c_max 初值为 50000', cMax && cMax.initialValue === '50000', cMax && cMax.initialValue);
    rec.assert('pkg_precision_type', '带精度类型 VARCHAR2(30) 常量被记录', !!cName, cName ? 'ok' : 'missing');
    rec.assert('pkg_number_precision', 'NUMBER(5,2) 常量被记录', !!cRate, cRate ? 'ok' : 'missing');
    rec.assert('pkg_var_not_constant', '普通变量 v_x 类别仍为 VARIABLE',
        findEntry(pkgTable, 'v_x') && findEntry(pkgTable, 'v_x').category === DeclarationCategory.VARIABLE,
        findEntry(pkgTable, 'v_x') && findEntry(pkgTable, 'v_x').category);

    // ---- Case 2: 包规范 ----
    const specCode = [
        'CREATE OR REPLACE PACKAGE pkg_c AS',
        '  c_limit CONSTANT NUMBER := 100;',
        'END pkg_c;'
    ].join('\n');
    const specResult = await parseOne(specCode);
    const specTable = specResult.nodes[0].variableTable;
    rec.assert('spec_constant_recorded', '包规范常量 c_limit 被记录为 CONSTANT',
        findEntry(specTable, 'c_limit') && findEntry(specTable, 'c_limit').category === DeclarationCategory.CONSTANT,
        findEntry(specTable, 'c_limit') && findEntry(specTable, 'c_limit').category);

    // ---- Case 3: 独立过程局部常量 ----
    const procCode = [
        'CREATE OR REPLACE PROCEDURE proc_c IS',
        '  c_local CONSTANT NUMBER := 10;',
        'BEGIN',
        '  DBMS_OUTPUT.PUT_LINE(c_local);',
        'END proc_c;'
    ].join('\n');
    const procResult = await parseOne(procCode);
    const procTable = procResult.nodes[0].variableTable;
    rec.assert('proc_local_constant', '过程局部常量 c_local 被记录',
        findEntry(procTable, 'c_local') && findEntry(procTable, 'c_local').category === DeclarationCategory.CONSTANT,
        findEntry(procTable, 'c_local') && findEntry(procTable, 'c_local').category);

    // ---- Case 4: DECLARE 匿名块内常量 ----
    const anonCode = [
        'DECLARE',
        '  c_anon CONSTANT NUMBER := 7;',
        'BEGIN',
        '  NULL;',
        'END;'
    ].join('\n');
    const anonResult = await parseOne(anonCode);
    const anonNode = anonResult.nodes.find(n => n.type === 'ANONYMOUS_BLOCK') || anonResult.nodes[0];
    const anonTable = anonNode && anonNode.variableTable;
    rec.assert('anon_constant', '匿名块常量 c_anon 被记录',
        findEntry(anonTable, 'c_anon') && findEntry(anonTable, 'c_anon').category === DeclarationCategory.CONSTANT,
        findEntry(anonTable, 'c_anon') && findEntry(anonTable, 'c_anon').category);

    // ---- Case 5: %TYPE 锚定 / NOT NULL / DEFAULT ----
    const anchorCode = [
        'CREATE OR REPLACE PACKAGE BODY pkg_a AS',
        '  c_anchor CONSTANT employees.salary%TYPE := 100;',
        '  c_nn     CONSTANT VARCHAR2(30) NOT NULL := \'X\';',
        '  c_def    CONSTANT NUMBER DEFAULT 10;',
        'BEGIN',
        '  NULL;',
        'END pkg_a;'
    ].join('\n');
    const anchorResult = await parseOne(anchorCode);
    const anchorTable = anchorResult.nodes[0].variableTable;
    const cAnchor = findEntry(anchorTable, 'c_anchor');
    const cNn = findEntry(anchorTable, 'c_nn');
    const cDef = findEntry(anchorTable, 'c_def');
    rec.assert('pertype_anchor', '%TYPE 锚定常量被记录', !!cAnchor, cAnchor ? 'ok' : 'missing');
    rec.assert('pertype_type_text', '%TYPE 常量类型含 %TYPE', cAnchor && /%TYPE/i.test(cAnchor.type || ''), cAnchor && cAnchor.type);
    rec.assert('not_null_constant', 'NOT NULL 常量被记录', !!cNn, cNn ? 'ok' : 'missing');
    rec.assert('default_initial', 'DEFAULT 形式初值为 10', cDef && cDef.initialValue === '10', cDef && cDef.initialValue);

    // ---- Case 6: 演示文件（标准语序真实样本）----
    const fs = require('fs');
    const path = require('path');
    const demoPath = path.join(__dirname, '..', '..', 'docs', 'demo', 'hr_salary_pkg_body.sql');
    if (fs.existsSync(demoPath)) {
        const demoResult = await parseOne(fs.readFileSync(demoPath, 'utf8'));
        const demoTable = demoResult.nodes[0].variableTable;
        rec.assert('demo_constants', '演示文件常量 c_max_salary/c_min_salary 被记录为 CONSTANT',
            findEntry(demoTable, 'c_max_salary') && findEntry(demoTable, 'c_max_salary').category === DeclarationCategory.CONSTANT
                && findEntry(demoTable, 'c_min_salary'),
            'c_max_salary=' + (findEntry(demoTable, 'c_max_salary') ? 'ok' : 'missing'));
    }

    return { suiteName: 'constant_declaration_test', cases: rec.cases };
}

// 直接运行时输出控制台结果
if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log('\n=== GMLTest: constant_declaration ===');
        cases.forEach(c => console.log('  ' + (c.passed ? '✓' : '✗') + ' ' + c.name + ': ' + c.desc + (c.passed ? '' : ' [' + c.actual + ']')));
        console.log('\n结果: ' + passed + '/' + cases.length + ' 通过');
        process.exitCode = passed === cases.length ? 0 : 1;
    }).catch(e => { console.error(e); process.exitCode = 1; });
}

module.exports = { run };

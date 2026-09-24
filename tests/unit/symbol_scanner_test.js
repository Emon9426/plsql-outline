/**
 * GMLTest: 轻量符号扫描器测试（Issue #39）
 *
 * 锁定 src/symbolScanner.ts 的提取契约：
 *  - 定向用例：独立单元/包规格声明/包体成员/前置声明去重/触发器/get_ddl 修饰词/
 *    多行 CREATE/引号标识符/作用域结束
 *  - corpus 一致性：全量解析器索引口径的每个符号（名称/类型/所属包/行号）
 *    必须出现在扫描结果中；扫描器允许的良性超集仅限 FUNCTION/PROCEDURE
 *    （包体嵌套子程序/包结束后遗留子程序，行号与名称仍真实）
 *  - 耗时对比：扫描器 vs 全量解析（信息输出，不设断言阈值）
 */
const fs = require('fs');
const path = require('path');
const { PLSQLParser } = require('../../out/parser');
const { NodeType } = require('../../out/types');
const { scanSymbols, symbolsFromParseResult } = require('../../out/symbolScanner');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

/** 符号可比元组：大写名/类型/所属包(大写或空)/行号 */
function tupleOf(s) {
    return `${s.name.toUpperCase()}|${s.type}|${(s.packageName || '').toUpperCase()}|${s.line}`;
}

function tuples(symbols) {
    return symbols.map(tupleOf);
}

async function run() {
    const rec = makeRecorder();

    // ---------- 定向用例 ----------

    // c01: 独立过程
    {
        const symbols = scanSymbols([
            'CREATE OR REPLACE PROCEDURE p_main(p_x IN NUMBER) IS',
            'BEGIN',
            '    NULL;',
            'END p_main;',
            '/'
        ].join('\n')).symbols;
        rec.assert('c01_standalone_proc', '独立过程 → PROCEDURE L1 无所属包',
            tuples(symbols).includes('P_MAIN|' + NodeType.PROCEDURE + '||1'),
            JSON.stringify(symbols));
    }

    // c02: 包规格 → 成员一律声明类型
    {
        const symbols = scanSymbols([
            'CREATE OR REPLACE PACKAGE pkg_s AS',
            '    FUNCTION get_a RETURN NUMBER;',
            '    PROCEDURE do_b(p_i IN NUMBER);',
            'END pkg_s;',
            '/'
        ].join('\n')).symbols;
        const t = tuples(symbols);
        rec.assert('c02_spec_header', '包规格 → PACKAGE_HEADER L1',
            t.includes('PKG_S|' + NodeType.PACKAGE_HEADER + '||1'), JSON.stringify(symbols));
        rec.assert('c02_spec_decl', '规格成员 → *_DECLARATION 带所属包',
            t.includes('GET_A|' + NodeType.FUNCTION_DECLARATION + '|PKG_S|2') &&
            t.includes('DO_B|' + NodeType.PROCEDURE_DECLARATION + '|PKG_S|3'),
            JSON.stringify(symbols));
    }

    // c03: 包体 → 真实成员
    {
        const symbols = scanSymbols([
            'CREATE OR REPLACE PACKAGE BODY pkg_b AS',
            '    FUNCTION calc(p_n IN NUMBER) RETURN NUMBER IS',
            '    BEGIN',
            '        RETURN p_n;',
            '    END calc;',
            '    PROCEDURE run_it IS',
            '    BEGIN',
            '        NULL;',
            '    END run_it;',
            'END pkg_b;',
            '/'
        ].join('\n')).symbols;
        const t = tuples(symbols);
        rec.assert('c03_body_members', '包体成员 → FUNCTION/PROCEDURE 带所属包与行号',
            t.includes('PKG_B|' + NodeType.PACKAGE_BODY + '||1') &&
            t.includes('CALC|' + NodeType.FUNCTION + '|PKG_B|2') &&
            t.includes('RUN_IT|' + NodeType.PROCEDURE + '|PKG_B|6'),
            JSON.stringify(symbols));
    }

    // c04: 包体前置声明 → 定义原位替换（索引只保留定义行）
    {
        const symbols = scanSymbols([
            'CREATE OR REPLACE PACKAGE BODY pkg_f AS',
            '    PROCEDURE later(p_x IN VARCHAR2);',
            '    PROCEDURE first IS',
            '    BEGIN',
            '        later(NULL);',
            '    END first;',
            '    PROCEDURE later(p_x IN VARCHAR2) IS',
            '    BEGIN',
            '        NULL;',
            '    END later;',
            'END pkg_f;',
            '/'
        ].join('\n')).symbols;
        const t = tuples(symbols);
        rec.assert('c04_forward_dedup', '前置声明被同名定义替换（保留定义行，声明行剔除）',
            !t.includes('LATER|' + NodeType.PROCEDURE_DECLARATION + '|PKG_F|2') &&
            t.includes('LATER|' + NodeType.PROCEDURE + '|PKG_F|7'),
            JSON.stringify(symbols));
    }

    // c05: 触发器 + get_ddl 修饰词（FORCE EDITIONABLE）
    {
        const symbols = scanSymbols([
            'CREATE OR REPLACE FORCE EDITIONABLE TRIGGER trg_a',
            'BEFORE INSERT ON t_a FOR EACH ROW',
            'BEGIN',
            '    NULL;',
            'END;',
            '/'
        ].join('\n')).symbols;
        const symbols2 = scanSymbols([
            'CREATE OR REPLACE FORCE EDITIONABLE PACKAGE BODY ddl_pkg AS',
            '    PROCEDURE p1 IS',
            '    BEGIN',
            '        NULL;',
            '    END p1;',
            'END ddl_pkg;',
            '/'
        ].join('\n')).symbols;
        rec.assert('c05_trigger_ddl_modifiers', '触发器与 FORCE/EDITIONABLE 修饰词形态',
            tuples(symbols).includes('TRG_A|' + NodeType.TRIGGER + '||1') &&
            tuples(symbols2).includes('P1|' + NodeType.PROCEDURE + '|DDL_PKG|2'),
            JSON.stringify([symbols, symbols2]));
    }

    // c06: 多行 CREATE 签名
    {
        const symbols = scanSymbols([
            'CREATE OR REPLACE FUNCTION f_long(',
            '    p_a IN NUMBER,',
            '    p_b IN VARCHAR2)',
            'RETURN NUMBER IS',
            'BEGIN',
            '    RETURN p_a;',
            'END f_long;',
            '/'
        ].join('\n')).symbols;
        rec.assert('c06_multiline_create', '多行 CREATE → 起始行号',
            tuples(symbols).includes('F_LONG|' + NodeType.FUNCTION + '||1'),
            JSON.stringify(symbols));
    }

    // c07: 引号标识符（schema 前缀）
    {
        const symbols = scanSymbols([
            'CREATE OR REPLACE PROCEDURE "APPS"."Q_PROC" IS',
            'BEGIN',
            '    NULL;',
            'END Q_PROC;',
            '/'
        ].join('\n')).symbols;
        rec.assert('c07_quoted_id', '带引号标识符去引号',
            tuples(symbols).includes('Q_PROC|' + NodeType.PROCEDURE + '||1'),
            JSON.stringify(symbols));
    }

    // c08: 匿名块内联子程序不索引（与解析器同口径：非包直接子级）
    {
        const symbols = scanSymbols([
            'DECLARE',
            '    PROCEDURE helper IS',
            '    BEGIN',
            '        NULL;',
            '    END helper;',
            'BEGIN',
            '    helper;',
            'END;',
            '/'
        ].join('\n')).symbols;
        rec.assert('c08_anon_inline_skip', '匿名块内联子程序不入索引',
            symbols.length === 0, JSON.stringify(symbols));
    }

    // c09: END <包名> 结束作用域（其后无 CREATE 的子程序不再计入）
    {
        const symbols = scanSymbols([
            'CREATE OR REPLACE PACKAGE BODY pkg_e AS',
            '    PROCEDURE a1 IS',
            '    BEGIN',
            '        NULL;',
            '    END a1;',
            'END pkg_e;',
            'DECLARE',
            '    PROCEDURE stray IS',
            '    BEGIN',
            '        NULL;',
            '    END stray;',
            'BEGIN',
            '    stray;',
            'END;',
            '/'
        ].join('\n')).symbols;
        const t = tuples(symbols);
        rec.assert('c09_scope_end', 'END 包名后作用域关闭（其后的匿名块内联子程序不入索引）',
            t.includes('A1|' + NodeType.PROCEDURE + '|PKG_E|2') &&
            !symbols.some(s => s.name.toUpperCase() === 'STRAY'),
            JSON.stringify(symbols));
    }

    // c12: 游标声明（仅搜索条目，Emon 决策纳入 Ctrl+T）
    {
        const symbols = scanSymbols([
            'CREATE OR REPLACE PACKAGE BODY pkg_cur AS',
            '    CURSOR c_pkg IS SELECT 1 FROM dual;',
            '    CURSOR c_param(',
            '        p_a IN NUMBER,',
            '        p_b IN VARCHAR2) RETURN NUMBER IS',
            '        SELECT p_a FROM dual;',
            '    PROCEDURE use_cur IS',
            '        CURSOR c_local IS SELECT 2 FROM dual;',
            '    BEGIN',
            '        NULL;',
            '    END use_cur;',
            'END pkg_cur;',
            '/'
        ].join('\n')).symbols;
        const t = tuples(symbols);
        rec.assert('c12_cursor_forms', '包级游标带所属包（含跨行参数拼接）、成员局部游标同样提取',
            t.includes('C_PKG|' + NodeType.CURSOR + '|PKG_CUR|2') &&
            t.includes('C_PARAM|' + NodeType.CURSOR + '|PKG_CUR|3') &&
            t.includes('C_LOCAL|' + NodeType.CURSOR + '|PKG_CUR|8'),
            JSON.stringify(symbols));

        const standalone = scanSymbols([
            'CREATE OR REPLACE PROCEDURE p_with_cur IS',
            '    CURSOR c_standalone IS SELECT 1 FROM dual;',
            'BEGIN',
            '    NULL;',
            'END p_with_cur;',
            '/'
        ].join('\n')).symbols;
        rec.assert('c12_cursor_standalone', '独立单元/匿名块内的游标无所属包',
            tuples(standalone).includes('C_STANDALONE|' + NodeType.CURSOR + '||2'),
            JSON.stringify(standalone));

        // 兜底路径（symbolsFromParseResult）同样产出游标（variableTable CURSOR 类别）
        const { PLSQLParser: P } = require('../../out/parser');
        const fallbackResult = await new P().parse([
            'CREATE OR REPLACE PACKAGE BODY pkg_fb AS',
            '    CURSOR c_fb IS SELECT 1 FROM dual;',
            '    PROCEDURE m1 IS',
            '    BEGIN',
            '        NULL;',
            '    END m1;',
            'END pkg_fb;',
            '/'
        ].join('\n'), 'fb.pkb');
        const fbSymbols = symbolsFromParseResult(fallbackResult);
        rec.assert('c12_cursor_fallback', '全量解析兜底路径同样提取游标',
            tuples(fbSymbols).some(x => x.startsWith('C_FB|' + NodeType.CURSOR + '|')),
            JSON.stringify(fbSymbols));
    }

    // ---------- corpus 一致性对照 ----------
    const CORPUS_ROOT = path.resolve(__dirname, '..', 'corpus');
    const CORPUS_EXTS = new Set(['.sql', '.pkb', '.pks', '.pck', '.typ', '.trg', '.prc', '.fnc', '.fcn']);
    const corpusFiles = [];
    (function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full);
            else if (CORPUS_EXTS.has(path.extname(entry.name).toLowerCase())) corpusFiles.push(full);
        }
    })(CORPUS_ROOT);

    let missingTotal = 0;
    let extraTotal = 0;
    let parseMs = 0;
    let scanMs = 0;
    const detailMissing = [];

    for (const file of corpusFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const origLines = content.split('\n');

        const t0 = Date.now();
        const parseResult = await new PLSQLParser().parse(content, file);
        parseMs += Date.now() - t0;
        const parserSymbols = symbolsFromParseResult(parseResult);

        const t1 = Date.now();
        const scannerSymbols = scanSymbols(content).symbols;
        scanMs += Date.now() - t1;

        const scannerTuples = new Set(tuples(scannerSymbols));
        for (const ps of parserSymbols) {
            if (!scannerTuples.has(tupleOf(ps))) {
                missingTotal++;
                detailMissing.push(`${path.basename(file)} 缺 ${tupleOf(ps)}`);
            }
        }
        // 良性超集：仅 FUNCTION/PROCEDURE（嵌套/遗留子程序）或 CURSOR（仅搜索条目），
        // 且行文本确含符号名
        const parserTuples = new Set(tuples(parserSymbols));
        for (const ss of scannerSymbols) {
            if (parserTuples.has(tupleOf(ss))) continue;
            extraTotal++;
            const lineText = (origLines[ss.line - 1] || '').toUpperCase();
            const benign = (ss.type === NodeType.FUNCTION || ss.type === NodeType.PROCEDURE ||
                ss.type === NodeType.CURSOR) &&
                lineText.includes(ss.name.toUpperCase());
            if (!benign) {
                missingTotal++; // 复用失败计数：非良性超集视为不一致
                detailMissing.push(`${path.basename(file)} 非良性超集 ${tupleOf(ss)} 行文本="${lineText.trim()}"`);
            }
        }
    }

    rec.assert('c10_corpus_parity', `corpus ${corpusFiles.length} 文件：解析器符号全命中且超集均良性（缺失/异常 ${missingTotal}）`,
        missingTotal === 0, detailMissing.slice(0, 10).join(' ; '));
    rec.assert('c11_corpus_superset_size', `良性超集规模合理（额外 ${extraTotal} 条，来自嵌套子程序与游标搜索条目）`,
        extraTotal <= corpusFiles.length * 6, String(extraTotal));
    console.log(`  [耗时] 全量解析 ${parseMs}ms vs 快速扫描 ${scanMs}ms（corpus ${corpusFiles.length} 文件）`);

    return { suiteName: 'symbol_scanner_test', cases: rec.cases };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log('\n=== GMLTest: symbol_scanner_test ===');
        cases.forEach(c => console.log('  ' + (c.passed ? '✓' : '✗') + ' ' + c.name + ': ' + c.desc + (c.passed ? '' : ' [' + c.actual + ']')));
        console.log('\n结果: ' + passed + '/' + cases.length + ' 通过');
        process.exitCode = passed === cases.length ? 0 : 1;
    }).catch(e => { console.error(e); process.exitCode = 1; });
}

module.exports = { run };

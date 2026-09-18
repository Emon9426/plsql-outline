/**
 * GMLTest: 匿名块（含 sub function/procedure + 游标）Ctrl+Click 跳转测试
 *
 * 测试对象：GMLTest/anon_subfunc_definition.sql
 * 验证 provideDefinition 在匿名块场景能跳转到：
 *   1. 子过程 print_msg 声明行
 *   2. 子函数 calc_bonus 声明行
 *   3. 游标 c_emp 声明行（OPEN / FETCH 两处使用）
 *   4. 变量 v_total 声明行
 *
 * 注：本套件用桩直供新鲜解析结果（parseDocumentQuiet 置 no-op）。
 * 未保存编辑/新建文件的真实链路由 test/integration E2E（executeDefinitionProvider）覆盖。
 */
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class { constructor(l, c) { this.label = l; this.collapsibleState = c; } },
    ThemeIcon: class { constructor(id) { this.id = id; } },
    EventEmitter: class { constructor() { this.l = []; } event(l) { this.l.push(l); return { dispose() {} }; } fire(d) { this.l.forEach(x => x(d)); } dispose() { this.l = []; } },
    workspace: { getConfiguration: () => ({ get: (k, d) => d }) },
    window: { createOutputChannel: () => ({ appendLine() {}, dispose() {} }) },
    RelativePattern: class { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f, toString: () => f }) },
    Position: class { constructor(l, c) { this.line = l; this.character = c; } },
    Location: class { constructor(u, r) { this.uri = u; this.range = r; } },
    Range: class { constructor(s, e) { this.start = s; this.end = e; } }
};
const o = Module._resolveFilename;
Module._resolveFilename = function (r) { if (r === 'vscode') return 'vscode_mock'; return o.apply(this, arguments); };
require.cache['vscode_mock'] = { exports: mockVscode };

const fs = require('fs');
const path = require('path');
const { PLSQLParser } = require('../out/parser');
const { PLSQLOutlineExtension } = require('../out/extension');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

const SOURCE_FILE = path.join(__dirname, 'anon_subfunc_definition.sql');

function makeDocument(text) {
    const lines = text.split('\n');
    return {
        uri: { fsPath: 'C:/fake/anon_subfunc.sql', toString: () => 'file:///C:/fake/anon_subfunc.sql' },
        fileName: 'C:/fake/anon_subfunc.sql',
        lineAt(line) {
            const t = lines[line] || '';
            return { text: t, range: { start: { line, character: 0 }, end: { line, character: t.length } } };
        },
        getText(range) {
            if (!range) return text;
            const s = range.start, e = range.end;
            if (s.line === e.line) return (lines[s.line] || '').substring(s.character, e.character);
            return (lines[s.line] || '').substring(s.character);
        },
        getWordRangeAtPosition(position, pattern) {
            const lineText = lines[position.line] || '';
            const re = pattern
                ? new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g')
                : /[A-Za-z_]\w*/g;
            let m;
            while ((m = re.exec(lineText)) !== null) {
                if (position.character >= m.index && position.character <= m.index + m[0].length) {
                    return { start: { line: position.line, character: m.index }, end: { line: position.line, character: m.index + m[0].length } };
                }
                if (m[0].length === 0) { re.lastIndex++; }
            }
            return undefined;
        }
    };
}

async function run() {
    const rec = makeRecorder();
    const SOURCE = fs.readFileSync(SOURCE_FILE, 'utf8');
    const srcLines = SOURCE.split('\n');

    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    const t0 = Date.now();
    const result = await parser.parse(SOURCE, 'anon_subfunc_definition.sql');
    const parseTime = Date.now() - t0;

    rec.assert('parse_clean', '匿名块解析零错误', result.metadata.errors.length === 0, JSON.stringify(result.metadata.errors));
    rec.assert('anon_root', '顶层为匿名块节点', result.nodes.length === 1 && result.nodes[0].type === 'ANONYMOUS_BLOCK', result.nodes.map(n => n.type).join(','));
    const anon = result.nodes[0];
    if (anon) {
        const subNames = anon.children.map(c => c.name);
        rec.assert('anon_children', '匿名块含 print_msg/calc_bonus 子程序', subNames.includes('print_msg') && subNames.includes('calc_bonus'), subNames.join(','));
        rec.assert('anon_cursor_recorded', '游标 c_emp 已记录进变量表', anon.variableTable && anon.variableTable.has('c_emp'),
            anon.variableTable ? Array.from(anon.variableTable.keys()).join(',') : 'no-table');
    }

    const proto = PLSQLOutlineExtension.prototype;
    const stub = { currentParseResult: result, symbolIndex: { lookupWithPriority: () => [] } };
    ['provideDefinition', 'parseCallAtPosition', 'findVariableInParseResult', 'findNodeInCurrentFile',
     'findProcFuncInChildren', 'isCallableNode', 'isNodeScopeContainsLine', 'isLineInNodeRange',
     'getStructureBlockTypeForRange', 'getLastChildNode', 'showSymbolQuickPick'].forEach(m => { stub[m] = proto[m]; });
    // 桩自带新鲜解析结果：跳过按需重解析路径（真实链路由 E2E 覆盖）
    stub.parseDocumentQuiet = async () => {};
    stub.isParseResultFresh = () => true;
    const doc = makeDocument(SOURCE);

    function findLine(pattern) {
        for (let i = 0; i < srcLines.length; i++) {
            if (pattern.test(srcLines[i])) return { line1: i + 1, text: srcLines[i] };
        }
        return null;
    }
    async function jumpTo(name, desc, pattern, word, expectDeclLine1) {
        const hit = findLine(pattern);
        if (!hit) { rec.assert(name, desc, false, 'line-not-found'); return; }
        const pos = { line: hit.line1 - 1, character: hit.text.indexOf(word) };
        const loc = await stub.provideDefinition.call(stub, doc, pos, {});
        if (!loc) { rec.assert(name, desc, false, `L${hit.line1} 点击无 Location`); return; }
        const targetLine = loc.range.line !== undefined ? loc.range.line : (loc.range.start ? loc.range.start.line : -1);
        rec.assert(name, desc, targetLine === expectDeclLine1 - 1, `跳到 L${targetLine + 1} 期望 L${expectDeclLine1}`);
    }

    // 期望声明行：v_total=L2, c_emp=L4, print_msg=L6, calc_bonus=L11
    await jumpTo('jump_proc_call', '子过程调用 print_msg 跳到声明行 L6', /print_msg\('start'\)/, 'print_msg', 6);
    await jumpTo('jump_func_call', '子函数调用 calc_bonus 跳到声明行 L11', /calc_bonus\(5000\)/, 'calc_bonus', 11);
    await jumpTo('jump_cursor_open', '游标使用 OPEN c_emp 跳到声明行 L4', /OPEN\s+c_emp/, 'c_emp', 4);
    await jumpTo('jump_cursor_fetch', '游标使用 FETCH c_emp 跳到声明行 L4', /FETCH\s+c_emp/, 'c_emp', 4);
    await jumpTo('jump_variable', '变量使用 v_total 跳到声明行 L2', /v_total\s*:=\s*calc_bonus/, 'v_total', 2);
    await jumpTo('jump_in_exception', '异常区调用 print_msg 跳到声明行 L6', /print_msg\('error'\)/, 'print_msg', 6);

    return { suiteName: 'anon_subfunc_definition_test', cases: rec.cases, parseTime };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log(`\n=== GMLTest: anon_subfunc_definition ===`);
        cases.forEach(c => console.log(`  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.desc}${c.passed ? '' : ' [' + c.actual + ']'}`));
        console.log(`\n结果: ${passed}/${cases.length} 通过`);
        process.exit(passed === cases.length ? 0 : 1);
    }).catch(err => { console.error('测试异常:', err); process.exit(1); });
}

module.exports = { run };

/**
 * Ctrl+Click 跳转（Definition）测试
 *
 * 验证修复：
 *  - 移除 100ms 去重守卫后，同一位置的连续两次 provideDefinition 调用都能返回结果
 *    （VS Code 对一次 Ctrl+Click 会调用两次：链接预览 + 真正导航，去重曾误杀第二次）
 *
 * provideDefinition 及其辅助方法在原型上且只依赖 currentParseResult / symbolIndex，
 * 通过原型绑定到桩对象上调用，避免实例化整个扩展。
 *
 * 运行：node test/definition_test.js （需先 npm run compile）
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

const path = require('path');
const { PLSQLParser } = require('../out/parser');
const { PLSQLOutlineExtension } = require('../out/extension');

let passed = 0, failed = 0;
const failures = [];
function assert(cond, msg) { if (cond) passed++; else { failed++; failures.push(msg); console.error('  ✗ FAIL: ' + msg); } }

// 一个带变量、游标、子程序的包
const SOURCE = `CREATE OR REPLACE PACKAGE BODY def_pkg IS
    g_count   NUMBER := 0;
    CURSOR c_all IS SELECT * FROM t;

    PROCEDURE do_work(p_in IN NUMBER) IS
        v_local NUMBER := p_in;
    BEGIN
        g_count := g_count + 1;
        v_local := do_calc(p_in);
    END do_work;

    FUNCTION do_calc(p_x IN NUMBER) RETURN NUMBER IS
    BEGIN
        RETURN p_x * 2;
    END do_calc;
END def_pkg;
/`;

// 构造一个模拟 TextDocument：把源码按行切分，支持 lineAt / getText / getWordRangeAtPosition
function makeDocument(text) {
    const lines = text.split('\n');
    return {
        uri: { fsPath: 'C:/fake/def_pkg.pkb', toString: () => 'file:///C:/fake/def_pkg.pkb' },
        fileName: 'C:/fake/def_pkg.pkb',
        lineAt(line) {
            const text = lines[line] || '';
            return { text, range: { start: { line, character: 0 }, end: { line, character: text.length } } };
        },
        getText(range) {
            if (!range) return text;
            // range = {start:{line,character}, end:{line,character}}
            const s = range.start, e = range.end;
            if (s.line === e.line) {
                return (lines[s.line] || '').substring(s.character, e.character);
            }
            return (lines[s.line] || '').substring(s.character);
        },
        getWordRangeAtPosition(position, pattern) {
            const lineText = lines[position.line] || '';
            // 用 matchAll 遍历所有匹配，找到包含 position.character 的那个
            const re = pattern
                ? new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g')
                : /[A-Za-z_]\w*/g;
            let m;
            while ((m = re.exec(lineText)) !== null) {
                const start = m.index;
                const end = m.index + m[0].length;
                if (position.character >= start && position.character <= end) {
                    return { start: { line: position.line, character: start }, end: { line: position.line, character: end } };
                }
                if (m[0].length === 0) { re.lastIndex++; } // 防止零宽匹配死循环
            }
            return undefined;
        }
    };
}

function findCharOf(lineText, word) {
    // 返回单词在行中的起始字符位置
    const idx = lineText.indexOf(word);
    return idx >= 0 ? idx : 0;
}

async function main() {
    console.log('=== Ctrl+Click 跳转（Definition）测试 ===\n');
    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    const result = await parser.parse(SOURCE, 'def_pkg.pkb');
    if (result.metadata.errors.length > 0) {
        console.error('解析错误:', JSON.stringify(result.metadata.errors));
        process.exit(1);
    }

    // 绑定原型方法到桩对象
    const proto = PLSQLOutlineExtension.prototype;
    const stub = {
        currentParseResult: result,
        symbolIndex: { lookupWithPriority: () => [] }
    };
    ['provideDefinition', 'parseCallAtPosition', 'findVariableInParseResult',
     'findNodeInCurrentFile', 'findProcFuncInChildren', 'isCallableNode',
     'isNodeScopeContainsLine', 'isLineInNodeRange', 'getStructureBlockTypeForRange',
     'getLastChildNode', 'showSymbolQuickPick'].forEach(m => { stub[m] = proto[m]; });
    const doc = makeDocument(SOURCE);

    // 定位关键行号
    const root = result.nodes[0];
    const gCountLine = root.variableTable.get('g_count').line;          // 1-based 声明行
    const doWork = root.children.find(c => c.name === 'do_work');
    const doCalc = root.children.find(c => c.name === 'do_calc');
    const doWorkLine = doWork ? doWork.declarationLine : null;
    const doCalcLine = doCalc ? doCalc.declarationLine : null;

    // 通过源码文本定位包含 "do_calc(" 调用的行（1-based）
    const srcLines = SOURCE.split('\n');
    let doCalcCallLine1Based = 0; // 包含 "do_calc(" 的行
    for (let i = 0; i < srcLines.length; i++) {
        if (/\bdo_calc\s*\(/.test(srcLines[i])) { doCalcCallLine1Based = i + 1; break; }
    }
    let gCountUseLine1Based = 0; // 包含 "g_count :=" 使用（非声明）的行
    for (let i = 0; i < srcLines.length; i++) {
        if (/g_count\s*:=/.test(srcLines[i])) { gCountUseLine1Based = i + 1; break; }
    }

    // ---- 1. 去重守卫已移除：连续两次同一位置调用都应返回 Location（不再第二次为 null）----
    console.log('--- 去重守卫移除验证（核心修复）---');
    if (doCalcCallLine1Based > 0) {
        const callLineText = srcLines[doCalcCallLine1Based - 1] || '';
        const charOfDoCalc = findCharOf(callLineText, 'do_calc');
        const pos1 = { line: doCalcCallLine1Based - 1, character: charOfDoCalc };
        const pos2 = { line: doCalcCallLine1Based - 1, character: charOfDoCalc };
        const loc1 = stub.provideDefinition.call(stub, doc, pos1, {});
        const loc2 = stub.provideDefinition.call(stub, doc, pos2, {});
        assert(loc1 !== null, '第一次 Ctrl+Click 调用返回 Location（跳转 do_calc）');
        assert(loc2 !== null, '【关键】第二次同一位置调用仍返回 Location（去重守卫已移除，不再误杀导航）');
        if (loc1 && loc2) {
            assert(loc1.range && loc2.range, '两次返回的都是有效 Location');
        }
    }

    // ---- 2. 变量定义跳转 ----
    console.log('\n--- 变量跳转 ---');
    if (gCountUseLine1Based > 0) {
        const useLineText = srcLines[gCountUseLine1Based - 1] || '';
        const charOfGCount = findCharOf(useLineText, 'g_count');
        const varLoc = stub.provideDefinition.call(stub, doc, { line: gCountUseLine1Based - 1, character: charOfGCount }, {});
        assert(varLoc !== null, '点击 g_count 使用处返回 Location');
        if (varLoc) {
            // mock 中 Location.range 可能是 Position（含 .line）或 Range（含 .start.line），两者都有 .line
            const targetLine = varLoc.range.line !== undefined
                ? varLoc.range.line
                : (varLoc.range.start ? varLoc.range.start.line : -1);
            assert(targetLine === gCountLine - 1, `跳转到 g_count 声明行(L${gCountLine})`);
        }
    }

    // ---- 3. 子程序跳转 ----
    console.log('\n--- 子程序跳转 ---');
    if (doWorkLine) {
        const declLineText = SOURCE.split('\n')[doWorkLine - 1] || '';
        const char = findCharOf(declLineText, 'do_work');
        // 点击 do_work 的声明行名（应仍能定位）
        const loc = stub.provideDefinition.call(stub, doc, { line: doWorkLine - 1, character: char }, {});
        // 声明行点击自身——可能返回 null（无定义可跳，已在声明处），这里仅验证不抛错
        assert(true, '点击 do_work 声明行不抛异常');
    }

    // ---- 4. 无定义的符号返回 null（不抛错）----
    console.log('\n--- 未定义符号 ---');
    const someLine = SOURCE.split('\n').findIndex(l => l.includes('BEGIN'));
    const unknownLoc = stub.provideDefinition.call(stub, doc, { line: someLine, character: 5 }, {});
    assert(true, '未定义符号查询不抛异常');

    console.log('\n================================');
    console.log(`测试结果: ${passed}/${passed + failed} 通过`);
    if (failed > 0) { failures.forEach(f => console.error('  - ' + f)); process.exit(1); }
    console.log('\n所有测试通过!');
}

main().catch(err => { console.error('测试执行异常:', err); process.exit(1); });

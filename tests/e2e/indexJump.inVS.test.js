/**
 * 在真实 VS Code 扩展宿主内运行的测试体（由 indexJump.e2e.test.js 拉起）
 *
 * Issue #38：双代码仓库路径（优先级 1/2）的符号索引跨文件跳转。
 * 覆盖：启动自动建索引后高/低优先级夹均可达、同名冲突按路径优先级消解、
 * 包名限定优先于路径优先级、当前文件游标跳转（不经索引）、
 * watcher 新建文件/修改文件后增量入索引即可跳转。
 */
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const WS = path.resolve(__dirname, 'ws-index');
const REPO_A = path.join(WS, 'repo_a');
const REPO_B = path.join(WS, 'repo_b');
const CALLER_FILE = path.join(WS, 'caller.sql');

// watcher 修改用例：pkg_b.pkb 在 END pkg_b; 前追加 new_total（行号运行时计算）
const PKG_B_V2 = [
    'CREATE OR REPLACE PACKAGE BODY pkg_b AS',
    '    FUNCTION calc_total(p_amt IN NUMBER) RETURN NUMBER IS',
    '    BEGIN',
    '        RETURN p_amt * 2;',
    '    END calc_total;',
    '    PROCEDURE process_data(p_tag IN VARCHAR2) IS',
    '    BEGIN',
    '        NULL;',
    '    END process_data;',
    '    FUNCTION new_total(p_n IN NUMBER) RETURN NUMBER IS',
    '    BEGIN',
    '        RETURN p_n + 1;',
    '    END new_total;',
    'END pkg_b;',
    '/'
].join('\n');

// watcher 新建用例：repo_b 新文件，独立函数 calc_tax 声明行 L1
const NEW_SYMBOLS = [
    'CREATE OR REPLACE FUNCTION calc_tax(p_val IN NUMBER) RETURN NUMBER IS',
    'BEGIN',
    '    RETURN p_val * 0.1;',
    'END calc_tax;',
    '/'
].join('\n');

let passed = 0;
const failures = [];
function check(cond, msg) {
    if (cond) {
        passed++;
        console.log(`  ✓ ${msg}`);
    } else {
        failures.push(msg);
        console.error(`  ✗ FAIL: ${msg}`);
    }
}

function fmt(target) {
    if (!target) {
        return 'null';
    }
    return `${target.uri.fsPath} L${target.range.start.line + 1}`;
}

/** 在 doc 中定位含 lineText 的行上 word 的 Definition 首个结果 */
async function definitionAt(doc, lineText, word) {
    const li = doc.getText().split('\n').findIndex(l => l.includes(lineText));
    assert.ok(li >= 0, `测试用例行不存在: ${lineText}`);
    const ch = doc.lineAt(li).text.indexOf(word);
    const results = await vscode.commands.executeCommand(
        'vscode.executeDefinitionProvider', doc.uri, new vscode.Position(li, ch)
    );
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
}

/** 轮询等待 fn 返回真值（超时返回 false，不抛错，由调用方决定报错文案） */
async function waitFor(fn, timeoutMs, intervalMs = 500) {
    const start = Date.now();
    for (;;) {
        if (await fn()) {
            return true;
        }
        if (Date.now() - start > timeoutMs) {
            return false;
        }
        await new Promise(r => setTimeout(r, intervalMs));
    }
}

/** 在 caller 活动编辑器指定行之后插入一行（未保存编辑） */
async function insertCallerLine(anchorLineText, newLine) {
    const editor = vscode.window.activeTextEditor;
    assert.ok(editor, 'caller 应为活动编辑器');
    const li = editor.document.getText().split('\n').findIndex(l => l.includes(anchorLineText));
    assert.ok(li >= 0, `caller 锚点行不存在: ${anchorLineText}`);
    await editor.edit(eb => {
        eb.insert(new vscode.Position(li + 1, 0), newLine + '\n');
    });
}

/** 目标行文本（1-based targetLine）是否包含 token（校验跳转落点的语义正确性） */
function targetLineContains(target, token) {
    if (!target) {
        return false;
    }
    const lines = fs.readFileSync(target.uri.fsPath, 'utf8').split('\n');
    return (lines[target.range.start.line] || '').toLowerCase().includes(token.toLowerCase());
}

// 经典入口：module.exports.run()（新宿主不再注入 mocha 全局）
module.exports.run = async () => {
    // 前置：工作区 settings.json 预置的双路径应生效（窗口作用域可在工作区设置）。
    // 兜底：未生效（作用域意外收紧等）时写用户级配置并依赖 onConfigurationChanged 重建，
    // 保证用例测的是索引本身而不是设置作用域问题。
    const readPaths = () =>
        vscode.workspace.getConfiguration('plsql-outline').get('codeRepository.paths', []);
    if (readPaths().length < 2) {
        await vscode.workspace.getConfiguration('plsql-outline').update(
            'codeRepository.paths',
            [{ path: REPO_A, priority: 1 }, { path: REPO_B, priority: 2 }],
            vscode.ConfigurationTarget.Global
        );
    }
    const paths = readPaths();
    assert.ok(paths.length >= 2, `双路径配置未生效: ${JSON.stringify(paths)}`);

    const ext = vscode.extensions.getExtension('EmonZhang3438.plsql-outline');
    assert.ok(ext, '扩展未加载');
    await ext.activate();

    const callerDoc = await vscode.workspace.openTextDocument(CALLER_FILE);
    await vscode.window.showTextDocument(callerDoc);
    assert.strictEqual(callerDoc.languageId, 'sql',
        `前置条件失效：caller.sql 应为 sql 语言，实际 ${callerDoc.languageId}`);

    // ---- 就绪等待：启动自动索引（3 秒延迟 + 构建）完成前跨夹跳转为空 ----
    const ready = await waitFor(async () => {
        const t = await definitionAt(callerDoc, 'pkg_a.get_order(100)', 'get_order');
        return !!t;
    }, 30000);
    assert.ok(ready, '30 秒内索引未就绪：pkg_a.get_order 始终无 Definition');

    // ---- Case 1: 高优先级仓库的包内函数（pkg_a.get_order → repo_a/pkg_a.pkb L2）----
    {
        const t = await definitionAt(callerDoc, 'pkg_a.get_order(100)', 'get_order');
        check(path.normalize(t?.uri.fsPath || '') === path.normalize(path.join(REPO_A, 'pkg_a.pkb')) &&
            t.range.start.line + 1 === 2,
            `高优先级包函数 get_order → repo_a/pkg_a.pkb L2（实际 ${fmt(t)}）`);
    }

    // ---- Case 2: 低优先级仓库的包内函数（pkg_b.calc_total → repo_b/pkg_b.pkb L2）----
    {
        const t = await definitionAt(callerDoc, 'pkg_b.calc_total(200)', 'calc_total');
        check(path.normalize(t?.uri.fsPath || '') === path.normalize(path.join(REPO_B, 'pkg_b.pkb')) &&
            t.range.start.line + 1 === 2,
            `低优先级包函数 calc_total → repo_b/pkg_b.pkb L2（实际 ${fmt(t)}）`);
    }

    // ---- Case 3: 同名冲突按路径优先级消解（裸 process_data → repo_a，扫描顺序无关）----
    {
        const t = await definitionAt(callerDoc, 'process_data(v_total);', 'process_data');
        check(!!t && path.normalize(t.uri.fsPath).startsWith(path.normalize(REPO_A)) &&
            targetLineContains(t, 'process_data'),
            `裸名冲突 process_data 应跳高优先级 repo_a（实际 ${fmt(t)}）`);
    }

    // ---- Case 4: 包名限定优先于路径优先级（pkg_b.process_data → repo_b L6）----
    {
        const t = await definitionAt(callerDoc, "pkg_b.process_data('x');", 'process_data');
        check(path.normalize(t?.uri.fsPath || '') === path.normalize(path.join(REPO_B, 'pkg_b.pkb')) &&
            t.range.start.line + 1 === 6,
            `包名限定 pkg_b.process_data → repo_b/pkg_b.pkb L6（实际 ${fmt(t)}）`);
    }

    // ---- Case 5: 当前文件游标跳转（c_orders → caller.sql L2，不经索引）----
    {
        const t = await definitionAt(callerDoc, 'OPEN c_orders;', 'c_orders');
        check(path.normalize(t?.uri.fsPath || '') === path.normalize(CALLER_FILE) &&
            t.range.start.line + 1 === 2,
            `当前文件游标 c_orders → caller.sql L2（实际 ${fmt(t)}）`);
    }

    // ---- Case 6: watcher 新建文件增量入索引（repo_b/new_symbols.sql calc_tax L1）----
    fs.writeFileSync(path.join(REPO_B, 'new_symbols.sql'), NEW_SYMBOLS, 'utf8');
    await insertCallerLine("pkg_b.process_data('x');", '    v_total := calc_tax(5);');
    {
        const ok = await waitFor(async () => {
            const t = await definitionAt(callerDoc, 'calc_tax(5);', 'calc_tax');
            return !!t && path.normalize(t.uri.fsPath) === path.normalize(path.join(REPO_B, 'new_symbols.sql'));
        }, 15000);
        const t = await definitionAt(callerDoc, 'calc_tax(5);', 'calc_tax');
        check(ok && t.range.start.line + 1 === 1,
            `watcher 新建文件 calc_tax → repo_b/new_symbols.sql L1（实际 ${fmt(t)}）`);
    }

    // ---- Case 7: watcher 修改既有文件增量入索引（pkg_b.pkb 追加 new_total）----
    fs.writeFileSync(path.join(REPO_B, 'pkg_b.pkb'), PKG_B_V2, 'utf8');
    await insertCallerLine('v_total := calc_tax(5);', '    v_total := pkg_b.new_total(7);');
    {
        const expectedLine = PKG_B_V2.split('\n').findIndex(l => l.includes('FUNCTION new_total')) + 1;
        const ok = await waitFor(async () => {
            const t = await definitionAt(callerDoc, 'pkg_b.new_total(7);', 'new_total');
            return !!t && path.normalize(t.uri.fsPath) === path.normalize(path.join(REPO_B, 'pkg_b.pkb'));
        }, 15000);
        const t = await definitionAt(callerDoc, 'pkg_b.new_total(7);', 'new_total');
        check(ok && t.range.start.line + 1 === expectedLine,
            `watcher 修改文件 pkg_b.new_total → repo_b/pkg_b.pkb L${expectedLine}（实际 ${fmt(t)}）`);
    }

    assert.strictEqual(failures.length, 0, `${failures.length} 个双仓库跳转用例失败:\n  - ${failures.join('\n  - ')}`);
    console.log(`indexJump E2E: ${passed}/${passed + failures.length} 通过`);
};

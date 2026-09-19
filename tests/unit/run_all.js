/**
 * 单元测试运行器：运行 tests/unit 下所有测试套件，生成 HTML 测试报告。
 *
 * 运行：node tests/unit/run_all.js
 * 输出：tests/unit/test_report.html（浏览器打开查看）
 */
const fs = require('fs');
const path = require('path');

// [套件名, 模块] 成对注册：套件模块只导出 run，崩溃时拿不到 suiteName，名字由此提供（Issue #28）
const suites = [
    ['nested_subprograms_test', require('./nested_subprograms_test')],
    ['standalone_proc_func_test', require('./standalone_proc_func_test')],
    ['anon_block_trigger_test', require('./anon_block_trigger_test')],
    ['large_package_render_test', require('./large_package_render_test')],
    ['nested_definition_test', require('./nested_definition_test')],
    ['qquote_create_test', require('./qquote_create_test')],
    ['qquote_edge_test', require('./qquote_edge_test')],
    ['anonymous_block_render_test', require('./anonymous_block_render_test')],
    ['forward_declaration_cursor_test', require('./forward_declaration_cursor_test')],
    ['constant_declaration_test', require('./constant_declaration_test')],
    ['case_else_nesting_test', require('./case_else_nesting_test')],
    ['top_level_anon_test', require('./top_level_anon_test')],
    ['anon_subfunc_definition_test', require('./anon_subfunc_definition_test')],
    ['inline_anon_subprogram_test', require('./inline_anon_subprogram_test')],
    ['inline_anon_visible_test', require('./inline_anon_visible_test')],
    ['inline_anon_level_test', require('./inline_anon_level_test')],
    ['concurrent_parse_isolation_test', require('./concurrent_parse_isolation_test')],
    ['cancellation_test', require('./cancellation_test')],
    ['settings_schema_test', require('./settings_schema_test')],
    ['quoted_identifier_test', require('./quoted_identifier_test')],
    ['get_ddl_test', require('./get_ddl_test')],
    ['folding_test', require('./folding_test')]
].map(([name, mod]) => ({ name, mod }));

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function generateHtml(results) {
    const totalCases = results.reduce((sum, r) => sum + r.cases.length, 0);
    const totalPassed = results.reduce((sum, r) => sum + r.cases.filter(c => c.passed).length, 0);
    const totalFailed = totalCases - totalPassed;
    const crashedCount = results.filter(r => r.error).length;
    const allPassed = totalFailed === 0 && crashedCount === 0;
    const now = new Date().toLocaleString('zh-CN', { hour12: false });

    const suiteRows = results.map(r => {
        const passed = r.cases.filter(c => c.passed).length;
        const failed = r.cases.length - passed;
        const crashed = !!r.error;
        return `<tr>
            <td>${escapeHtml(r.suiteName)}</td>
            <td>${r.cases.length}</td>
            <td class="pass">${passed}</td>
            <td class="${failed > 0 || crashed ? 'fail' : ''}">${failed}</td>
            <td>${r.parseTime || '-'} ms</td>
            <td class="${failed === 0 && !crashed ? 'status-pass' : 'status-fail'}">${crashed ? '崩溃' : (failed === 0 ? '通过' : '失败')}</td>
        </tr>`;
    }).join('\n');

    const caseRows = results.map(r => {
        return r.cases.map(c => {
            const statusCell = c.passed
                ? '<td class="status-pass">✓ 通过</td>'
                : '<td class="status-fail">✗ 失败</td>';
            const actualCell = c.passed ? '<td>-</td>' : `<td class="actual">${escapeHtml(c.actual)}</td>`;
            return `<tr>
                <td>${escapeHtml(r.suiteName)}</td>
                <td><code>${escapeHtml(c.name)}</code></td>
                <td>${escapeHtml(c.desc)}</td>
                ${statusCell}
                ${actualCell}
            </tr>`;
        }).join('\n');
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>单元测试报告 — PL/SQL Outline</title>
<style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif; margin: 0; padding: 24px; background: #f6f8fa; color: #24292e; }
    h1 { margin: 0 0 8px; font-size: 24px; }
    .meta { color: #586069; font-size: 13px; margin-bottom: 20px; }
    .summary { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .card { background: #fff; border: 1px solid #e1e4e8; border-radius: 6px; padding: 16px 20px; min-width: 140px; }
    .card .num { font-size: 28px; font-weight: 600; line-height: 1.2; }
    .card .lbl { font-size: 12px; color: #586069; margin-top: 4px; }
    .card.total .num { color: #0366d6; }
    .card.pass .num { color: #28a745; }
    .card.fail .num { color: ${totalFailed > 0 ? '#d73a49' : '#586069'}; }
    .card.time .num { color: #6f42c1; font-size: 22px; }
    .banner { padding: 10px 16px; border-radius: 6px; margin-bottom: 20px; font-weight: 600; }
    .banner.ok { background: #dcffe4; color: #165c26; border: 1px solid #28a745; }
    .banner.bad { background: #ffebe9; color: #86181d; border: 1px solid #d73a49; }
    h2 { font-size: 18px; margin: 28px 0 12px; border-bottom: 1px solid #e1e4e8; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e1e4e8; border-radius: 6px; overflow: hidden; font-size: 13px; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eaecef; vertical-align: top; }
    th { background: #f1f5f9; font-weight: 600; color: #24292e; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f6f8fa; }
    .pass { color: #28a745; font-weight: 600; }
    .fail { color: #d73a49; font-weight: 600; }
    .status-pass { color: #28a745; }
    .status-fail { color: #d73a49; }
    .actual { color: #d73a49; font-family: "SFMono-Regular", Consolas, monospace; font-size: 12px; }
    code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-size: 12px; color: #0366d6; }
    .toc { margin-bottom: 8px; }
</style>
</head>
<body>
    <h1>PL/SQL Outline — 单元测试报告</h1>
    <div class="meta">生成时间：${now} ｜ 版本：v${require('../../package.json').version} ｜ 测试框架：Node.js + 自研断言</div>

    <div class="banner ${allPassed ? 'ok' : 'bad'}">
        ${allPassed ? '✓ 全部测试通过' : (crashedCount > 0 ? '✗ 存在崩溃套件' : '✗ 存在失败用例')}
    </div>

    <div class="summary">
        <div class="card total"><div class="num">${totalCases}</div><div class="lbl">用例总数</div></div>
        <div class="card pass"><div class="num">${totalPassed}</div><div class="lbl">通过</div></div>
        <div class="card fail"><div class="num">${totalFailed}</div><div class="lbl">失败</div></div>
        <div class="card time"><div class="num">${results.reduce((s, r) => s + (r.parseTime || 0), 0)} ms</div><div class="lbl">解析总耗时</div></div>
    </div>

    <h2>测试套件汇总</h2>
    <table>
        <thead>
            <tr><th>测试套件</th><th>用例数</th><th>通过</th><th>失败</th><th>解析耗时</th><th>状态</th></tr>
        </thead>
        <tbody>
            ${suiteRows}
        </tbody>
    </table>

    <h2>详细用例</h2>
    <table>
        <thead>
            <tr><th>套件</th><th>用例</th><th>描述</th><th>结果</th><th>实际值（失败时）</th></tr>
        </thead>
        <tbody>
            ${caseRows}
        </tbody>
    </table>
</body>
</html>`;
}

async function main() {
    console.log('运行单元测试全部套件...\n');
    const results = [];
    for (const suite of suites) {
        try {
            const r = await suite.mod.run();
            results.push(r);
            const passed = r.cases.filter(c => c.passed).length;
            console.log(`  ${r.suiteName}: ${passed}/${r.cases.length} 通过`);
        } catch (err) {
            console.error(`  ${suite.name} 异常:`, err);
            results.push({ suiteName: suite.name, cases: [], parseTime: 0, error: String(err) });
        }
    }

    const html = generateHtml(results);
    const outPath = path.join(__dirname, 'test_report.html');
    fs.writeFileSync(outPath, html, 'utf8');

    const totalCases = results.reduce((s, r) => s + r.cases.length, 0);
    const totalPassed = results.reduce((s, r) => s + r.cases.filter(c => c.passed).length, 0);
    const crashed = results.filter(r => r.error);
    if (crashed.length > 0) {
        console.error(`\n${crashed.length} 个套件崩溃: ${crashed.map(r => r.suiteName).join(', ')}（崩溃套件的用例未计入总数，视为失败）`);
    }
    console.log(`\n总计: ${totalPassed}/${totalCases} 通过`);
    console.log(`HTML 报告已生成: ${outPath}`);
    // 崩溃套件必须判失败：其用例未执行，不能让 totalPassed === totalCases 掩盖（Issue #28）
    process.exit(totalPassed === totalCases && crashed.length === 0 ? 0 : 1);
}

main();

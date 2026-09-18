/**
 * 在真实 VS Code 扩展宿主内运行的测试体（由 zcodetest_smoke.e2e.js 拉起）
 *
 * 用 ZCodeTest 语料的代表性文件（每类对象各 1 个复杂结构文件）验证:
 *   1. 语言关联（contributes.languages 在真实宿主生效）
 *   2. plsqlOutline.parseCurrentFile 可执行完成（真实解析管线）
 *   3. 嵌套子程序调用可经 executeDefinitionProvider 跳转到声明行
 */
const vscode = require('vscode');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..', 'corpus');

// [相对路径, 期望 languageId, 跳转用例(调用行片段, 目标词, 声明行匹配正则)]
// 跳转用例均为各文件中的嵌套子程序（覆盖 嵌套于过程/函数/触发器匿名块/匿名块/内联匿名块 的子程序）
const CASES = [
    ['function/func_complex.fnc', 'plsql',
        ['sub_calc_score(rec.score, 10, v_result)', 'sub_calc_score', /PROCEDURE sub_calc_score\(/]],
    ['procedure/proc_complex.prc', 'plsql',
        ['v_done := v_done + sub_next_id(i);', 'sub_next_id', /FUNCTION sub_next_id\(p_seq/]],
    ['package_spec/pkg_spec_complex.pks', 'plsql', null], // 规格只有声明, 无调用体
    ['package_body/pkg_body_complex.pkb', 'plsql',
        ['v_done := v_done + fwd_cache_get;', 'fwd_cache_get', /FUNCTION fwd_cache_get RETURN NUMBER IS/]],
    ['trigger/trg_complex.trg', 'plsql',
        ['append_tag(v_user);', 'append_tag', /PROCEDURE append_tag\(p_tag/]],
    ['anonymous/anon_declare_complex.sql', 'sql',
        ['v_text := sub_label(r_row.id);', 'sub_label', /FUNCTION sub_label\(p_id/]],
    ['anonymous/anon_begin_complex.sql', 'sql',
        ['sub_step(k);', 'sub_step', /PROCEDURE sub_step\(p_in IN NUMBER\) IS/]],
];

module.exports.run = async () => {
    const ext = vscode.extensions.getExtension('EmonZhang3438.plsql-outline');
    assert.ok(ext, '扩展未加载');
    await ext.activate();

    let failures = 0;
    for (const [rel, expectLang, def] of CASES) {
        const abs = path.join(ROOT, rel);
        const doc = await vscode.workspace.openTextDocument(abs);
        await vscode.window.showTextDocument(doc);

        // 1) 语言关联
        if (doc.languageId !== expectLang) {
            failures++;
            console.error(`  ✗ ${rel}: languageId=${doc.languageId}, 期望 ${expectLang}`);
        } else {
            console.log(`  ✓ ${rel}: languageId=${doc.languageId}`);
        }

        // 2) 手动解析命令（命令内部 await 解析完成）+ 静默期
        //    连续多文件快速切换时, currentParseResult 单槽可能被上一文件的按需静默解析
        //    竞争占用(扩展层竞态, 见 ZCodeTest/README.md 已知问题), 静默等待使其归位。
        await vscode.commands.executeCommand('plsqlOutline.parseCurrentFile');
        await new Promise(r => setTimeout(r, 1200));

        // 3) 跳转验证
        if (def) {
            const [callText, word, declRe] = def;
            const lines = doc.getText().split('\n');
            const li = lines.findIndex(l => l.includes(callText));
            assert.ok(li >= 0, `测试用例行不存在: ${callText}`);
            const di = lines.findIndex(l => declRe.test(l));
            assert.ok(di >= 0, `声明行不存在: ${declRe}`);

            const ch = doc.lineAt(li).text.indexOf(word);
            const query = async (pos) => {
                const results = await vscode.commands.executeCommand(
                    'vscode.executeDefinitionProvider', doc.uri, pos);
                return Array.isArray(results) && results.length > 0 ? results[0] : null;
            };
            let target = await query(new vscode.Position(li, ch));
            if (!target) {
                // 诊断 + 显式重解析后重试(区分瞬态竞态与真回归): 重解析活动文档 → 原位重查 → 词中位置重查
                console.log(`       [diag] ${rel}: 首次查询为空, activeEditor=` +
                    (vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri.fsPath : 'null') +
                    `, line=${li + 1}, ch=${ch}, text="${doc.lineAt(li).text.trim()}"`);
                await vscode.commands.executeCommand('plsqlOutline.parseCurrentFile');
                await new Promise(r => setTimeout(r, 800));
                target = await query(new vscode.Position(li, ch));
                if (!target && ch >= 0) {
                    target = await query(new vscode.Position(li, ch + Math.floor(word.length / 2)));
                }
            }
            if (!target) {
                failures++;
                console.error(`  ✗ ${rel}: ${word} 无 Definition 返回`);
            } else if (target.range.start.line !== di) {
                failures++;
                console.error(`  ✗ ${rel}: ${word} 跳到 L${target.range.start.line + 1}, 期望 L${di + 1}`);
            } else {
                console.log(`  ✓ ${rel}: ${word} 跳转 → L${di + 1}`);
            }
        }
    }

    assert.strictEqual(failures, 0, `${failures} 个冒烟用例失败`);
    console.log('\nZCodeTest 真实 VS Code 冒烟: 全部通过');
};

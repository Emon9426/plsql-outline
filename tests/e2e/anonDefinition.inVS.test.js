/**
 * 在真实 VS Code 扩展宿主内运行的测试体（由 anonDefinition.e2e.test.js 拉起）
 */
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const WS = path.resolve(__dirname, 'ws');
const FILE = path.join(WS, 'anon_subfunc_definition.sql');

// 与 GMLTest/anon_subfunc_definition.sql 相同内容的测试源码
// 期望声明行（1-based）：v_total=L2, c_emp=L4, print_msg=L6, calc_bonus=L11
const SOURCE = [
    'DECLARE',
    '    v_total      NUMBER;',
    '    v_emp_name   VARCHAR2(100);',
    '    CURSOR c_emp IS SELECT ename FROM emp;',
    '',
    '    PROCEDURE print_msg(p_msg IN VARCHAR2) IS',
    '    BEGIN',
    '        DBMS_OUTPUT.PUT_LINE(p_msg);',
    '    END print_msg;',
    '',
    '    FUNCTION calc_bonus(p_sal IN NUMBER) RETURN NUMBER IS',
    '    BEGIN',
    '        RETURN p_sal * 0.1;',
    '    END calc_bonus;',
    'BEGIN',
    "    print_msg('start');",
    '    OPEN c_emp;',
    '    FETCH c_emp INTO v_emp_name;',
    '    CLOSE c_emp;',
    '    v_total := calc_bonus(5000);',
    "    print_msg('total=' || v_total);",
    'EXCEPTION',
    '    WHEN OTHERS THEN',
    "        print_msg('error');",
    'END;',
    '/'
].join('\n');

// 经典入口：module.exports.run()（新宿主不再注入 mocha 全局）
module.exports.run = async () => {
        // 准备工作区文件
        fs.mkdirSync(WS, { recursive: true });
        fs.writeFileSync(FILE, SOURCE, 'utf8');

        const doc = await vscode.workspace.openTextDocument(FILE);
        await vscode.window.showTextDocument(doc);
        // 确保按 sql 语言识别
        assert.strictEqual(doc.languageId, 'sql', `languageId 应为 sql，实际 ${doc.languageId}`);

        // 等待扩展激活 + 自动解析（activation 里 setTimeout 1000ms + withProgress）
        const ext = vscode.extensions.getExtension('EmonZhang3438.plsql-outline');
        assert.ok(ext, '扩展未加载');
        await ext.activate();
        await new Promise(r => setTimeout(r, 4000)); // 等待 1s 延迟解析完成

        const cases = [
            // [说明, 行文本片段, 目标词, 期望声明行(1-based)]
            ['子过程 print_msg 调用', "print_msg('start')", 'print_msg', 6],
            ['子函数 calc_bonus 调用', 'calc_bonus(5000)', 'calc_bonus', 11],
            ['游标 OPEN c_emp', 'OPEN c_emp', 'c_emp', 4],
            ['游标 FETCH c_emp', 'FETCH c_emp', 'c_emp', 4],
            ['变量 v_total', 'v_total := calc_bonus', 'v_total', 2]
        ];

        let failures = 0;
        for (const [label, lineText, word, expectLine] of cases) {
            const li = SOURCE.split('\n').findIndex(l => l.includes(lineText));
            assert.ok(li >= 0, `测试用例行不存在: ${lineText}`);
            const ch = doc.lineAt(li).text.indexOf(word);
            const pos = new vscode.Position(li, ch);

            const results = await vscode.commands.executeCommand(
                'vscode.executeDefinitionProvider', doc.uri, pos);

            const target = Array.isArray(results) && results.length > 0 ? results[0] : null;
            if (!target) {
                failures++;
                console.error(`  ✗ ${label}: 无 Definition 返回（results=${JSON.stringify(results && results.length)}）`);
                continue;
            }
            const gotLine = target.range.start.line + 1;
            if (gotLine !== expectLine) {
                failures++;
                console.error(`  ✗ ${label}: 跳到 L${gotLine}，期望 L${expectLine}`);
            } else {
                console.log(`  ✓ ${label}: → L${gotLine}`);
            }
        }
        assert.strictEqual(failures, 0, `${failures} 个跳转用例失败`);

        // ============================================================
        // 场景2：编辑未保存（模拟用户日常工作流）
        // 在已解析文件中新增子程序 + 调用，不保存，立即 Ctrl+Click
        // ============================================================
        console.log('\n--- 场景2: 编辑未保存后的跳转 ---');
        const editor = vscode.window.activeTextEditor;
        // 在 END calc_bonus; 之后插入新子程序，并在主 body 中插入调用
        const srcLines2 = SOURCE.split('\n');
        const insertAfter = srcLines2.findIndex(l => l.includes('END calc_bonus;'));
        await editor.edit(eb => {
            eb.insert(new vscode.Position(insertAfter + 1, 0),
                '\n    PROCEDURE new_proc(p_v IN NUMBER) IS\n    BEGIN\n        NULL;\n    END new_proc;\n');
            eb.insert(new vscode.Position(srcLines2.findIndex(l => l.includes('OPEN c_emp')), 0),
                '    new_proc(1);\n');
        });
        await new Promise(r => setTimeout(r, 300));

        const callLineIdx = editor.document.getText().split('\n').findIndex(l => l.includes('new_proc(1);'));
        const ch2 = editor.document.lineAt(callLineIdx).text.indexOf('new_proc');
        const results2 = await vscode.commands.executeCommand(
            'vscode.executeDefinitionProvider', doc.uri, new vscode.Position(callLineIdx, ch2));
        const target2 = Array.isArray(results2) && results2.length > 0 ? results2[0] : null;
        assert.ok(target2, `未保存编辑后 new_proc 调用应返回 Definition（修复前复现为 null）`);
        const newProcDeclLine = editor.document.getText().split('\n').findIndex(l => l.includes('PROCEDURE new_proc')) + 1;
        assert.strictEqual(target2.range.start.line + 1, newProcDeclLine,
            `new_proc 应跳到声明行 L${newProcDeclLine}，实际 L${target2.range.start.line + 1}`);
        console.log(`  ✓ 未保存编辑后 new_proc 调用: → L${target2.range.start.line + 1}`);

        // ============================================================
        // 场景3：新建未保存的匿名块（untitled scratch buffer）
        // ============================================================
        console.log('\n--- 场景3: 新建未保存匿名块(untitled)的跳转 ---');
        const untitled = await vscode.workspace.openTextDocument({ language: 'sql', content: SOURCE });
        await vscode.window.showTextDocument(untitled);
        await new Promise(r => setTimeout(r, 1500)); // 等 onActiveEditorChanged 触发的解析

        const li3 = SOURCE.split('\n').findIndex(l => l.includes('calc_bonus(5000)'));
        const ch3 = untitled.lineAt(li3).text.indexOf('calc_bonus');
        const results3 = await vscode.commands.executeCommand(
            'vscode.executeDefinitionProvider', untitled.uri, new vscode.Position(li3, ch3));
        const target3 = Array.isArray(results3) && results3.length > 0 ? results3[0] : null;
        assert.ok(target3, 'untitled 匿名块 calc_bonus 调用应返回 Definition');
        assert.strictEqual(target3.range.start.line + 1, 11, `calc_bonus 应跳到 L11，实际 L${target3.range.start.line + 1}`);
        console.log(`  ✓ untitled 匿名块 calc_bonus 调用: → L${target3.range.start.line + 1}`);

        console.log('\nE2E 匿名块跳转: 全部通过');
};

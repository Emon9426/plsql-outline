/**
 * 在真实 VS Code 扩展宿主内运行的测试体（由 foldRouting.e2e.test.js 拉起）
 */
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const WS = path.resolve(__dirname, 'ws');
// .fcn 在 fileExtensions 默认清单（src/shared.ts DEFAULT_FILE_EXTENSIONS）内，
// 但未在 package.json contributes.languages 声明 → 测试宿主中 languageId 为 plaintext
const FCN_FILE = path.join(WS, 'fold_routing.fcn');
const TXT_FILE = path.join(WS, 'fold_skip.txt');
const SQL_FILE = path.join(WS, 'fold_routing.sql');

// 折叠期望（0-based）：Procedure 整体 [0,8]（END 在 1-based 第 9 行），
// FOR [3,7]（END LOOP 行）。解析契约由 tests/unit/folding_test.js 锁定，
// 此处只锁路由行为，避免与解析层回归耦合。
const SOURCE = [
    'CREATE OR REPLACE PROCEDURE p_demo IS', // 1
    '  v_idx NUMBER := 0;',                  // 2
    'BEGIN',                                 // 3
    '  FOR v_idx IN 1 .. 10 LOOP',           // 4
    '    IF v_idx > 5 THEN',                 // 5
    '      NULL;',                           // 6
    '    END IF;',                           // 7
    '  END LOOP;',                           // 8
    'END;',                                  // 9
    '/'                                      // 10
].join('\n');

async function openAndGetFolds(file) {
    const doc = await vscode.workspace.openTextDocument(file);
    await vscode.window.showTextDocument(doc);
    const ranges = await vscode.commands.executeCommand(
        'vscode.executeFoldingRangeProvider', doc.uri
    );
    return { doc, ranges: ranges || [] };
}

function hasRange(ranges, start, end) {
    return ranges.some(r => r.start === start && r.end === end);
}

// 经典入口：module.exports.run()（新宿主不再注入 mocha 全局）
module.exports.run = async () => {
    // 准备工作区文件
    fs.mkdirSync(WS, { recursive: true });
    fs.writeFileSync(FCN_FILE, SOURCE, 'utf8');
    fs.writeFileSync(TXT_FILE, SOURCE, 'utf8');
    fs.writeFileSync(SQL_FILE, SOURCE, 'utf8');

    const ext = vscode.extensions.getExtension('EmonZhang3438.plsql-outline');
    assert.ok(ext, '扩展未加载');
    await ext.activate();

    // ---- Case 1: .fcn（配置扩展名 + languageId=plaintext）必须命中折叠提供者 ----
    const fcn = await openAndGetFolds(FCN_FILE);
    assert.strictEqual(fcn.doc.languageId, 'plaintext',
        `前置条件失效：.fcn 应以 plaintext 打开，实际 ${fcn.doc.languageId}`);
    assert.ok(fcn.ranges.length > 0, 'Issue #26：.fcn 文件应产生折叠范围，实际为空');
    assert.ok(hasRange(fcn.ranges, 0, 8), `.fcn 缺少 Procedure 整体折叠 [0,8]，实际 ${JSON.stringify(fcn.ranges)}`);

    // ---- Case 2: .txt（不在配置扩展名内）不产生折叠范围 ----
    const txt = await openAndGetFolds(TXT_FILE);
    assert.strictEqual(txt.ranges.length, 0,
        `.txt 非 PL/SQL 文档不应产生折叠范围，实际 ${JSON.stringify(txt.ranges)}`);

    // ---- Case 3: .sql（languageId=sql）路由不受选择器改写影响 ----
    const sql = await openAndGetFolds(SQL_FILE);
    assert.strictEqual(sql.doc.languageId, 'sql',
        `前置条件失效：.sql 应为 sql 语言，实际 ${sql.doc.languageId}`);
    assert.ok(hasRange(sql.ranges, 0, 8), `.sql 缺少 Procedure 整体折叠 [0,8]，实际 ${JSON.stringify(sql.ranges)}`);

    console.log('foldRouting E2E: 3/3 通过');
};

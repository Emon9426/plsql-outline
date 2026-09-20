/**
 * 在真实 VS Code 扩展宿主内运行的测试体（由 foldRouting.e2e.test.js 拉起）
 *
 * Issue #26：提供者路由（.fcn plaintext 命中 / .txt 不命中 / .sql 不回归）
 * Issue #31：BEGIN/EXCEPTION 段折叠 + 结构关键字配对高亮（真实宿主管线）
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

// 折叠期望（0-based）：Procedure 整体 [0,11]；BEGIN 段 [2,11]（#31）；
// IF [3,5]；FOR 循环 [6,8]；EXCEPTION 段 [9,11]（#31）。
// 解析契约由 tests/unit/folding_test.js 锁定，此处锁宿主管线路由与段折叠。
const SOURCE = [
    'CREATE OR REPLACE PROCEDURE p_demo IS', // 1
    '  v_idx NUMBER := 0;',                  // 2
    'BEGIN',                                 // 3
    '  IF v_idx > 5 THEN',                   // 4
    '    NULL;',                             // 5
    '  END IF;',                             // 6
    '  FOR r IN 1..10 LOOP',                 // 7
    '    NULL;',                             // 8
    '  END LOOP;',                           // 9
    'EXCEPTION',                             // 10
    '  WHEN OTHERS THEN NULL;',              // 11
    'END;',                                  // 12
    '/'                                      // 13
].join('\n');

async function openDoc(file) {
    const doc = await vscode.workspace.openTextDocument(file);
    await vscode.window.showTextDocument(doc);
    return doc;
}

async function getFolds(file) {
    const doc = await openDoc(file);
    const ranges = await vscode.commands.executeCommand(
        'vscode.executeFoldingRangeProvider', doc.uri
    );
    return { doc, ranges: ranges || [] };
}

async function getHighlights(file, line0, char) {
    const doc = await openDoc(file);
    const highlights = await vscode.commands.executeCommand(
        'vscode.executeDocumentHighlights', doc.uri, new vscode.Position(line0, char)
    );
    return highlights || [];
}

function hasRange(ranges, start, end) {
    return ranges.some(r => r.start === start && r.end === end);
}

function hasHighlightAt(highlights, line0, startChar, endChar) {
    return highlights.some(h => h.range.start.line === line0 &&
        h.range.start.character === startChar && h.range.end.character === endChar);
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

    // ---- Case 1: .fcn（配置扩展名 + languageId=plaintext）命中折叠提供者（#26）----
    const fcn = await getFolds(FCN_FILE);
    assert.strictEqual(fcn.doc.languageId, 'plaintext',
        `前置条件失效：.fcn 应以 plaintext 打开，实际 ${fcn.doc.languageId}`);
    assert.ok(fcn.ranges.length > 0, 'Issue #26：.fcn 文件应产生折叠范围，实际为空');
    assert.ok(hasRange(fcn.ranges, 0, 11), `.fcn 缺少 Procedure 整体折叠 [0,11]，实际 ${JSON.stringify(fcn.ranges)}`);
    // ---- Case 2: BEGIN/EXCEPTION 段折叠（#31）----
    assert.ok(hasRange(fcn.ranges, 2, 11), `.fcn 缺少 BEGIN 段折叠 [2,11]，实际 ${JSON.stringify(fcn.ranges)}`);
    assert.ok(hasRange(fcn.ranges, 9, 11), `.fcn 缺少 EXCEPTION 段折叠 [9,11]，实际 ${JSON.stringify(fcn.ranges)}`);

    // ---- Case 3: .txt（不在配置扩展名内）不产生折叠范围 ----
    const txt = await getFolds(TXT_FILE);
    assert.strictEqual(txt.ranges.length, 0,
        `.txt 非 PL/SQL 文档不应产生折叠范围，实际 ${JSON.stringify(txt.ranges)}`);

    // ---- Case 4: .sql（languageId=sql）路由不受选择器改写影响 ----
    const sql = await getFolds(SQL_FILE);
    assert.strictEqual(sql.doc.languageId, 'sql',
        `前置条件失效：.sql 应为 sql 语言，实际 ${sql.doc.languageId}`);
    assert.ok(hasRange(sql.ranges, 0, 11), `.sql 缺少 Procedure 整体折叠 [0,11]，实际 ${JSON.stringify(sql.ranges)}`);

    // ---- Case 5: 双击 BEGIN → 块配对组（BEGIN/EXCEPTION/END，#31）----
    const hlBegin = await getHighlights(FCN_FILE, 2, 0);
    assert.strictEqual(hlBegin.length, 3,
        `BEGIN 应高亮 3 个配对关键字（BEGIN/EXCEPTION/END），实际 ${JSON.stringify(hlBegin.map(h => h.range))}`);
    assert.ok(hasHighlightAt(hlBegin, 2, 0, 5) && hasHighlightAt(hlBegin, 9, 0, 9) && hasHighlightAt(hlBegin, 11, 0, 3),
        `配对范围应为 BEGIN@3 EXCEPTION@10 END@12，实际 ${JSON.stringify(hlBegin.map(h => h.range))}`);

    // ---- Case 6: 双击 IF → IF 配对组（IF + END IF，#31）----
    const hlIf = await getHighlights(FCN_FILE, 3, 2);
    assert.strictEqual(hlIf.length, 2,
        `IF 应高亮 2 个关键字（IF / END IF），实际 ${JSON.stringify(hlIf.map(h => h.range))}`);
    assert.ok(hasHighlightAt(hlIf, 3, 2, 4) && hasHighlightAt(hlIf, 5, 2, 8),
        `配对范围应为 IF@4 [2,4) 与 END IF@6 [2,8)，实际 ${JSON.stringify(hlIf.map(h => h.range))}`);

    // ---- Case 7: 双击 FOR → 循环配对组（FOR + LOOP + END LOOP，#31）----
    const hlFor = await getHighlights(FCN_FILE, 6, 2);
    assert.strictEqual(hlFor.length, 3,
        `FOR 应高亮 3 个关键字（FOR / LOOP / END LOOP），实际 ${JSON.stringify(hlFor.map(h => h.range))}`);
    assert.ok(hasHighlightAt(hlFor, 6, 2, 5) && hasHighlightAt(hlFor, 6, 17, 21) && hasHighlightAt(hlFor, 8, 2, 10),
        `配对范围应为 FOR@7 LOOP@7 END LOOP@9，实际 ${JSON.stringify(hlFor.map(h => h.range))}`);

    // ---- Case 8: 双击普通词（变量名）→ 提供者返回空（回退原生词高亮，不破坏原生行为）----
    const hlVar = await getHighlights(FCN_FILE, 1, 2);
    assert.strictEqual(hlVar.length, 0,
        `v_idx 非结构关键字，提供者应返回空以回退原生高亮，实际 ${JSON.stringify(hlVar.map(h => h.range))}`);

    console.log('foldRouting E2E: 8/8 通过');
};

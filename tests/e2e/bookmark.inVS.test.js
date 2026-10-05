/**
 * 在真实 VS Code 扩展宿主内运行的测试体（由 bookmark.e2e.test.js 拉起）
 *
 * 通过扩展命令驱动书签管理器，断言 getState 返回的状态快照：
 *  - toggle：光标行建签（返回该文件书签列表）/ 再切删除
 *  - 编辑跟随：上方插入行 → 行号迁移（用户示例）；整行删除 → 删签
 *  - delete：按 (uri, line) 参数删除
 *  - next/previous：环绕跳转（光标落到书签行首）
 */
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const WS = path.resolve(__dirname, 'ws');
const FILE = path.join(WS, 'bookmark_demo.sql');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getState() {
    return vscode.commands.executeCommand('plsqlOutline.bookmark.getState');
}

async function setCursor(editor, line) {
    const pos = new vscode.Position(line, 0);
    editor.selection = new vscode.Selection(pos, pos);
    await sleep(60);
}

async function main() {    // 等扩展激活（onStartupFinished/onLanguage）注册命令
    for (let i = 0; i < 50; i++) {
        const cmds = await vscode.commands.getCommands(true);
        if (cmds.includes('plsqlOutline.bookmark.toggle')) {
            break;
        }
        await sleep(200);
    }

    // 用户示例源文件：aaa / bbb / ccc（书签打在 bbb，0-based 行 1）
    fs.writeFileSync(FILE, ['aaa', 'bbb', 'ccc'].join('\n'), 'utf8');
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(FILE));
    const editor = await vscode.window.showTextDocument(doc);
    await sleep(800); // 等解析与初始装饰

    // 1. 建签：光标置 bbb 行 → toggle → 状态里出现书签
    await setCursor(editor, 1);
    const afterCreate = await vscode.commands.executeCommand('plsqlOutline.bookmark.toggle');
    assert.strictEqual(afterCreate.length, 1, `建签后应恰有 1 个书签，实际 ${JSON.stringify(afterCreate)}`);
    assert.strictEqual(afterCreate[0].line, 1, `书签应在 0-based 行 1，实际 ${afterCreate[0].line}`);

    // 建签会弹信息表单（两步输入）。程序化选区变化不带 Mouse kind 不会关闭它，
    // 但不影响命令驱动；用一次程序化选区 + 等待避开焦点干扰
    await sleep(100);

    // 2. 编辑跟随：在书签行上方插入一行 aaa → 书签 1→2（显示 2→3）
    const insert = new vscode.WorkspaceEdit();
    insert.insert(doc.uri, new vscode.Position(1, 0), 'aaa\n');
    await vscode.workspace.applyEdit(insert);
    await sleep(300);
    let state = await getState();
    const key = doc.uri.toString();
    assert.ok(state[key] && state[key].length === 1, `插入后书签应保留 1 个，实际 ${JSON.stringify(state)}`);
    assert.strictEqual(state[key][0].line, 2, `插入上方一行后书签应迁到行 2，实际 ${state[key][0].line}`);

    // 3. 整行删除（删除书签所在行 2：aaa/aaa/bbb/ccc → aaa/aaa/ccc）→ 书签消失
    const del = new vscode.WorkspaceEdit();
    del.delete(doc.uri, new vscode.Range(2, 0, 3, 0));
    await vscode.workspace.applyEdit(del);
    await sleep(300);
    state = await getState();
    assert.ok(!state[key] || state[key].length === 0, `整行删除后书签应消失，实际 ${JSON.stringify(state)}`);

    // 4. 重建两个书签（行 0 与行 2），验证 next 环绕跳转
    await setCursor(editor, 0);
    await vscode.commands.executeCommand('plsqlOutline.bookmark.toggle');
    await setCursor(editor, 2);
    await vscode.commands.executeCommand('plsqlOutline.bookmark.toggle');
    await sleep(100);
    state = await getState();
    assert.strictEqual(state[key].length, 2, `应有两个书签，实际 ${JSON.stringify(state)}`);

    await setCursor(editor, 0);
    await vscode.commands.executeCommand('plsqlOutline.bookmark.next');
    await sleep(100);
    assert.strictEqual(editor.selection.active.line, 2, `next 应跳到行 2，实际 ${editor.selection.active.line}`);

    await vscode.commands.executeCommand('plsqlOutline.bookmark.next');
    await sleep(100);
    assert.strictEqual(editor.selection.active.line, 0, `next 在最后书签行应环绕回行 0，实际 ${editor.selection.active.line}`);

    await vscode.commands.executeCommand('plsqlOutline.bookmark.previous');
    await sleep(100);
    assert.strictEqual(editor.selection.active.line, 2, `previous 应回到行 2，实际 ${editor.selection.active.line}`);

    // 5. delete 命令按 (uri, line) 删除指定书签
    await vscode.commands.executeCommand('plsqlOutline.bookmark.delete', key, 0);
    await sleep(100);
    state = await getState();
    assert.strictEqual(state[key].length, 1, `delete 后应剩 1 个书签，实际 ${JSON.stringify(state)}`);
    assert.strictEqual(state[key][0].line, 2, `剩余书签应在行 2，实际 ${state[key][0].line}`);

    // 6. toggle 再切 = 删除（不弹表单）
    await setCursor(editor, 2);
    const afterRemove = await vscode.commands.executeCommand('plsqlOutline.bookmark.toggle');
    assert.strictEqual(afterRemove.length, 0, `再次 toggle 应删除书签，实际 ${JSON.stringify(afterRemove)}`);

    // 收尾清理状态，避免影响其他套件
    await vscode.commands.executeCommand('plsqlOutline.bookmark.delete', key, 0).catch(() => {});

    console.log('bookmark e2e: 全部断言通过');
}

// 经典入口：module.exports.run()（新宿主不再注入 mocha 全局，同 foldRouting）
module.exports.run = main;

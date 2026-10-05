/**
 * 真实 VS Code 端到端测试：书签功能（v1.17.0）
 *
 * 与 foldRouting.e2e.test.js 同模式（@vscode/test-electron + --disable-extensions）：
 *   1. 命令建签/删签（toggle / delete / getState 状态快照断言）
 *   2. 编辑跟随：上方插入行 → 书签行号迁移（用户示例 aaa/bbb/ccc）
 *   3. 整行删除 → 书签随之删除
 *   4. 下一处/上一处书签环绕跳转（Alt+PgDn/PgUp 的命令本体）
 *
 * 运行：node tests/e2e/bookmark.e2e.test.js
 */
const path = require('path');

async function go() {
    const { runTests } = require('@vscode/test-electron');

    const testWorkspace = path.resolve(__dirname, 'ws');
    const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');

    await runTests({
        extensionDevelopmentPath,
        extensionTestsPath: path.resolve(__dirname, 'bookmark.inVS.test.js'),
        launchArgs: [
            testWorkspace,
            '--disable-extensions', // 排除其他扩展干扰（含已安装的旧版 plsql-outline）
        ],
    });
}

go().catch(err => {
    console.error('E2E run failed:', err);
    process.exit(1);
});

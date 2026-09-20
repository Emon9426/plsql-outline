/**
 * 真实 VS Code 端到端测试：配置扩展名文件的提供者路由 + 段折叠/关键字配对高亮
 *
 * 与 anonDefinition.e2e.test.js 同模式(@vscode/test-electron + --disable-extensions):
 *   1. 语言关联: .fcn 以 plaintext 打开（Issue #26 复现前提）→ 折叠提供者仍命中
 *   2. BEGIN/EXCEPTION 段折叠（Issue #31）
 *   3. vscode.executeDocumentHighlights: 结构关键字配对组（块/IF/循环），
 *      普通词返回空（回退原生词高亮）
 *
 * 运行：node tests/e2e/foldRouting.e2e.test.js
 */
const path = require('path');

async function go() {
    const { runTests } = require('@vscode/test-electron');

    const testWorkspace = path.resolve(__dirname, 'ws');
    const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');

    // 测试入口在 VS Code 内执行
    await runTests({
        extensionDevelopmentPath,
        extensionTestsPath: path.resolve(__dirname, 'foldRouting.inVS.test.js'),
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

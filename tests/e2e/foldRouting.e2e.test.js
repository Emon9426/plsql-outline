/**
 * 真实 VS Code 端到端测试：配置扩展名文件的提供者路由（Issue #26）
 *
 * 在真实扩展宿主中验证：
 *   1. .fcn 在 plsql-outline.fileExtensions 默认清单内，但未在 contributes.languages
 *      声明 → 编辑器 languageId 为 plaintext（Issue #26 的复现前提）
 *   2. executeFoldingRangeProvider 对该文件返回真实折叠范围
 *      （修复前：选择器按语言 ID 匹配，plaintext 文档永远到不了提供者，返回空）
 *   3. 非 PL/SQL 文档（.txt，不在配置扩展名内）不产生折叠范围
 *   4. .sql 文件（languageId=sql）路由不受选择器改写影响
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

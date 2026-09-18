/**
 * 真实 VS Code 端到端测试：匿名块 Ctrl+Click 跳转（executeDefinitionProvider）
 *
 * 在真实扩展宿主中验证：
 *   1. 打开含 sub function/游标的匿名块 .sql 文件
 *   2. 等扩展自动解析（activation → 1s 延迟 parseCurrentFile）
 *   3. 通过 vscode.executeDefinitionProvider 调用真实注册的 DefinitionProvider
 *   4. 断言跳转位置 = 声明行
 *
 * 运行：node test/integration/run_anon_definition.js
 */
const path = require('path');

async function go() {
    const { runTests } = require('@vscode/test-electron');

    const testWorkspace = path.resolve(__dirname, 'ws');
    const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');

    // 测试入口在 VS Code 内执行
    await runTests({
        extensionDevelopmentPath,
        extensionTestsPath: path.resolve(__dirname, 'anonDefinition.inVS.test.js'),
        launchArgs: [
            testWorkspace,
            '--disable-extensions', // 排除其他扩展干扰（含已安装的旧版 plsql-outline）
            path.resolve(__dirname, 'ws', 'anon_subfunc_definition.sql')
        ],
    });
}

go().catch(err => {
    console.error('E2E run failed:', err);
    process.exit(1);
});

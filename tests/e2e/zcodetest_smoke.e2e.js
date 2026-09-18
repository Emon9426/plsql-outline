/**
 * 真实 VS Code 端到端冒烟测试: ZCodeTest 语料代表性文件全管线验证
 *
 * 与 anonDefinition.e2e.test.js 同模式(@vscode/test-electron + --disable-extensions):
 *   1. 语言关联: .fnc/.prc/.pks/.pkb/.trg → plsql, .sql → sql(package.json contributes.languages)
 *   2. 手动解析命令 plsqlOutline.parseCurrentFile 在每个文件上可执行完成
 *   3. vscode.executeDefinitionProvider: 各类对象内嵌套子程序调用跳转到声明行
 *      (证明真实宿主内 解析 → symbolIndex → 跳转 全链路对 ZCodeTest 语料生效)
 *
 * 运行: node test/integration/zcodetest_smoke.e2e.js
 */
const path = require('path');
const fs = require('fs');

async function go() {
    const { runTests } = require('@vscode/test-electron');

    const testWorkspace = path.resolve(__dirname, 'ws');
    fs.mkdirSync(testWorkspace, { recursive: true });
    const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');

    await runTests({
        extensionDevelopmentPath,
        extensionTestsPath: path.resolve(__dirname, 'zcodetest_smoke.inVS.test.js'),
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

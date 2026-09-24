/**
 * 真实 VS Code 端到端测试：双代码仓库路径的符号索引跨文件跳转（Issue #38）
 *
 * 独立工作区 ws-index（gitignored）：启动前生成两个仓库夹
 * （repo_a 优先级 1 / repo_b 优先级 2）+ 工作区 settings.json 预置
 * plsql-outline.codeRepository.paths，走真实"新用户配置双路径 →
 * 启动自动建索引（3 秒延迟定时器）→ 跨夹跳转"链路。
 *
 * 运行：node tests/e2e/indexJump.e2e.test.js
 */
const path = require('path');
const fs = require('fs');

const WS_INDEX = path.resolve(__dirname, 'ws-index');
const REPO_A = path.join(WS_INDEX, 'repo_a');
const REPO_B = path.join(WS_INDEX, 'repo_b');

// repo_a（优先级 1）：包 pkg_a（get_order L2 / 成员 process_data L6）
// + 独立过程 process_data（L1）——与 repo_b 构成同名冲突
const PKG_A = [
    'CREATE OR REPLACE PACKAGE BODY pkg_a AS',
    '    FUNCTION get_order(p_id IN NUMBER) RETURN NUMBER IS',
    '    BEGIN',
    '        RETURN p_id;',
    '    END get_order;',
    '    PROCEDURE process_data(p_in IN VARCHAR2) IS',
    '    BEGIN',
    '        NULL;',
    '    END process_data;',
    'END pkg_a;',
    '/'
].join('\n');

const STANDALONE_A = [
    'CREATE OR REPLACE PROCEDURE process_data(p_x IN NUMBER) IS',
    'BEGIN',
    '    NULL;',
    'END process_data;',
    '/'
].join('\n');

// repo_b（优先级 2）：包 pkg_b（calc_total L2 / 成员 process_data L6）
// + 独立过程 process_data（L1）
const PKG_B = [
    'CREATE OR REPLACE PACKAGE BODY pkg_b AS',
    '    FUNCTION calc_total(p_amt IN NUMBER) RETURN NUMBER IS',
    '    BEGIN',
    '        RETURN p_amt * 2;',
    '    END calc_total;',
    '    PROCEDURE process_data(p_tag IN VARCHAR2) IS',
    '    BEGIN',
    '        NULL;',
    '    END process_data;',
    'END pkg_b;',
    '/'
].join('\n');

const PROC_SHARED = [
    'CREATE OR REPLACE PROCEDURE process_data(p_y IN DATE) IS',
    'BEGIN',
    '    NULL;',
    'END process_data;',
    '/'
].join('\n');

// 调用方：匿名块，位于两个仓库夹之外（证明跳转纯靠符号索引）
// c_orders 声明行 L2（当前文件跳转用例，不经索引）
const CALLER = [
    'DECLARE',
    '    CURSOR c_orders IS SELECT 1 FROM dual;',
    '    v_total NUMBER;',
    'BEGIN',
    '    OPEN c_orders;',
    '    FETCH c_orders INTO v_total;',
    '    CLOSE c_orders;',
    '    v_total := pkg_a.get_order(100);',
    '    v_total := pkg_b.calc_total(200);',
    '    process_data(v_total);',
    "    pkg_b.process_data('x');",
    'END;',
    '/'
].join('\n');

function prepareWorkspace() {
    // 每次运行重建，避免上次残留（如 watcher 用例生成的 new_symbols.sql）
    fs.rmSync(WS_INDEX, { recursive: true, force: true });
    fs.mkdirSync(REPO_A, { recursive: true });
    fs.mkdirSync(REPO_B, { recursive: true });

    fs.writeFileSync(path.join(REPO_A, 'pkg_a.pkb'), PKG_A, 'utf8');
    fs.writeFileSync(path.join(REPO_A, 'standalone_a.sql'), STANDALONE_A, 'utf8');
    fs.writeFileSync(path.join(REPO_B, 'pkg_b.pkb'), PKG_B, 'utf8');
    fs.writeFileSync(path.join(REPO_B, 'proc_shared.sql'), PROC_SHARED, 'utf8');
    fs.writeFileSync(path.join(WS_INDEX, 'caller.sql'), CALLER, 'utf8');

    // 工作区设置预置双路径（绝对路径，模拟新用户装好后配置仓库路径再启动；
    // 结束后不清理，gitignored，便于失败时检查现场）
    fs.mkdirSync(path.join(WS_INDEX, '.vscode'), { recursive: true });
    fs.writeFileSync(
        path.join(WS_INDEX, '.vscode', 'settings.json'),
        JSON.stringify({
            'plsql-outline.codeRepository.paths': [
                { path: REPO_A, priority: 1 },
                { path: REPO_B, priority: 2 }
            ]
        }, null, 4),
        'utf8'
    );
}

async function go() {
    const { runTests } = require('@vscode/test-electron');

    const extensionDevelopmentPath = path.resolve(__dirname, '..', '..');

    prepareWorkspace();
    await runTests({
        extensionDevelopmentPath,
        extensionTestsPath: path.resolve(__dirname, 'indexJump.inVS.test.js'),
        launchArgs: [
            WS_INDEX,
            '--disable-extensions', // 排除其他扩展干扰（含已安装的旧版 plsql-outline）
        ],
    });
}

go().catch(err => {
    console.error('E2E run failed:', err);
    process.exit(1);
});

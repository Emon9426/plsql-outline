/**
 * 回归套件聚合运行器：依次运行 tests/regression 下全部独立套件。
 *
 * 运行：node tests/regression/run_all.js（或 npm run test:regression）
 * 前置：npm run compile（套件依赖 out/ 编译产物）
 */
const { spawnSync } = require('child_process');
const path = require('path');

const suites = [
    'parser_test.js',
    'symbolIndex_test.js',
    'definition_test.js',
    'cursor_sync_test.js',
    'declaration_render_test.js',
    'complex_realworld_test.js',
    'ecommerce_pkg_test.js',
    'huge_package_test.js',
    'regression_edge_test.js',
    'ui_structure_test.js',
    'refresh_focus_test.js',
    'test_memory_optimization.js'
];

let failed = 0;
for (const s of suites) {
    const r = spawnSync(process.execPath, [path.join(__dirname, s)], { stdio: 'inherit' });
    const ok = r.status === 0;
    console.log(ok ? `PASS ${s}` : `FAIL ${s} (exit=${r.status})`);
    if (!ok) failed++;
}

console.log(failed === 0
    ? `\n全部 ${suites.length} 个回归套件通过`
    : `\n${failed} 个回归套件失败`);
process.exit(failed === 0 ? 0 : 1);

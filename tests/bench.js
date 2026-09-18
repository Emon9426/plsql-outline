/**
 * 解析性能基准：对 tests/corpus 的大文件计时（3 轮取中位数）。
 *
 * 运行：npm run compile && node tests/bench.js
 * 用途：性能改动的证据（改前/改后对比，数字写进 PR 描述）
 */
const { PLSQLParser } = require('../out/parser');
const path = require('path');
const fs = require('fs');

const FILES = [
    'function/func_long.fnc',
    'procedure/proc_long.prc',
    'package_spec/pkg_spec_long.pks',
    'package_body/pkg_body_long.pkb',
    'package_body/pkg_body_long_complex.pkb',
    'trigger/trg_long.trg',
    'anonymous/anon_declare_long.sql',
    'anonymous/anon_begin_long.sql'
];

function median(arr) {
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
}

async function main() {
    const root = path.join(__dirname, 'corpus');
    console.log('文件'.padEnd(42) + '行数'.padStart(8) + '  中位耗时'.padStart(10));
    let total = 0;
    for (const rel of FILES) {
        const file = path.join(root, rel);
        if (!fs.existsSync(file)) {
            console.log(`${rel}  (不存在，跳过)`);
            continue;
        }
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').length;
        const times = [];
        let nodes = 0;
        for (let i = 0; i < 3; i++) {
            const t0 = process.hrtime.bigint();
            const r = await new PLSQLParser().parse(content, rel);
            const ms = Number(process.hrtime.bigint() - t0) / 1e6;
            times.push(ms);
            nodes = r.nodes.length;
        }
        const med = median(times);
        total += med;
        console.log(`${rel.padEnd(42)}${String(lines).padStart(8)}  ${med.toFixed(1).padStart(8)}ms  (节点=${nodes})`);
    }
    console.log(`\n总计中位耗时: ${total.toFixed(1)}ms`);
}

main().catch(err => { console.error(err); process.exit(1); });

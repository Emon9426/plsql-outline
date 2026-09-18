/**
 * 语料全量验证: 用真实解析器(out/parser)逐个解析全部测试文件
 *
 * 检查项:
 *   1. 解析无错误(不触发 50000 行 / 嵌套深度 / 解析卡住等安全限制)
 *   2. 至少产生 1 个顶层节点
 *   3. 文件名含 _long 的文件行数 >= 10000
 *   4. 输出每个文件的顶层节点形态(声明行-结束行, 是否含异常段)供人工比对大纲
 *
 * 运行前先编译: npm run compile
 * 运行: node tests/corpus/validate.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { PLSQLParser } = require('../../out/parser');

const DIRS = ['function', 'procedure', 'package_spec', 'package_body', 'trigger', 'anonymous', 'other_objects'];
const EXT = /\.(sql|fnc|prc|pks|pkb|trg|tps|tpb|vw)$/i;

function countNodes(nodes) {
    let total = 0;
    const byType = {};
    const stack = [...nodes];
    while (stack.length) {
        const n = stack.pop();
        total++;
        byType[n.type] = (byType[n.type] || 0) + 1;
        for (const c of n.children) stack.push(c);
    }
    return { total, byType };
}

(async () => {
    const root = __dirname;
    const files = [];
    for (const d of DIRS) {
        const p = path.join(root, d);
        if (!fs.existsSync(p)) continue;
        for (const f of fs.readdirSync(p).sort()) {
            if (EXT.test(f)) files.push(path.join(d, f));
        }
    }

    let failed = 0;
    const rows = [];

    for (const rel of files) {
        const content = fs.readFileSync(path.join(root, rel), 'utf8');
        const lines = content.split('\n').length;
        const parser = new PLSQLParser();
        const r = await parser.parse(content, rel);

        const problems = [];
        if (r.metadata.errors.length > 0) {
            problems.push(`解析错误: ${r.metadata.errors.map(e => e.message).join('; ')}`);
        }
        if (r.nodes.length === 0) {
            problems.push('无顶层节点');
        }
        if (/_long/.test(rel) && lines < 10000) {
            problems.push(`行数不足: ${lines} < 10000`);
        }

        const { total, byType } = countNodes(r.nodes);
        const roots = r.nodes
            .map(n => `${n.type}:${n.name}[${n.declarationLine}-${n.endLine === null ? 'open' : n.endLine}${n.exceptionLine != null ? ',exc' : ''}]`)
            .join(' ');

        if (problems.length) failed++;
        rows.push({
            file: rel,
            lines,
            nodes: total,
            roots: roots || '(无)',
            depth: r.metadata.maxNestingDepth,
            ms: r.metadata.parseTime,
            status: problems.length ? 'FAIL: ' + problems.join(' | ') : 'OK',
        });
    }

    for (const row of rows) {
        console.log(`${row.status === 'OK' ? '[OK]  ' : '[FAIL]'} ${row.file}`);
        console.log(`       行数=${row.lines} 节点=${row.nodes} 最大深度=${row.depth} 耗时=${row.ms}ms`);
        console.log(`       顶层: ${row.roots}`);
        if (row.status !== 'OK') console.log(`       ${row.status}`);
    }

    const totalLines = rows.reduce((s, r) => s + r.lines, 0);
    console.log('----------------------------------------------------------------------');
    console.log(`共 ${rows.length} 个文件, ${totalLines} 行; 失败 ${failed} 个`);
    if (failed > 0) process.exitCode = 1;
})();

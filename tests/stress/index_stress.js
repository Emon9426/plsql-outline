/**
 * 符号索引压力测试（Issue #38/#39，独立脚本，不进四步回归链）
 *
 * 运行：node tests/stress/index_stress.js
 * 可调规模：PLSQL_STRESS_FILES=5000 node tests/stress/index_stress.js
 *
 * 合成双目录仓库（可配规模，默认 2000 文件）+ 病态文件集（超大包/深嵌套/
 * Q-quote/注释污染/引号标识符/多行 CREATE/前置声明/残缺文件），覆盖 11 个阶段：
 *   1  首次全量构建（耗时/符号数精确断言/内存）
 *   2  无变化重建（mtime 全命中 → 零重扫断言）
 *   3  扰动重建（1% 改 / 0.5% 增 / 0.5% 删 → 正确迁移断言）
 *   4  forceFull + 构建中并发查询（旧索引持续可查断言）+ 构建中 upsert（恰好一次断言）
 *   5  10% 处取消（返回 false、旧索引完好断言）→ 复建成功
 *   6  缓存 v4 落盘/加载（体积/耗时/计数一致/加载后零重扫断言）
 *   7  watcher 风暴（50 改 + 10 删 → 无重复条目断言）
 *   8  maxFiles 收缩（≤ 上限断言）
 *   9  病态文件扫描器 vs 全量解析器一致性（含超大/深嵌套/污染形态）
 *   10 查询延迟基准（lookup / 双路径优先级冲突 / Ctrl+T searchSymbols）
 *   11 内存稳定性（连续重建内存增长上限断言）
 */
const Module = require('module');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ---- mock vscode（SymbolIndex 仅用 RelativePattern/watcher/Uri）----
const mockVscode = {
    RelativePattern: class { constructor(base, pattern) { this.base = base; this.pattern = pattern; } },
    workspace: {
        createFileSystemWatcher: () => ({
            onDidCreate: () => ({}), onDidChange: () => ({}), onDidDelete: () => ({}), dispose: () => {}
        })
    },
    Uri: { file: (f) => ({ fsPath: f }) }
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request) {
    if (request === 'vscode') return 'vscode_mock';
    return originalResolve.apply(this, arguments);
};
require.cache['vscode_mock'] = { id: 'vscode_mock', filename: 'vscode_mock', loaded: true, exports: mockVscode };

const { SymbolIndex } = require('../../out/symbolIndex');
const { PLSQLParser } = require('../../out/parser');
const { NodeType } = require('../../out/types');
const { scanSymbols, symbolsFromParseResult } = require('../../out/symbolScanner');

// ---- 基础设施 ----
const mockOutputChannel = { appendLine: (m) => { if (process.env.PLSQL_STRESS_VERBOSE) console.log('    [index]', m); }, dispose: () => {} };

let passed = 0, failed = 0;
const failures = [];
function check(cond, msg) {
    if (cond) { passed++; }
    else { failed++; failures.push(msg); console.error(`  ✗ FAIL: ${msg}`); }
}
function assertEqual(actual, expected, msg) {
    check(actual === expected, `${msg}（期望 ${expected}，实际 ${actual}）`);
}

const metrics = [];
function metric(phase, key, value) {
    const row = metrics.find(m => m.phase === phase) || (metrics.push({ phase, items: {} }), metrics[metrics.length - 1]);
    row.items[key] = value;
}
function heapMB() { return (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1); }

/** 确定性随机（mulberry32）：结果可复现 */
function mulberry32(seed) {
    return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ---- 合成内容生成器（符号计数精确可期） ----
const GEN = {
    filesWithSymbols: 0,
    symbols: 0,          // 条目总数（仅报告用）
    nameSet: new Set(),  // 去重符号名（symbols.size 的精确口径）
    collisionFiles: 0
};
function trackName(n) { GEN.nameSet.add(n.toUpperCase()); }

function pad(n, w) { return String(n).padStart(w, '0'); }

/** 包体：members 个成员；withCollision 追加同名冲突符号 process_order */
function packageBody(pkg, members, withCollision) {
    const lines = [`CREATE OR REPLACE PACKAGE BODY ${pkg} AS`, '    CURSOR cur_pkg IS SELECT 1 FROM dual;'];
    let count = 2; // 包本身 + 包级游标（仅搜索条目）
    trackName('cur_pkg');
    for (let m = 1; m <= members; m++) {
        if (m % 3 === 0) {
            lines.push(`    PROCEDURE do_${pad(m, 3)}(p_x IN NUMBER) IS`, '    BEGIN', '        NULL;', `    END do_${pad(m, 3)};`);
            trackName(`do_${pad(m, 3)}`);
        } else {
            lines.push(`    FUNCTION get_${pad(m, 3)}(p_x IN NUMBER) RETURN NUMBER IS`, '    BEGIN', `        RETURN p_x + ${m};`, `    END get_${pad(m, 3)};`);
            trackName(`get_${pad(m, 3)}`);
        }
        count++;
    }
    if (withCollision) {
        lines.push('    PROCEDURE process_order(p_id IN NUMBER) IS', '    BEGIN', '        NULL;', '    END process_order;');
        count++;
        trackName('process_order');
    }
    lines.push(`END ${pkg};`, '/');
    GEN.symbols += count;
    trackName(pkg);
    return lines.join('\n');
}

function packageSpec(pkg, members, withCollision) {
    const lines = [`CREATE OR REPLACE PACKAGE ${pkg} AS`];
    let count = 1;
    for (let m = 1; m <= members; m++) {
        if (m % 3 === 0) {
            lines.push(`    PROCEDURE do_${pad(m, 3)}(p_x IN NUMBER);`);
            trackName(`do_${pad(m, 3)}`);
        } else {
            lines.push(`    FUNCTION get_${pad(m, 3)}(p_x IN NUMBER) RETURN NUMBER;`);
            trackName(`get_${pad(m, 3)}`);
        }
        count++;
    }
    if (withCollision) {
        lines.push('    PROCEDURE process_order(p_id IN NUMBER);');
        count++;
        trackName('process_order');
    }
    lines.push(`END ${pkg};`, '/');
    GEN.symbols += count;
    return lines.join('\n');
}

function standalone(name, kind, withCollision) {
    let count = 1;
    let src;
    if (kind === 'function') {
        src = `CREATE OR REPLACE FUNCTION ${name}(p_x IN NUMBER) RETURN NUMBER IS\nBEGIN\n    RETURN p_x;\nEND ${name};\n/\n`;
    } else {
        src = `CREATE OR REPLACE PROCEDURE ${name}(p_x IN NUMBER) IS\n    CURSOR cur_local IS SELECT 1 FROM dual;\nBEGIN\n    NULL;\nEND ${name};\n/\n`;
        count++;
        trackName('cur_local');
    }
    if (withCollision) {
        count++;
        src += `CREATE OR REPLACE PROCEDURE process_order(p_y IN DATE) IS\nBEGIN\n    NULL;\nEND process_order;\n/\n`;
        trackName('process_order');
    }
    GEN.symbols += count;
    trackName(name);
    return src;
}

function trigger(name) {
    GEN.symbols += 1;
    trackName(name);
    return `CREATE OR REPLACE TRIGGER ${name}\nBEFORE INSERT ON t_${name} FOR EACH ROW\nBEGIN\n    NULL;\nEND;\n/\n`;
}

// ---- 病态文件（确定性，计入精确符号数；残缺文件不计） ----
function pathologicalSet() {
    const files = [];
    // 超大包：300 成员 ≈ 3.6k 行
    files.push(['p_huge.pkb', packageBody('stress_huge_pkg', 300, false)]);
    // 深嵌套：包内 top_fn → deep_02..06（扫描器无深度跟踪，嵌套成员属良性超集，
    // 精确计数按扫描口径：包 1 + top_fn 1 + deep×5 = 7）
    {
        const lines = ['CREATE OR REPLACE PACKAGE BODY stress_deep_pkg AS'];
        const open = (lvl) => {
            lines.push(`${'    '.repeat(lvl)}FUNCTION deep_${pad(lvl, 2)} RETURN NUMBER IS`, `${'    '.repeat(lvl)}BEGIN`);
        };
        const close = (lvl) => {
            lines.push(`${'    '.repeat(lvl)}RETURN ${lvl};`, `${'    '.repeat(lvl)}END deep_${pad(lvl, 2)};`);
        };
        lines.push('    FUNCTION top_fn RETURN NUMBER IS', '    BEGIN');
        for (let l = 2; l <= 6; l++) { open(l); }
        for (let l = 6; l >= 2; l--) { close(l); }
        lines.push('        RETURN 0;', '    END top_fn;', 'END stress_deep_pkg;', '/');
        GEN.symbols += 7;
        ['stress_deep_pkg', 'top_fn', 'deep_02', 'deep_03', 'deep_04', 'deep_05', 'deep_06'].forEach(trackName);
        files.push(['p_deep.pkb', lines.join('\n')]);
    }
    // Q-quote / 字符串污染（关键字在字符串里）
    files.push(['p_qquote.sql', [
        `CREATE OR REPLACE PROCEDURE p_qq IS`,
        `    v_txt VARCHAR2(4000);`,
        `BEGIN`,
        `    v_txt := q'[CREATE OR REPLACE PROCEDURE fake_in_string IS BEGIN NULL; END;]';`,
        `    v_txt := 'FUNCTION fake_std(p_x IN NUMBER) RETURN NUMBER';`,
        `    v_txt := q'{-- fake comment PROCEDURE fake_q2}';`,
        `END p_qq;`,
        `/`
    ].join('\n')]);
    GEN.symbols += 1;
    trackName('p_qq');
    // 注释污染（块注释跨行含关键字）
    files.push(['p_comments.sql', [
        `CREATE OR REPLACE PROCEDURE p_cm IS`,
        `/*`,
        `CREATE OR REPLACE FUNCTION fake_comment_fn RETURN NUMBER IS`,
        `BEGIN NULL; END;`,
        `*/`,
        `BEGIN`,
        `    NULL; -- PROCEDURE fake_line_proc;`,
        `END p_cm;`,
        `/`
    ].join('\n')]);
    GEN.symbols += 1;
    trackName('p_cm');
    // 引号标识符（schema 前缀）
    files.push(['p_quoted.sql', [
        `CREATE OR REPLACE PROCEDURE "APPS"."P_QID" IS`,
        `BEGIN`,
        `    NULL;`,
        `END P_QID;`,
        `/`
    ].join('\n')]);
    GEN.symbols += 1;
    trackName('p_qid');
    // 多行 CREATE 签名（12 行参数表）
    files.push(['p_multiline.fnc', [
        `CREATE OR REPLACE FUNCTION f_ml(`,
        `    p_a IN NUMBER,`,
        `    p_b IN NUMBER,`,
        `    p_c IN NUMBER,`,
        `    p_d IN NUMBER,`,
        `    p_e IN NUMBER,`,
        `    p_f IN NUMBER,`,
        `    p_g IN NUMBER,`,
        `    p_h IN NUMBER,`,
        `    p_i IN NUMBER,`,
        `    p_j IN NUMBER)`,
        `RETURN NUMBER IS`,
        `BEGIN`,
        `    RETURN p_a;`,
        `END f_ml;`,
        `/`
    ].join('\n')]);
    GEN.symbols += 1;
    trackName('f_ml');
    // 前置声明风暴：30 个声明 + 30 个定义（去重口径）
    {
        const lines = ['CREATE OR REPLACE PACKAGE BODY stress_fwd_pkg AS'];
        for (let m = 1; m <= 30; m++) {
            lines.push(`    PROCEDURE fwd_${pad(m, 3)}(p_x IN NUMBER);`);
        }
        for (let m = 1; m <= 30; m++) {
            lines.push(`    PROCEDURE fwd_${pad(m, 3)}(p_x IN NUMBER) IS`, '    BEGIN', '        NULL;', `    END fwd_${pad(m, 3)};`);
        }
        lines.push('END stress_fwd_pkg;', '/');
        GEN.symbols += 31; // 包 + 30 定义（声明被原位替换）
        trackName('stress_fwd_pkg');
        for (let m = 1; m <= 30; m++) trackName(`fwd_${pad(m, 3)}`);
        files.push(['p_forward.pkb', lines.join('\n')]);
    }
    // 残缺文件（不完整 END + 垃圾行；扫描器仍确定产出 CREATE 匹配的 1 个符号）
    files.push(['p_broken.sql', [
        `CREATE OR REPLACE PROCEDURE p_broken IS`,
        `BEGIN`,
        `    IF 1 = 1 THEN`,
        `END;`,
        `/`,
        `garbage line here`
    ].join('\n')]);
    GEN.symbols += 1;
    trackName('p_broken');
    return files;
}

// ---- 主流程 ----
async function main() {
    const scale = parseInt(process.env.PLSQL_STRESS_FILES || '2000', 10);
    const rand = mulberry32(20260924);
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plsql-outline-stress-'));
    const repoA = path.join(root, 'repo_a');
    const repoB = path.join(root, 'repo_b');
    const paths2 = [{ path: repoA, priority: 1 }, { path: repoB, priority: 2 }];
    const EXTS = ['.sql', '.pkb', '.pks', '.fnc', '.trg'];

    let genStart = Date.now();
    let totalLines = 0, totalBytes = 0;
    const writeFile = (rel, content) => {
        const full = path.join(root, rel);
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf8');
        totalLines += content.split('\n').length;
        totalBytes += Buffer.byteLength(content, 'utf8');
    };
    const trackFile = () => { GEN.filesWithSymbols++; };

    try {
        // ===== 生成合成仓库 =====
        for (let i = 0; i < scale; i++) {
            const inA = i % 5 < 3; // 60% repoA
            const repo = inA ? 'repo_a' : 'repo_b';
            const prefix = inA ? 'a' : 'b';
            const sub = `mod_${pad(i % 20, 2)}`;
            const collision = i % 10 === 0;
            if (collision) GEN.collisionFiles++;
            const r = rand();
            if (r < 0.40) {
                // 包体（+ 每 3 个配规格）
                const members = 3 + Math.floor(rand() * 25);
                const pkg = `${prefix}_pkg_${pad(i, 5)}`;
                writeFile(path.join(repo, sub, `${pkg}.pkb`), packageBody(pkg, members, collision));
                trackFile();
                if (i % 3 === 0) {
                    writeFile(path.join(repo, sub, `${pkg}.pks`), packageSpec(pkg, members, collision));
                    trackFile();
                }
            } else if (r < 0.75) {
                writeFile(path.join(repo, sub, `${prefix}_sp_${pad(i, 5)}.sql`),
                    standalone(`${prefix}_sp_${pad(i, 5)}`, rand() < 0.5 ? 'function' : 'procedure', collision));
                trackFile();
            } else {
                writeFile(path.join(repo, sub, `${prefix}_trg_${pad(i, 5)}.trg`), trigger(`${prefix}_trg_${pad(i, 5)}`));
                trackFile();
            }
        }
        // 病态文件计入 repo_a（全部产出符号，含残缺文件的 CREATE 匹配）
        const patho = pathologicalSet();
        for (const [name, content] of patho) {
            writeFile(path.join('repo_a', 'pathological', name), content);
            trackFile();
        }
        const genMs = Date.now() - genStart;
        metric('0-生成', '文件', `${GEN.filesWithSymbols}（含符号）+ 残缺 1`);
        metric('0-生成', '总行数', totalLines.toLocaleString());
        metric('0-生成', '总体积', `${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
        metric('0-生成', '耗时', `${genMs}ms`);
        console.log(`[0] 生成 ${GEN.filesWithSymbols} 文件 / ${totalLines} 行 / ${(totalBytes / 1024 / 1024).toFixed(1)}MB，${genMs}ms；期望符号 ${GEN.symbols}`);

        const index = new SymbolIndex(mockOutputChannel);
        let baselineSymbols = 0;

        // ===== 阶段 1：首次全量构建 =====
        {
            const heapBefore = heapMB();
            const t0 = Date.now();
            const ok = await index.buildIndex(paths2, EXTS, 5000);
            const ms = Date.now() - t0;
            const st = index.getStatus();
            check(ok === true, '阶段1: 首次构建应返回 true');
            baselineSymbols = st.symbolCount;
            // 生成量超过 maxFiles（5000）时按扫描顺序截断，只断言部分集语义
            const capped = GEN.filesWithSymbols > 5000;
            assertEqual(st.fileCount, Math.min(GEN.filesWithSymbols, 5000),
                '阶段1: 文件数精确一致（maxFiles 上限内）');
            if (capped) {
                check(st.symbolCount > 0 && st.symbolCount < GEN.nameSet.size,
                    '阶段1: 触及 maxFiles 上限时符号数为部分集');
            } else {
                assertEqual(st.symbolCount, GEN.nameSet.size, '阶段1: 去重符号名总数精确一致');
            }
            metric('1-首建', '耗时', `${ms}ms`);
            metric('1-首建', '符号数', st.symbolCount.toLocaleString());
            metric('1-首建', '堆增量', `+${(heapMB() - heapBefore).toFixed(1)}MB`);
            console.log(`[1] 首建 ${ms}ms，${st.symbolCount} 符号 / ${st.fileCount} 文件，堆 +${(heapMB() - heapBefore).toFixed(1)}MB`);
        }

        // ===== 阶段 2：无变化重建（零重扫） =====
        {
            const snapshots = [];
            index.setStatusListener(p => snapshots.push({ ...p }));
            const t0 = Date.now();
            await index.buildIndex(paths2, EXTS, 5000);
            const ms = Date.now() - t0;
            index.setStatusListener(null);
            check(!snapshots.some(p => p.building && p.total > 0), '阶段2: 无变化重建应零重扫');
            assertEqual(index.getStatus().symbolCount, baselineSymbols, '阶段2: 符号数保持');
            metric('2-无变化重建', '耗时', `${ms}ms`);
            console.log(`[2] 无变化重建 ${ms}ms（零重扫）`);
        }

        // ===== 阶段 3：扰动重建（1% 改 / 0.5% 增 / 0.5% 删） =====
        {
            const allFiles = [];
            (function walk(d) {
                for (const e of fs.readdirSync(d, { withFileTypes: true })) {
                    const f = path.join(d, e.name);
                    if (e.isDirectory()) walk(f); else if (EXTS.includes(path.extname(f))) allFiles.push(f);
                }
            })(repoA);
            const mutable = allFiles.filter(f => !f.includes('pathological'));
            const nMod = Math.max(1, Math.floor(mutable.length * 0.01));
            const nAdd = Math.max(1, Math.floor(mutable.length * 0.005));
            const nDel = Math.max(1, Math.floor(mutable.length * 0.005));
            await new Promise(r => setTimeout(r, 10)); // 保证 mtime 推进

            const modPool = mutable.filter(f => /_(sp|trg)_/.test(path.basename(f)));
            const modTargets = modPool.slice(0, Math.min(nMod, modPool.length));
            let expectedDelta = 0;
            for (const f of modTargets) {
                // 改写为单符号文件：旧符号 -N，新符号 +1（精确可期：旧值从生成器无法逐文件追溯，改用计数差断言）
                fs.writeFileSync(f, standalone('churn_reborn_' + path.basename(f, path.extname(f)).replace(/\W/g, '_'), 'procedure', false), 'utf8');
            }
            let addedSymbols = 0;
            for (let k = 0; k < nAdd; k++) {
                const nm = `churn_new_${pad(k, 4)}`;
                writeFile(path.join('repo_a', 'mod_00', `${nm}.sql`), standalone(nm, 'procedure', false));
                GEN.filesWithSymbols++; GEN.symbols++; addedSymbols++;
            }
            // 删除探针只取独名单元文件（_sp_/_trg_）：包体与规格同名，删其一符号仍在
            const delPool = mutable.filter(f => /_(sp|trg)_/.test(path.basename(f)));
            const delTargets = delPool.slice(modTargets.length,
                modTargets.length + Math.min(nDel, Math.max(0, delPool.length - modTargets.length)));
            const delProbes = delTargets.map(f => path.basename(f, path.extname(f)).toUpperCase());
            for (const f of delTargets) {
                fs.unlinkSync(f);
            }
            // 修改文件旧符号数不可逐文件追溯 → 强断言：每个修改文件新符号恰好 1 条、
            // 被删文件符号清零、新增文件符号入索引、重扫数恰为 改+增
            const t0 = Date.now();
            let snapshotsTotal = -1;
            index.setStatusListener(p => { if (p.building) snapshotsTotal = Math.max(snapshotsTotal, p.total); });
            await index.buildIndex(paths2, EXTS, 5000);
            const ms = Date.now() - t0;
            index.setStatusListener(null);

            let churnOk = true;
            for (const f of modTargets) {
                const nm = 'CHURN_REBORN_' + path.basename(f, path.extname(f)).replace(/\W/g, '_').toUpperCase();
                if (index.lookup(nm).length !== 1) { churnOk = false; break; }
            }
            check(churnOk, '阶段3: 修改文件重扫后新符号恰好一条');
            const delOk = delProbes.every(nm => index.lookup(nm).length === 0);
            check(delOk, '阶段3: 删除文件符号清零');
            check(index.lookup('CHURN_NEW_0000').length === 1, '阶段3: 新增文件符号入索引');
            check(snapshotsTotal === nMod + nAdd, `阶段3: 重扫数应恰为 改+增=${nMod + nAdd}（实际 ${snapshotsTotal}）`);
            metric('3-扰动重建', '重扫', `${snapshotsTotal}/${allFiles.length}`);
            metric('3-扰动重建', '耗时', `${ms}ms`);
            console.log(`[3] 扰动重建：重扫 ${snapshotsTotal}/${allFiles.length}，${ms}ms`);
        }

        // ===== 阶段 4：forceFull + 构建中并发查询 + 构建中 upsert =====
        {
            // 准备 upsert 用解析结果（当前文件在仓库外）
            const outsideFile = path.join(root, 'outside_current.sql');
            writeFile('outside_current.sql', standalone('outside_current_proc', 'procedure', false));
            const upsertResult = await new PLSQLParser().parse(
                fs.readFileSync(outsideFile, 'utf8'), outsideFile);

            let violations = 0, checks = 0;
            const token = { isCancellationRequested: false };
            const t0 = Date.now();
            const ok = await index.buildIndex(paths2, EXTS, 5000, {
                forceFull: true,
                cancellationToken: token,
                onProgress: (done, total) => {
                    // 并发查询：全量重建期间旧索引必须持续可查
                    if (done % 50 === 0 && done < total) {
                        checks++;
                        if (index.lookup('STRESS_HUGE_PKG').length === 0) violations++;
                        if (index.lookup('P_QQ').length === 0) violations++;
                    }
                    // 10% 处取消（阶段 5 复用该构建）
                    if (done >= Math.floor(total * 0.1)) token.isCancellationRequested = true;
                }
            });
            const ms = Date.now() - t0;
            // 阶段 4/5 合并断言
            check(ok === false, '阶段5: 取消的构建应返回 false');
            check(violations === 0, `阶段4: 重建期间并发查询应全部命中旧索引（${violations}/${checks} 违例）`);
            check(index.isBuilding() === false, '阶段5: 取消后 building 复位');
            check(index.lookup('STRESS_HUGE_PKG').length >= 1, '阶段5: 取消后旧索引仍可查');
            metric('4-forceFull取消', '耗时', `${ms}ms（10% 处取消）`);
            metric('4-forceFull取消', '并发查询', `${checks} 次 / ${violations} 违例`);
            console.log(`[4/5] forceFull 至 10% 取消 ${ms}ms；并发查询 ${checks} 次违例 ${violations}`);

            // upsert 在构建中的行为单独验证（新一轮构建）
            const buildP = index.buildIndex(paths2, EXTS, 5000, { forceFull: true });
            index.upsertFromParseResult(upsertResult, outsideFile); // 构建中 → 待处理队列
            index.upsertFromParseResult(upsertResult, outsideFile); // 重复 upsert 只留最新
            await buildP;
            assertEqual(index.lookup('OUTSIDE_CURRENT_PROC').length, 1, '阶段4: 构建中 upsert 重放后恰好一条');
            // 后续无变化重建不应移除仓库外文件（fileStats 不含它）
            await index.buildIndex(paths2, EXTS, 5000);
            assertEqual(index.lookup('OUTSIDE_CURRENT_PROC').length, 1, '阶段4: 仓库外 upsert 在后续重建后保留');
            console.log('[4] 构建中 upsert 恰好一次且在后续重建后保留');
        }

        // ===== 阶段 5（续）：取消后复建成功 =====
        {
            const ok = await index.buildIndex(paths2, EXTS, 5000);
            check(ok === true, '阶段5: 取消后复建应成功');
        }

        // ===== 阶段 6：缓存 v4 落盘/加载 =====
        {
            const cachePath = path.join(root, 'symbol-index.json');
            const t0 = Date.now();
            await index.save(cachePath);
            const saveMs = Date.now() - t0;
            const sizeMB = (fs.statSync(cachePath).size / 1024 / 1024).toFixed(2);

            const fresh = new SymbolIndex(mockOutputChannel);
            const t1 = Date.now();
            const loaded = await fresh.load(cachePath);
            const loadMs = Date.now() - t1;
            check(loaded === true, '阶段6: v4 缓存加载成功');
            assertEqual(fresh.getStatus().symbolCount, index.getStatus().symbolCount, '阶段6: 加载后符号数一致');

            const snapshots = [];
            fresh.setStatusListener(p => snapshots.push({ ...p }));
            const t2 = Date.now();
            await fresh.buildIndex(paths2, EXTS, 5000);
            const incrMs = Date.now() - t2;
            fresh.setStatusListener(null);
            check(!snapshots.some(p => p.building && p.total > 0), '阶段6: 加载后无变化重建零重扫（fileStats 随缓存恢复）');
            metric('6-缓存', '落盘', `${sizeMB}MB / ${saveMs}ms`);
            metric('6-缓存', '加载', `${loadMs}ms`);
            metric('6-缓存', '加载后零重扫重建', `${incrMs}ms`);
            console.log(`[6] 缓存 ${sizeMB}MB：save ${saveMs}ms / load ${loadMs}ms / 加载后重建 ${incrMs}ms（零重扫）`);
        }

        // ===== 阶段 7：watcher 风暴（50 改 + 10 删） =====
        {
            const allSql = [];
            (function walk(d) {
                for (const e of fs.readdirSync(d, { withFileTypes: true })) {
                    const f = path.join(d, e.name);
                    if (e.isDirectory()) walk(f); else if (/sp_\d+\.sql$/.test(e.name) && !f.includes('pathological')) allSql.push(f);
                }
            })(repoA);
            await new Promise(r => setTimeout(r, 10));
            const mod50 = allSql.slice(0, Math.min(50, allSql.length));
            const t0 = Date.now();
            const stormP = [];
            for (const f of mod50) {
                const nm = `storm_${path.basename(f, '.sql')}`;
                fs.writeFileSync(f, standalone(nm, 'procedure', false), 'utf8');
                stormP.push(index.updateFile(f)); // watcher 语义（防抖后）直接调用
            }
            const del10 = allSql.slice(50, 50 + Math.min(10, Math.max(0, allSql.length - 50)));
            const delProbes = del10.map(f => path.basename(f, '.sql').toUpperCase());
            for (const f of del10) {
                fs.unlinkSync(f);
                index.removeFile(f);
            }
            await Promise.all(stormP);
            const ms = Date.now() - t0;
            let dupOk = true;
            for (const f of mod50) {
                const nm = 'STORM_' + path.basename(f, '.sql').toUpperCase();
                if (index.lookup(nm).length !== 1) { dupOk = false; break; }
            }
            check(dupOk, '阶段7: 风暴后新符号恰好一条（无重复）');
            check(delProbes.every(nm => index.lookup(nm).length === 0), '阶段7: 风暴删除文件符号清零');
            metric('7-watcher风暴', '耗时', `${ms}ms（${mod50.length} 改 + ${del10.length} 删）`);
            console.log(`[7] watcher 风暴 ${mod50.length} 改 + ${del10.length} 删：${ms}ms，无重复`);
        }

        // ===== 阶段 8：maxFiles 收缩 =====
        {
            await index.buildIndex(paths2, EXTS, 500);
            const st = index.getStatus();
            // +1 容差：阶段4 upsert 的仓库外文件在 fileSymbols 中但不参与 maxFiles 扫描上限
            check(st.fileCount <= 501, `阶段8: maxFiles=500 后文件数 ≤501（实际 ${st.fileCount}）`);
            check(st.fileCount >= 400, `阶段8: 收缩后应仍接近上限（实际 ${st.fileCount}）`);
            metric('8-maxFiles收缩', '文件数', st.fileCount);
            console.log(`[8] maxFiles=500 收缩：${st.fileCount} 文件`);
            // 恢复全量供后续阶段
            await index.buildIndex(paths2, EXTS, 5000);
        }

        // ===== 阶段 9：病态文件一致性（扫描器 vs 全量解析器） =====
        {
            const pathoDir = path.join(repoA, 'pathological');
            let filesChecked = 0, missing = 0, badExtra = 0;
            const detail = [];
            for (const name of fs.readdirSync(pathoDir)) {
                const full = path.join(pathoDir, name);
                const content = fs.readFileSync(full, 'utf8');
                const origLines = content.split('\n');
                const parserSymbols = symbolsFromParseResult(
                    await new PLSQLParser().parse(content, full));
                const scannerSymbols = scanSymbols(content).symbols;
                const key = s => `${s.name.toUpperCase()}|${s.type}|${(s.packageName || '').toUpperCase()}|${s.line}`;
                const scannerKeys = new Set(scannerSymbols.map(key));
                for (const ps of parserSymbols) {
                    if (!scannerKeys.has(key(ps))) { missing++; detail.push(`${name} 缺 ${key(ps)}`); }
                }
                const parserKeys = new Set(parserSymbols.map(key));
                for (const ss of scannerSymbols) {
                    if (parserKeys.has(key(ss))) continue;
                    const lineText = (origLines[ss.line - 1] || '').toUpperCase();
                    const benign = (ss.type === NodeType.FUNCTION || ss.type === NodeType.PROCEDURE ||
                        ss.type === NodeType.CURSOR) &&
                        lineText.includes(ss.name.toUpperCase());
                    if (!benign) { badExtra++; detail.push(`${name} 非良性超集 ${key(ss)}`); }
                }
                filesChecked++;
            }
            check(missing === 0, `阶段9: 病态文件解析器符号全命中（缺失 ${missing}）${detail.slice(0, 5).join(';')}`);
            check(badExtra === 0, `阶段9: 超集均良性（异常 ${badExtra}）`);
            metric('9-病态一致性', '文件', filesChecked);
            console.log(`[9] 病态一致性 ${filesChecked} 文件：缺失 ${missing}，异常超集 ${badExtra}`);
        }

        // ===== 阶段 10：查询延迟基准 =====
        {
            const N = 2000;
            const samples = [];
            const t0 = process.hrtime.bigint();
            for (let k = 0; k < N; k++) {
                const n = pad(k % 1000, 5);
                samples.push(index.lookup(`A_SP_${n}`));
                samples.push(index.lookup(`no_such_${k}`));
            }
            const lookupMs = Number(process.hrtime.bigint() - t0) / 1e6 / (N * 2);

            // 双路径优先级冲突：process_order 遍布两仓
            const t1 = process.hrtime.bigint();
            const prio = index.lookupWithPriority('process_order', undefined, paths2);
            const prioMs = Number(process.hrtime.bigint() - t1) / 1e6;
            check(prio.length > 0 && prio.every(e =>
                path.normalize(e.filePath).toLowerCase().startsWith(path.normalize(repoA).toLowerCase())),
                '阶段10: 优先级冲突消解全部来自高优先级仓库');
            metric('10-查询延迟', 'lookup 均值', `${(lookupMs * 1000).toFixed(1)}µs/次`);
            metric('10-查询延迟', '冲突消解', `${prioMs.toFixed(2)}ms / ${prio.length} 条命中`);

            // Ctrl+T 搜索
            const queries = ['pkg_', 'get_0', 'a_sp_1', 'process_order', 'trg_0', 'zzz_nohit'];
            const t2 = process.hrtime.bigint();
            let searchTotal = 0;
            for (const q of queries) searchTotal += index.searchSymbols(q).length;
            const searchMs = Number(process.hrtime.bigint() - t2) / 1e6 / queries.length;
            check(index.searchSymbols('process_order').length >= Math.max(10, Math.floor(scale * 0.03)),
                '阶段10: Ctrl+T 搜索覆盖充分数量的冲突符号');
            metric('10-查询延迟', 'searchSymbols 均值', `${searchMs.toFixed(2)}ms/次（${searchTotal} 命中/6 查询）`);
            console.log(`[10] lookup ${(lookupMs * 1000).toFixed(1)}µs/次；冲突消解 ${prioMs.toFixed(2)}ms/${prio.length}条；搜索 ${searchMs.toFixed(2)}ms/次`);
        }

        // ===== 阶段 11：内存稳定性（连续 3 次无变化重建） =====
        {
            global.gc?.();
            const before = heapMB();
            for (let r = 0; r < 3; r++) {
                await index.buildIndex(paths2, EXTS, 5000);
            }
            const growth = Number(heapMB()) - Number(before);
            check(growth < 50, `阶段11: 连续重建内存增长 <50MB（实际 ${growth.toFixed(1)}MB）`);
            metric('11-内存', '3 次重建增长', `${growth.toFixed(1)}MB`);
            console.log(`[11] 3 次无变化重建内存增长 ${growth.toFixed(1)}MB，堆 ${heapMB()}MB`);
        }

        // ===== 报告 =====
        console.log('\n================ 压测指标汇总 ================');
        for (const row of metrics) {
            console.log(`${row.phase}`);
            for (const [k, v] of Object.entries(row.items)) {
                console.log(`    ${k}: ${v}`);
            }
        }
        console.log('==============================================');
        console.log(`压测断言: ${passed}/${passed + failed} 通过`);
        if (failed > 0) {
            console.log(`\n失败:\n  - ${failures.join('\n  - ')}`);
            process.exitCode = 1;
        } else {
            console.log('\n所有压测断言通过!');
        }
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
}

main().catch(err => {
    console.error('压测执行出错:', err);
    process.exit(1);
});

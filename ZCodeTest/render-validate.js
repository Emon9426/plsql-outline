/**
 * ZCodeTest 显示层渲染校验: 用真实 treeView 显示层(out/treeView.js)全量渲染大纲树
 *
 * 与 validate.js(仅解析层)互补, 本脚本验证"VS Code 大纲中真实显示"的部分:
 *   1. 每个文件 解析 → PLSQLOutlineProvider(真实显示层, vscode mock) →
 *      递归 getChildren + getTreeItem 全树遍历, 全程不得抛异常
 *      (VS Code 中任何 getChildren/getTreeItem 异常 = 大纲树损坏/报错弹窗)
 *   2. 根节点标签符合预期(对象名正确显示)
 *   3. 必须出现的标签(嵌套子程序名/Sub Program/Declaration/Exception 等真实可见)
 *   4. 禁止出现的标签(被注释掉的代码不得渲染: legacy_* / purge_orders 等)
 *   5. 长文件全树遍历耗时记录(渲染性能)
 *
 * 已知基线: pkg_body_long*.pkb 因解析器 currentLevel 泄漏缺陷解析为 0 节点,
 * 本脚本将其标记为 KNOWN-FAIL, 不计入新增失败。
 *
 * 运行前先编译: npm run compile
 * 运行: node ZCodeTest/render-validate.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

// ---------- mock vscode(与 GMLTest 渲染测试同款) ----------
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class TreeItem { constructor(label, collapsibleState) { this.label = label; this.collapsibleState = collapsibleState; } },
    ThemeIcon: class ThemeIcon { constructor(id) { this.id = id; } },
    EventEmitter: class EventEmitter { constructor() { this.listeners = []; } event(l) { this.listeners.push(l); return { dispose() {} }; } fire(d) { this.listeners.forEach(l => l(d)); } dispose() { this.listeners = []; } },
    workspace: { getConfiguration: () => ({ get: (k, def) => def }) },
    window: { createOutputChannel: () => ({ appendLine() {}, dispose() {} }) },
    RelativePattern: class RelativePattern { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f }) }
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request) {
    if (request === 'vscode') return 'vscode_mock';
    return originalResolve.apply(this, arguments);
};
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../out/parser');
const { PLSQLOutlineProvider } = require('../out/treeView');

// ---------- 期望表: 根标签(正则) / 必须出现 / 禁止出现(均小写子串匹配) ----------
const GLOBAL_NOT = [
    'legacy_audit', 'legacy_report', 'legacy_reset', 'legacy_touch', 'legacy_purge',
    'legacy_archive', 'legacy_sum', 'purge_orders', 'legacy_get_', 'legacy_set_',
    'legacy_cx_', 'legacy_proc_'
];

const EXPECT = {
    'function/func_simple.fnc':                       { root: /calc_simple_tax/i, must: ['declaration', 'exception', 'c_tax_rate'] },
    'function/func_complex.fnc':                      { root: /func_order_stats/i, must: ['sub program', 'sub_calc_score', 'sub_format_line', 'sub_inner_check', 'exception', 'c_items'] },
    'function/func_long.fnc':                         { root: /fn_long_serial_calc/i, must: ['declaration', 'exception', 'v_pool_0001'] },
    'function/func_long_complex.fnc':                 { root: /fn_long_complex_calc/i, must: ['sub_calc_fn', 'sub_format_fn', 'sub_check_fn', 'exception'] },
    'procedure/proc_simple.prc':                      { root: /proc_sync_customer/i, must: ['declaration', 'exception'] },
    'procedure/proc_complex.prc':                     { root: /proc_migrate_batch/i, must: ['sub program', 'sub_next_id', 'sub_flush', 'sub_verify', 'fwd_write_log', 'exception'] },
    'procedure/proc_long.prc':                        { root: /pr_long_batch_migrate/i, must: ['declaration', 'exception'] },
    'procedure/proc_long_complex.prc':                { root: /pr_long_complex_migrate/i, must: ['sub_calc_pr', 'fwd_prepare', 'exception'] },
    'package_spec/pkg_spec_simple.pks':               { root: /pkg_order_api/i, must: ['declaration', 'get_order_total', 'close_order'] },
    'package_spec/pkg_spec_complex.pks':              { root: /pkg_order_api_complex/i, must: ['get_order_total', 'close_order', 'list_orders', 'validate_and_migrate'] },
    'package_spec/pkg_spec_long.pks':                 { root: /pkg_long_api/i, must: ['get_metric_0001', 'set_metric_0001'] },
    'package_spec/pkg_spec_long_complex.pks':         { root: /pkg_long_api_cx/i, must: ['get_metric_0001'] },
    'package_body/pkg_body_simple.pkb':               { root: /pkg_order_api/i, must: ['get_order_total', 'close_order'] },
    'package_body/pkg_body_complex.pkb':              { root: /pkg_order_api_complex/i, must: ['impl_score', 'impl_format', 'impl_check', 'fwd_validate_order', 'fwd_cache_get'] },
    'package_body/pkg_body_long.pkb':                 { root: /pkg_long_api/i, must: ['pr_impl_0001'] },
    'package_body/pkg_body_long_complex.pkb':         { root: /pkg_long_api_cx/i, must: ['pr_impl_0001', 'pr_cx_'] },
    // 注: 显示层 createGroupedChildren 对触发器唯一的匿名块子节点只提升控制结构,
    // 触发器 DECLARE 区(变量/常量/异常)与匿名块内的嵌套子程序、Exception 叶节点
    // 当前均不在大纲渲染(实际 VS Code 行为, 见 ZCodeTest/README.md 已知显示缺口)。
    'trigger/trg_simple.trg':                         { root: /trg_orders_bi/i, must: ['body'] },
    'trigger/trg_complex.trg':                        { root: /trg_orders_audit/i, must: ['body'] },
    'trigger/trg_long.trg':                           { root: /trg_long_guard/i, must: ['body'] },
    'trigger/trg_long_complex.trg':                   { root: /trg_long_complex_guard/i, must: ['body'] },
    'anonymous/anon_declare_simple_exc.sql':          { root: /anonymous/i, must: ['exception', 'c_step'] },
    'anonymous/anon_declare_simple_noexc.sql':        { root: /anonymous/i, must: [], not: ['exception'] },
    'anonymous/anon_begin_simple_exc.sql':            { root: /anonymous/i, must: ['exception'] },
    'anonymous/anon_begin_simple_noexc.sql':          { root: /anonymous/i, must: [], not: ['exception'] },
    'anonymous/anon_declare_complex.sql':             { root: /anonymous/i, must: ['sub program', 'sub_accum', 'sub_label', 'sub_check', 'exception'] },
    'anonymous/anon_begin_complex.sql':               { root: /anonymous/i, must: ['exception'] },
    'anonymous/anon_declare_long.sql':                { root: /anonymous/i, must: ['exception'] },
    'anonymous/anon_declare_long_complex.sql':        { root: /anonymous/i, must: ['sub_calc_anon', 'exception'] },
    'anonymous/anon_begin_long.sql':                  { root: /anonymous/i, must: ['exception'] },
    'anonymous/anon_begin_long_complex.sql':          { root: /anonymous/i, must: ['exception'] },
    'other_objects/type_object_simple.sql':           { root: /t_address/i, must: [] },
    'other_objects/type_body_simple.sql':             { root: /t_address/i, must: ['to_one_line'] },
    'other_objects/view_simple.sql':                  { root: /v_active_orders/i, must: [], minItems: 1 },
};

const KNOWN_PARSE_FAIL = new Set([
    'package_body/pkg_body_long.pkb',
    'package_body/pkg_body_long_complex.pkb',
]);

const MAX_ITEMS = 30000;

function labelOf(el) {
    return String(el.label || (el.node && el.node.name) || '');
}

(async () => {
    const root = __dirname;
    const files = Object.keys(EXPECT).sort();
    let failed = 0;
    let knownFail = 0;
    const rows = [];

    for (const rel of files) {
        const problems = [];
        const expect = EXPECT[rel];
        const content = fs.readFileSync(path.join(root, rel), 'utf8');

        let parseResult = null;
        let renderMs = 0;
        let itemCount = 0;
        let maxDepth = 0;
        const labels = [];

        try {
            parseResult = await new PLSQLParser().parse(content, rel);

            if (parseResult.metadata.errors.length > 0 || parseResult.nodes.length === 0) {
                throw new Error(`解析失败/无节点: ${parseResult.metadata.errors.map(e => e.message).join(';') || '0 nodes'}`);
            }

            const provider = new PLSQLOutlineProvider();
            provider.dataProvider = { getParseResult: async () => parseResult };

            const t0 = Date.now();
            // 全树遍历: getChildren + getTreeItem 逐元素执行(与 VS Code 惰性展开等价的全量形态)
            const queue = [{ el: undefined, depth: 0 }];
            const seen = new Set();
            while (queue.length > 0 && itemCount < MAX_ITEMS) {
                const { el, depth } = queue.shift();
                const children = await provider.getChildren(el);
                for (const c of children) {
                    if (seen.has(c)) continue;
                    seen.add(c);
                    itemCount++;
                    maxDepth = Math.max(maxDepth, depth + 1);
                    provider.getTreeItem(c); // 必须不抛异常
                    labels.push(labelOf(c));
                    queue.push({ el: c, depth: depth + 1 });
                }
            }
            renderMs = Date.now() - t0;

            if (itemCount < (expect.minItems !== undefined ? expect.minItems : 2)) {
                problems.push(`渲染项过少: ${itemCount}`);
            }
            if (labels.length === 0 || !expect.root.test(labels[0])) {
                problems.push(`根标签不符: "${labels[0]}" !~ ${expect.root}`);
            }
            const dump = labels.join('\n').toLowerCase();
            for (const m of expect.must) {
                if (!dump.includes(m.toLowerCase())) problems.push(`缺少: "${m}"`);
            }
            for (const n of [...(expect.not || []), ...GLOBAL_NOT]) {
                if (dump.includes(n.toLowerCase())) problems.push(`不应出现: "${n}"`);
            }
        } catch (e) {
            problems.push(`异常: ${e.message}`);
        }

        const isKnown = KNOWN_PARSE_FAIL.has(rel);
        let status;
        if (problems.length === 0) {
            status = 'OK';
        } else if (isKnown && problems.every(p => p.startsWith('异常: 解析失败') || p.startsWith('渲染项过少') || p.startsWith('根标签不符'))) {
            status = 'KNOWN-FAIL(currentLevel泄漏, 修复后应转OK)';
            knownFail++;
        } else {
            status = 'FAIL: ' + problems.join(' | ');
            failed++;
        }
        rows.push({ file: rel, items: itemCount, depth: maxDepth, ms: renderMs, status });
    }

    for (const r of rows) {
        console.log(`[${r.status.startsWith('OK') ? 'OK' : r.status.startsWith('KNOWN') ? 'KNOWN' : 'FAIL'}] ${r.file} 渲染项=${r.items} 深度=${r.depth} 耗时=${r.ms}ms`);
        if (!r.status.startsWith('OK') && !r.status.startsWith('KNOWN')) console.log(`       ${r.status}`);
    }
    console.log('----------------------------------------------------------------------');
    console.log(`共 ${rows.length} 个文件; OK=${rows.length - failed - knownFail}, 已知缺陷=${knownFail}, 失败=${failed}`);
    if (failed > 0) process.exitCode = 1;
})();

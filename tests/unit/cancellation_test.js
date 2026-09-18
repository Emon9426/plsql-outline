/**
 * GMLTest: 解析取消支持回归测试（v1.8.0）
 *
 * 背景：v1.8.0 起大文件解析可中断（withProgress cancellable + CancellationToken
 * 鸭子类型传入 parser）。本套件锁定取消契约：
 *  - 已取消的令牌 → parse 抛 ParseCancelledError（不并入 metadata.errors）
 *  - 未取消的令牌 → 正常解析，令牌传递无副作用
 */
const { PLSQLParser, ParseCancelledError } = require('../../out/parser');
const { NodeType } = require('../../out/types');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

const SRC = [
    'CREATE OR REPLACE FUNCTION f RETURN NUMBER IS',
    'BEGIN',
    '    RETURN 1;',
    'END f;'
].join('\n');

async function run() {
    const rec = makeRecorder();

    // Case 1: 已取消令牌 → 抛 ParseCancelledError
    let threw = null;
    try {
        await new PLSQLParser().parse(SRC, 'cancel.fnc', {
            cancellationToken: { isCancellationRequested: true }
        });
    } catch (e) {
        threw = e;
    }
    rec.assert('c1_throws_cancelled', '已取消令牌使 parse 抛出 ParseCancelledError',
        threw instanceof ParseCancelledError,
        threw ? threw.name : 'no throw');

    // Case 2: 未取消令牌 → 正常解析
    const r2 = await new PLSQLParser().parse(SRC, 'ok.fnc', {
        cancellationToken: { isCancellationRequested: false }
    });
    rec.assert('c2_parses_normally', '未取消令牌不影响解析结果',
        r2.nodes.length === 1 && r2.nodes[0].type === NodeType.FUNCTION &&
        r2.metadata.errors.length === 0,
        `nodes=${r2.nodes.length}`);

    // Case 3: 不传令牌 → 行为与旧版一致
    const r3 = await new PLSQLParser().parse(SRC, 'legacy.fnc');
    rec.assert('c3_no_token_ok', '无令牌时行为不变',
        r3.nodes.length === 1 && r3.metadata.errors.length === 0,
        `nodes=${r3.nodes.length}`);

    return { suiteName: 'cancellation_test', cases: rec.cases, parseTime: 0 };
}

module.exports = { run };

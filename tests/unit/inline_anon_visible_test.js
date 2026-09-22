/**
 * GMLTest: 内联匿名块可见分组渲染测试
 *
 * 场景来源: 真实脚本 01_NB_MT110.sql（顶层匿名块, 体内一个大内联 DECLARE..END; 块）
 * 此前 Body 只显示内联块之后的控制结构, 块内全部 IF 被整体隐藏（v1.6.2 设计）。
 *
 * 验证新行为:
 *  - 内联匿名块(非唯一子节点)在宿主 Body 内渲染为可见 "Anonymous Block" 分组,
 *    展开可见其 Declaration / Sub Program / Body(控制结构) / Exception / End
 *  - 唯一子节点形态(触发器主体)代理渲染: 匿名块内容直接挂在宿主下,
 *    无多余嵌套层; 触发器 DECLARE 区/嵌套子程序/Exception 叶子可见
 *  - getParent 显示父链: 块内控制结构的父 = 匿名块的 Body 文件夹;
 *    代理渲染匿名块的分组父 = 宿主单元（reveal 可见性判断依赖此链）
 *  - 匿名块分组仍不进入 Sub Program 文件夹（v1.6.2 回归保持）
 */
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class { constructor(l, c) { this.label = l; this.collapsibleState = c; } },
    ThemeIcon: class { constructor(id) { this.id = id; } },
    MarkdownString: class MarkdownString { constructor(s) { this.value = s || ''; } appendMarkdown(s) { this.value += s; return this; } },
    EventEmitter: class { constructor() { this.l = []; } event(x) { this.l.push(x); return { dispose() {} }; } fire(d) { this.l.forEach(x => x(d)); } dispose() { this.l = []; } },
    workspace: { getConfiguration: () => ({ get: (k, d) => d }) },
    window: { createOutputChannel: () => ({ appendLine() {}, dispose() {} }) },
    RelativePattern: class { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f }) }
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (r) { if (r === 'vscode') return 'vscode_mock'; return originalResolve.apply(this, arguments); };
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../../out/parser');
const { PLSQLOutlineProvider } = require('../../out/treeView');
const { NodeType } = require('../../out/types');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}
function makeProvider(parseResult) {
    const provider = new PLSQLOutlineProvider();
    provider.dataProvider = { getParseResult: async () => parseResult };
    return provider;
}
/** 递归收集一棵渲染子树的所有标签 */
async function collectLabels(provider, el, out) {
    out.push(String(el.label));
    const children = await provider.getChildren(el);
    for (const c of children) {
        await collectLabels(provider, c, out);
    }
}

async function run() {
    const rec = makeRecorder();
    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);

    // ---- Case 1: 真实脚本形态（01_NB_MT110）——顶层匿名块 + 大内联块 ----
    const src1 = `DECLARE
    v_a VARCHAR2(10);
    v_b NUMBER;
BEGIN
    UPDATE t SET x = 1;
    DECLARE
        v_local NUMBER;
        err_ind VARCHAR2(1) := 'N';
    BEGIN
        IF NVL(err_ind, 'N') <> 'Y' THEN
            IF 1 > 0 THEN
                v_local := 1;
            END IF;
        ELSE
            err_ind := 'N';
        END IF;
        FOR r IN (SELECT 1 FROM dual) LOOP
            v_local := v_local + 1;
        END LOOP;
    END;
    IF is_ok = 'Y' THEN
        NULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        IF is_ok = 'Y' THEN
            NULL;
        END IF;
        RAISE;
END;`;
    const r1 = await parser.parse(src1, 'nb_mt110_repro.sql');
    rec.assert('c1_parse_clean', 'Case1 解析零错误', r1.metadata.errors.length === 0, `errors=${r1.metadata.errors.length}`);
    const p1 = makeProvider(r1);
    const root1 = (await p1.getChildren())[0];
    const lvl1 = await p1.getChildren(root1);
    const body1 = lvl1.find(c => c.isProgramGroup && c.programGroupKind === 'body');
    rec.assert('c1_body_exists', '外层块有 Body 文件夹', !!body1, lvl1.map(c => c.label).join(','));
    if (body1) {
        const bodyChildren = await p1.getChildren(body1);
        const labels1 = bodyChildren.map(c => c.label);
        rec.assert('c1_body_count', 'Body 含 3 项: 匿名块分组 + IF + IF',
            labels1.length === 3, labels1.join(','));
        rec.assert('c1_anon_group_visible', '内联匿名块作为可见分组渲染',
            labels1[0] === 'Anonymous Block', labels1.join(','));
        const anonItem = bodyChildren.find(c => c.node && c.node.type === NodeType.ANONYMOUS_BLOCK);
        rec.assert('c1_anon_expandable', '匿名块分组可展开', !!anonItem && (await p1.getChildren(anonItem)).length > 0,
            labels1.join(','));
        if (anonItem) {
            const anonLabels = [];
            await collectLabels(p1, anonItem, anonLabels);
            const dump = anonLabels.join('\n').toLowerCase();
            rec.assert('c1_anon_declaration', '分组内含 Declaration（v_local/err_ind）',
                dump.includes('declaration') && dump.includes('v_local') && dump.includes('err_ind'),
                anonLabels.slice(0, 8).join(','));
            rec.assert('c1_anon_body_if', '分组 Body 含内联块的全部 IF（含嵌套 IF）',
                (dump.match(/\bif\b/g) || []).length >= 2, anonLabels.join(','));
            rec.assert('c1_anon_body_for', '分组 Body 含 FOR 循环', dump.includes('for'), anonLabels.join(','));
        }
        // getParent: 块内控制结构的显示父级 = 匿名块的 Body 文件夹（非外层 Body）
        const innerIf = bodyChildren.length > 0 && anonItem
            ? (r1.nodes[0].children.find(c => c.type === NodeType.ANONYMOUS_BLOCK)).children.find(c => c.type === NodeType.IF_STATEMENT)
            : null;
        if (innerIf) {
            const parentOfIf = await p1.getParent({ node: innerIf, isStructureBlock: false, label: 'IF', line: innerIf.declarationLine });
            rec.assert('c1_parent_chain', '块内 IF 的显示父级为匿名块的 Body 文件夹',
                !!parentOfIf && parentOfIf.isProgramGroup && parentOfIf.programGroupKind === 'body' &&
                parentOfIf.parentNode === r1.nodes[0].children.find(c => c.type === NodeType.ANONYMOUS_BLOCK),
                parentOfIf ? `${parentOfIf.label}` : 'undefined');
        }
    }

    // ---- Case 2: 过程体内联匿名块不进入 Sub Program 文件夹（v1.6.2 回归保持）----
    const src2 = `CREATE OR REPLACE PROCEDURE do_migrate IS
    v_out NUMBER;
BEGIN
    v_out := 1;
    DECLARE
        v_in NUMBER;
    BEGIN
        v_in := v_out * 2;
        IF v_in > 0 THEN
            v_in := 0;
        END IF;
    END;
    v_out := v_out + 1;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END do_migrate;`;
    const r2 = await parser.parse(src2, 'do_migrate.prc');
    rec.assert('c2_parse_clean', 'Case2 解析零错误', r2.metadata.errors.length === 0, `errors=${r2.metadata.errors.length}`);
    const p2 = makeProvider(r2);
    const proc2 = (await p2.getChildren())[0];
    const lvl2 = await p2.getChildren(proc2);
    const sub2 = lvl2.find(c => c.isProgramGroup && c.programGroupKind === 'subprogram');
    rec.assert('c2_no_subprogram_folder', '无 Sub Program 文件夹（匿名块不在其中）', !sub2, lvl2.map(c => c.label).join(','));
    const body2 = lvl2.find(c => c.isProgramGroup && c.programGroupKind === 'body');
    rec.assert('c2_body_has_anon', '过程 Body 含匿名块分组', !!body2 &&
        (await p2.getChildren(body2)).some(c => c.label === 'Anonymous Block'),
        body2 ? (await p2.getChildren(body2)).map(c => c.label).join(',') : 'no body');

    // ---- Case 3: 触发器主体代理渲染（唯一匿名块子节点）----
    const src3 = `CREATE OR REPLACE TRIGGER trg_guard
BEFORE INSERT ON orders
FOR EACH ROW
DECLARE
    v_user VARCHAR2(30);
    c_max  CONSTANT NUMBER := 50;
    FUNCTION fmt_user(p VARCHAR2) RETURN VARCHAR2 IS
    BEGIN
        RETURN SUBSTR(p, 1, c_max);
    END;
BEGIN
    IF :new.created_by IS NULL THEN
        :new.created_by := USER;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;`;
    const r3 = await parser.parse(src3, 'trg_guard.trg');
    rec.assert('c3_parse_clean', 'Case3 解析零错误', r3.metadata.errors.length === 0, `errors=${r3.metadata.errors.length}`);
    const p3 = makeProvider(r3);
    const trg3 = (await p3.getChildren())[0];
    const lvl3 = await p3.getChildren(trg3);
    const labels3 = lvl3.map(c => c.label);
    rec.assert('c3_no_anon_level', '触发器下无额外 Anonymous Block 层', !labels3.includes('Anonymous Block'), labels3.join(','));
    rec.assert('c3_declaration', '触发器 DECLARE 区可见（代理渲染）', lvl3.some(c => c.isDeclarationSection), labels3.join(','));
    const all3 = [];
    await collectLabels(p3, trg3, all3);
    const dump3 = all3.join('\n').toLowerCase();
    rec.assert('c3_decl_vars', '触发器变量 v_user/c_max 可见',
        dump3.includes('v_user') && dump3.includes('c_max'), all3.slice(0, 10).join(','));
    rec.assert('c3_nested_func', '触发器嵌套子程序 fmt_user 可见', dump3.includes('fmt_user'), all3.slice(0, 10).join(','));
    rec.assert('c3_exception', '触发器 EXCEPTION 叶子可见', dump3.includes('exception'), labels3.join(','));
    rec.assert('c3_body_if', '触发器 Body 含 IF', dump3.includes('body') && dump3.includes('if'), labels3.join(','));
    // getParent: 代理渲染匿名块的 Body 文件夹 → 显示父级 = 触发器（非幽灵匿名块）
    const anon3 = r3.nodes[0].children.find(c => c.type === NodeType.ANONYMOUS_BLOCK);
    if (anon3) {
        const bodyGroupOfAnon = {
            isStructureBlock: false, isProgramGroup: true, programGroupKind: 'body',
            parentNode: anon3, label: 'Body', line: anon3.beginLine || 0
        };
        const parentOfBody = await p3.getParent(bodyGroupOfAnon);
        rec.assert('c3_parent_chain', '代理渲染的 Body 文件夹显示父级 = 触发器',
            !!parentOfBody && parentOfBody.node === r3.nodes[0],
            parentOfBody ? String(parentOfBody.label) : 'undefined');
    }

    // ---- Case 4: 代理渲染边界——宿主无声明、体=单一内联块、自带异常区 ----
    const src4 = `CREATE OR REPLACE PROCEDURE bare_wrap IS
BEGIN
    DECLARE
        v_tmp NUMBER;
    BEGIN
        v_tmp := 1;
        IF v_tmp > 0 THEN
            v_tmp := 0;
        END IF;
    END;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END bare_wrap;`;
    const r4 = await parser.parse(src4, 'bare_wrap.prc');
    rec.assert('c4_parse_clean', 'Case4 解析零错误', r4.metadata.errors.length === 0, `errors=${r4.metadata.errors.length}`);
    const p4 = makeProvider(r4);
    const proc4 = (await p4.getChildren())[0];
    const all4 = [];
    await collectLabels(p4, proc4, all4);
    const excCount = all4.filter(l => l === 'EXCEPTION').length;
    const endCount = all4.filter(l => l === 'END').length;
    rec.assert('c4_host_leaves_kept', '代理渲染保留宿主自身 EXCEPTION/END 叶子',
        excCount === 1 && endCount === 1, all4.join(','));
    rec.assert('c4_anon_content', '代理渲染内联块内容（v_tmp/IF 可见）',
        all4.join('\n').toLowerCase().includes('v_tmp') &&
        all4.join('\n').toLowerCase().includes('body'), all4.join(','));

    return { suiteName: 'inline_anon_visible_test', cases: rec.cases, parseTime: 0 };
}

module.exports = { run };

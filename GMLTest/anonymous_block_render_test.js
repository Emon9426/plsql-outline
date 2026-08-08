/**
 * GMLTest: 内联匿名块渲染回归测试
 *
 * 验证 OCR 代码审查指出的 Bug 已修复：
 *  过程体内的内联 DECLARE...BEGIN...END; 块（ANONYMOUS_BLOCK 节点）
 *  不再被当作 Sub Program 的可见子项渲染。
 *
 * 根因（OCR）：createGroupedChildren 的 else 分支把 ANONYMOUS_BLOCK 塞入
 *  subprogramChildren；getChildren subprogram 渲染分支无兜底过滤。
 *  解析层 handleDeclareStatement 保留建模（维持 BEGIN/END 配对）。
 */
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class { constructor(l, c) { this.label = l; this.collapsibleState = c; } },
    ThemeIcon: class { constructor(id) { this.id = id; } },
    EventEmitter: class { constructor() { this.l = []; } event(x) { this.l.push(x); return { dispose() {} }; } fire(d) { this.l.forEach(x => x(d)); } dispose() { this.l = []; } },
    workspace: { getConfiguration: () => ({ get: (k, d) => d }) },
    window: { createOutputChannel: () => ({ appendLine() {}, dispose() {} }) },
    RelativePattern: class { constructor(b, p) { this.base = b; this.pattern = p; } },
    Uri: { file: (f) => ({ fsPath: f }) }
};
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (r) { if (r === 'vscode') return 'vscode_mock'; return originalResolve.apply(this, arguments); };
require.cache['vscode_mock'] = { exports: mockVscode };

const { PLSQLParser } = require('../out/parser');
const { PLSQLOutlineProvider } = require('../out/treeView');
const { NodeType } = require('../out/types');

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

async function run() {
    const rec = makeRecorder();
    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);

    // 含内联匿名块的包（过程体内 DECLARE...BEGIN...END;）
    const src = `CREATE OR REPLACE PACKAGE BODY anon_test_pkg IS
  PROCEDURE do_work(p IN NUMBER) IS
    v_outer NUMBER;
  BEGIN
    v_outer := p;
    DECLARE
      v_inner NUMBER;
    BEGIN
      v_inner := v_outer * 2;
      IF v_inner > 0 THEN
        v_inner := 0;
      END IF;
    END;
    v_outer := v_outer + 1;
  END do_work;
END anon_test_pkg;
/`;
    const r = await parser.parse(src, 'anon_test_pkg.pkb');
    rec.assert('parse_clean', '解析零错误', r.metadata.errors.length === 0, `errors=${r.metadata.errors.length}`);

    const provider = makeProvider(r);
    const topItems = await provider.getChildren();
    const pkgItem = topItems[0];
    const pkgChildren = await provider.getChildren(pkgItem);

    // 找到 do_work（应直接在包下显示，不在 Sub Program 文件夹）
    const doWork = pkgChildren.find(c => c.node && c.node.name === 'do_work');
    rec.assert('dowork_found', 'do_work 直接在包下显示', !!doWork, pkgChildren.map(c => c.label).join(','));

    if (doWork) {
        const dwChildren = await provider.getChildren(doWork);
        const dwLabels = dwChildren.map(c => c.label);

        // 关键断言：不应有 Sub Program 文件夹（原 Bug：匿名块进入此处）
        const hasSubProgram = dwChildren.some(c => c.isProgramGroup && c.programGroupKind === 'subprogram');
        rec.assert('no_subprogram_folder', 'do_work 下无 Sub Program 文件夹（匿名块不再误入）',
            !hasSubProgram, dwLabels.join(','));

        // 关键断言：不应有任何匿名块节点可见
        const hasAnonBlock = dwChildren.some(c => c.node && c.node.type === NodeType.ANONYMOUS_BLOCK);
        rec.assert('no_anon_block_visible', 'do_work 下无可见的 Anonymous Block 节点',
            !hasAnonBlock, dwLabels.join(','));

        // do_work 应有 Declaration（v_outer）
        rec.assert('dowork_has_declaration', 'do_work 有 Declaration', dwChildren.some(c => c.isDeclarationSection), dwLabels.join(','));

        // 确认解析层仍建模了匿名块（仅展示层跳过）——在解析树中应存在
        const parsedAnon = doWork.node.children.find(c => c.type === NodeType.ANONYMOUS_BLOCK);
        rec.assert('parsed_anon_exists', '解析层仍建模内联匿名块（维持 BEGIN/END 配对）',
            !!parsedAnon, '解析树无匿名块');
    }

    // 触发器场景：触发器主体被解析为单一匿名块，应提升其子项（不显示空触发器）
    console.log('--- 触发器主体提升 ---');
    const trgSrc = `CREATE OR REPLACE TRIGGER trg_test
BEFORE INSERT ON t
FOR EACH ROW
DECLARE
  v_user VARCHAR2(30);
BEGIN
  IF :new.id IS NULL THEN
    :new.id := 0;
  END IF;
END;
/`;
    const trgR = await parser.parse(trgSrc, 'trg_test.trg');
    rec.assert('trg_parse_clean', '触发器解析零错误', trgR.metadata.errors.length === 0, `errors=${trgR.metadata.errors.length}`);
    const trgProvider = makeProvider(trgR);
    const trgTop = await trgProvider.getChildren();
    const trgItem = trgTop[0];
    const trgChildren = await trgProvider.getChildren(trgItem);
    // 触发器展开后应有内容（IF 控制结构从单一匿名块提升）
    rec.assert('trg_expandable', '触发器可展开（含子节点）', trgChildren.length > 0, trgChildren.map(c => c.label).join(','));

    return { suiteName: 'anonymous_block_render_test', cases: rec.cases, parseTime: 0 };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log(`\n=== GMLTest: anonymous_block_render ===`);
        cases.forEach(c => console.log(`  ${c.passed ? '✓' : '✗'} ${c.name}: ${c.desc}${c.passed ? '' : ' [' + c.actual + ']'}`));
        console.log(`\n结果: ${passed}/${cases.length} 通过`);
        process.exit(passed === cases.length ? 0 : 1);
    }).catch(err => { console.error('测试异常:', err); process.exit(1); });
}

module.exports = { run };

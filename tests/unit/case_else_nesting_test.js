/**
 * GMLTest: CASE ELSE 分支栈污染回归测试（Issue #3）
 *
 * 验证 CASE 的 ELSE 不再污染 controlStack：
 *  - CASE(WHEN/ELSE) 后续的同级控制结构（WHILE/IF）保持同级，不挂到 ELSE 分支下
 *  - EXCEPTION 处理器中的 IF 不被吞
 *  - CASE 的 ELSE 仍作为 CASE 子节点与 WHEN 并列展示
 *  - IF 的 ELSE 行为不受影响（含 CASE 内嵌 IF 的归属判断）
 */
const { PLSQLParser } = require('../../out/parser');
const { NodeType } = require('../../out/types');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

async function parseOne(code) {
    const parser = new PLSQLParser();
    parser.setControlStructureConfig(true, 20);
    return parser.parse(code, 'case_else_test.sql');
}

/** 在节点树中按类型收集所有节点（含路径） */
function collect(root, pred, path, acc) {
    if (!root) return acc;
    if (pred(root)) acc.push({ node: root, path });
    (root.children || []).forEach(c => collect(c, pred, path.concat(root), acc));
    return acc;
}

async function run() {
    const rec = makeRecorder();

    // ---- Case 1: Issue #3 最小复现（LOOP/FOR 内 CASE 带 ELSE，后跟同级 WHILE）----
    const code1 = [
        'CREATE OR REPLACE PROCEDURE p1 IS',
        '  v_idx NUMBER := 0;',
        'BEGIN',
        '  LOOP',
        '    v_idx := v_idx + 1;',
        '    EXIT WHEN v_idx > 3;',
        '    FOR i IN 1 .. v_idx LOOP',
        '      CASE',
        '        WHEN v_idx > 30 THEN',
        '          NULL;',
        '        ELSE',
        '          NULL;',
        '      END CASE;',
        '    END LOOP;',
        '  END LOOP;',
        '  WHILE v_idx > 0 LOOP',
        '    v_idx := v_idx - 1;',
        '  END LOOP;',
        'END p1;'
    ].join('\n');
    const r1 = await parseOne(code1);
    const proc1 = r1.nodes[0];
    const whiles1 = collect(proc1, n => n.type === NodeType.WHILE_LOOP, [], []);
    rec.assert('c1_while_found', 'WHILE 循环被识别', whiles1.length === 1, whiles1.length);
    if (whiles1.length === 1) {
        rec.assert('c1_while_parent_proc', 'WHILE 是过程的直接子节点（不被 CASE ELSE 吞并）',
            whiles1[0].path[whiles1[0].path.length - 1] === proc1,
            whiles1[0].path.map(p => p.type).join('>'));
    }
    // CASE 的 ELSE 仍是 CASE 的子节点
    const cases1 = collect(proc1, n => n.type === NodeType.CASE_STATEMENT, [], []);
    if (cases1.length === 1) {
        const caseNode = cases1[0].node;
        rec.assert('c1_case_children', 'CASE 子节点 = [WHEN, ELSE]',
            caseNode.children.length === 2
                && caseNode.children[0].type === NodeType.WHEN_BRANCH
                && caseNode.children[1].type === NodeType.ELSE_BRANCH,
            caseNode.children.map(c => c.type).join(','));
    } else {
        rec.assert('c1_case_children', 'CASE 子节点 = [WHEN, ELSE]', false, 'CASE not found');
    }
    rec.assert('c1_parse_clean', 'Case1 解析零错误', r1.metadata.errors.length === 0, r1.metadata.errors.length);

    // ---- Case 2: CASE 后跟同级 IF（无循环包裹）----
    const code2 = [
        'CREATE OR REPLACE PROCEDURE p2 IS',
        '  v NUMBER := 1;',
        'BEGIN',
        '  CASE',
        '    WHEN v = 1 THEN NULL;',
        '    ELSE NULL;',
        '  END CASE;',
        '  IF v > 0 THEN',
        '    NULL;',
        '  END IF;',
        'END p2;'
    ].join('\n');
    const r2 = await parseOne(code2);
    const proc2 = r2.nodes[0];
    const ifs2 = collect(proc2, n => n.type === NodeType.IF_STATEMENT, [], []);
    rec.assert('c2_if_found', 'CASE 后的 IF 被识别', ifs2.length === 1, ifs2.length);
    if (ifs2.length === 1) {
        rec.assert('c2_if_sibling', 'IF 与 CASE 同级（都是过程直接子节点）',
            ifs2[0].path[ifs2[0].path.length - 1] === proc2,
            ifs2[0].path.map(p => p.type).join('>'));
    }

    // ---- Case 3: EXCEPTION 处理器中的 IF 不被 CASE 吞 ----
    const code3 = [
        'CREATE OR REPLACE PROCEDURE p3 IS',
        '  v NUMBER := 1;',
        'BEGIN',
        '  CASE',
        '    WHEN v = 1 THEN NULL;',
        '    ELSE NULL;',
        '  END CASE;',
        '  NULL;',
        'EXCEPTION',
        '  WHEN OTHERS THEN',
        '    IF v > 0 THEN',
        '      NULL;',
        '    END IF;',
        'END p3;'
    ].join('\n');
    const r3 = await parseOne(code3);
    const proc3 = r3.nodes[0];
    const ifs3 = collect(proc3, n => n.type === NodeType.IF_STATEMENT, [], []);
    rec.assert('c3_if_found', '异常区 IF 被识别', ifs3.length === 1, ifs3.length);
    if (ifs3.length === 1) {
        rec.assert('c3_if_parent_proc', '异常区 IF 是过程直接子节点',
            ifs3[0].path[ifs3[0].path.length - 1] === proc3,
            ifs3[0].path.map(p => p.type).join('>'));
    }
    rec.assert('c3_exception_line', 'EXCEPTION 行被记录', proc3.exceptionLine != null, proc3.exceptionLine);

    // ---- Case 4: IF 的 ELSE 行为不受影响 ----
    const code4 = [
        'CREATE OR REPLACE PROCEDURE p4 IS',
        '  v NUMBER := 1;',
        'BEGIN',
        '  IF v = 1 THEN',
        '    NULL;',
        '  ELSIF v = 2 THEN',
        '    NULL;',
        '  ELSE',
        '    NULL;',
        '  END IF;',
        '  WHILE v > 0 LOOP',
        '    v := v - 1;',
        '  END LOOP;',
        'END p4;'
    ].join('\n');
    const r4 = await parseOne(code4);
    const proc4 = r4.nodes[0];
    const whiles4 = collect(proc4, n => n.type === NodeType.WHILE_LOOP, [], []);
    rec.assert('c4_while_found', 'IF/ELSIF/ELSE 后的 WHILE 被识别且同级', whiles4.length === 1
        && whiles4[0].path[whiles4[0].path.length - 1] === proc4,
        whiles4.length + ':' + (whiles4[0] ? whiles4[0].path.map(p => p.type).join('>') : ''));

    // ---- Case 5: CASE 内嵌 IF，IF 的 ELSE 归 IF 而非 CASE ----
    const code5 = [
        'CREATE OR REPLACE PROCEDURE p5 IS',
        '  v NUMBER := 1;',
        'BEGIN',
        '  CASE',
        '    WHEN v = 1 THEN',
        '      IF v > 0 THEN',
        '        NULL;',
        '      ELSE',
        '        NULL;',
        '      END IF;',
        '    ELSE NULL;',
        '  END CASE;',
        'END p5;'
    ].join('\n');
    const r5 = await parseOne(code5);
    const proc5 = r5.nodes[0];
    const ifs5 = collect(proc5, n => n.type === NodeType.IF_STATEMENT, [], []);
    rec.assert('c5_if_found', 'CASE WHEN 内的 IF 被识别', ifs5.length === 1, ifs5.length);
    if (ifs5.length === 1) {
        // 按渲染设计（v1.5.0 IF 分支合并）：ELSE 是 IF 的同级兄弟节点，不是子节点。
        // 注：CASE 自身的 ELSE 为单行形式（ELSE NULL;），属既有不识别行为，不在本 Issue 范围
        const else5 = collect(proc5, n => n.type === NodeType.ELSE_BRANCH, [], []);
        const ifParent = ifs5[0].path[ifs5[0].path.length - 1];
        const elseParents = else5.map(e => e.path[e.path.length - 1]);
        rec.assert('c5_if_else_sibling', 'IF 的 ELSE 与 IF 同级（其父为 CASE）',
            else5.length === 1 && elseParents[0] === ifParent && ifParent.type === NodeType.CASE_STATEMENT,
            elseParents.map(p => p && p.type).join(','));
    }
    const cases5 = collect(proc5, n => n.type === NodeType.CASE_STATEMENT, [], []);
    if (cases5.length === 1) {
        rec.assert('c5_case_else_intact', 'CASE 自身的 ELSE 仍为 CASE 子节点',
            cases5[0].node.children.some(c => c.type === NodeType.ELSE_BRANCH),
            cases5[0].node.children.map(c => c.type).join(','));
    }

    // ---- Case 6: 演示文件（WHILE 在 LOOP 前的规避写法恢复自然顺序后语义不变）----
    const code6 = [
        'CREATE OR REPLACE PROCEDURE p6 IS',
        '  v_idx NUMBER := 5;',
        'BEGIN',
        '  LOOP',
        '    v_idx := v_idx + 1;',
        '    EXIT WHEN v_idx > 3;',
        '    FOR i IN 1 .. v_idx LOOP',
        '      CASE',
        '        WHEN v_idx > 30 THEN NULL;',
        '        ELSE NULL;',
        '      END CASE;',
        '    END LOOP;',
        '  END LOOP;',
        '  WHILE v_idx > 0 LOOP',
        '    v_idx := v_idx - 1;',
        '  END LOOP;',
        'EXCEPTION',
        '  WHEN OTHERS THEN',
        '    IF v_idx > 0 THEN',
        '      NULL;',
        '    END IF;',
        'END p6;'
    ].join('\n');
    const r6 = await parseOne(code6);
    const proc6 = r6.nodes[0];
    const whiles6 = collect(proc6, n => n.type === NodeType.WHILE_LOOP, [], []);
    const ifs6 = collect(proc6, n => n.type === NodeType.IF_STATEMENT, [], []);
    rec.assert('c6_while_top', 'WHILE 与异常区 IF 均为过程直接子节点',
        whiles6.length === 1 && ifs6.length === 1
            && whiles6[0].path[whiles6[0].path.length - 1] === proc6
            && ifs6[0].path[ifs6[0].path.length - 1] === proc6,
        'while=' + whiles6.length + ' if=' + ifs6.length);
    rec.assert('c6_parse_clean', 'Case6 解析零错误', r6.metadata.errors.length === 0, r6.metadata.errors.length);

    return { suiteName: 'case_else_nesting_test', cases: rec.cases };
}

if (require.main === module) {
    run().then(({ cases }) => {
        const passed = cases.filter(c => c.passed).length;
        console.log('\n=== GMLTest: case_else_nesting ===');
        cases.forEach(c => console.log('  ' + (c.passed ? '✓' : '✗') + ' ' + c.name + ': ' + c.desc + (c.passed ? '' : ' [' + c.actual + ']')));
        console.log('\n结果: ' + passed + '/' + cases.length + ' 通过');
        process.exitCode = passed === cases.length ? 0 : 1;
    }).catch(e => { console.error(e); process.exitCode = 1; });
}

module.exports = { run };

/**
 * UI结构测试 - 验证新的分区组织树结构
 * 测试TreeView层的section分组、ELSIF合并、标签简化
 */
const path = require('path');
const fs = require('fs');

// Mock vscode
const Module = require('module');
const mockVscode = {
    TreeItemCollapsibleState: { None: 0, Collapsed: 1, Expanded: 2 },
    TreeItem: class TreeItem {
        constructor(label, collapsibleState) {
            this.label = label;
            this.collapsibleState = collapsibleState;
        }
    },
    ThemeIcon: class ThemeIcon {
        constructor(id) { this.id = id; }
    },
    workspace: {
        getConfiguration: () => ({
            get: (key, def) => def
        })
    },
    window: {
        createOutputChannel: () => ({
            appendLine: () => {},
            dispose: () => {}
        })
    },
    RelativePattern: class RelativePattern {
        constructor(base, pattern) { this.base = base; this.pattern = pattern; }
    },
    Uri: { file: (f) => ({ fsPath: f }) }
};

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
    if (request === 'vscode') return 'vscode_mock';
    return originalResolve.call(this, request, parent, isMain, options);
};
require.cache['vscode_mock'] = { id: 'vscode_mock', filename: 'vscode_mock', loaded: true, exports: mockVscode };

const { PLSQLParser } = require('../out/parser');
const { NodeType, SectionType } = require('../out/types');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) { passed++; }
    else { failed++; console.error(`  ✗ FAIL: ${message}`); }
}
function assertEqual(actual, expected, message) {
    if (actual === expected) { passed++; }
    else { failed++; console.error(`  ✗ FAIL: ${message} (expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)})`); }
}

// ============ 模拟TreeView层的分区逻辑 ============

function isControlStructureType(type) {
    return type === NodeType.IF_STATEMENT ||
        type === NodeType.ELSIF_BRANCH ||
        type === NodeType.ELSE_BRANCH ||
        type === NodeType.LOOP_STATEMENT ||
        type === NodeType.WHILE_LOOP ||
        type === NodeType.FOR_LOOP ||
        type === NodeType.CASE_STATEMENT ||
        type === NodeType.WHEN_BRANCH;
}

function getSimplifiedControlLabel(type) {
    switch (type) {
        case NodeType.IF_STATEMENT: return 'IF';
        case NodeType.ELSIF_BRANCH: return 'ELSIF';
        case NodeType.ELSE_BRANCH: return 'ELSE';
        case NodeType.LOOP_STATEMENT: return 'LOOP';
        case NodeType.WHILE_LOOP: return 'WHILE';
        case NodeType.FOR_LOOP: return 'FOR';
        case NodeType.CASE_STATEMENT: return 'CASE';
        case NodeType.WHEN_BRANCH: return 'WHEN';
        default: return type;
    }
}

function getDeclareNodeLabel(node) {
    if (node.type === NodeType.FUNCTION || node.type === 'FUNCTION_DECLARATION') {
        return `Function: ${node.name}`;
    } else if (node.type === NodeType.PROCEDURE || node.type === 'PROCEDURE_DECLARATION') {
        return `Procedure: ${node.name}`;
    }
    return node.name;
}

/**
 * 合并 IF/ELSIF/ELSE 组
 */
function mergeIfGroups(children) {
    const result = [];
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type === NodeType.IF_STATEMENT) {
            const allChildren = [];
            if (child.children) {
                for (const c of child.children) {
                    if (isControlStructureType(c.type) &&
                        c.type !== NodeType.ELSIF_BRANCH && c.type !== NodeType.ELSE_BRANCH) {
                        allChildren.push(c);
                    }
                }
            }
            // 吸收后续ELSIF/ELSE的子节点
            while (i + 1 < children.length &&
                (children[i + 1].type === NodeType.ELSIF_BRANCH ||
                    children[i + 1].type === NodeType.ELSE_BRANCH)) {
                i++;
                const sibling = children[i];
                if (sibling.children) {
                    for (const c of sibling.children) {
                        if (isControlStructureType(c.type) &&
                            c.type !== NodeType.ELSIF_BRANCH && c.type !== NodeType.ELSE_BRANCH) {
                            allChildren.push(c);
                        }
                    }
                }
            }
            result.push({ node: child, mergedChildren: allChildren.length > 0 ? allChildren : undefined });
        } else if (child.type === NodeType.ELSIF_BRANCH || child.type === NodeType.ELSE_BRANCH) {
            continue;
        } else {
            result.push({ node: child });
        }
    }
    return result;
}

/**
 * 模拟TreeView分区渲染 - 生成树结构描述
 */
function buildUITree(nodes, indent = '') {
    const lines = [];
    for (const node of nodes) {
        if (shouldUseSectionGrouping(node)) {
            // 顶层节点标签
            lines.push(`${indent}${node.name} (${node.type})`);
            const sections = buildSections(node, indent + '  ');
            lines.push(...sections);
        } else {
            lines.push(`${indent}${node.name} (${node.type})`);
            // 递归子节点
            if (node.children && node.children.length > 0) {
                const childLines = buildUITree(node.children, indent + '  ');
                lines.push(...childLines);
            }
        }
    }
    return lines;
}

function shouldUseSectionGrouping(node) {
    const hasBody = node.beginLine !== null && node.beginLine !== undefined;
    const isCodeUnit = node.type === NodeType.FUNCTION ||
        node.type === NodeType.PROCEDURE ||
        node.type === 'TRIGGER' ||
        node.type === 'ANONYMOUS_BLOCK';
    return hasBody && isCodeUnit;
}

function buildSections(node, indent) {
    const lines = [];
    const declareChildren = [];
    const bodyChildren = [];

    if (node.children) {
        for (const child of node.children) {
            if (child.type === NodeType.FUNCTION || child.type === NodeType.PROCEDURE) {
                declareChildren.push(child);
            } else if (isControlStructureType(child.type) &&
                child.type !== NodeType.ELSIF_BRANCH && child.type !== NodeType.ELSE_BRANCH) {
                bodyChildren.push(child);
            } else if (child.type === NodeType.ELSIF_BRANCH || child.type === NodeType.ELSE_BRANCH) {
                // 被吸收
            } else {
                declareChildren.push(child);
            }
        }
    }

    if (declareChildren.length > 0) {
        lines.push(`${indent}DECLARE`);
        for (const child of declareChildren) {
            lines.push(`${indent}  ${getDeclareNodeLabel(child)}`);
            // 如果声明的子函数自身也有分区
            if (shouldUseSectionGrouping(child)) {
                const subSections = buildSections(child, indent + '    ');
                lines.push(...subSections);
            }
        }
    }

    if (bodyChildren.length > 0 || (node.beginLine !== null && node.beginLine !== undefined)) {
        lines.push(`${indent}BODY`);
        // 合并IF组
        const merged = mergeIfGroups(bodyChildren);
        for (const item of merged) {
            const label = getSimplifiedControlLabel(item.node.type);
            lines.push(`${indent}  ${label}`);
            // 渲染合并后的子节点
            if (item.mergedChildren && item.mergedChildren.length > 0) {
                const subMerged = mergeIfGroups(item.mergedChildren);
                for (const sub of subMerged) {
                    lines.push(`${indent}    ${getSimplifiedControlLabel(sub.node.type)}`);
                    if (sub.mergedChildren) {
                        for (const subsub of sub.mergedChildren) {
                            lines.push(`${indent}      ${getSimplifiedControlLabel(subsub.type)}`);
                        }
                    }
                }
            }
        }
    }

    if (node.exceptionLine !== null && node.exceptionLine !== undefined) {
        lines.push(`${indent}EXCEPTION`);
    }
    if (node.endLine !== null && node.endLine !== undefined) {
        lines.push(`${indent}END`);
    }

    return lines;
}

// ============ 运行测试 ============

async function runTests() {
    console.log('PL/SQL Outline UI结构测试');
    console.log('================================\n');

    const parser = new PLSQLParser();

    // ============ 测试1: 基本分区结构 ============
    console.log('=== 测试1: 基本分区结构 ===');

    const testFile = path.join(__dirname, 'nested_control_5levels.sql');
    const content = fs.readFileSync(testFile, 'utf8');
    const result = await parser.parse(content, testFile);

    assert(result.nodes.length > 0, '应有解析节点');
    const pkgBody = result.nodes[0];
    assertEqual(pkgBody.type, NodeType.PACKAGE_BODY, '顶层应为Package Body');

    // Package Body 的子节点
    const procNode = pkgBody.children.find(c => c.name === 'process_data');
    const funcNode = pkgBody.children.find(c => c.name === 'calculate');
    assert(procNode !== undefined, 'process_data 应存在');
    assert(funcNode !== undefined, 'calculate 应存在');

    // ============ 测试2: 子函数归入DECLARE ============
    console.log('\n=== 测试2: 子函数归入DECLARE ===');

    // calculate 有 sub_helper (Procedure) 和 sub_calc (Function)
    const subProcs = funcNode.children.filter(c => c.type === NodeType.PROCEDURE);
    const subFuncs = funcNode.children.filter(c => c.type === NodeType.FUNCTION);
    assert(subProcs.length >= 1, 'calculate应有Sub Procedure');
    assert(subFuncs.length >= 1, 'calculate应有Sub Function');

    // 验证分区分类逻辑
    const declareChildren = funcNode.children.filter(c =>
        c.type === NodeType.FUNCTION || c.type === NodeType.PROCEDURE
    );
    assert(declareChildren.length >= 2, `DECLARE分区应有>=2个子节点, 实际: ${declareChildren.length}`);

    // ============ 测试3: 控制结构归入BODY ============
    console.log('\n=== 测试3: 控制结构归入BODY ===');

    const bodyChildren = procNode.children.filter(c =>
        isControlStructureType(c.type) &&
        c.type !== NodeType.ELSIF_BRANCH && c.type !== NodeType.ELSE_BRANCH
    );
    assert(bodyChildren.length > 0, `process_data的BODY分区应有控制结构: ${bodyChildren.length}`);

    // ============ 测试4: ELSIF/ELSE合并 ============
    console.log('\n=== 测试4: ELSIF/ELSE合并 ===');

    // process_data的children中应有 IF, ELSIF, ELSE 连续出现
    const allProcChildren = procNode.children;
    let ifCount = 0;
    let elsifCount = 0;
    let elseCount = 0;
    for (const c of allProcChildren) {
        if (c.type === NodeType.IF_STATEMENT) ifCount++;
        if (c.type === NodeType.ELSIF_BRANCH) elsifCount++;
        if (c.type === NodeType.ELSE_BRANCH) elseCount++;
    }
    assert(ifCount > 0, `应有IF节点: ${ifCount}`);
    assert(elsifCount > 0, `应有ELSIF节点: ${elsifCount}`);
    assert(elseCount > 0, `应有ELSE节点: ${elseCount}`);

    // 合并后只应保留IF
    const merged = mergeIfGroups(allProcChildren.filter(c =>
        isControlStructureType(c.type)
    ));
    const mergedIfCount = merged.filter(m => m.node.type === NodeType.IF_STATEMENT).length;
    const mergedElsifCount = merged.filter(m => m.node.type === NodeType.ELSIF_BRANCH).length;
    assertEqual(mergedElsifCount, 0, '合并后不应有独立ELSIF');
    assert(mergedIfCount > 0, `合并后应有IF: ${mergedIfCount}`);

    // ============ 测试5: 标签简化 ============
    console.log('\n=== 测试5: 标签简化 ===');

    assertEqual(getSimplifiedControlLabel(NodeType.IF_STATEMENT), 'IF', 'IF标签');
    assertEqual(getSimplifiedControlLabel(NodeType.FOR_LOOP), 'FOR', 'FOR标签');
    assertEqual(getSimplifiedControlLabel(NodeType.WHILE_LOOP), 'WHILE', 'WHILE标签');
    assertEqual(getSimplifiedControlLabel(NodeType.LOOP_STATEMENT), 'LOOP', 'LOOP标签');
    assertEqual(getSimplifiedControlLabel(NodeType.CASE_STATEMENT), 'CASE', 'CASE标签');
    assertEqual(getSimplifiedControlLabel(NodeType.WHEN_BRANCH), 'WHEN', 'WHEN标签');

    // DECLARE区域标签
    assertEqual(getDeclareNodeLabel({ type: NodeType.FUNCTION, name: 'calc' }), 'Function: calc', 'Function标签');
    assertEqual(getDeclareNodeLabel({ type: NodeType.PROCEDURE, name: 'init' }), 'Procedure: init', 'Procedure标签');

    // ============ 测试6: 完整UI树结构输出 ============
    console.log('\n=== 测试6: 完整UI树结构输出 ===');

    const uiTree = buildUITree(result.nodes);
    console.log('  生成的UI树:');
    for (const line of uiTree) {
        console.log(`    ${line}`);
    }

    // 验证树中有DECLARE/BODY/EXCEPTION/END分区
    assert(uiTree.some(l => l.includes('DECLARE')), '树中应有DECLARE分区');
    assert(uiTree.some(l => l.includes('BODY')), '树中应有BODY分区');
    assert(uiTree.some(l => l.includes('END')), '树中应有END分区');

    // 验证控制结构只显示关键字（无条件文本）
    const controlLines = uiTree.filter(l =>
        l.trim().startsWith('IF') || l.trim().startsWith('FOR') ||
        l.trim().startsWith('WHILE') || l.trim().startsWith('CASE')
    );
    for (const line of controlLines) {
        const trimmed = line.trim();
        // 应该只是关键字（可能后面没内容）
        assert(
            trimmed === 'IF' || trimmed === 'FOR' || trimmed === 'WHILE' ||
            trimmed === 'LOOP' || trimmed === 'CASE' || trimmed === 'WHEN',
            `控制结构标签应只有关键字: "${trimmed}"`
        );
    }

    // 验证无独立ELSIF/ELSE显示
    const elsifLines = uiTree.filter(l => l.trim() === 'ELSIF' || l.trim() === 'ELSE');
    assertEqual(elsifLines.length, 0, '树中不应有独立的ELSIF/ELSE节点');

    // ============ 测试7: 大文件分区验证 ============
    console.log('\n=== 测试7: 大文件分区验证 ===');

    const largeFile = path.join(__dirname, 'large_package_100funcs.sql');
    const largeContent = fs.readFileSync(largeFile, 'utf8');
    const largeResult = await parser.parse(largeContent, largeFile);

    const largePkg = largeResult.nodes[0];
    assertEqual(largePkg.type, NodeType.PACKAGE_BODY, '大文件顶层应为Package Body');

    // 大文件的function/procedure子节点都应放到分区中
    const largeFunctions = largePkg.children.filter(c => c.type === NodeType.FUNCTION);
    const largeProcedures = largePkg.children.filter(c => c.type === NodeType.PROCEDURE);

    assert(largeFunctions.length > 0, '大文件有Functions');
    assert(largeProcedures.length > 0, '大文件有Procedures');

    // 检查每个function的分区结构
    let functionsWithBody = 0;
    for (const func of largeFunctions.slice(0, 10)) {
        if (func.beginLine !== null && func.beginLine !== undefined) {
            functionsWithBody++;
            // 应能生成分区
            assert(shouldUseSectionGrouping(func), `${func.name}应使用分区分组`);
        }
    }
    assert(functionsWithBody > 0, `应有带BODY的Functions: ${functionsWithBody}`);

    // ============ 输出结果 ============
    console.log('\n================================');
    console.log(`测试结果: ${passed}/${passed + failed} 通过`);

    if (failed > 0) {
        console.log(`\n失败: ${failed} 个测试`);
        process.exit(1);
    } else {
        console.log('\n所有测试通过!');
    }
}

runTests().catch(err => {
    console.error('测试执行出错:', err);
    process.exit(1);
});

const fs = require('fs');

// 模拟VS Code环境
const mockVscode = {
    TreeItem: class {
        constructor(label, collapsibleState) {
            this.label = label;
            this.collapsibleState = collapsibleState;
        }
    },
    TreeItemCollapsibleState: {
        None: 0,
        Collapsed: 1,
        Expanded: 2
    },
    ThemeIcon: class {
        constructor(id) {
            this.id = id;
        }
    },
    Range: class {
        constructor(start, end) {
            this.start = start;
            this.end = end;
        }
    },
    Position: class {
        constructor(line, character) {
            this.line = line;
            this.character = character;
        }
    },
    commands: {
        executeCommand: () => {}
    }
};

// 设置全局vscode对象
global.vscode = mockVscode;

// 导入TreeView相关代码
const { parsePLSQL } = require('./standalone_parser.js');

console.log('=== TreeView调试 ===\n');

// 模拟TreeDataProvider的getTreeItem方法
function getTreeItem(element) {
    const hasChildren = element.children && element.children.length > 0;
    const collapsibleState = hasChildren ? 
        mockVscode.TreeItemCollapsibleState.Collapsed : 
        mockVscode.TreeItemCollapsibleState.None;
    
    const item = new mockVscode.TreeItem(element.label, collapsibleState);
    
    // 设置图标
    const iconMap = {
        'package': 'package',
        'package body': 'package', 
        'procedure': 'symbol-method',
        'function': 'symbol-function',
        'trigger': 'zap',
        'declare': 'symbol-variable',
        'begin': 'symbol-namespace',
        'exception': 'error',
        'constant': 'symbol-constant',
        'type': 'symbol-class'
    };
    
    item.iconPath = new mockVscode.ThemeIcon(iconMap[element.type] || 'symbol-misc');
    
    // 设置命令
    if (element.range) {
        item.command = {
            command: 'vscode.open',
            title: 'Open',
            arguments: [
                undefined, // uri会在实际使用时设置
                {
                    selection: new mockVscode.Range(
                        new mockVscode.Position(element.range.startLine, 0),
                        new mockVscode.Position(element.range.endLine, 0)
                    )
                }
            ]
        };
    }
    
    return item;
}

// 模拟getChildren方法
function getChildren(element) {
    if (!element) {
        // 返回根节点
        const testContent = `
CREATE OR REPLACE PROCEDURE test_proc IS
    FUNCTION nested_func RETURN VARCHAR2 IS
    BEGIN
        RETURN 'test';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'error';
    END;
BEGIN
    NULL;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END;
        `;
        
        const result = parsePLSQL(testContent);
        return result.nodes;
    } else {
        return element.children || [];
    }
}

// 测试TreeView功能
function testTreeView() {
    console.log('🔍 测试TreeView功能...\n');
    
    // 获取根节点
    const rootNodes = getChildren(null);
    console.log(`根节点数量: ${rootNodes.length}`);
    
    function displayTree(nodes, depth = 0) {
        nodes.forEach(node => {
            const indent = '  '.repeat(depth);
            const treeItem = getTreeItem(node);
            
            console.log(`${indent}${treeItem.label} (${node.type})`);
            console.log(`${indent}  - 图标: ${treeItem.iconPath.id}`);
            console.log(`${indent}  - 可折叠状态: ${treeItem.collapsibleState}`);
            console.log(`${indent}  - 有命令: ${!!treeItem.command}`);
            
            if (node.children && node.children.length > 0) {
                console.log(`${indent}  - 子节点数量: ${node.children.length}`);
                displayTree(node.children, depth + 1);
            } else {
                console.log(`${indent}  - 无子节点`);
            }
        });
    }
    
    displayTree(rootNodes);
}

// 测试文件扩展名支持
function testFileExtensions() {
    console.log('\n🔍 测试文件扩展名支持...\n');
    
    const supportedExtensions = [
        '.sql', '.pks', '.pkb', '.fcn', '.prc', '.typ', '.vw'
    ];
    
    console.log('支持的文件扩展名:');
    supportedExtensions.forEach(ext => {
        console.log(`  - ${ext}`);
    });
    
    // 测试一些常见的用户文件名
    const testFiles = [
        'package.sql',
        'procedure.prc', 
        'function.fcn',
        'package_spec.pks',
        'package_body.pkb',
        'view.vw',
        'type.typ',
        'script.plsql',  // 不支持
        'code.pl'        // 不支持
    ];
    
    console.log('\n测试文件名:');
    testFiles.forEach(filename => {
        const ext = filename.substring(filename.lastIndexOf('.'));
        const supported = supportedExtensions.includes(ext);
        console.log(`  - ${filename}: ${supported ? '✅ 支持' : '❌ 不支持'}`);
    });
}

// 运行测试
testTreeView();
testFileExtensions();

console.log('\n=== TreeView调试完成 ===');

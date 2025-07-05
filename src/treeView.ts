import * as vscode from 'vscode';
import { PLSQLNode } from './types';
import { parsePLSQL } from './parser';

export class PLSQLOutlineProvider implements vscode.TreeDataProvider<PLSQLNode> {
    private _onDidChangeTreeData = new vscode.EventEmitter<PLSQLNode | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    public nodes: PLSQLNode[] = [];
    private writeLog: (message: string) => void = () => {};

    constructor() {
        this.refresh();
    }

    refresh(): void {
        const editor = vscode.window.activeTextEditor;
        if (editor && this.isPLSQLFile(editor.document)) {
            const text = editor.document.getText();
            const result = parsePLSQL(text);
            this.nodes = result.nodes;
        } else {
            this.nodes = [];
        }
        this._onDidChangeTreeData.fire(undefined);
    }

    private isPLSQLFile(document: vscode.TextDocument): boolean {
        const config = vscode.workspace.getConfiguration('plsqlOutline');
        const extensions = config.get<string[]>('fileExtensions', ['.sql', '.pks', '.pkb', '.fcn', '.prc', '.typ', '.vw']);
        const fileName = document.fileName.toLowerCase();
        
        this.writeLog(`isPLSQLFile: Checking file ${fileName}`);
        this.writeLog(`isPLSQLFile: Configured extensions: ${extensions.join(', ')}`);
        
        // 严格模式：只检查用户配置的扩展名
        const result = extensions.some(ext => fileName.endsWith(ext.toLowerCase()));
        
        this.writeLog(`isPLSQLFile: Extension match result: ${result}`);
        return result;
    }

    reveal(node: PLSQLNode): void {
        this.writeLog(`Reveal: Called for node ${node.label} with range ${node.range?.startLine}-${node.range?.endLine}`);
        
        if (node.range) {
            const editor = vscode.window.activeTextEditor;
            this.writeLog(`Reveal: Active editor exists: ${!!editor}`);
            
            if (editor) {
                this.writeLog(`Reveal: Editor document: ${editor.document.fileName}`);
                this.writeLog(`Reveal: Revealing range ${node.range.startLine}:0 to ${node.range.endLine}:0`);
                
                // 跳转到指定范围并高亮显示
                // 根据自定义范围创建 vscode.Range
                const range = new vscode.Range(
                    new vscode.Position(node.range.startLine, 0),
                    new vscode.Position(node.range.endLine, 0)
                );
                editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
                
                // 设置光标位置到节点开始处
                editor.selection = new vscode.Selection(
                    new vscode.Position(node.range.startLine, 0),
                    new vscode.Position(node.range.startLine, 0)
                );
                
                // 确保编辑器获得焦点
                vscode.window.showTextDocument(editor.document, editor.viewColumn, false);
                
                this.writeLog(`Reveal: Successfully revealed and focused on ${node.label}`);
            } else {
                this.writeLog(`Reveal: No active editor found`);
            }
        } else {
            this.writeLog(`Reveal: Node ${node.label} has no range information`);
        }
    }

    getTreeItem(element: PLSQLNode): vscode.TreeItem {
        const item = new vscode.TreeItem(
            element.label,
            element.children && element.children.length > 0 ? 
                vscode.TreeItemCollapsibleState.Collapsed : 
                vscode.TreeItemCollapsibleState.None
        );
        
        item.iconPath = new vscode.ThemeIcon(element.icon || 'symbol-method');
        item.command = {
            command: 'plsqlOutline.reveal',
            title: 'Reveal',
            arguments: [element]
        };
        
        return item;
    }

    getChildren(element?: PLSQLNode): Thenable<PLSQLNode[]> {
        if (element) {
            return Promise.resolve(element.children || []);
        }
        return Promise.resolve(this.nodes);
    }

    getParent(element: PLSQLNode): vscode.ProviderResult<PLSQLNode> {
        return element.parent;
    }

    expandAll(): void {
        this.writeLog('ExpandAll: Starting to expand all nodes');
        this.expandAllNodes(this.nodes);
    }


    private expandAllNodes(nodes: PLSQLNode[]): void {
        for (const node of nodes) {
            if (node.children && node.children.length > 0) {
                this.writeLog(`ExpandAll: Expanding node ${node.label} with ${node.children.length} children`);
                // 递归展开子节点
                this.expandAllNodes(node.children);
            }
        }
        this.writeLog('ExpandAll: Completed expanding all nodes');
    }

    findNodeAtPosition(position: vscode.Position): PLSQLNode | undefined {
        this.writeLog(`FindNode: Called with position line ${position.line}, char ${position.character}`);
        this.writeLog(`FindNode: Available nodes: ${this.nodes.length}`);
        
        // 显示所有根节点的信息
        this.nodes.forEach((node, index) => {
            this.writeLog(`Root node ${index}: ${node.label}, type: ${node.type}, range: ${node.range?.startLine}-${node.range?.endLine}`);
        });
        
        const result = this.findNodeInTree(this.nodes, position);
        this.writeLog(`FindNode: Result: ${result ? result.label : 'none'}`);
        return result;
    }

    private findNodeInTree(nodes: PLSQLNode[], position: vscode.Position): PLSQLNode | undefined {
        let bestMatch: PLSQLNode | undefined;
        
        for (const node of nodes) {
            this.writeLog(`Checking: ${node.label}, type: ${node.type}`);
            this.writeLog(`Range: start=${node.range?.startLine}, end=${node.range?.endLine}, pos=${position.line}`);
            
            if (node.range) {
                const inRange = this.isPositionInRange(position, node.range);
                this.writeLog(`Range check: ${position.line} in [${node.range.startLine}-${node.range.endLine}] = ${inRange}`);
                
                if (inRange) {
                    this.writeLog(`✓ MATCH: ${node.label}`);
                    bestMatch = node;
                    
                    // 递归查找子节点中更精确的匹配
                    if (node.children && node.children.length > 0) {
                        this.writeLog(`Checking ${node.children.length} children of ${node.label}`);
                        const childMatch = this.findNodeInTree(node.children, position);
                        if (childMatch) {
                            this.writeLog(`Better match in child: ${childMatch.label}`);
                            bestMatch = childMatch;
                        }
                    }
                } else {
                    this.writeLog(`✗ NO MATCH: ${node.label}`);
                }
            } else {
                this.writeLog(`No range info for: ${node.label}`);
            }
        }
        
        return bestMatch;
    }

    private isPositionInRange(position: vscode.Position, range: { startLine: number; endLine: number }): boolean {
        const result = position.line >= range.startLine && position.line <= range.endLine;
        this.writeLog(`Range calc: ${position.line} >= ${range.startLine} && ${position.line} <= ${range.endLine} = ${result}`);
        return result;
    }
}

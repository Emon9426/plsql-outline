import * as vscode from 'vscode';
import { PLSQLNode } from './types';
import { parsePLSQL } from './parser';

export class PLSQLOutlineProvider implements vscode.TreeDataProvider<PLSQLNode> {
    private _onDidChangeTreeData = new vscode.EventEmitter<PLSQLNode | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private nodes: PLSQLNode[] = [];
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
        const ext = document.fileName.toLowerCase();
        return ext.endsWith('.sql') || ext.endsWith('.pks') || ext.endsWith('.pkb') || 
               document.languageId === 'plsql';
    }

    reveal(node: PLSQLNode): void {
        this.writeLog(`Reveal: Called for node ${node.label} with range ${node.range?.start.line}-${node.range?.end.line}`);
        
        if (node.range) {
            const editor = vscode.window.activeTextEditor;
            this.writeLog(`Reveal: Active editor exists: ${!!editor}`);
            
            if (editor) {
                this.writeLog(`Reveal: Editor document: ${editor.document.fileName}`);
                this.writeLog(`Reveal: Revealing range ${node.range.start.line}:${node.range.start.character} to ${node.range.end.line}:${node.range.end.character}`);
                
                // 跳转到指定范围并高亮显示
                editor.revealRange(node.range, vscode.TextEditorRevealType.InCenter);
                
                // 设置光标位置和选择范围
                editor.selection = new vscode.Selection(node.range.start, node.range.start);
                
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
            element.children ? 
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

    findNodeAtPosition(position: vscode.Position): PLSQLNode | undefined {
        this.writeLog(`FindNode: Called with position line ${position.line}, char ${position.character}`);
        this.writeLog(`FindNode: Available nodes: ${this.nodes.length}`);
        
        // 显示所有根节点的信息
        this.nodes.forEach((node, index) => {
            this.writeLog(`Root node ${index}: ${node.label}, type: ${node.type}, range: ${node.range?.start.line}-${node.range?.end.line}`);
        });
        
        const result = this.findNodeInTree(this.nodes, position);
        this.writeLog(`FindNode: Result: ${result ? result.label : 'none'}`);
        return result;
    }

    private findNodeInTree(nodes: PLSQLNode[], position: vscode.Position): PLSQLNode | undefined {
        let bestMatch: PLSQLNode | undefined;
        
        for (const node of nodes) {
            this.writeLog(`Checking: ${node.label}, type: ${node.type}`);
            this.writeLog(`Range: start=${node.range?.start.line}, end=${node.range?.end.line}, pos=${position.line}`);
            
            if (node.range) {
                const inRange = this.isPositionInRange(position, node.range);
                this.writeLog(`Range check: ${position.line} in [${node.range.start.line}-${node.range.end.line}] = ${inRange}`);
                
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

    private isPositionInRange(position: vscode.Position, range: vscode.Range): boolean {
        const result = position.line >= range.start.line && position.line <= range.end.line;
        this.writeLog(`Range calc: ${position.line} >= ${range.start.line} && ${position.line} <= ${range.end.line} = ${result}`);
        return result;
    }
}

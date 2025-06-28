import * as vscode from 'vscode';
import { PLSQLNode } from './types';
import { parsePLSQL } from './parser';

export class PLSQLOutlineProvider implements vscode.TreeDataProvider<PLSQLNode> {
    private _onDidChangeTreeData = new vscode.EventEmitter<PLSQLNode | undefined>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private nodes: PLSQLNode[] = [];

    constructor() {
        this.refresh();
    }

    refresh(): void {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'plsql') {
            const text = editor.document.getText();
            const result = parsePLSQL(text);
            this.nodes = result.nodes;
        } else {
            this.nodes = [];
        }
        this._onDidChangeTreeData.fire(undefined);
    }

    reveal(node: PLSQLNode): void {
        if (node.range && vscode.window.activeTextEditor) {
            vscode.window.activeTextEditor.revealRange(node.range);
            vscode.window.activeTextEditor.selection = new vscode.Selection(
                node.range.start,
                node.range.start
            );
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
}

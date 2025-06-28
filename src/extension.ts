import * as vscode from 'vscode';
import { PLSQLOutlineProvider } from './treeView';

export function activate(context: vscode.ExtensionContext) {
    // Register Tree Data Provider
    const outlineProvider = new PLSQLOutlineProvider();
    vscode.window.registerTreeDataProvider('plsqlOutline', outlineProvider);

    // Register Commands
    context.subscriptions.push(
        vscode.commands.registerCommand('plsqlOutline.refresh', () => {
            outlineProvider.refresh();
        }),
        vscode.commands.registerCommand('plsqlOutline.reveal', (node) => {
            outlineProvider.reveal(node);
        })
    );

    // Watch active editor changes
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor?.document.languageId === 'plsql') {
            outlineProvider.refresh();
        }
    });
}

export function deactivate() {}

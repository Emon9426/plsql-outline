import * as vscode from 'vscode';
import { PLSQLOutlineProvider } from './treeView';

let refreshTimeout: any;

export function activate(context: vscode.ExtensionContext) {
    // Create Tree Data Provider
    const outlineProvider = new PLSQLOutlineProvider();
    
    // Create Tree View with enhanced control
    const treeView = vscode.window.createTreeView('plsqlOutline', {
        treeDataProvider: outlineProvider,
        showCollapseAll: true
    });

    // Helper function to check if file is PL/SQL
    function isPLSQLFile(document: vscode.TextDocument): boolean {
        const ext = document.fileName.toLowerCase();
        return ext.endsWith('.sql') || ext.endsWith('.pks') || ext.endsWith('.pkb') || 
               document.languageId === 'plsql';
    }

    // Debounced refresh function
    function debouncedRefresh() {
        if (refreshTimeout) {
            clearTimeout(refreshTimeout);
        }
        refreshTimeout = setTimeout(() => {
            const editor = vscode.window.activeTextEditor;
            if (editor && isPLSQLFile(editor.document)) {
                outlineProvider.refresh();
            }
        }, 500);
    }

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
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && isPLSQLFile(editor.document)) {
                outlineProvider.refresh();
            }
        })
    );

    // Watch document content changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document && isPLSQLFile(event.document)) {
                debouncedRefresh();
            }
        })
    );

    // Initial refresh if current file is PL/SQL
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && isPLSQLFile(activeEditor.document)) {
        outlineProvider.refresh();
    }

    context.subscriptions.push(treeView);
}

export function deactivate() {
    if (refreshTimeout) {
        clearTimeout(refreshTimeout);
    }
}

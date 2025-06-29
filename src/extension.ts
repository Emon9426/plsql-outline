import * as vscode from 'vscode';
import { PLSQLOutlineProvider } from './treeView';

let refreshTimeout: any;
let syncTimeout: any;
let outputChannel: vscode.OutputChannel;

function writeLog(message: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    outputChannel.appendLine(logMessage);
}

export function activate(context: vscode.ExtensionContext) {
    // Create output channel for logging
    outputChannel = vscode.window.createOutputChannel('PL/SQL Outline Debug');
    context.subscriptions.push(outputChannel);
    
    writeLog('PL/SQL Outline extension is being activated');
    
    // Create Tree Data Provider
    const outlineProvider = new PLSQLOutlineProvider();
    
    // Pass writeLog function to outlineProvider
    (outlineProvider as any).setLogger = (logger: (msg: string) => void) => {
        (outlineProvider as any).writeLog = logger;
    };
    (outlineProvider as any).setLogger(writeLog);
    
    // Create Tree View with enhanced control
    const treeView = vscode.window.createTreeView('plsqlOutline', {
        treeDataProvider: outlineProvider,
        showCollapseAll: true
    });
    
    console.log('TreeView created successfully');

    // Helper function to check if file is PL/SQL
    function isPLSQLFile(document: vscode.TextDocument): boolean {
        const ext = document.fileName.toLowerCase();
        const result = ext.endsWith('.sql') || ext.endsWith('.pks') || ext.endsWith('.pkb') || 
               document.languageId === 'plsql';
        console.log(`isPLSQLFile check: ${document.fileName}, ext: ${ext}, languageId: ${document.languageId}, result: ${result}`);
        return result;
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

    // Debounced sync function for cursor position
    function debouncedSync() {
        if (syncTimeout) {
            clearTimeout(syncTimeout);
        }
        syncTimeout = setTimeout(() => {
            try {
                writeLog('Step 1: debouncedSync started');
                
                const editor = vscode.window.activeTextEditor;
                writeLog(`Step 2: Editor exists: ${!!editor}`);
                
                if (editor && isPLSQLFile(editor.document)) {
                    const position = editor.selection.active;
                    writeLog(`Step 3: Position: line ${position.line}, char ${position.character}`);
                    
                    // 强制刷新大纲以确保节点数据是最新的
                    writeLog('Step 4: Refreshing outline data');
                    outlineProvider.refresh();
                    
                    writeLog('Step 5: Calling findNodeAtPosition');
                    const node = outlineProvider.findNodeAtPosition(position);
                    
                    if (node) {
                        writeLog(`Step 6: Found node: ${node.label} at range ${node.range?.start.line}-${node.range?.end.line}`);
                        
                        const revealPromise = treeView.reveal(node, { select: true, expand: true, focus: false });
                        if (revealPromise && typeof revealPromise.then === 'function') {
                            revealPromise.then(() => {
                                writeLog(`Step 7: Successfully revealed: ${node.label}`);
                            }, (error: any) => {
                                writeLog(`Step 7: Error revealing node: ${error}`);
                            });
                        } else {
                            writeLog(`Step 7: Node reveal completed: ${node.label}`);
                        }
                    } else {
                        writeLog(`Step 6: No node found for line ${position.line}`);
                    }
                } else {
                    writeLog('Step 3: Not a PL/SQL file or no editor');
                }
            } catch (error) {
                writeLog(`Error in debouncedSync: ${error}`);
            }
        }, 200);
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

    // Watch cursor position changes for outline sync
    console.log('Registering onDidChangeTextEditorSelection event listener');
    const selectionListener = vscode.window.onDidChangeTextEditorSelection(event => {
        console.log('onDidChangeTextEditorSelection event triggered');
        const editor = event.textEditor;
        console.log('Event editor exists:', !!editor);
        
        if (editor) {
            console.log('Editor document fileName:', editor.document.fileName);
            const isPlsql = isPLSQLFile(editor.document);
            console.log('Is PLSQL file:', isPlsql);
            
            if (isPlsql) {
                console.log('Calling debouncedSync');
                debouncedSync();
            }
        }
    });
    
    context.subscriptions.push(selectionListener);
    console.log('Selection event listener registered successfully');

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
    if (syncTimeout) {
        clearTimeout(syncTimeout);
    }
}

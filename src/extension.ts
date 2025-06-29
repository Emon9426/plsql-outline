import * as vscode from 'vscode';
import { PLSQLOutlineProvider } from './treeView';
import { PLSQLNode } from './types';

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
        const config = vscode.workspace.getConfiguration('plsqlOutline');
        const extensions = config.get<string[]>('fileExtensions', ['.sql', '.pks', '.pkb', '.fcn', '.prc', '.typ', '.vw']);
        const fileName = document.fileName.toLowerCase();
        
        // 严格模式：只检查用户配置的扩展名
        const result = extensions.some(ext => fileName.endsWith(ext.toLowerCase()));
        
        console.log(`isPLSQLFile check: ${document.fileName}, configured extensions: ${extensions.join(', ')}, result: ${result}`);
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
        }),
        vscode.commands.registerCommand('plsqlOutline.expandAll', () => {
            writeLog('Command: expandAll triggered');
            outlineProvider.expandAll();
            // 使用TreeView的内置展开功能
            expandAllTreeViewNodes(treeView, outlineProvider.nodes);
        }),
        vscode.commands.registerCommand('plsqlOutline.openSettings', () => {
            writeLog('Command: openSettings triggered');
            openSettingsPanel(context);
        })
    );

    // Helper function to expand all nodes in TreeView
    async function expandAllTreeViewNodes(treeView: vscode.TreeView<PLSQLNode>, nodes: PLSQLNode[]) {
        writeLog('TreeView: Starting to expand all nodes in TreeView');
        for (const node of nodes) {
            try {
                await treeView.reveal(node, { expand: true });
                if (node.children && node.children.length > 0) {
                    await expandAllTreeViewNodes(treeView, node.children);
                }
            } catch (error) {
                writeLog(`TreeView: Error expanding node ${node.label}: ${error}`);
            }
        }
        writeLog('TreeView: Completed expanding all nodes in TreeView');
    }

    // Function to open settings panel
    function openSettingsPanel(context: vscode.ExtensionContext) {
        writeLog('Settings: Creating settings panel');
        
        const panel = vscode.window.createWebviewPanel(
            'plsqlOutlineSettings',
            'PL/SQL Outline Settings',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        const config = vscode.workspace.getConfiguration('plsqlOutline');
        const currentExtensions = config.get<string[]>('fileExtensions', ['.sql', '.pks', '.pkb', '.fcn', '.prc', '.typ', '.vw']);

        panel.webview.html = getSettingsWebviewContent(currentExtensions);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'saveSettings':
                        writeLog(`Settings: Saving extensions: ${message.extensions.join(', ')}`);
                        await config.update('fileExtensions', message.extensions, vscode.ConfigurationTarget.Global);
                        vscode.window.showInformationMessage('PL/SQL Outline settings saved successfully!');
                        // 刷新大纲视图以应用新设置
                        outlineProvider.refresh();
                        break;
                    case 'resetSettings':
                        writeLog('Settings: Resetting to default extensions');
                        await config.update('fileExtensions', ['.sql', '.pks', '.pkb', '.fcn', '.prc', '.typ', '.vw'], vscode.ConfigurationTarget.Global);
                        panel.webview.html = getSettingsWebviewContent(['.sql', '.pks', '.pkb', '.fcn', '.prc', '.typ', '.vw']);
                        vscode.window.showInformationMessage('Settings reset to default values!');
                        outlineProvider.refresh();
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    }

    // Function to generate settings webview content
    function getSettingsWebviewContent(extensions: string[]): string {
        const extensionsList = extensions.map((ext, index) => 
            `<div class="extension-item">
                <input type="text" value="${ext}" data-index="${index}" class="extension-input">
                <button onclick="removeExtension(${index})" class="remove-btn">Remove</button>
            </div>`
        ).join('');

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PL/SQL Outline Settings</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    padding: 20px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                }
                h1 {
                    color: var(--vscode-foreground);
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 10px;
                }
                .section {
                    margin: 20px 0;
                }
                .extension-item {
                    display: flex;
                    align-items: center;
                    margin: 10px 0;
                    gap: 10px;
                }
                .extension-input {
                    flex: 1;
                    padding: 8px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 3px;
                }
                .remove-btn, .add-btn, .save-btn, .reset-btn {
                    padding: 8px 16px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                }
                .remove-btn:hover, .add-btn:hover, .save-btn:hover, .reset-btn:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .reset-btn {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                }
                .button-group {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }
                .description {
                    color: var(--vscode-descriptionForeground);
                    font-size: 14px;
                    margin-bottom: 15px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>PL/SQL Outline Settings</h1>
                
                <div class="section">
                    <h3>File Extensions</h3>
                    <div class="description">
                        Configure which file extensions should be parsed as PL/SQL files. 
                        Extensions should include the dot (e.g., .sql, .pks, .pkb).
                    </div>
                    
                    <div id="extensions-list">
                        ${extensionsList}
                    </div>
                    
                    <button onclick="addExtension()" class="add-btn">Add Extension</button>
                </div>
                
                <div class="button-group">
                    <button onclick="saveSettings()" class="save-btn">Save Settings</button>
                    <button onclick="resetSettings()" class="reset-btn">Reset to Default</button>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                
                function addExtension() {
                    const container = document.getElementById('extensions-list');
                    const index = container.children.length;
                    const div = document.createElement('div');
                    div.className = 'extension-item';
                    div.innerHTML = \`
                        <input type="text" value="" data-index="\${index}" class="extension-input" placeholder=".ext">
                        <button onclick="removeExtension(\${index})" class="remove-btn">Remove</button>
                    \`;
                    container.appendChild(div);
                    updateIndices();
                }
                
                function removeExtension(index) {
                    const container = document.getElementById('extensions-list');
                    const items = container.querySelectorAll('.extension-item');
                    if (items.length > 1) {
                        items[index].remove();
                        updateIndices();
                    }
                }
                
                function updateIndices() {
                    const inputs = document.querySelectorAll('.extension-input');
                    inputs.forEach((input, index) => {
                        input.setAttribute('data-index', index);
                    });
                    
                    const removeButtons = document.querySelectorAll('.remove-btn');
                    removeButtons.forEach((button, index) => {
                        button.setAttribute('onclick', \`removeExtension(\${index})\`);
                    });
                }
                
                function saveSettings() {
                    const inputs = document.querySelectorAll('.extension-input');
                    const extensions = Array.from(inputs)
                        .map(input => input.value.trim())
                        .filter(ext => ext.length > 0);
                    
                    if (extensions.length === 0) {
                        alert('Please add at least one file extension.');
                        return;
                    }
                    
                    vscode.postMessage({
                        command: 'saveSettings',
                        extensions: extensions
                    });
                }
                
                function resetSettings() {
                    vscode.postMessage({
                        command: 'resetSettings'
                    });
                }
            </script>
        </body>
        </html>`;
    }

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

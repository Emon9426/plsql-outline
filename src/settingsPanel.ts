import * as vscode from 'vscode';

/**
 * 设置面板类
 */
export class SettingsPanel {
    public static currentPanel: SettingsPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // 如果已经有面板，则显示它
        if (SettingsPanel.currentPanel) {
            SettingsPanel.currentPanel._panel.reveal(column);
            return;
        }

        // 否则，创建新面板
        const panel = vscode.window.createWebviewPanel(
            'plsqlOutlineSettings',
            'PL/SQL Outline 设置',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'out', 'compiled')
                ]
            }
        );

        SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri);
    }

    public static kill() {
        SettingsPanel.currentPanel?.dispose();
        SettingsPanel.currentPanel = undefined;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public dispose() {
        SettingsPanel.currentPanel = undefined;

        // 清理资源
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _update() {
        const webview = this._panel.webview;

        this._panel.webview.html = this._getHtmlForWebview(webview);
        
        // 处理来自webview的消息
        webview.onDidReceiveMessage(
            async (data) => {
                switch (data.type) {
                    case 'getConfig':
                        await this._sendConfig();
                        break;
                    case 'updateConfig':
                        await this._updateConfig(data.config);
                        break;
                    case 'resetConfig':
                        await this._resetConfig();
                        break;
                    case 'addExtension':
                        await this._addFileExtension(data.extension);
                        break;
                    case 'removeExtension':
                        await this._removeFileExtension(data.extension);
                        break;
                    case 'toggleDebug':
                        await this._toggleDebugMode();
                        break;
                    case 'exportConfig':
                        await this._exportConfig();
                        break;
                    case 'importConfig':
                        await this._importConfig();
                        break;
                }
            },
            null,
            this._disposables
        );

        // 初始化时发送配置
        await this._sendConfig();
    }

    private async _sendConfig() {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const configData = {
            parsing: {
                autoParseOnSave: config.get('parsing.autoParseOnSave'),
                autoParseOnSwitch: config.get('parsing.autoParseOnSwitch'),
                maxLines: config.get('parsing.maxLines'),
                maxNestingDepth: config.get('parsing.maxNestingDepth'),
                maxParseTime: config.get('parsing.maxParseTime')
            },
            view: {
                showStructureBlocks: config.get('view.showStructureBlocks'),
                expandByDefault: config.get('view.expandByDefault')
            },
            debug: {
                enabled: config.get('debug.enabled'),
                outputPath: config.get('debug.outputPath'),
                logLevel: config.get('debug.logLevel'),
                keepFiles: config.get('debug.keepFiles'),
                maxFiles: config.get('debug.maxFiles')
            },
            fileExtensions: config.get('fileExtensions')
        };

        this._panel.webview.postMessage({
            type: 'configData',
            config: configData
        });
    }

    private async _updateConfig(newConfig: any) {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        
        try {
            // 更新解析设置
            if (newConfig.parsing) {
                await config.update('parsing.autoParseOnSave', newConfig.parsing.autoParseOnSave, vscode.ConfigurationTarget.Global);
                await config.update('parsing.autoParseOnSwitch', newConfig.parsing.autoParseOnSwitch, vscode.ConfigurationTarget.Global);
                await config.update('parsing.maxLines', newConfig.parsing.maxLines, vscode.ConfigurationTarget.Global);
                await config.update('parsing.maxNestingDepth', newConfig.parsing.maxNestingDepth, vscode.ConfigurationTarget.Global);
                await config.update('parsing.maxParseTime', newConfig.parsing.maxParseTime, vscode.ConfigurationTarget.Global);
            }

            // 更新视图设置
            if (newConfig.view) {
                await config.update('view.showStructureBlocks', newConfig.view.showStructureBlocks, vscode.ConfigurationTarget.Global);
                await config.update('view.expandByDefault', newConfig.view.expandByDefault, vscode.ConfigurationTarget.Global);
            }

            // 更新调试设置
            if (newConfig.debug) {
                await config.update('debug.enabled', newConfig.debug.enabled, vscode.ConfigurationTarget.Global);
                await config.update('debug.outputPath', newConfig.debug.outputPath, vscode.ConfigurationTarget.Global);
                await config.update('debug.logLevel', newConfig.debug.logLevel, vscode.ConfigurationTarget.Global);
                await config.update('debug.keepFiles', newConfig.debug.keepFiles, vscode.ConfigurationTarget.Global);
                await config.update('debug.maxFiles', newConfig.debug.maxFiles, vscode.ConfigurationTarget.Global);
            }

            // 更新文件扩展名
            if (newConfig.fileExtensions) {
                await config.update('fileExtensions', newConfig.fileExtensions, vscode.ConfigurationTarget.Global);
            }

            this._panel.webview.postMessage({
                type: 'updateSuccess',
                message: '设置已保存'
            });

        } catch (error) {
            this._panel.webview.postMessage({
                type: 'updateError',
                message: `保存设置失败: ${error}`
            });
        }
    }

    private async _resetConfig() {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        
        try {
            // 重置为默认值
            await config.update('parsing.autoParseOnSave', undefined, vscode.ConfigurationTarget.Global);
            await config.update('parsing.autoParseOnSwitch', undefined, vscode.ConfigurationTarget.Global);
            await config.update('parsing.maxLines', undefined, vscode.ConfigurationTarget.Global);
            await config.update('parsing.maxNestingDepth', undefined, vscode.ConfigurationTarget.Global);
            await config.update('parsing.maxParseTime', undefined, vscode.ConfigurationTarget.Global);
            await config.update('view.showStructureBlocks', undefined, vscode.ConfigurationTarget.Global);
            await config.update('view.expandByDefault', undefined, vscode.ConfigurationTarget.Global);
            await config.update('debug.enabled', undefined, vscode.ConfigurationTarget.Global);
            await config.update('debug.outputPath', undefined, vscode.ConfigurationTarget.Global);
            await config.update('debug.logLevel', undefined, vscode.ConfigurationTarget.Global);
            await config.update('debug.keepFiles', undefined, vscode.ConfigurationTarget.Global);
            await config.update('debug.maxFiles', undefined, vscode.ConfigurationTarget.Global);
            await config.update('fileExtensions', undefined, vscode.ConfigurationTarget.Global);

            await this._sendConfig();
            
            this._panel.webview.postMessage({
                type: 'resetSuccess',
                message: '设置已重置为默认值'
            });

        } catch (error) {
            this._panel.webview.postMessage({
                type: 'resetError',
                message: `重置设置失败: ${error}`
            });
        }
    }

    private async _addFileExtension(extension: string) {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const currentExtensions = config.get<string[]>('fileExtensions', []);
        
        if (!extension.startsWith('.')) {
            this._panel.webview.postMessage({
                type: 'addExtensionError',
                message: '扩展名必须以点(.)开头'
            });
            return;
        }

        if (currentExtensions.includes(extension.toLowerCase())) {
            this._panel.webview.postMessage({
                type: 'addExtensionError',
                message: '该扩展名已存在'
            });
            return;
        }

        try {
            const updatedExtensions = [...currentExtensions, extension.toLowerCase()];
            await config.update('fileExtensions', updatedExtensions, vscode.ConfigurationTarget.Global);
            
            await this._sendConfig();
            
            this._panel.webview.postMessage({
                type: 'addExtensionSuccess',
                message: `已添加扩展名: ${extension}`
            });

        } catch (error) {
            this._panel.webview.postMessage({
                type: 'addExtensionError',
                message: `添加扩展名失败: ${error}`
            });
        }
    }

    private async _removeFileExtension(extension: string) {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const currentExtensions = config.get<string[]>('fileExtensions', []);
        
        try {
            const updatedExtensions = currentExtensions.filter(ext => ext !== extension);
            await config.update('fileExtensions', updatedExtensions, vscode.ConfigurationTarget.Global);
            
            await this._sendConfig();
            
            this._panel.webview.postMessage({
                type: 'removeExtensionSuccess',
                message: `已删除扩展名: ${extension}`
            });

        } catch (error) {
            this._panel.webview.postMessage({
                type: 'removeExtensionError',
                message: `删除扩展名失败: ${error}`
            });
        }
    }

    private async _toggleDebugMode() {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const currentValue = config.get('debug.enabled', false);
        
        try {
            await config.update('debug.enabled', !currentValue, vscode.ConfigurationTarget.Global);
            await this._sendConfig();
            
            this._panel.webview.postMessage({
                type: 'toggleDebugSuccess',
                message: `调试模式已${!currentValue ? '启用' : '禁用'}`
            });

        } catch (error) {
            this._panel.webview.postMessage({
                type: 'toggleDebugError',
                message: `切换调试模式失败: ${error}`
            });
        }
    }

    private async _exportConfig() {
        try {
            const config = vscode.workspace.getConfiguration('plsql-outline');
            const configData = {
                parsing: {
                    autoParseOnSave: config.get('parsing.autoParseOnSave'),
                    autoParseOnSwitch: config.get('parsing.autoParseOnSwitch'),
                    maxLines: config.get('parsing.maxLines'),
                    maxNestingDepth: config.get('parsing.maxNestingDepth'),
                    maxParseTime: config.get('parsing.maxParseTime')
                },
                view: {
                    showStructureBlocks: config.get('view.showStructureBlocks'),
                    expandByDefault: config.get('view.expandByDefault')
                },
                debug: {
                    enabled: config.get('debug.enabled'),
                    outputPath: config.get('debug.outputPath'),
                    logLevel: config.get('debug.logLevel'),
                    keepFiles: config.get('debug.keepFiles'),
                    maxFiles: config.get('debug.maxFiles')
                },
                fileExtensions: config.get('fileExtensions')
            };

            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('plsql-outline-config.json'),
                filters: {
                    'JSON文件': ['json'],
                    '所有文件': ['*']
                }
            });

            if (uri) {
                const content = JSON.stringify(configData, null, 2);
                await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
                
                this._panel.webview.postMessage({
                    type: 'exportSuccess',
                    message: `配置已导出到: ${uri.fsPath}`
                });
            }

        } catch (error) {
            this._panel.webview.postMessage({
                type: 'exportError',
                message: `导出配置失败: ${error}`
            });
        }
    }

    private async _importConfig() {
        try {
            const uri = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'JSON文件': ['json'],
                    '所有文件': ['*']
                }
            });

            if (uri && uri[0]) {
                const content = await vscode.workspace.fs.readFile(uri[0]);
                const configData = JSON.parse(content.toString());
                
                await this._updateConfig(configData);
                
                this._panel.webview.postMessage({
                    type: 'importSuccess',
                    message: `配置已从 ${uri[0].fsPath} 导入`
                });
            }

        } catch (error) {
            this._panel.webview.postMessage({
                type: 'importError',
                message: `导入配置失败: ${error}`
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PL/SQL Outline 设置</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        h1 {
            color: var(--vscode-titleBar-activeForeground);
            border-bottom: 2px solid var(--vscode-titleBar-border);
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        
        .section {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .section h2 {
            color: var(--vscode-textLink-foreground);
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 1.2em;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: var(--vscode-input-foreground);
        }
        
        input[type="text"],
        input[type="number"],
        select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: inherit;
            font-size: inherit;
        }
        
        input[type="checkbox"] {
            margin-right: 8px;
        }
        
        .checkbox-group {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .checkbox-group label {
            margin-bottom: 0;
            margin-left: 5px;
        }
        
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            font-size: inherit;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        
        button.danger {
            background-color: var(--vscode-errorForeground);
            color: var(--vscode-editor-background);
        }
        
        .extension-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .extension-tag {
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.9em;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .extension-tag .remove {
            cursor: pointer;
            font-weight: bold;
            color: var(--vscode-errorForeground);
        }
        
        .extension-input {
            display: flex;
            gap: 10px;
            align-items: flex-end;
        }
        
        .extension-input input {
            flex: 1;
        }
        
        .message {
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
        }
        
        .message.success {
            background-color: var(--vscode-testing-iconPassed);
            color: var(--vscode-editor-background);
        }
        
        .message.error {
            background-color: var(--vscode-errorForeground);
            color: var(--vscode-editor-background);
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        
        .description {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
            margin-top: 5px;
        }
        
        .range-info {
            font-size: 0.8em;
            color: var(--vscode-descriptionForeground);
            margin-top: 2px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 PL/SQL Outline 设置</h1>
        
        <div id="message-container"></div>
        
        <!-- 解析设置 -->
        <div class="section">
            <h2>📋 解析设置</h2>
            
            <div class="checkbox-group">
                <input type="checkbox" id="autoParseOnSave">
                <label for="autoParseOnSave">保存文件时自动解析</label>
            </div>
            
            <div class="checkbox-group">
                <input type="checkbox" id="autoParseOnSwitch">
                <label for="autoParseOnSwitch">切换到PL/SQL文件时自动解析</label>
            </div>
            
            <div class="form-group">
                <label for="maxLines">最大解析行数</label>
                <input type="number" id="maxLines" min="1000" max="200000">
                <div class="range-info">范围: 1,000 - 200,000</div>
            </div>
            
            <div class="form-group">
                <label for="maxNestingDepth">最大嵌套深度</label>
                <input type="number" id="maxNestingDepth" min="5" max="50">
                <div class="range-info">范围: 5 - 50</div>
            </div>
            
            <div class="form-group">
                <label for="maxParseTime">最大解析时间 (毫秒)</label>
                <input type="number" id="maxParseTime" min="5000" max="120000">
                <div class="range-info">范围: 5,000 - 120,000</div>
            </div>
        </div>
        
        <!-- 视图设置 -->
        <div class="section">
            <h2>🌳 视图设置</h2>
            
            <div class="checkbox-group">
                <input type="checkbox" id="showStructureBlocks">
                <label for="showStructureBlocks">显示结构块 (BEGIN、EXCEPTION、END)</label>
            </div>
            
            <div class="checkbox-group">
                <input type="checkbox" id="expandByDefault">
                <label for="expandByDefault">默认展开树节点</label>
            </div>
        </div>
        
        <!-- 文件扩展名设置 -->
        <div class="section">
            <h2>📁 支持的文件扩展名</h2>
            
            <div class="extension-list" id="extensionList"></div>
            
            <div class="extension-input">
                <input type="text" id="newExtension" placeholder="输入新扩展名 (如: .tbl)">
                <button onclick="addExtension()">添加</button>
            </div>
            
            <div class="description">
                点击扩展名标签上的 × 可以删除该扩展名
            </div>
        </div>
        
        <!-- 调试设置 -->
        <div class="section">
            <h2>🐛 调试设置</h2>
            
            <div class="checkbox-group">
                <input type="checkbox" id="debugEnabled">
                <label for="debugEnabled">启用调试模式</label>
            </div>
            
            <div class="form-group">
                <label for="debugOutputPath">调试文件输出路径</label>
                <input type="text" id="debugOutputPath">
            </div>
            
            <div class="form-group">
                <label for="debugLogLevel">日志级别</label>
                <select id="debugLogLevel">
                    <option value="ERROR">ERROR</option>
                    <option value="WARN">WARN</option>
                    <option value="INFO">INFO</option>
                    <option value="DEBUG">DEBUG</option>
                </select>
            </div>
            
            <div class="checkbox-group">
                <input type="checkbox" id="debugKeepFiles">
                <label for="debugKeepFiles">保留调试文件</label>
            </div>
            
            <div class="form-group">
                <label for="debugMaxFiles">最大保留调试文件数量</label>
                <input type="number" id="debugMaxFiles" min="10" max="200">
                <div class="range-info">范围: 10 - 200</div>
            </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="button-group">
            <button onclick="saveSettings()">💾 保存设置</button>
            <button class="secondary" onclick="resetSettings()">🔄 重置为默认值</button>
            <button class="secondary" onclick="exportConfig()">📤 导出配置</button>
            <button class="secondary" onclick="importConfig()">📥 导入配置</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentConfig = {};

        // 页面加载时请求配置
        window.addEventListener('load', () => {
            vscode.postMessage({ type: 'getConfig' });
        });

        // 监听来自扩展的消息
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'configData':
                    currentConfig = message.config;
                    updateUI();
                    break;
                case 'updateSuccess':
                case 'resetSuccess':
                case 'addExtensionSuccess':
                case 'removeExtensionSuccess':
                case 'toggleDebugSuccess':
                case 'exportSuccess':
                case 'importSuccess':
                    showMessage(message.message, 'success');
                    break;
                case 'updateError':
                case 'resetError':
                case 'addExtensionError':
                case 'removeExtensionError':
                case 'toggleDebugError':
                case 'exportError':
                case 'importError':
                    showMessage(message.message, 'error');
                    break;
            }
        });

        function updateUI() {
            // 解析设置
            document.getElementById('autoParseOnSave').checked = currentConfig.parsing?.autoParseOnSave || false;
            document.getElementById('autoParseOnSwitch').checked = currentConfig.parsing?.autoParseOnSwitch || false;
            document.getElementById('maxLines').value = currentConfig.parsing?.maxLines || 50000;
            document.getElementById('maxNestingDepth').value = currentConfig.parsing?.maxNestingDepth || 20;
            document.getElementById('maxParseTime').value = currentConfig.parsing?.maxParseTime || 30000;

            // 视图设置
            document.getElementById('showStructureBlocks').checked = currentConfig.view?.showStructureBlocks || false;
            document.getElementById('expandByDefault').checked = currentConfig.view?.expandByDefault || false;

            // 调试设置
            document.getElementById('debugEnabled').checked = currentConfig.debug?.enabled || false;
            document.getElementById('debugOutputPath').value = currentConfig.debug?.outputPath || '';
            document.getElementById('debugLogLevel').value = currentConfig.debug?.logLevel || 'INFO';
            document.getElementById('debugKeepFiles').checked = currentConfig.debug?.keepFiles || false;
            document.getElementById('debugMaxFiles').value = currentConfig.debug?.maxFiles || 50;

            // 文件扩展名
            updateExtensionList();
        }

        function updateExtensionList() {
            const container = document.getElementById('extensionList');
            container.innerHTML = '';

            if (currentConfig.fileExtensions) {
                currentConfig.fileExtensions.forEach(ext => {
                    const tag = document.createElement('div');
                    tag.className = 'extension-tag';
                    tag.innerHTML = \`\${ext} <span class="remove" onclick="removeExtension('\${ext}')">×</span>\`;
                    container.appendChild(tag);
                });
            }
        }

        function saveSettings() {
            const config = {
                parsing: {
                    autoParseOnSave: document.getElementById('autoParseOnSave').checked,
                    autoParseOnSwitch: document.getElementById('autoParseOnSwitch').checked,
                    maxLines: parseInt(document.getElementById('maxLines').value),
                    maxNestingDepth: parseInt(document.getElementById('maxNestingDepth').value),
                    maxParseTime: parseInt(document.getElementById('maxParseTime').value)
                },
                view: {
                    showStructureBlocks: document.getElementById('showStructureBlocks').checked,
                    expandByDefault: document.getElementById('expandByDefault').checked
                },
                debug: {
                    enabled: document.getElementById('debugEnabled').checked,
                    outputPath: document.getElementById('debugOutputPath').value,
                    logLevel: document.getElementById('debugLogLevel').value,
                    keepFiles: document.getElementById('debugKeepFiles').checked,
                    maxFiles: parseInt(document.getElementById('debugMaxFiles').value)
                },
                fileExtensions: currentConfig.fileExtensions
            };

            vscode.postMessage({
                type: 'updateConfig',
                config: config
            });
        }

        function resetSettings() {
            if (confirm('确定要重置所有设置为默认值吗？')) {
                vscode.postMessage({ type: 'resetConfig' });
            }
        }

        function addExtension() {
            const input = document.getElementById('newExtension');
            const extension = input.value.trim();
            
            if (extension) {
                vscode.postMessage({
                    type: 'addExtension',
                    extension: extension
                });
                input.value = '';
            }
        }

        function removeExtension(extension) {
            vscode.postMessage({
                type: 'removeExtension',
                extension: extension
            });
        }

        function exportConfig() {
            vscode.postMessage({ type: 'exportConfig' });
        }

        function importConfig() {
            vscode.postMessage({ type: 'importConfig' });
        }

        function showMessage(text, type) {
            const container = document.getElementById('message-container');
            const message = document.createElement('div');
            message.className = \`message \${type}\`;
            message.textContent = text;
            
            container.appendChild(message);
            
            setTimeout(() => {
                container.removeChild(message);
            }, 5000);
        }

        // 回车键添加扩展名
        document.getElementById('newExtension').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addExtension();
            }
        });
    </script>
</body>
</html>`;
    }
}

import * as vscode from 'vscode';
import { PLSQLParser } from './parser';
import { TreeViewManager } from './treeView';
import { DataBridge, DataProviderFactory } from './debug';
import { ParseResult } from './types';

/**
 * PL/SQL大纲扩展主类
 */
export class PLSQLOutlineExtension {
    private parser: PLSQLParser;
    private treeViewManager: TreeViewManager;
    private dataBridge: DataBridge;
    private dataProviderFactory: DataProviderFactory;
    private currentParseResult: ParseResult | null = null;

    constructor(context: vscode.ExtensionContext) {
        this.parser = new PLSQLParser();
        this.treeViewManager = new TreeViewManager(context);
        this.dataBridge = new DataBridge();
        this.dataProviderFactory = new DataProviderFactory(
            this.dataBridge.getDebugManager(),
            this.dataBridge.getLogger()
        );

        this.registerCommands(context);
        this.registerEventListeners(context);
    }

    /**
     * 注册命令
     */
    private registerCommands(context: vscode.ExtensionContext): void {
        // 解析当前文件命令
        const parseCurrentFileCommand = vscode.commands.registerCommand(
            'plsqlOutline.parseCurrentFile',
            () => this.parseCurrentFile()
        );

        // 切换调试模式命令
        const toggleDebugModeCommand = vscode.commands.registerCommand(
            'plsqlOutline.toggleDebugMode',
            () => this.dataBridge.getDebugManager().toggleDebugMode()
        );

        // 显示解析统计命令
        const showStatsCommand = vscode.commands.registerCommand(
            'plsqlOutline.showStats',
            () => this.showParseStatistics()
        );

        // 导出解析结果命令
        const exportResultCommand = vscode.commands.registerCommand(
            'plsqlOutline.exportResult',
            () => this.exportParseResult()
        );

        context.subscriptions.push(
            parseCurrentFileCommand,
            toggleDebugModeCommand,
            showStatsCommand,
            exportResultCommand
        );
    }

    /**
     * 注册事件监听器
     */
    private registerEventListeners(context: vscode.ExtensionContext): void {
        // 监听活动编辑器变化
        const activeEditorListener = vscode.window.onDidChangeActiveTextEditor(
            (editor) => this.onActiveEditorChanged(editor)
        );

        // 监听文档保存
        const documentSaveListener = vscode.workspace.onDidSaveTextDocument(
            (document) => this.onDocumentSaved(document)
        );

        // 监听配置变化
        const configurationListener = vscode.workspace.onDidChangeConfiguration(
            (event) => this.onConfigurationChanged(event)
        );

        context.subscriptions.push(
            activeEditorListener,
            documentSaveListener,
            configurationListener
        );
    }

    /**
     * 解析当前文件
     */
    private async parseCurrentFile(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('没有活动的编辑器');
            return;
        }

        const document = editor.document;
        if (!this.isPLSQLFile(document)) {
            vscode.window.showWarningMessage('当前文件不是PL/SQL文件');
            return;
        }

        try {
            // 显示进度
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: '正在解析PL/SQL文件...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: '开始解析' });

                // 解析文件
                const content = document.getText();
                const sourceFile = document.fileName;
                
                progress.report({ increment: 30, message: '解析中...' });
                const parseResult = await this.parser.parse(content, sourceFile);
                
                progress.report({ increment: 60, message: '处理结果...' });
                
                // 通过数据桥接器处理结果
                this.currentParseResult = await this.dataBridge.processParseResult(parseResult, sourceFile);
                
                progress.report({ increment: 80, message: '更新视图...' });
                
                // 更新树视图
                const dataProvider = this.dataProviderFactory.createDataProvider(this.currentParseResult);
                this.treeViewManager.updateDataProvider(dataProvider);
                
                // 更新树视图标题
                const fileName = this.getFileName(sourceFile);
                this.treeViewManager.setTitle(`PL/SQL大纲 - ${fileName}`);
                
                progress.report({ increment: 100, message: '完成' });
            });

            // 显示解析结果摘要
            this.showParseSummary();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            vscode.window.showErrorMessage(`解析失败: ${errorMessage}`);
            
            // 记录错误
            await this.dataBridge.getLogger().error(`解析失败: ${errorMessage}`);
        }
    }

    /**
     * 活动编辑器变化处理
     */
    private async onActiveEditorChanged(editor: vscode.TextEditor | undefined): Promise<void> {
        if (!editor) {
            return;
        }

        const document = editor.document;
        if (this.isPLSQLFile(document)) {
            // 检查是否启用自动解析
            const config = vscode.workspace.getConfiguration('plsql-outline');
            const autoParseOnSwitch = config.get('parsing.autoParseOnSwitch', true);
            
            if (autoParseOnSwitch) {
                await this.parseCurrentFile();
            }
        }
    }

    /**
     * 文档保存处理
     */
    private async onDocumentSaved(document: vscode.TextDocument): Promise<void> {
        if (this.isPLSQLFile(document)) {
            // 检查是否启用保存时自动解析
            const config = vscode.workspace.getConfiguration('plsql-outline');
            const autoParseOnSave = config.get('parsing.autoParseOnSave', true);
            
            if (autoParseOnSave) {
                await this.parseCurrentFile();
            }
        }
    }

    /**
     * 配置变化处理
     */
    private onConfigurationChanged(event: vscode.ConfigurationChangeEvent): void {
        if (event.affectsConfiguration('plsql-outline')) {
            // 刷新数据桥接器配置
            this.dataBridge.refreshConfig();
            
            // 刷新树视图
            this.treeViewManager.refresh();
        }
    }

    /**
     * 检查是否为PL/SQL文件
     */
    private isPLSQLFile(document: vscode.TextDocument): boolean {
        const languageId = document.languageId;
        const fileName = document.fileName.toLowerCase();
        
        // 检查语言ID
        if (languageId === 'plsql' || languageId === 'sql') {
            return true;
        }
        
        // 检查文件扩展名
        const plsqlExtensions = ['.sql', '.pks', '.pkb', '.prc', '.fnc', '.trg'];
        return plsqlExtensions.some(ext => fileName.endsWith(ext));
    }

    /**
     * 获取文件名（不含路径）
     */
    private getFileName(filePath: string): string {
        const parts = filePath.split(/[/\\]/);
        return parts[parts.length - 1];
    }

    /**
     * 显示解析摘要
     */
    private showParseSummary(): void {
        if (!this.currentParseResult) {
            return;
        }

        const result = this.currentParseResult;
        const nodeCount = result.nodes.length;
        const parseTime = result.metadata.parseTime;
        const errorCount = result.metadata.errors.length;
        const warningCount = result.metadata.warnings.length;

        let message = `解析完成: 发现 ${nodeCount} 个节点`;
        if (parseTime > 0) {
            message += `, 用时 ${parseTime}ms`;
        }
        
        if (errorCount > 0 || warningCount > 0) {
            message += ` (${errorCount} 个错误, ${warningCount} 个警告)`;
            vscode.window.showWarningMessage(message);
        } else {
            vscode.window.showInformationMessage(message);
        }
    }

    /**
     * 显示解析统计
     */
    private async showParseStatistics(): Promise<void> {
        if (!this.currentParseResult) {
            vscode.window.showInformationMessage('没有可用的解析结果');
            return;
        }

        const result = this.currentParseResult;
        const stats = [
            `文件: ${result.metadata.sourceFile}`,
            `节点数量: ${result.nodes.length}`,
            `总行数: ${result.metadata.totalLines}`,
            `解析时间: ${result.metadata.parseTime}ms`,
            `最大嵌套深度: ${result.metadata.maxNestingDepth}`,
            `错误数量: ${result.metadata.errors.length}`,
            `警告数量: ${result.metadata.warnings.length}`,
            `解析器版本: ${result.metadata.version}`
        ];

        const statsText = stats.join('\n');
        
        // 显示在新的文档中
        const document = await vscode.workspace.openTextDocument({
            content: statsText,
            language: 'plaintext'
        });
        
        await vscode.window.showTextDocument(document);
    }

    /**
     * 导出解析结果
     */
    private async exportParseResult(): Promise<void> {
        if (!this.currentParseResult) {
            vscode.window.showInformationMessage('没有可用的解析结果');
            return;
        }

        try {
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('plsql-parse-result.json'),
                filters: {
                    'JSON文件': ['json'],
                    '所有文件': ['*']
                }
            });

            if (uri) {
                const content = JSON.stringify(this.currentParseResult, null, 2);
                await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
                vscode.window.showInformationMessage(`解析结果已导出到: ${uri.fsPath}`);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            vscode.window.showErrorMessage(`导出失败: ${errorMessage}`);
        }
    }

    /**
     * 获取当前解析结果
     */
    getCurrentParseResult(): ParseResult | null {
        return this.currentParseResult;
    }

    /**
     * 获取树视图管理器
     */
    getTreeViewManager(): TreeViewManager {
        return this.treeViewManager;
    }

    /**
     * 获取数据桥接器
     */
    getDataBridge(): DataBridge {
        return this.dataBridge;
    }

    /**
     * 销毁资源
     */
    dispose(): void {
        this.treeViewManager.dispose();
    }
}

// 扩展实例
let extensionInstance: PLSQLOutlineExtension | undefined;

/**
 * 扩展激活函数
 */
export function activate(context: vscode.ExtensionContext): void {
    console.log('PL/SQL Outline 扩展正在激活...');

    try {
        // 创建扩展实例
        extensionInstance = new PLSQLOutlineExtension(context);
        
        // 注册扩展实例到上下文
        context.subscriptions.push({
            dispose: () => {
                if (extensionInstance) {
                    extensionInstance.dispose();
                    extensionInstance = undefined;
                }
            }
        });

        console.log('PL/SQL Outline 扩展激活成功');

        // 如果当前有活动的PL/SQL文件，自动解析
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && extensionInstance) {
            const document = activeEditor.document;
            const languageId = document.languageId;
            const fileName = document.fileName.toLowerCase();
            
            if (languageId === 'plsql' || languageId === 'sql' || 
                ['.sql', '.pks', '.pkb', '.prc', '.fnc', '.trg'].some(ext => fileName.endsWith(ext))) {
                
                // 延迟执行，确保扩展完全激活
                setTimeout(() => {
                    vscode.commands.executeCommand('plsqlOutline.parseCurrentFile');
                }, 1000);
            }
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        console.error('PL/SQL Outline 扩展激活失败:', errorMessage);
        vscode.window.showErrorMessage(`PL/SQL Outline 扩展激活失败: ${errorMessage}`);
    }
}

/**
 * 扩展停用函数
 */
export function deactivate(): void {
    console.log('PL/SQL Outline 扩展正在停用...');
    
    if (extensionInstance) {
        extensionInstance.dispose();
        extensionInstance = undefined;
    }
    
    console.log('PL/SQL Outline 扩展停用完成');
}

/**
 * 获取扩展实例（用于测试）
 */
export function getExtensionInstance(): PLSQLOutlineExtension | undefined {
    return extensionInstance;
}

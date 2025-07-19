import * as vscode from 'vscode';
import { PLSQLParser } from './parser';
import { TreeViewManager } from './treeView';
import { DataBridge, DataProviderFactory } from './debug';
import { ParseResult } from './types';
import { SettingsPanel } from './settingsPanel';

/**
 * PL/SQL大纲扩展主类 - 内存优化版本
 */
export class PLSQLOutlineExtension {
    private parser: PLSQLParser;
    private treeViewManager: TreeViewManager;
    private dataBridge: DataBridge;
    private dataProviderFactory: DataProviderFactory;
    private currentParseResult: ParseResult | null = null;

    // 内存监控相关
    private memoryCheckInterval: NodeJS.Timeout | null = null;
    private lastMemoryCheck: number = 0;
    private parseCount: number = 0;
    private maxParseCount: number = 100; // 最大解析次数，超过后强制清理

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
        this.startMemoryMonitoring();
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

        // 测试展开所有命令
        const testExpandAllCommand = vscode.commands.registerCommand(
            'plsqlOutline.testExpandAll',
            () => {
                console.log('测试展开所有命令被调用');
                vscode.window.showInformationMessage('展开所有命令测试成功！');
            }
        );

        // 展开所有命令 - 委托给TreeViewManager
        const expandAllCommand = vscode.commands.registerCommand(
            'plsqlOutline.expandAll',
            () => {
                console.log('展开所有命令被调用，委托给TreeViewManager');
                return this.treeViewManager.expandAll();
            }
        );

        context.subscriptions.push(
            parseCurrentFileCommand,
            toggleDebugModeCommand,
            showStatsCommand,
            exportResultCommand,
            testExpandAllCommand,
            expandAllCommand
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
     * 解析当前文件 - 内存优化版本
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
            // 内存检查
            this.checkMemoryUsage();
            
            // 增加解析计数
            this.parseCount++;
            
            // 定期清理内存
            if (this.parseCount >= this.maxParseCount) {
                await this.performMemoryCleanup();
                this.parseCount = 0;
            }

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
                
                // 文件大小检查
                if (content.length > 5 * 1024 * 1024) { // 5MB限制
                    throw new Error('文件过大，建议分割后再解析');
                }
                
                progress.report({ increment: 30, message: '解析中...' });
                
                // 清理之前的解析结果
                if (this.currentParseResult) {
                    this.currentParseResult = null;
                }
                
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
            
            // 错误时也要清理内存
            await this.performMemoryCleanup();
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
        
        // 从配置中获取支持的文件扩展名
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const configuredExtensions = config.get<string[]>('fileExtensions', ['.sql', '.fnc', '.fcn', '.prc', '.pks', '.pkb', '.typ']);
        
        // 检查文件扩展名
        return configuredExtensions.some(ext => fileName.endsWith(ext.toLowerCase()));
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
        const errorCount = result.metadata.errors.length;
        const warningCount = result.metadata.warnings.length;

        // 只在有错误或警告时显示通知
        if (errorCount > 0 || warningCount > 0) {
            const message = `解析完成，但发现问题: ${errorCount} 个错误, ${warningCount} 个警告`;
            vscode.window.showWarningMessage(message);
        }
        // 正常情况下不显示通知
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
     * 开始内存监控
     */
    private startMemoryMonitoring(): void {
        // 每5分钟检查一次内存使用情况
        this.memoryCheckInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, 5 * 60 * 1000);
    }

    /**
     * 检查内存使用情况
     */
    private checkMemoryUsage(): void {
        const now = Date.now();
        
        // 避免频繁检查
        if (now - this.lastMemoryCheck < 30000) { // 30秒内不重复检查
            return;
        }
        
        this.lastMemoryCheck = now;
        
        try {
            if (process.memoryUsage) {
                const memUsage = process.memoryUsage();
                const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
                const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
                
                console.log(`内存使用情况: ${heapUsedMB}MB / ${heapTotalMB}MB`);
                
                // 如果堆内存使用超过200MB，触发清理
                if (heapUsedMB > 200) {
                    console.warn('内存使用过高，触发清理');
                    this.performMemoryCleanup();
                }
            }
        } catch (error) {
            console.error('内存检查失败:', error);
        }
    }

    /**
     * 执行内存清理
     */
    private async performMemoryCleanup(): Promise<void> {
        try {
            console.log('开始内存清理...');
            
            // 清理解析结果
            this.currentParseResult = null;
            
            // 清理树视图缓存
            if (this.treeViewManager && this.treeViewManager.getProvider()) {
                this.treeViewManager.getProvider().refresh();
            }
            
            // 强制垃圾回收（如果可用）
            if (global.gc) {
                global.gc();
                console.log('已执行垃圾回收');
            }
            
            console.log('内存清理完成');
            
        } catch (error) {
            console.error('内存清理失败:', error);
        }
    }

    /**
     * 停止内存监控
     */
    private stopMemoryMonitoring(): void {
        if (this.memoryCheckInterval) {
            clearInterval(this.memoryCheckInterval);
            this.memoryCheckInterval = null;
        }
    }

    /**
     * 销毁资源 - 内存优化版本
     */
    dispose(): void {
        // 停止内存监控
        this.stopMemoryMonitoring();
        
        // 执行最终清理
        this.performMemoryCleanup();
        
        // 销毁树视图
        this.treeViewManager.dispose();
        
        // 清理所有引用
        this.currentParseResult = null;
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
        
        // 注册设置页面命令
        const openSettingsCommand = vscode.commands.registerCommand(
            'plsqlOutline.openSettings',
            () => SettingsPanel.createOrShow(context.extensionUri)
        );
        
        // 注册扩展实例到上下文
        context.subscriptions.push(
            openSettingsCommand,
            {
                dispose: () => {
                    if (extensionInstance) {
                        extensionInstance.dispose();
                        extensionInstance = undefined;
                    }
                }
            }
        );

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

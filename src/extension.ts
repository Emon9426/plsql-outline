import * as vscode from 'vscode';
import * as path from 'path';
import { PLSQLParser } from './parser';
import { TreeViewManager } from './treeView';
import { DataBridge, DataProviderFactory } from './debug';
import { ParseResult, ParseNode, VariableInfo, NodeType } from './types';
import { SettingsPanel } from './settingsPanel';
import { SymbolIndex, SymbolEntry, PathConfig } from './symbolIndex';

/**
 * PL/SQL大纲扩展主类 - 内存优化版本
 */
export class PLSQLOutlineExtension {
    private parser: PLSQLParser;
    private treeViewManager: TreeViewManager;
    private dataBridge: DataBridge;
    private dataProviderFactory: DataProviderFactory;
    private currentParseResult: ParseResult | null = null;

    // 跨文件符号索引
    private symbolIndex: SymbolIndex;
    private outputChannel: vscode.OutputChannel;

    // 内存监控相关
    private memoryCheckInterval: NodeJS.Timeout | null = null;
    private lastMemoryCheck: number = 0;
    private parseCount: number = 0;
    private maxParseCount: number = 100; // 最大解析次数，超过后强制清理

    /**
     * 调试日志输出 - 只有在启用调试模式时才输出
     */
    private debugLog(message: string, ...args: any[]): void {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const debugEnabled = config.get('debug.enabled', false);
        
        if (debugEnabled) {
            console.log(`[PL/SQL Outline Debug] ${message}`, ...args);
        }
    }

    /**
     * 调试警告输出 - 只有在启用调试模式时才输出
     */
    private debugWarn(message: string, ...args: any[]): void {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const debugEnabled = config.get('debug.enabled', false);
        
        if (debugEnabled) {
            console.warn(`[PL/SQL Outline Debug] ${message}`, ...args);
        }
    }

    /**
     * 调试错误输出 - 只有在启用调试模式时才输出
     */
    private debugError(message: string, ...args: any[]): void {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const debugEnabled = config.get('debug.enabled', false);
        
        if (debugEnabled) {
            console.error(`[PL/SQL Outline Debug] ${message}`, ...args);
        }
    }

    constructor(context: vscode.ExtensionContext) {
        this.parser = new PLSQLParser();
        this.treeViewManager = new TreeViewManager(context);
        this.dataBridge = new DataBridge();
        this.dataProviderFactory = new DataProviderFactory(
            this.dataBridge.getDebugManager(),
            this.dataBridge.getLogger()
        );

        // 初始化符号索引
        this.outputChannel = vscode.window.createOutputChannel('PL/SQL Outline');
        this.symbolIndex = new SymbolIndex(this.outputChannel);

        this.registerCommands(context);
        this.registerEventListeners(context);
        this.registerProviders(context);
        this.startMemoryMonitoring();
        this.initializeSymbolIndex(context);
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
                this.debugLog('测试展开所有命令被调用');
                vscode.window.showInformationMessage('展开所有命令测试成功！');
            }
        );

        // 展开所有命令 - 委托给TreeViewManager
        const expandAllCommand = vscode.commands.registerCommand(
            'plsqlOutline.expandAll',
            () => {
                this.debugLog('展开所有命令被调用，委托给TreeViewManager');
                return this.treeViewManager.expandAll();
            }
        );

        // 重建索引命令
        const rebuildIndexCommand = vscode.commands.registerCommand(
            'plsqlOutline.rebuildIndex',
            () => this.rebuildSymbolIndex()
        );

        context.subscriptions.push(
            parseCurrentFileCommand,
            toggleDebugModeCommand,
            showStatsCommand,
            exportResultCommand,
            testExpandAllCommand,
            expandAllCommand,
            rebuildIndexCommand
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

        // 监听光标位置变化
        const cursorPositionListener = vscode.window.onDidChangeTextEditorSelection(
            (event) => this.onCursorPositionChanged(event)
        );

        context.subscriptions.push(
            activeEditorListener,
            documentSaveListener,
            configurationListener,
            cursorPositionListener
        );
    }

    /**
     * 注册悬停和定义提供者
     */
    private registerProviders(context: vscode.ExtensionContext): void {
        // 注册悬停提供者
        const hoverProvider = vscode.languages.registerHoverProvider(
            [{ language: 'sql' }, { language: 'plsql' }],
            {
                provideHover: (document, position, token) => this.provideHover(document, position, token)
            }
        );

        // 注册定义提供者（Ctrl+Click 跳转）- 使用语言选择器，与悬停提供者一致
        const definitionProvider = vscode.languages.registerDefinitionProvider(
            [{ language: 'sql' }, { language: 'plsql' }],
            {
                provideDefinition: (document, position, token) => this.provideDefinition(document, position, token)
            }
        );

        context.subscriptions.push(hoverProvider, definitionProvider);
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
                
                // 文件大小检查（与 parser 内部 10MB 上限对齐）
                if (content.length > 10 * 1024 * 1024) { // 10MB限制
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
     * 提供悬停信息
     */
    private provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        // 获取当前单词
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return null;
        }

        const hoveredWord = document.getText(wordRange);
        
        // 检查是否有解析结果
        if (!this.currentParseResult) {
            return null;
        }

        // 查找变量定义
        const variableInfo = this.findVariableInParseResult(this.currentParseResult.nodes, hoveredWord, position.line + 1);
        
        if (variableInfo) {
            const contents = new vscode.MarkdownString(`**${variableInfo.name}** \`${variableInfo.type}\`\n\n*Defined in ${variableInfo.scope}*`);
            contents.isTrusted = true;
            contents.supportHtml = true;
            return new vscode.Hover(contents, wordRange);
        }

        return null;
    }

    /**
     * 提供定义位置 - 支持跨文件导航
     */
    private provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {
        // 解析光标处的调用格式 (支持 pkg.proc_name 或 proc_name)
        const callInfo = this.parseCallAtPosition(document, position);
        if (!callInfo) {
            return null;
        }

        // 1. 在当前文件查找变量/游标定义
        if (this.currentParseResult) {
            const variableInfo = this.findVariableInParseResult(
                this.currentParseResult.nodes, callInfo.name, position.line + 1
            );
            if (variableInfo) {
                const definitionPosition = new vscode.Position(variableInfo.line - 1, 0);
                return new vscode.Location(document.uri, definitionPosition);
            }

            // 2. 在当前文件的解析节点中查找函数/过程
            const localNode = this.findNodeInCurrentFile(
                this.currentParseResult.nodes, callInfo.name, callInfo.packageName
            );
            if (localNode) {
                const definitionPosition = new vscode.Position(localNode.declarationLine - 1, 0);
                return new vscode.Location(document.uri, definitionPosition);
            }
        }

        // 3. 跨文件查找 - 使用符号索引
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const pathConfigs = config.get<PathConfig[]>('codeRepository.paths', []);

        if (pathConfigs.length === 0) {
            return null;
        }

        const entries = this.symbolIndex.lookupWithPriority(
            callInfo.name, callInfo.packageName, pathConfigs
        );

        if (entries.length === 0) {
            return null;
        }

        // 过滤掉当前文件中的条目（跨文件跳转不需要）
        const currentFilePath = document.uri.fsPath;
        const crossFileEntries = entries.filter(e =>
            path.normalize(e.filePath).toLowerCase() !== path.normalize(currentFilePath).toLowerCase()
        );

        if (crossFileEntries.length === 0) {
            return null;
        }

        if (crossFileEntries.length === 1) {
            const entry = crossFileEntries[0];
            const uri = vscode.Uri.file(entry.filePath);
            const pos = new vscode.Position(entry.line - 1, 0);
            return new vscode.Location(uri, pos);
        }

        // 多个跨文件匹配 - 仅 Package 名称显示选择列表
        const isPackageItself = crossFileEntries.some(e =>
            e.type === NodeType.PACKAGE_BODY || e.type === NodeType.PACKAGE_HEADER
        );
        if (isPackageItself) {
            this.showSymbolQuickPick(crossFileEntries);
            return null;
        }

        // Function/Procedure - 优先跳转到 body 定义
        const bodyEntry = crossFileEntries.find(e =>
            e.type === NodeType.FUNCTION || e.type === NodeType.PROCEDURE || e.type === NodeType.TRIGGER
        ) || crossFileEntries[0];
        const uri = vscode.Uri.file(bodyEntry.filePath);
        const pos = new vscode.Position(bodyEntry.line - 1, 0);
        return new vscode.Location(uri, pos);
    }

    /**
     * 解析光标处的调用格式
     * 支持: pkg_name.proc_name 或 proc_name
     */
    private parseCallAtPosition(document: vscode.TextDocument, position: vscode.Position): { name: string; packageName?: string } | null {
        const line = document.lineAt(position.line).text;
        
        // 扩展单词范围来检测 pkg.proc 模式
        const wordRange = document.getWordRangeAtPosition(position, /\w+(?:\.\w+)?/);
        if (!wordRange) {
            return null;
        }

        const text = document.getText(wordRange);
        const dotIndex = text.indexOf('.');

        if (dotIndex > 0) {
            // pkg.proc 格式
            const packageName = text.substring(0, dotIndex);
            const name = text.substring(dotIndex + 1);
            if (name) {
                return { name, packageName };
            }
        }

        // 普通标识符
        const simpleRange = document.getWordRangeAtPosition(position);
        if (!simpleRange) {
            return null;
        }
        const word = document.getText(simpleRange);
        return word ? { name: word } : null;
    }

    /**
     * 在当前文件的解析节点中查找函数/过程
     */
    private findNodeInCurrentFile(nodes: ParseNode[], name: string, packageName?: string): ParseNode | null {
        const upperName = name.toUpperCase();

        for (const node of nodes) {
            // 如果指定了包名，先匹配包
            if (packageName && (node.type === NodeType.PACKAGE_BODY || node.type === NodeType.PACKAGE_HEADER)) {
                if (node.name.toUpperCase() === packageName.toUpperCase()) {
                    const found = this.findProcFuncInChildren(node.children, upperName);
                    if (found) return found;
                }
            } else if (!packageName) {
                // 检查当前节点
                if (this.isCallableNode(node) && node.name.toUpperCase() === upperName) {
                    return node;
                }
                // 搜索 Package Body/Header 内的子方法（同包内不带前缀调用）
                if (node.type === NodeType.PACKAGE_BODY || node.type === NodeType.PACKAGE_HEADER) {
                    const found = this.findProcFuncInChildren(node.children, upperName);
                    if (found) return found;
                }
                // 递归子节点
                const found = this.findNodeInCurrentFile(node.children, name);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * 在子节点中查找过程/函数
     */
    private findProcFuncInChildren(children: ParseNode[], upperName: string): ParseNode | null {
        for (const child of children) {
            if (this.isCallableNode(child) && child.name.toUpperCase() === upperName) {
                return child;
            }
        }
        return null;
    }

    /**
     * 判断节点是否为可调用类型
     */
    private isCallableNode(node: ParseNode): boolean {
        return node.type === NodeType.FUNCTION ||
            node.type === NodeType.PROCEDURE ||
            node.type === NodeType.FUNCTION_DECLARATION ||
            node.type === NodeType.PROCEDURE_DECLARATION;
    }

    /**
     * 显示符号选择列表
     */
    private async showSymbolQuickPick(entries: SymbolEntry[]): Promise<void> {
        // Body 优先排在前面
        const sorted = [...entries].sort((a, b) => {
            const aIsBody = a.type === NodeType.PACKAGE_BODY || a.type === NodeType.FUNCTION || a.type === NodeType.PROCEDURE;
            const bIsBody = b.type === NodeType.PACKAGE_BODY || b.type === NodeType.FUNCTION || b.type === NodeType.PROCEDURE;
            if (aIsBody && !bIsBody) return -1;
            if (!aIsBody && bIsBody) return 1;
            return 0;
        });

        const items = sorted.map(entry => {
            const fileName = path.basename(entry.filePath);
            const typeLabel = entry.type === NodeType.FUNCTION || entry.type === NodeType.FUNCTION_DECLARATION
                ? 'Function' : 'Procedure';
            const pkgInfo = entry.packageName ? `${entry.packageName}.` : '';
            return {
                label: `$(symbol-method) ${pkgInfo}${entry.name}`,
                description: `${typeLabel} - Line ${entry.line}`,
                detail: entry.filePath,
                entry
            };
        });

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '选择要跳转的定义',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (selected) {
            const uri = vscode.Uri.file(selected.entry.filePath);
            const pos = new vscode.Position(selected.entry.line - 1, 0);
            const doc = await vscode.workspace.openTextDocument(uri);
            const editor = await vscode.window.showTextDocument(doc);
            editor.selection = new vscode.Selection(pos, pos);
            editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
        }
    }

    /**
     * 初始化符号索引
     */
    private async initializeSymbolIndex(context: vscode.ExtensionContext): Promise<void> {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const autoIndex = config.get<boolean>('codeRepository.autoIndex', true);
        const pathConfigs = config.get<PathConfig[]>('codeRepository.paths', []);

        if (!autoIndex || pathConfigs.length === 0) {
            return;
        }

        // 尝试加载缓存的索引
        const storagePath = context.globalStorageUri
            ? path.join(context.globalStorageUri.fsPath, 'symbol-index.json')
            : '';

        if (storagePath) {
            const loaded = await this.symbolIndex.load(storagePath);
            if (loaded) {
                this.outputChannel.appendLine('已从缓存加载符号索引');
            }
        }

        // 后台构建/刷新索引
        const fileExtensions = config.get<string[]>('codeRepository.fileExtensions',
            ['.sql', '.fnc', '.fcn', '.prc', '.pks', '.pkb', '.typ']);
        const maxFiles = config.get<number>('codeRepository.maxFiles', 5000);

        setTimeout(async () => {
            await this.symbolIndex.buildIndex(pathConfigs, fileExtensions, maxFiles);
            this.symbolIndex.setupWatchers(pathConfigs, fileExtensions);

            // 保存索引到缓存
            if (storagePath) {
                await this.symbolIndex.save(storagePath);
            }
        }, 3000); // 延迟3秒，避免影响启动速度
    }

    /**
     * 重建符号索引
     */
    private async rebuildSymbolIndex(): Promise<void> {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const pathConfigs = config.get<PathConfig[]>('codeRepository.paths', []);

        if (pathConfigs.length === 0) {
            vscode.window.showWarningMessage(
                '未配置代码仓库路径。请在设置中配置 plsql-outline.codeRepository.paths'
            );
            return;
        }

        const fileExtensions = config.get<string[]>('codeRepository.fileExtensions',
            ['.sql', '.fnc', '.fcn', '.prc', '.pks', '.pkb', '.typ']);
        const maxFiles = config.get<number>('codeRepository.maxFiles', 5000);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '正在重建PL/SQL符号索引...',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: '扫描文件...' });
            await this.symbolIndex.buildIndex(pathConfigs, fileExtensions, maxFiles);
            progress.report({ increment: 100, message: '完成' });

            const status = this.symbolIndex.getStatus();
            vscode.window.showInformationMessage(
                `索引重建完成: ${status.fileCount} 文件, ${status.symbolCount} 符号`
            );
        });
    }

    /**
     * 在解析结果中查找变量（大小写不敏感）
     */
    private findVariableInParseResult(nodes: ParseNode[], variableName: string, currentLine: number): VariableInfo | null {
        const upperName = variableName.toUpperCase();
        // 遍历所有节点查找变量
        for (const node of nodes) {
            // 首先检查当前节点的作用域是否包含当前行
            if (this.isNodeScopeContainsLine(node, currentLine)) {
                // 在当前节点的变量表中查找（大小写不敏感）
                if (node.variableTable) {
                    for (const [key, info] of node.variableTable) {
                        if (key.toUpperCase() === upperName) {
                            return info;
                        }
                    }
                }
            }
            
            // 递归检查子节点
            const foundInChild = this.findVariableInParseResult(node.children, variableName, currentLine);
            if (foundInChild) {
                return foundInChild;
            }
        }
        
        return null;
    }

    /**
     * 检查节点作用域是否包含指定行
     */
    private isNodeScopeContainsLine(node: ParseNode, line: number): boolean {
        const startLine = node.declarationLine;
        const endLine = node.endLine || Number.MAX_SAFE_INTEGER;
        return line >= startLine && line <= endLine;
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

            // 如果代码仓库配置变化，重建索引
            if (event.affectsConfiguration('plsql-outline.codeRepository')) {
                this.rebuildSymbolIndex();
            }
        }
    }

    /**
     * 光标位置变化处理
     */
    private async onCursorPositionChanged(event: vscode.TextEditorSelectionChangeEvent): Promise<void> {
        const editor = event.textEditor;
        
        // 检查是否为PL/SQL文件
        if (!this.isPLSQLFile(editor.document)) {
            return;
        }

        // 检查是否有解析结果
        if (!this.currentParseResult) {
            this.debugLog('光标同步: 没有解析结果');
            return;
        }

        // 检查配置是否启用自动选中
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const autoSelectOnCursor = config.get('view.autoSelectOnCursor', true);
        
        if (!autoSelectOnCursor) {
            this.debugLog('光标同步: 功能已禁用');
            return;
        }

        // 获取当前光标位置（行号，从1开始）
        const currentLine = event.selections[0].active.line + 1;
        this.debugLog(`光标同步: 当前行号 ${currentLine}`);
        
        // 查找对应的目标（节点或结构块）
        const target = this.findTargetByLine(this.currentParseResult.nodes, currentLine);
        
        if (target) {
            const targetName = target.entry ? target.entry.name : (target.node ? target.node.name : 'N/A');
            this.debugLog(`光标同步: 找到目标 - 类型: ${target.type}, 名称: ${targetName}, 块类型: ${target.blockType || 'N/A'}`);
            // 在大纲视图中选中对应的目标
            await this.treeViewManager.selectAndRevealTarget(target);
        } else {
            this.debugLog(`光标同步: 第${currentLine}行没有找到匹配的目标`);
            // 输出调试信息
            this.debugNodeRanges(this.currentParseResult.nodes, currentLine);
        }
    }

    /**
     * 根据行号查找目标（节点/结构块/声明项）- 严格按照实际行号匹配
     */
    private findTargetByLine(nodes: ParseNode[], line: number): { type: 'node' | 'structureBlock' | 'declarationEntry', node?: ParseNode, blockType?: string, entry?: VariableInfo } | null {
        // 候选项：node/blockType 用于节点与结构块；entry 用于声明项（变量/游标等）
        const candidates: Array<{ node?: ParseNode, blockType?: string, entry?: VariableInfo, priority: number }> = [];

        // 递归收集所有匹配的节点、结构块与声明项
        this.collectCandidates(nodes, line, candidates);

        if (candidates.length === 0) {
            return null;
        }

        // 按优先级排序（优先级越高越优先）
        candidates.sort((a, b) => b.priority - a.priority);

        const best = candidates[0];
        if (best.entry) {
            return { type: 'declarationEntry', node: best.node, entry: best.entry };
        }
        if (best.blockType && best.node) {
            return { type: 'structureBlock', node: best.node, blockType: best.blockType };
        }
        if (best.node) {
            return { type: 'node', node: best.node };
        }
        return null;
    }

    /**
     * 收集候选匹配项（节点 / 结构块 / 声明项）
     */
    private collectCandidates(nodes: ParseNode[], line: number, candidates: Array<{ node?: ParseNode, blockType?: string, entry?: VariableInfo, priority: number }>): void {
        for (const node of nodes) {
            // 声明项（变量/游标/常量/类型/异常）：行号精确匹配，优先级高
            if (node.variableTable) {
                for (const v of node.variableTable.values()) {
                    if (v.line === line) {
                        candidates.push({
                            node: node,
                            entry: v,
                            priority: 1100 + node.level // 声明项优先级最高
                        });
                    }
                }
            }

            // 检查节点的声明行
            if (node.declarationLine === line) {
                candidates.push({
                    node: node,
                    priority: 1000 + node.level // 声明行优先级最高
                });
            }

            // 检查结构块的精确匹配
            if (node.beginLine === line) {
                candidates.push({
                    node: node,
                    blockType: 'BEGIN',
                    priority: 900 + node.level // BEGIN块优先级很高
                });
            }

            if (node.exceptionLine === line) {
                candidates.push({
                    node: node,
                    blockType: 'EXCEPTION',
                    priority: 900 + node.level // EXCEPTION块优先级很高
                });
            }

            if (node.endLine === line) {
                candidates.push({
                    node: node,
                    blockType: 'END',
                    priority: 900 + node.level // END块优先级很高
                });
            }

            // 检查是否在节点的范围内（但不是精确匹配）
            if (this.isLineInNodeRange(node, line) &&
                node.declarationLine !== line &&
                node.beginLine !== line &&
                node.exceptionLine !== line &&
                node.endLine !== line) {

                // 检查是否在特定结构块的范围内
                const blockType = this.getStructureBlockTypeForRange(node, line);
                if (blockType) {
                    candidates.push({
                        node: node,
                        blockType: blockType,
                        priority: 100 + node.level // 范围匹配优先级较低
                    });
                } else {
                    candidates.push({
                        node: node,
                        priority: 50 + node.level // 节点范围匹配优先级最低
                    });
                }
            }

            // 递归检查子节点
            this.collectCandidates(node.children, line, candidates);
        }
    }
    
    /**
     * 检查行号是否在节点范围内
     */
    private isLineInNodeRange(node: ParseNode, line: number): boolean {
        const startLine = node.declarationLine;
        let endLine = node.endLine || startLine;
        
        // 如果有子节点，结束行应该包含所有子节点
        if (node.children.length > 0) {
            const lastChild = this.getLastChildNode(node);
            const lastChildEndLine = lastChild.endLine || lastChild.declarationLine;
            endLine = Math.max(endLine, lastChildEndLine);
        }
        
        return line >= startLine && line <= endLine;
    }
    
    /**
     * 获取行号在节点中对应的结构块类型（范围匹配）
     */
    private getStructureBlockTypeForRange(node: ParseNode, line: number): string | null {
        // 检查是否在BEGIN块范围内
        if (node.beginLine !== null && node.beginLine !== undefined && line > node.beginLine) {
            // 如果有EXCEPTION行，检查是否在BEGIN和EXCEPTION之间
            if (node.exceptionLine !== null && node.exceptionLine !== undefined) {
                if (line < node.exceptionLine) {
                    return 'BEGIN';
                }
            } else if (node.endLine !== null && node.endLine !== undefined) {
                // 没有EXCEPTION行但有END行，检查是否在BEGIN和END之间
                if (line < node.endLine) {
                    return 'BEGIN';
                }
            }
        }
        
        // 检查是否在EXCEPTION块范围内
        if (node.exceptionLine !== null && node.exceptionLine !== undefined && line > node.exceptionLine) {
            if (node.endLine !== null && node.endLine !== undefined) {
                if (line < node.endLine) {
                    return 'EXCEPTION';
                }
            }
        }
        
        return null;
    }

    /**
     * 根据行号查找节点
     */
    private findNodeByLine(nodes: ParseNode[], line: number): ParseNode | null {
        for (const node of nodes) {
            // 检查当前节点的行号范围
            if (this.isLineInNode(node, line)) {
                // 先检查子节点，优先选择更具体的节点
                const childNode = this.findNodeByLine(node.children, line);
                if (childNode) {
                    return childNode;
                }
                // 如果子节点中没有找到，返回当前节点
                return node;
            }
        }
        return null;
    }

    /**
     * 获取结构块类型
     */
    private getStructureBlockType(node: ParseNode, line: number): string | null {
        // 检查是否在END行
        if (node.endLine !== null && node.endLine !== undefined && line === node.endLine) {
            return 'END';
        }
        
        // 检查是否在EXCEPTION块中
        if (node.exceptionLine !== null && node.exceptionLine !== undefined) {
            if (line >= node.exceptionLine) {
                // 如果有END行，检查是否在EXCEPTION和END之间
                if (node.endLine !== null && node.endLine !== undefined) {
                    if (line < node.endLine) {
                        return 'EXCEPTION';
                    }
                } else {
                    // 没有END行，从EXCEPTION行开始都算EXCEPTION块
                    return 'EXCEPTION';
                }
            }
        }
        
        // 检查是否在BEGIN块中
        if (node.beginLine !== null && node.beginLine !== undefined) {
            if (line >= node.beginLine) {
                // 如果有EXCEPTION行，检查是否在BEGIN和EXCEPTION之间
                if (node.exceptionLine !== null && node.exceptionLine !== undefined) {
                    if (line < node.exceptionLine) {
                        return 'BEGIN';
                    }
                } else if (node.endLine !== null && node.endLine !== undefined) {
                    // 没有EXCEPTION行但有END行，检查是否在BEGIN和END之间
                    if (line < node.endLine) {
                        return 'BEGIN';
                    }
                } else {
                    // 没有EXCEPTION行也没有END行，从BEGIN行开始都算BEGIN块
                    return 'BEGIN';
                }
            }
        }
        
        return null;
    }

    /**
     * 检查行号是否在节点范围内
     */
    private isLineInNode(node: ParseNode, line: number): boolean {
        // 节点的开始行是声明行
        const startLine = node.declarationLine;
        
        // 节点的结束行是endLine，如果没有则使用声明行
        let endLine = node.endLine || startLine;
        
        // 如果有子节点，结束行应该包含所有子节点
        if (node.children.length > 0) {
            const lastChild = this.getLastChildNode(node);
            const lastChildEndLine = lastChild.endLine || lastChild.declarationLine;
            endLine = Math.max(endLine, lastChildEndLine);
        }
        
        return line >= startLine && line <= endLine;
    }

    /**
     * 获取最后一个子节点（递归）
     */
    private getLastChildNode(node: ParseNode): ParseNode {
        if (node.children.length === 0) {
            return node;
        }
        
        // 找到声明行最大的子节点
        let lastChild = node.children[0];
        for (const child of node.children) {
            if (child.declarationLine > lastChild.declarationLine) {
                lastChild = child;
            }
        }
        
        // 递归查找最后的子节点
        return this.getLastChildNode(lastChild);
    }

    /**
     * 调试节点范围信息
     */
    private debugNodeRanges(nodes: ParseNode[], targetLine: number, level: number = 0): void {
        const indent = '  '.repeat(level);
        for (const node of nodes) {
            const startLine = node.declarationLine;
            let endLine = node.endLine || startLine;
            
            // 如果有子节点，结束行应该包含所有子节点
            if (node.children.length > 0) {
                const lastChild = this.getLastChildNode(node);
                const lastChildEndLine = lastChild.endLine || lastChild.declarationLine;
                endLine = Math.max(endLine, lastChildEndLine);
            }
            
            const inRange = targetLine >= startLine && targetLine <= endLine;
            this.debugLog(`${indent}节点: ${node.name} (${node.type}) - 行范围: ${startLine}-${endLine} - 包含第${targetLine}行: ${inRange}`);
            
            if (node.beginLine) {
                this.debugLog(`${indent}  BEGIN: ${node.beginLine}`);
            }
            if (node.exceptionLine) {
                this.debugLog(`${indent}  EXCEPTION: ${node.exceptionLine}`);
            }
            if (node.endLine) {
                this.debugLog(`${indent}  END: ${node.endLine}`);
            }
            
            if (node.children.length > 0) {
                this.debugNodeRanges(node.children, targetLine, level + 1);
            }
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
                
                this.debugLog(`内存使用情况: ${heapUsedMB}MB / ${heapTotalMB}MB`);
                
                // 如果堆内存使用超过200MB，触发清理
                if (heapUsedMB > 200) {
                    this.debugWarn('内存使用过高，触发清理');
                    this.performMemoryCleanup();
                }
            }
        } catch (error) {
            this.debugError('内存检查失败:', error);
        }
    }

    /**
     * 执行内存清理
     */
    private async performMemoryCleanup(): Promise<void> {
        try {
            this.debugLog('开始内存清理...');
            
            // 清理解析结果
            this.currentParseResult = null;
            
            // 清理树视图缓存
            if (this.treeViewManager && this.treeViewManager.getProvider()) {
                this.treeViewManager.getProvider().refresh();
            }
            
            // 强制垃圾回收（如果可用）
            if (global.gc) {
                global.gc();
                this.debugLog('已执行垃圾回收');
            }
            
            this.debugLog('内存清理完成');
            
        } catch (error) {
            this.debugError('内存清理失败:', error);
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
        
        // 销毁符号索引
        this.symbolIndex.dispose();
        this.outputChannel.dispose();
        
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
    // 扩展激活日志始终输出，不受调试模式控制
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

        // 扩展激活成功日志始终输出
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
        // 错误日志始终输出
        console.error('PL/SQL Outline 扩展激活失败:', errorMessage);
        vscode.window.showErrorMessage(`PL/SQL Outline 扩展激活失败: ${errorMessage}`);
    }
}

/**
 * 扩展停用函数
 */
export function deactivate(): void {
    // 扩展停用日志始终输出，不受调试模式控制
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

import * as vscode from 'vscode';
import * as path from 'path';
import { PLSQLParser, ParseCancelledError } from './parser';
import { TreeViewManager, MemoryDataProvider } from './treeView';
import { DebugManager } from './debug';
import { ParseResult, ParseNode, VariableInfo, NodeType, DeclarationCategory, LogLevel } from './types';
import { SettingsPanel } from './settingsPanel';
import { SymbolIndex, SymbolEntry, PathConfig } from './symbolIndex';
import { getOutputChannel, disposeOutputChannel } from './logger';
import { computeFoldRanges } from './folding';
import { maskLiteralsAndComments, buildKeywordGroups, matchKeywordGroup, KeywordGroup } from './highlight';
import { DEFAULT_FILE_EXTENSIONS, isCallableNode, buildSqlMarkdownBlock } from './shared';
import { OutlineSearchViewProvider } from './searchBox';

/**
 * 提供者共享文档选择器（悬停/定义/折叠，Issue #26）：
 * 除语言 ID 外放行所有本地/未保存文档，回调内由 isPLSQLFile 统一裁决
 * （语言 ID 或 plsql-outline.fileExtensions 配置扩展名）。仅按语言 ID 注册时，
 * 配置扩展名识别的文档（如 .fcn/.typ 以 plaintext 或其他扩展的语言打开）
 * 永远到不了提供者回调——大纲可用而折叠/悬停/跳转失效。
 */
const PLSQL_DOC_SELECTOR: vscode.DocumentSelector = [
    { language: 'sql' },
    { language: 'plsql' },
    { scheme: 'file' },
    { scheme: 'untitled' }
];

/**
 * 是否为控制结构节点类型（与 treeView.PLSQLOutlineProvider.isControlStructureType 同集）。
 * 光标跟随（findTargetByLine）用它区分控制结构与普通节点以计算候选优先级。
 */
function isControlStructureNodeType(type: NodeType): boolean {
    return type === NodeType.IF_STATEMENT ||
        type === NodeType.ELSIF_BRANCH ||
        type === NodeType.ELSE_BRANCH ||
        type === NodeType.LOOP_STATEMENT ||
        type === NodeType.WHILE_LOOP ||
        type === NodeType.FOR_LOOP ||
        type === NodeType.CASE_STATEMENT ||
        type === NodeType.WHEN_BRANCH;
}

/**
 * PL/SQL大纲扩展主类 - 内存优化版本
 */
export class PLSQLOutlineExtension {
    private treeViewManager: TreeViewManager;
    private debugManager: DebugManager;
    private currentParseResult: ParseResult | null = null;

    // 跨文件符号索引
    private symbolIndex: SymbolIndex;
    private outputChannel: vscode.OutputChannel;

    // 内存监控相关
    private memoryCheckInterval: NodeJS.Timeout | null = null;
    private lastMemoryCheck: number = 0;
    private parseCount: number = 0;
    private maxParseCount: number = 100; // 最大解析次数，超过后强制清理

    // 调试开关缓存：避免每次光标移动/每行解析都读取配置（性能修复）
    private debugEnabledCache: boolean = false;

    // 解析结果新鲜度跟踪：(uri, version) 与 currentParseResult 对应的文档快照。
    // 编辑未保存（version 递增）时标记为陈旧，供 Definition/Hover/光标同步按需重解析。
    private lastParsedKey: { uri: string; version: number } | null = null;
    // 静默解析去重：并发触发时共享同一次解析
    private quietParseInFlight: Promise<void> | null = null;
    // 编辑内容变化的防抖重解析（保持大纲/跳转与未保存编辑一致）
    private changeDebounceTimer: NodeJS.Timeout | null = null;
    // 最近一个 PL/SQL 活动编辑器：大纲树获得焦点时 activeTextEditor 为 undefined，
    // 顶部 Refresh 按钮需回退到此编辑器解析（否则出现"点了没反应"，Issue #23 评审 H1）
    private lastActivePLSQLEditor: vscode.TextEditor | null = null;
    // 提供者解析缓存：uri → 文档版本 + 解析结果（折叠与关键字配对高亮共用同一次
    // 解析，掩码/配对组在同版本内懒计算一次，Issue #23/#31）
    private parseResultCache: Map<string, {
        version: number;
        result: ParseResult;
        maskedLines: string[] | null;
        keywordGroups: KeywordGroup[] | null;
    }> = new Map();
    // 缓存上限（可见编辑器数量级，超出淘汰最早条目）
    private static readonly PARSE_CACHE_MAX = 8;
    // 结构关键字集合（Issue #31）：命中才尝试配对组；其余词直接返回空回退原生词高亮
    private static readonly STRUCTURAL_KEYWORDS: ReadonlySet<string> = new Set([
        'DECLARE', 'BEGIN', 'EXCEPTION', 'END', 'IF', 'ELSIF', 'ELSE', 'LOOP', 'FOR', 'WHILE'
    ]);
    // 启动时延迟构建符号索引的定时器（dispose 时取消，防止停用后仍创建 watcher）
    private indexBuildTimer: NodeJS.Timeout | null = null;
    // 索引状态栏项（Issue #38 常驻三态：未启用 / 构建中 / 就绪）
    private indexStatusBar: vscode.StatusBarItem | null = null;
    // 索引磁盘缓存路径（手动重建后同样落盘；记录自 initializeSymbolIndex）
    private indexStoragePath: string = '';

    private refreshDebugCache(): void {
        this.debugEnabledCache = vscode.workspace.getConfiguration('plsql-outline')
            .get('debug.enabled', false);
    }

    /**
     * 调试日志输出 - 只有在启用调试模式时才输出
     */
    private debugLog(message: string, ...args: any[]): void {
        if (this.debugEnabledCache) {
            console.log(`[PL/SQL Outline Debug] ${message}`, ...args);
        }
    }

    /**
     * 调试警告输出 - 只有在启用调试模式时才输出
     */
    private debugWarn(message: string, ...args: any[]): void {
        if (this.debugEnabledCache) {
            console.warn(`[PL/SQL Outline Debug] ${message}`, ...args);
        }
    }

    /**
     * 调试错误输出 - 只有在启用调试模式时才输出
     */
    private debugError(message: string, ...args: any[]): void {
        if (this.debugEnabledCache) {
            console.error(`[PL/SQL Outline Debug] ${message}`, ...args);
        }
    }

    constructor(context: vscode.ExtensionContext) {
        this.treeViewManager = new TreeViewManager(context);
        this.debugManager = new DebugManager();
        this.refreshDebugCache();

        // 初始化符号索引（共享全局唯一输出通道）
        this.outputChannel = getOutputChannel();
        this.symbolIndex = new SymbolIndex(this.outputChannel);
        // 索引状态栏三态 + 状态订阅（Issue #38）
        this.createIndexStatusBar(context);
        this.symbolIndex.setStatusListener(() => this.updateIndexStatusBar());

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
            () => this.debugManager.toggleDebugMode()
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

        // 索引状态栏点击（Issue #38）：未配置→打开设置页；已配置→查看索引日志
        const indexStatusClickCommand = vscode.commands.registerCommand(
            'plsqlOutline.indexStatusClick',
            () => this.onIndexStatusClick()
        );

        // 刷新命令：强制重新解析当前活动文件并刷新大纲（带视图内进度提示）。
        // 旧实现在 TreeViewManager 中仅重绘旧解析结果，文件修改后点击无效（Issue #23）。
        const refreshCommand = vscode.commands.registerCommand(
            'plsqlOutline.refresh',
            () => this.parseCurrentFile()
        );

        context.subscriptions.push(
            parseCurrentFileCommand,
            toggleDebugModeCommand,
            showStatsCommand,
            exportResultCommand,
            expandAllCommand,
            rebuildIndexCommand,
            indexStatusClickCommand,
            refreshCommand
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

        // 监听文档内容变化（编辑未保存场景）：防抖后静默重解析，
        // 保证匿名块等临时代码在边写边 Ctrl+Click 时跳转/大纲不落后于编辑
        const documentChangeListener = vscode.workspace.onDidChangeTextDocument(
            (event) => this.onDocumentChanged(event)
        );

        context.subscriptions.push(
            activeEditorListener,
            documentSaveListener,
            configurationListener,
            cursorPositionListener,
            documentChangeListener
        );
    }

    /**
     * 注册悬停和定义提供者
     */
    private registerProviders(context: vscode.ExtensionContext): void {
        // 注册悬停提供者（选择器与定义/折叠一致：语言 ID + 配置扩展名路由，Issue #26）
        const hoverProvider = vscode.languages.registerHoverProvider(
            PLSQL_DOC_SELECTOR,
            {
                provideHover: (document, position, token) => this.provideHover(document, position, token)
            }
        );

        // 注册定义提供者（Ctrl+Click 跳转）
        const definitionProvider = vscode.languages.registerDefinitionProvider(
            PLSQL_DOC_SELECTOR,
            {
                provideDefinition: (document, position, token) => this.provideDefinition(document, position, token)
            }
        );

        // 注册折叠范围提供者（块结构折叠：Function→END、IF→END IF、LOOP→END LOOP 等，
        // 复用解析器节点起止行号 + BEGIN/EXCEPTION 段折叠，Issue #23/#31）
        const foldingProvider = vscode.languages.registerFoldingRangeProvider(
            PLSQL_DOC_SELECTOR,
            {
                provideFoldingRanges: (document, _context, _token) => this.provideFoldingRanges(document)
            }
        );

        // 注册关键字配对高亮提供者（Issue #31）：双击结构关键字高亮配对组
        // （块：DECLARE/BEGIN/EXCEPTION/END；IF 链；循环），其余返回空——
        // VS Code 对空结果回退原生词高亮，原生行为不受影响
        const highlightProvider = vscode.languages.registerDocumentHighlightProvider(
            PLSQL_DOC_SELECTOR,
            {
                provideDocumentHighlights: (document, position, token) => this.provideDocumentHighlights(document, position, token)
            }
        );

        // 注册大纲搜索框视图（Issue #36）：置于大纲树上方的常驻 Webview 输入框，
        // 输入实时过滤大纲、回车跳转第一个命中项
        const searchViewProvider = new OutlineSearchViewProvider(
            (text) => { void this.treeViewManager.setFilter(text); },
            () => { void this.treeViewManager.revealFirstFilterMatch(); }
        );
        const searchViewRegistration = vscode.window.registerWebviewViewProvider(
            OutlineSearchViewProvider.VIEW_ID,
            searchViewProvider
        );

        context.subscriptions.push(hoverProvider, definitionProvider, foldingProvider, highlightProvider, searchViewRegistration);
    }

    /**
     * 解析当前文件 - 内存优化版本
     */
    private async parseCurrentFile(): Promise<void> {
        // 大纲树获得焦点时 activeTextEditor 为 undefined：回退到最近的 PL/SQL 编辑器
        // （活动编辑器存在但非 PL/SQL 文件时保持原警告语义，不回退）
        let editor = vscode.window.activeTextEditor;
        if (!editor && this.lastActivePLSQLEditor && !this.lastActivePLSQLEditor.document.isClosed) {
            editor = this.lastActivePLSQLEditor;
        }
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

            // 显示进度（可取消：大文件解析期间用户可中断，v1.8.0）。
            // 进度显示在大纲视图内（面板顶部进度条 + 提示），替代右上角通知——
            // 解析期间视图不再空白，且完成（大纲数据已更新）后进度才消失（Issue #23）。
            await vscode.window.withProgress({
                location: { viewId: 'plsqlOutline' },
                title: '正在解析PL/SQL文件...',
                cancellable: true
            }, async (progress, token) => {
                progress.report({ increment: 0, message: '开始解析' });

                // 解析文件
                const content = document.getText();
                // 版本快照必须在解析前读取：解析 await 期间文档可能再次编辑，
                // 事后读 version 会把陈旧结果以新版本号写入缓存/新鲜度标记（评审 M1）
                const documentVersion = document.version;
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

                // PLSQLParser 持有每次解析的可变状态且不可重入：并发解析（切换文件时
                // parseCurrentFile 与 parseDocumentQuiet 交叠）共享实例会互相污染状态，
                // 产生成员丢失/杂交树（Issue #15）。每次解析必须使用独立实例。
                const parseResult = await new PLSQLParser().parse(content, sourceFile, {
                    maxNestingDepth: vscode.workspace.getConfiguration('plsql-outline')
                        .get('parsing.maxNestingDepth', 15),
                    cancellationToken: token
                });
                
                progress.report({ increment: 60, message: '处理结果...' });
                
                this.currentParseResult = parseResult;
                this.debugManager.logParseResult(parseResult, sourceFile);
                this.lastParsedKey = { uri: document.uri.toString(), version: documentVersion };
                this.updateParseResultCache(document.uri.toString(), documentVersion, parseResult);
                // 当前文件符号即时并入索引（Issue #38）：无需等待仓库扫描即可跳转进本文件
                this.upsertCurrentFileIntoIndex(parseResult, document);

                progress.report({ increment: 80, message: '更新视图...' });
                
                // 更新树视图
                this.treeViewManager.updateDataProvider(new MemoryDataProvider(this.currentParseResult));
                
                // 更新树视图标题
                const fileName = this.getFileName(sourceFile);
                this.treeViewManager.setTitle(`PL/SQL大纲 - ${fileName}`);
                
                progress.report({ increment: 100, message: '完成' });
            });

            // 显示解析结果摘要
            this.showParseSummary();

        } catch (error) {
            // 用户主动取消：安静地保持现状，不弹错误
            if (error instanceof ParseCancelledError) {
                vscode.window.setStatusBarMessage('PL/SQL 大纲解析已取消', 3000);
                return;
            }
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            vscode.window.showErrorMessage(`解析失败: ${errorMessage}`);

            // 记录错误
            this.debugManager.outputDebug(`解析失败: ${errorMessage}`, LogLevel.ERROR);

            // 错误时也要清理内存
            await this.performMemoryCleanup();
        }
    }

    /**
     * 解析结果是否与文档当前快照一致（同文档且同版本）
     */
    private isParseResultFresh(document: vscode.TextDocument): boolean {
        return this.currentParseResult !== null &&
            this.lastParsedKey !== null &&
            this.lastParsedKey.uri === document.uri.toString() &&
            this.lastParsedKey.version === document.version;
    }

    /**
     * 静默解析（无进度 UI / 无通知）：供 Definition/Hover/光标同步/编辑防抖按需刷新。
     * 结果与大纲树同步更新；仅当解析结果陈旧（文档或版本不一致）时才真正解析。
     */
    private async parseDocumentQuiet(document: vscode.TextDocument): Promise<void> {
        // 并发触发时共享同一次解析
        if (this.quietParseInFlight) {
            await this.quietParseInFlight;
        }
        if (this.isParseResultFresh(document)) {
            return;
        }

        const task = (async () => {
            // 非 PL/SQL 文档不解析（保持现有结果不被清空）
            if (!this.isPLSQLFile(document)) {
                return;
            }
            const content = document.getText();
            // 版本快照与 parseCurrentFile 同理：await 前读取，防解析期间编辑污染缓存键（评审 M1）
            const documentVersion = document.version;
            if (content.length > 10 * 1024 * 1024) {
                return; // 与 parseCurrentFile 的 10MB 上限一致
            }

            // 与 parseCurrentFile 共享的内存维护策略
            this.parseCount++;
            if (this.parseCount >= this.maxParseCount) {
                await this.performMemoryCleanup();
                this.parseCount = 0;
            }

            // 同上：每次解析独立实例，避免与 parseCurrentFile 并发时互相污染（Issue #15）
            const parseResult = await new PLSQLParser().parse(content, document.fileName, {
                maxNestingDepth: vscode.workspace.getConfiguration('plsql-outline')
                    .get('parsing.maxNestingDepth', 15)
            });

            this.currentParseResult = parseResult;
            this.debugManager.logParseResult(parseResult, document.fileName);
            this.lastParsedKey = { uri: document.uri.toString(), version: documentVersion };
            this.updateParseResultCache(document.uri.toString(), documentVersion, parseResult);
            this.upsertCurrentFileIntoIndex(parseResult, document);

            // 同步大纲视图（树与未保存编辑保持一致）
            this.treeViewManager.updateDataProvider(new MemoryDataProvider(this.currentParseResult));
        })();
        this.quietParseInFlight = task;
        try {
            await task;
        } finally {
            this.quietParseInFlight = null;
        }
    }

    /**
     * 提供折叠范围（FoldingRangeProvider 回调）
     * 选择器已放行全部本地/未保存文档，非 PL/SQL 文档（语言 ID 与配置扩展名均
     * 不匹配）在此返回空（Issue #26）。
     */
    private async provideFoldingRanges(document: vscode.TextDocument): Promise<vscode.FoldingRange[]> {
        if (!this.isPLSQLFile(document)) {
            return [];
        }
        const result = await this.getOrParseForProviders(document);
        // 折叠是辅助功能：超限/解析失败时静默返回空，不干扰编辑器
        return result ? this.toFoldingRanges(result) : [];
    }

    /**
     * 提供关键字配对高亮（DocumentHighlightProvider 回调，Issue #31）
     * 结构关键字（DECLARE/BEGIN/EXCEPTION/END/IF/ELSIF/ELSE/LOOP/FOR/WHILE）命中
     * 配对组时返回组内全部关键字范围；其余（非关键字、字符串/注释内、END CASE 等
     * 未支持结构）返回空——VS Code 对空结果回退原生相同词高亮，原生行为不受影响。
     */
    private async provideDocumentHighlights(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken): Promise<vscode.DocumentHighlight[]> {
        if (!this.isPLSQLFile(document)) {
            return [];
        }
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return [];
        }
        // 本回调在每次光标停留都触发：缓存版本陈旧（编辑后防抖重解析未完成）时
        // 直接让位原生词高亮，避免每次光标移动全量重解析；从未解析过的文档才
        // 兜底解析一次填充缓存（与折叠共用 getOrParseForProviders）
        const uri = document.uri.toString();
        let entry = this.parseResultCache.get(uri);
        if (!entry || entry.version !== document.version) {
            if (entry) {
                return [];
            }
            if (await this.getOrParseForProviders(document) === null) {
                return [];
            }
            entry = this.parseResultCache.get(uri);
            if (!entry || entry.version !== document.version) {
                return []; // 解析期间文档已再编辑：本次让位原生高亮，下次光标停留重算
            }
        }
        // 掩码懒计算（同版本一次）：字符串/注释等长替换为空格，词提取天然跳过非代码区
        if (!entry.maskedLines) {
            entry.maskedLines = maskLiteralsAndComments(document.getText());
        }
        const maskedLine = entry.maskedLines[position.line] ?? '';
        const word = maskedLine.substring(wordRange.start.character, wordRange.end.character);
        if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(word) ||
            !PLSQLOutlineExtension.STRUCTURAL_KEYWORDS.has(word.toUpperCase())) {
            return [];
        }
        if (!entry.keywordGroups) {
            entry.keywordGroups = buildKeywordGroups(entry.result, entry.maskedLines);
        }
        const group = matchKeywordGroup(entry.keywordGroups, position.line + 1, wordRange.start.character, wordRange.end.character);
        if (!group) {
            return [];
        }
        return group.spans.map(s => new vscode.DocumentHighlight(
            new vscode.Range(s.line - 1, s.start, s.line - 1, s.end),
            vscode.DocumentHighlightKind.Text
        ));
    }

    /**
     * 提供者共享的「取缓存或独立解析」（折叠/关键字高亮）：
     * 命中同版本缓存直接返回；未命中则独立解析（PLSQLParser 每次解析必须独立
     * 实例，Issue #15）并回写缓存。超过 10MB 或解析失败返回 null（调用方按各自
     * 语义降级），保证任意可见编辑器（分屏/diff）可用。
     */
    private async getOrParseForProviders(document: vscode.TextDocument): Promise<ParseResult | null> {
        const uri = document.uri.toString();
        const cached = this.parseResultCache.get(uri);
        if (cached && cached.version === document.version) {
            return cached.result;
        }

        // 与大纲解析一致的 10MB 上限
        if (document.getText().length > 10 * 1024 * 1024) {
            return null;
        }

        try {
            const parseResult = await new PLSQLParser().parse(document.getText(), document.fileName, {
                maxNestingDepth: vscode.workspace.getConfiguration('plsql-outline')
                    .get('parsing.maxNestingDepth', 15)
            });
            this.updateParseResultCache(uri, document.version, parseResult);
            return parseResult;
        } catch {
            return null;
        }
    }

    /**
     * 提供者解析缓存更新（解析成功后调用，超出上限淘汰最早条目；掩码/配对组重置为懒计算）
     */
    private updateParseResultCache(uri: string, version: number, result: ParseResult): void {
        if (this.parseResultCache.size >= PLSQLOutlineExtension.PARSE_CACHE_MAX && !this.parseResultCache.has(uri)) {
            const first = this.parseResultCache.keys().next();
            if (!first.done) {
                this.parseResultCache.delete(first.value);
            }
        }
        this.parseResultCache.set(uri, { version, result, maskedLines: null, keywordGroups: null });
    }

    /**
     * 解析结果 → VS Code 折叠范围（FoldRange 为 1-based 闭区间，FoldingRange 为 0-based）
     */
    private toFoldingRanges(result: ParseResult): vscode.FoldingRange[] {
        return computeFoldRanges(result).map(r => new vscode.FoldingRange(r.startLine - 1, r.endLine - 1));
    }

    /**
     * 文档内容变化处理：防抖 500ms 后静默重解析（仅活动编辑器的文档）
     */
    private onDocumentChanged(event: vscode.TextDocumentChangeEvent): void {
        if (this.changeDebounceTimer) {
            clearTimeout(this.changeDebounceTimer);
        }
        this.changeDebounceTimer = setTimeout(() => {
            this.changeDebounceTimer = null;
            const editor = vscode.window.activeTextEditor;
            // 只刷新当前活动文档：非活动文档在切换/使用时由按需刷新兜底
            if (editor && event.document.uri.toString() === editor.document.uri.toString()) {
                this.parseDocumentQuiet(editor.document).catch(() => { /* 解析失败保持现状 */ });
            }
        }, 500);
    }

    /**
     * 提供悬停信息
     */
    private async provideHover(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken): Promise<vscode.Hover | null> {
        // 选择器放行的所有文档在此统一裁决：语言 ID 与配置扩展名均不匹配则不响应（Issue #26）
        if (!this.isPLSQLFile(document)) {
            return null;
        }

        // 按需刷新：文档编辑未保存时解析结果已陈旧（匿名块等临时代码场景）
        await this.parseDocumentQuiet(document);

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
            // 游标声明（Issue #33）：悬浮追加完整 SQL（原文，markdown 代码块）
            if (variableInfo.category === DeclarationCategory.CURSOR && variableInfo.sql) {
                contents.appendMarkdown(`\n\n${buildSqlMarkdownBlock(variableInfo.sql)}`);
            }
            contents.isTrusted = true;
            contents.supportHtml = true;
            return new vscode.Hover(contents, wordRange);
        }

        // 节点名悬浮聚合（Issue #36）：悬浮过程/函数/包等单元名时，展示单元信息
        // 与其直接作用域内声明的全部游标 SQL（与大纲节点 tooltip 同一来源、自适应高度）
        const hoveredNode = this.findNodeByNameInParseResult(this.currentParseResult.nodes, hoveredWord);
        if (hoveredNode) {
            const cursorSqls = this.treeViewManager.getProvider().getScopeCursorSqls(hoveredNode);
            let markdown = `**${hoveredNode.name}**（${hoveredNode.type}，第 ${hoveredNode.declarationLine} 行）`;
            if (cursorSqls.length > 0) {
                const sections = cursorSqls.map(c =>
                    `**游标 ${c.name}**（第 ${c.line} 行）\n\n${buildSqlMarkdownBlock(c.sql)}`
                ).join('\n\n');
                markdown += `\n\n${sections}`;
            }
            const contents = new vscode.MarkdownString(markdown);
            contents.isTrusted = true;
            contents.supportHtml = true;
            return new vscode.Hover(contents, wordRange);
        }

        return null;
    }

    /**
     * 按名称查找解析节点（编辑器悬浮聚合用，Issue #36）：
     * 大小写不敏感精确匹配；控制结构（IF/LOOP 等关键字占位名）与匿名块不作为目标
     */
    private findNodeByNameInParseResult(nodes: ParseNode[], name: string): ParseNode | null {
        const lower = name.toLowerCase();
        for (const node of nodes) {
            if (node.name && node.name.toLowerCase() === lower &&
                node.type !== NodeType.ANONYMOUS_BLOCK &&
                !isControlStructureNodeType(node.type)) {
                return node;
            }
            const found = this.findNodeByNameInParseResult(node.children, name);
            if (found) {
                return found;
            }
        }
        return null;
    }

    /**
     * 提供定义位置 - 支持跨文件导航
     */
    private async provideDefinition(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken): Promise<vscode.Definition | vscode.LocationLink[] | null> {
        // 与悬停一致：语言 ID 与配置扩展名均不匹配则不响应（Issue #26）
        if (!this.isPLSQLFile(document)) {
            return null;
        }

        // 按需刷新：文档编辑未保存时解析结果已陈旧，Ctrl+Click 前 先拿到最新树
        await this.parseDocumentQuiet(document);

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
            // 索引构建中未命中：明确告知原因，避免误以为跳转功能损坏（Issue #38）
            if (this.symbolIndex.isBuilding()) {
                vscode.window.setStatusBarMessage('PL/SQL 符号索引构建中，跨文件跳转暂不可用', 3000);
            }
            return null;
        }

        // 过滤掉当前文件中的条目（跨文件跳转不需要）
        const currentFilePath = document.uri.fsPath;
        const normCurrent = path.normalize(currentFilePath).toLowerCase();
        const crossFileEntries = entries.filter(e =>
            path.normalize(e.filePath).toLowerCase() !== normCurrent
        );

        if (crossFileEntries.length === 0) {
            // 无跨文件条目：若索引中存在当前文件的定义，作为兜底跳转目标
            // （findNodeInCurrentFile 因解析差异未命中时，索引可能仍记录了声明行）
            const localEntry = entries.find(e =>
                path.normalize(e.filePath).toLowerCase() === normCurrent
            );
            if (localEntry) {
                const uri = vscode.Uri.file(localEntry.filePath);
                const pos = new vscode.Position(localEntry.line - 1, 0);
                return new vscode.Location(uri, pos);
            }
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
        const _line = document.lineAt(position.line).text;
        
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
                if (isCallableNode(node) && node.name.toUpperCase() === upperName) {
                    return node;
                }
                // 搜索 Package Body/Header 内的子方法（同包内不带前缀调用）
                if (node.type === NodeType.PACKAGE_BODY || node.type === NodeType.PACKAGE_HEADER) {
                    const found = this.findProcFuncInChildren(node.children, upperName);
                    if (found) return found;
                }
                // 递归子节点（保留 packageName 以支持 pkg.proc 跨嵌套查找）
                const found = this.findNodeInCurrentFile(node.children, name, packageName);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * 在子节点中递归查找过程/函数（支持任意深度嵌套子程序）
     * 例如 calculate_total → compute_line_total → apply_rounding，
     * Ctrl+Click apply_rounding 调用需能逐级下钻找到声明。
     */
    private findProcFuncInChildren(children: ParseNode[], upperName: string): ParseNode | null {
        for (const child of children) {
            // 当前子节点匹配
            if (isCallableNode(child) && child.name.toUpperCase() === upperName) {
                return child;
            }
            // 递归进入下一层（嵌套子程序）
            const found = this.findProcFuncInChildren(child.children, upperName);
            if (found) {
                return found;
            }
        }
        return null;
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
            const _fileName = path.basename(entry.filePath);
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

        // 缓存路径记录下来，手动重建后同样落盘
        this.indexStoragePath = context.globalStorageUri
            ? path.join(context.globalStorageUri.fsPath, 'symbol-index.json')
            : '';

        if (!autoIndex || pathConfigs.length === 0) {
            this.updateIndexStatusBar();
            return;
        }

        // 尝试加载缓存的索引（影子构建下缓存可持续服务到新索引切换完成）
        if (this.indexStoragePath) {
            const loaded = await this.symbolIndex.load(this.indexStoragePath);
            if (loaded) {
                this.outputChannel.appendLine('已从缓存加载符号索引');
            }
        }
        this.updateIndexStatusBar();

        // 后台构建/刷新索引（影子写入：期间旧索引/缓存持续可查，Issue #38）
        this.indexBuildTimer = setTimeout(async () => {
            this.indexBuildTimer = null;
            // 重新读取配置：激活与定时器触发之间配置可能已变化，
            // 沿用激活时快照会用旧路径覆盖 onConfigurationChanged 触发的新索引
            const freshConfig = vscode.workspace.getConfiguration('plsql-outline');
            const freshPaths = freshConfig.get<PathConfig[]>('codeRepository.paths', []);
            const freshAutoIndex = freshConfig.get<boolean>('codeRepository.autoIndex', true);
            if (!freshAutoIndex || freshPaths.length === 0) {
                this.updateIndexStatusBar();
                return;
            }
            const freshExtensions = freshConfig.get<string[]>('codeRepository.fileExtensions',
                [...DEFAULT_FILE_EXTENSIONS]);
            const freshMaxFiles = freshConfig.get<number>('codeRepository.maxFiles', 5000);

            const completed = await this.symbolIndex.buildIndex(freshPaths, freshExtensions, freshMaxFiles);
            this.symbolIndex.setupWatchers(freshPaths, freshExtensions);

            // 保存索引到缓存（跳过/取消时不落盘，避免旧数据覆盖；
            // 写盘异常只记日志，不应让后台任务变成未处理拒绝）
            if (completed && this.indexStoragePath) {
                try {
                    await this.symbolIndex.save(this.indexStoragePath);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    this.outputChannel.appendLine(`索引缓存写入失败: ${message}`);
                }
            }
            this.updateIndexStatusBar();
        }, 3000); // 延迟3秒，避免影响启动速度
    }

    /**
     * 创建索引状态栏项（常驻三态：未启用 / 构建中 / 就绪，Issue #38）
     */
    private createIndexStatusBar(context: vscode.ExtensionContext): void {
        const bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        bar.name = 'PL/SQL 符号索引';
        bar.command = 'plsqlOutline.indexStatusClick';
        this.indexStatusBar = bar;
        context.subscriptions.push(bar);
        this.updateIndexStatusBar();
    }

    /**
     * 刷新索引状态栏三态文案
     */
    private updateIndexStatusBar(): void {
        if (!this.indexStatusBar) {
            return;
        }
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const pathConfigs = config.get<PathConfig[]>('codeRepository.paths', []);
        const autoIndex = config.get<boolean>('codeRepository.autoIndex', true);

        if (pathConfigs.length === 0 || !autoIndex) {
            this.indexStatusBar.text = '$(database) PL/SQL 跳转未启用';
            this.indexStatusBar.tooltip = '未配置代码仓库路径（或已关闭自动索引），跨文件跳转不可用。点击打开设置';
        } else if (this.symbolIndex.isBuilding()) {
            const progress = this.symbolIndex.getProgress();
            this.indexStatusBar.text = `$(sync~spin) PL/SQL 索引构建中 ${progress.indexed}/${progress.total}`;
            this.indexStatusBar.tooltip = '正在为代码仓库构建符号索引，构建期间跨文件跳转可能不完整。点击查看日志';
        } else {
            const status = this.symbolIndex.getStatus();
            this.indexStatusBar.text = `$(database) PL/SQL 索引就绪 · ${status.symbolCount} 符号`;
            this.indexStatusBar.tooltip = `已索引 ${status.fileCount} 个文件、${status.symbolCount} 个符号。点击查看日志`;
        }
        this.indexStatusBar.show();
    }

    /**
     * 状态栏点击：未配置→打开设置页；已配置→查看索引输出日志
     */
    private onIndexStatusClick(): void {
        const pathConfigs = vscode.workspace.getConfiguration('plsql-outline')
            .get<PathConfig[]>('codeRepository.paths', []);
        if (pathConfigs.length === 0) {
            void vscode.commands.executeCommand('plsqlOutline.openSettings');
        } else {
            this.outputChannel.show();
        }
    }

    /**
     * 当前文件解析结果即时并入符号索引（Issue #38）。
     * 未保存的 untitled 文档无磁盘身份，不入索引。
     */
    private upsertCurrentFileIntoIndex(parseResult: ParseResult, document: vscode.TextDocument): void {
        if (document.uri.scheme !== 'file') {
            return;
        }
        this.symbolIndex.upsertFromParseResult(parseResult, document.uri.fsPath);
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
            [...DEFAULT_FILE_EXTENSIONS]);
        const maxFiles = config.get<number>('codeRepository.maxFiles', 5000);

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '正在重建PL/SQL符号索引...',
            cancellable: true
        }, async (progress, token) => {
            const completed = await this.symbolIndex.buildIndex(pathConfigs, fileExtensions, maxFiles, {
                cancellationToken: token,
                onProgress: (indexed, total) => {
                    progress.report({ increment: 100 / Math.max(total, 1), message: `${indexed}/${total}` });
                }
            });

            if (completed) {
                const status = this.symbolIndex.getStatus();
                vscode.window.showInformationMessage(
                    `索引重建完成: ${status.fileCount} 文件, ${status.symbolCount} 符号`
                );
                // 重建成功后同步刷新 watcher：此前配置变更路径后
                // 旧 watcher 仍监视旧路径，直到重载窗口才纠正
                this.symbolIndex.setupWatchers(pathConfigs, fileExtensions);
                // 手动重建同样落盘，避免下次启动回退到旧缓存
                if (this.indexStoragePath) {
                    try {
                        await this.symbolIndex.save(this.indexStoragePath);
                    } catch (error) {
                        const message = error instanceof Error ? error.message : String(error);
                        this.outputChannel.appendLine(`索引缓存写入失败: ${message}`);
                    }
                }
            } else {
                vscode.window.setStatusBarMessage('PL/SQL 索引重建未完成（已保留旧索引）', 3000);
            }
            this.updateIndexStatusBar();
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
        // 记录最近的 PL/SQL 活动编辑器（供 Refresh 在大纲树获得焦点时回退）
        if (editor && this.isPLSQLFile(editor.document)) {
            this.lastActivePLSQLEditor = editor;
        }

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
            // 刷新调试开关缓存
            this.refreshDebugCache();

            // 刷新数据桥接器配置
            this.debugManager.refreshConfig();
            
            // 刷新树视图
            this.treeViewManager.refresh();

            // 如果代码仓库配置变化，重建索引（autoIndex 已关闭时只刷新状态栏不重建）
            if (event.affectsConfiguration('plsql-outline.codeRepository')) {
                const autoIndex = vscode.workspace.getConfiguration('plsql-outline')
                    .get<boolean>('codeRepository.autoIndex', true);
                if (autoIndex) {
                    this.rebuildSymbolIndex();
                } else {
                    this.updateIndexStatusBar();
                }
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
            // 无结果（如新建未保存的 PL/SQL 文档）：立即补一次解析
            await this.parseDocumentQuiet(editor.document);
        } else if (!this.isParseResultFresh(editor.document)) {
            // 结果陈旧（编辑未保存）：后台刷新，本次先用现有结果保证响应速度
            this.parseDocumentQuiet(editor.document).catch(() => { /* 保持现状 */ });
        }

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

        // 大纲过滤（搜索框）期间暂停光标跟随（Issue #36）：
        // 跟随 reveal 会与过滤树的展开/选中互相干扰，且跟随目标可能已被过滤隐藏
        if (this.treeViewManager.isFilterActive()) {
            this.debugLog('光标同步: 大纲过滤中，暂停跟随');
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
                        priority: 150 + node.level // 区域范围匹配（与控制结构同基准，保证"最内层胜出"）
                    });
                } else if (node.type === NodeType.ELSIF_BRANCH || node.type === NodeType.ELSE_BRANCH) {
                    // ELSIF/ELSE 分支在显示层被合并进 IF（无独立树项），范围匹配跳过，
                    // 让位给外围容器（宿主 Body 区域 / 所在 LOOP 等），避免 reveal 到不存在的元素
                } else if (isControlStructureNodeType(node.type)) {
                    // 控制结构范围匹配（Issue #22）：与区域范围同基准（150+level），
                    // 同层级时控制结构比宿主区域更内层——按层级深度统一裁决"最内层容器跟随"
                    candidates.push({
                        node: node,
                        priority: 150 + node.level
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

        // 检查是否在DECLARE块范围内（Issue #22：声明区跟随选中 Declaration 文件夹）
        if (node.beginLine !== null && node.beginLine !== undefined &&
            line > node.declarationLine && line < node.beginLine) {
            return 'DECLARE';
        }

        return null;
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
    /**
     * 判定文档是否按 PL/SQL 处理：语言 ID（sql/plsql）或 plsql-outline.fileExtensions
     * 配置扩展名命中。public：activate() 激活自动解析与提供者回调共用同一口径（Issue #29）。
     */
    isPLSQLFile(document: vscode.TextDocument): boolean {
        const languageId = document.languageId;
        const fileName = document.fileName.toLowerCase();
        
        // 检查语言ID
        if (languageId === 'plsql' || languageId === 'sql') {
            return true;
        }
        
        // 从配置中获取支持的文件扩展名
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const configuredExtensions = config.get<string[]>('fileExtensions', [...DEFAULT_FILE_EXTENSIONS]);
        
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

        // 只在有错误或警告时显示通知（附第一条信息，否则用户无从知晓原因）
        if (errorCount > 0 || warningCount > 0) {
            const first = result.metadata.errors[0] ?? result.metadata.warnings[0];
            const detail = first?.message ? `：${first.message}` : '';
            const message = `解析完成，但发现问题（${errorCount} 个错误 / ${warningCount} 个警告）${detail}`;
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

            // 清理折叠范围缓存（避免大文件解析结果滞留内存）
            this.parseResultCache.clear();
            
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
        if (this.changeDebounceTimer) {
            clearTimeout(this.changeDebounceTimer);
            this.changeDebounceTimer = null;
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
        if (this.indexBuildTimer) {
            clearTimeout(this.indexBuildTimer);
            this.indexBuildTimer = null;
        }
        this.symbolIndex.dispose();
        disposeOutputChannel();
        
        // 销毁树视图
        this.treeViewManager.dispose();
        
        // 清理所有引用
        this.currentParseResult = null;
        this.lastActivePLSQLEditor = null;
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

        // 如果当前有活动的PL/SQL文件，自动解析（识别口径与 parseCurrentFile/提供者一致：
        // isPLSQLFile = 语言 ID 或配置扩展名。此前硬编码 DEFAULT_FILE_EXTENSIONS，
        // 配置扩展名文件激活时不触发——Issue #29）
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && extensionInstance && extensionInstance.isPLSQLFile(activeEditor.document)) {
            // 延迟执行，确保扩展完全激活
            setTimeout(() => {
                vscode.commands.executeCommand('plsqlOutline.parseCurrentFile');
            }, 1000);
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

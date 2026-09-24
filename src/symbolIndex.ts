import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { PLSQLParser } from './parser';
import { ParseNode, ParseResult, NodeType } from './types';

/**
 * 符号条目
 */
export interface SymbolEntry {
    name: string;
    type: NodeType;
    packageName?: string;
    filePath: string;
    line: number;
    parameters?: string;
}

/**
 * 路径配置
 */
export interface PathConfig {
    path: string;
    priority: number;
}

/**
 * 索引状态快照（供状态栏三态展示：未启用 / 构建中 / 就绪）
 */
export interface IndexProgress {
    building: boolean;
    /** 本轮已索引文件数 */
    indexed: number;
    /** 本轮计划索引文件总数 */
    total: number;
    /** 当前已入索引的文件数 */
    fileCount: number;
    /** 当前已入索引的符号数 */
    symbolCount: number;
}

/**
 * 构建选项
 */
export interface BuildOptions {
    /** 结构化取消令牌（鸭子类型兼容 vscode.CancellationToken，测试无需 vscode 模块） */
    cancellationToken?: { isCancellationRequested: boolean };
    /** 每索引完一个文件回调（供 withProgress 报告真实进度） */
    onProgress?: (indexed: number, total: number) => void;
}

/**
 * 符号索引 - 管理跨文件的PL/SQL符号索引
 *
 * 构建采用影子写入 + 原子切换（Issue #38）：新结果先写入局部 Map，
 * 完成后一次性替换线上 Map，构建期间旧索引持续可查；此前先 clear 再
 * 重建，重建窗口期内跳转全黑。构建期间到达的 watcher 更新与当前文件
 * upsert 进入待处理队列，切换前重放到影子 Map（取消/失败时重放到线上）。
 */
export class SymbolIndex {
    private symbols: Map<string, SymbolEntry[]> = new Map();
    private fileSymbols: Map<string, string[]> = new Map(); // filePath -> symbolNames[]
    private lastBuildTime: number = 0;
    private watchers: vscode.FileSystemWatcher[] = [];
    // 尚未触发的防抖更新定时器（dispose 时统一清理）
    private debounceTimers: Set<NodeJS.Timeout> | null = null;
    private building: boolean = false;
    private buildingIndexed: number = 0;
    private buildingTotal: number = 0;
    private outputChannel: vscode.OutputChannel;
    private statusListener: ((progress: IndexProgress) => void) | null = null;
    // 构建期间到达的变更（成功时重放到影子 Map，取消/失败时重放到线上 Map）
    private pendingUpserts: Map<string, ParseResult> = new Map();
    private pendingFileUpdates: Set<string> = new Set();
    private pendingDeletes: Set<string> = new Set();
    // 进度通知节流：不足 20 个文件的步进不打扰状态栏（首尾必通知）
    private static readonly PROGRESS_NOTIFY_STEP = 20;
    private lastProgressNotifyIndex = -1;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    /**
     * 注册状态监听（状态栏订阅索引状态变化；传 null 注销）
     */
    setStatusListener(listener: ((progress: IndexProgress) => void) | null): void {
        this.statusListener = listener;
    }

    /**
     * 是否正在构建索引
     */
    isBuilding(): boolean {
        return this.building;
    }

    /**
     * 获取当前索引状态快照
     */
    getProgress(): IndexProgress {
        return {
            building: this.building,
            indexed: this.buildingIndexed,
            total: this.buildingTotal,
            fileCount: this.fileSymbols.size,
            symbolCount: this.symbols.size
        };
    }

    private notifyProgress(force: boolean = false): void {
        if (!this.statusListener) {
            return;
        }
        const shouldNotify = force ||
            this.buildingIndexed === 0 ||
            this.buildingIndexed === this.buildingTotal ||
            this.buildingIndexed - this.lastProgressNotifyIndex >= SymbolIndex.PROGRESS_NOTIFY_STEP;
        if (!shouldNotify) {
            return;
        }
        this.lastProgressNotifyIndex = this.buildingIndexed;
        this.statusListener(this.getProgress());
    }

    /**
     * 全量构建索引（影子写入，完成后原子切换，期间旧索引保持可查）
     * @returns true=完成并切换；false=已有构建进行中、被取消或构建失败（均保留旧索引）
     */
    async buildIndex(paths: PathConfig[], fileExtensions: string[], maxFiles: number = 5000, options?: BuildOptions): Promise<boolean> {
        if (this.building) {
            this.outputChannel.appendLine('索引正在构建中，跳过重复请求');
            return false;
        }

        this.building = true;
        this.buildingIndexed = 0;
        this.buildingTotal = 0;
        this.lastProgressNotifyIndex = -1;
        const startTime = Date.now();
        this.notifyProgress(true);

        // 影子 Map：构建全程只写局部结构，线上索引不受影响
        const newSymbols = new Map<string, SymbolEntry[]>();
        const newFileSymbols = new Map<string, string[]>();

        try {
            // 先扫描全部路径再索引：total 提前可知，进度才有真实分母
            const sortedPaths = [...paths].sort((a, b) => a.priority - b.priority);
            const scanned: string[] = [];
            const seen = new Set<string>();
            for (const pathConfig of sortedPaths) {
                if (scanned.length >= maxFiles) break;

                const files = await this.scanDirectory(pathConfig.path, fileExtensions);
                for (const file of files) {
                    if (scanned.length >= maxFiles) break;
                    if (seen.has(file)) continue; // 路径重叠/嵌套时不重复解析
                    seen.add(file);
                    scanned.push(file);
                }
            }

            this.buildingTotal = scanned.length;
            this.notifyProgress(true);

            for (const file of scanned) {
                if (options?.cancellationToken?.isCancellationRequested) {
                    this.outputChannel.appendLine(`索引构建已取消（${this.buildingIndexed}/${this.buildingTotal}）`);
                    // 取消：丢弃影子，待处理变更重放到线上 Map
                    await this.replayPendingInto(this.symbols, this.fileSymbols);
                    return false;
                }
                await this.indexFileInto(file, newSymbols, newFileSymbols);
                this.buildingIndexed++;
                options?.onProgress?.(this.buildingIndexed, this.buildingTotal);
                this.notifyProgress();
            }

            // 构建期间到达的变更重放到影子 Map 后再切换
            await this.replayPendingInto(newSymbols, newFileSymbols);

            this.symbols = newSymbols;
            this.fileSymbols = newFileSymbols;
            this.lastBuildTime = Date.now();

            const elapsed = Date.now() - startTime;
            this.outputChannel.appendLine(
                `索引构建完成: ${this.fileSymbols.size} 文件, ${this.symbols.size} 符号, 耗时 ${elapsed}ms`
            );
            return true;
        } catch (error) {
            // 兜底：保留旧索引，不让索引处于半切换状态
            const message = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`索引构建失败，保留旧索引: ${message}`);
            await this.replayPendingInto(this.symbols, this.fileSymbols);
            return false;
        } finally {
            this.building = false;
            this.notifyProgress(true);
        }
    }

    /**
     * 把当前文件的解析结果即时并入索引（打开/编辑文件后无需等待
     * 仓库扫描完成，跳转进本文件即可用；Issue #38）
     */
    upsertFromParseResult(result: ParseResult, filePath: string): void {
        if (this.building) {
            // 构建中：暂存最新结果，构建结束重放（同文件多次 upsert 只保留最新）
            this.pendingUpserts.set(filePath, result);
            return;
        }
        this.upsertResultInto(result, filePath, this.symbols, this.fileSymbols);
    }

    /**
     * 增量更新单个文件
     */
    async updateFile(filePath: string): Promise<void> {
        if (this.building) {
            this.pendingFileUpdates.add(filePath);
            return;
        }

        // 先移除该文件的旧符号，再重新索引
        this.removeFileFrom(this.symbols, this.fileSymbols, filePath);
        if (fs.existsSync(filePath)) {
            await this.indexFileInto(filePath, this.symbols, this.fileSymbols);
        }
    }

    /**
     * 移除文件的符号
     */
    removeFile(filePath: string): void {
        if (this.building) {
            this.pendingDeletes.add(filePath);
            return;
        }
        this.removeFileFrom(this.symbols, this.fileSymbols, filePath);
    }

    /**
     * 查找符号
     */
    lookup(name: string, packageName?: string): SymbolEntry[] {
        const upperName = name.toUpperCase();
        const entries = this.symbols.get(upperName) || [];

        if (packageName) {
            const upperPkg = packageName.toUpperCase();
            // 精确匹配: 名称 + 所属Package
            const exact = entries.filter(e =>
                e.packageName && e.packageName.toUpperCase() === upperPkg
            );
            if (exact.length > 0) return exact;
        }

        return entries;
    }

    /**
     * 按优先级路径查找符号（高优先级找到后不遍历低优先级）
     */
    lookupWithPriority(name: string, packageName?: string, paths?: PathConfig[]): SymbolEntry[] {
        const allEntries = this.lookup(name, packageName);

        if (!paths || paths.length <= 1 || allEntries.length === 0) {
            return allEntries;
        }

        // 按路径优先级排序
        const sortedPaths = [...paths].sort((a, b) => a.priority - b.priority);

        for (const pathConfig of sortedPaths) {
            const normalizedConfigPath = path.normalize(pathConfig.path).toLowerCase();
            const matches = allEntries.filter(e =>
                path.normalize(e.filePath).toLowerCase().startsWith(normalizedConfigPath)
            );
            if (matches.length > 0) {
                return matches;
            }
        }

        return allEntries;
    }

    /**
     * 保存索引到磁盘（v2：含 fileSymbols，加载后 watcher 增删才能正确去重）
     */
    async save(storagePath: string): Promise<void> {
        const data = {
            version: 2,
            buildTime: this.lastBuildTime,
            fileCount: this.fileSymbols.size,
            symbols: {} as Record<string, SymbolEntry[]>,
            fileSymbols: {} as Record<string, string[]>
        };

        for (const [key, entries] of this.symbols) {
            data.symbols[key] = entries;
        }
        for (const [filePath, names] of this.fileSymbols) {
            data.fileSymbols[filePath] = names;
        }

        const dir = path.dirname(storagePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(storagePath, JSON.stringify(data), 'utf8');
    }

    /**
     * 从磁盘加载索引（v1 旧格式不含 fileSymbols，直接失效走全量重建）
     */
    async load(storagePath: string): Promise<boolean> {
        try {
            if (!fs.existsSync(storagePath)) return false;

            const raw = fs.readFileSync(storagePath, 'utf8');
            const data = JSON.parse(raw);

            if (data.version !== 2) return false;

            const symbols = new Map<string, SymbolEntry[]>();
            const fileSymbols = new Map<string, string[]>();
            for (const [key, entries] of Object.entries(data.symbols)) {
                symbols.set(key, entries as SymbolEntry[]);
            }
            for (const [filePath, names] of Object.entries(data.fileSymbols || {})) {
                fileSymbols.set(filePath, names as string[]);
            }

            this.symbols = symbols;
            this.fileSymbols = fileSymbols;
            this.lastBuildTime = data.buildTime;
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 获取索引状态
     */
    getStatus(): { fileCount: number; symbolCount: number; lastBuild: number } {
        return {
            fileCount: this.fileSymbols.size,
            symbolCount: this.symbols.size,
            lastBuild: this.lastBuildTime
        };
    }

    /**
     * 设置文件监听
     */
    setupWatchers(paths: PathConfig[], fileExtensions: string[]): void {
        this.disposeWatchers();

        for (const pathConfig of paths) {
            if (!pathConfig.path || !fs.existsSync(pathConfig.path)) continue;

            const globPattern = new vscode.RelativePattern(
                pathConfig.path,
                `**/*{${fileExtensions.join(',')}}`
            );

            const watcher = vscode.workspace.createFileSystemWatcher(globPattern);

            const timers: Set<NodeJS.Timeout> = this.debounceTimers ?? new Set();
            this.debounceTimers = timers;
            const debounceUpdate = (uri: vscode.Uri) => {
                const timer = setTimeout(() => {
                    timers.delete(timer);
                    this.updateFile(uri.fsPath);
                }, 500);
                timers.add(timer);
            };

            watcher.onDidCreate(debounceUpdate);
            watcher.onDidChange(debounceUpdate);
            watcher.onDidDelete(uri => this.removeFile(uri.fsPath));

            this.watchers.push(watcher);
        }
    }

    /**
     * 释放资源
     */
    dispose(): void {
        this.disposeWatchers();
        // 构建期间积压的变更随实例一并废弃，状态监听一并注销
        this.pendingUpserts.clear();
        this.pendingFileUpdates.clear();
        this.pendingDeletes.clear();
        this.statusListener = null;
    }

    private disposeWatchers(): void {
        for (const watcher of this.watchers) {
            watcher.dispose();
        }
        this.watchers = [];
        this.disposeDebounceTimers();
    }

    /** 清理尚未触发的防抖更新定时器（dispose 后不应再触发索引更新） */
    private disposeDebounceTimers(): void {
        if (this.debounceTimers) {
            for (const t of this.debounceTimers) clearTimeout(t);
            this.debounceTimers = null;
        }
    }

    /**
     * 重放构建期间积压的变更（构建成功时作用于影子 Map，取消/失败时作用于线上 Map）。
     * 收敛式排空：文件重读是异步的，await 期间仍可能有新变更入队（此时 building
     * 尚未复位，新变更继续走队列），快照后逐轮处理直至清空；轮数上限防御持续
     * 事件流，残余留待下次构建/watcher 兜底。取消路径不检查取消令牌：
     * 积压变更必须落地，否则该文件在索引中会缺条目/残留条目。
     */
    private async replayPendingInto(symbols: Map<string, SymbolEntry[]>, fileSymbols: Map<string, string[]>): Promise<void> {
        for (let round = 0; round < 10; round++) {
            if (this.pendingDeletes.size === 0 &&
                this.pendingFileUpdates.size === 0 &&
                this.pendingUpserts.size === 0) {
                return;
            }

            const deletes = [...this.pendingDeletes];
            this.pendingDeletes.clear();
            for (const filePath of deletes) {
                this.removeFileFrom(symbols, fileSymbols, filePath);
            }

            const updates = [...this.pendingFileUpdates];
            this.pendingFileUpdates.clear();
            for (const filePath of updates) {
                // 与 updateFile 语义一致：先移除旧条目再重读，避免与扫描结果叠加成重复条目
                this.removeFileFrom(symbols, fileSymbols, filePath);
                await this.indexFileInto(filePath, symbols, fileSymbols);
            }

            const upserts = [...this.pendingUpserts];
            this.pendingUpserts.clear();
            for (const [filePath, result] of upserts) {
                this.upsertResultInto(result, filePath, symbols, fileSymbols);
            }
        }
    }

    /**
     * 扫描目录获取所有匹配文件
     */
    private async scanDirectory(dirPath: string, extensions: string[]): Promise<string[]> {
        const results: string[] = [];

        if (!fs.existsSync(dirPath)) return results;

        const scan = (dir: string) => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        scan(fullPath);
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name).toLowerCase();
                        if (extensions.includes(ext)) {
                            results.push(fullPath);
                        }
                    }
                }
            } catch {
                // 跳过无法访问的目录
            }
        };

        scan(dirPath);
        return results;
    }

    /**
     * 索引单个文件（写入指定 Map）
     * best-effort（Issue #38）：解析带错误不再整体跳过，能提取多少符号算多少
     */
    private async indexFileInto(filePath: string, symbols: Map<string, SymbolEntry[]>, fileSymbols: Map<string, string[]>): Promise<void> {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // 每次解析使用独立实例（Issue #15 同源教训）：buildIndex 与
            // watcher 驱动的 updateFile 可能交错，共享实例会在 await 点互相污染
            const result = await new PLSQLParser().parse(content, filePath);

            const symbolNames: string[] = [];

            for (const node of result.nodes) {
                this.extractSymbolsInto(node, filePath, undefined, symbolNames, symbols);
            }

            // 0 符号文件（纯匿名块/解析失败）不入 fileSymbols，避免虚增文件计数
            if (symbolNames.length > 0) {
                fileSymbols.set(filePath, symbolNames);
            }
        } catch {
            // 跳过无法读取/解析的文件
        }
    }

    /**
     * 把解析结果写入指定 Map（先清该文件旧条目，保证幂等）
     */
    private upsertResultInto(result: ParseResult, filePath: string, symbols: Map<string, SymbolEntry[]>, fileSymbols: Map<string, string[]>): void {
        this.removeFileFrom(symbols, fileSymbols, filePath);

        const symbolNames: string[] = [];
        for (const node of result.nodes) {
            this.extractSymbolsInto(node, filePath, undefined, symbolNames, symbols);
        }
        if (symbolNames.length > 0) {
            fileSymbols.set(filePath, symbolNames);
        }
    }

    /**
     * 从节点树移除文件的全部符号条目
     */
    private removeFileFrom(symbols: Map<string, SymbolEntry[]>, fileSymbols: Map<string, string[]>, filePath: string): void {
        const oldSymbolNames = fileSymbols.get(filePath);
        if (oldSymbolNames) {
            for (const name of oldSymbolNames) {
                const entries = symbols.get(name);
                if (entries) {
                    const filtered = entries.filter(e => e.filePath !== filePath);
                    if (filtered.length > 0) {
                        symbols.set(name, filtered);
                    } else {
                        symbols.delete(name);
                    }
                }
            }
            fileSymbols.delete(filePath);
        }
    }

    /**
     * 从节点树提取符号（写入指定 Map）
     */
    private extractSymbolsInto(node: ParseNode, filePath: string, packageName: string | undefined, symbolNames: string[], symbols: Map<string, SymbolEntry[]>): void {
        const isPackage = node.type === NodeType.PACKAGE_BODY || node.type === NodeType.PACKAGE_HEADER;
        const isProgramUnit = node.type === NodeType.FUNCTION ||
            node.type === NodeType.PROCEDURE ||
            node.type === NodeType.FUNCTION_DECLARATION ||
            node.type === NodeType.PROCEDURE_DECLARATION ||
            node.type === NodeType.TRIGGER;

        if (isPackage || isProgramUnit) {
            const upperName = node.name.toUpperCase();
            const entry: SymbolEntry = {
                name: node.name,
                type: node.type,
                packageName: packageName,
                filePath: filePath,
                line: node.declarationLine
            };

            if (!symbols.has(upperName)) {
                symbols.set(upperName, []);
            }
            symbols.get(upperName)!.push(entry);
            symbolNames.push(upperName);
        }

        // 递归处理子节点（只处理Package的直接子节点作为符号）
        if (isPackage) {
            for (const child of node.children) {
                this.extractSymbolsInto(child, filePath, node.name, symbolNames, symbols);
            }
        }
    }
}

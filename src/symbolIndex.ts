import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { promises as fsp } from 'fs';
import { extractFileSymbols, symbolsFromParseResult, ScannedSymbol } from './symbolScanner';
import { ParseResult, NodeType } from './types';

/**
 * 符号条目
 */
export interface SymbolEntry {
    name: string;
    type: NodeType;
    packageName?: string;
    filePath: string;
    line: number;
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
    /** 本轮已处理文件数（增量口径：需重扫的文件） */
    indexed: number;
    /** 本轮需处理文件总数（增量口径） */
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
    /** 每处理完一个文件回调（供 withProgress 报告真实进度） */
    onProgress?: (indexed: number, total: number) => void;
    /** 强制全量重扫（忽略 mtime 缓存；手动"重建索引"用，Issue #39） */
    forceFull?: boolean;
}

/** 文件新鲜度标记（mtime+size；不变则跳过重扫） */
interface FileStat {
    mtimeMs: number;
    size: number;
}

/**
 * 符号索引 - 管理跨文件的PL/SQL符号索引
 *
 * 构建采用影子写入 + 原子切换（Issue #38）：结果先写入线上 Map 的克隆，
 * 完成后一次性替换，构建期间旧索引持续可查；构建期间到达的 watcher 更新
 * 与当前文件 upsert 进入待处理队列，切换前重放。
 *
 * 增量构建（Issue #39）：缓存 v3 记录每个已扫描文件的 mtime+size，重建时
 * 只重扫变化/新增文件、剔除已消失文件；无缓存/强制全量时退化为全量扫描。
 * 文件读取按分块并行（IO_CHUNK）执行、按扫描顺序应用，保证条目顺序确定。
 */
export class SymbolIndex {
    private symbols: Map<string, SymbolEntry[]> = new Map();
    private fileSymbols: Map<string, string[]> = new Map(); // filePath -> symbolNames[]
    // 构建扫描过的文件的新鲜度标记（upsert 进来的当前文件不在此列，不会被增量逻辑移除）
    private fileStats: Map<string, FileStat> = new Map();
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
    // 分块并行 IO 的窗口大小（内存上限 ≈ 64 个文件内容）
    private static readonly IO_CHUNK = 64;

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
     * 构建索引（增量：mtime+size 命中则跳过；影子写入，完成后原子切换）
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

        try {
            // 1) 扫描（按优先级排序、跨路径去重、maxFiles 上限）
            const sortedPaths = [...paths].sort((a, b) => a.priority - b.priority);
            const files: string[] = [];
            const seen = new Set<string>();
            for (const pathConfig of sortedPaths) {
                if (files.length >= maxFiles) break;

                const scannedFiles = await this.scanDirectory(pathConfig.path, fileExtensions);
                for (const file of scannedFiles) {
                    if (files.length >= maxFiles) break;
                    if (seen.has(file)) continue; // 路径重叠/嵌套时不重复解析
                    seen.add(file);
                    files.push(file);
                }
            }

            // 2) 并行 stat 全量文件
            const scanStats = new Map<string, FileStat>();
            for (let c = 0; c < files.length; c += SymbolIndex.IO_CHUNK) {
                const chunk = files.slice(c, c + SymbolIndex.IO_CHUNK);
                await Promise.all(chunk.map(async file => {
                    try {
                        const st = await fsp.stat(file);
                        scanStats.set(file, { mtimeMs: st.mtimeMs, size: st.size });
                    } catch {
                        // 消失/不可访问：不进 stats，进入 todo 后由读取失败路径剔除
                    }
                }));
            }

            // 3) 增量划分：stat 未变 → 命中缓存；否则重扫
            const todo: string[] = [];
            let cacheHit = 0;
            for (const file of files) {
                const cur = scanStats.get(file);
                if (!cur) {
                    todo.push(file);
                    continue;
                }
                const prev = options?.forceFull ? undefined : this.fileStats.get(file);
                if (prev && prev.mtimeMs === cur.mtimeMs && prev.size === cur.size) {
                    cacheHit++;
                } else {
                    todo.push(file);
                }
            }
            // 上轮扫描过、本轮不在扫描集（已删除/移出路径/扩展名变化）→ 从索引移除
            const currentSet = new Set(files);
            const removedPaths = [...this.fileStats.keys()].filter(f => !currentSet.has(f));

            this.buildingTotal = todo.length;
            this.notifyProgress(true);

            // 4) 影子 = 线上深克隆（条目数组也复制：applyScanned 的 push 不得
            //    触及线上仍引用的数组，保证构建期间线上索引完全不变）；
            //    先剔除消失文件
            const newSymbols = new Map(Array.from(this.symbols, ([k, v]) => [k, [...v]]));
            const newFileSymbols = new Map(this.fileSymbols);
            for (const file of removedPaths) {
                this.removeFileFrom(newSymbols, newFileSymbols, file);
            }

            // 5) 分块并行读 + 按扫描顺序应用（条目顺序确定，同名跳转消解稳定）
            const failedReads = new Set<string>();
            for (let c = 0; c < todo.length; c += SymbolIndex.IO_CHUNK) {
                if (options?.cancellationToken?.isCancellationRequested) {
                    this.outputChannel.appendLine(`索引构建已取消（${this.buildingIndexed}/${this.buildingTotal}）`);
                    // 取消：丢弃影子，待处理变更重放到线上 Map
                    await this.replayPendingInto(this.symbols, this.fileSymbols);
                    return false;
                }
                const chunkFiles = todo.slice(c, c + SymbolIndex.IO_CHUNK);
                const chunkContents = await Promise.all(chunkFiles.map(async file => {
                    try {
                        return await fsp.readFile(file, 'utf8');
                    } catch {
                        return null;
                    }
                }));
                for (let k = 0; k < chunkFiles.length; k++) {
                    const file = chunkFiles[k];
                    const content = chunkContents[k];
                    if (content === null) {
                        failedReads.add(file);
                        this.removeFileFrom(newSymbols, newFileSymbols, file);
                        continue;
                    }
                    const scannedSymbols = await extractFileSymbols(content);
                    this.applyScanned(scannedSymbols, file, newSymbols, newFileSymbols);
                    this.buildingIndexed++;
                    options?.onProgress?.(this.buildingIndexed, this.buildingTotal);
                    this.notifyProgress();
                }
            }

            // 6) 构建期间积压的变更重放后原子切换
            await this.replayPendingInto(newSymbols, newFileSymbols);
            this.symbols = newSymbols;
            this.fileSymbols = newFileSymbols;

            // fileStats：本轮已知 stat 且读取成功的文件（失败的下轮重试）
            const newStats = new Map<string, FileStat>();
            for (const file of files) {
                const st = scanStats.get(file);
                if (st && !failedReads.has(file)) {
                    newStats.set(file, st);
                }
            }
            this.fileStats = newStats;

            this.lastBuildTime = Date.now();
            const elapsed = Date.now() - startTime;
            this.outputChannel.appendLine(
                `索引构建完成: ${this.fileSymbols.size} 文件, ${this.symbols.size} 符号` +
                `（扫描 ${files.length}, 重扫 ${todo.length}, 命中缓存 ${cacheHit}）, 耗时 ${elapsed}ms`
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
        this.applyScanned(symbolsFromParseResult(result), filePath, this.symbols, this.fileSymbols);
    }

    /**
     * 增量更新单个文件
     */
    async updateFile(filePath: string): Promise<void> {
        if (this.building) {
            this.pendingFileUpdates.add(filePath);
            return;
        }

        this.removeFileFrom(this.symbols, this.fileSymbols, filePath);
        this.fileStats.delete(filePath);
        if (fs.existsSync(filePath)) {
            await this.reindexFileInto(filePath, this.symbols, this.fileSymbols);
            this.refreshFileStat(filePath);
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
        this.fileStats.delete(filePath);
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
     * 工作区符号搜索（Ctrl+T，Issue #39）：名称包含查询词（大小写不敏感）。
     * 支持 `pkg.func` 写法（按包名 + 名称双重过滤）；上限防刷屏。
     */
    searchSymbols(query: string, limit: number = 512): SymbolEntry[] {
        const q = query.trim().toUpperCase();
        if (!q) {
            return [];
        }
        const dot = q.lastIndexOf('.');
        const pkgQuery = dot > 0 ? q.slice(0, dot) : null;
        const nameQuery = dot > 0 ? q.slice(dot + 1) : q;

        const out: SymbolEntry[] = [];
        for (const [key, entries] of this.symbols) {
            if (!key.includes(nameQuery)) {
                continue;
            }
            for (const entry of entries) {
                if (pkgQuery &&
                    !(entry.packageName && entry.packageName.toUpperCase().includes(pkgQuery))) {
                    continue;
                }
                out.push(entry);
                if (out.length >= limit) {
                    return out;
                }
            }
        }
        return out;
    }

    /**
     * 保存索引到磁盘（v3：含 fileSymbols 与文件新鲜度标记 fileStats）。
     * 注意：version 门的是缓存格式；若未来扫描器提取口径变更，必须同步升版
     * （旧缓存按 mtime 命中会跳过重扫，仅手动重建 forceFull 可强制纠正）。
     */
    async save(storagePath: string): Promise<void> {
        const data = {
            version: 3,
            buildTime: this.lastBuildTime,
            fileCount: this.fileSymbols.size,
            symbols: {} as Record<string, SymbolEntry[]>,
            fileSymbols: {} as Record<string, string[]>,
            fileStats: {} as Record<string, FileStat>
        };

        for (const [key, entries] of this.symbols) {
            data.symbols[key] = entries;
        }
        for (const [filePath, names] of this.fileSymbols) {
            data.fileSymbols[filePath] = names;
        }
        for (const [filePath, stat] of this.fileStats) {
            data.fileStats[filePath] = stat;
        }

        const dir = path.dirname(storagePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(storagePath, JSON.stringify(data), 'utf8');
    }

    /**
     * 从磁盘加载索引（v3 含增量构建所需的 fileStats；
     * v1/v2 旧格式直接失效走全量重建）
     */
    async load(storagePath: string): Promise<boolean> {
        try {
            if (!fs.existsSync(storagePath)) return false;

            const raw = fs.readFileSync(storagePath, 'utf8');
            const data = JSON.parse(raw);

            if (data.version !== 3) return false;

            const symbols = new Map<string, SymbolEntry[]>();
            const fileSymbols = new Map<string, string[]>();
            const fileStats = new Map<string, FileStat>();
            for (const [key, entries] of Object.entries(data.symbols)) {
                symbols.set(key, entries as SymbolEntry[]);
            }
            for (const [filePath, names] of Object.entries(data.fileSymbols || {})) {
                fileSymbols.set(filePath, names as string[]);
            }
            for (const [filePath, stat] of Object.entries(data.fileStats || {})) {
                fileStats.set(filePath, stat as FileStat);
            }

            this.symbols = symbols;
            this.fileSymbols = fileSymbols;
            this.fileStats = fileStats;
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
                await this.reindexFileInto(filePath, symbols, fileSymbols);
            }

            const upserts = [...this.pendingUpserts];
            this.pendingUpserts.clear();
            for (const [filePath, result] of upserts) {
                this.applyScanned(symbolsFromParseResult(result), filePath, symbols, fileSymbols);
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
     * 重读并重索引单个文件（写入指定 Map；读取/提取失败时移除旧条目）
     */
    private async reindexFileInto(filePath: string, symbols: Map<string, SymbolEntry[]>, fileSymbols: Map<string, string[]>): Promise<void> {
        try {
            const content = await fsp.readFile(filePath, 'utf8');
            const scanned = await extractFileSymbols(content);
            this.applyScanned(scanned, filePath, symbols, fileSymbols);
        } catch {
            this.removeFileFrom(symbols, fileSymbols, filePath);
        }
    }

    /**
     * 把符号列表写入指定 Map（先清该文件旧条目，幂等；Issue #39 起提取走轻量扫描器）
     */
    private applyScanned(scanned: ScannedSymbol[], filePath: string, symbols: Map<string, SymbolEntry[]>, fileSymbols: Map<string, string[]>): void {
        this.removeFileFrom(symbols, fileSymbols, filePath);

        if (scanned.length === 0) {
            // 0 符号文件（纯匿名块/解析失败）不入 fileSymbols，避免虚增文件计数
            return;
        }
        const symbolNames: string[] = [];
        for (const s of scanned) {
            const upperName = s.name.toUpperCase();
            const entry: SymbolEntry = {
                name: s.name,
                type: s.type,
                packageName: s.packageName,
                filePath: filePath,
                line: s.line
            };
            if (!symbols.has(upperName)) {
                symbols.set(upperName, []);
            }
            symbols.get(upperName)!.push(entry);
            symbolNames.push(upperName);
        }
        fileSymbols.set(filePath, symbolNames);
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

    /** watcher 重索引后刷新文件新鲜度标记（避免下次构建重复重扫） */
    private refreshFileStat(filePath: string): void {
        try {
            const st = fs.statSync(filePath);
            this.fileStats.set(filePath, { mtimeMs: st.mtimeMs, size: st.size });
        } catch {
            this.fileStats.delete(filePath);
        }
    }
}

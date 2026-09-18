import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { PLSQLParser } from './parser';
import { ParseNode, NodeType } from './types';

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
 * 符号索引 - 管理跨文件的PL/SQL符号索引
 */
export class SymbolIndex {
    private symbols: Map<string, SymbolEntry[]> = new Map();
    private fileSymbols: Map<string, string[]> = new Map(); // filePath -> symbolNames[]
    private lastBuildTime: number = 0;
    private fileCount: number = 0;
    private watchers: vscode.FileSystemWatcher[] = [];
    // 尚未触发的防抖更新定时器（dispose 时统一清理）
    private debounceTimers: Set<NodeJS.Timeout> | null = null;
    private building: boolean = false;
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
    }

    /**
     * 全量构建索引
     */
    async buildIndex(paths: PathConfig[], fileExtensions: string[], maxFiles: number = 5000): Promise<void> {
        if (this.building) {
            this.outputChannel.appendLine('索引正在构建中，跳过重复请求');
            return;
        }

        this.building = true;
        const startTime = Date.now();

        try {
            this.symbols.clear();
            this.fileSymbols.clear();
            this.fileCount = 0;

            // 按优先级排序路径
            const sortedPaths = [...paths].sort((a, b) => a.priority - b.priority);

            let totalFiles = 0;
            for (const pathConfig of sortedPaths) {
                if (totalFiles >= maxFiles) break;

                const files = await this.scanDirectory(pathConfig.path, fileExtensions);
                for (const file of files) {
                    if (totalFiles >= maxFiles) break;
                    await this.indexFile(file);
                    totalFiles++;
                }
            }

            this.fileCount = totalFiles;
            this.lastBuildTime = Date.now();

            const elapsed = Date.now() - startTime;
            this.outputChannel.appendLine(
                `索引构建完成: ${totalFiles} 文件, ${this.symbols.size} 符号, 耗时 ${elapsed}ms`
            );
        } finally {
            this.building = false;
        }
    }

    /**
     * 增量更新单个文件
     */
    async updateFile(filePath: string): Promise<void> {
        // 先移除该文件的旧符号
        this.removeFile(filePath);

        // 重新索引
        if (fs.existsSync(filePath)) {
            await this.indexFile(filePath);
        }
    }

    /**
     * 移除文件的符号
     */
    removeFile(filePath: string): void {
        const oldSymbolNames = this.fileSymbols.get(filePath);
        if (oldSymbolNames) {
            for (const name of oldSymbolNames) {
                const entries = this.symbols.get(name);
                if (entries) {
                    const filtered = entries.filter(e => e.filePath !== filePath);
                    if (filtered.length > 0) {
                        this.symbols.set(name, filtered);
                    } else {
                        this.symbols.delete(name);
                    }
                }
            }
            this.fileSymbols.delete(filePath);
        }
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
     * 保存索引到磁盘
     */
    async save(storagePath: string): Promise<void> {
        const data = {
            version: 1,
            buildTime: this.lastBuildTime,
            fileCount: this.fileCount,
            symbols: {} as Record<string, SymbolEntry[]>
        };

        for (const [key, entries] of this.symbols) {
            data.symbols[key] = entries;
        }

        const dir = path.dirname(storagePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(storagePath, JSON.stringify(data), 'utf8');
    }

    /**
     * 从磁盘加载索引
     */
    async load(storagePath: string): Promise<boolean> {
        try {
            if (!fs.existsSync(storagePath)) return false;

            const raw = fs.readFileSync(storagePath, 'utf8');
            const data = JSON.parse(raw);

            if (data.version !== 1) return false;

            this.symbols.clear();
            for (const [key, entries] of Object.entries(data.symbols)) {
                this.symbols.set(key, entries as SymbolEntry[]);
            }

            this.lastBuildTime = data.buildTime;
            this.fileCount = data.fileCount;
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
            fileCount: this.fileCount,
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
     * 索引单个文件
     */
    private async indexFile(filePath: string): Promise<void> {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // 每次解析使用独立实例（Issue #15 同源教训）：buildIndex 与
            // watcher 驱动的 updateFile 可能交错，共享实例会在 await 点互相污染
            const result = await new PLSQLParser().parse(content, filePath);

            if (result.metadata.errors.length > 0) return;

            const symbolNames: string[] = [];

            for (const node of result.nodes) {
                this.extractSymbols(node, filePath, undefined, symbolNames);
            }

            this.fileSymbols.set(filePath, symbolNames);
        } catch {
            // 跳过无法解析的文件
        }
    }

    /**
     * 从节点树提取符号
     */
    private extractSymbols(node: ParseNode, filePath: string, packageName: string | undefined, symbolNames: string[]): void {
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

            if (!this.symbols.has(upperName)) {
                this.symbols.set(upperName, []);
            }
            this.symbols.get(upperName)!.push(entry);
            symbolNames.push(upperName);
        }

        // 递归处理子节点（只处理Package的直接子节点作为符号）
        if (isPackage) {
            for (const child of node.children) {
                this.extractSymbols(child, filePath, node.name, symbolNames);
            }
        }
    }
}

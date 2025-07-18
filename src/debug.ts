import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ParseResult, DebugConfig, LogLevel } from './types';

/**
 * 调试管理器
 */
export class DebugManager {
    private config: DebugConfig;

    constructor() {
        this.config = this.loadConfig();
    }

    /**
     * 加载调试配置
     */
    private loadConfig(): DebugConfig {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        return {
            enabled: config.get('debug.enabled', false),
            outputPath: config.get('debug.outputPath', '${workspaceFolder}/.plsql-debug'),
            logLevel: config.get('debug.logLevel', 'INFO') as 'ERROR' | 'WARN' | 'INFO' | 'DEBUG',
            keepFiles: config.get('debug.keepFiles', true),
            maxFiles: config.get('debug.maxFiles', 50)
        };
    }

    /**
     * 刷新配置
     */
    refreshConfig(): void {
        this.config = this.loadConfig();
    }

    /**
     * 是否启用调试模式
     */
    isDebugMode(): boolean {
        return this.config.enabled;
    }

    /**
     * 获取输出路径
     */
    getOutputPath(): string {
        let outputPath = this.config.outputPath;
        
        // 替换变量
        if (outputPath.includes('${workspaceFolder}')) {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
            outputPath = outputPath.replace('${workspaceFolder}', workspaceFolder);
        }
        
        return outputPath;
    }

    /**
     * 获取日志级别
     */
    getLogLevel(): LogLevel {
        switch (this.config.logLevel) {
            case 'ERROR': return LogLevel.ERROR;
            case 'WARN': return LogLevel.WARN;
            case 'INFO': return LogLevel.INFO;
            case 'DEBUG': return LogLevel.DEBUG;
            default: return LogLevel.INFO;
        }
    }

    /**
     * 是否应该输出JSON文件
     */
    shouldOutputJSON(): boolean {
        return this.config.enabled;
    }

    /**
     * 是否应该输出日志
     */
    shouldOutputLogs(): boolean {
        return this.config.enabled;
    }

    /**
     * 是否保留历史文件
     */
    shouldKeepFiles(): boolean {
        return this.config.keepFiles;
    }

    /**
     * 获取最大文件数
     */
    getMaxFiles(): number {
        return this.config.maxFiles;
    }

    /**
     * 切换调试模式
     */
    async toggleDebugMode(): Promise<void> {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const currentValue = config.get('debug.enabled', false);
        await config.update('debug.enabled', !currentValue, vscode.ConfigurationTarget.Workspace);
        this.refreshConfig();
        
        vscode.window.showInformationMessage(
            `调试模式已${this.config.enabled ? '启用' : '禁用'}`
        );
    }
}

/**
 * 文件输出管理器
 */
export class FileOutputManager {
    private debugManager: DebugManager;
    private logger: Logger;

    constructor(debugManager: DebugManager) {
        this.debugManager = debugManager;
        this.logger = new Logger(debugManager);
    }

    /**
     * 输出JSON文件
     */
    async outputJSON(data: ParseResult, sourceFile: string): Promise<string> {
        if (!this.debugManager.shouldOutputJSON()) {
            return '';
        }

        try {
            const outputPath = this.debugManager.getOutputPath();
            await this.ensureDirectoryExists(outputPath);

            const fileName = this.generateJSONFileName(sourceFile);
            const filePath = path.join(outputPath, fileName);

            // 添加调试元数据
            const debugData = {
                ...data,
                debugInfo: {
                    timestamp: new Date().toISOString(),
                    sourceFile: sourceFile,
                    outputPath: filePath,
                    debugConfig: {
                        enabled: this.debugManager.isDebugMode(),
                        logLevel: this.debugManager.getLogLevel()
                    }
                }
            };

            const jsonContent = JSON.stringify(debugData, null, 2);
            await fs.promises.writeFile(filePath, jsonContent, 'utf8');

            await this.logger.info(`JSON文件已输出: ${filePath}`);
            await this.cleanupOldFiles();

            return filePath;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            await this.logger.error(`输出JSON文件失败: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * 输出日志
     */
    async outputLog(message: string, level: LogLevel): Promise<void> {
        await this.logger.log(message, level);
    }

    /**
     * 清理旧文件
     */
    async cleanupOldFiles(): Promise<void> {
        if (!this.debugManager.shouldKeepFiles()) {
            return;
        }

        try {
            const outputPath = this.debugManager.getOutputPath();
            const maxFiles = this.debugManager.getMaxFiles();

            if (!await this.directoryExists(outputPath)) {
                return;
            }

            const files = await fs.promises.readdir(outputPath);
            const jsonFiles = files
                .filter(file => file.endsWith('.json'))
                .map(file => ({
                    name: file,
                    path: path.join(outputPath, file),
                    stat: fs.statSync(path.join(outputPath, file))
                }))
                .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());

            if (jsonFiles.length > maxFiles) {
                const filesToDelete = jsonFiles.slice(maxFiles);
                for (const file of filesToDelete) {
                    await fs.promises.unlink(file.path);
                    await this.logger.debug(`删除旧文件: ${file.name}`);
                }
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            await this.logger.warn(`清理旧文件失败: ${errorMessage}`);
        }
    }

    /**
     * 生成JSON文件名
     */
    private generateJSONFileName(sourceFile: string): string {
        const baseName = path.basename(sourceFile, path.extname(sourceFile));
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `${baseName}_${timestamp}.json`;
    }

    /**
     * 确保目录存在
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.promises.access(dirPath);
        } catch {
            await fs.promises.mkdir(dirPath, { recursive: true });
        }
    }

    /**
     * 检查目录是否存在
     */
    private async directoryExists(dirPath: string): Promise<boolean> {
        try {
            const stat = await fs.promises.stat(dirPath);
            return stat.isDirectory();
        } catch {
            return false;
        }
    }
}

/**
 * 日志记录器
 */
export class Logger {
    private debugManager: DebugManager;
    private logFilePath: string;

    constructor(debugManager: DebugManager) {
        this.debugManager = debugManager;
        this.logFilePath = '';
        this.initializeLogFile();
    }

    /**
     * 初始化日志文件
     */
    private async initializeLogFile(): Promise<void> {
        if (!this.debugManager.shouldOutputLogs()) {
            return;
        }

        try {
            const outputPath = this.debugManager.getOutputPath();
            await this.ensureDirectoryExists(outputPath);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            this.logFilePath = path.join(outputPath, `plsql-outline_${timestamp}.log`);

            await this.writeLogEntry('INFO', '日志记录器初始化完成');

        } catch (error) {
            console.error('初始化日志文件失败:', error);
        }
    }

    /**
     * 记录日志
     */
    async log(message: string, level: LogLevel): Promise<void> {
        if (!this.debugManager.shouldOutputLogs()) {
            return;
        }

        const currentLevel = this.debugManager.getLogLevel();
        if (level > currentLevel) {
            return;
        }

        const levelName = this.getLevelName(level);
        await this.writeLogEntry(levelName, message);
    }

    /**
     * 错误日志
     */
    async error(message: string): Promise<void> {
        await this.log(message, LogLevel.ERROR);
    }

    /**
     * 警告日志
     */
    async warn(message: string): Promise<void> {
        await this.log(message, LogLevel.WARN);
    }

    /**
     * 信息日志
     */
    async info(message: string): Promise<void> {
        await this.log(message, LogLevel.INFO);
    }

    /**
     * 调试日志
     */
    async debug(message: string): Promise<void> {
        await this.log(message, LogLevel.DEBUG);
    }

    /**
     * 写入日志条目
     */
    private async writeLogEntry(level: string, message: string): Promise<void> {
        if (!this.logFilePath) {
            return;
        }

        try {
            const timestamp = new Date().toISOString();
            const logEntry = `[${timestamp}] [${level}] ${message}\n`;
            await fs.promises.appendFile(this.logFilePath, logEntry, 'utf8');

        } catch (error) {
            console.error('写入日志失败:', error);
        }
    }

    /**
     * 获取级别名称
     */
    private getLevelName(level: LogLevel): string {
        switch (level) {
            case LogLevel.ERROR: return 'ERROR';
            case LogLevel.WARN: return 'WARN';
            case LogLevel.INFO: return 'INFO';
            case LogLevel.DEBUG: return 'DEBUG';
            default: return 'INFO';
        }
    }

    /**
     * 确保目录存在
     */
    private async ensureDirectoryExists(dirPath: string): Promise<void> {
        try {
            await fs.promises.access(dirPath);
        } catch {
            await fs.promises.mkdir(dirPath, { recursive: true });
        }
    }
}

/**
 * 数据传递桥接器
 */
export class DataBridge {
    private debugManager: DebugManager;
    private fileOutputManager: FileOutputManager;
    private logger: Logger;

    constructor() {
        this.debugManager = new DebugManager();
        this.fileOutputManager = new FileOutputManager(this.debugManager);
        this.logger = new Logger(this.debugManager);
    }

    /**
     * 处理解析结果
     */
    async processParseResult(result: ParseResult, sourceFile: string): Promise<ParseResult> {
        try {
            // 记录解析开始
            await this.logger.info(`开始处理解析结果: ${sourceFile}`);

            // 在调试模式下输出JSON文件
            if (this.debugManager.isDebugMode()) {
                const jsonPath = await this.fileOutputManager.outputJSON(result, sourceFile);
                await this.logger.info(`解析结果已保存到: ${jsonPath}`);

                // 记录解析统计信息
                await this.logParseStatistics(result);
            }

            await this.logger.info(`解析结果处理完成: ${sourceFile}`);
            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            await this.logger.error(`处理解析结果失败: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * 记录解析统计信息
     */
    private async logParseStatistics(result: ParseResult): Promise<void> {
        const stats = {
            nodeCount: result.nodes.length,
            totalLines: result.metadata.totalLines,
            parseTime: result.metadata.parseTime,
            maxNestingDepth: result.metadata.maxNestingDepth,
            errorCount: result.metadata.errors.length,
            warningCount: result.metadata.warnings.length
        };

        await this.logger.info(`解析统计: ${JSON.stringify(stats)}`);
    }

    /**
     * 获取调试管理器
     */
    getDebugManager(): DebugManager {
        return this.debugManager;
    }

    /**
     * 获取文件输出管理器
     */
    getFileOutputManager(): FileOutputManager {
        return this.fileOutputManager;
    }

    /**
     * 获取日志记录器
     */
    getLogger(): Logger {
        return this.logger;
    }

    /**
     * 刷新配置
     */
    refreshConfig(): void {
        this.debugManager.refreshConfig();
    }
}

/**
 * 数据提供者接口
 */
export interface IDataProvider {
    getParseResult(): Promise<ParseResult>;
}

/**
 * 内存数据提供者（生产模式）
 */
export class MemoryDataProvider implements IDataProvider {
    private parseResult: ParseResult;

    constructor(parseResult: ParseResult) {
        this.parseResult = parseResult;
    }

    async getParseResult(): Promise<ParseResult> {
        return this.parseResult;
    }
}

/**
 * 文件数据提供者（调试模式）
 */
export class FileDataProvider implements IDataProvider {
    private filePath: string;
    private logger: Logger;

    constructor(filePath: string, logger: Logger) {
        this.filePath = filePath;
        this.logger = logger;
    }

    async getParseResult(): Promise<ParseResult> {
        try {
            await this.logger.debug(`从文件读取解析结果: ${this.filePath}`);
            
            const content = await fs.promises.readFile(this.filePath, 'utf8');
            const data = JSON.parse(content);
            
            // 移除调试信息
            if (data.debugInfo) {
                delete data.debugInfo;
            }
            
            await this.logger.debug(`文件读取成功: ${this.filePath}`);
            return data as ParseResult;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            await this.logger.error(`从文件读取解析结果失败: ${errorMessage}`);
            throw new Error(`无法读取解析结果文件: ${errorMessage}`);
        }
    }
}

/**
 * 数据提供者工厂
 */
export class DataProviderFactory {
    private debugManager: DebugManager;
    private logger: Logger;

    constructor(debugManager: DebugManager, logger: Logger) {
        this.debugManager = debugManager;
        this.logger = logger;
    }

    /**
     * 创建数据提供者
     */
    createDataProvider(parseResult: ParseResult, jsonFilePath?: string): IDataProvider {
        if (this.debugManager.isDebugMode() && jsonFilePath) {
            return new FileDataProvider(jsonFilePath, this.logger);
        } else {
            return new MemoryDataProvider(parseResult);
        }
    }
}

import * as vscode from 'vscode';
import { ParseResult, DebugConfig, LogLevel } from './types';

/**
 * 调试管理器 - 简化版本，使用VS Code输出通道
 */
export class DebugManager {
    private config: DebugConfig;
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.config = this.loadConfig();
        this.outputChannel = vscode.window.createOutputChannel('PL/SQL Outline Debug');
    }

    /**
     * 加载调试配置
     */
    private loadConfig(): DebugConfig {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        return {
            enabled: config.get('debug.enabled', false),
            outputPath: '', // 不再使用文件输出
            logLevel: config.get('debug.logLevel', 'INFO') as 'ERROR' | 'WARN' | 'INFO' | 'DEBUG',
            keepFiles: false, // 不再保留文件
            maxFiles: 0 // 不再限制文件数量
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
     * 输出调试信息到VS Code输出通道
     */
    outputDebug(message: string, level: LogLevel = LogLevel.INFO): void {
        if (!this.config.enabled) {
            return;
        }

        const currentLevel = this.getLogLevel();
        if (level > currentLevel) {
            return;
        }

        const timestamp = new Date().toLocaleTimeString();
        const levelName = this.getLevelName(level);
        const logMessage = `[${timestamp}] [${levelName}] ${message}`;
        
        this.outputChannel.appendLine(logMessage);
        
        // 对于错误和警告，也显示输出通道
        if (level <= LogLevel.WARN) {
            this.outputChannel.show(true);
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
     * 切换调试模式
     */
    async toggleDebugMode(): Promise<void> {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const currentValue = config.get('debug.enabled', false);
        await config.update('debug.enabled', !currentValue, vscode.ConfigurationTarget.Workspace);
        this.refreshConfig();
        
        const message = `调试模式已${this.config.enabled ? '启用' : '禁用'}`;
        vscode.window.showInformationMessage(message);
        this.outputDebug(message, LogLevel.INFO);
        
        if (this.config.enabled) {
            this.outputChannel.show(true);
        }
    }

    /**
     * 获取输出通道
     */
    getOutputChannel(): vscode.OutputChannel {
        return this.outputChannel;
    }
}

/**
 * 简化的日志记录器 - 使用VS Code输出通道
 */
export class Logger {
    private debugManager: DebugManager;

    constructor(debugManager: DebugManager) {
        this.debugManager = debugManager;
    }

    /**
     * 记录日志
     */
    log(message: string, level: LogLevel): void {
        this.debugManager.outputDebug(message, level);
    }

    /**
     * 错误日志
     */
    error(message: string): void {
        this.log(message, LogLevel.ERROR);
    }

    /**
     * 警告日志
     */
    warn(message: string): void {
        this.log(message, LogLevel.WARN);
    }

    /**
     * 信息日志
     */
    info(message: string): void {
        this.log(message, LogLevel.INFO);
    }

    /**
     * 调试日志
     */
    debug(message: string): void {
        this.log(message, LogLevel.DEBUG);
    }
}

/**
 * 数据传递桥接器 - 简化版本
 */
export class DataBridge {
    private debugManager: DebugManager;
    private logger: Logger;

    constructor() {
        this.debugManager = new DebugManager();
        this.logger = new Logger(this.debugManager);
    }

    /**
     * 处理解析结果
     */
    async processParseResult(result: ParseResult, sourceFile: string): Promise<ParseResult> {
        try {
            // 记录解析开始
            this.logger.info(`开始处理解析结果: ${sourceFile}`);

            // 在调试模式下记录统计信息
            if (this.debugManager.isDebugMode()) {
                this.logParseStatistics(result);
            }

            this.logger.info(`解析结果处理完成: ${sourceFile}`);
            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            this.logger.error(`处理解析结果失败: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * 记录解析统计信息
     */
    private logParseStatistics(result: ParseResult): void {
        const stats = {
            nodeCount: result.nodes.length,
            totalLines: result.metadata.totalLines,
            parseTime: result.metadata.parseTime,
            maxNestingDepth: result.metadata.maxNestingDepth,
            errorCount: result.metadata.errors.length,
            warningCount: result.metadata.warnings.length
        };

        this.logger.info(`解析统计: ${JSON.stringify(stats)}`);
    }

    /**
     * 获取调试管理器
     */
    getDebugManager(): DebugManager {
        return this.debugManager;
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
 * 数据提供者工厂 - 简化版本
 */
export class DataProviderFactory {
    private debugManager: DebugManager;
    private logger: Logger;

    constructor(debugManager: DebugManager, logger: Logger) {
        this.debugManager = debugManager;
        this.logger = logger;
    }

    /**
     * 创建数据提供者 - 只使用内存提供者
     */
    createDataProvider(parseResult: ParseResult): IDataProvider {
        this.logger.debug('创建内存数据提供者');
        return new MemoryDataProvider(parseResult);
    }
}

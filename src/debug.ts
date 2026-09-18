import * as vscode from 'vscode';
import { ParseResult, DebugConfig, LogLevel } from './types';
import { getOutputChannel } from './logger';

/**
 * 调试管理器 - 使用统一输出通道，按级别过滤
 * （v1.8.0 起：文件输出相关配置已废弃删除，仅保留开关与日志级别）
 */
export class DebugManager {
    private config: DebugConfig;
    private outputChannel = getOutputChannel();

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
            logLevel: config.get('debug.logLevel', 'INFO') as 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'
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
     * 输出调试信息到输出通道
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
     * 调试模式下记录解析统计（未启用调试时零开销直接返回）
     */
    logParseResult(result: ParseResult, sourceFile: string): void {
        if (!this.config.enabled) {
            return;
        }
        this.outputDebug(`开始处理解析结果: ${sourceFile}`, LogLevel.INFO);
        this.outputDebug(`解析统计: ${JSON.stringify({
            nodeCount: result.nodes.length,
            totalLines: result.metadata.totalLines,
            parseTime: result.metadata.parseTime,
            maxNestingDepth: result.metadata.maxNestingDepth,
            errorCount: result.metadata.errors.length,
            warningCount: result.metadata.warnings.length
        })}`, LogLevel.INFO);
        this.outputDebug(`解析结果处理完成: ${sourceFile}`, LogLevel.INFO);
    }

    /**
     * 获取级别名称
     */
    private getLevelName(level: LogLevel): string {
        return LogLevel[level] ?? 'INFO';
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
}

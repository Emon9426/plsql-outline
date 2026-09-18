import * as vscode from 'vscode';

/**
 * 全局唯一输出通道。
 * 此前 extension/treeView/debug 各自 createOutputChannel，产生 4 个同名通道；
 * 统一由此获取，避免重复与日志分散。
 */
let channel: vscode.OutputChannel | null = null;

export function getOutputChannel(): vscode.OutputChannel {
    if (!channel) {
        channel = vscode.window.createOutputChannel('PL/SQL Outline');
    }
    return channel;
}

/** 追加一行日志到输出通道 */
export function logLine(message: string): void {
    getOutputChannel().appendLine(message);
}

/** 扩展停用时释放通道 */
export function disposeOutputChannel(): void {
    channel?.dispose();
    channel = null;
}

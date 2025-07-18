import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 展开功能调试器
 */
export class ExpandDebugger {
    private debugDir: string;
    private logFile: string;

    constructor() {
        this.debugDir = path.join(__dirname, '..', 'test');
        this.logFile = path.join(this.debugDir, 'expand_debug.log');
        this.ensureDebugDir();
    }

    /**
     * 确保调试目录存在
     */
    private ensureDebugDir(): void {
        try {
            if (!fs.existsSync(this.debugDir)) {
                fs.mkdirSync(this.debugDir, { recursive: true });
            }
        } catch (error) {
            console.error('创建调试目录失败:', error);
        }
    }

    /**
     * 写入调试日志
     */
    public log(message: string, data?: any): void {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}`;
        
        console.log(logEntry);
        
        if (data) {
            console.log('数据:', data);
        }

        try {
            let fileContent = logEntry + '\n';
            if (data) {
                fileContent += `数据: ${JSON.stringify(data, null, 2)}\n`;
            }
            fileContent += '---\n';

            fs.appendFileSync(this.logFile, fileContent, 'utf8');
        } catch (error) {
            console.error('写入调试日志失败:', error);
        }
    }

    /**
     * 清空调试日志
     */
    public clearLog(): void {
        try {
            if (fs.existsSync(this.logFile)) {
                fs.unlinkSync(this.logFile);
            }
            this.log('调试日志已清空');
        } catch (error) {
            console.error('清空调试日志失败:', error);
        }
    }

    /**
     * 调试命令注册
     */
    public async debugCommandRegistration(): Promise<void> {
        this.log('开始调试命令注册');
        
        try {
            // 检查所有已注册的命令
            const commands = await vscode.commands.getCommands(true);
            const plsqlCommands = commands.filter(cmd => cmd.startsWith('plsqlOutline.'));
            this.log('已注册的PL/SQL命令', plsqlCommands);
            
            // 检查特定命令是否存在
            const expandAllExists = commands.includes('plsqlOutline.expandAll');
            const testExpandAllExists = commands.includes('plsqlOutline.testExpandAll');
            
            this.log('expandAll命令是否存在', expandAllExists);
            this.log('testExpandAll命令是否存在', testExpandAllExists);
        } catch (error: any) {
            this.log('获取命令列表失败', error);
        }
    }

    /**
     * 调试树视图状态
     */
    public debugTreeViewState(treeView: vscode.TreeView<any>): void {
        this.log('开始调试树视图状态');
        
        try {
            this.log('树视图标题', treeView.title);
            this.log('树视图描述', treeView.description);
            this.log('树视图可见性', treeView.visible);
            this.log('树视图选择项数量', treeView.selection.length);
        } catch (error) {
            this.log('调试树视图状态失败', error);
        }
    }

    /**
     * 调试数据提供者状态
     */
    public async debugDataProviderState(provider: any): Promise<void> {
        this.log('开始调试数据提供者状态');
        
        try {
            this.log('数据提供者是否存在', !!provider);
            
            if (provider) {
                this.log('dataProvider是否存在', !!provider.dataProvider);
                this.log('forceExpandAll标志', provider.forceExpandAll);
                
                if (provider.dataProvider) {
                    try {
                        const result = await provider.dataProvider.getParseResult();
                        if (result) {
                            this.log('解析结果节点数量', result.nodes ? result.nodes.length : 0);
                            this.log('解析结果元数据', result.metadata);
                        } else {
                            this.log('没有解析结果');
                        }
                    } catch (error: any) {
                        this.log('获取解析结果失败', error);
                    }
                }
            }
        } catch (error) {
            this.log('调试数据提供者状态失败', error);
        }
    }

    /**
     * 调试展开功能执行
     */
    public debugExpandExecution(step: string, data?: any): void {
        this.log(`展开执行步骤: ${step}`, data);
    }

    /**
     * 测试命令执行
     */
    public async testCommandExecution(): Promise<void> {
        this.log('开始测试命令执行');
        
        try {
            // 测试基础命令
            this.log('测试执行testExpandAll命令');
            await vscode.commands.executeCommand('plsqlOutline.testExpandAll');
            this.log('testExpandAll命令执行成功');
        } catch (error) {
            this.log('testExpandAll命令执行失败', error);
        }

        try {
            // 测试展开命令
            this.log('测试执行expandAll命令');
            await vscode.commands.executeCommand('plsqlOutline.expandAll');
            this.log('expandAll命令执行成功');
        } catch (error) {
            this.log('expandAll命令执行失败', error);
        }
    }

    /**
     * 生成完整的调试报告
     */
    public async generateDebugReport(): Promise<void> {
        this.log('=== 开始生成完整调试报告 ===');
        
        // 基础信息
        this.log('VSCode版本', vscode.version);
        this.log('扩展激活状态', vscode.extensions.getExtension('plsql-outline.plsql-outline')?.isActive);
        
        // 命令注册状态
        await this.debugCommandRegistration();
        
        // 测试命令执行
        await this.testCommandExecution();
        
        this.log('=== 调试报告生成完成 ===');
    }

    /**
     * 获取调试日志路径
     */
    public getLogPath(): string {
        return this.logFile;
    }
}

import * as vscode from 'vscode';
import { 
    ParseResult, 
    ParseNode, 
    NodeType, 
    StructureBlock, 
    StructureBlockType, 
    TreeItemData 
} from './types';
import { IDataProvider } from './debug';

/**
 * PL/SQL大纲树数据提供者
 */
export class PLSQLOutlineProvider implements vscode.TreeDataProvider<TreeItemData> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItemData | undefined | null | void> = new vscode.EventEmitter<TreeItemData | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItemData | undefined | null | void> = this._onDidChangeTreeData.event;

    private dataProvider: IDataProvider | null = null;
    private showStructureBlocks: boolean = true;

    constructor() {
        this.loadConfiguration();
    }

    /**
     * 加载配置
     */
    private loadConfiguration(): void {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        this.showStructureBlocks = config.get('view.showStructureBlocks', true);
    }

    /**
     * 设置数据提供者
     */
    setDataProvider(dataProvider: IDataProvider): void {
        this.dataProvider = dataProvider;
        this.refresh();
    }

    /**
     * 刷新树视图
     */
    refresh(): void {
        this.loadConfiguration();
        this._onDidChangeTreeData.fire();
    }

    /**
     * 获取树项
     */
    getTreeItem(element: TreeItemData): vscode.TreeItem {
        if (element.isStructureBlock) {
            return this.createStructureBlockTreeItem(element);
        } else {
            return this.createNodeTreeItem(element);
        }
    }

    /**
     * 获取子项
     */
    async getChildren(element?: TreeItemData): Promise<TreeItemData[]> {
        if (!this.dataProvider) {
            return [];
        }

        try {
            const parseResult = await this.dataProvider.getParseResult();
            
            if (!element) {
                // 根级别：返回所有顶层节点
                return this.createTreeItemsFromNodes(parseResult.nodes);
            } else if (!element.isStructureBlock && element.node) {
                // 节点级别：返回子节点和结构块
                return this.createChildItems(element.node);
            }
            
            return [];

        } catch (error) {
            console.error('获取树项子项失败:', error);
            return [];
        }
    }

    /**
     * 从节点创建树项数据
     */
    private createTreeItemsFromNodes(nodes: ParseNode[]): TreeItemData[] {
        const items: TreeItemData[] = [];
        
        for (const node of nodes) {
            items.push({
                node,
                isStructureBlock: false,
                label: this.getNodeLabel(node),
                line: node.declarationLine
            });
        }
        
        return items;
    }

    /**
     * 创建子项（包括子节点和结构块）
     */
    private createChildItems(node: ParseNode): TreeItemData[] {
        const items: TreeItemData[] = [];
        
        // 添加子节点
        for (const child of node.children) {
            items.push({
                node: child,
                isStructureBlock: false,
                label: this.getNodeLabel(child),
                line: child.declarationLine
            });
        }
        
        // 添加结构块（如果启用）
        if (this.showStructureBlocks && this.shouldShowStructureBlocks(node)) {
            const structureBlocks = this.createStructureBlocks(node);
            items.push(...structureBlocks);
        }
        
        return items;
    }

    /**
     * 创建结构块
     */
    private createStructureBlocks(node: ParseNode): TreeItemData[] {
        const blocks: TreeItemData[] = [];
        
        // BEGIN块
        if (node.beginLine !== null && node.beginLine !== undefined) {
            blocks.push({
                structureBlock: {
                    type: StructureBlockType.BEGIN,
                    line: node.beginLine,
                    parentNode: node
                },
                isStructureBlock: true,
                label: 'BEGIN',
                line: node.beginLine
            });
        }
        
        // EXCEPTION块
        if (node.exceptionLine !== null && node.exceptionLine !== undefined) {
            blocks.push({
                structureBlock: {
                    type: StructureBlockType.EXCEPTION,
                    line: node.exceptionLine,
                    parentNode: node
                },
                isStructureBlock: true,
                label: 'EXCEPTION',
                line: node.exceptionLine
            });
        }
        
        // END块
        if (node.endLine !== null && node.endLine !== undefined) {
            blocks.push({
                structureBlock: {
                    type: StructureBlockType.END,
                    line: node.endLine,
                    parentNode: node
                },
                isStructureBlock: true,
                label: 'END',
                line: node.endLine
            });
        }
        
        return blocks;
    }

    /**
     * 创建节点树项
     */
    private createNodeTreeItem(element: TreeItemData): vscode.TreeItem {
        const node = element.node!;
        const treeItem = new vscode.TreeItem(
            element.label,
            this.getCollapsibleState(node)
        );
        
        treeItem.iconPath = this.getNodeIcon(node.type);
        treeItem.tooltip = this.getNodeTooltip(node);
        treeItem.description = this.getNodeDescription(node);
        
        // 设置命令（点击跳转）
        if (element.line !== undefined) {
            treeItem.command = {
                command: 'plsqlOutline.goToLine',
                title: '跳转到行',
                arguments: [element.line]
            };
        }
        
        // 设置上下文值（用于右键菜单）
        treeItem.contextValue = this.getNodeContextValue(node);
        
        return treeItem;
    }

    /**
     * 创建结构块树项
     */
    private createStructureBlockTreeItem(element: TreeItemData): vscode.TreeItem {
        const block = element.structureBlock!;
        const treeItem = new vscode.TreeItem(
            element.label,
            vscode.TreeItemCollapsibleState.None
        );
        
        treeItem.iconPath = this.getStructureBlockIcon(block.type);
        treeItem.tooltip = this.getStructureBlockTooltip(block);
        treeItem.description = `第${block.line}行`;
        
        // 设置命令（点击跳转）
        treeItem.command = {
            command: 'plsqlOutline.goToLine',
            title: '跳转到行',
            arguments: [block.line]
        };
        
        // 设置上下文值
        treeItem.contextValue = 'structureBlock';
        
        return treeItem;
    }

    /**
     * 获取节点标签
     */
    private getNodeLabel(node: ParseNode): string {
        return `${node.name} (${this.getNodeTypeDisplayName(node.type)})`;
    }

    /**
     * 获取节点类型显示名称
     */
    private getNodeTypeDisplayName(type: NodeType): string {
        switch (type) {
            case NodeType.PACKAGE_HEADER: return 'Package Header';
            case NodeType.PACKAGE_BODY: return 'Package Body';
            case NodeType.FUNCTION: return 'Function';
            case NodeType.PROCEDURE: return 'Procedure';
            case NodeType.FUNCTION_DECLARATION: return 'Function Declaration';
            case NodeType.PROCEDURE_DECLARATION: return 'Procedure Declaration';
            case NodeType.TRIGGER: return 'Trigger';
            case NodeType.ANONYMOUS_BLOCK: return 'Anonymous Block';
            default: return type;
        }
    }

    /**
     * 获取折叠状态
     */
    private getCollapsibleState(node: ParseNode): vscode.TreeItemCollapsibleState {
        const hasChildren = node.children.length > 0;
        const hasStructureBlocks = this.showStructureBlocks && this.shouldShowStructureBlocks(node);
        
        if (hasChildren || hasStructureBlocks) {
            return vscode.TreeItemCollapsibleState.Expanded;
        } else {
            return vscode.TreeItemCollapsibleState.None;
        }
    }

    /**
     * 是否应该显示结构块
     */
    private shouldShowStructureBlocks(node: ParseNode): boolean {
        // Package Header中的声明不显示结构块
        if (node.type === NodeType.FUNCTION_DECLARATION || 
            node.type === NodeType.PROCEDURE_DECLARATION) {
            return false;
        }
        
        // 检查是否有任何结构块信息
        return node.beginLine !== null || 
               node.exceptionLine !== null || 
               node.endLine !== null;
    }

    /**
     * 获取节点图标
     */
    private getNodeIcon(type: NodeType): vscode.ThemeIcon {
        switch (type) {
            case NodeType.PACKAGE_HEADER:
            case NodeType.PACKAGE_BODY:
                return new vscode.ThemeIcon('package');
            case NodeType.FUNCTION:
            case NodeType.FUNCTION_DECLARATION:
                return new vscode.ThemeIcon('symbol-function');
            case NodeType.PROCEDURE:
            case NodeType.PROCEDURE_DECLARATION:
                return new vscode.ThemeIcon('symbol-method');
            case NodeType.TRIGGER:
                return new vscode.ThemeIcon('zap');
            case NodeType.ANONYMOUS_BLOCK:
                return new vscode.ThemeIcon('file-code');
            default:
                return new vscode.ThemeIcon('symbol-misc');
        }
    }

    /**
     * 获取结构块图标
     */
    private getStructureBlockIcon(type: StructureBlockType): vscode.ThemeIcon {
        switch (type) {
            case StructureBlockType.BEGIN:
                return new vscode.ThemeIcon('play');
            case StructureBlockType.EXCEPTION:
                return new vscode.ThemeIcon('warning');
            case StructureBlockType.END:
                return new vscode.ThemeIcon('stop');
            case StructureBlockType.PACKAGE_INITIALIZATION:
                return new vscode.ThemeIcon('refresh');
            default:
                return new vscode.ThemeIcon('circle-outline');
        }
    }

    /**
     * 获取节点工具提示
     */
    private getNodeTooltip(node: ParseNode): string {
        const lines: string[] = [];
        lines.push(`名称: ${node.name}`);
        lines.push(`类型: ${this.getNodeTypeDisplayName(node.type)}`);
        lines.push(`层级: ${node.level}`);
        lines.push(`声明行: ${node.declarationLine}`);
        
        if (node.beginLine !== null && node.beginLine !== undefined) {
            lines.push(`BEGIN行: ${node.beginLine}`);
        }
        if (node.exceptionLine !== null && node.exceptionLine !== undefined) {
            lines.push(`EXCEPTION行: ${node.exceptionLine}`);
        }
        if (node.endLine !== null && node.endLine !== undefined) {
            lines.push(`END行: ${node.endLine}`);
        }
        
        if (node.children.length > 0) {
            lines.push(`子项数量: ${node.children.length}`);
        }
        
        return lines.join('\n');
    }

    /**
     * 获取结构块工具提示
     */
    private getStructureBlockTooltip(block: StructureBlock): string {
        return `${block.type} 块 (第${block.line}行)\n父节点: ${block.parentNode.name}`;
    }

    /**
     * 获取节点描述
     */
    private getNodeDescription(node: ParseNode): string {
        const parts: string[] = [];
        
        if (node.level > 1) {
            parts.push(`L${node.level}`);
        }
        
        parts.push(`第${node.declarationLine}行`);
        
        if (node.children.length > 0) {
            parts.push(`${node.children.length}个子项`);
        }
        
        return parts.join(' • ');
    }

    /**
     * 获取节点上下文值
     */
    private getNodeContextValue(node: ParseNode): string {
        const baseContext = node.type.toLowerCase().replace(/\s+/g, '_');
        
        if (node.children.length > 0) {
            return `${baseContext}_with_children`;
        } else {
            return baseContext;
        }
    }
}

/**
 * 树视图管理器
 */
export class TreeViewManager {
    private treeView: vscode.TreeView<TreeItemData>;
    private provider: PLSQLOutlineProvider;

    constructor(context: vscode.ExtensionContext) {
        this.provider = new PLSQLOutlineProvider();
        
        this.treeView = vscode.window.createTreeView('plsqlOutline', {
            treeDataProvider: this.provider,
            showCollapseAll: true
        });

        // 注册命令
        this.registerCommands(context);
        
        // 监听配置变化
        this.registerConfigurationListener(context);
    }

    /**
     * 注册命令
     */
    private registerCommands(context: vscode.ExtensionContext): void {
        // 跳转到行命令
        const goToLineCommand = vscode.commands.registerCommand(
            'plsqlOutline.goToLine',
            (line: number) => this.goToLine(line)
        );

        // 刷新命令
        const refreshCommand = vscode.commands.registerCommand(
            'plsqlOutline.refresh',
            () => this.refresh()
        );

        // 切换结构块显示
        const toggleStructureBlocksCommand = vscode.commands.registerCommand(
            'plsqlOutline.toggleStructureBlocks',
            () => this.toggleStructureBlocks()
        );

        context.subscriptions.push(
            goToLineCommand,
            refreshCommand,
            toggleStructureBlocksCommand
        );
    }

    /**
     * 注册配置监听器
     */
    private registerConfigurationListener(context: vscode.ExtensionContext): void {
        const configListener = vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('plsql-outline')) {
                this.provider.refresh();
            }
        });

        context.subscriptions.push(configListener);
    }

    /**
     * 跳转到指定行
     */
    private async goToLine(line: number): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('没有活动的编辑器');
            return;
        }

        try {
            const position = new vscode.Position(line - 1, 0);
            const range = new vscode.Range(position, position);
            
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
            
            // 聚焦到编辑器
            await vscode.window.showTextDocument(editor.document);

        } catch (error) {
            vscode.window.showErrorMessage(`跳转到第${line}行失败: ${error}`);
        }
    }

    /**
     * 刷新树视图
     */
    refresh(): void {
        this.provider.refresh();
    }

    /**
     * 切换结构块显示
     */
    private async toggleStructureBlocks(): Promise<void> {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const currentValue = config.get('view.showStructureBlocks', true);
        
        await config.update(
            'view.showStructureBlocks', 
            !currentValue, 
            vscode.ConfigurationTarget.Workspace
        );
        
        vscode.window.showInformationMessage(
            `结构块显示已${!currentValue ? '启用' : '禁用'}`
        );
    }

    /**
     * 更新数据提供者
     */
    updateDataProvider(dataProvider: IDataProvider): void {
        this.provider.setDataProvider(dataProvider);
    }

    /**
     * 获取树视图
     */
    getTreeView(): vscode.TreeView<TreeItemData> {
        return this.treeView;
    }

    /**
     * 获取提供者
     */
    getProvider(): PLSQLOutlineProvider {
        return this.provider;
    }

    /**
     * 显示树视图
     */
    reveal(): void {
        // 显示树视图面板
        vscode.commands.executeCommand('plsqlOutline.focus');
    }

    /**
     * 获取当前选中项
     */
    getSelection(): readonly TreeItemData[] {
        return this.treeView.selection;
    }

    /**
     * 设置标题
     */
    setTitle(title: string): void {
        this.treeView.title = title;
    }

    /**
     * 设置描述
     */
    setDescription(description: string): void {
        this.treeView.description = description;
    }

    /**
     * 销毁资源
     */
    dispose(): void {
        this.treeView.dispose();
    }
}

/**
 * 树视图工具类
 */
export class TreeViewUtils {
    /**
     * 查找节点
     */
    static findNodeByName(nodes: ParseNode[], name: string): ParseNode | null {
        for (const node of nodes) {
            if (node.name === name) {
                return node;
            }
            
            const found = this.findNodeByName(node.children, name);
            if (found) {
                return found;
            }
        }
        
        return null;
    }

    /**
     * 查找节点按行号
     */
    static findNodeByLine(nodes: ParseNode[], line: number): ParseNode | null {
        for (const node of nodes) {
            if (node.declarationLine === line ||
                node.beginLine === line ||
                node.exceptionLine === line ||
                node.endLine === line) {
                return node;
            }
            
            const found = this.findNodeByLine(node.children, line);
            if (found) {
                return found;
            }
        }
        
        return null;
    }

    /**
     * 获取节点路径
     */
    static getNodePath(nodes: ParseNode[], targetNode: ParseNode): string[] {
        const path: string[] = [];
        
        const findPath = (currentNodes: ParseNode[], target: ParseNode, currentPath: string[]): boolean => {
            for (const node of currentNodes) {
                const newPath = [...currentPath, node.name];
                
                if (node === target) {
                    path.push(...newPath);
                    return true;
                }
                
                if (findPath(node.children, target, newPath)) {
                    return true;
                }
            }
            
            return false;
        };
        
        findPath(nodes, targetNode, []);
        return path;
    }

    /**
     * 统计节点数量
     */
    static countNodes(nodes: ParseNode[]): { total: number; byType: Map<NodeType, number> } {
        const byType = new Map<NodeType, number>();
        let total = 0;
        
        const count = (currentNodes: ParseNode[]): void => {
            for (const node of currentNodes) {
                total++;
                byType.set(node.type, (byType.get(node.type) || 0) + 1);
                count(node.children);
            }
        };
        
        count(nodes);
        return { total, byType };
    }

    /**
     * 获取最大嵌套深度
     */
    static getMaxDepth(nodes: ParseNode[]): number {
        let maxDepth = 0;
        
        const traverse = (currentNodes: ParseNode[], currentDepth: number): void => {
            for (const node of currentNodes) {
                maxDepth = Math.max(maxDepth, currentDepth);
                traverse(node.children, currentDepth + 1);
            }
        };
        
        traverse(nodes, 1);
        return maxDepth;
    }
}

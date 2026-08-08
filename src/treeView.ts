import * as vscode from 'vscode';
import {
    ParseResult,
    ParseNode,
    NodeType,
    StructureBlock,
    StructureBlockType,
    TreeItemData,
    SectionType,
    VariableInfo,
    DeclarationCategory
} from './types';
import { IDataProvider } from './debug';
/**
 * PL/SQL大纲树数据提供者 - 内存优化版本
 */
export class PLSQLOutlineProvider implements vscode.TreeDataProvider<TreeItemData> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItemData | undefined | null | void> = new vscode.EventEmitter<TreeItemData | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItemData | undefined | null | void> = this._onDidChangeTreeData.event;

    public dataProvider: IDataProvider | null = null;
    private showStructureBlocks: boolean = true;
    private defaultCollapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded;
    private forceExpandAll: boolean = false; // 新增：强制展开所有节点的标志
    // 声明项展示配置
    private showDeclarations: boolean = true;
    private groupDeclarations: boolean = true;
    
    // 内存优化相关
    private treeItemCache: Map<string, vscode.TreeItem> = new Map();
    private maxCacheSize: number = 500;
    private lastRefreshTime: number = 0;
    
    // 输出通道用于调试信息
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.loadConfiguration();
        this.outputChannel = vscode.window.createOutputChannel('PL/SQL Outline');
    }

    /**
     * 加载配置
     */
    private loadConfiguration(): void {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        this.showStructureBlocks = config.get('view.showStructureBlocks', true);
        this.showDeclarations = config.get('view.showDeclarations', true);
        this.groupDeclarations = config.get('view.groupDeclarations', true);
    }

    /**
     * 设置数据提供者
     */
    setDataProvider(dataProvider: IDataProvider): void {
        this.dataProvider = dataProvider;
        this.refresh();
    }

    /**
     * 刷新树视图 - 内存优化版本
     */
    refresh(): void {
        this.loadConfiguration();
        
        // 清理缓存，避免内存泄漏
        this.clearCache();
        
        this.lastRefreshTime = Date.now();
        this._onDidChangeTreeData.fire();
    }

    /**
     * 清理缓存
     */
    private clearCache(): void {
        this.treeItemCache.clear();
    }

    /**
     * 获取缓存的树项
     */
    private getCachedTreeItem(key: string): vscode.TreeItem | undefined {
        return this.treeItemCache.get(key);
    }

    /**
     * 设置缓存的树项
     */
    private setCachedTreeItem(key: string, item: vscode.TreeItem): void {
        // 限制缓存大小
        if (this.treeItemCache.size >= this.maxCacheSize) {
            // 清理一半的缓存
            const entries = Array.from(this.treeItemCache.entries());
            this.treeItemCache.clear();
            // 保留最近使用的一半
            for (let i = Math.floor(entries.length / 2); i < entries.length; i++) {
                this.treeItemCache.set(entries[i][0], entries[i][1]);
            }
        }
        
        this.treeItemCache.set(key, item);
    }

    /**
     * 获取树项 - 内存优化版本
     */
    getTreeItem(element: TreeItemData): vscode.TreeItem {
        // 生成缓存键
        const cacheKey = this.generateCacheKey(element);
        
        // 尝试从缓存获取
        const cached = this.getCachedTreeItem(cacheKey);
        if (cached) {
            return cached;
        }
        
        // 创建新的树项
        let treeItem: vscode.TreeItem;
        if (element.isSection) {
            treeItem = this.createSectionTreeItem(element);
        } else if (element.isStructureBlock) {
            treeItem = this.createStructureBlockTreeItem(element);
        } else if (element.isDeclarationGroup) {
            treeItem = this.createDeclarationGroupTreeItem(element);
        } else if (element.isDeclarationEntry && element.declarationEntry) {
            treeItem = this.createDeclarationEntryTreeItem(element);
        } else {
            treeItem = this.createNodeTreeItem(element);
        }
        
        // 缓存树项
        this.setCachedTreeItem(cacheKey, treeItem);
        
        return treeItem;
    }

    /**
     * 生成缓存键
     */
    private generateCacheKey(element: TreeItemData): string {
        if (element.isSection && element.sectionType) {
            return `section_${element.sectionType}_${element.parentNode?.name}_${element.parentNode?.declarationLine}`;
        } else if (element.isStructureBlock && element.structureBlock) {
            return `block_${element.structureBlock.type}_${element.structureBlock.line}_${element.structureBlock.parentNode.name}`;
        } else if (element.isDeclarationGroup && element.declarationCategory) {
            return `declgroup_${element.declarationCategory}_${element.parentNode?.name}_${element.parentNode?.declarationLine}`;
        } else if (element.isDeclarationEntry && element.declarationEntry) {
            return `declentry_${element.declarationEntry.name}_${element.declarationEntry.line}_${element.declarationEntry.scope}`;
        } else if (element.node) {
            return `node_${element.node.type}_${element.node.name}_${element.node.declarationLine}_${element.node.level}`;
        }
        return `unknown_${Date.now()}`;
    }

    /**
     * 获取子项 - 内存优化版本
     */
    async getChildren(element?: TreeItemData): Promise<TreeItemData[]> {
        if (!this.dataProvider) {
            return [];
        }

        try {
            const parseResult = await this.dataProvider.getParseResult();
            
            // 检查解析结果的有效性
            if (!parseResult || !parseResult.nodes) {
                return [];
            }
            
            if (!element) {
                // 根级别：返回所有顶层节点
                return this.createTreeItemsFromNodes(parseResult.nodes);
            } else if (element.isSection) {
                // 分区级别：返回分区内的子项
                return this.createSectionChildItems(element);
            } else if (element.isDeclarationGroup && element.declarationEntries) {
                // 声明类别分组：展开其下的声明项
                return element.declarationEntries.map(e => ({
                    isStructureBlock: false,
                    label: this.getDeclarationEntryLabel(e),
                    line: e.line,
                    isDeclarationEntry: true,
                    declarationEntry: e
                }));
            } else if (element.mergedChildren && element.mergedChildren.length > 0) {
                // 合并IF节点：渲染合并后的子控制结构
                const merged = this.mergeIfGroups(element.mergedChildren);
                return merged.map(item => ({
                    node: item.node,
                    isStructureBlock: false,
                    mergedChildren: item.mergedChildren,
                    label: this.getSimplifiedControlLabel(item.node!.type),
                    line: item.node!.declarationLine
                } as TreeItemData));
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
     * 获取父项 - VS Code reveal方法需要此方法
     */
    async getParent(element: TreeItemData): Promise<TreeItemData | undefined> {
        if (!this.dataProvider) {
            return undefined;
        }

        try {
            const parseResult = await this.dataProvider.getParseResult();
            if (!parseResult || !parseResult.nodes) {
                return undefined;
            }

            // 如果是结构块，返回其父节点
            if (element.isStructureBlock && element.structureBlock) {
                const parentNode = element.structureBlock.parentNode;
                return {
                    node: parentNode,
                    isStructureBlock: false,
                    label: this.getNodeLabel(parentNode),
                    line: parentNode.declarationLine
                };
            }

            // 如果是节点，查找其父节点
            if (element.node) {
                const parent = this.findParentNode(parseResult.nodes, element.node);
                if (parent) {
                    return {
                        node: parent,
                        isStructureBlock: false,
                        label: this.getNodeLabel(parent),
                        line: parent.declarationLine
                    };
                }
            }

            return undefined;

        } catch (error) {
            console.error('获取父项失败:', error);
            return undefined;
        }
    }

    /**
     * 查找父节点
     */
    private findParentNode(nodes: ParseNode[], targetNode: ParseNode): ParseNode | undefined {
        for (const node of nodes) {
            // 检查是否是直接子节点
            if (node.children.includes(targetNode)) {
                return node;
            }
            
            // 递归查找
            const found = this.findParentNode(node.children, targetNode);
            if (found) {
                return found;
            }
        }
        
        return undefined;
    }

    /**
     * 从节点创建树项数据 - 内存优化版本
     */
    private createTreeItemsFromNodes(nodes: ParseNode[]): TreeItemData[] {
        if (!nodes || nodes.length === 0) {
            return [];
        }
        
        // 预分配数组大小
        const items: TreeItemData[] = new Array(nodes.length);
        
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            items[i] = {
                node,
                isStructureBlock: false,
                label: this.getNodeLabel(node),
                line: node.declarationLine
            };
        }
        
        return items;
    }

    /**
     * 创建子项 - 分区组织版本
     */
    private createChildItems(node: ParseNode): TreeItemData[] {
        // 控制结构节点: 直接渲染子节点（简化标签，无分区）
        if (this.isControlStructureType(node.type)) {
            return this.createControlStructureChildren(node);
        }

        // Package Header: 直接渲染声明
        if (node.type === NodeType.PACKAGE_HEADER) {
            return this.createFlatChildren(node);
        }

        // 有代码体的节点(Function/Procedure/Trigger/Anonymous Block): 分区组织
        if (this.shouldUseSectionGrouping(node)) {
            return this.createSectionedChildren(node);
        }

        // Package Body: 默认平铺子程序；但若包体本身有声明项（包级游标/变量等），
        // 则改用分区分组，使声明项能展示在 DECLARE 区域。
        if (node.type === NodeType.PACKAGE_BODY &&
            this.showDeclarations && node.variableTable && node.variableTable.size > 0) {
            return this.createSectionedChildren(node);
        }

        // 其他情况: 平坦渲染
        return this.createFlatChildren(node);
    }

    /**
     * 判断是否使用分区分组
     * 对单个 Function/Procedure/Trigger/Anonymous Block 使用分区，
     * 以展示 DECLARE(含声明项)/BODY/EXCEPTION/END 层次。
     * Package Body 仅在有包级声明时使用分区（见 createChildItems）。
     */
    private shouldUseSectionGrouping(node: ParseNode): boolean {
        const hasBody = node.beginLine !== null && node.beginLine !== undefined;
        const isCodeUnit = node.type === NodeType.FUNCTION ||
            node.type === NodeType.PROCEDURE ||
            node.type === NodeType.TRIGGER ||
            node.type === NodeType.ANONYMOUS_BLOCK;
        return hasBody && isCodeUnit;
    }

    /**
     * 创建分区组织的子项
     */
    private createSectionedChildren(node: ParseNode): TreeItemData[] {
        const items: TreeItemData[] = [];

        // 分类子节点
        const declareChildren: ParseNode[] = [];
        const bodyChildren: ParseNode[] = [];

        if (node.children) {
            for (const child of node.children) {
                if (child.type === NodeType.FUNCTION || child.type === NodeType.PROCEDURE) {
                    declareChildren.push(child);
                } else if (this.isControlStructureType(child.type) &&
                    child.type !== NodeType.ELSIF_BRANCH && child.type !== NodeType.ELSE_BRANCH) {
                    bodyChildren.push(child);
                } else if (child.type === NodeType.ELSIF_BRANCH || child.type === NodeType.ELSE_BRANCH) {
                    // 吸收到前一个IF中，此处跳过
                } else {
                    // 其他类型（如 FUNCTION_DECLARATION）放到声明区
                    declareChildren.push(child);
                }
            }
        }

        // DECLARE 分区：当存在子程序声明，或当前节点有变量/游标/常量/类型/异常声明时显示
        const hasDeclarations = this.showDeclarations && !!node.variableTable && node.variableTable.size > 0;
        if (declareChildren.length > 0 || hasDeclarations) {
            items.push({
                isStructureBlock: false,
                isSection: true,
                sectionType: SectionType.DECLARE,
                sectionChildren: declareChildren,
                parentNode: node,
                label: 'DECLARE',
                line: node.declarationLine
            });
        }

        // BODY 分区
        if (bodyChildren.length > 0 || (node.beginLine !== null && node.beginLine !== undefined)) {
            items.push({
                isStructureBlock: false,
                isSection: true,
                sectionType: SectionType.BODY,
                sectionChildren: bodyChildren,
                parentNode: node,
                label: 'BODY',
                line: node.beginLine || undefined
            });
        }

        // EXCEPTION 分区
        if (node.exceptionLine !== null && node.exceptionLine !== undefined) {
            items.push({
                isStructureBlock: false,
                isSection: true,
                sectionType: SectionType.EXCEPTION,
                parentNode: node,
                label: 'EXCEPTION',
                line: node.exceptionLine
            });
        }

        // END 分区
        if (node.endLine !== null && node.endLine !== undefined) {
            items.push({
                isStructureBlock: false,
                isSection: true,
                sectionType: SectionType.END,
                parentNode: node,
                label: 'END',
                line: node.endLine
            });
        }

        return items;
    }

    /**
     * 创建分区内的子项
     */
    private createSectionChildItems(section: TreeItemData): TreeItemData[] {
        if (section.sectionType === SectionType.DECLARE) {
            // DECLARE区域: 先渲染子函数/过程，再渲染声明项分组（变量/游标/常量/类型/异常）
            const items: TreeItemData[] = [];
            if (section.sectionChildren && section.sectionChildren.length > 0) {
                for (const child of section.sectionChildren) {
                    items.push({
                        node: child,
                        isStructureBlock: false,
                        label: this.getDeclareNodeLabel(child),
                        line: child.declarationLine
                    });
                }
            }
            // 追加声明项
            if (this.showDeclarations && section.parentNode) {
                items.push(...this.createDeclarationGroupItems(section.parentNode));
            }
            return items;
        }

        if (!section.sectionChildren || section.sectionChildren.length === 0) {
            return [];
        }

        if (section.sectionType === SectionType.BODY) {
            // BODY区域: 合并IF组，简化标签
            const merged = this.mergeIfGroups(section.sectionChildren);
            return merged.map(item => {
                if (item.mergedChildren) {
                    // 合并后的IF节点
                    return {
                        node: item.node,
                        isStructureBlock: false,
                        mergedChildren: item.mergedChildren,
                        label: this.getSimplifiedControlLabel(item.node!.type),
                        line: item.node!.declarationLine
                    } as TreeItemData;
                }
                return {
                    node: item.node,
                    isStructureBlock: false,
                    label: this.getSimplifiedControlLabel(item.node!.type),
                    line: item.node!.declarationLine
                } as TreeItemData;
            });
        }

        // EXCEPTION/END: 叶节点
        return [];
    }

    /**
     * 控制结构节点的子项渲染
     */
    private createControlStructureChildren(node: ParseNode): TreeItemData[] {
        if (!node.children || node.children.length === 0) {
            // 如果有mergedChildren (合并的IF)，从父TreeItemData获取
            return [];
        }

        // 合并IF组，简化标签
        const merged = this.mergeIfGroups(node.children);
        return merged.map(item => {
            if (item.mergedChildren) {
                return {
                    node: item.node,
                    isStructureBlock: false,
                    mergedChildren: item.mergedChildren,
                    label: this.getSimplifiedControlLabel(item.node!.type),
                    line: item.node!.declarationLine
                } as TreeItemData;
            }
            return {
                node: item.node,
                isStructureBlock: false,
                label: this.getSimplifiedControlLabel(item.node!.type),
                line: item.node!.declarationLine
            } as TreeItemData;
        });
    }

    /**
     * 平坦渲染子项（无分区）
     */
    private createFlatChildren(node: ParseNode): TreeItemData[] {
        if (!node.children) return [];
        return node.children.map(child => ({
            node: child,
            isStructureBlock: false,
            label: this.getNodeLabel(child),
            line: child.declarationLine
        }));
    }

    /**
     * 合并 IF/ELSIF/ELSE 组
     * IF + 后续的 ELSIF/ELSE 合并为单个 IF，children 合并
     */
    private mergeIfGroups(children: ParseNode[]): { node: ParseNode; mergedChildren?: ParseNode[] }[] {
        const result: { node: ParseNode; mergedChildren?: ParseNode[] }[] = [];

        for (let i = 0; i < children.length; i++) {
            const child = children[i];

            if (child.type === NodeType.IF_STATEMENT) {
                // 收集IF自身的控制结构子节点
                const allChildren: ParseNode[] = [];
                if (child.children) {
                    for (const c of child.children) {
                        if (this.isControlStructureType(c.type) &&
                            c.type !== NodeType.ELSIF_BRANCH && c.type !== NodeType.ELSE_BRANCH) {
                            allChildren.push(c);
                        }
                    }
                }

                // 向后查找 ELSIF/ELSE 并吸收其子节点
                while (i + 1 < children.length &&
                    (children[i + 1].type === NodeType.ELSIF_BRANCH ||
                        children[i + 1].type === NodeType.ELSE_BRANCH)) {
                    i++;
                    const sibling = children[i];
                    if (sibling.children) {
                        for (const c of sibling.children) {
                            if (this.isControlStructureType(c.type) &&
                                c.type !== NodeType.ELSIF_BRANCH && c.type !== NodeType.ELSE_BRANCH) {
                                allChildren.push(c);
                            }
                        }
                    }
                }

                result.push({
                    node: child,
                    mergedChildren: allChildren.length > 0 ? allChildren : undefined
                });
            } else if (child.type === NodeType.ELSIF_BRANCH || child.type === NodeType.ELSE_BRANCH) {
                // 孤立的ELSIF/ELSE（无前置IF），跳过
                continue;
            } else {
                result.push({ node: child });
            }
        }

        return result;
    }

    /**
     * 判断是否为控制结构类型
     */
    private isControlStructureType(type: NodeType): boolean {
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
     * 获取简化的控制结构标签（仅关键字）
     */
    private getSimplifiedControlLabel(type: NodeType): string {
        switch (type) {
            case NodeType.IF_STATEMENT: return 'IF';
            case NodeType.ELSIF_BRANCH: return 'ELSIF';
            case NodeType.ELSE_BRANCH: return 'ELSE';
            case NodeType.LOOP_STATEMENT: return 'LOOP';
            case NodeType.WHILE_LOOP: return 'WHILE';
            case NodeType.FOR_LOOP: return 'FOR';
            case NodeType.CASE_STATEMENT: return 'CASE';
            case NodeType.WHEN_BRANCH: return 'WHEN';
            default: return type;
        }
    }

    /**
     * DECLARE区域的节点标签
     */
    private getDeclareNodeLabel(node: ParseNode): string {
        if (node.type === NodeType.FUNCTION || node.type === NodeType.FUNCTION_DECLARATION) {
            return `Function: ${node.name}`;
        } else if (node.type === NodeType.PROCEDURE || node.type === NodeType.PROCEDURE_DECLARATION) {
            return `Procedure: ${node.name}`;
        }
        return this.getNodeLabel(node);
    }

    // ====== 声明项（变量/游标/常量/类型/异常）分组展示 ======

    /**
     * 声明类别 → (标签, 图标, 排序权重)
     * 顺序：Variables → Constants → Cursors → Types → Exceptions
     */
    private static readonly DECL_CATEGORY_META: {
        key: DeclarationCategory;
        label: string;
        icon: string;
        order: number;
    }[] = [
        { key: DeclarationCategory.VARIABLE, label: 'Variables', icon: 'symbol-variable', order: 1 },
        { key: DeclarationCategory.CONSTANT, label: 'Constants', icon: 'symbol-constant', order: 2 },
        { key: DeclarationCategory.CURSOR, label: 'Cursors', icon: 'database', order: 3 },
        { key: DeclarationCategory.TYPE, label: 'Types', icon: 'symbol-class', order: 4 },
        { key: DeclarationCategory.EXCEPTION, label: 'Exceptions', icon: 'warning', order: 5 }
    ];

    /**
     * 为一个节点创建其声明项的分组项（或扁平项）。
     * - groupDeclarations=true：按类别生成可折叠分组节点
     * - groupDeclarations=false：所有声明项扁平展开
     */
    private createDeclarationGroupItems(node: ParseNode): TreeItemData[] {
        if (!node.variableTable || node.variableTable.size === 0) {
            return [];
        }
        const entries = Array.from(node.variableTable.values());

        if (!this.groupDeclarations) {
            // 扁平模式：直接逐项展示，按声明行排序
            return entries
                .slice()
                .sort((a, b) => a.line - b.line)
                .map(e => ({
                    isStructureBlock: false,
                    label: this.getDeclarationEntryLabel(e),
                    line: e.line,
                    isDeclarationEntry: true,
                    declarationEntry: e
                }));
        }

        // 分组模式：按类别聚合，空类别不展示
        const items: TreeItemData[] = [];
        for (const meta of PLSQLOutlineProvider.DECL_CATEGORY_META) {
            const groupEntries = entries
                .filter(e => e.category === meta.key)
                .sort((a, b) => a.line - b.line);
            if (groupEntries.length === 0) { continue; }
            items.push({
                isStructureBlock: false,
                label: `${meta.label} (${groupEntries.length})`,
                isDeclarationGroup: true,
                declarationCategory: meta.key,
                declarationEntries: groupEntries,
                parentNode: node,
                line: groupEntries[0].line
            });
        }
        return items;
    }

    /**
     * 单个声明项的展示标签
     */
    private getDeclarationEntryLabel(entry: VariableInfo): string {
        switch (entry.category) {
            case DeclarationCategory.CURSOR:
                return `${entry.name}`;
            case DeclarationCategory.EXCEPTION:
                return `${entry.name}`;
            case DeclarationCategory.TYPE:
                return `${entry.name} ${entry.type}`;
            case DeclarationCategory.CONSTANT:
                return entry.initialValue !== undefined
                    ? `${entry.name} : ${entry.type} = ${entry.initialValue}`
                    : `${entry.name} : ${entry.type}`;
            case DeclarationCategory.VARIABLE:
            default:
                return entry.initialValue !== undefined
                    ? `${entry.name} : ${entry.type} = ${entry.initialValue}`
                    : `${entry.name} : ${entry.type}`;
        }
    }

    /**
     * 单个声明项的图标
     */
    private getDeclarationEntryIcon(entry: VariableInfo): vscode.ThemeIcon {
        switch (entry.category) {
            case DeclarationCategory.CURSOR: return new vscode.ThemeIcon('database');
            case DeclarationCategory.CONSTANT: return new vscode.ThemeIcon('symbol-constant');
            case DeclarationCategory.TYPE: return new vscode.ThemeIcon('symbol-class');
            case DeclarationCategory.EXCEPTION: return new vscode.ThemeIcon('warning');
            case DeclarationCategory.VARIABLE:
            default: return new vscode.ThemeIcon('symbol-variable');
        }
    }

    /**
     * 创建分区树项
     */
    private createSectionTreeItem(element: TreeItemData): vscode.TreeItem {
        const hasChildren = (element.sectionType === SectionType.DECLARE || element.sectionType === SectionType.BODY) &&
            element.sectionChildren && element.sectionChildren.length > 0;

        const collapsibleState = hasChildren
            ? vscode.TreeItemCollapsibleState.Expanded
            : vscode.TreeItemCollapsibleState.None;

        const treeItem = new vscode.TreeItem(element.label, collapsibleState);
        treeItem.iconPath = this.getSectionIcon(element.sectionType!);
        treeItem.contextValue = 'section';

        if (element.line !== undefined) {
            treeItem.description = `Line ${element.line}`;
            treeItem.command = {
                command: 'plsqlOutline.goToLine',
                title: '跳转到行',
                arguments: [element.line]
            };
        }

        return treeItem;
    }

    /**
     * 获取分区图标
     */
    private getSectionIcon(type: SectionType): vscode.ThemeIcon {
        switch (type) {
            case SectionType.DECLARE: return new vscode.ThemeIcon('symbol-variable');
            case SectionType.BODY: return new vscode.ThemeIcon('play');
            case SectionType.EXCEPTION: return new vscode.ThemeIcon('warning');
            case SectionType.END: return new vscode.ThemeIcon('debug-stop');
        }
    }

    /**
     * 创建声明类别分组树项（Variables/Cursors/Constants/Types/Exceptions）
     */
    private createDeclarationGroupTreeItem(element: TreeItemData): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(
            element.label,
            vscode.TreeItemCollapsibleState.Collapsed
        );
        const meta = PLSQLOutlineProvider.DECL_CATEGORY_META.find(
            m => m.key === element.declarationCategory
        );
        treeItem.iconPath = new vscode.ThemeIcon(meta ? meta.icon : 'symbol-folder');
        const count = element.declarationEntries ? element.declarationEntries.length : 0;
        treeItem.description = `${count} 项`;
        treeItem.tooltip = `${element.label} — 共 ${count} 个声明项`;
        treeItem.contextValue = 'declarationGroup';
        return treeItem;
    }

    /**
     * 创建单个声明项树项（叶节点，点击跳转到声明行）
     */
    private createDeclarationEntryTreeItem(element: TreeItemData): vscode.TreeItem {
        const entry = element.declarationEntry!;
        const treeItem = new vscode.TreeItem(
            element.label,
            vscode.TreeItemCollapsibleState.None
        );
        treeItem.iconPath = this.getDeclarationEntryIcon(entry);
        treeItem.description = `L${entry.line}`;
        treeItem.tooltip = `${entry.name}（${entry.scope} 内声明，第 ${entry.line} 行）`;
        treeItem.contextValue = 'declarationEntry';
        if (element.line !== undefined) {
            treeItem.command = {
                command: 'plsqlOutline.goToLine',
                title: '跳转到行',
                arguments: [element.line]
            };
        }
        return treeItem;
    }

    /**
     * 计算结构块数量
     */
    private countStructureBlocks(node: ParseNode): number {
        let count = 0;
        if (node.beginLine !== null && node.beginLine !== undefined) count++;
        if (node.exceptionLine !== null && node.exceptionLine !== undefined) count++;
        if (node.endLine !== null && node.endLine !== undefined) count++;
        return count;
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
        
        // 确定折叠状态：考虑mergedChildren和分区模式
        let collapsibleState: vscode.TreeItemCollapsibleState;
        if (element.mergedChildren && element.mergedChildren.length > 0) {
            collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        } else if (this.shouldUseSectionGrouping(node)) {
            // 使用分区模式的节点总是可展开的
            collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        } else {
            collapsibleState = this.getCollapsibleState(node);
        }

        const treeItem = new vscode.TreeItem(element.label, collapsibleState);
        
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
            case NodeType.IF_STATEMENT: return 'IF';
            case NodeType.ELSIF_BRANCH: return 'ELSIF';
            case NodeType.ELSE_BRANCH: return 'ELSE';
            case NodeType.LOOP_STATEMENT: return 'LOOP';
            case NodeType.WHILE_LOOP: return 'WHILE';
            case NodeType.FOR_LOOP: return 'FOR';
            case NodeType.CASE_STATEMENT: return 'CASE';
            case NodeType.WHEN_BRANCH: return 'WHEN';
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
            // 如果强制展开标志为true，直接返回展开状态
            if (this.forceExpandAll) {
                return vscode.TreeItemCollapsibleState.Expanded;
            }
            
            // 使用配置中的默认展开设置
            const config = vscode.workspace.getConfiguration('plsql-outline');
            const expandByDefault = config.get('view.expandByDefault', true);
            return expandByDefault ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.Collapsed;
        } else {
            return vscode.TreeItemCollapsibleState.None;
        }
    }

    /**
     * 设置强制展开所有节点
     */
    public setForceExpandAll(force: boolean): void {
        this.forceExpandAll = force;
        this.outputChannel.appendLine(`设置强制展开标志: ${force}`);
    }

    /**
     * 输出调试信息
     */
    private debugLog(message: string, data?: any): void {
        const timestamp = new Date().toLocaleTimeString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
        if (data) {
            this.outputChannel.appendLine(`数据: ${JSON.stringify(data, null, 2)}`);
        }
    }

    /**
     * 是否应该显示结构块
     */
    public shouldShowStructureBlocks(node: ParseNode): boolean {
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
        
        // 层级
        if (node.level > 1) {
            parts.push(`L${node.level}`);
        }
        
        // 子项数量
        if (node.children.length > 0) {
            parts.push(`${node.children.length}个子项`);
        }
        
        // 行号
        parts.push(`第${node.declarationLine}行`);
        
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

    /**
     * 设置默认折叠状态
     */
    setDefaultCollapsibleState(state: vscode.TreeItemCollapsibleState): void {
        this.defaultCollapsibleState = state;
    }
}

/**
 * 树视图管理器
 */
export class TreeViewManager {
    private treeView: vscode.TreeView<TreeItemData>;
    private provider: PLSQLOutlineProvider;
    private outputChannel: vscode.OutputChannel;

    constructor(context: vscode.ExtensionContext) {
        this.provider = new PLSQLOutlineProvider();
        this.outputChannel = vscode.window.createOutputChannel('PL/SQL Outline');
        
        this.treeView = vscode.window.createTreeView('plsqlOutline', {
            treeDataProvider: this.provider,
            showCollapseAll: true
        });

        // 注册命令
        this.registerCommands(context);
        
        // 监听配置变化
        this.registerConfigurationListener(context);

        this.outputChannel.appendLine('TreeViewManager初始化完成');
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


        // 管理文件扩展名
        const manageFileExtensionsCommand = vscode.commands.registerCommand(
            'plsqlOutline.manageFileExtensions',
            () => this.manageFileExtensions()
        );

        context.subscriptions.push(
            goToLineCommand,
            refreshCommand,
            toggleStructureBlocksCommand,
            manageFileExtensionsCommand
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
        
        // 移除通知，只在状态栏显示或通过其他方式反馈
    }

    /**
     * 展开所有节点 - 简化版本
     */
    async expandAll(): Promise<void> {
        this.outputChannel.appendLine('开始执行展开所有节点功能');
        this.outputChannel.show(true); // 显示输出通道
        
        if (!this.provider.dataProvider) {
            this.outputChannel.appendLine('错误: 没有数据提供者');
            vscode.window.showWarningMessage('没有可用的解析数据');
            return;
        }

        try {
            const parseResult = await this.provider.dataProvider.getParseResult();
            if (!parseResult || !parseResult.nodes || parseResult.nodes.length === 0) {
                this.outputChannel.appendLine('警告: 没有解析结果或节点');
                vscode.window.showInformationMessage('没有可展开的节点');
                return;
            }

            this.outputChannel.appendLine(`找到 ${parseResult.nodes.length} 个根节点`);
            
            // 使用VS Code原生的展开API
            await this.expandAllNodes();
            
            this.outputChannel.appendLine('展开所有节点完成');
            vscode.window.showInformationMessage('所有节点已展开');
            
        } catch (error) {
            this.outputChannel.appendLine(`展开所有节点失败: ${error}`);
            vscode.window.showErrorMessage(`展开所有节点失败: ${error}`);
        }
    }

    /**
     * 使用强制展开标志和reveal API展开所有节点
     */
    private async expandAllNodes(): Promise<void> {
        this.outputChannel.appendLine('开始使用强制展开标志展开节点');
        
        try {
            // 设置强制展开标志
            this.provider.setForceExpandAll(true);
            this.outputChannel.appendLine('已设置强制展开标志为true');
            
            // 刷新树视图，这会导致所有节点以展开状态重新渲染
            this.provider.refresh();
            this.outputChannel.appendLine('已刷新树视图');
            
            // 等待一段时间让树视图完成渲染
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 获取根节点并展开
            if (this.provider.dataProvider) {
                const parseResult = await this.provider.dataProvider.getParseResult();
                if (parseResult && parseResult.nodes && parseResult.nodes.length > 0) {
                    this.outputChannel.appendLine('开始展开根节点');
                    
                    // 为每个根节点创建TreeItemData并展开
                    for (const rootNode of parseResult.nodes) {
                        try {
                            const rootTreeItem: TreeItemData = {
                                node: rootNode,
                                isStructureBlock: false,
                                label: this.getNodeTypeDisplayName(rootNode.type),
                                line: rootNode.declarationLine
                            };
                            
                            // 使用reveal API展开根节点
                            await this.treeView.reveal(rootTreeItem, { 
                                expand: true, 
                                focus: false, 
                                select: false 
                            });
                            
                            this.outputChannel.appendLine(`已展开根节点: ${rootNode.name}`);
                            
                        } catch (revealError) {
                            this.outputChannel.appendLine(`展开根节点 ${rootNode.name} 失败: ${revealError}`);
                            // 继续处理其他节点
                        }
                    }
                }
            }
            
            // 重置强制展开标志
            this.provider.setForceExpandAll(false);
            this.outputChannel.appendLine('已重置强制展开标志为false');
            
            this.outputChannel.appendLine('所有节点展开完成');
            
        } catch (error) {
            this.outputChannel.appendLine(`展开节点过程中出错: ${error}`);
            // 确保重置标志
            this.provider.setForceExpandAll(false);
            throw error;
        }
    }

    /**
     * 收集所有树项
     */
    private collectAllTreeItems(nodes: ParseNode[], result: TreeItemData[]): void {
        for (const node of nodes) {
            const treeItem: TreeItemData = {
                node,
                isStructureBlock: false,
                label: `${node.name} (${this.getNodeTypeDisplayName(node.type)})`,
                line: node.declarationLine
            };
            
            result.push(treeItem);
            
            // 递归收集子节点
            if (node.children && node.children.length > 0) {
                this.collectAllTreeItems(node.children, result);
            }
        }
    }


    /**
     * 获取所有树项
     */
    private getAllTreeItems(nodes: ParseNode[]): TreeItemData[] {
        const items: TreeItemData[] = [];
        
        const traverse = (currentNodes: ParseNode[]): void => {
            for (const node of currentNodes) {
                items.push({
                    node,
                    isStructureBlock: false,
                    label: `${node.name} (${this.getNodeTypeDisplayName(node.type)})`,
                    line: node.declarationLine
                });
                
                traverse(node.children);
            }
        };
        
        traverse(nodes);
        return items;
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
            case NodeType.IF_STATEMENT: return 'IF';
            case NodeType.ELSIF_BRANCH: return 'ELSIF';
            case NodeType.ELSE_BRANCH: return 'ELSE';
            case NodeType.LOOP_STATEMENT: return 'LOOP';
            case NodeType.WHILE_LOOP: return 'WHILE';
            case NodeType.FOR_LOOP: return 'FOR';
            case NodeType.CASE_STATEMENT: return 'CASE';
            case NodeType.WHEN_BRANCH: return 'WHEN';
            default: return type;
        }
    }

    /**
     * 管理文件扩展名
     */
    private async manageFileExtensions(): Promise<void> {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const currentExtensions = config.get<string[]>('fileExtensions', ['.sql', '.fnc', '.fcn', '.prc', '.pks', '.pkb', '.typ']);
        
        const options = [
            '添加扩展名',
            '删除扩展名',
            '重置为默认值',
            '查看当前列表'
        ];

        const choice = await vscode.window.showQuickPick(options, {
            placeHolder: '选择操作'
        });

        switch (choice) {
            case '添加扩展名':
                await this.addFileExtension(currentExtensions);
                break;
            case '删除扩展名':
                await this.removeFileExtension(currentExtensions);
                break;
            case '重置为默认值':
                await this.resetFileExtensions();
                break;
            case '查看当前列表':
                this.showCurrentExtensions(currentExtensions);
                break;
        }
    }

    /**
     * 添加文件扩展名
     */
    private async addFileExtension(currentExtensions: string[]): Promise<void> {
        const newExtension = await vscode.window.showInputBox({
            prompt: '输入新的文件扩展名（例如：.tbl）',
            validateInput: (value) => {
                if (!value) {
                    return '扩展名不能为空';
                }
                if (!value.startsWith('.')) {
                    return '扩展名必须以点(.)开头';
                }
                if (currentExtensions.includes(value.toLowerCase())) {
                    return '该扩展名已存在';
                }
                return null;
            }
        });

        if (newExtension) {
            const updatedExtensions = [...currentExtensions, newExtension.toLowerCase()];
            const config = vscode.workspace.getConfiguration('plsql-outline');
            await config.update('fileExtensions', updatedExtensions, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`已添加扩展名: ${newExtension}`);
        }
    }

    /**
     * 删除文件扩展名
     */
    private async removeFileExtension(currentExtensions: string[]): Promise<void> {
        if (currentExtensions.length === 0) {
            vscode.window.showWarningMessage('没有可删除的扩展名');
            return;
        }

        const extensionToRemove = await vscode.window.showQuickPick(currentExtensions, {
            placeHolder: '选择要删除的扩展名'
        });

        if (extensionToRemove) {
            const updatedExtensions = currentExtensions.filter(ext => ext !== extensionToRemove);
            const config = vscode.workspace.getConfiguration('plsql-outline');
            await config.update('fileExtensions', updatedExtensions, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`已删除扩展名: ${extensionToRemove}`);
        }
    }

    /**
     * 重置文件扩展名为默认值
     */
    private async resetFileExtensions(): Promise<void> {
        const defaultExtensions = ['.sql', '.fnc', '.fcn', '.prc', '.pks', '.pkb', '.typ'];
        const config = vscode.workspace.getConfiguration('plsql-outline');
        await config.update('fileExtensions', defaultExtensions, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('已重置为默认扩展名列表');
    }

    /**
     * 显示当前扩展名列表
     */
    private showCurrentExtensions(currentExtensions: string[]): void {
        if (currentExtensions.length === 0) {
            vscode.window.showInformationMessage('当前没有配置任何文件扩展名');
        } else {
            const extensionList = currentExtensions.join(', ');
            vscode.window.showInformationMessage(`当前支持的文件扩展名: ${extensionList}`);
        }
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
     * 选中并展开到指定目标（节点或结构块）
     */
    async selectAndRevealTarget(target: { type: 'node' | 'structureBlock', node: ParseNode, blockType?: string }): Promise<void> {
        try {
            let treeItemData: TreeItemData;

            if (target.type === 'structureBlock' && target.blockType) {
                // 创建结构块的TreeItemData
                const structureBlockType = this.getStructureBlockTypeEnum(target.blockType);
                const blockLine = this.getStructureBlockLine(target.node, target.blockType);
                
                treeItemData = {
                    structureBlock: {
                        type: structureBlockType,
                        line: blockLine,
                        parentNode: target.node
                    },
                    isStructureBlock: true,
                    label: target.blockType,
                    line: blockLine
                };

                this.outputChannel.appendLine(`已选中结构块: ${target.blockType} (第${blockLine}行)`);
            } else {
                // 创建节点的TreeItemData
                treeItemData = {
                    node: target.node,
                    isStructureBlock: false,
                    label: `${target.node.name} (${this.getNodeTypeDisplayName(target.node.type)})`,
                    line: target.node.declarationLine
                };

                this.outputChannel.appendLine(`已选中节点: ${target.node.name} (第${target.node.declarationLine}行)`);
            }

            // 使用reveal API选中并展开到目标（仅在面板可见时）
            if (this.treeView.visible) {
                await this.treeView.reveal(treeItemData, {
                    select: true,
                    focus: false,
                    expand: true
                });
            }

        } catch (error) {
            this.outputChannel.appendLine(`选中目标失败: ${error}`);
            // 不显示错误消息，避免干扰用户
        }
    }

    /**
     * 选中并展开到指定节点
     */
    async selectAndRevealNode(targetNode: ParseNode): Promise<void> {
        try {
            // 创建对应的TreeItemData
            const treeItemData: TreeItemData = {
                node: targetNode,
                isStructureBlock: false,
                label: `${targetNode.name} (${this.getNodeTypeDisplayName(targetNode.type)})`,
                line: targetNode.declarationLine
            };

            // 使用reveal API选中并展开到节点（仅在面板可见时）
            if (this.treeView.visible) {
                await this.treeView.reveal(treeItemData, {
                    select: true,
                    focus: false,
                    expand: true
                });
            }

            this.outputChannel.appendLine(`已选中节点: ${targetNode.name} (第${targetNode.declarationLine}行)`);

        } catch (error) {
            this.outputChannel.appendLine(`选中节点失败: ${error}`);
            // 不显示错误消息，避免干扰用户
        }
    }

    /**
     * 获取结构块类型枚举
     */
    private getStructureBlockTypeEnum(blockType: string): StructureBlockType {
        switch (blockType) {
            case 'BEGIN':
                return StructureBlockType.BEGIN;
            case 'EXCEPTION':
                return StructureBlockType.EXCEPTION;
            case 'END':
                return StructureBlockType.END;
            default:
                return StructureBlockType.BEGIN;
        }
    }

    /**
     * 获取结构块对应的行号
     */
    private getStructureBlockLine(node: ParseNode, blockType: string): number {
        switch (blockType) {
            case 'BEGIN':
                return node.beginLine || node.declarationLine;
            case 'EXCEPTION':
                return node.exceptionLine || node.declarationLine;
            case 'END':
                return node.endLine || node.declarationLine;
            default:
                return node.declarationLine;
        }
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

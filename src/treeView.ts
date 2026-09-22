import * as vscode from 'vscode';
import * as path from 'path';
import {
    ParseResult,
    ParseNode,
    NodeType,
    StructureBlock,
    StructureBlockType,
    TreeItemData,
    VariableInfo,
    DeclarationCategory
} from './types';
import { getOutputChannel } from './logger';
import { DEFAULT_FILE_EXTENSIONS, isCallableNode, buildSqlMarkdownBlock } from './shared';

/**
 * 解析结果持有者（大纲树的唯一数据源）。
 * v1.8.0 起自 debug.ts 迁入唯一消费方 treeView，删除 DataBridge/工厂中转层。
 */
export interface IDataProvider {
    getParseResult(): Promise<ParseResult>;
}

export class MemoryDataProvider implements IDataProvider {
    constructor(private parseResult: ParseResult) {}

    async getParseResult(): Promise<ParseResult> {
        return this.parseResult;
    }
}
/**
 * PL/SQL大纲树数据提供者 - 内存优化版本
 */
export class PLSQLOutlineProvider implements vscode.TreeDataProvider<TreeItemData> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItemData | undefined | null | void> = new vscode.EventEmitter<TreeItemData | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItemData | undefined | null | void> = this._onDidChangeTreeData.event;

    public dataProvider: IDataProvider | null = null;
    private showStructureBlocks: boolean = true;
    private forceExpandAll: boolean = false; // 新增：强制展开所有节点的标志
    // 声明项展示配置
    private showDeclarations: boolean = true;
    private groupDeclarations: boolean = true;

    // 控制结构标签伪缩进：每层缩进的 NBSP 数（Issue #33）
    private static readonly CONTROL_INDENT_STEP = 4;
    
    // 内存优化相关
    private treeItemCache: Map<string, vscode.TreeItem> = new Map();
    private maxCacheSize: number = 500;
    private lastRefreshTime: number = 0;

    // 当前解析文件的标识（用作元素稳定键前缀，避免跨文件同键互相污染展开状态）
    private currentSourceFileTag: string = '';
    
    // 输出通道用于调试信息
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.loadConfiguration();
        this.outputChannel = getOutputChannel();
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
        if (element.isDeclarationSection) {
            treeItem = this.createDeclarationSectionTreeItem(element);
        } else if (element.isProgramGroup) {
            treeItem = this.createProgramGroupTreeItem(element);
        } else if (element.isStructureBlock) {
            treeItem = this.createStructureBlockTreeItem(element);
        } else if (element.isDeclarationGroup) {
            treeItem = this.createDeclarationGroupTreeItem(element);
        } else if (element.isDeclarationEntry && element.declarationEntry) {
            treeItem = this.createDeclarationEntryTreeItem(element);
        } else {
            treeItem = this.createNodeTreeItem(element);
        }

        // 稳定 id：VS Code 据此在整树刷新（重新解析/切换文件）后保持展开与选中状态
        treeItem.id = cacheKey;

        // 缓存树项——控制结构的临时项（reveal/getParent 构造、无 displayIndent）除外：
        // 其标签使用 level 估算缩进，写入缓存会顶掉后续真实渲染项（displayIndent 精确）的标签
        if (!(element.node &&
            this.isControlStructureType(element.node.type) &&
            element.displayIndent === undefined)) {
            this.setCachedTreeItem(cacheKey, treeItem);
        }

        return treeItem;
    }

    /**
     * 更新当前解析文件的标识（用于元素稳定键前缀）
     */
    private updateSourceFileTag(parseResult: ParseResult): void {
        const sourceFile = parseResult.metadata && parseResult.metadata.sourceFile
            ? String(parseResult.metadata.sourceFile)
            : '';
        if (sourceFile !== this.currentSourceFileTag) {
            this.currentSourceFileTag = sourceFile;
        }
    }

    /**
     * 生成树项的元素稳定键（同时用作 TreeItem.id，供 VS Code 跨刷新保持展开/选中状态）。
     * 带文件前缀，避免不同文件的同名同位置节点互相污染展开状态。
     */
    public generateCacheKey(element: TreeItemData): string {
        const prefix = this.currentSourceFileTag ? `${this.currentSourceFileTag}::` : '';
        if (element.isDeclarationSection && element.parentNode) {
            return `${prefix}declsection_${element.parentNode.name}_${element.parentNode.declarationLine}`;
        } else if (element.isProgramGroup && element.parentNode) {
            return `${prefix}proggroup_${element.programGroupKind}_${element.parentNode.name}_${element.parentNode.declarationLine}`;
        } else if (element.isStructureBlock && element.structureBlock) {
            return `${prefix}block_${element.structureBlock.type}_${element.structureBlock.line}_${element.structureBlock.parentNode.name}`;
        } else if (element.isDeclarationGroup && element.declarationCategory) {
            return `${prefix}declgroup_${element.declarationCategory}_${element.parentNode?.name}_${element.parentNode?.declarationLine}`;
        } else if (element.isDeclarationEntry && element.declarationEntry) {
            return `${prefix}declentry_${element.declarationEntry.name}_${element.declarationEntry.line}_${element.declarationEntry.scope}`;
        } else if (element.node) {
            return `${prefix}node_${element.node.type}_${element.node.name}_${element.node.declarationLine}_${element.node.level}`;
        }
        return `${prefix}unknown_${element.label || 'x'}_${element.line ?? 0}`;
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
            this.updateSourceFileTag(parseResult);

            if (!element) {
                // 根级别：返回所有顶层节点
                return this.createTreeItemsFromNodes(parseResult.nodes);
            } else if (element.isDeclarationSection && element.parentNode) {
                // Declaration 包裹文件夹：展开其下的声明类别分组
                return this.createDeclarationGroupItems(element.parentNode);
            } else if (element.isProgramGroup && element.programGroupChildren) {
                // 程序文件夹（Sub Program / Body）：渲染其 ParseNode 子项
                if (element.programGroupKind === 'subprogram') {
                    // 子程序：图标按 type 区分（Procedure/Function），标签用 getDeclareNodeLabel
                    // 兜底过滤：确保匿名块（内联 DECLARE...BEGIN...END）不会出现在 Sub Program 文件夹
                    return element.programGroupChildren
                        .filter(child => child.type === NodeType.FUNCTION ||
                            child.type === NodeType.PROCEDURE ||
                            child.type === NodeType.FUNCTION_DECLARATION ||
                            child.type === NodeType.PROCEDURE_DECLARATION)
                        .map(child => ({
                            node: child,
                            isStructureBlock: false,
                            label: this.getDeclareNodeLabel(child),
                            line: child.declarationLine
                        }));
                }
                // body：控制结构与内联匿名块分组，合并 IF 组，简化标签
                const merged = this.mergeIfGroups(element.programGroupChildren);
                return merged.map(item => {
                    const label = item.node!.type === NodeType.ANONYMOUS_BLOCK
                        ? 'Anonymous Block'
                        : this.getSimplifiedControlLabel(item.node!.type);
                    if (item.mergedChildren) {
                        return {
                            node: item.node,
                            isStructureBlock: false,
                            mergedChildren: item.mergedChildren,
                            label,
                            line: item.node!.declarationLine,
                            displayIndent: 0
                        } as TreeItemData;
                    }
                    return {
                        node: item.node,
                        isStructureBlock: false,
                        label,
                        line: item.node!.declarationLine,
                        displayIndent: 0
                    } as TreeItemData;
                });
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
                // 合并IF节点：渲染合并后的子控制结构（缩进 = 承载项缩进 + 1）
                const merged = this.mergeIfGroups(element.mergedChildren);
                return merged.map(item => ({
                    node: item.node,
                    isStructureBlock: false,
                    mergedChildren: item.mergedChildren,
                    label: this.getSimplifiedControlLabel(item.node!.type),
                    line: item.node!.declarationLine,
                    displayIndent: (element.displayIndent ?? 0) + 1
                } as TreeItemData));
            } else if (!element.isStructureBlock && element.node) {
                // 节点级别：返回子节点和结构块
                return this.createChildItems(element);
            }
            
            return [];

        } catch (error) {
            console.error('获取树项子项失败:', error);
            return [];
        }
    }

    /**
     * 获取父项 - VS Code reveal方法需要此方法
     * 必须为树中所有元素类型（section/declarationGroup/declarationEntry/
     * 子程序节点/控制结构/结构块）重建正确的父链。
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
            this.updateSourceFileTag(parseResult);

            // 1. 声明项叶节点 → 父为所属声明分组（按 category + 承载节点重建）
            if (element.isDeclarationEntry && element.declarationEntry) {
                const ownerNode = this.findOwnerNodeOfVariable(parseResult.nodes, element.declarationEntry);
                if (ownerNode) {
                    return this.buildDeclarationGroupItem(ownerNode, element.declarationEntry.category);
                }
                return undefined;
            }

            // 2. 声明分组 → 父为承载节点的 Declaration 包裹文件夹
            if (element.isDeclarationGroup && element.parentNode) {
                return this.buildDeclarationSectionItem(element.parentNode);
            }

            // 3. Declaration 包裹文件夹 → 父为承载节点
            if (element.isDeclarationSection && element.parentNode) {
                return this.toDisplayParentItem(parseResult.nodes, element.parentNode);
            }

            // 4. 程序文件夹（Sub Program / Body）→ 父为承载节点
            if (element.isProgramGroup && element.parentNode) {
                return this.toDisplayParentItem(parseResult.nodes, element.parentNode);
            }

            // 5. 结构块（EXCEPTION/END 叶子）→ 父为承载节点
            if (element.isStructureBlock && element.structureBlock) {
                return this.toDisplayParentItem(parseResult.nodes, element.structureBlock.parentNode);
            }

            // 6. 普通节点（子程序 / 控制结构 / 内联匿名块）→ 父为 ParseNode 父节点
            //    对应的程序文件夹或父控制结构。内联匿名块作为 Body 内可见分组，
            //    其内部控制结构的显示父级即匿名块自身的 Body 文件夹（不作跳过）。
            if (element.node) {
                const parent = this.findParentNode(parseResult.nodes, element.node);
                if (parent) {
                    const childType = element.node.type;
                    if (childType === NodeType.FUNCTION || childType === NodeType.PROCEDURE ||
                        childType === NodeType.FUNCTION_DECLARATION || childType === NodeType.PROCEDURE_DECLARATION) {
                        // 子程序：若父节点是包，则子程序直接挂在包下（父=包节点本身）；
                        // 否则（嵌套子程序）父为 Sub Program 文件夹
                        if (parent.type === NodeType.PACKAGE_BODY || parent.type === NodeType.PACKAGE_HEADER) {
                            return {
                                node: parent,
                                isStructureBlock: false,
                                label: this.getNodeLabel(parent),
                                line: parent.declarationLine
                            };
                        }
                        return this.buildProgramGroupItem(parent, 'subprogram');
                    }
                    if (this.isControlStructureType(childType)) {
                        // 控制结构：若其父也是控制结构，直接返回父控制结构节点；否则返回 Body 文件夹。
                        // ELSIF/ELSE 分支自身无独立树项（mergeIfGroups 已并入 IF）：
                        // 其子级的显示父级需上溯到分支前面的所属 IF，保证 reveal 父链可解析。
                        if (this.isControlStructureType(parent.type)) {
                            if (parent.type === NodeType.ELSIF_BRANCH || parent.type === NodeType.ELSE_BRANCH) {
                                const owningIfItem = this.buildOwningIfItemForBranch(parseResult.nodes, parent);
                                if (owningIfItem) {
                                    return owningIfItem;
                                }
                                // 孤立分支（无前置 IF，显示层同样不可达）：按宿主 Body 兜底
                                const holder = this.findParentNode(parseResult.nodes, parent);
                                if (holder) {
                                    return this.buildProgramGroupItem(holder, 'body');
                                }
                            }
                            return {
                                node: parent,
                                isStructureBlock: false,
                                label: this.getSimplifiedControlLabel(parent.type),
                                line: parent.declarationLine
                            };
                        }
                        return this.buildProgramGroupItem(parent, 'body');
                    }
                    // 默认：返回裸父节点
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
     * 构造承载节点的"显示父项"：代理渲染的内联匿名块（触发器主体形态）
     * 本身不产生显示项，其分组/叶子的显示父级为宿主单元；其余节点即自身。
     */
    private toDisplayParentItem(nodes: ParseNode[], owner: ParseNode): TreeItemData {
        if (owner.type === NodeType.ANONYMOUS_BLOCK) {
            const host = this.findParentNode(nodes, owner);
            if (host && this.isDelegatedAnonBlock(host, owner)) {
                return {
                    node: host,
                    isStructureBlock: false,
                    label: this.getNodeLabel(host),
                    line: host.declarationLine
                };
            }
        }
        return {
            node: owner,
            isStructureBlock: false,
            label: this.getNodeLabel(owner),
            line: owner.declarationLine
        };
    }

    /**
     * Declaration 包裹文件夹是否会渲染（与 createGroupedChildren 的判定同一来源）。
     * public：TreeViewManager 在 DECLARE 区域跟随时判断目标是否存在，
     * 不存在（无声明项 / view.showDeclarations 关闭）则回退选中宿主节点。
     */
    public willRenderDeclarationSection(node: ParseNode): boolean {
        return this.showDeclarations && !!node.variableTable && node.variableTable.size > 0;
    }

    /**
     * 构造 Declaration 包裹文件夹 TreeItemData（字段与 createGroupedChildren 产出一致）。
     * public：TreeViewManager.selectAndRevealTarget 构造 DECLARE 区域跟随目标时复用。
     */
    public buildDeclarationSectionItem(owner: ParseNode): TreeItemData {
        return {
            isStructureBlock: false,
            isDeclarationSection: true,
            parentNode: owner,
            label: 'Declaration',
            line: owner.declarationLine
        };
    }

    /**
     * 构造程序文件夹 TreeItemData（Sub Program / Body，字段与 createGroupedChildren 产出一致）。
     * public：TreeViewManager.selectAndRevealTarget 构造 Body 区域跟随目标时复用。
     */
    public buildProgramGroupItem(owner: ParseNode, kind: 'subprogram' | 'body'): TreeItemData {
        const children = owner.children || [];
        let groupChildren: ParseNode[];
        let rootCount: number;
        if (kind === 'subprogram') {
            groupChildren = children.filter(c =>
                c.type === NodeType.FUNCTION || c.type === NodeType.PROCEDURE ||
                c.type === NodeType.FUNCTION_DECLARATION || c.type === NodeType.PROCEDURE_DECLARATION);
            rootCount = groupChildren.length;
        } else {
            // 与 createGroupedChildren 同口径：分支保留在列表（mergeIfGroups 吸收），计数用展示根数
            groupChildren = children.filter(c =>
                c.type === NodeType.ANONYMOUS_BLOCK || this.isControlStructureType(c.type));
            rootCount = groupChildren.filter(c =>
                c.type !== NodeType.ELSIF_BRANCH && c.type !== NodeType.ELSE_BRANCH).length;
        }
        const label = kind === 'subprogram'
            ? `Sub Program (${rootCount})`
            : (rootCount > 0 ? `Body (${rootCount})` : 'Body');
        // line 与 createGroupedChildren 同口径：body 跳转到 BEGIN 行（无直接 beginLine
        // 时借用匿名块的 beginLine），subprogram 跳转到首个子程序行
        let line: number | undefined;
        if (kind === 'body') {
            let beginLine: number | null = owner.beginLine ?? null;
            if (beginLine === null && groupChildren.length > 0) {
                const anonChild = (owner.children || []).find(c => c.type === NodeType.ANONYMOUS_BLOCK);
                if (anonChild && anonChild.beginLine) { beginLine = anonChild.beginLine; }
            }
            line = beginLine ?? owner.declarationLine;
        } else {
            line = groupChildren.length > 0 ? groupChildren[0].declarationLine : owner.declarationLine;
        }
        return {
            isStructureBlock: false,
            isProgramGroup: true,
            programGroupKind: kind,
            programGroupChildren: groupChildren,
            parentNode: owner,
            label,
            line
        };
    }

    /**
     * 构造一个声明分组 TreeItemData（字段与 createDeclarationGroupItems 产出一致）
     */
    private buildDeclarationGroupItem(owner: ParseNode, category: DeclarationCategory): TreeItemData {
        const meta = PLSQLOutlineProvider.DECL_CATEGORY_META.find(m => m.key === category);
        const entries = owner.variableTable
            ? Array.from(owner.variableTable.values()).filter(v => v.category === category).sort((a, b) => a.line - b.line)
            : [];
        return {
            isStructureBlock: false,
            label: `${meta ? meta.label : category} (${entries.length})`,
            isDeclarationGroup: true,
            declarationCategory: category,
            declarationEntries: entries,
            parentNode: owner,
            line: entries.length > 0 ? entries[0].line : owner.declarationLine
        };
    }

    /**
     * 在解析树中查找包含指定声明项的节点（按 name+line 匹配 variableTable）
     */
    private findOwnerNodeOfVariable(nodes: ParseNode[], entry: VariableInfo): ParseNode | undefined {
        for (const node of nodes) {
            if (node.variableTable) {
                const hit = node.variableTable.get(entry.name);
                if (hit && hit.line === entry.line) {
                    return node;
                }
            }
            const found = this.findOwnerNodeOfVariable(node.children, entry);
            if (found) { return found; }
        }
        return undefined;
    }

    /**
     * 为 ELSIF/ELSE 分支的子级构造所属 IF 的显示项（带 mergedChildren，与显示层
     * mergeIfGroups 的吸收口径一致），保证 reveal 父链与 getChildren 可互相解析。
     * 分支与 IF 是同级兄弟（IF 在前）；找不到前置 IF 返回 undefined（孤立分支）。
     */
    private buildOwningIfItemForBranch(nodes: ParseNode[], branch: ParseNode): TreeItemData | undefined {
        for (const node of nodes) {
            const idx = node.children.indexOf(branch);
            if (idx >= 0) {
                let owningIf: ParseNode | undefined;
                for (let i = idx - 1; i >= 0; i--) {
                    if (node.children[i].type === NodeType.IF_STATEMENT) {
                        owningIf = node.children[i];
                        break;
                    }
                }
                if (!owningIf) { return undefined; }
                // 收集 owningIf 自身 + 其后各 ELSIF/ELSE 分支（至当前分支）的控制结构子项
                const merged: ParseNode[] = [];
                const collectControls = (list: ParseNode[]) => {
                    for (const c of list) {
                        if (this.isControlStructureType(c.type) &&
                            c.type !== NodeType.ELSIF_BRANCH && c.type !== NodeType.ELSE_BRANCH) {
                            merged.push(c);
                        }
                    }
                };
                collectControls(owningIf.children || []);
                for (let i = node.children.indexOf(owningIf) + 1; i <= idx; i++) {
                    const sibling = node.children[i];
                    if (sibling.type === NodeType.ELSIF_BRANCH || sibling.type === NodeType.ELSE_BRANCH) {
                        collectControls(sibling.children || []);
                    }
                }
                return {
                    node: owningIf,
                    isStructureBlock: false,
                    mergedChildren: merged.length > 0 ? merged : undefined,
                    label: this.getSimplifiedControlLabel(owningIf.type),
                    line: owningIf.declarationLine
                };
            }
            const found = this.buildOwningIfItemForBranch(node.children, branch);
            if (found) { return found; }
        }
        return undefined;
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
     * 创建子项 - 扁平化分组版本
     * 控制结构节点直接渲染子节点；代码单元/包体用 Declaration/Sub Program/Body 分组。
     */
    private createChildItems(element: TreeItemData): TreeItemData[] {
        const node = element.node!;
        // 控制结构节点: 直接渲染子节点（简化标签，无分组；缩进 = 承载项缩进 + 1）
        if (this.isControlStructureType(node.type)) {
            return this.createControlStructureChildren(node, (element.displayIndent ?? 0) + 1);
        }

        // Package Header: 直接渲染声明（规范/头文件中的子程序声明）
        if (node.type === NodeType.PACKAGE_HEADER) {
            return this.createFlatChildren(node);
        }

        // Package Body / 有代码体的 Function/Procedure/Trigger/Anonymous Block: 扁平化分组
        return this.createGroupedChildren(node);
    }

    /**
     * 判断是否使用分组组织（保留以兼容旧调用）
     * 顶层匿名块（作为独立程序）仍视为可见代码单元；过程体内的内联匿名块
     * 作为 Body 内的可见分组渲染（不再隐藏）。
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
     * 内联匿名块是否采用"代理渲染"：它是宿主的唯一子节点且宿主无自身声明
     * （触发器主体形态——匿名块即宿主的全部内容）。此时匿名块本身不产生
     * 显示项，其 Declaration/Sub Program/Body/Exception/End 直接作为宿主的
     * 子项渲染。其余内联匿名块在宿主 Body 内渲染为可见分组。
     * createGroupedChildren 与 getParent 必须共用本判定，保证显示父链一致。
     */
    private isDelegatedAnonBlock(host: ParseNode, anon: ParseNode): boolean {
        return host.children.length === 1 && host.children[0] === anon &&
            (!host.variableTable || host.variableTable.size === 0);
    }

    /**
     * 创建扁平化分组的子项（参照 PLSQL Developer）
     * 顺序：Declaration(包裹声明类别) → Sub Program(子程序) → Body(控制结构) → Exception(叶) → End(叶)
     * 子程序节点本身可被 VS Code 递归 getChildren → createChildItems → createGroupedChildren，
     * 因此 Sub Program 内的 Sub Program（任意深度嵌套）天然支持。
     */
    private createGroupedChildren(node: ParseNode): TreeItemData[] {
        const items: TreeItemData[] = [];

        // 分类子节点：子程序 vs 控制结构
        const subprogramChildren: ParseNode[] = [];
        const bodyChildren: ParseNode[] = [];
        let bodyRootCount = 0; // Body 展示根数（ELSIF/ELSE 合并进 IF，不计独立项）

        if (node.children) {
            for (const child of node.children) {
                if (child.type === NodeType.FUNCTION || child.type === NodeType.PROCEDURE ||
                    child.type === NodeType.FUNCTION_DECLARATION || child.type === NodeType.PROCEDURE_DECLARATION) {
                    subprogramChildren.push(child);
                } else if (child.type === NodeType.ELSIF_BRANCH || child.type === NodeType.ELSE_BRANCH) {
                    // ELSIF/ELSE 分支保留在 bodyChildren（源码顺序），由 mergeIfGroups
                    // 吸收进前一个 IF（Issue #33：此前在此丢弃，分支内控制结构不可见）
                    bodyChildren.push(child);
                } else if (this.isControlStructureType(child.type)) {
                    bodyChildren.push(child);
                    bodyRootCount++;
                } else if (child.type === NodeType.ANONYMOUS_BLOCK) {
                    // 内联匿名块（DECLARE...BEGIN...END;）的处理：
                    // - 若它是父节点的唯一子节点且宿主无自身声明（如触发器主体被解析为
                    //   单一匿名块），则整体代理渲染匿名块内容（Declaration/Sub Program/
                    //   Body/Exception/End），宿主下直接可见，不产生多余的嵌套层。
                    // - 否则（体内还有其他子项）作为 Body 内的可见分组，展开可见其
                    //   内部结构（声明/控制结构/异常区），不再整体隐藏。
                    if (this.isDelegatedAnonBlock(node, child)) {
                        const items = this.createGroupedChildren(child);
                        if (this.showStructureBlocks) {
                            // 宿主自带 EXCEPTION/END 叶子时（如过程体=单一内联块但自带异常区），
                            // 被代理块的同类叶子不再重复渲染，改为补充宿主叶子（保持源码顺序）；
                            // 宿主无自身叶子（触发器形态）时保留匿名块叶子。
                            const hostHasExc = node.exceptionLine !== null && node.exceptionLine !== undefined;
                            const hostHasEnd = node.endLine !== null && node.endLine !== undefined;
                            const filtered = hostHasExc || hostHasEnd ? items.filter(it => !(
                                it.isStructureBlock && it.structureBlock &&
                                it.structureBlock.parentNode === child && (
                                    (it.structureBlock.type === StructureBlockType.EXCEPTION && hostHasExc) ||
                                    (it.structureBlock.type === StructureBlockType.END && hostHasEnd)))) : items;
                            if (hostHasExc && node.exceptionLine !== child.exceptionLine) {
                                filtered.push({
                                    structureBlock: {
                                        type: StructureBlockType.EXCEPTION,
                                        line: node.exceptionLine!,
                                        parentNode: node
                                    },
                                    isStructureBlock: true,
                                    label: 'EXCEPTION',
                                    line: node.exceptionLine!
                                });
                            }
                            if (hostHasEnd && node.endLine !== child.endLine) {
                                filtered.push({
                                    structureBlock: {
                                        type: StructureBlockType.END,
                                        line: node.endLine!,
                                        parentNode: node
                                    },
                                    isStructureBlock: true,
                                    label: 'END',
                                    line: node.endLine!
                                });
                            }
                            return filtered;
                        }
                        return items;
                    }
                    bodyChildren.push(child);
                    bodyRootCount++;
                } else {
                    // 其他类型归入子程序区（排除匿名块，避免误入 Sub Program 文件夹）
                    subprogramChildren.push(child);
                }
            }
        }

        // 1. Declaration 包裹文件夹：含全部声明类别（变量/游标/常量/类型/异常）
        const hasDeclarations = this.willRenderDeclarationSection(node);
        if (hasDeclarations) {
            items.push({
                isStructureBlock: false,
                isDeclarationSection: true,
                parentNode: node,
                label: 'Declaration',
                line: node.declarationLine
            });
        }

        // 2. 子程序展示：
        //    - Package Body / Package Header：子程序直接平铺（它们本身就属于该包，无需 Sub Program 文件夹）
        //    - 其他代码单元（Procedure/Function/Trigger/匿名块）：子程序用 "Sub Program" 文件夹收纳（嵌套子程序）
        const isPackage = node.type === NodeType.PACKAGE_BODY || node.type === NodeType.PACKAGE_HEADER;
        if (subprogramChildren.length > 0) {
            if (isPackage) {
                // 包：子程序直接作为子项
                for (const child of subprogramChildren) {
                    items.push({
                        node: child,
                        isStructureBlock: false,
                        label: this.getDeclareNodeLabel(child),
                        line: child.declarationLine
                    });
                }
            } else {
                // 嵌套子程序：用 Sub Program 文件夹
                items.push({
                    isStructureBlock: false,
                    isProgramGroup: true,
                    programGroupKind: 'subprogram',
                    programGroupChildren: subprogramChildren,
                    parentNode: node,
                    label: `Sub Program (${subprogramChildren.length})`,
                    line: subprogramChildren[0].declarationLine
                });
            }
        }

        // 3. Body 文件夹：BEGIN...END 代码体。只要有 beginLine 就显示（即使体内无控制结构，
        //    如 PROCEDURE x IS BEGIN xxx; END;），点击跳转到 BEGIN 行。
        // 触发器等主体被解析为嵌套匿名块的节点，用匿名块的 beginLine 作为 Body 跳转目标。
        let beginLine = node.beginLine;
        if ((beginLine === null || beginLine === undefined) && bodyChildren.length > 0) {
            // 无直接 beginLine 但有提升的控制结构（触发器场景），使用第一个控制结构的声明行附近
            const anonChild = (node.children || []).find(c => c.type === NodeType.ANONYMOUS_BLOCK);
            if (anonChild && anonChild.beginLine) { beginLine = anonChild.beginLine; }
        }
        const hasBegin = beginLine !== null && beginLine !== undefined;
        if (hasBegin) {
            items.push({
                isStructureBlock: false,
                isProgramGroup: true,
                programGroupKind: 'body',
                programGroupChildren: bodyChildren,
                parentNode: node,
                // 计数用展示根数（ELSIF/ELSE 分支合并进 IF，不计独立项）
                label: bodyRootCount > 0 ? `Body (${bodyRootCount})` : 'Body',
                line: beginLine || undefined
            });
        }

        // 4. EXCEPTION 叶子（点击跳转到 EXCEPTION 行）
        if (this.showStructureBlocks && node.exceptionLine !== null && node.exceptionLine !== undefined) {
            items.push({
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

        // 5. END 叶子（点击跳转到 END 行）
        if (this.showStructureBlocks && node.endLine !== null && node.endLine !== undefined) {
            items.push({
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

        return items;
    }

    /**
     * 控制结构节点的子项渲染（缩进步数 = 承载项缩进 + 1）
     */
    private createControlStructureChildren(node: ParseNode, indent: number): TreeItemData[] {
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
                    line: item.node!.declarationLine,
                    displayIndent: indent
                } as TreeItemData;
            }
            return {
                node: item.node,
                isStructureBlock: false,
                label: this.getSimplifiedControlLabel(item.node!.type),
                line: item.node!.declarationLine,
                displayIndent: indent
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
    isControlStructureType(type: NodeType): boolean {
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
    getSimplifiedControlLabel(type: NodeType): string {
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
     * 子程序节点标签（仅显示名称，类型由图标区分）
     */
    getDeclareNodeLabel(node: ParseNode): string {
        if (isCallableNode(node)) {
            return node.name;
        }
        return this.getNodeLabel(node);
    }

    // ====== 声明项（变量/游标/常量/类型/异常）分组展示 ======

    /**
     * 声明类别 → (标签, 图标名, 排序权重)
     * 顺序：Variables → Constants → Cursors → Types → Exceptions
     * icon 为 res/icons/ 下的 SVG 名（明/暗自适应）
     */
    private static readonly DECL_CATEGORY_META: {
        key: DeclarationCategory;
        label: string;
        icon: string;
        order: number;
    }[] = [
        { key: DeclarationCategory.VARIABLE, label: 'Variables', icon: 'variable', order: 1 },
        { key: DeclarationCategory.CONSTANT, label: 'Constants', icon: 'constant', order: 2 },
        { key: DeclarationCategory.CURSOR, label: 'Cursors', icon: 'cursor', order: 3 },
        { key: DeclarationCategory.TYPE, label: 'Types', icon: 'type', order: 4 },
        { key: DeclarationCategory.EXCEPTION, label: 'Exceptions', icon: 'exception', order: 5 }
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
    getDeclarationEntryLabel(entry: VariableInfo): string {
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
     * 单个声明项的图标（数据库圆筒主题，按类别）
     */
    private getDeclarationEntryIcon(entry: VariableInfo): { light: vscode.Uri; dark: vscode.Uri } {
        switch (entry.category) {
            case DeclarationCategory.CURSOR: return this.getCustomIcon('cursor');
            case DeclarationCategory.CONSTANT: return this.getCustomIcon('constant');
            case DeclarationCategory.TYPE: return this.getCustomIcon('type');
            case DeclarationCategory.EXCEPTION: return this.getCustomIcon('exception');
            case DeclarationCategory.VARIABLE:
            default: return this.getCustomIcon('variable');
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
        treeItem.iconPath = this.getCustomIcon(meta ? meta.icon : 'variable');
        const count = element.declarationEntries ? element.declarationEntries.length : 0;
        treeItem.description = `${count} 项`;
        treeItem.tooltip = `${element.label} — 共 ${count} 个声明项`;
        treeItem.contextValue = 'declarationGroup';
        // 点击名称跳转（展开仅靠箭头）
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
     * 创建单个声明项树项（叶节点，点击跳转到声明行）
     */
    private createDeclarationEntryTreeItem(element: TreeItemData): vscode.TreeItem {
        const entry = element.declarationEntry!;
        const treeItem = new vscode.TreeItem(
            element.label,
            vscode.TreeItemCollapsibleState.None
        );
        treeItem.iconPath = this.getDeclarationEntryIcon(entry);
        treeItem.description = `第${entry.line}行`;
        // 游标声明（Issue #33）：悬浮显示完整 SQL（原文，markdown 代码块）
        if (entry.category === DeclarationCategory.CURSOR && entry.sql) {
            const md = new vscode.MarkdownString(
                `**${entry.name}**（${entry.scope} 内声明，第 ${entry.line} 行）\n\n${buildSqlMarkdownBlock(entry.sql)}`
            );
            md.supportHtml = true;
            treeItem.tooltip = md;
        } else {
            treeItem.tooltip = `${entry.name}（${entry.scope} 内声明，第 ${entry.line} 行）`;
        }
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
     * 创建 Declaration 包裹文件夹树项（含全部声明类别）
     */
    private createDeclarationSectionTreeItem(element: TreeItemData): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(
            element.label,
            vscode.TreeItemCollapsibleState.Collapsed
        );
        treeItem.iconPath = this.getCustomIcon('folder-decl');
        // 统计声明项总数
        let total = 0;
        if (element.parentNode && element.parentNode.variableTable) {
            total = element.parentNode.variableTable.size;
        }
        treeItem.description = total > 0 ? `${total} 项` : '';
        treeItem.tooltip = `Declaration — 声明项（变量/游标/常量/类型/异常）`;
        treeItem.contextValue = 'declarationSection';
        // 点击名称跳转（展开仅靠箭头）
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
     * 创建程序文件夹树项（Sub Program / Body）
     */
    private createProgramGroupTreeItem(element: TreeItemData): vscode.TreeItem {
        const treeItem = new vscode.TreeItem(
            element.label,
            vscode.TreeItemCollapsibleState.Collapsed
        );
        treeItem.iconPath = this.getCustomIcon(
            element.programGroupKind === 'subprogram' ? 'folder-sub' : 'folder-body'
        );
        const kindLabel = element.programGroupKind === 'subprogram' ? '子程序' : '控制结构';
        treeItem.tooltip = `${element.label} — ${kindLabel}`;
        treeItem.contextValue = element.programGroupKind === 'subprogram' ? 'subprogramGroup' : 'bodyGroup';
        // 点击文件夹本身跳转：Body → 跳到 BEGIN 行；Sub Program → 跳到首个子程序行
        // （展开/折叠仅通过左侧箭头）
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
     * 创建节点树项
     * 行为：点击节点本身 → 跳转到该节点首行（command）；展开/折叠 → 仅通过左侧箭头
     * （VS Code 中设置 command 的节点，点击标签只触发命令，不展开；箭头负责展开）
     */
    private createNodeTreeItem(element: TreeItemData): vscode.TreeItem {
        const node = element.node!;

        // 确定折叠状态（统一走 computeElementCollapsibleState，与可见性判断共用同一套规则）
        const collapsibleState = this.computeElementCollapsibleState(element);

        // 控制结构标签伪缩进（Issue #33）：每层 4 个 NBSP 前缀，使 LOOP/IF 嵌套关系
        // 一眼可见（普通空格在树标签中会被 HTML 折叠）。displayIndent 由 getChildren
        // 按显示层级计算；reveal/getParent 构造的临时项缺省按 level 估算（不参与显示）。
        let label = element.label;
        if (this.isControlStructureType(node.type)) {
            const steps = element.displayIndent !== undefined
                ? element.displayIndent
                : Math.max(0, node.level - 2);
            if (steps > 0) {
                label = '\u00A0'.repeat(steps * PLSQLOutlineProvider.CONTROL_INDENT_STEP) + label;
            }
        }

        const treeItem = new vscode.TreeItem(label, collapsibleState);

        treeItem.iconPath = this.getNodeIcon(node.type);
        treeItem.tooltip = this.getNodeTooltip(node);
        // 子程序（Function/Procedure）不显示描述（按需求仅名称+图标）；
        // 其他节点（包/触发器/控制结构）保留简洁描述
        if (isCallableNode(node)) {
            treeItem.description = '';
        } else {
            treeItem.description = this.getNodeDescription(node);
        }

        // 设置命令（点击标签 → 跳转到该节点首行；展开仅靠箭头）
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
    getNodeLabel(node: ParseNode): string {
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
            case NodeType.TYPE: return 'Type';
            case NodeType.TYPE_BODY: return 'Type Body';
            case NodeType.VIEW: return 'View';
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
     * 获取节点折叠状态
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
     * 统一计算任意树项的默认折叠状态（各工厂方法与 reveal 可见性判断共用同一套规则）。
     * 初始默认值保持既有行为：包/控制结构默认展开，代码单元与各文件夹默认折叠。
     */
    public computeElementCollapsibleState(element: TreeItemData): vscode.TreeItemCollapsibleState {
        if (element.isDeclarationSection || element.isDeclarationGroup || element.isProgramGroup) {
            return vscode.TreeItemCollapsibleState.Collapsed;
        }
        if (element.isDeclarationEntry || element.isStructureBlock) {
            return vscode.TreeItemCollapsibleState.None;
        }
        if (element.node) {
            if (element.mergedChildren && element.mergedChildren.length > 0) {
                return vscode.TreeItemCollapsibleState.Expanded;
            }
            if (this.shouldUseSectionGrouping(element.node)) {
                // 有代码体的节点可展开（Declaration/Sub Program/Body 等）
                return vscode.TreeItemCollapsibleState.Collapsed;
            }
            return this.getCollapsibleState(element.node);
        }
        return vscode.TreeItemCollapsibleState.None;
    }

    /**
     * 设置强制展开所有节点
     */
    public setForceExpandAll(force: boolean): void {
        this.forceExpandAll = force;
        this.outputChannel.appendLine(`设置强制展开标志: ${force}`);
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

    // ====== 自定义数据库主题图标（SVG，明/暗主题自适应）======
    // 图标位于 res/icons/<name>.svg（dark）与 <name>-light.svg（light）。
    // 编译后 out/ 中的代码通过 ../res/icons 解析到资源目录。
    private static ICONS_DIR = path.join(__dirname, '..', 'res', 'icons');
    private iconCache: Map<string, { light: vscode.Uri; dark: vscode.Uri }> = new Map();

    /**
     * 加载自定义图标，返回 { light, dark } 对（VS Code 按当前主题选用）。
     * @param name 图标名（不含扩展名与 -light 后缀）
     */
    private getCustomIcon(name: string): { light: vscode.Uri; dark: vscode.Uri } {
        const cached = this.iconCache.get(name);
        if (cached) { return cached; }
        const icon: { light: vscode.Uri; dark: vscode.Uri } = {
            light: vscode.Uri.file(path.join(PLSQLOutlineProvider.ICONS_DIR, `${name}-light.svg`)),
            dark: vscode.Uri.file(path.join(PLSQLOutlineProvider.ICONS_DIR, `${name}.svg`))
        };
        this.iconCache.set(name, icon);
        return icon;
    }

    /**
     * 获取节点图标（数据库圆筒主题；Procedure=P 蓝，Function=F 琥珀）
     */
    private getNodeIcon(type: NodeType): { light: vscode.Uri; dark: vscode.Uri } {
        switch (type) {
            case NodeType.PACKAGE_HEADER:
            case NodeType.PACKAGE_BODY:
                return this.getCustomIcon('package');
            case NodeType.FUNCTION:
            case NodeType.FUNCTION_DECLARATION:
                return this.getCustomIcon('func');   // F
            case NodeType.PROCEDURE:
            case NodeType.PROCEDURE_DECLARATION:
                return this.getCustomIcon('proc');   // P
            case NodeType.TRIGGER:
                return this.getCustomIcon('trigger');
            case NodeType.ANONYMOUS_BLOCK:
                return this.getCustomIcon('anon');
            case NodeType.TYPE:
            case NodeType.TYPE_BODY:
                return this.getCustomIcon('type');       // T
            case NodeType.VIEW:
                return this.getCustomIcon('package');     // 视图复用包图标
            default:
                // 控制结构等
                return this.getCustomIcon('variable');
        }
    }

    /**
     * 获取结构块图标
     */
    private getStructureBlockIcon(type: StructureBlockType): { light: vscode.Uri; dark: vscode.Uri } {
        switch (type) {
            case StructureBlockType.BEGIN:
                return this.getCustomIcon('begin');
            case StructureBlockType.EXCEPTION:
                return this.getCustomIcon('exception-block');
            case StructureBlockType.END:
                return this.getCustomIcon('end');
            case StructureBlockType.PACKAGE_INITIALIZATION:
                return this.getCustomIcon('begin');
            default:
                return this.getCustomIcon('end');
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
     * 获取节点描述（仅行号；按需求4 不再显示 L1/L2 层级与子项数量）
     */
    private getNodeDescription(node: ParseNode): string {
        return `第${node.declarationLine}行`;
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
    private outputChannel: vscode.OutputChannel;

    constructor(context: vscode.ExtensionContext) {
        this.provider = new PLSQLOutlineProvider();
        this.outputChannel = getOutputChannel();

        this.treeView = vscode.window.createTreeView('plsqlOutline', {
            treeDataProvider: this.provider,
            showCollapseAll: true
        });

        // 注册命令
        this.registerCommands(context);

        // 监听配置变化

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
            toggleStructureBlocksCommand,
            manageFileExtensionsCommand
        );
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
                    
                    // 为每个根节点创建TreeItemData并展开（label 需与 createTreeItemsFromNodes 产出一致）
                    for (const rootNode of parseResult.nodes) {
                        try {
                            const rootTreeItem: TreeItemData = {
                                node: rootNode,
                                isStructureBlock: false,
                                label: this.provider.getNodeLabel(rootNode),
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
     * 管理文件扩展名
     */
    private async manageFileExtensions(): Promise<void> {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const currentExtensions = config.get<string[]>('fileExtensions', [...DEFAULT_FILE_EXTENSIONS]);
        
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
        const defaultExtensions = [...DEFAULT_FILE_EXTENSIONS];
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
     * 获取提供者
     */
    getProvider(): PLSQLOutlineProvider {
        return this.provider;
    }

    /**
     * 设置标题
     */
    setTitle(title: string): void {
        this.treeView.title = title;
    }

    /**
     * 选中并展开到指定目标（节点/结构块/声明项/区域文件夹）
     * 元素匹配只依赖 TreeItem.id（= generateCacheKey，经 VS Code createHandle 以 id 定位），
     * 构造的 TreeItemData 无需与 getChildren 产出逐字段相等，键字段一致即可。
     */
    async selectAndRevealTarget(target: { type: 'node' | 'structureBlock' | 'declarationEntry', node?: ParseNode, blockType?: string, entry?: VariableInfo }): Promise<void> {
        try {
            if (target.type === 'declarationEntry' && target.entry && target.node) {
                // 声明项：reveal 到该声明项（其父链为 node → DECLARE section → declarationGroup → entry）
                const entry = target.entry;
                const _parentNode = target.node;
                // declarationEntry 叶节点（字段与 getChildren 声明分组分支的产出一致）
                const treeItemData: TreeItemData = {
                    isStructureBlock: false,
                    label: this.provider.getDeclarationEntryLabel(entry),
                    line: entry.line,
                    isDeclarationEntry: true,
                    declarationEntry: entry
                };
                await this.revealItem(treeItemData);
                this.outputChannel.appendLine(`已选中声明项: ${entry.name} (第${entry.line}行)`);
                return;
            }

            if (target.type === 'structureBlock' && target.node && target.blockType) {
                // 区域跟随（Issue #22）：光标进入 BEGIN/DECLARE 区域时选中对应的
                // Body / Declaration 文件夹（此前回退选中宿主过程/函数名，即旧"决策 A"）。
                // EXCEPTION/END 是真实叶子节点，正常 reveal。
                if (target.blockType === 'BEGIN') {
                    const owner = target.node;
                    const bodyItem = this.provider.buildProgramGroupItem(owner, 'body');
                    await this.revealItem(bodyItem);
                    this.outputChannel.appendLine(`已选中Body区域: ${owner.name} (第${owner.beginLine ?? '?'}行)`);
                    return;
                }

                if (target.blockType === 'DECLARE') {
                    const owner = target.node;
                    if (this.provider.willRenderDeclarationSection(owner)) {
                        const declItem = this.provider.buildDeclarationSectionItem(owner);
                        await this.revealItem(declItem);
                        this.outputChannel.appendLine(`已选中Declaration区域: ${owner.name} (第${owner.declarationLine}行)`);
                    } else {
                        // Declaration 文件夹不渲染（无声明项或 view.showDeclarations 关闭）：
                        // 回退选中宿主节点，保证跟随不中断
                        await this.revealItem(this.buildNodeDisplayItem(owner));
                        this.outputChannel.appendLine(`Declaration区域不可用，回退选中节点: ${owner.name} (第${owner.declarationLine}行)`);
                    }
                    return;
                }

                // EXCEPTION/END 叶子
                const structureBlockType = this.getStructureBlockTypeEnum(target.blockType);
                const blockLine = this.getStructureBlockLine(target.node, target.blockType);

                const treeItemData: TreeItemData = {
                    structureBlock: {
                        type: structureBlockType,
                        line: blockLine,
                        parentNode: target.node
                    },
                    isStructureBlock: true,
                    label: target.blockType,
                    line: blockLine
                };
                await this.revealItem(treeItemData);
                this.outputChannel.appendLine(`已选中结构块: ${target.blockType} (第${blockLine}行)`);
                return;
            }

            // 普通节点：reveal 元素匹配只看 TreeItem.id（见方法头注释），标签仅供
            // getTreeItem 生成 cacheKey 之外的信息，按节点类型选用常规标签即可。
            if (target.node) {
                await this.revealItem(this.buildNodeDisplayItem(target.node));
                this.outputChannel.appendLine(`已选中节点: ${target.node.name} (第${target.node.declarationLine}行)`);
            }

        } catch (error) {
            this.outputChannel.appendLine(`选中目标失败: ${error}`);
            // 不显示错误消息，避免干扰用户
        }
    }

    /**
     * 构造普通节点（子程序/控制结构/匿名块/其他）的显示项。
     * 标签规则与 getChildren 各分支一致（子程序=纯名称，控制结构=简化关键字等）。
     */
    private buildNodeDisplayItem(n: ParseNode): TreeItemData {
        let label: string;
        if (isCallableNode(n)) {
            label = this.provider.getDeclareNodeLabel(n);
        } else if (this.provider.isControlStructureType(n.type)) {
            label = this.provider.getSimplifiedControlLabel(n.type);
        } else if (n.type === NodeType.ANONYMOUS_BLOCK) {
            label = 'Anonymous Block'; // 与 Body 内匿名块分组的渲染标签一致
        } else {
            label = this.provider.getNodeLabel(n);
        }
        return {
            node: n,
            isStructureBlock: false,
            label,
            line: n.declarationLine
        };
    }

    /**
     * 调用 reveal API（容错：面板不可见时 VS Code 抛错，直接吞掉）
     *
     * Issue #22 起光标跟随允许自动展开：reveal 会沿父链展开折叠的祖先，
     * 使 Body/Declaration/EXCEPTION 等区域目标可见后选中（仅展开、绝不折叠；
     * 展开状态用户仍可手动收回）。这取代了 v1.6.4 的"目标不可见即跳过"门控。
     */
    private async revealItem(treeItemData: TreeItemData): Promise<void> {
        // 当面板可见时才尝试 reveal；不可见时静默跳过（reveal 会抛 TreeError）
        if (!this.treeView.visible) {
            return;
        }
        try {
            await this.treeView.reveal(treeItemData, {
                select: true,
                focus: false
            });
        } catch (e) {
            // reveal 失败（如父链无法定位）时静默处理
            this.outputChannel.appendLine(`reveal 失败: ${e}`);
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

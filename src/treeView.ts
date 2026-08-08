import * as vscode from 'vscode';
import * as path from 'path';
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
        if (element.isDeclarationSection) {
            treeItem = this.createDeclarationSectionTreeItem(element);
        } else if (element.isProgramGroup) {
            treeItem = this.createProgramGroupTreeItem(element);
        } else if (element.isSection) {
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
        if (element.isDeclarationSection && element.parentNode) {
            return `declsection_${element.parentNode.name}_${element.parentNode.declarationLine}`;
        } else if (element.isProgramGroup && element.parentNode) {
            return `proggroup_${element.programGroupKind}_${element.parentNode.name}_${element.parentNode.declarationLine}`;
        } else if (element.isSection && element.sectionType) {
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
                // body：控制结构，合并 IF 组，简化标签
                const merged = this.mergeIfGroups(element.programGroupChildren);
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
            } else if (element.isSection) {
                // 旧分区级别（兼容）：返回分区内的子项
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
                const owner = element.parentNode;
                return {
                    node: owner,
                    isStructureBlock: false,
                    label: this.getNodeLabel(owner),
                    line: owner.declarationLine
                };
            }

            // 4. 程序文件夹（Sub Program / Body）→ 父为承载节点
            if (element.isProgramGroup && element.parentNode) {
                const owner = element.parentNode;
                return {
                    node: owner,
                    isStructureBlock: false,
                    label: this.getNodeLabel(owner),
                    line: owner.declarationLine
                };
            }

            // 5. 结构块（EXCEPTION/END 叶子）→ 父为承载节点
            if (element.isStructureBlock && element.structureBlock) {
                const parentNode = element.structureBlock.parentNode;
                return {
                    node: parentNode,
                    isStructureBlock: false,
                    label: this.getNodeLabel(parentNode),
                    line: parentNode.declarationLine
                };
            }

            // 6. 普通节点（子程序 / 控制结构）→ 父为 ParseNode 父节点对应的程序文件夹或父控制结构
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
                        // 控制结构：若其父也是控制结构，直接返回父控制结构节点；否则返回 Body 文件夹
                        if (this.isControlStructureType(parent.type)) {
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
     * 构造 Declaration 包裹文件夹 TreeItemData（字段与 createGroupedChildren 产出一致）
     */
    private buildDeclarationSectionItem(owner: ParseNode): TreeItemData {
        return {
            isStructureBlock: false,
            isDeclarationSection: true,
            parentNode: owner,
            label: 'Declaration',
            line: owner.declarationLine
        };
    }

    /**
     * 构造程序文件夹 TreeItemData（Sub Program / Body，字段与 createGroupedChildren 产出一致）
     */
    private buildProgramGroupItem(owner: ParseNode, kind: 'subprogram' | 'body'): TreeItemData {
        const children = owner.children || [];
        let groupChildren: ParseNode[];
        if (kind === 'subprogram') {
            groupChildren = children.filter(c =>
                c.type === NodeType.FUNCTION || c.type === NodeType.PROCEDURE ||
                c.type === NodeType.FUNCTION_DECLARATION || c.type === NodeType.PROCEDURE_DECLARATION);
        } else {
            groupChildren = children.filter(c =>
                this.isControlStructureType(c.type) &&
                c.type !== NodeType.ELSIF_BRANCH && c.type !== NodeType.ELSE_BRANCH);
        }
        const label = kind === 'subprogram'
            ? `Sub Program (${groupChildren.length})`
            : `Body (${groupChildren.length})`;
        return {
            isStructureBlock: false,
            isProgramGroup: true,
            programGroupKind: kind,
            programGroupChildren: groupChildren,
            parentNode: owner,
            label,
            line: groupChildren.length > 0 ? groupChildren[0].declarationLine : owner.declarationLine
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
    private createChildItems(node: ParseNode): TreeItemData[] {
        // 控制结构节点: 直接渲染子节点（简化标签，无分组）
        if (this.isControlStructureType(node.type)) {
            return this.createControlStructureChildren(node);
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
     * 由 createGroupedChildren 的分类逻辑跳过（不进入 Sub Program 文件夹）。
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

        if (node.children) {
            for (const child of node.children) {
                if (child.type === NodeType.FUNCTION || child.type === NodeType.PROCEDURE ||
                    child.type === NodeType.FUNCTION_DECLARATION || child.type === NodeType.PROCEDURE_DECLARATION) {
                    subprogramChildren.push(child);
                } else if (this.isControlStructureType(child.type) &&
                    child.type !== NodeType.ELSIF_BRANCH && child.type !== NodeType.ELSE_BRANCH) {
                    bodyChildren.push(child);
                } else if (child.type === NodeType.ELSIF_BRANCH || child.type === NodeType.ELSE_BRANCH) {
                    // 吸收到前一个IF中，此处跳过
                } else if (child.type === NodeType.ANONYMOUS_BLOCK) {
                    // 内联匿名块（DECLARE...BEGIN...END;）的处理：
                    // - 若它是父节点的唯一子节点（如触发器主体被解析为单一匿名块），
                    //   则把其子节点提升到当前层级（保留可见的声明/控制结构）。
                    // - 否则（过程体内有多个子项）跳过，不进入 Sub Program 文件夹。
                    if (node.children.length === 1) {
                        for (const grandChild of child.children) {
                            if (this.isControlStructureType(grandChild.type) &&
                                grandChild.type !== NodeType.ELSIF_BRANCH && grandChild.type !== NodeType.ELSE_BRANCH) {
                                bodyChildren.push(grandChild);
                            }
                        }
                    }
                    // 解析层仍保留匿名块节点（承担 BEGIN/END 配对），仅展示层跳过/提升。
                } else {
                    // 其他类型归入子程序区（排除匿名块，避免误入 Sub Program 文件夹）
                    subprogramChildren.push(child);
                }
            }
        }

        // 1. Declaration 包裹文件夹：含全部声明类别（变量/游标/常量/类型/异常）
        const hasDeclarations = this.showDeclarations && !!node.variableTable && node.variableTable.size > 0;
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
                label: bodyChildren.length > 0 ? `Body (${bodyChildren.length})` : 'Body',
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
     * 创建分区内的子项
     */
    private createSectionChildItems(section: TreeItemData): TreeItemData[] {
        if (section.sectionType === SectionType.DECLARE) {
            // DECLARE区域：仅渲染声明项分组（变量/游标/常量/类型/异常）
            if (this.showDeclarations && section.parentNode) {
                return this.createDeclarationGroupItems(section.parentNode);
            }
            return [];
        }

        if (section.sectionType === SectionType.SUBPROGRAM) {
            // SUBPROGRAM区域：渲染子函数/过程
            if (!section.sectionChildren || section.sectionChildren.length === 0) {
                return [];
            }
            return section.sectionChildren.map(child => ({
                node: child,
                isStructureBlock: false,
                label: this.getDeclareNodeLabel(child),
                line: child.declarationLine
            }));
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
        if (node.type === NodeType.FUNCTION || node.type === NodeType.FUNCTION_DECLARATION ||
            node.type === NodeType.PROCEDURE || node.type === NodeType.PROCEDURE_DECLARATION) {
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
            treeItem.description = `第${element.line}行`;
            treeItem.command = {
                command: 'plsqlOutline.goToLine',
                title: '跳转到行',
                arguments: [element.line]
            };
        }

        return treeItem;
    }

    /**
     * 获取分区图标（旧版兼容）
     */
    private getSectionIcon(type: SectionType): { light: vscode.Uri; dark: vscode.Uri } {
        switch (type) {
            case SectionType.DECLARE: return this.getCustomIcon('folder-decl');
            case SectionType.SUBPROGRAM: return this.getCustomIcon('folder-sub');
            case SectionType.BODY: return this.getCustomIcon('folder-body');
            case SectionType.EXCEPTION: return this.getCustomIcon('exception-block');
            case SectionType.END: return this.getCustomIcon('end');
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

        // 确定折叠状态
        let collapsibleState: vscode.TreeItemCollapsibleState;
        if (element.mergedChildren && element.mergedChildren.length > 0) {
            collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
        } else if (this.shouldUseSectionGrouping(node)) {
            // 有代码体的节点可展开（Declaration/Sub Program/Body 等）
            collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        } else {
            collapsibleState = this.getCollapsibleState(node);
        }

        const treeItem = new vscode.TreeItem(element.label, collapsibleState);

        treeItem.iconPath = this.getNodeIcon(node.type);
        treeItem.tooltip = this.getNodeTooltip(node);
        // 子程序（Function/Procedure）不显示描述（按需求仅名称+图标）；
        // 其他节点（包/触发器/控制结构）保留简洁描述
        if (node.type === NodeType.FUNCTION || node.type === NodeType.PROCEDURE ||
            node.type === NodeType.FUNCTION_DECLARATION || node.type === NodeType.PROCEDURE_DECLARATION) {
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
     * 选中并展开到指定目标（节点/结构块/声明项）
     * 注意：构造的 TreeItemData 字段必须与 getChildren / createSectionChildItems /
     * createDeclarationGroupItems 的产出逐字段一致，否则 reveal 的元素相等性比较会失败。
     */
    async selectAndRevealTarget(target: { type: 'node' | 'structureBlock' | 'declarationEntry', node?: ParseNode, blockType?: string, entry?: VariableInfo }): Promise<void> {
        try {
            if (target.type === 'declarationEntry' && target.entry && target.node) {
                // 声明项：reveal 到该声明项（其父链为 node → DECLARE section → declarationGroup → entry）
                const entry = target.entry;
                const parentNode = target.node;
                // declarationEntry 叶节点（字段与 createSectionChildItems 中 getChildren 的产出一致）
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
                // BEGIN 在新扁平化结构中没有对应树节点（BEGIN 由 Body 文件夹代表，非叶子）。
                // 按用户决策 A：光标在过程体内（BEGIN 区域）→ 选中所属 Procedure/Function 节点。
                // EXCEPTION/END 是真实叶子节点，正常 reveal。
                if (target.blockType === 'BEGIN') {
                    const owner = target.node;
                    const ownerLabel = this.provider.getDeclareNodeLabel(owner);
                    const ownerItem: TreeItemData = {
                        node: owner,
                        isStructureBlock: false,
                        label: ownerLabel,
                        line: owner.declarationLine
                    };
                    await this.revealItem(ownerItem);
                    this.outputChannel.appendLine(`已选中节点(BEGIN区): ${owner.name} (第${owner.declarationLine}行)`);
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

            // 普通节点：构造的 TreeItemData 字段必须与 getChildren 的产出逐字段一致，
            // 否则 reveal 的元素相等性比较会失败（包下子程序用 getDeclareNodeLabel=仅名称，
            // 控制结构等用 getSimplifiedControlLabel）。这里按节点类型选用正确的标签。
            if (target.node) {
                const n = target.node;
                let label: string;
                if (n.type === NodeType.FUNCTION || n.type === NodeType.PROCEDURE ||
                    n.type === NodeType.FUNCTION_DECLARATION || n.type === NodeType.PROCEDURE_DECLARATION) {
                    label = this.provider.getDeclareNodeLabel(n);
                } else if (this.provider.isControlStructureType(n.type)) {
                    label = this.provider.getSimplifiedControlLabel(n.type);
                } else {
                    label = this.provider.getNodeLabel(n);
                }
                const treeItemData: TreeItemData = {
                    node: n,
                    isStructureBlock: false,
                    label,
                    line: n.declarationLine
                };
                await this.revealItem(treeItemData);
                this.outputChannel.appendLine(`已选中节点: ${n.name} (第${n.declarationLine}行)`);
            }

        } catch (error) {
            this.outputChannel.appendLine(`选中目标失败: ${error}`);
            // 不显示错误消息，避免干扰用户
        }
    }

    /**
     * 调用 reveal API（容错：面板不可见时 VS Code 抛错，直接吞掉）
     */
    private async revealItem(treeItemData: TreeItemData): Promise<void> {
        // 当面板可见时才尝试 reveal；不可见时静默跳过（reveal 会抛 TreeError）
        if (!this.treeView.visible) {
            return;
        }
        try {
            await this.treeView.reveal(treeItemData, {
                select: true,
                focus: false,
                expand: true
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

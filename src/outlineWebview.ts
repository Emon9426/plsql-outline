/**
 * 大纲 Webview 视图（v1.17.0 单视图重构，Emon 2026-10-05 决策）
 *
 * 背景：原生 TreeView 窗格无法渲染输入框，Webview 视图高度又不受 API 控制——
 * 「输入框窗格 + 树窗格」的双窗格布局始终存在大块空白带与 1px 分隔线（用户
 * 截图像素实测 ≈90px）。最终方案：大纲视图整体改为**单个 Webview**，搜索输入
 * 框与树在同一个窗格内由 HTML 渲染，视觉上完全一体。
 *
 * 职责与数据流：
 *  - 数据模型仍由 PLSQLOutlineProvider 构建（computeChildren/applyFilter/标签/
 *    图标/展开规则全部复用，相关单测不动）——本类把 TreeItemData 树序列化为
 *    JSON 发给 webview 渲染；
 *  - webview → 扩展消息：ready（请求模型）/ filter（过滤词）/ click（跳转行）/
 *    copy（复制名称）；
 *  - 扩展 → webview 消息：model（全量树模型 + 图标 + 过滤状态）/ select（光标
 *    跟随：按 id 定位、展开祖先、滚动高亮）；
 *  - 键盘导航（↑↓←→/Enter）在 webview 内自实现（Emon 确认 v1 需要）。
 *
 * 图标：res/icons/*.svg 以 data URI 内联进模型（深浅两套，按 body 主题类切换），
 * 无需 localResourceRoots。大文件性能：树行 content-visibility:auto 懒渲染。
 */
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ParseNode, VariableInfo, NodeType, StructureBlockType, TreeItemData } from './types';
import { isCallableNode } from './shared';
import { getOutputChannel } from './logger';
import { PLSQLOutlineProvider, MemoryDataProvider } from './treeView';

/** webview 侧节点模型（JSON 序列化形态） */
interface WebviewNode {
    id: string;
    label: string;
    description?: string;
    /** res/icons 图标名（不含扩展名；模型附 light/dark 两套 data URI） */
    icon?: string;
    /** 0=叶子 1=默认折叠 2=默认展开 */
    collapsible: 0 | 1 | 2;
    /** 跳转行（1-based；无跳转语义的文件夹为空） */
    line?: number;
    tooltip?: string;
    /** 干净标识符（右键复制名称用；控制结构/文件夹为空） */
    copyName?: string;
    children?: WebviewNode[];
}

export class OutlineWebviewManager implements vscode.WebviewViewProvider, vscode.Disposable {
    public static readonly VIEW_ID = 'plsqlOutline';

    private provider: PLSQLOutlineProvider;
    private outputChannel: vscode.OutputChannel;
    private view: vscode.WebviewView | null = null;
    private readonly disposables: vscode.Disposable[] = [];

    /** id → 行号/名称（click/copy 消息反查，随模型重建） */
    private idLineMap = new Map<string, number>();
    private idNameMap = new Map<string, string>();

    /** 图标名 → {light,dark} data URI（激活时一次性内联） */
    private iconData = new Map<string, { light: string; dark: string }>();

    /** 模型构建互斥：构建期间的新请求排队（收敛重放） */
    private modelBuilding = false;
    private modelQueued = false;
    /** webview 就绪前缓冲：有模型待发 */
    private hasModelToPost = false;

    constructor(context: vscode.ExtensionContext) {
        this.provider = new PLSQLOutlineProvider();
        this.outputChannel = getOutputChannel();
        this.loadIcons();

        this.registerCommands(context);
        const registration = vscode.window.registerWebviewViewProvider(
            OutlineWebviewManager.VIEW_ID, this,
            { webviewOptions: { retainContextWhenHidden: true } });
        context.subscriptions.push(registration);
        this.disposables.push(registration);
        this.outputChannel.appendLine('OutlineWebviewManager 初始化完成');
    }

    /* ------------------------------------------------------------ */
    /* WebviewViewProvider                                            */
    /* ------------------------------------------------------------ */

    resolveWebviewView(view: vscode.WebviewView, _context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void {
        this.view = view;
        view.webview.options = { enableScripts: true };
        view.webview.html = this.buildHtml();
        view.webview.onDidReceiveMessage((message: { type?: string; text?: string; id?: string }) => {
            switch (message.type) {
                case 'ready':
                    void this.postModel();
                    break;
                case 'filter':
                    void this.setFilter(String(message.text ?? ''));
                    break;
                case 'click':
                    if (message.id) { this.jumpToId(message.id); }
                    break;
                case 'copy':
                    if (message.id) { void this.copyNameById(message.id); }
                    break;
            }
        });
        this.view.onDidDispose(() => { this.view = null; });
        if (this.hasModelToPost) {
            void this.postModel();
        }
    }

    /* ------------------------------------------------------------ */
    /* 对外 API（extension.ts 接线，签名与原 TreeViewManager 兼容）    */
    /* ------------------------------------------------------------ */

    updateDataProvider(dataProvider: MemoryDataProvider): void {
        this.provider.setDataProvider(dataProvider);
        // 解析完成（激活自动解析/保存/静默重解析/文件切换）后必须重发模型：
        // webview 早在解析前就绪时，初始模型是空的，不重发将一直显示"暂无解析结果"
        // （装机实测缺陷：webview ready → 空模型 → parseCurrentFile → 无重发）
        void this.postModel();
    }

    getProvider(): PLSQLOutlineProvider {
        return this.provider;
    }

    refresh(): void {
        this.provider.refresh();
        void this.postModel();
    }

    /** 展开所有：置强制展开标志后重发模型（webview 按模型展开态渲染） */
    async expandAll(): Promise<void> {
        this.provider.setForceExpandAll(true);
        this.provider.refresh();
        await this.postModel();
        vscode.window.showInformationMessage('所有节点已展开');
    }

    isFilterActive(): boolean {
        return this.provider.isFilterActive();
    }

    /** 设置过滤词（webview 输入框实时上报，也保留给外部调用） */
    async setFilter(text: string): Promise<void> {
        this.provider.setFilter(text);
        await this.postModel();
    }

    /** 搜索回车：跳到第一个命中（webview 内定位展开） */
    async revealFirstFilterMatch(): Promise<void> {
        const match = await this.provider.getFirstFilterMatch();
        if (!match) {
            return;
        }
        this.postSelect(this.provider.generateCacheKey(match));
    }

    /**
     * 选中并展开到指定目标（光标跟随）。目标 → TreeItemData 的构造逻辑与
     * 原 TreeViewManager.selectAndRevealTarget 完全一致（Issue #22 区域跟随、
     * #33 声明区回退等行为保留），reveal 改为向 webview 发 select 消息。
     */
    async selectAndRevealTarget(target: { type: 'node' | 'structureBlock' | 'declarationEntry', node?: ParseNode, blockType?: string, entry?: VariableInfo }): Promise<void> {
        try {
            if (target.type === 'declarationEntry' && target.entry && target.node) {
                const entry = target.entry;
                const treeItemData: TreeItemData = {
                    isStructureBlock: false,
                    label: this.provider.getDeclarationEntryLabel(entry),
                    line: entry.line,
                    isDeclarationEntry: true,
                    declarationEntry: entry
                };
                this.postSelect(this.provider.generateCacheKey(treeItemData));
                return;
            }

            if (target.type === 'structureBlock' && target.node && target.blockType) {
                if (target.blockType === 'BEGIN') {
                    const owner = target.node;
                    this.postSelect(this.provider.generateCacheKey(this.provider.buildProgramGroupItem(owner, 'body')));
                    return;
                }
                if (target.blockType === 'DECLARE') {
                    const owner = target.node;
                    if (this.provider.willRenderDeclarationSection(owner)) {
                        this.postSelect(this.provider.generateCacheKey(this.provider.buildDeclarationSectionItem(owner)));
                    } else {
                        this.postSelect(this.provider.generateCacheKey(this.buildNodeDisplayItem(owner)));
                    }
                    return;
                }
                const structureBlockType = this.getStructureBlockTypeEnum(target.blockType);
                const blockLine = this.getStructureBlockLine(target.node, target.blockType);
                const treeItemData: TreeItemData = {
                    structureBlock: { type: structureBlockType, line: blockLine, parentNode: target.node },
                    isStructureBlock: true,
                    label: target.blockType,
                    line: blockLine
                };
                this.postSelect(this.provider.generateCacheKey(treeItemData));
                return;
            }

            if (target.node) {
                this.postSelect(this.provider.generateCacheKey(this.buildNodeDisplayItem(target.node)));
            }
        } catch (error) {
            this.outputChannel.appendLine(`选中目标失败: ${error}`);
        }
    }

    /* ------------------------------------------------------------ */
    /* 模型构建与发送                                                 */
    /* ------------------------------------------------------------ */

    /** 全量树模型：递归 provider.getChildren/getTreeItem（TreeItem 有缓存，开销低） */
    private async postModel(): Promise<void> {
        if (this.modelBuilding) {
            this.modelQueued = true;
            return;
        }
        this.modelBuilding = true;
        try {
            if (!this.view) {
                this.hasModelToPost = true;
                return;
            }
            const roots = await this.provider.getChildren();
            const nodes: WebviewNode[] = [];
            for (const element of roots) {
                nodes.push(await this.serializeNode(element));
            }
            const filterCount = this.provider.isFilterActive()
                ? await this.provider.countFilterMatches() : undefined;
            const ok = await this.view.webview.postMessage({
                type: 'model',
                nodes,
                icons: Object.fromEntries(this.iconData),
                filter: this.provider.getFilterText(),
                filterCount
            });
            if (!ok) {
                this.hasModelToPost = true;
            } else {
                this.hasModelToPost = false;
            }
        } catch (error) {
            this.outputChannel.appendLine(`大纲模型构建失败: ${error}`);
        } finally {
            this.modelBuilding = false;
            if (this.modelQueued) {
                this.modelQueued = false;
                void this.postModel();
            }
        }
    }

    private async serializeNode(element: TreeItemData): Promise<WebviewNode> {
        const item = this.provider.getTreeItem(element);
        const id = this.provider.generateCacheKey(element);
        const node: WebviewNode = {
            id,
            label: typeof item.label === 'string' ? item.label : String(item.label ?? ''),
            description: typeof item.description === 'string' ? item.description : undefined,
            icon: this.iconKeyOf(item.iconPath),
            collapsible: item.collapsibleState === vscode.TreeItemCollapsibleState.None
                ? 0
                : item.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed ? 1 : 2,
            line: element.line ?? element.node?.declarationLine,
            tooltip: this.tooltipText(item.tooltip),
            copyName: this.cleanNameOf(element)
        };
        if (node.copyName) {
            this.idNameMap.set(id, node.copyName);
        }
        if (node.line) {
            this.idLineMap.set(id, node.line);
        }
        if (node.collapsible !== 0) {
            // 折叠节点也带全量子树：webview 端展开无需再请求
            const children = await this.provider.getChildren(element);
            if (children.length > 0) {
                node.children = [];
                for (const child of children) {
                    node.children.push(await this.serializeNode(child));
                }
            } else {
                node.collapsible = 0;
            }
        }
        return node;
    }

    /** 干净标识符（与原 copyName 命令口径一致：声明项名/非控制结构节点名） */
    private cleanNameOf(element: TreeItemData): string | undefined {
        if (element.isDeclarationEntry && element.declarationEntry) {
            return element.declarationEntry.name;
        }
        if (element.node && !this.provider.isControlStructureType(element.node.type)) {
            return element.node.name;
        }
        return undefined;
    }

    /** iconPath {light,dark} → 图标名（dark 文件名去掉 .svg） */
    private iconKeyOf(iconPath: unknown): string | undefined {
        const p = iconPath as { dark?: { path?: string } } | undefined;
        const darkPath = p?.dark?.path;
        if (!darkPath) {
            return undefined;
        }
        const base = path.basename(darkPath);
        return base.endsWith('.svg') ? base.slice(0, -4) : base;
    }

    /** tooltip（MarkdownString/字符串）→ 纯文本（webview 自绘悬浮卡展示） */
    private tooltipText(tooltip: unknown): string | undefined {
        if (!tooltip) {
            return undefined;
        }
        if (typeof tooltip === 'string') {
            return tooltip;
        }
        const md = tooltip as { value?: string };
        if (!md.value) {
            return undefined;
        }
        return md.value
            .replace(/```[a-z]*\n?/g, '')
            .replace(/\*\*/g, '')
            .replace(/`/g, '')
            .trim();
    }

    /** 光标跟随 select 消息（面板不可见时跳过，语义同原 reveal 的 visible 门控） */
    private postSelect(id: string): void {
        if (!this.view || !this.view.visible) {
            return;
        }
        void this.view.webview.postMessage({ type: 'select', id });
    }

    /* ------------------------------------------------------------ */
    /** res/icons 全部内联为 data URI（图标清单与生成器同源） */
    private loadIcons(): void {
        const dir = path.join(__dirname, '..', 'res', 'icons');
        try {
            for (const file of fs.readdirSync(dir)) {
                if (!file.endsWith('.svg')) {
                    continue;
                }
                const svg = fs.readFileSync(path.join(dir, file), 'utf8');
                const uri = 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64');
                const key = file.slice(0, -4);
                if (key.endsWith('-light')) {
                    const base = key.slice(0, -6);
                    const entry = this.iconData.get(base) ?? { light: uri, dark: uri };
                    entry.light = uri;
                    this.iconData.set(base, entry);
                } else {
                    const entry = this.iconData.get(key) ?? { light: uri, dark: uri };
                    entry.dark = uri;
                    this.iconData.set(key, entry);
                }
            }
        } catch (error) {
            this.outputChannel.appendLine(`图标内联失败: ${error}`);
        }
    }

    /* ------------------------------------------------------------ */
    /* 消息处理                                                       */
    /* ------------------------------------------------------------ */

    /** webview 行点击 → 跳转到对应行（与原 goToLine 行为一致） */
    private jumpToId(id: string): void {
        const line = this.idLineMap.get(id);
        if (line === undefined) {
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('没有活动的编辑器');
            return;
        }
        try {
            const position = new vscode.Position(line - 1, 0);
            editor.selection = new vscode.Selection(position, position);
            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
            void vscode.window.showTextDocument(editor.document);
        } catch (error) {
            vscode.window.showErrorMessage(`跳转到第${line}行失败: ${error}`);
        }
    }

    private async copyNameById(id: string): Promise<void> {
        const name = this.idNameMap.get(id);
        if (!name) {
            vscode.window.showWarningMessage('该项没有可复制的名称');
            return;
        }
        await vscode.env.clipboard.writeText(name);
        vscode.window.showInformationMessage(`已复制：${name}`);
    }

    /* ------------------------------------------------------------ */
    /* 命令（从原 TreeViewManager 迁移；goToLine/copyName 树项菜单随   */
    /* 原生树删除，改为 webview 消息驱动）                             */
    /* ------------------------------------------------------------ */

    private registerCommands(context: vscode.ExtensionContext): void {
        const toggleStructureBlocksCommand = vscode.commands.registerCommand(
            'plsqlOutline.toggleStructureBlocks',
            () => this.toggleStructureBlocks()
        );
        const manageFileExtensionsCommand = vscode.commands.registerCommand(
            'plsqlOutline.manageFileExtensions',
            () => this.manageFileExtensions()
        );
        context.subscriptions.push(toggleStructureBlocksCommand, manageFileExtensionsCommand);
        this.disposables.push(toggleStructureBlocksCommand, manageFileExtensionsCommand);
    }

    private async toggleStructureBlocks(): Promise<void> {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const currentValue = config.get('view.showStructureBlocks', true);
        await config.update('view.showStructureBlocks', !currentValue, vscode.ConfigurationTarget.Workspace);
    }

    private async manageFileExtensions(): Promise<void> {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const extensions = config.get<string[]>('fileExtensions', []);
        const pick = await vscode.window.showQuickPick(
            [{ label: '添加扩展名…' }, { label: '重置为默认扩展名列表' }],
            { placeHolder: `当前支持: ${extensions.join(' ')}` }
        );
        if (!pick) {
            return;
        }
        if (pick.label === '重置为默认扩展名列表') {
            await config.update('fileExtensions',
                ['.sql', '.fnc', '.fcn', '.prc', '.pks', '.pkb', '.pck', '.typ'],
                vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('已重置为默认扩展名列表');
            return;
        }
        const input = await vscode.window.showInputBox({
            prompt: '输入文件扩展名（以 . 开头，如 .tbl）',
            placeHolder: '.tbl'
        });
        const ext = input?.trim().toLowerCase();
        if (!ext || !ext.startsWith('.') || ext.length < 2) {
            if (ext !== undefined) {
                vscode.window.showWarningMessage('扩展名格式无效');
            }
            return;
        }
        if (!extensions.includes(ext)) {
            await config.update('fileExtensions', [...extensions, ext], vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`已添加 ${ext}`);
        }
    }

    /* ------------------------------------------------------------ */
    /* selectAndRevealTarget 辅助（自原 TreeViewManager 迁移）         */
    /* ------------------------------------------------------------ */

    private buildNodeDisplayItem(n: ParseNode): TreeItemData {
        let label: string;
        if (isCallableNode(n)) {
            label = this.provider.getDeclareNodeLabel(n);
        } else if (this.provider.isControlStructureType(n.type)) {
            label = this.provider.getSimplifiedControlLabel(n.type);
        } else if (n.type === NodeType.ANONYMOUS_BLOCK) {
            label = 'Anonymous Block';
        } else {
            label = this.provider.getNodeLabel(n);
        }
        return { node: n, isStructureBlock: false, label, line: n.declarationLine };
    }

    private getStructureBlockTypeEnum(blockType: string): StructureBlockType {
        if (blockType === 'BEGIN') {
            return StructureBlockType.BEGIN;
        }
        if (blockType === 'EXCEPTION') {
            return StructureBlockType.EXCEPTION;
        }
        return StructureBlockType.END;
    }

    private getStructureBlockLine(node: ParseNode, blockType: string): number {
        if (blockType === 'BEGIN') {
            return node.beginLine ?? node.declarationLine;
        }
        if (blockType === 'EXCEPTION') {
            return node.exceptionLine ?? node.endLine ?? node.declarationLine;
        }
        return node.endLine ?? node.declarationLine;
    }

    dispose(): void {
        for (const d of this.disposables) {
            d.dispose();
        }
    }

    /* ------------------------------------------------------------ */
    /* webview HTML（输入框 + HTML 树 + 键盘导航，样式走主题变量）      */
    /* ------------------------------------------------------------ */

    private buildHtml(): string {
        const nonce = require('crypto').randomBytes(16).toString('hex');
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src ${this.view?.webview.cspSource ?? ''} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src data:;">
<style>
    :root { --row-h: 22px; }
    * { box-sizing: border-box; }
    body {
        margin: 0; padding: 0;
        font-family: var(--vscode-font-family);
        font-size: var(--vscode-font-size, 13px);
        color: var(--vscode-sideBar-foreground, var(--vscode-foreground));
        background: var(--vscode-sideBar-background, transparent);
    }
    .searchbar { display: flex; align-items: center; gap: 2px; padding: 4px 8px 6px 8px; }
    #q {
        flex: 1; min-width: 0; padding: 3px 6px;
        border: 1px solid var(--vscode-input-border, transparent);
        border-radius: 2px; outline: none;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        font-family: inherit; font-size: 13px;
    }
    #q:focus { border-color: var(--vscode-focusBorder); }
    #q::placeholder { color: var(--vscode-input-placeholderForeground); }
    #count {
        font-size: 11px; color: var(--vscode-descriptionForeground);
        padding: 0 4px; white-space: nowrap; visibility: hidden;
    }
    #tree { outline: none; padding-bottom: 40px; }
    .row {
        display: flex; align-items: center;
        height: var(--row-h); line-height: var(--row-h);
        white-space: nowrap; cursor: pointer; user-select: none;
        content-visibility: auto; contain-intrinsic-size: auto var(--row-h);
    }
    .row:hover { background: var(--vscode-list-hoverBackground); }
    .row.selected { background: var(--vscode-list-activeSelectionBackground); }
    .row.selected .label { color: var(--vscode-list-activeSelectionForeground); }
    .row .chev {
        width: 16px; flex: none; text-align: center;
        color: var(--vscode-descriptionForeground);
        font-size: 10px; transition: transform .08s;
    }
    .chev.collapsed { transform: rotate(-90deg); }
    .chev.leaf { visibility: hidden; }
    .row img { width: 16px; height: 16px; margin-right: 4px; flex: none; }
    .row .label { overflow: hidden; text-overflow: ellipsis; }
    .row .desc {
        margin-left: 8px; color: var(--vscode-descriptionForeground);
        font-size: 11px; overflow: hidden; text-overflow: ellipsis; flex: none; max-width: 45%;
    }
    .kids { margin-left: 16px; border-left: 1px solid var(--vscode-tree-indentGuidesStroke, transparent); }
    .kids.hidden { display: none; }
    .empty { padding: 12px 16px; color: var(--vscode-descriptionForeground); }
    #tooltip {
        position: fixed; z-index: 40; max-width: 480px;
        background: var(--vscode-editorWidget-background, #252526);
        border: 1px solid var(--vscode-editorWidget-border, #454545);
        color: var(--vscode-editorWidget-foreground, #cccccc);
        padding: 8px 10px; font-size: 12px; line-height: 1.6;
        white-space: pre-wrap; display: none;
        box-shadow: 0 2px 8px rgba(0,0,0,.4);
    }
    #ctxmenu {
        position: fixed; z-index: 50; min-width: 160px;
        background: var(--vscode-menu-background, var(--vscode-editorWidget-background, #252526));
        border: 1px solid var(--vscode-menu-border, var(--vscode-editorWidget-border, #454545));
        box-shadow: 0 2px 10px rgba(0,0,0,.45); display: none; padding: 3px 0;
    }
    #ctxmenu .mi {
        padding: 4px 14px; font-size: 13px; cursor: pointer; white-space: nowrap;
    }
    #ctxmenu .mi:hover { background: var(--vscode-menu-selectionBackground, var(--vscode-list-hoverBackground)); }
</style>
</head>
<body>
<div class="searchbar" id="box">
    <input id="q" type="text" placeholder="搜索方法/过程名…" />
    <span id="count"></span>
</div>
<div id="tree" tabindex="0"></div>
<div id="tooltip"></div>
<div id="ctxmenu"><div class="mi" id="mi-copy">复制名称</div></div>
<script nonce="${nonce}">
(function () {
    const vscode = acquireVsCodeApi();
    const input = document.getElementById('q');
    const countEl = document.getElementById('count');
    const treeEl = document.getElementById('tree');
    const tooltipEl = document.getElementById('tooltip');
    const ctxMenu = document.getElementById('ctxmenu');

    let icons = {};                 // 图标名 → {light, dark}
    let expansion = new Map();      // id → bool（用户展开状态）
    let selectedId = null;
    let visibleRows = [];           // 键盘导航用的可见行快照

    const isDark = () => document.body.classList.contains('vscode-dark') ||
                       document.body.classList.contains('vscode-high-contrast');
    const iconSrc = (name) => {
        const pair = icons[name];
        if (!pair) { return ''; }
        return isDark() ? pair.dark : pair.light;
    };
    const state = vscode.getState() || { filter: '' };
    if (state.filter) { input.value = state.filter; }

    /* ---------- 渲染 ---------- */
    function render(nodes) {
        treeEl.innerHTML = '';
        visibleRows = [];
        if (!nodes || nodes.length === 0) {
            const div = document.createElement('div');
            div.className = 'empty';
            div.textContent = state.filter ? '无匹配项' : '暂无解析结果';
            treeEl.appendChild(div);
            return;
        }
        for (const n of nodes) { treeEl.appendChild(buildNode(n, 0)); }
        if (selectedId) {
            const row = treeEl.querySelector('.row[data-id="' + cssEscape(selectedId) + '"]');
            if (row) { row.classList.add('selected'); }
        }
    }

    function buildNode(node, depth) {
        const wrap = document.createDocumentFragment();

        const row = document.createElement('div');
        row.className = 'row';
        row.dataset.id = node.id;
        row.dataset.depth = depth;

        const chev = document.createElement('span');
        const hasKids = node.children && node.children.length > 0;
        const expanded = expansion.has(node.id)
            ? expansion.get(node.id)
            : node.collapsible === 2;
        chev.className = 'chev' + (hasKids ? (expanded ? '' : ' collapsed') : ' leaf');
        chev.textContent = '\\u25BE';
        row.appendChild(chev);

        if (node.icon) {
            const img = document.createElement('img');
            img.src = iconSrc(node.icon);
            row.appendChild(img);
        }

        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = node.label;
        row.appendChild(label);

        if (node.description) {
            const desc = document.createElement('span');
            desc.className = 'desc';
            desc.textContent = node.description;
            row.appendChild(desc);
        }
        if (node.tooltip) { row.dataset.tooltip = node.tooltip; }
        wrap.appendChild(row);

        if (hasKids) {
            const kids = document.createElement('div');
            kids.className = 'kids' + (expanded ? '' : ' hidden');
            for (const child of node.children) { kids.appendChild(buildNode(child, depth + 1)); }
            wrap.appendChild(kids);
            chev.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleKids(node.id, kids, chev);
            });
        }
        row.addEventListener('click', () => {
            selectRow(row, false);
            vscode.postMessage({ type: 'click', id: node.id });
        });
        row.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showCtxMenu(e.clientX, e.clientY, node.id);
        });
        return wrap;
    }

    function toggleKids(id, kidsEl, chevEl) {
        const nowHidden = kidsEl.classList.toggle('hidden');
        chevEl.classList.toggle('collapsed', nowHidden);
        expansion.set(id, !nowHidden);
        refreshVisibleRows();
    }

    function selectRow(row, scroll) {
        treeEl.querySelectorAll('.row.selected').forEach(r => r.classList.remove('selected'));
        if (row) {
            row.classList.add('selected');
            selectedId = row.dataset.id;
            if (scroll) { row.scrollIntoView({ block: 'nearest' }); }
        }
        refreshVisibleRows();
    }

    function refreshVisibleRows() {
        visibleRows = Array.from(treeEl.querySelectorAll('.row')).filter(r => r.offsetParent !== null);
    }

    function cssEscape(s) {
        return (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/[^a-zA-Z0-9_-]/g, '\\\\$&');
    }

    /* ---------- 键盘导航 ---------- */
    treeEl.addEventListener('keydown', (e) => {
        if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter'].indexOf(e.key) < 0) { return; }
        e.preventDefault(); e.stopPropagation();
        if (visibleRows.length === 0) { refreshVisibleRows(); if (visibleRows.length === 0) { return; } }
        let idx = visibleRows.findIndex(r => r.dataset.id === selectedId);
        if (idx < 0) { idx = 0; selectRow(visibleRows[0], true); return; }
        const row = visibleRows[idx];
        if (e.key === 'ArrowDown' && idx < visibleRows.length - 1) {
            selectRow(visibleRows[idx + 1], true);
        } else if (e.key === 'ArrowUp' && idx > 0) {
            selectRow(visibleRows[idx - 1], true);
        } else if (e.key === 'Enter') {
            vscode.postMessage({ type: 'click', id: row.dataset.id });
        } else if (e.key === 'ArrowRight') {
            const kids = row.nextElementSibling;
            if (kids && kids.classList.contains('kids')) {
                if (kids.classList.contains('hidden')) {
                    toggleKids(row.dataset.id, kids, row.querySelector('.chev'));
                } else if (visibleRows[idx + 1]) {
                    selectRow(visibleRows[idx + 1], true);
                }
            }
        } else if (e.key === 'ArrowLeft') {
            const kids = row.nextElementSibling;
            if (kids && kids.classList.contains('kids') && !kids.classList.contains('hidden')) {
                toggleKids(row.dataset.id, kids, row.querySelector('.chev'));
            } else {
                // 已折叠/叶子：回到父节点行
                let p = row.parentElement;
                while (p && !p.classList.contains('kids')) { p = p.parentElement; }
                if (p) {
                    const parentRow = p.previousElementSibling;
                    if (parentRow && parentRow.classList.contains('row')) { selectRow(parentRow, true); }
                }
            }
        }
    });

    /* ---------- 搜索 ---------- */
    let timer = null;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            state.filter = input.value;
            vscode.setState(state);
            vscode.postMessage({ type: 'filter', text: input.value });
        }, 200);
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(timer);
            vscode.setState({ filter: input.value });
            vscode.postMessage({ type: 'filter', text: input.value });
            treeEl.focus();
        } else if (e.key === 'Escape') {
            input.value = '';
            state.filter = '';
            vscode.setState(state);
            vscode.postMessage({ type: 'filter', text: '' });
        }
    });

    /* ---------- 悬浮信息卡 ---------- */
    let hoverTimer = null; let hoverRow = null;
    treeEl.addEventListener('mouseover', (e) => {
        const row = e.target.closest('.row');
        if (row === hoverRow) { return; }
        hideTooltip();
        hoverRow = row;
        if (row && row.dataset.tooltip) {
            hoverTimer = setTimeout(() => showTooltip(row), 400);
        }
    });
    treeEl.addEventListener('mouseout', () => { hideTooltip(); });
    function showTooltip(row) {
        tooltipEl.textContent = row.dataset.tooltip;
        tooltipEl.style.display = 'block';
        const rect = row.getBoundingClientRect();
        const w = tooltipEl.offsetWidth, h = tooltipEl.offsetHeight;
        let x = rect.right + 8, y = rect.top;
        if (x + w > window.innerWidth - 8) { x = Math.max(8, window.innerWidth - w - 8); }
        if (y + h > window.innerHeight - 8) { y = Math.max(8, window.innerHeight - h - 8); }
        tooltipEl.style.left = x + 'px'; tooltipEl.style.top = y + 'px';
    }
    function hideTooltip() {
        clearTimeout(hoverTimer); hoverRow = null;
        tooltipEl.style.display = 'none';
    }

    /* ---------- 右键菜单 ---------- */
    let ctxId = null;
    function showCtxMenu(x, y, id) {
        ctxId = id;
        ctxMenu.style.display = 'block';
        ctxMenu.style.left = Math.min(x, window.innerWidth - 170) + 'px';
        ctxMenu.style.top = Math.min(y, window.innerHeight - 60) + 'px';
    }
    document.addEventListener('click', () => { ctxMenu.style.display = 'none'; });
    document.getElementById('mi-copy').addEventListener('click', () => {
        if (ctxId) { vscode.postMessage({ type: 'copy', id: ctxId }); }
        ctxMenu.style.display = 'none';
    });

    /* ---------- 扩展消息 ---------- */
    window.addEventListener('message', (event) => {
        const msg = event.data;
        if (msg.type === 'model') {
            icons = msg.icons || {};
            if (typeof msg.filter === 'string' && msg.filter !== input.value) {
                input.value = msg.filter;
                state.filter = msg.filter;
                vscode.setState(state);
            }
            if (msg.filterCount !== undefined) {
                countEl.textContent = msg.filterCount + ' 命中';
                countEl.style.visibility = 'visible';
            } else {
                countEl.style.visibility = 'hidden';
            }
            render(msg.nodes);
        } else if (msg.type === 'select') {
            // 光标跟随：模型是全量子树（折叠仅隐藏），行必在 DOM 中——
            // 展开祖先链、滚动并高亮
            const target = treeEl.querySelector('.row[data-id="' + cssEscape(msg.id) + '"]');
            if (target) {
                let p = target.parentElement;
                while (p && p !== treeEl) {
                    if (p.classList.contains('kids')) {
                        p.classList.remove('hidden');
                        const prev = p.previousElementSibling;
                        if (prev && prev.classList.contains('row')) {
                            const ch = prev.querySelector('.chev');
                            if (ch) { ch.classList.remove('collapsed'); }
                            expansion.set(prev.dataset.id, true);
                        }
                    }
                    p = p.parentElement;
                }
                refreshVisibleRows();
                selectRow(target, true);
            }
        }
    });

    vscode.postMessage({ type: 'ready' });
})();
</script>
</body>
</html>`;
    }
}

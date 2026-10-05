/**
 * 书签管理器（vscode 集成层，Issue：书签功能 v1.17.0）
 *
 * 职责：书签增删改查 + workspaceState 持久化 + 编辑器装饰（gutter 图标 /
 * 行高亮 / 滚动条标记 / 悬停信息卡）+ 行号单击切换 + Ctrl+Alt+K 光标行切换 +
 * QuickPick 跳转 + 下一/上一书签 + 文档编辑行号跟随 + 文件重命名/删除跟随。
 *
 * 交互事实（2026-10-06 实测，SendInput + 事件轨迹）：VS Code 对"选区值完全
 * 相同"的点击**不派发任何选区事件**——双击行号的第二击零事件，双击与单击在
 * API 层不可区分（双击检测不可实现）。因此交互为：**单击未选中的行号 = 切换
 * 书签**（无签→建、有签→删；建签不弹表单，名称默认行内容）；编辑走悬停卡/
 * 右键菜单/书签视图/命令。同选区重复点击零事件=无操作（天然防误触）。
 *
 * 纯逻辑（跟随算法 / 所属与摘要）在 src/bookmarks.ts（vscode-free，单测直连）。
 *
 * 行号口径：BookmarkData.line 为 0-based，显示时 +1。
 */
import * as vscode from 'vscode';
import * as path from 'path';
import {
    BookmarkData,
    BookmarkContentChange,
    applyDocumentChanges,
    findEnclosingSymbol,
    buildSummaryChain,
    defaultBookmarkName,
    previewLineText,
    enclosingSymbolLabel
} from './bookmarks';
import { ParseResult } from './types';

/** workspaceState 持久化键（v1 结构） */
const STORAGE_KEY = 'plsqlOutline.bookmarks.v1';

/** 悬停信息卡命令链接的受信命令白名单 */
const HOVER_ENABLED_COMMANDS = ['plsqlOutline.bookmark.edit', 'plsqlOutline.bookmark.delete'];

interface StoredFileEntry {
    line: number;
    name: string;
    note: string;
    createdAt: number;
}

interface StoredState {
    v: 1;
    files: Record<string, StoredFileEntry[]>;
}

export class BookmarkManager implements vscode.Disposable {
    /** 文件 URI 字符串 → 书签列表（按行号升序） */
    private files: Map<string, BookmarkData[]> = new Map();

    /** 深浅主题两套装饰（gutter 图标随主题切换；行高亮/滚动条标记共用样式） */
    private darkDecoration: vscode.TextEditorDecorationType;
    private lightDecoration: vscode.TextEditorDecorationType;
    private useLightTheme = false;

    /** glyphMargin 未开启的提示只弹一次（会话级） */
    private glyphMarginNotified = false;

    private readonly disposables: vscode.Disposable[] = [];
    private readonly _onDidChange = new vscode.EventEmitter<void>();
    /** 书签集变化（增删改/行号迁移/文件重命名删除）——管理视图与徽标订阅 */
    readonly onDidChange: vscode.Event<void> = this._onDidChange.event;

    /** 取当前大纲解析结果（所属/摘要实时计算；可能属于其他文件，使用前校验来源） */
    private readonly getParseResult: () => ParseResult | null;
    /** 与 extension.isPLSQLFile 同口径的文档谓词 */
    private readonly isPLSQLDoc: (doc: vscode.TextDocument) => boolean;
    /** 选区事件轨迹开关（plsql-outline.debug.enabled） */
    private readonly traceEnabled: boolean =
        vscode.workspace.getConfiguration('plsql-outline').get('debug.enabled', false);
    /** 表单重入保护：已有表单流程进行中时忽略新的打开请求 */
    private formOpen: boolean = false;

    constructor(
        context: vscode.ExtensionContext,
        getParseResult: () => ParseResult | null,
        isPLSQLDoc: (doc: vscode.TextDocument) => boolean
    ) {
        this.getParseResult = getParseResult;
        this.isPLSQLDoc = isPLSQLDoc;
        this.storage = context.workspaceState;

        this.darkDecoration = vscode.window.createTextEditorDecorationType({
            gutterIconPath: BookmarkManager.iconUri('bookmark'),
            isWholeLine: true,
            backgroundColor: 'rgba(240,192,64,0.10)',
            overviewRulerColor: 'rgba(240,192,64,0.80)',
            overviewRulerLane: vscode.OverviewRulerLane.Right
        });
        this.lightDecoration = vscode.window.createTextEditorDecorationType({
            gutterIconPath: BookmarkManager.iconUri('bookmark-light'),
            isWholeLine: true,
            backgroundColor: 'rgba(200,136,26,0.12)',
            overviewRulerColor: 'rgba(200,136,26,0.80)',
            overviewRulerLane: vscode.OverviewRulerLane.Right
        });
        this.useLightTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light;

        this.load(context);
        this.registerCommands(context);
        this.registerEventListeners(context);

        // 初始装饰：激活时已打开的可见编辑器
        for (const editor of vscode.window.visibleTextEditors) {
            this.applyDecorations(editor);
        }
    }

    /** res/icons/ 与 treeView.PLSQLOutlineProvider 同一解析口径（out/ → ../res/icons） */
    private static ICONS_DIR = path.join(__dirname, '..', 'res', 'icons');

    private static iconUri(name: string): vscode.Uri {
        return vscode.Uri.file(path.join(BookmarkManager.ICONS_DIR, `${name}.svg`));
    }

    /* ---------------------------------------------------------------- */
    /* 持久化                                                            */
    /* ---------------------------------------------------------------- */

    private load(context: vscode.ExtensionContext): void {
        const stored = context.workspaceState.get<StoredState>(STORAGE_KEY);
        if (!stored || stored.v !== 1 || !stored.files) {
            return;
        }
        for (const [uri, entries] of Object.entries(stored.files)) {
            if (!Array.isArray(entries)) {
                continue;
            }
            const list = entries
                .filter(e => e && typeof e.line === 'number' && e.line >= 0)
                .map(e => ({
                    line: e.line,
                    name: typeof e.name === 'string' ? e.name : '',
                    note: typeof e.note === 'string' ? e.note : '',
                    createdAt: typeof e.createdAt === 'number' ? e.createdAt : 0
                }));
            if (list.length > 0) {
                this.files.set(uri, list.sort((a, b) => a.line - b.line));
            }
        }
    }

    /** 书签操作即时落盘（无防抖，避免崩溃丢失） */
    private save(): void {
        void this.saveAsync();
    }

    private async saveAsync(): Promise<void> {
        const state: StoredState = { v: 1, files: {} };
        for (const [uri, list] of this.files) {
            if (list.length > 0) {
                state.files[uri] = list;
            }
        }
        await this.storage.update(STORAGE_KEY, state);
    }

    private readonly storage: vscode.Memento;

    /* ---------------------------------------------------------------- */
    /* 查询（管理视图 / 表单 / 测试共用）                                  */
    /* ---------------------------------------------------------------- */

    /** 某文件的书签（按行号升序的拷贝） */
    getBookmarks(uri: vscode.Uri): BookmarkData[] {
        return [...(this.files.get(uri.toString()) || [])].sort((a, b) => a.line - b.line);
    }

    /** 全工作区书签文件快照（管理视图用；按 URI 排序的稳定拷贝） */
    getFileSnapshot(): Array<{ uri: vscode.Uri; bookmarks: BookmarkData[] }> {
        return [...this.files.entries()]
            .filter(([, list]) => list.length > 0)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([uri, list]) => ({
                uri: vscode.Uri.parse(uri),
                bookmarks: [...list].sort((a, b) => a.line - b.line)
            }));
    }

    /** 全工作区书签总数（视图徽标） */
    getTotalCount(): number {
        let n = 0;
        for (const list of this.files.values()) {
            n += list.length;
        }
        return n;
    }

    findBookmark(uri: vscode.Uri, line: number): BookmarkData | undefined {
        return (this.files.get(uri.toString()) || []).find(b => b.line === line);
    }

    /* ---------------------------------------------------------------- */
    /* 书签操作                                                          */
    /* ---------------------------------------------------------------- */

    /**
     * 切换书签（行号单击 / Ctrl+Alt+K / 右键菜单共用）：
     * 无签 → 创建（名称默认行内容预览，**不弹表单**——编辑走悬停卡/右键/书签视图）；
     * 有签 → 删除。
     * @returns 操作后该文件的书签列表（供测试断言）
     */
    toggle(editor: vscode.TextEditor, line: number): BookmarkData[] | null {
        const uri = editor.document.uri;
        const key = uri.toString();
        const list = this.files.get(key) || [];
        const existing = list.findIndex(b => b.line === line);

        if (existing >= 0) {
            list.splice(existing, 1);
            this.files.set(key, list);
            this.afterChange();
            return [...list];
        }

        if (line < 0 || line >= editor.document.lineCount) {
            return [...list];
        }
        list.push({ line, name: '', note: '', createdAt: Date.now() });
        list.sort((a, b) => a.line - b.line);
        this.files.set(key, list);
        this.afterChange();

        // gutter 图标依赖 glyph margin（VS Code 默认开启）；用户关闭时提示一次
        this.checkGlyphMargin(editor);
        return [...list];
    }

    /** 删除指定行书签（悬停链接/菜单/视图用） */
    removeAt(uri: vscode.Uri, line: number): boolean {
        const key = uri.toString();
        const list = this.files.get(key) || [];
        const idx = list.findIndex(b => b.line === line);
        if (idx < 0) {
            return false;
        }
        list.splice(idx, 1);
        this.files.set(key, list);
        this.afterChange();
        return true;
    }

    /** 清除某文件全部书签 */
    clearFile(uri: vscode.Uri): number {
        const key = uri.toString();
        const list = this.files.get(key) || [];
        const removed = list.length;
        this.files.delete(key);
        if (removed > 0) {
            this.afterChange();
        }
        return removed;
    }

    /** 变更后统一收口：落盘 + 刷新装饰 + 通知视图 */
    private afterChange(): void {
        this.save();
        for (const editor of vscode.window.visibleTextEditors) {
            this.applyDecorations(editor);
        }
        this._onDidChange.fire();
    }

    /* ---------------------------------------------------------------- */
    /* 信息表单（两步 InputBox：名称 → 备注）                              */
    /* ---------------------------------------------------------------- */

    /**
     * 弹出书签信息表单（两步 showInputBox：名称 → 备注）。
     * 名称/备注均非必填：
     *  - 第 1 步回车进入第 2 步，第 2 步回车保存；
     *  - Esc / 点击编辑器空白处（ignoreFocusOut=false 失焦即关）= 取消编辑，
     *    保留原有值；新建场景即回退默认名（行内容预览）。
     *
     * 用 window.showInputBox 而非 createInputBox：实机测试发现 createInputBox
     * .show() 在命令/事件路径下焦点会被编辑器抢回（输入落进代码），
     * showInputBox 的焦点由工作台保证（与 F2 重命名同级）。
     */
    private async showInfoForm(uri: vscode.Uri, line: number): Promise<void> {
        if (this.formOpen) {
            return; // 已有表单流程进行中（快速连点/双路径触发）
        }
        const bookmark = this.findBookmark(uri, line);
        if (!bookmark) {
            return;
        }
        this.formOpen = true;
        try {
            const name = await vscode.window.showInputBox({
                title: '编辑书签',
                prompt: '第 1/2 步 · 书签名称（可留空，留空显示行内容预览）',
                placeHolder: defaultBookmarkName(this.lineTextOf(uri, line)),
                value: bookmark.name
            });
            if (name === undefined) {
                return; // Esc / 点击空白取消：保留原值
            }
            const note = await vscode.window.showInputBox({
                title: '编辑书签',
                prompt: '第 2/2 步 · 书签备注（可留空）',
                value: bookmark.note
            });
            if (note === undefined) {
                // 第 2 步取消：仅保存已确认的名称（第 1 步是用户显式回车确认过的）
                if (name.trim() !== bookmark.name) {
                    bookmark.name = name.trim();
                    this.afterChange();
                }
                return;
            }
            bookmark.name = name.trim();
            bookmark.note = note.trim();
            this.afterChange();
        } finally {
            this.formOpen = false;
        }
    }

    /** 取某文件某行文本（文件未打开时返回空串，表单占位符退化为空） */
    private lineTextOf(uri: vscode.Uri, line: number): string {
        const doc = vscode.workspace.textDocuments.find(d => d.uri.toString() === uri.toString());
        if (!doc || line >= doc.lineCount) {
            return '';
        }
        return doc.lineAt(line).text;
    }

    /* ---------------------------------------------------------------- */
    /* 装饰（gutter 图标 + 行高亮 + 滚动条标记 + 悬停信息卡）               */
    /* ---------------------------------------------------------------- */

    private applyDecorations(editor: vscode.TextEditor): void {
        const key = editor.document.uri.toString();
        const list = this.files.get(key) || [];

        // 两套装饰只保留当前主题的一套（切换主题后清掉另一套的旧装饰）
        const active = this.useLightTheme ? this.lightDecoration : this.darkDecoration;
        const inactive = this.useLightTheme ? this.darkDecoration : this.lightDecoration;
        editor.setDecorations(inactive, []);

        if (list.length === 0) {
            editor.setDecorations(active, []);
            return;
        }

        const options: vscode.DecorationOptions[] = list
            .filter(b => b.line < editor.document.lineCount)
            .map(b => ({
                // 行起点零宽区间：绝不触及下一行（区间吞换行符时 VS Code 会把
                // gutter 图标渗染到下一行行首——实机用户报告一次点击双图标）；
                // 整行淡琥珀背景由装饰类型的 isWholeLine 负责
                range: new vscode.Range(b.line, 0, b.line, 0),
                hoverMessage: this.buildHoverMessage(editor.document, b)
            }));
        editor.setDecorations(active, options);
    }

    /** 悬停信息卡：名称/备注/行内容/行号/所属/摘要 + 编辑/删除命令链接 */
    private buildHoverMessage(doc: vscode.TextDocument, bookmark: BookmarkData): vscode.MarkdownString {
        const lineText = doc.lineAt(bookmark.line).text;
        const name = bookmark.name || defaultBookmarkName(lineText);
        const preview = previewLineText(lineText);
        const parse = this.getParseResultForDocument(doc);
        let symbol = '（顶层）';
        let chain = '';
        if (parse) {
            const line1 = bookmark.line + 1;
            symbol = enclosingSymbolLabel(findEnclosingSymbol(parse.nodes, line1));
            chain = buildSummaryChain(parse.nodes, line1);
        }
        const args = encodeURIComponent(JSON.stringify([doc.uri.toString(), bookmark.line]));
        const editLink = `[✏️ 编辑书签…](command:plsqlOutline.bookmark.edit?${args})`;
        const deleteLink = `[🗑 删除书签](command:plsqlOutline.bookmark.delete?${args})`;

        const lines: string[] = [`**★ ${name}**`];
        if (bookmark.note) {
            lines.push(`备注：${bookmark.note}`);
        }
        if (preview) {
            lines.push(`行内容：\`${preview.replace(/`/g, "'")}\``);
        }
        lines.push(`行号：${bookmark.line + 1} · 所属：${symbol}`);
        if (chain) {
            lines.push(`摘要：${chain}`);
        }
        lines.push('---');
        lines.push(`${editLink}　${deleteLink}`);

        const md = new vscode.MarkdownString(lines.join('\n\n'));
        md.isTrusted = { enabledCommands: HOVER_ENABLED_COMMANDS };
        md.supportHtml = true;
        return md;
    }

    /** 解析结果与目标文档同源才可用（currentParseResult 可能属于其他文件）；
     *  公有：管理视图按文件降级取所属/摘要 */
    getParseResultForDocument(doc: vscode.TextDocument): ParseResult | null {
        const parse = this.getParseResult();
        if (!parse || parse.metadata.sourceFile !== doc.fileName) {
            return null;
        }
        return parse;
    }

    /* ---------------------------------------------------------------- */
    /* 事件                                                              */
    /* ---------------------------------------------------------------- */

    private registerEventListeners(context: vscode.ExtensionContext): void {
        // 行号/gutter 点击判定：整行 Mouse 选中（点击行号的原生效果）喂给状态机；
        // 表单打开期间任何 Mouse 选中 = 点击空白处 → 取消表单
        const selectionListener = vscode.window.onDidChangeTextEditorSelection(
            (event) => this.onSelectionChanged(event));
        const documentListener = vscode.workspace.onDidChangeTextDocument(
            (event) => this.onDocumentChanged(event));
        const activeListener = vscode.window.onDidChangeActiveTextEditor(
            (editor) => {
                if (editor) {
                    this.applyDecorations(editor);
                }
            });
        const visibleListener = vscode.window.onDidChangeVisibleTextEditors(
            (editors) => {
                for (const editor of editors) {
                    this.applyDecorations(editor);
                }
            });
        const themeListener = vscode.window.onDidChangeActiveColorTheme(
            (theme) => {
                this.useLightTheme = theme.kind === vscode.ColorThemeKind.Light;
                for (const editor of vscode.window.visibleTextEditors) {
                    this.applyDecorations(editor);
                }
            });
        const renameListener = vscode.workspace.onDidRenameFiles(
            (event) => this.onFilesRenamed(event));
        const deleteListener = vscode.workspace.onDidDeleteFiles(
            (event) => this.onFilesDeleted(event));
        const openListener = vscode.workspace.onDidOpenTextDocument(
            (doc) => this.onDocumentOpened(doc));

        this.disposables.push(
            selectionListener, documentListener, activeListener, visibleListener,
            themeListener, renameListener, deleteListener, openListener,
            this.darkDecoration, this.lightDecoration, this._onDidChange);
        context.subscriptions.push(...this.disposables);
    }

    private onSelectionChanged(event: vscode.TextEditorSelectionChangeEvent): void {
        if (event.kind !== vscode.TextEditorSelectionChangeKind.Mouse) {
            // 键盘/程序化选区变化与行号点击无关
            return;
        }
        if (!this.isPLSQLDoc(event.textEditor.document)) {
            return;
        }

        const selection = event.selections.length === 1 ? event.selections[0] : null;
        if (!selection || selection.isEmpty) {
            // 点击正文塌陷选区等：与行号切换无关（单击建签已删后，同选区重复
            // 点击零事件=无操作，平台天然防误触）
            this.traceSelection('collapse', selection ? selection.active.line : -1, event);
            return;
        }
        const a = selection.start;
        const b = selection.end;
        // 整行选中签名：[line,0) → [line+1,0)（点击行号/gutter 的原生效果）
        const isFullLineSelection = b.line === a.line + 1 && b.character === 0;
        if (!isFullLineSelection) {
            this.traceSelection('other', selection.active.line, event);
            return;
        }

        // 幽灵切换防护：窗口失焦/关闭瞬间 VS Code 偶发重放整行选区事件
        // （kind=Mouse，实机两次捕获：窗口 WM_CLOSE 时、前台切换空档），会凭空
        // 建签。真实行号点击必然发生在聚焦窗口 → 失焦期间一律忽略
        if (vscode.window.state && vscode.window.state.focused === false) {
            this.traceSelection('full-line-unfocused', a.line, event);
            return;
        }

        // 单击未选中的行号 → 必产生此事件（实测唯一可靠信号）→ 直接切换书签
        this.traceSelection('full-line', a.line, event);
        this.toggle(event.textEditor, a.line);
    }

    /** 调试轨迹（plsql-outline.debug.enabled 时把选区事件形态追加写入临时日志，
     *  供行号双击等交互问题在真实环境定位：TEMP/plsql-outline-sel-trace.log） */
    private traceSelection(kind: string, line: number, event: vscode.TextEditorSelectionChangeEvent): void {
        if (!this.traceEnabled) {
            return;
        }
        const sel = event.selections[0];
        const winState = vscode.window.state as { focused?: boolean } | undefined;
        const entry = `[bookmark-sel] ${new Date().toISOString()} ${kind} line=${line + 1} ` +
            `focused=${winState && winState.focused === false ? 0 : 1} ` +
            `sel=${sel.start.line}:${sel.start.character}-${sel.end.line}:${sel.end.character}\n`;
        const os = require('os');
        const fs = require('fs');
        const pathMod = require('path');
        try {
            fs.appendFileSync(pathMod.join(os.tmpdir(), 'plsql-outline-sel-trace.log'), entry);
        } catch {
            // 日志失败不影响功能
        }
    }

    private onDocumentChanged(event: vscode.TextDocumentChangeEvent): void {
        const key = event.document.uri.toString();
        const list = this.files.get(key);
        if (!list || list.length === 0 || event.contentChanges.length === 0) {
            return;
        }
        const changes: BookmarkContentChange[] = event.contentChanges.map(c => ({
            startLine: c.range.start.line,
            startChar: c.range.start.character,
            endLine: c.range.end.line,
            endChar: c.range.end.character,
            text: c.text
        }));
        const result = applyDocumentChanges(list, changes, event.document.lineCount);
        this.files.set(key, result.kept);
        this.save();
        for (const editor of vscode.window.visibleTextEditors) {
            if (editor.document.uri.toString() === key) {
                this.applyDecorations(editor);
            }
        }
        this._onDidChange.fire();
    }

    /** 外部程序改写文件后重开：书签行号无从精确迁移，防御性裁剪越界行 */
    private onDocumentOpened(doc: vscode.TextDocument): void {
        const key = doc.uri.toString();
        const list = this.files.get(key);
        if (!list || list.length === 0) {
            return;
        }
        const pruned = list.filter(b => b.line < doc.lineCount);
        if (pruned.length !== list.length) {
            this.files.set(key, pruned);
            this.afterChange();
        }
    }

    private onFilesRenamed(event: vscode.FileRenameEvent): void {
        let changed = false;
        for (const { oldUri, newUri } of event.files) {
            const oldKey = oldUri.toString();
            if (this.files.has(oldKey)) {
                this.files.set(newUri.toString(), this.files.get(oldKey)!);
                this.files.delete(oldKey);
                changed = true;
            }
        }
        if (changed) {
            this.afterChange();
        }
    }

    private onFilesDeleted(event: vscode.FileDeleteEvent): void {
        let changed = false;
        for (const uri of event.files) {
            if (this.files.delete(uri.toString())) {
                changed = true;
            }
        }
        if (changed) {
            this.afterChange();
        }
    }

    private checkGlyphMargin(editor: vscode.TextEditor): void {
        if (this.glyphMarginNotified) {
            return;
        }
        const enabled = vscode.workspace.getConfiguration('editor', editor.document)
            .get('glyphMargin', true);
        if (enabled) {
            return;
        }
        this.glyphMarginNotified = true;
        void vscode.window.showInformationMessage(
            '书签图标显示在行号旁的 glyph margin，当前该区域被关闭',
            '启用（工作区）'
        ).then(choice => {
            if (choice === '启用（工作区）') {
                void vscode.workspace.getConfiguration('editor')
                    .update('glyphMargin', true, vscode.ConfigurationTarget.Workspace);
            }
        });
    }

    /* ---------------------------------------------------------------- */
    /* 命令                                                              */
    /* ---------------------------------------------------------------- */

    private registerCommands(context: vscode.ExtensionContext): void {
        const activeEditor = (): vscode.TextEditor | null => {
            const editor = vscode.window.activeTextEditor;
            if (!editor || !this.isPLSQLDoc(editor.document)) {
                vscode.window.showWarningMessage('没有活动的 PL/SQL 编辑器');
                return null;
            }
            return editor;
        };

        /** 命令参数解析：hover 链接/树视图传 (uriString, line)；无参取活动编辑器光标行 */
        const resolveTarget = (args: unknown[]): { uri: vscode.Uri; line: number; editor?: vscode.TextEditor } | null => {
            if (typeof args[0] === 'string' && typeof args[1] === 'number') {
                return { uri: vscode.Uri.parse(args[0]), line: args[1] };
            }
            const editor = activeEditor();
            if (!editor) {
                return null;
            }
            return { uri: editor.document.uri, line: editor.selection.active.line, editor };
        };

        const toggleCommand = vscode.commands.registerCommand(
            'plsqlOutline.bookmark.toggle',
            (...args: unknown[]) => {
                const target = resolveTarget(args);
                if (!target) {
                    return null;
                }
                const editor = target.editor ||
                    vscode.window.visibleTextEditors.find(
                        e => e.document.uri.toString() === target.uri.toString());
                if (!editor) {
                    return null;
                }
                return this.toggle(editor, target.line);
            });

        const editCommand = vscode.commands.registerCommand(
            'plsqlOutline.bookmark.edit',
            (...args: unknown[]) => {
                const target = resolveTarget(args);
                if (!target) {
                    return;
                }
                if (!this.findBookmark(target.uri, target.line)) {
                    vscode.window.showWarningMessage('当前行没有书签');
                    return;
                }
                void this.showInfoForm(target.uri, target.line);
            });

        const deleteCommand = vscode.commands.registerCommand(
            'plsqlOutline.bookmark.delete',
            (...args: unknown[]) => {
                const target = resolveTarget(args);
                if (!target) {
                    return;
                }
                this.removeAt(target.uri, target.line);
            });

        const clearFileCommand = vscode.commands.registerCommand(
            'plsqlOutline.bookmark.clearFile',
            async (...args: unknown[]) => {
                const target = resolveTarget(args);
                if (!target) {
                    return;
                }
                const list = this.getBookmarks(target.uri);
                if (list.length === 0) {
                    vscode.window.showInformationMessage('本文件没有书签');
                    return;
                }
                const choice = await vscode.window.showWarningMessage(
                    `确定清除本文件全部 ${list.length} 个书签？`, { modal: true }, '清除');
                if (choice === '清除') {
                    this.clearFile(target.uri);
                }
            });

        const listCommand = vscode.commands.registerCommand(
            'plsqlOutline.bookmark.list',
            () => this.showQuickPick());

        const nextCommand = vscode.commands.registerCommand(
            'plsqlOutline.bookmark.next',
            () => this.jumpRelative(1));

        const previousCommand = vscode.commands.registerCommand(
            'plsqlOutline.bookmark.previous',
            () => this.jumpRelative(-1));

        const jumpToCommand = vscode.commands.registerCommand(
            'plsqlOutline.bookmark.jumpTo',
            async (uriString: string, line: number) => {
                await this.jumpTo(vscode.Uri.parse(uriString), line);
            });

        // 测试/诊断用：返回全部书签状态（命令面板不暴露）
        const getStateCommand = vscode.commands.registerCommand(
            'plsqlOutline.bookmark.getState',
            () => this.getStateSnapshot());

        context.subscriptions.push(
            toggleCommand, editCommand, deleteCommand, clearFileCommand,
            listCommand, nextCommand, previousCommand, jumpToCommand, getStateCommand);
    }

    /** E2E 断言用状态快照（URI → 书签数组拷贝） */
    getStateSnapshot(): Record<string, BookmarkData[]> {
        const out: Record<string, BookmarkData[]> = {};
        for (const [uri, list] of this.files) {
            out[uri] = [...list];
        }
        return out;
    }

    /* ---------------------------------------------------------------- */
    /* 跳转                                                             */
    /* ---------------------------------------------------------------- */

    /** 浏览全部书签（当前文件，QuickPick 富信息列表） */
    private async showQuickPick(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !this.isPLSQLDoc(editor.document)) {
            vscode.window.showWarningMessage('没有活动的 PL/SQL 编辑器');
            return;
        }
        const uri = editor.document.uri;
        const list = this.getBookmarks(uri);
        if (list.length === 0) {
            vscode.window.showInformationMessage('本文件还没有书签（双击行号即可添加）');
            return;
        }
        const parse = this.getParseResultForDocument(editor.document);

        const items = list.map(bm => {
            const lineText = bm.line < editor.document.lineCount
                ? editor.document.lineAt(bm.line).text : '';
            const name = bm.name || defaultBookmarkName(lineText);
            const symbol = parse
                ? enclosingSymbolLabel(findEnclosingSymbol(parse.nodes, bm.line + 1))
                : '';
            const chain = parse ? buildSummaryChain(parse.nodes, bm.line + 1) : '';
            const detailParts = [symbol, chain ? `摘要：${chain}` : ''];
            if (bm.note) {
                detailParts.push(`备注：${bm.note}`);
            }
            return {
                label: `$(bookmark) ${name}`,
                description: `行 ${bm.line + 1}`,
                detail: [previewLineText(lineText), detailParts.filter(Boolean).join(' · ')]
                    .filter(Boolean).join('\n'),
                line: bm.line
            };
        });

        const picked = await vscode.window.showQuickPick(items, {
            placeHolder: '输入书签名 / 行内容 / 备注过滤，回车跳转',
            matchOnDescription: true,
            matchOnDetail: true
        });
        if (picked) {
            this.revealLine(editor, picked.line);
        }
    }

    /** 下一处（+1）/ 上一处（-1）书签：文件内环绕循环 */
    private jumpRelative(direction: 1 | -1): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor || !this.isPLSQLDoc(editor.document)) {
            vscode.window.showWarningMessage('没有活动的 PL/SQL 编辑器');
            return;
        }
        const list = this.getBookmarks(editor.document.uri);
        if (list.length === 0) {
            vscode.window.showInformationMessage('本文件还没有书签');
            return;
        }
        const cursor = editor.selection.active.line;
        let target: number;
        if (direction > 0) {
            const next = list.find(b => b.line > cursor);
            target = next ? next.line : list[0].line;  // 环绕：越过最后一处回第一处
        } else {
            const prev = [...list].reverse().find(b => b.line < cursor);
            target = prev ? prev.line : list[list.length - 1].line;
        }
        this.revealLine(editor, target);
    }

    /** 跳到某行（视图/悬停链接/QuickPick 共用）：置光标于行首并居中 */
    async jumpTo(uri: vscode.Uri, line: number): Promise<void> {
        const doc = await vscode.workspace.openTextDocument(uri);
        const editor = await vscode.window.showTextDocument(doc);
        this.revealLine(editor, line);
    }

    private revealLine(editor: vscode.TextEditor, line: number): void {
        const safeLine = Math.max(0, Math.min(line, editor.document.lineCount - 1));
        const pos = new vscode.Position(safeLine, 0);
        editor.selection = new vscode.Selection(pos, pos);
        editor.revealRange(
            new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter);
    }

    /* ---------------------------------------------------------------- */
    /* 生命周期                                                          */
    /* ---------------------------------------------------------------- */

    dispose(): void {
        for (const d of this.disposables) {
            d.dispose();
        }
    }
}

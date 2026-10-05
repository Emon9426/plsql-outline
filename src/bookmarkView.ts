/**
 * 书签管理视图（活动栏 PL/SQL 大纲容器内「书签」树，Issue：书签功能 v1.17.0）
 *
 * 全工作区书签总览：按文件分组（文件节点带书签数描述），子节点 = 书签
 * （图标 + 名称/行内容预览 + `L行号 · 所属子程序` 描述）。点击书签 =
 * 打开文件并跳转；右键：编辑书签信息… / 删除书签。容器徽标显示书签总数。
 *
 * 数据源全部来自 BookmarkManager（单一事实源），订阅其 onDidChange 刷新。
 * 所属/摘要依赖大纲解析结果——仅当目标文件恰为当前已解析文件时可得，
 * 其余场景降级为仅显示行号（打开该文件后信息自动补全）。
 */
import * as vscode from 'vscode';
import * as path from 'path';
import { BookmarkManager } from './bookmarkManager';
import { BookmarkData, defaultBookmarkName, previewLineText, enclosingSymbolLabel, findEnclosingSymbol, buildSummaryChain } from './bookmarks';
import { ParseResult } from './types';

export const BOOKMARK_VIEW_ID = 'plsqlOutlineBookmarks';

type BookmarkTreeElement =
    | { kind: 'file'; uri: vscode.Uri; bookmarks: BookmarkData[] }
    | { kind: 'bookmark'; uri: vscode.Uri; bookmark: BookmarkData };

export class BookmarkTreeView implements vscode.Disposable {
    private treeView: vscode.TreeView<BookmarkTreeElement>;
    private provider: BookmarkTreeProvider;
    private readonly disposables: vscode.Disposable[] = [];
    /** 上一帧书签总数：0→N 转变时自动展开视图（视图默认折叠，Emon 2026-10-05 需求） */
    private lastTotal: number = 0;

    constructor(manager: BookmarkManager, context: vscode.ExtensionContext) {
        this.provider = new BookmarkTreeProvider(manager);
        this.treeView = vscode.window.createTreeView(BOOKMARK_VIEW_ID, {
            treeDataProvider: this.provider,
            showCollapseAll: true
        });

        const changeSubscription = manager.onDidChange(() => this.refresh());
        context.subscriptions.push(this.treeView, changeSubscription);
        this.disposables.push(this.treeView, changeSubscription);
        this.refresh();
    }

    refresh(): void {
        this.provider.refresh();
        const total = this.provider.manager.getTotalCount();
        this.treeView.badge = total > 0
            ? { value: total, tooltip: 'PL/SQL 书签总数' }
            : undefined;
        // 视图默认折叠（package.json visibility:collapsed）：首个书签出现时
        // reveal 第一个文件组，顺带把视图展开（不抢焦点/不选中）
        if (this.lastTotal === 0 && total > 0) {
            void this.revealFirstFile();
        }
        this.lastTotal = total;
    }

    /** 展开视图并定位到第一个文件组（expand 视图但不抢键盘焦点） */
    private async revealFirstFile(): Promise<void> {
        try {
            const children = await this.provider.getChildren();
            if (children.length > 0 && children[0].kind === 'file') {
                await this.treeView.reveal(children[0], { select: false, focus: false, expand: true });
            }
        } catch {
            // 视图不可见等场景：静默跳过（用户手动展开即见）
        }
    }

    dispose(): void {
        for (const d of this.disposables) {
            d.dispose();
        }
    }
}

class BookmarkTreeProvider implements vscode.TreeDataProvider<BookmarkTreeElement> {
    private _onDidChangeTreeData: vscode.EventEmitter<BookmarkTreeElement | undefined | null | void>
        = new vscode.EventEmitter<BookmarkTreeElement | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<BookmarkTreeElement | undefined | null | void>
        = this._onDidChangeTreeData.event;

    constructor(readonly manager: BookmarkManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: BookmarkTreeElement): vscode.TreeItem {
        if (element.kind === 'file') {
            const item = new vscode.TreeItem(
                fileNameOf(element.uri),
                vscode.TreeItemCollapsibleState.Expanded);
            item.id = `file:${element.uri.toString()}`;
            item.description = `${element.bookmarks.length} 个书签`;
            item.contextValue = 'bookmarkFile';
            item.iconPath = fileIconUri();
            // 点击文件组跳到该文件第一个书签（可展开项必须设 command，v1.6.3 教训）
            item.command = {
                command: 'plsqlOutline.bookmark.jumpTo',
                title: '跳到第一个书签',
                arguments: [element.uri.toString(), element.bookmarks[0].line]
            };
            return item;
        }

        const bm = element.bookmark;
        const doc = openDocOf(element.uri);
        const lineText = doc && bm.line < doc.lineCount ? doc.lineAt(bm.line).text : '';
        const name = bm.name || defaultBookmarkName(lineText) || `第 ${bm.line + 1} 行`;
        const item = new vscode.TreeItem(name);
        item.id = `bm:${element.uri.toString()}#${bm.line}@${bm.createdAt}`;
        item.description = this.describeBookmark(doc, bm);
        item.tooltip = this.buildTooltip(name, bm, lineText, doc);
        item.contextValue = 'bookmarkItem';
        item.iconPath = bookmarkIconUri();
        item.command = {
            command: 'plsqlOutline.bookmark.jumpTo',
            title: '跳转到书签',
            arguments: [element.uri.toString(), bm.line]
        };
        return item;
    }

    /** 描述：`L12 · PROCEDURE calc_total`（文件未打开/未解析时只有行号） */
    private describeBookmark(doc: vscode.TextDocument | undefined, bm: BookmarkData): string {
        const symbol = this.symbolOf(doc, bm);
        return symbol && symbol !== '（顶层）'
            ? `L${bm.line + 1} · ${symbol}`
            : `L${bm.line + 1}`;
    }

    /** 完整悬浮提示：名称/备注/行内容/行号/所属/摘要 */
    private buildTooltip(name: string, bm: BookmarkData, lineText: string, doc: vscode.TextDocument | undefined): vscode.MarkdownString {
        const lines: string[] = [`**★ ${name}**`];
        if (bm.note) {
            lines.push(`备注：${bm.note}`);
        }
        const preview = previewLineText(lineText);
        if (preview) {
            lines.push(`行内容：\`${preview.replace(/`/g, "'")}\``);
        }
        lines.push(`行号：${bm.line + 1}`);
        const symbol = this.symbolOf(doc, bm);
        if (symbol) {
            lines.push(`所属：${symbol}`);
        }
        const chain = this.chainOf(doc, bm);
        if (chain) {
            lines.push(`摘要：${chain}`);
        }
        const md = new vscode.MarkdownString(lines.join('\n\n'));
        md.supportHtml = true;
        return md;
    }

    private symbolOf(doc: vscode.TextDocument | undefined, bm: BookmarkData): string | null {
        const parse = this.parseOf(doc);
        return parse ? enclosingSymbolLabel(findEnclosingSymbol(parse.nodes, bm.line + 1)) : null;
    }

    private chainOf(doc: vscode.TextDocument | undefined, bm: BookmarkData): string | null {
        const parse = this.parseOf(doc);
        return parse ? buildSummaryChain(parse.nodes, bm.line + 1) : null;
    }

    /** 文件已打开且恰为当前已解析文件时才有大纲信息 */
    private parseOf(doc: vscode.TextDocument | undefined): ParseResult | null {
        return doc ? this.manager.getParseResultForDocument(doc) : null;
    }

    getChildren(element?: BookmarkTreeElement): BookmarkTreeElement[] {
        if (!element) {
            // 活动文件置顶，其余按 URI 稳定排序
            const activeKey = vscode.window.activeTextEditor?.document.uri.toString();
            const files = this.manager.getFileSnapshot();
            files.sort((a, b) => {
                const aActive = a.uri.toString() === activeKey ? 0 : 1;
                const bActive = b.uri.toString() === activeKey ? 0 : 1;
                return aActive - bActive || a.uri.toString().localeCompare(b.uri.toString());
            });
            return files.map(f => ({ kind: 'file' as const, uri: f.uri, bookmarks: f.bookmarks }));
        }
        if (element.kind === 'file') {
            return element.bookmarks.map(bm =>
                ({ kind: 'bookmark' as const, uri: element.uri, bookmark: bm }));
        }
        return [];
    }
}

/* ---- 工具（独立函数，避免与 treeView.ts 私有实现耦合） ---- */

function fileNameOf(uri: vscode.Uri): string {
    return path.basename(uri.fsPath);
}

/** 文件组图标：数据库圆筒（大纲家族的 SQL 文件语义） */
function fileIconUri(): { light: vscode.Uri; dark: vscode.Uri } {
    const dir = path.join(__dirname, '..', 'res', 'icons');
    return {
        light: vscode.Uri.file(path.join(dir, 'package-light.svg')),
        dark: vscode.Uri.file(path.join(dir, 'package.svg'))
    };
}

/** 书签节点图标：琥珀缎带（与 gutter 图标同源） */
function bookmarkIconUri(): { light: vscode.Uri; dark: vscode.Uri } {
    const dir = path.join(__dirname, '..', 'res', 'icons');
    return {
        light: vscode.Uri.file(path.join(dir, 'bookmark-light.svg')),
        dark: vscode.Uri.file(path.join(dir, 'bookmark.svg'))
    };
}

/** 已打开文档查找（未打开文件的行内容/解析信息不可得，显示层自行降级） */
function openDocOf(uri: vscode.Uri): vscode.TextDocument | undefined {
    return vscode.workspace.textDocuments.find(d => d.uri.toString() === uri.toString());
}

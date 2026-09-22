import * as vscode from 'vscode';

/**
 * 大纲搜索框（Issue #36）：大纲树上方的常驻 Webview 输入框。
 * - 输入实时上报（webview 内 200ms 防抖）→ 扩展侧过滤大纲树
 * - 回车上报 → 跳转到第一个命中项；Esc / ✕ 清除过滤
 * - 过滤词的持有方是本类（lastText）：webview 重载（切主题/重开面板）时回填输入框
 */
export class OutlineSearchViewProvider implements vscode.WebviewViewProvider {
    /** package.json views 中注册的 webview 视图 id（置于大纲树上方） */
    public static readonly VIEW_ID = 'plsqlOutlineSearch';

    /** 上次上报的过滤词（webview 重载后回填输入框） */
    private lastText = '';

    constructor(
        private readonly onFilter: (text: string) => void,
        private readonly onEnter: () => void
    ) {}

    resolveWebviewView(
        view: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        view.webview.options = { enableScripts: true };
        view.webview.html = this.buildHtml(view.webview);
        view.webview.onDidReceiveMessage((message: { type?: string; text?: string }) => {
            if (message.type === 'filter') {
                this.lastText = String(message.text ?? '');
                this.onFilter(this.lastText);
            } else if (message.type === 'enter') {
                this.onEnter();
            }
        });
    }

    /**
     * 搜索框页面：CSP 仅放行 nonce 脚本；样式全部走 VS Code 主题变量适配深浅色
     */
    private buildHtml(webview: vscode.Webview): string {
        const nonce = this.randomNonce();
        const escapedText = this.escapeHtml(this.lastText);
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>
    body { margin: 0; padding: 4px 6px; }
    .box { display: flex; align-items: center; gap: 2px; }
    #q {
        flex: 1;
        box-sizing: border-box;
        min-width: 0;
        padding: 3px 6px;
        border: 1px solid var(--vscode-input-border, transparent);
        border-radius: 2px;
        outline: none;
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        font-family: var(--vscode-font-family);
        font-size: 13px;
    }
    #q:focus { border-color: var(--vscode-focusBorder); }
    #q::placeholder { color: var(--vscode-input-placeholderForeground); }
    #clear {
        border: none;
        padding: 3px 5px;
        background: transparent;
        color: var(--vscode-button-secondaryForeground, var(--vscode-foreground));
        cursor: pointer;
        font-size: 13px;
        line-height: 1;
        visibility: hidden;
    }
    #clear:hover { color: var(--vscode-foreground); }
    .has-text #clear { visibility: visible; }
</style>
</head>
<body>
<div class="box" id="box">
    <input id="q" type="text" placeholder="搜索方法/过程名…" value="${escapedText}" />
    <button id="clear" title="清除过滤">✕</button>
</div>
<script nonce="${nonce}">
(function () {
    const vscode = acquireVsCodeApi();
    const input = document.getElementById('q');
    const box = document.getElementById('box');
    const clearBtn = document.getElementById('clear');
    let timer = null;

    const send = () => {
        box.classList.toggle('has-text', input.value.length > 0);
        vscode.postMessage({ type: 'filter', text: input.value });
    };

    input.addEventListener('input', () => {
        box.classList.toggle('has-text', input.value.length > 0);
        clearTimeout(timer);
        timer = setTimeout(send, 200);
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            clearTimeout(timer);
            vscode.postMessage({ type: 'enter' });
        } else if (e.key === 'Escape') {
            input.value = '';
            send();
        }
    });
    clearBtn.addEventListener('click', () => {
        input.value = '';
        send();
        input.focus();
    });

    box.classList.toggle('has-text', input.value.length > 0);
})();
</script>
</body>
</html>`;
    }

    private randomNonce(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let text = '';
        for (let i = 0; i < 32; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return text;
    }

    /** HTML 属性值转义（回填过滤词时防注入） */
    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
}

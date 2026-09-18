import * as vscode from 'vscode';
import {
    SETTING_DEFINITIONS,
    SETTING_GROUPS,
    SettingDefinition,
    ExtensionConfig,
    splitConfigKey,
    clampValue
} from './settingsSchema';

/**
 * 设置面板（v1.8.0 重构：schema 驱动）。
 *
 * - 界面由 src/settingsSchema.ts 的定义生成，前后端共用同一份 schema，
 *   与 package.json 的配置声明由单元测试锁定无漂移。
 * - 写入作用域：解析/视图/调试 → 打开工作区时写 Workspace，否则写 User；
 *   文件类型/代码仓库 → 始终 User（跨项目/机器相关）。
 * - 无外部资源依赖（图标为内联 SVG，样式全部走 VS Code CSS 变量）。
 */
export class SettingsPanel {
    public static currentPanel: SettingsPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (SettingsPanel.currentPanel) {
            SettingsPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'plsqlOutlineSettings',
            'PL/SQL Outline 设置',
            column || vscode.ViewColumn.One,
            { enableScripts: true }
        );

        SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri);
    }

    public static kill() {
        SettingsPanel.currentPanel?.dispose();
        SettingsPanel.currentPanel = undefined;
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        SettingsPanel.currentPanel = new SettingsPanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, _extensionUri: vscode.Uri) {
        this._panel = panel;
        this._update();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public dispose() {
        SettingsPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async _update() {
        const webview = this._panel.webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);

        webview.onDidReceiveMessage(
            async (data) => {
                switch (data.type) {
                    case 'getConfig':
                        await this._sendConfig();
                        break;
                    case 'updateConfig':
                        await this._updateConfig(data.config);
                        break;
                    case 'resetConfig':
                        await this._resetConfig(data.group);
                        break;
                    case 'exportConfig':
                        await this._exportConfig();
                        break;
                    case 'importConfig':
                        await this._importConfig();
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    /** 常规设置写工作区（无工作区时写用户级），user 作用域设置始终写用户级 */
    private _resolveTarget(def: SettingDefinition): vscode.ConfigurationTarget {
        if (def.scope === 'user') {
            return vscode.ConfigurationTarget.Global;
        }
        return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.ConfigurationTarget.Workspace
            : vscode.ConfigurationTarget.Global;
    }

    /** 从 VS Code 配置读取快照发给 webview */
    private async _sendConfig() {
        const config = vscode.workspace.getConfiguration('plsql-outline');
        const snapshot: ExtensionConfig = {
            parsing: {}, view: {}, codeRepository: {}, debug: {}
        };
        for (const def of SETTING_DEFINITIONS) {
            const [group, sub] = splitConfigKey(def.key);
            const value = config.get(def.key, def.default as never);
            if (sub) {
                (snapshot as unknown as Record<string, Record<string, unknown>>)[group][sub] = value;
            } else {
                (snapshot as unknown as Record<string, unknown>)[group] = value;
            }
        }

        this._panel.webview.postMessage({ type: 'configData', config: snapshot });
    }

    /** 按定义逐项写入（值经 schema 裁剪校验），完成后回发最新快照 */
    private async _updateConfig(newConfig: ExtensionConfig) {
        const config = vscode.workspace.getConfiguration('plsql-outline');

        try {
            const readValue = (def: SettingDefinition): unknown => {
                const [group, sub] = splitConfigKey(def.key);
                const holder = newConfig as unknown as Record<string, unknown>;
                if (!sub) return holder[group];
                const g = holder[group] as Record<string, unknown> | undefined;
                return g ? g[sub] : undefined;
            };

            for (const def of SETTING_DEFINITIONS) {
                const clamped = clampValue(def, readValue(def));
                if (clamped === undefined) {
                    continue;
                }
                await config.update(def.key, clamped, this._resolveTarget(def));
            }

            await this._sendConfig();
            this._panel.webview.postMessage({ type: 'updateSuccess', message: '设置已保存' });
        } catch (error) {
            this._panel.webview.postMessage({
                type: 'updateError',
                message: `保存设置失败: ${error}`
            });
        }
    }

    /** 将一组（或全部）设置恢复为默认值 */
    private async _resetConfig(group?: string) {
        const config = vscode.workspace.getConfiguration('plsql-outline');

        try {
            for (const def of SETTING_DEFINITIONS) {
                if (group && def.group !== group) {
                    continue;
                }
                await config.update(def.key, undefined, this._resolveTarget(def));
            }

            await this._sendConfig();
            this._panel.webview.postMessage({
                type: 'resetSuccess',
                message: group ? '已恢复该分组的默认值' : '已恢复全部默认值'
            });
        } catch (error) {
            this._panel.webview.postMessage({
                type: 'resetError',
                message: `重置设置失败: ${error}`
            });
        }
    }

    private async _exportConfig() {
        try {
            const config = vscode.workspace.getConfiguration('plsql-outline');
            const snapshot: ExtensionConfig = {
                parsing: {}, view: {}, codeRepository: {}, debug: {}
            };
            for (const def of SETTING_DEFINITIONS) {
                const [group, sub] = splitConfigKey(def.key);
                const value = config.get(def.key, def.default as never);
                if (sub) {
                    (snapshot as unknown as Record<string, Record<string, unknown>>)[group][sub] = value;
                } else {
                    (snapshot as unknown as Record<string, unknown>)[group] = value;
                }
            }

            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('plsql-outline-config.json'),
                filters: { 'JSON 文件': ['json'], '所有文件': ['*'] }
            });

            if (uri) {
                const content = JSON.stringify({ _exported: new Date().toISOString(), config: snapshot }, null, 2);
                await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
                this._panel.webview.postMessage({
                    type: 'exportSuccess',
                    message: `配置已导出到: ${uri.fsPath}`
                });
            }
        } catch (error) {
            this._panel.webview.postMessage({ type: 'exportError', message: `导出配置失败: ${error}` });
        }
    }

    private async _importConfig() {
        try {
            const uri = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: { 'JSON 文件': ['json'], '所有文件': ['*'] }
            });

            if (uri && uri[0]) {
                const content = await vscode.workspace.fs.readFile(uri[0]);
                const parsed = JSON.parse(content.toString());
                // 兼容两种格式：直接是快照，或 { config: 快照 }（本扩展导出格式）
                const configData = parsed && typeof parsed === 'object' && 'config' in parsed
                    ? (parsed as { config: ExtensionConfig }).config
                    : parsed as ExtensionConfig;

                await this._updateConfig(configData);
                this._panel.webview.postMessage({
                    type: 'importSuccess',
                    message: `配置已从 ${uri[0].fsPath} 导入`
                });
            }
        } catch (error) {
            this._panel.webview.postMessage({ type: 'importError', message: `导入配置失败: ${error}` });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const schemaJson = JSON.stringify({
            groups: SETTING_GROUPS,
            definitions: SETTING_DEFINITIONS
        }).replace(/</g, '\\u003c');
        // Webview 内联脚本必须携带 nonce（VS Code 官方安全要求）
        const nonce = Array.from({ length: 32 }, () => Math.random().toString(36).charAt(2)).join('');
        const extVersion = vscode.extensions.getExtension('EmonZhang3438.plsql-outline')
            ?.packageJSON?.version as string | undefined;

        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<title>PL/SQL Outline 设置</title>
<style>
    :root {
        --border: var(--vscode-widget-border, rgba(128,128,128,0.30));
        --card-bg: var(--vscode-editor-background);
        --row-hover: rgba(128,128,128,0.08);
        --muted: var(--vscode-descriptionForeground);
        --accent: var(--vscode-focusBorder, var(--vscode-button-background));
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
        margin: 0;
        padding: 0;
        font-family: var(--vscode-font-family);
        font-size: var(--vscode-font-size, 13px);
        color: var(--vscode-editor-foreground);
        background: var(--vscode-editor-background);
    }
    .wrap { max-width: 880px; margin: 0 auto; padding: 20px 24px 96px; }

    /* ===== 头部 ===== */
    header { display: flex; align-items: center; gap: 14px; padding: 8px 0 18px; }
    header .logo { width: 42px; height: 42px; flex: none; display:flex; align-items:center; justify-content:center; }
    header .logo svg { width: 42px; height: 42px; }
    header h1 { font-size: 20px; font-weight: 600; margin: 0; letter-spacing: .2px; }
    header .sub { color: var(--muted); font-size: 12px; margin-top: 3px; }
    header .spacer { flex: 1; }
    .search { position: relative; width: 240px; }
    .search svg { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); width: 13px; height: 13px; opacity: .6; pointer-events: none; }
    .search input {
        width: 100%; padding: 6px 10px 6px 28px;
        background: var(--vscode-input-background); color: var(--vscode-input-foreground);
        border: 1px solid var(--border); border-radius: 4px; outline: none; font-size: 12.5px;
    }
    .search input:focus { border-color: var(--accent); }

    /* ===== 分组卡片 ===== */
    .card { border: 1px solid var(--border); border-radius: 8px; margin-bottom: 18px; overflow: hidden; background: var(--card-bg); }
    .card.hidden { display: none; }
    .card-head { display: flex; align-items: center; gap: 10px; padding: 12px 18px; border-bottom: 1px solid var(--border); background: rgba(128,128,128,0.06); }
    .card-head .icon { width: 16px; height: 16px; display: flex; }
    .card-head .icon svg { width: 16px; height: 16px; }
    .card-head .title { font-weight: 600; font-size: 13.5px; }
    .card-head .subtitle { color: var(--muted); font-size: 12px; }
    .card-head .spacer { flex: 1; }
    .card-head .reset-group {
        background: none; border: none; color: var(--muted); cursor: pointer; font-size: 12px;
        padding: 3px 6px; border-radius: 3px; font-family: inherit;
    }
    .card-head .reset-group:hover { color: var(--vscode-editor-foreground); background: rgba(128,128,128,0.14); }

    .row { display: flex; align-items: flex-start; gap: 18px; padding: 13px 18px; border-bottom: 1px solid rgba(128,128,128,0.14); }
    .row:last-child { border-bottom: none; }
    .row:hover { background: var(--row-hover); }
    .hidden { display: none !important; }
    .row .info { flex: 1; min-width: 0; }
    .row label.name { font-weight: 600; font-size: 13px; cursor: default; display: inline-block; }
    .row .desc { color: var(--muted); font-size: 12px; line-height: 1.55; margin-top: 3px; }
    .row .hint { color: var(--muted); font-size: 11.5px; margin-top: 4px; opacity: .9; }
    .row .control { flex: none; display: flex; align-items: center; min-height: 26px; }

    /* 开关 */
    .switch { position: relative; width: 36px; height: 19px; flex: none; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .switch .track {
        position: absolute; inset: 0; border-radius: 10px; cursor: pointer;
        background: rgba(128,128,128,0.42); transition: background .12s ease;
    }
    .switch .track::after {
        content: ''; position: absolute; top: 2px; left: 2px; width: 15px; height: 15px;
        border-radius: 50%; background: #fff; transition: transform .12s ease;
    }
    .switch input:checked + .track { background: var(--vscode-button-background); }
    .switch input:checked + .track::after { transform: translateX(17px); }
    .switch input:focus-visible + .track { outline: 1px solid var(--accent); outline-offset: 1px; }

    /* 数字输入 */
    input[type=number].num {
        width: 92px; padding: 5px 8px; text-align: right;
        background: var(--vscode-input-background); color: var(--vscode-input-foreground);
        border: 1px solid var(--border); border-radius: 4px; outline: none; font-size: 12.5px;
    }
    input[type=number].num:focus { border-color: var(--accent); }

    /* 下拉 */
    select.sel {
        padding: 5px 8px; min-width: 110px;
        background: var(--vscode-input-background); color: var(--vscode-input-foreground);
        border: 1px solid var(--border); border-radius: 4px; outline: none; font-size: 12.5px; font-family: inherit;
    }
    select.sel:focus { border-color: var(--accent); }

    /* 标签编辑器 */
    .tags { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; max-width: 430px; }
    .tag {
        display: inline-flex; align-items: center; gap: 5px; padding: 3px 6px 3px 9px;
        border: 1px solid var(--border); border-radius: 10px; font-size: 12px; font-family: var(--vscode-editor-font-family, monospace);
        background: rgba(128,128,128,0.10);
    }
    .tag button {
        all: unset; cursor: pointer; width: 15px; height: 15px; line-height: 14px; text-align: center;
        border-radius: 50%; color: var(--muted); font-size: 13px;
    }
    .tag button:hover { background: rgba(128,128,128,0.25); color: var(--vscode-editor-foreground); }
    .tag-add {
        width: 84px; padding: 3px 7px; font-size: 12px;
        background: var(--vscode-input-background); color: var(--vscode-input-foreground);
        border: 1px solid var(--border); border-radius: 10px; outline: none;
    }
    .tag-add:focus { border-color: var(--accent); }

    /* 仓库路径行 */
    .paths { display: flex; flex-direction: column; gap: 7px; max-width: 470px; }
    .path-row { display: flex; gap: 6px; align-items: center; }
    .path-row input.path {
        flex: 1; padding: 5px 8px; font-family: var(--vscode-editor-font-family, monospace); font-size: 12px;
        background: var(--vscode-input-background); color: var(--vscode-input-foreground);
        border: 1px solid var(--border); border-radius: 4px; outline: none;
    }
    .path-row input.path:focus { border-color: var(--accent); }
    .path-row input.prio { width: 52px; padding: 5px 6px; text-align: center;
        background: var(--vscode-input-background); color: var(--vscode-input-foreground);
        border: 1px solid var(--border); border-radius: 4px; outline: none; font-size: 12px; }
    .path-row .del {
        all: unset; cursor: pointer; width: 18px; height: 18px; line-height: 17px; text-align: center;
        border-radius: 50%; color: var(--muted);
    }
    .path-row .del:hover { background: rgba(128,128,128,0.25); color: var(--vscode-editor-foreground); }
    .paths .add {
        all: unset; cursor: pointer; color: var(--vscode-textLink-foreground, #4daafc);
        font-size: 12px; padding: 2px 0;
    }
    .paths .add:hover { text-decoration: underline; }

    /* ===== 底部操作栏 ===== */
    .footer {
        position: fixed; left: 0; right: 0; bottom: 0; z-index: 10;
        display: flex; align-items: center; gap: 10px;
        padding: 12px 24px;
        background: var(--vscode-editor-background);
        border-top: 1px solid var(--border);
    }
    .footer .inner { max-width: 880px; margin: 0 auto; width: 100%; display: flex; align-items: center; gap: 10px; }
    .footer .status { flex: 1; font-size: 12px; color: var(--muted); }
    .footer .status.dirty { color: var(--vscode-editorWarning-foreground, #cca700); }
    .footer .status.ok { color: var(--vscode-testing-iconPassed, #73c991); }
    button.btn {
        padding: 6px 14px; font-size: 12.5px; font-family: inherit; cursor: pointer;
        border-radius: 4px; border: 1px solid var(--border);
        background: var(--vscode-button-secondaryBackground, rgba(128,128,128,0.20));
        color: var(--vscode-button-secondaryForeground, var(--vscode-editor-foreground));
    }
    button.btn:hover { background: var(--vscode-button-secondaryHoverBackground, rgba(128,128,128,0.30)); }
    button.btn.primary {
        background: var(--vscode-button-background); color: var(--vscode-button-foreground); border-color: transparent;
        font-weight: 600;
    }
    button.btn.primary:hover { background: var(--vscode-button-hoverBackground); }
    button.btn.primary:disabled { opacity: .45; cursor: default; }
    button.btn:focus-visible, .card-head .reset-group:focus-visible { outline: 1px solid var(--accent); outline-offset: 1px; }

    .toast {
        position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
        padding: 7px 16px; border-radius: 4px; font-size: 12.5px; z-index: 20;
        background: var(--vscode-notifications-background, rgba(40,40,40,.95));
        color: var(--vscode-notifications-foreground, #ddd);
        border: 1px solid var(--border); opacity: 0; transition: opacity .18s ease; pointer-events: none;
    }
    .toast.show { opacity: 1; }
    .toast.err { border-color: var(--vscode-inputValidation-errorBorder, #be1100); }
    .empty { text-align: center; color: var(--muted); padding: 36px 0; font-size: 13px; }
</style>
</head>
<body>
<div class="wrap">
    <header>
        <div class="logo">
            <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PL/SQL Outline">
                <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#2e6fb2"/><stop offset="1" stop-color="#1c3f66"/>
                </linearGradient></defs>
                <rect x="1" y="1" width="46" height="46" rx="10" fill="url(#g)"/>
                <ellipse cx="24" cy="15" rx="12" ry="5" fill="none" stroke="#fff" stroke-width="2.4"/>
                <path d="M12 15v9c0 2.8 5.4 5 12 5s12-2.2 12-5v-9" fill="none" stroke="#fff" stroke-width="2.4"/>
                <path d="M12 24v9c0 2.8 5.4 5 12 5s12-2.2 12-5v-9" fill="none" stroke="#fff" stroke-width="2.4"/>
                <circle cx="35" cy="36" r="8" fill="#e8a33d"/>
                <path d="M31.5 36l2.4 2.4 4.6-4.8" fill="none" stroke="#1c3f66" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div>
            <h1>PL/SQL Outline 设置</h1>
            <div class="sub">PL/SQL 代码结构解析与大纲视图${extVersion ? ' · v' + extVersion : ''}</div>
        </div>
        <div class="spacer"></div>
        <div class="search">
            <svg viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.6" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input id="search" type="text" placeholder="搜索设置（如：游标、索引）" />
        </div>
    </header>

    <main id="cards"></main>
    <div class="empty hidden" id="empty">没有匹配的设置项</div>
</div>

<div class="footer">
    <div class="inner">
        <span class="status" id="status"></span>
        <button class="btn" id="btnReset">恢复默认</button>
        <button class="btn" id="btnExport">导出</button>
        <button class="btn" id="btnImport">导入</button>
        <button class="btn primary" id="btnSave" disabled>保存</button>
    </div>
</div>
<div class="toast" id="toast"></div>

<script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const SCHEMA = ${schemaJson};

    // ===== 内联图标（分组标题用） =====
    const ICONS = {
        zap: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 1L3 9h4l-1 6 7-8.5H8.5L9.5 1z"/></svg>',
        'list-tree': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 3.5h5M2 8h5M2 12.5h5M10.5 3.5H14M10.5 8H14M10.5 12.5H14"/></svg>',
        'file-code': '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M9 1.5H4a1 1 0 00-1 1v11a1 1 0 001 1h8a1 1 0 001-1V5.5L9 1.5z"/><path d="M9 1.5v4h4"/><path d="M6.4 8.2L4.8 9.8l1.6 1.6M9.6 8.2l1.6 1.6-1.6 1.6"/></svg>',
        database: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><ellipse cx="8" cy="3.4" rx="5.4" ry="2.1"/><path d="M2.6 3.4v9.2c0 1.2 2.4 2.1 5.4 2.1s5.4-.9 5.4-2.1V3.4"/><path d="M2.6 8c0 1.2 2.4 2.1 5.4 2.1s5.4-.9 5.4-2.1"/></svg>',
        bug: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="9" r="3.6"/><path d="M8 5.4V3.2M4.4 9H1.6M14.4 9h-2.8M5.2 6.2L3.6 4.6M10.8 6.2l1.6-1.6M5.2 11.8l-1.6 1.6M10.8 11.8l1.6 1.6"/></svg>'
    };

    // ===== 工具 =====
    const $ = (sel) => document.querySelector(sel);
    function configGet(key) {
        const [g, sub] = key.indexOf('.') >= 0 ? [key.slice(0, key.indexOf('.')), key.slice(key.indexOf('.') + 1)] : [key, null];
        const holder = config[g];
        return sub ? (holder ? holder[sub] : undefined) : holder;
    }
    function configSet(key, value) {
        const [g, sub] = key.indexOf('.') >= 0 ? [key.slice(0, key.indexOf('.')), key.slice(key.indexOf('.') + 1)] : [key, null];
        if (sub) { config[g][sub] = value; } else { config[g] = value; }
    }
    function esc(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    let toastTimer = null;
    function toast(msg, isErr) {
        const el = $('#toast');
        el.textContent = msg;
        el.classList.toggle('err', !!isErr);
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
    }

    // ===== 状态 =====
    let config = null;
    let dirty = false;

    function setStatus() {
        const el = $('#status');
        el.className = 'status' + (dirty ? ' dirty' : '');
        if (dirty) { el.textContent = '有未保存的更改'; $('#btnSave').disabled = false; }
        else {
            el.textContent = '设置与当前配置一致';
            el.className = 'status';
            $('#btnSave').disabled = true;
        }
    }
    function markDirty() { dirty = true; setStatus(); }

    // ===== 渲染 =====
    function renderAll() {
        const cardsEl = $('#cards');
        cardsEl.innerHTML = '';
        for (const group of SCHEMA.groups) {
            const defs = SCHEMA.definitions.filter(d => d.group === group.id);
            if (!defs.length) continue;
            const card = document.createElement('section');
            card.className = 'card';
            card.dataset.group = group.id;
            card.innerHTML =
                '<div class="card-head">' +
                    '<span class="icon">' + (ICONS[group.icon] || '') + '</span>' +
                    '<span class="title">' + esc(group.title) + '</span>' +
                    '<span class="subtitle">' + esc(group.subtitle) + '</span>' +
                    '<span class="spacer"></span>' +
                    '<button class="reset-group" data-group="' + group.id + '" title="恢复该分组默认值">重置本组</button>' +
                '</div>';
            for (const def of defs) {
                card.appendChild(renderRow(def));
            }
            cardsEl.appendChild(card);
        }
        setStatus();
    }

    function renderRow(def) {
        const row = document.createElement('div');
        row.className = 'row';
        row.dataset.key = def.key;

        const value = configGet(def.key);
        let control = '';
        if (def.type === 'boolean') {
            control = '<label class="switch"><input type="checkbox" data-key="' + def.key + '"' +
                (value ? ' checked' : '') + '><span class="track"></span></label>';
        } else if (def.type === 'number') {
            control = '<input class="num" type="number" data-key="' + def.key + '" value="' + Number(value) + '"' +
                (def.min !== undefined ? ' min="' + def.min + '"' : '') +
                (def.max !== undefined ? ' max="' + def.max + '"' : '') + '>';
        } else if (def.type === 'enum') {
            control = '<select class="sel" data-key="' + def.key + '">' +
                def.values.map(v => '<option value="' + esc(v) + '"' + (v === value ? ' selected' : '') + '>' + esc(v) + '</option>').join('') +
                '</select>';
        } else if (def.type === 'extensions') {
            control = '<div class="tags" data-key="' + def.key + '">' +
                value.map(t => tagHtml(t)).join('') +
                '<input class="tag-add" type="text" placeholder="添加，回车">' +
                '</div>';
        } else if (def.type === 'repositoryPaths') {
            control = '<div class="paths" data-key="' + def.key + '">' + value.map(p => pathRowHtml(p)).join('') +
                (value.length < 2 ? '<a class="add" href="#">+ 添加路径</a>' : '') + '</div>';
        }

        let hint = '';
        if (def.type === 'number' && (def.min !== undefined || def.max !== undefined)) {
            const range = (def.min !== undefined ? def.min : '−') + ' – ' + (def.max !== undefined ? def.max : '−');
            hint = '<div class="hint">范围 ' + range + ' · 默认 ' + def.default + '</div>';
        } else if (def.type !== 'repositoryPaths' && def.type !== 'extensions') {
            hint = '<div class="hint">默认：' + esc(formatDefault(def)) + '</div>';
        }

        row.innerHTML =
            '<div class="info">' +
                '<label class="name">' + esc(def.label) + '</label>' +
                '<div class="desc">' + esc(def.description) + '</div>' + hint +
            '</div>' +
            '<div class="control">' + control + '</div>';

        bindRow(row, def);
        return row;
    }

    function formatDefault(def) {
        if (def.type === 'boolean') return def.default ? '开启' : '关闭';
        if (def.type === 'enum') return def.default;
        if (def.type === 'number') return def.default;
        if (def.type === 'extensions') return (def.default || []).join('  ');
        return '—';
    }
    function tagHtml(t) {
        return '<span class="tag">' + esc(t) + '<button title="移除 ' + esc(t) + '" data-remove="' + esc(t) + '">×</button></span>';
    }
    function pathRowHtml(p) {
        return '<div class="path-row">' +
            '<input class="path" type="text" value="' + esc(p.path || '') + '" placeholder="目录路径，如 D:\\oracle\\src">' +
            '<input class="prio" type="number" value="' + (p.priority !== undefined ? p.priority : 1) + '" title="优先级（数字越小越优先）">' +
            '<button class="del" title="移除该路径">×</button>' +
            '</div>';
    }

    function bindRow(row, def) {
        if (def.type === 'boolean') {
            row.querySelector('input').addEventListener('change', (e) => {
                configSet(def.key, e.target.checked); markDirty();
            });
        } else if (def.type === 'number') {
            row.querySelector('input').addEventListener('input', (e) => {
                let n = parseFloat(e.target.value);
                if (Number.isNaN(n)) return;
                if (def.min !== undefined) n = Math.max(def.min, n);
                if (def.max !== undefined) n = Math.min(def.max, n);
                configSet(def.key, n); markDirty();
            });
        } else if (def.type === 'enum') {
            row.querySelector('select').addEventListener('change', (e) => {
                configSet(def.key, e.target.value); markDirty();
            });
        } else if (def.type === 'extensions') {
            const holder = row.querySelector('.tags');
            const sync = () => {
                configSet(def.key, Array.from(holder.querySelectorAll('.tag')).map(t =>
                    t.textContent.replace('×', '').trim()));
                markDirty();
            };
            holder.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-remove]');
                if (btn) { btn.closest('.tag').remove(); sync(); }
            });
            holder.querySelector('.tag-add').addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                let ext = e.target.value.trim().toLowerCase();
                if (!ext) return;
                if (!ext.startsWith('.')) ext = '.' + ext;
                if (!/^\\.[a-z0-9_]+$/.test(ext)) { toast('扩展名格式无效：' + ext, true); return; }
                if (configGet(def.key).includes(ext)) { toast('扩展名已存在：' + ext, true); return; }
                e.target.insertAdjacentHTML('beforebegin', tagHtml(ext));
                e.target.value = '';
                sync();
            });
        } else if (def.type === 'repositoryPaths') {
            const holder = row.querySelector('.paths');
            const sync = () => {
                const rows = Array.from(holder.querySelectorAll('.path-row'));
                configSet(def.key, rows.map(r => ({
                    path: r.querySelector('.path').value.trim(),
                    priority: parseFloat(r.querySelector('.prio').value) || 1
                })).filter(p => p.path));
                markDirty();
            };
            holder.addEventListener('click', (e) => {
                e.preventDefault();
                if (e.target.classList.contains('del')) {
                    e.target.closest('.path-row').remove(); sync();
                } else if (e.target.classList.contains('add')) {
                    const rows = holder.querySelectorAll('.path-row').length;
                    if (rows >= 2) { toast('最多配置 2 个仓库路径', true); return; }
                    e.target.insertAdjacentHTML('beforebegin', pathRowHtml({ path: '', priority: rows + 1 }));
                }
            });
            holder.addEventListener('input', sync);
        }
    }

    // ===== 搜索过滤 =====
    $('#search').addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        let anyVisible = false;
        document.querySelectorAll('.card').forEach(card => {
            let cardVisible = false;
            card.querySelectorAll('.row').forEach(row => {
                const def = SCHEMA.definitions.find(d => d.key === row.dataset.key);
                const hay = (def.label + def.description + def.key).toLowerCase();
                const show = !q || hay.indexOf(q) >= 0;
                row.classList.toggle('hidden', !show);
                if (show) cardVisible = true;
            });
            card.classList.toggle('hidden', !cardVisible);
            if (cardVisible) anyVisible = true;
        });
        $('#empty').classList.toggle('hidden', anyVisible);
    });

    // ===== 底部操作 =====
    $('#btnSave').addEventListener('click', () => {
        vscode.postMessage({ type: 'updateConfig', config: config });
    });
    $('#btnReset').addEventListener('click', () => {
        vscode.postMessage({ type: 'resetConfig' });
    });
    $('#btnExport').addEventListener('click', () => vscode.postMessage({ type: 'exportConfig' }));
    $('#btnImport').addEventListener('click', () => vscode.postMessage({ type: 'importConfig' }));
    $('#cards').addEventListener('click', (e) => {
        const btn = e.target.closest('.reset-group');
        if (btn) vscode.postMessage({ type: 'resetConfig', group: btn.dataset.group });
    });

    // ===== 消息 =====
    window.addEventListener('message', (event) => {
        const msg = event.data;
        switch (msg.type) {
            case 'configData':
                config = msg.config;
                dirty = false;
                renderAll();
                break;
            case 'updateSuccess':
                toast(msg.message); break;
            case 'resetSuccess':
                toast(msg.message); break;
            case 'importSuccess':
                toast(msg.message); break;
            case 'exportSuccess':
                toast(msg.message); break;
            case 'updateError': case 'resetError': case 'importError': case 'exportError':
                toast(msg.message, true); break;
        }
    });

    vscode.postMessage({ type: 'getConfig' });
</script>
</body>
</html>`;
    }
}

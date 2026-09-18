/**
 * 生成设置页预览 HTML（供浏览器渲染截图 / README 设置页配图）。
 *
 * 原理：用 vscode 模块桩实例化真实 SettingsPanel，捕获其生成的 webview HTML，
 * 外层包一层 VS Code 主题变量垫片与 acquireVsCodeApi 桩后输出独立页面。
 *
 * 运行：npm run compile && node scripts/capture-settings-html.js
 * 输出：release/preview/settings-preview.html（再由浏览器截图为 PNG）
 */
const fs = require('fs');
const path = require('path');
const Module = require('module');

const captured = { html: '', handler: null };

const panelStub = {
    webview: {
        cspSource: 'https://*.vscode-cdn.net',
        postMessage: async () => {},
        onDidReceiveMessage: (cb) => { captured.handler = cb; },
        onDidDispose: () => {},
        set html(value) { captured.html = value; },
        get html() { return captured.html; }
    },
    onDidDispose: () => {},
    reveal: () => {},
    dispose: () => {}
};

const vscodeStub = {
    window: {
        activeTextEditor: undefined,
        createWebviewPanel: () => panelStub,
        showSaveDialog: async () => undefined,
        showOpenDialog: async () => undefined,
        showInformationMessage: async () => undefined
    },
    extensions: {
        getExtension: () => ({ packageJSON: { version: '1.8.0' } })
    },
    workspace: {
        workspaceFolders: [],
        getConfiguration: () => ({
            get: (key, defaultValue) => defaultValue,
            update: async () => {}
        }),
        onDidChangeConfiguration: () => ({ dispose: () => {} })
    },
    ConfigurationTarget: { Global: 1, Workspace: 2 },
    ViewColumn: { One: 1, Two: 2 },
    Uri: { file: (p) => ({ fsPath: p }) }
};

const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
    if (request === 'vscode') {
        return path.join(__dirname, 'vscode-stub.js');
    }
    return origResolve.call(this, request, ...args);
};

// 桩模块（ts 编译产物 require('vscode') 时命中）
require.cache[path.join(__dirname, 'vscode-stub.js')] = { id: '.', filename: path.join(__dirname, 'vscode-stub.js'), loaded: true, exports: vscodeStub };

const { SettingsPanel } = require('../out/settingsPanel');
SettingsPanel.createOrShow(vscodeStub.Uri.file('.'));

if (!captured.html) {
    console.error('未能捕获设置页 HTML');
    process.exit(1);
}

// 提取 nonce，供垫片脚本复用（CSP 要求）
const nonceMatch = captured.html.match(/script-src 'nonce-([a-z0-9]+)'/);
const nonce = nonceMatch ? nonceMatch[1] : '';

// VS Code 浅色主题变量垫片 + acquireVsCodeApi 桩
const shim = `<script nonce="${nonce}">
    window.acquireVsCodeApi = function () {
        return {
            postMessage: function (msg) {
                if (msg && msg.type === 'getConfig') {
                    setTimeout(function () {
                        window.postMessage({ type: 'configData', config: window.__SAMPLE_CONFIG__ }, '*');
                    }, 30);
                }
            },
            getState: function () { return {}; },
            setState: function () {}
        };
    };
</script>
<style>
    :root {
        --vscode-font-family: -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
        --vscode-font-size: 13px;
        --vscode-editor-background: #ffffff;
        --vscode-editor-foreground: #24292e;
        --vscode-descriptionForeground: #6a737d;
        --vscode-input-background: #f6f8fa;
        --vscode-input-foreground: #24292e;
        --vscode-widget-border: rgba(31,35,40,0.16);
        --vscode-focusBorder: #1f6feb;
        --vscode-button-background: #1f6feb;
        --vscode-button-hoverBackground: #1858bd;
        --vscode-button-foreground: #ffffff;
        --vscode-button-secondaryBackground: #f6f8fa;
        --vscode-button-secondaryHoverBackground: #eef1f4;
        --vscode-button-secondaryForeground: #24292e;
        --vscode-textLink-foreground: #0969da;
        --vscode-editorWarning-foreground: #9a6700;
        --vscode-notifications-background: #fbfbfc;
        --vscode-notifications-foreground: #24292e;
        --vscode-editor-font-family: Consolas, "SFMono-Regular", monospace;
    }
    /* 全页截图用：底栏落到文档底部而非视口 */
    .footer { position: static; }
</style>
<script nonce="${nonce}">
    window.__SAMPLE_CONFIG__ = {
        parsing: { autoParseOnSave: true, autoParseOnSwitch: true, maxNestingDepth: 15 },
        view: { showStructureBlocks: true, expandByDefault: false, autoSelectOnCursor: true, showDeclarations: true, groupDeclarations: true },
        fileExtensions: ['.sql', '.fnc', '.fcn', '.prc', '.pks', '.pkb', '.typ'],
        codeRepository: { paths: [{ path: 'D:\\\\oracle\\\\project\\\\src', priority: 1 }], fileExtensions: ['.pks', '.pkb', '.prc', '.fnc'], autoIndex: true, maxFiles: 5000 },
        debug: { enabled: false, logLevel: 'INFO' }
    };
</script>`;

const out = captured.html
    .replace('</head>', shim + '\n</head>');

const outFile = path.join(__dirname, '..', 'release', 'preview', 'settings-preview.html');
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out, 'utf8');
console.log('预览已生成: ' + outFile);

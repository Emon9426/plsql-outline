## 追加：用户本机实机验收（真实 VS Code **1.142.0** + 已安装的 v1.17.3 **正式包**）

上面的验收跑在 `.vscode-test` 缓存的 VS Code **1.146.0** 扩展开发宿主上，仍留两个变量：
VS Code 版本不同，以及开发宿主加载的是仓库 `out/` 而不是发布安装包。本轮把这两个变量也关掉：

- VS Code **1.142.0**（`code --version`，本机日常安装的正式版本）
- 扩展 = `emonzhang3438.plsql-outline-1.17.3`，由 `code --install-extension release/plsql-outline-1.17.3.vsix --force` 装入 `~/.vscode/extensions` 的**正式包**；无 `--extensionDevelopmentPath`，标题栏无 `[扩展开发宿主]` 前缀
- 同时加载本机已装的 `xyz.plsql-language-1.8.2`（更接近真实使用环境）
- 用独立 `--user-data-dir` 临时实例，未触碰日常窗口与工作区
- 输入仍是 OS 级 `SetCursorPos` + `mouse_event`

轨迹里的标签 `gutter-line` / `text-gesture` 本身就证明运行的是 v1.17.3 —— v1.17.2 的对应标签是 `full-line`，且没有任何抑制分支。

| # | 手势 | 期望 | 实测标签 |
|---|---|---|---|
| R1 | 双击行号 L3 | 建签 | `gutter-line line=3` ✅ |
| R2 | 三击正文 L5 | 不建签 | `collapse → other → text-gesture` ✅ |
| R3 | 双击词 L8 后拖到 L9 行首 | 不建不删 | `collapse → other → text-gesture ×2` ✅ |
| R4 | 点正文中部后 362ms 点同行行号 | 仍建签 | `collapse(列13) → gutter-line` ✅ |
| R5 | 三击正文 L10 | 不建签 | `collapse → other → text-gesture` ✅ |

双击行号建签：

![](https://raw.githubusercontent.com/Emon9426/plsql-outline/docs/issue-50-real-vscode-1142/docs/design/bookmarks/repro-doubleclick/real-vscode-1.142/r1-gutter-dblclick-creates.png)

三击正文不建签：

![](https://raw.githubusercontent.com/Emon9426/plsql-outline/docs/issue-50-real-vscode-1142/docs/design/bookmarks/repro-doubleclick/real-vscode-1.142/r2-tripleclick-text-none.png)

双击词后拖拽不建不删：

![](https://raw.githubusercontent.com/Emon9426/plsql-outline/docs/issue-50-real-vscode-1142/docs/design/bookmarks/repro-doubleclick/real-vscode-1.142/r3-dblclick-drag-none.png)

五手势跑完的末态——26 行里只有 **L3 与 L21** 两个书签，正是两次行号点击（R1、R4）的结果；三次正文手势（L5、L8、L10）一个都没留下：

![](https://raw.githubusercontent.com/Emon9426/plsql-outline/docs/issue-50-real-vscode-1142/docs/design/bookmarks/repro-doubleclick/real-vscode-1.142/r5-final-state.png)

完整记录与打包审计：[README.md](https://raw.githubusercontent.com/Emon9426/plsql-outline/docs/issue-50-real-vscode-1142/docs/design/bookmarks/repro-doubleclick/real-vscode-1.142/README.md) · [trace-real-vscode.txt](https://raw.githubusercontent.com/Emon9426/plsql-outline/docs/issue-50-real-vscode-1142/docs/design/bookmarks/repro-doubleclick/real-vscode-1.142/trace-real-vscode.txt)

`release/plsql-outline-1.17.3.vsix`（132 文件 / 1.63 MB）已过 `.ai/workflow.md` 防泄漏检查单：`tests/ corpus .ai/ docs/ src/ tmp* *.log .vscode-test/ memory_test_report.json repro-doubleclick` 全部 0 命中；`out/*.js`、`README.md`、`CHANGELOG.md`、`LICENSE`、`language-configuration.json`、`res/Icon.png`、`res/screenshots/`（4 个）齐全；包内 `out/bookmarkManager.js` 含 `GUTTER_BURST_MS` / `lastTextGestureAt` / `gutterLineHit` 特征码。

证据归档 PR：https://github.com/Emon9426/plsql-outline/pull/52 （纯文档，不含代码改动）

GitHub Release 与 vsix 上传**未执行**（本轮范围只到"打包 + 装本机"）。

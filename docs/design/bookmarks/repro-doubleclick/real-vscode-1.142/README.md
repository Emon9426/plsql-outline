# 用户实机验收：真实 VS Code 1.142 + 已安装 v1.17.3 正式包（2026-11-15）

Issue #50 的主验收（见上级目录 `verification-report.md`）跑在 `.vscode-test` 缓存的
VS Code **1.146.0** 扩展开发宿主上。本目录补一组**用户本机真实环境**的确认，
排除两个残留变量：VS Code 版本差异、以及"开发宿主加载的是仓库 out/，
而非发布安装包"。

## 环境

- VS Code **1.142.0**（`code --version`，用户日常安装的正式版本，非测试缓存实例）
- 扩展来源：`emonzhang3438.plsql-outline-1.17.3`——`code --install-extension
  release/plsql-outline-1.17.3.vsix --force` 装入 `~/.vscode/extensions` 的**正式包**
  （无 `--extensionDevelopmentPath`，标题栏无 `[扩展开发宿主]` 前缀）
- 同时加载用户已装的 `xyz.plsql-language-1.8.2`（更接近真实使用环境）
- 独立 `--user-data-dir` 临时实例，不触碰用户日常窗口与工作区
- 输入：OS 级 `SetCursorPos` + `mouse_event`（双击间隔 160ms、三击间隔 120ms）
- 判定证据：扩展自带调试轨迹 `plsql-outline.debug.enabled` →
  `%TEMP%/plsql-outline-sel-trace.log`，见 `trace-real-vscode.txt`

## 结果

标签 `gutter-line` / `text-gesture` 本身即证明运行的是 v1.17.3——v1.17.2 的对应标签是
`full-line`，且不会有任何抑制分支。

| # | 手势 | 期望 | 实测标签 | 截图 |
|---|---|---|---|---|
| R1 | 双击行号 L3 | 建签 | `gutter-line line=3` | `r1-gutter-dblclick-creates.png` |
| R2 | 三击正文 L5 | 不建签 | `collapse → other → text-gesture` | `r2-tripleclick-text-none.png` |
| R3 | 双击词 L8 后拖到 L9 行首 | 不建不删 | `collapse → other → text-gesture ×2` | `r3-dblclick-drag-none.png` |
| R4 | 点正文中部后 362ms 点同行行号 | 仍建签 | `collapse(列13) → gutter-line` | `r4-midclick-then-gutter-creates.png` |
| R5 | 三击正文 L10 | 不建签 | `collapse → other → text-gesture` | `r5-final-state.png` |

末态 `r5-final-state.png`：全部 26 行里只有 **L3 与 L21** 两个书签——正是两次行号点击
（R1、R4）的结果；三次正文手势（L5、L8、L10）一个都没留下。

## 打包审计（`.ai/workflow.md` 发布检查单第 5 条）

`release/plsql-outline-1.17.3.vsix`（132 文件 / 1.63 MB）：

- 禁止项全部为 0：`tests/`、`corpus`、`.ai/`、`docs/`、`src/`、`.mimosa`、`tmp*`、
  `temp*`、`*.log`、`.zcode/`、`.vscode-test/`、`release/`、`memory_test_report.json`、
  `repro-doubleclick`、`issue-comment`
- 必需项齐全：`package.json`、`README.md`、`CHANGELOG.md`、`LICENSE`、
  `language-configuration.json`、`res/Icon.png`、`res/screenshots/`（4 个）、`out/*.js`
- 包内 `out/bookmarkManager.js` 含修复特征码：`GUTTER_BURST_MS`、`lastTextGestureAt`、
  `gutterLineHit`、`gutter-last-line`、`text-gesture`、`a.character === 0`

## 未执行

GitHub Release 与 vsix 上传未做（用户选择"打包 + 装本机"）；marketplace 发布自 v1.8.0
起持续挂起，状态不变。

# Issue #50 实机验收报告（2026-11-15）

环境：Windows 11 26300 / VS Code **1.146.0**（`.vscode-test` 缓存实例）/ 扩展以
`--extensionDevelopmentPath` 加载本分支 `out/`，`--disable-extensions` 排除其他扩展，
独立 `--user-data-dir`。用户机器实际安装版本已核对为 v1.17.2（非版本滞后）。

方法：**OS 级真实鼠标输入**（PowerShell `mouse_event` + `SetCursorPos`，含 160ms
人间隔的双击）+ **扩展自带调试轨迹**（`plsql-outline.debug.enabled` →
`%TEMP%/plsql-outline-sel-trace.log`）+ **每手势全屏截图**（CopyFromScreen 裁剪）。
不使用程序化 `editor.selection` 赋值——那不带 Mouse kind，走不到被测分支。

测试文件 26 行 `diag_demo.pkb`（`END order_mgr;` 为无换行符末行），
每个手势打在**不同行**，书签状态互不干扰。

## 一、修复前（v1.17.2，见 `trace-before-fix.txt`）

33 个手势的结论：整行选区形状 `[L,0)→[L+1,0)` **并非行号点击独占**。

| 手势 | 实测事件 | v1.17.2 结果 |
|---|---|---|
| 双击正文词后拖到下一行行首 | `10:9空 → 10:8-10:9 → 10:0-11:0` | **建签又删签** ❌ |
| 双击正文词后 Shift+点击下一行行首 | `12:8-12:12 → 12:8-13:0` | **建签** ❌ |
| 三击正文 | `9:13空 → 9:4-9:13 → 9:0-10:0` | **建签** ❌ |
| 从行首拖到下一行行首 | `4:0空 → 4:0-5:0` | **建签** ❌ |
| 拖选止于下一行行首 | `11:7-12:0` | **建签** ❌ |
| 单击/双击/三击 **行号** | 恰好 1 个整行事件 | 建签 ✅ |
| 单击/双击 **glyph 图标列** | **0 个事件** | 无反应（平台不派发） |
| 双击正文词 / 缩进空白 / 纯空格行 / 空行 | 塌陷 + 行内选区 | 不建 ✅ |

双击行号（60ms 与 160ms 两种间隔）与三击行号都**只有 1 个事件**，与单击完全同形
——再次独立验证 Issue #44 的平台结论：双击在扩展 API 层不可检测。

## 二、修复后（本分支，见 `trace-after-fix.txt`）

标签含义：`gutter-line` 行号整行点击→切换；`gutter-last-line` 末行行号点击→仅删；
`text-gesture` 形状合格但判定为正文手势→抑制；`collapse`/`other` 正文事件。

| # | 手势 | 期望 | 实测标签 | 结果 |
|---|---|---|---|---|
| W1 | 双击行号 L3 | 建签 | `gutter-line line=3` | ✅ `after-gutter-dblclick-creates.png` |
| W2 | 双击行号 L4 | 建签 | `gutter-line line=4` | ✅ `after-gutter-dblclick-creates-2.png` |
| W3 | 三击正文 L5 | 不建 | `collapse → other → text-gesture` | ✅ `after-tripleclick-text-no-bookmark.png` |
| W5 | 双击词 L8 后拖到 L9 行首 | 不建不删 | `collapse → other → text-gesture ×2` | ✅ `after-dblclick-word-drag-no-bookmark.png` |
| W6 | 双击词 L10 后 Shift+点击 L11 行首 | 不建 | `collapse → other → other` | ✅ `after-dblclick-shiftclick-no-bookmark.png` |
| W7 | 拖选 L12 中部→L13 行首 | 不建 | 全程 `other` | ✅ `after-drag-midline-no-bookmark.png` |
| W14 | 点正文中部后 356ms 内点同行行号 | **仍建签** | `collapse(列13) → gutter-line` | ✅ `after-midclick-then-gutter-creates.png` |
| W10 | 连续点行号 L16、L17（间隔 501ms） | 各建一个 | `gutter-line` ×2 | ✅ `after-consecutive-gutter-creates.png` |
| W11 | 双击末行行号（无签） | 不建 | `gutter-last-line`（只删不建） | ✅ `after-lastline-gutter-no-create.png` |
| W12 | 末行 Ctrl+Alt+K 建签 → 双击末行行号 | 删签 | `gutter-last-line` | ✅ `after-lastline-gutter-deletes.png` |
| W13 | 末行有签后三击末行正文 | 不误删 | `other → text-gesture` | ✅ `after-lastline-tripleclick-keeps.png` |
| W4 | 光标已在 L19 列 0，单击行首再拖到 L20 行首 | 不建 | `collapse(列0) → other → text-gesture` | ✅ 抑制 |

末态截图 `after-final-state.png`：书签恰为 **3、4、16、17、21、22、26** 七行
（全部来自行号点击或 Ctrl+Alt+K），正文手势所在的 5、8、10、11、12、13、14、19、20
行一律无签。

## 三、已知残留（平台不可判定，非本次回归）

**光标已恰好位于 (L,0) 时，从 (L,0) 拖到 (L+1,0)** ——该鼠标按下不产生任何选区事件
（选区值未变），拖拽结束只派发一个与行号点击**逐字段相同**的整行事件
（`anchor=(L,0) active=(L+1,0)`，kind=Mouse）。扩展 API 无鼠标坐标、无按下事件，
此二者在数学上不可区分，故不抑制。触发前提较窄：需光标已在该行行首（如按 Home 后）
再向下拖选恰好一行；一旦拖拽起点触发了列 0 塌陷事件（W4 路径）即被抑制。

## 四、全量回归（`.ai/testing.md` 四步）

| 步骤 | 结果 |
|---|---|
| `npm run test:corpus` | 35/35 OK，已知缺陷 0，失败 0 |
| `npm test` | 556/556 通过（基线不变） |
| `npm run test:regression` | 15/15 套件通过；`bookmark_interaction` 18 → **29 断言** |
| `npm run test:e2e` | anonDefinition 通过 + smoke 全部通过 + foldRouting 8/8 + indexJump 11/11 + bookmark 全部断言通过（exit 0） |

红→绿证据：新增 7 项正文手势契约在 v1.17.2 实现上失败（`结果: 20/27 通过`，
失败项=三击正文建签 / 拖选止于下一行行首建签 / 拖选整行建签 / 双击词后拖拽删签 /
Shift+点击建签 / 行号建签后三击增删 / 末行三击误删），修复后 29/29 通过。

## 五、复现与验收脚本

- 手势矩阵（修复前）：`matrix.ps1`（E1–E15 基础手势）、`matrix2.ps1`（P1–P13 空白/
  拖选/末行）、`matrix3.ps1`（D1–D5 双击+拖拽/Shift+点击/人间隔双击）
- 验收矩阵（修复后）：`verify.ps1`（V1–V13）、`verify2.ps1`（W1–W15，含中部单击
  后点行号的正例）
- 输入驱动与截图：`runner.ps1`（`SetCursorPos` + `mouse_event` + `CopyFromScreen`）

脚本位于本机 `%TEMP%/plsql-bm-diag/`（调查用，不入库、不入包，见 `.vscodeignore`
`tmp*` / `*.log` 规则）；入库产物为本目录的截图与两份轨迹文本。

## 修复完成 —— 实机验收结果（v1.17.3，分支 `fix/bookmark-gutter-click-only`）

环境：VS Code **1.146.0** 扩展开发宿主 + **OS 级真实鼠标输入**（`SetCursorPos` +
`mouse_event`，双击含 60ms / 160ms 两种间隔）+ 扩展调试轨迹
（`plsql-outline.debug.enabled`）+ 每手势截图。未使用程序化 `editor.selection`
赋值——那不带 Mouse kind，走不到被测分支。

完整报告：[verification-report.md](https://raw.githubusercontent.com/Emon9426/plsql-outline/fix/bookmark-gutter-click-only/docs/design/bookmarks/repro-doubleclick/verification-report.md)
· 修复后轨迹：[trace-after-fix.txt](https://raw.githubusercontent.com/Emon9426/plsql-outline/fix/bookmark-gutter-click-only/docs/design/bookmarks/repro-doubleclick/trace-after-fix.txt)

### 一、本 Issue 的五类误触，逐条实机复验

| 手势 | 修复后实测标签序列 | 结果 | 截图 |
|---|---|---|---|
| 三击正文 L5 | `collapse → other → text-gesture` | ✅ 不建签 | ![](https://raw.githubusercontent.com/Emon9426/plsql-outline/fix/bookmark-gutter-click-only/docs/design/bookmarks/repro-doubleclick/after-tripleclick-text-no-bookmark.png) |
| 双击词 L8 后拖到 L9 行首 | `collapse → other → text-gesture ×2` | ✅ 不建不删 | ![](https://raw.githubusercontent.com/Emon9426/plsql-outline/fix/bookmark-gutter-click-only/docs/design/bookmarks/repro-doubleclick/after-dblclick-word-drag-no-bookmark.png) |
| 双击词 L10 后 Shift+点击 L11 行首 | `collapse → other → other` | ✅ 不建签 | ![](https://raw.githubusercontent.com/Emon9426/plsql-outline/fix/bookmark-gutter-click-only/docs/design/bookmarks/repro-doubleclick/after-dblclick-shiftclick-no-bookmark.png) |
| 拖选 L12 中部 → L13 行首 | 全程 `other` | ✅ 不建签 | ![](https://raw.githubusercontent.com/Emon9426/plsql-outline/fix/bookmark-gutter-click-only/docs/design/bookmarks/repro-doubleclick/after-drag-midline-no-bookmark.png) |
| 从行首拖到下一行行首（L19→L20） | `collapse(列0) → other → text-gesture` | ✅ 不建签 | 见下方末态图 |

### 二、要求的能力与既有能力，逐条实机复验

| 场景 | 实测 | 结果 | 截图 |
|---|---|---|---|
| **双击行号 L3 / L4 建签** | `gutter-line` | ✅ | ![](https://raw.githubusercontent.com/Emon9426/plsql-outline/fix/bookmark-gutter-click-only/docs/design/bookmarks/repro-doubleclick/after-gutter-dblclick-creates.png) |
| 连续点行号 L16、L17（间隔 501ms） | `gutter-line` ×2 | ✅ 各建一签 | ![](https://raw.githubusercontent.com/Emon9426/plsql-outline/fix/bookmark-gutter-click-only/docs/design/bookmarks/repro-doubleclick/after-consecutive-gutter-creates.png) |
| 点正文中部后 356ms 内点同行行号 | `collapse(列13) → gutter-line` | ✅ 仍建签（未被过度抑制） | ![](https://raw.githubusercontent.com/Emon9426/plsql-outline/fix/bookmark-gutter-click-only/docs/design/bookmarks/repro-doubleclick/after-midclick-then-gutter-creates.png) |
| 末行：无签双击行号不建 / 有签双击行号删 | `gutter-last-line` | ✅ #46 语义保留 | ![](https://raw.githubusercontent.com/Emon9426/plsql-outline/fix/bookmark-gutter-click-only/docs/design/bookmarks/repro-doubleclick/after-lastline-gutter-deletes.png) |
| 末行有签后三击正文 | `other → text-gesture` | ✅ 不误删 | ![](https://raw.githubusercontent.com/Emon9426/plsql-outline/fix/bookmark-gutter-click-only/docs/design/bookmarks/repro-doubleclick/after-lastline-tripleclick-keeps.png) |

**15 项验收矩阵跑完后的末态**——书签恰为 3、4、16、17、21、22、26 七行，全部来自
行号点击或 `Ctrl+Alt+K`；正文手势所在的 5、8、10、11、12、13、14、19、20 行一律无签：

![](https://raw.githubusercontent.com/Emon9426/plsql-outline/fix/bookmark-gutter-click-only/docs/design/bookmarks/repro-doubleclick/after-final-state.png)

### 三、关于"必须双击才建签"——实测结论需要修正预期

本轮再次独立实测（60ms 与 160ms 两种人间隔）**双击行号只派发恰好一个整行事件**，
与单击、三击行号逐字段相同（第二击落在已选中行上，VS Code 零事件）。
所以"只有双击行号才建签、单击行号不建签"在扩展 API 层无法实现——这与 #44
当年三轮实现后定论的平台限制一致，本轮不是重新尝试，而是换了一条等效路径：
**把"整行选中"这一形状收紧到只可能由行号列点击产生**。实际效果：

- 双击行号 → 建签 ✅（你要的手势可用）
- 双击/三击/拖选代码行 → 不建签 ✅（误触消除）
- 代价：单击行号同样建签（平台无法区分，README 已如实说明）

### 四、已知残留（平台不可判定，非本次引入）

光标**已恰好位于 `(L,0)`** 时从 `(L,0)` 拖到 `(L+1,0)`：鼠标按下不产生事件（选区未变），
拖拽结束的整行事件与行号点击完全同形（`anchor=(L,0) active=(L+1,0)`，kind=Mouse），
扩展 API 无鼠标坐标也无按下事件 → 数学上不可区分，不抑制。触发前提较窄
（需先按 Home 或点在该行第 0 列），且一旦拖拽起点触发了列 0 塌陷事件即被抑制
（上表第 5 行走的就是这条路径）。

### 五、全量回归四件套

| 步骤 | 结果 |
|---|---|
| `npm run test:corpus` | 35/35 OK，已知缺陷 0，失败 0 |
| `npm test` | 556/556 通过（基线不变） |
| `npm run test:regression` | 15/15 套件；`bookmark_interaction` 18 → **29 断言** |
| `npm run test:e2e` | anonDefinition ✅ + smoke ✅ + foldRouting 8/8 + indexJump 11/11 + bookmark ✅，**exit 0** |

红→绿：新增 7 项正文手势契约在 v1.17.2 实现上失败（`20/27 通过`），修复后 `29/29`。

PR：见下方链接（`Fixes #50`）。

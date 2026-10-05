# 书签功能：行号单击切换 · 跟随编辑 · 富信息跳转 · 管理视图

## 一、背景与目标

在大文件 PL/SQL（数千行包体）中定位关键逻辑 currently 全靠记忆行号或反复搜索。本功能提供**行级书签**：
单击行号即打签，书签跟随内容移动，任何入口都能看到书签的完整上下文（名称/备注/行内容/行号/所属子程序/摘要），
并可通过右键菜单、QuickPick、管理视图、快捷键四种方式快速跳转。

**目标版本**：v1.17.0（feat）。

## 二、已确认的决策记录

| # | 决策点 | 结论 |
|---|---|---|
| 1 | 编辑入口 | **单击行号=切换书签（建签不弹表单）**；`Ctrl+Alt+K` 切换光标行。需要补写名称/备注时经**悬停信息卡链接、右键「书签 ▸ 编辑」、管理视图**进入两步表单（名称、备注均可留空，Esc/点击空白取消=保留书签用默认名） |
| 2 | 跳转形态 | 右键子菜单 + QuickPick 富信息列表 + 管理视图（活动栏）+ 下一/上一书签快捷键，四入口并存；**每文件书签数不设上限** |
| 3 | 书签行整行删除 | 书签随之删除（Ctrl+Z 撤销删除不恢复书签） |
| 4 | 持久化 | 按工作区持久（workspaceState），重启保留，文件重命名跟随 |
| 5 | 交互形态定案 | 原设计"双击行号切换"经三轮实现 + SendInput 真实 OS 输入实测**不可行**（平台限制，见 5.2），定稿为单击切换 + 快捷键 |

## 三、交互设计（6 张原型图）

### 3.1 单击行号 → 建签

![建签与信息表单](https://raw.githubusercontent.com/Emon9426/plsql-outline/main/docs/design/bookmarks/01-double-click-create-form.png)

- **单击未选中行的数字行号** → 立即建签（琥珀色缎带图标出现在行号旁 + 整行淡琥珀高亮 + 滚动条标记），**不弹表单**。
- **删除**：点击其他行使选区移开，再点回该书签行行号 = 删签（平台对同选区重复点击零事件 = 天然防手抖连点误删）。
- `Ctrl+Alt+K` 在光标行切换书签（建/删）。
- 编辑表单按需进入（见决策 #1）：两步输入 ①书签名称（可空，回车下一步）②书签备注（可空，回车完成）；
  Esc / 点击编辑器空白处随时取消表单：**书签保留**，名称回退默认值（行内容前 40 字符）。
- 注意：单击目标是**数字行号列**；琥珀图标所在的 glyph margin 列 VS Code 平台不向扩展派发点击事件，无法交互。

### 3.2 悬停信息卡（含编辑/删除链接）

![悬停信息卡](https://raw.githubusercontent.com/Emon9426/plsql-outline/main/docs/design/bookmarks/02-hover-card.png)

- 悬停书签行（图标或正文任意位置）即显示完整信息：名称、备注、行内容、行号、所属子程序、摘要。
- 卡内提供「✏️ 编辑书签…」「🗑 删除书签」命令链接（hover 命令链接，原生支持）。

### 3.3 右键菜单「书签」子菜单

![右键子菜单](https://raw.githubusercontent.com/Emon9426/plsql-outline/main/docs/design/bookmarks/03-context-menu.png)

- 编辑器右键菜单新增「书签」子菜单（`contributes.submenus`，语言限定 sql/plsql 文件）。
- 项：切换书签（当前行）/ 浏览全部书签… / 下一处书签 / 上一处书签 / 编辑书签信息… / 删除当前行书签 / 清除本文件全部书签（弹确认对话框）。
- 说明：VS Code 右键菜单项为静态声明，无法直接罗列动态书签条目、也无法在菜单项上显示动态徽标——富信息列表由「浏览全部书签…」的 QuickPick 承载（3.4）。

### 3.4 QuickPick：浏览全部书签（当前文件）

![QuickPick 列表](https://raw.githubusercontent.com/Emon9426/plsql-outline/main/docs/design/bookmarks/04-quickpick.png)

- 每个条目三行：`★ 名称 · 行 N` / 行内容预览 / `所属子程序 · 摘要 · 备注`。
- 顶部输入框实时过滤（匹配名称、行内容、所属、备注）。
- 回车跳转（reveal 行首并高亮该书签行），Esc 关闭；底部显示书签总数。

### 3.5 管理视图（活动栏 → PL/SQL 大纲容器新增「书签」视图）

![管理视图](https://raw.githubusercontent.com/Emon9426/plsql-outline/main/docs/design/bookmarks/05-manage-view.png)

- **全工作区**书签总览：按文件分组（文件节点带书签数徽标），子节点=书签（图标 + 名称 + `L行号 · 所属子程序` 描述）。
- 单击书签项 = 打开文件并跳转；右键项：编辑书签信息… / 删除书签。
- 视图标题栏：「浏览全部（当前文件）」「清空当前文件书签」；容器图标带书签总数徽标。
- 无书签时视图默认折叠（`visibility:collapsed`，只留节头不占空间）；首个书签出现时自动展开并定位。
- 滚动条右侧显示琥珀色书签标记（overviewRuler，点击跳转）。

### 3.6 书签跟随内容自动调整

![跟随编辑](https://raw.githubusercontent.com/Emon9426/plsql-outline/main/docs/design/bookmarks/06-line-tracking.png)

书签锚定**内容**而非行号。规则：

| 编辑操作 | 书签行为 |
|---|---|
| 书签行上方插入 N 行 | 下移 N 行（用户示例：bbb 行书签 2→3 ✓） |
| 书签行上方删除 N 行 | 上移 N 行 |
| 书签行**行首**插入带换行文本（推挤本行内容） | 跟随内容下移 |
| 书签行内改字符 / 行首插入不带换行文本 / 行尾编辑 | 保留原行号 |
| 书签行被**整行删除**或跨行替换覆盖 | 书签随之删除（决策 #3） |
| 撤销 / 重做 | 与普通编辑同规则（同一事件流） |
| 多光标同时编辑 | 各 change 按位置降序逐一应用 |

## 四、信息字段定义

| 字段 | 来源 | 说明 |
|---|---|---|
| 书签名 | 用户输入 | 可空；空时显示 = 行内容 trim 后前 40 字符（实时取，不存快照；空行显示「(空行)」） |
| 备注 | 用户输入 | 可空纯文本 |
| 行号 | 模型实时值 | 随编辑自动迁移 |
| 行内容预览 | 实时取行文本 | trim 后截断 ~80 字符 |
| 所属 Function/Procedure | 大纲解析结果 | 包含该行的**最内层**子程序节点（含嵌套子程序；兜底：包体/触发器/匿名块；都不在则显示「（顶层）」）。复用现有 `currentParseResult` 与光标跟随同源的查找逻辑 |
| 摘要 | 大纲解析结果实时计算 | 根到最内层节点的结构链路，如 `order_mgr → calc_total → Body → LOOP`；不落盘 |

## 五、技术实现要点

### 5.1 模块划分（遵循 vscode-free 核心惯例，同 folding.ts/highlight.ts）

```
src/bookmarks.ts      （vscode-free 核心，单测直接 require）
  ├─ applyDocumentChanges(bookmarks, changes, lineCount)   // 3.6 规则的纯函数实现
  └─ findEnclosingSymbol / buildSummaryChain               // 所属与摘要（输入 ParseNode[]）
src/bookmarkManager.ts 装饰器/选区事件/命令/QuickPick/两步表单/持久化（workspaceState v1）
src/bookmarkView.ts    管理视图 TreeDataProvider（跨文件分组）
res/icons/bookmark(-light).svg   琥珀缎带形（#f0c040 / #c8881a，scripts/generate_icons.js 扩展）
package.json          commands / keybindings / submenus / views
```

（原设计的 GutterClickDetector 双击/单击判定状态机随双击方案证伪而删除。）

### 5.2 单击切换契约（含平台限制实证）

- 监听 `onDidChangeTextEditorSelection`，仅处理 `kind === Mouse` 且**单行整行选中**事件
  （`[L,0) → [L+1,0)`，点击行号的原生效果；正文双击选词、三击、拖选均为非整行，不误触）。
- **平台限制（SendInput + 事件轨迹实测实锤）**：双击的第二击落在已选中行上时，VS Code 对
  "同值选区"**不派发任何事件**——双击在 API 层不可检测；唯一可靠信号是点击**未选中**行号
  产生的整行选中事件。故交互定稿为：收到整行选中事件 → 直接切换书签。
  同选区重复点击零事件 = 天然防手抖连点误删（删除 = 点其他行后再点回）。
- **幽灵切换防护（实机捕获）**：窗口失焦/关闭瞬间 VS Code 偶发**重放**整行 Mouse 选区事件
  （两次捕获：WM_CLOSE 关窗时、前台切换空档），凭空建签——仅在 `window.state.focused`
  为真时接受整行切换（真实点击必在聚焦窗口）。

### 5.3 装饰器

- glyph margin 图标（琥珀缎带）+ 行背景淡琥珀高亮（`isWholeLine: true`）+ overviewRuler 标记 + hoverMessage 信息卡（MarkdownString 命令链接）。
- 装饰区间必须**行起点零宽区间** `Range(line,0,line,0)`：区间吞换行符（`rangeIncludingLineBreak`）时终点触下一行行首，VS Code 会把 gutter 图标**渗染到下一行**（装机实测一次点击双图标，已修复并有回归契约锁定）。

### 5.4 持久化与生命周期

- `context.workspaceState`，key `plsqlOutline.bookmarks.v1`：`{ [uriString]: [{ line, name, note, createdAt }] }`。
- `onDidRenameFiles` 跟随重命名；`onDidDeleteFiles` 清理；仅对支持扩展名（现有 fileExtensions 设置口径）生效。
- 书签操作即时落盘（无防抖丢失风险），管理视图与装饰器同源刷新。

## 六、命令与键位

| 命令 | 标题 | 键位（默认，可改） |
|---|---|---|
| plsqlOutline.bookmark.toggle | 切换书签（当前行） | **Ctrl+Alt+K**（或单击行号） |
| plsqlOutline.bookmark.list | 浏览全部书签… | ——（右键菜单） |
| plsqlOutline.bookmark.next | 下一处书签 | Alt+PgDn |
| plsqlOutline.bookmark.previous | 上一处书签 | Alt+PgUp |
| plsqlOutline.bookmark.edit | 编辑书签信息… | —— |
| plsqlOutline.bookmark.delete | 删除当前行书签 | —— |
| plsqlOutline.bookmark.clearFile | 清除本文件全部书签 | —— |

不新增设置项（保持零配置开箱即用；`plsql-outline.debug.enabled` 已有的调试轨迹会记录选区事件形态与
`focused=` 状态供交互问题定位）。

## 七、测试计划（实施结果）

- **单元**（tests/unit/bookmark.test.js，26 用例）：跟随算法 16（用户示例 aaa/bbb/ccc、上方增/删、
  行首插入带/不带换行、行内改、整行删、跨行替换、多 change 降序、clamp）；所属与摘要 5（真实 parser
  输出：嵌套子程序、包体、匿名块、顶层）；文本预览辅助 5。
- **回归**（tests/regression/bookmark_interaction_test.js，11 断言）：单击建签不弹表单 / 塌陷与拖选
  不误删 / 点开点回删签 / 键盘事件忽略 / 已建签行切换删除 / **装饰区间行起点零宽契约** /
  **失焦重放不建签**。
- **E2E**（tests/e2e/）：命令建删签 / 编辑跟随迁移（用户示例）/ 整行删签 / 环绕跳转（getState 快照断言）。
- **铁律全量回归**：corpus 35/35 → 单元 551/551(32) → 回归 15/15 → e2e 全绿，.ai/testing.md 基线同步。
- **实机 SendInput 验证**：单击建签 ×10、点开点回删签、Ctrl+Alt+K 建删签，事件追踪日志 ↔ 持久化
  memento ↔ 截图三重证据闭环；装机反馈的两个渲染/时序缺陷（图标渗染、幽灵建签）修复后复验通过。

## 八、验收清单（已全部通过）

- [x] 单击行号建签（图标+高亮+滚动条标记，仅此一行，不渗染邻行）；点开点回删签
- [x] Ctrl+Alt+K 切换光标行书签（建/删）
- [x] 建签不弹表单；按需经悬停卡/右键/管理视图进入两步表单，Esc/点空白取消后书签保留
- [x] 悬停信息卡五字段齐全 + 编辑/删除链接可用
- [x] 右键子菜单七项全部可用，浏览徽标数字正确
- [x] QuickPick：过滤、回车跳转、总数显示；跨行内容截断正常
- [x] 管理视图：按文件分组、点击跳转、右键编辑/删除、总数徽标、空态折叠首签自展
- [x] Alt+PgDn / Alt+PgUp 循环跳转（文件内环绕）
- [x] 跟随规则表全部用例单测通过（含用户示例 2→3）
- [x] 整行删除书签消失；重命名文件书签跟随；重启 VS Code 书签保留
- [x] 全量回归四件套绿 + .ai 基线更新 + README/CHANGELOG 同步

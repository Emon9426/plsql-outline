# 书签功能：行号双击切换 · 跟随编辑 · 富信息跳转 · 管理视图

## 一、背景与目标

在大文件 PL/SQL（数千行包体）中定位关键逻辑 currently 全靠记忆行号或反复搜索。本功能提供**行级书签**：
双击行号即打签，书签跟随内容移动，任何入口都能看到书签的完整上下文（名称/备注/行内容/行号/所属子程序/摘要），
并可通过右键菜单、QuickPick、管理视图、快捷键四种方式快速跳转。

**目标版本**：v1.17.0（feat）。

## 二、已确认的决策记录

| # | 决策点 | 结论 |
|---|---|---|
| 1 | 编辑入口 | 双击行号建签后**立即弹出信息表单**（名称、备注两步输入，均可留空，点击空白/Esc 取消=保留书签用默认名）；已建签的行**单击行号或悬停信息卡**进入编辑 |
| 2 | 跳转形态 | 右键子菜单 + QuickPick 富信息列表 + 管理视图（活动栏）+ 下一/上一书签快捷键，四入口并存；**每文件书签数不设上限** |
| 3 | 书签行整行删除 | 书签随之删除（Ctrl+Z 撤销删除不恢复书签） |
| 4 | 持久化 | 按工作区持久（workspaceState），重启保留，文件重命名跟随 |

## 三、交互设计（6 张原型图）

### 3.1 双击行号 → 建签 + 信息表单

![双击建签与信息表单](https://raw.githubusercontent.com/Emon9426/plsql-outline/main/docs/design/bookmarks/01-double-click-create-form.png)

- 双击行号（或 glyph margin 书签图标区）→ 立即建签，琥珀色缎带图标出现在行号旁。
- 随后弹出两步表单：①书签名称（可空，回车下一步）②书签备注（可空，回车完成）。
- Esc / 点击编辑器空白处随时取消表单：**书签保留**，名称回退默认值（行内容前 40 字符）。
- 双击已有书签的行号 → 删除书签（不弹表单）。

### 3.2 悬停信息卡（含编辑/删除链接）

![悬停信息卡](https://raw.githubusercontent.com/Emon9426/plsql-outline/main/docs/design/bookmarks/02-hover-card.png)

- 悬停书签行（星标或正文任意位置）即显示完整信息：名称、备注、行内容、行号、所属子程序、摘要。
- 卡内提供「✏️ 编辑书签…」「🗑 删除书签」命令链接（hover 命令链接，原生支持）。
- 已建签行的行号/gutter **单击**（500ms 内无第二击）同样打开编辑表单——与双击切换天然兼容。

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
  ├─ DoubleClickDetector                                  // 行号双击/单击延迟判定状态机
  ├─ findEnclosingSymbol / buildSummaryChain               // 所属与摘要（输入 ParseNode[]）
  └─ BookmarkStore 序列化模型（与 vscode 无关的纯数据）
src/bookmarkView.ts   管理视图 TreeDataProvider（跨文件分组）
extension.ts          接线：装饰器、事件监听、QuickPick、两步 InputBox 表单、workspaceState 读写
res/icons/bookmark(-light).svg   琥珀缎带形（#f0c040 / #c8881a，scripts/generate_icons.js 扩展）
package.json          commands / keybindings / submenus / views
```

### 5.2 双击/单击判定（VS Code 无鼠标事件的启发式）

- 监听 `onDidChangeTextEditorSelection`，仅处理 `kind === Mouse` 且**单行整行选中**的事件
  （点击行号/gutter 的原生效果；正文双击选词、三击前的事件均为非整行，不误触）。
- 同一行两次整行 Mouse 选中间隔 < 500ms → 判定双击 → 切换书签。
- 已建签行：单击后 500ms 无第二击 → 打开编辑表单（决策 #1 的"单击编辑"）。
- 已知极限：快速连点两次行号（本意两次单击）会被判定为双击——主流书签扩展同样接受此权衡。

### 5.3 装饰器

- glyph margin 图标（琥珀缎带）+ 行背景淡琥珀高亮 + overviewRuler 标记 + hoverMessage 信息卡（MarkdownString 命令链接）。
- `editor.glyphMargin` VS Code 默认已开启；若用户手动关闭，首次建签时通知一次并提供「启用」按钮（workspace 级）。

### 5.4 持久化与生命周期

- `context.workspaceState`，key `plsqlOutline.bookmarks.v1`：`{ [uriString]: [{ line, name, note, createdAt }] }`。
- `onDidRenameFiles` 跟随重命名；`onDidDeleteFiles` 清理；仅对支持扩展名（现有 fileExtensions 设置口径）生效。
- 书签操作即时落盘（无防抖丢失风险），管理视图与装饰器同源刷新。

## 六、命令与键位

| 命令 | 标题 | 键位（默认，可改） |
|---|---|---|
| plsqlOutline.bookmark.toggle | 切换书签（当前行） | ——（双击行号） |
| plsqlOutline.bookmark.list | 浏览全部书签… | ——（右键菜单） |
| plsqlOutline.bookmark.next | 下一处书签 | Alt+PgDn |
| plsqlOutline.bookmark.previous | 上一处书签 | Alt+PgUp |
| plsqlOutline.bookmark.edit | 编辑书签信息… | —— |
| plsqlOutline.bookmark.delete | 删除当前行书签 | —— |
| plsqlOutline.bookmark.clearFile | 清除本文件全部书签 | —— |

不新增设置项（保持零配置开箱即用；后续按反馈再加）。

## 七、测试计划

- **单元**（tests/unit/ 新增 bookmark.test.js）：
  - 跟随算法 ≥12 用例：用户示例（aaa/bbb/ccc）、上方增/删、行首插入带/不带换行、行内改、整行删、跨行替换、多 change 降序、undo 语义、clamp；
  - 双击状态机：单击/双击/慢双击/三击/跨行/非整行；
  - 所属与摘要：基于真实 parser 输出（含嵌套子程序、包体、匿名块、顶层）。
- **E2E**（tests/e2e/bookmark.e2e.test.js，沿用现有驱动模式）：toggle 建签/删签 → 装饰与视图反映；applyEdit 插入行 → 书签行号迁移；workspaceState 重启保留。
- **铁律全量回归**：test:corpus 35/35 → npm test → test:regression → test:e2e 全部通过，.ai/testing.md 基线同步。

## 八、验收清单

- [ ] 双击行号建签（图标+高亮+滚动条标记），再双击删签
- [ ] 建签后自动弹两步表单，Esc/点空白取消后书签保留且名称回退行内容预览
- [ ] 已建签行单击行号 / 悬停信息卡 → 编辑名称与备注
- [ ] 悬停信息卡五字段齐全 + 编辑/删除链接可用
- [ ] 右键子菜单七项全部可用，浏览徽标数字正确
- [ ] QuickPick：过滤、回车跳转、总数显示；跨行内容截断正常
- [ ] 管理视图：按文件分组、点击跳转、右键编辑/删除、总数徽标
- [ ] Alt+PgDn / Alt+PgUp 循环跳转（文件内环绕）
- [ ] 跟随规则表全部用例单测通过（含用户示例 2→3）
- [ ] 整行删除书签消失；重命名文件书签跟随；重启 VS Code 书签保留
- [ ] 全量回归四件套绿 + .ai 基线更新 + README/CHANGELOG 同步

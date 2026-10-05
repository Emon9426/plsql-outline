# 项目概览（plsql-outline）

VS Code 扩展：解析 PL/SQL 代码为结构化大纲树，让 VS Code 拥有类似 PL/SQL Developer 的大纲视图。
- 仓库：github.com/Emon9426/plsql-outline（SSH 远端，直接提交 main；发版走 PR）
- 发布者：EmonZhang3438；许可证 MIT；引擎 `^1.74.0`
- 技术栈：TypeScript（strict）+ 纯 tsc 编译（无打包器），**零运行时依赖**
- 作者/用户：Emon，Windows + Git Bash，中文交流，以 PL/SQL Developer 的行为为 UX 基准

## 目录结构

```
src/            扩展源码（12 个模块，编译到 out/）
tests/
  unit/         解析器/渲染单元套件（自研断言，node tests/unit/run_all.js）
  regression/   回归套件（node tests/regression/run_all.js）
  corpus/       33 文件 PL/SQL 语料 + validate/render-validate（详见其 README）
  e2e/          真实 VS Code E2E（@vscode/test-electron）
res/            图标（Icon.png 封面 + icons/ 树节点 SVG，深浅两套）
docs/           design/（历史设计文档）+ demo/（示例 SQL）
.ai/            本知识库
release/        vsix 输出（不入库）
scripts/        图标生成器等工具脚本
```

## 模块依赖流

```
extension.ts（激活/命令/事件接线，入口 activate()）
  ├─ parser.ts ──── PLSQLParser：手写行级状态机（每次解析必须 new 独立实例！）
  │    └─ types.ts  NodeType/ParseNode/ParseResult 等共享模型
  ├─ folding.ts ─── 折叠范围纯计算（vscode-free；extension.ts 的
  │                 FoldingRangeProvider 复用大纲解析缓存，未命中时兜底解析）
  ├─ treeView.ts ── PLSQLOutlineProvider（TreeDataProvider：大纲数据模型/过滤/标签
  │                 /图标/展开规则——单 Webview 重构后作为纯模型层保留）
  ├─ outlineWebview.ts 大纲单 Webview 视图（v1.17.0：输入框+HTML 树同窗格渲染，
  │                 消息协议 model/select/filter/click/copy，键盘导航自实现）
  ├─ symbolIndex.ts 符号索引（跨文件跳转，磁盘缓存 symbol-index.json）
  ├─ bookmarks.ts ─ 书签核心纯逻辑（vscode-free：行号跟随算法/
  │                 所属子程序与摘要链路，v1.17.0）
  ├─ bookmarkManager.ts 书签管理器（装饰器/事件/命令/QuickPick/两步表单/
  │                 workspaceState 持久化/重命名删除跟随）
  ├─ bookmarkView.ts 书签管理视图（活动栏容器内按文件分组树 + 徽标）
  ├─ debug.ts ───── DebugManager/Logger（调试输出，文件输出已废弃）
  ├─ settingsPanel.ts 设置页 webview（由 settingsSchema.ts 驱动）
  └─ shared.ts / logger.ts 常量、通用谓词、统一 OutputChannel
```

## 关键设计决策（勿轻易推翻）

1. **解析器实例隔离**（Issue #15/#16，v1.7.3）：`PLSQLParser` 有大量可变实例状态，
   每次解析必须 `new PLSQLParser().parse(...)`；并发靠实例隔离而非互斥锁。
2. **光标跟随自动展开（Issue #22，v1.13.0 起）**：光标进入 Declare/Body/Exception
   区域时，跟随选中对应区域文件夹，reveal 依赖 VS Code 原生沿父链自动展开祖先
   （仅展开、绝不折叠）。这**取代**了 v1.6.4 的"目标不可见即跳过"门控
   （expansionOverrides 覆盖表与 isTargetVisible 已删除）；用户手动折叠仍随时可收回。
   TreeItem 用稳定 `id` 保证刷新后展开/选中状态保留。
3. **点击跳转、箭头展开**：所有可展开节点必须设置 `command`（v1.6.3 教训）。
4. **图标（四类家族，Issue #42）**：树节点用 res/icons/ 自绘 SVG，由
   `scripts/generate_icons.js` 生成（深浅两套）：DB 对象=数据库圆筒（P=蓝 / F=琥珀），
   主结构=文件夹形（folder-decl/sub/body/anon/exc），分支=流程图蓝菱形 branch
   （IF/ELSIF/ELSE/CASE/WHEN），循环=琥珀环箭头 loop（LOOP/FOR/WHILE）；
   END 结构块保留灰⏹ 几何符号语义色（BEGIN 无叶子——语义由 Body 文件夹承载，
   begin 图标与相关死分支已删），颜色全部复用现有调色板。
   marketplace README 不允许内联 SVG，图标表用文字。
5. **解析器保持 vscode-free**：单元测试直接 `require('../../out/parser')`，
   因此 parser.ts 不得 import 'vscode'。
6. **中文注释/中文 UI**：代码注释与用户可见文案均为中文，保持既有风格。
7. **符号索引（Issue #38/#39）**：`SymbolIndex.buildIndex` 写入线上 Map 的克隆、
   完成后原子切换，构建期间旧索引持续可查（推翻"先 clear 再重建"）；构建期间到达的
   watcher 更新/当前文件 upsert 进待处理队列、切换前收敛式重放；当前文件解析结果经
   `upsertFromParseResult` 即时并入；**#39**：提取走轻量扫描器 `symbolScanner.ts`
   （复用 parser 的 preprocessContentForScan/matchCreateForScan/matchSubprogramForScan
   三个 ForScan 包装，单一正则事实源；corpus 一致性单测锁定"解析器符号 ⊆ 扫描器符号，
   超集仅限嵌套子程序"），缓存 v3 记录每文件 mtime+size → 增量构建（命中跳过、消失
   移除；手动重建 forceFull 全量兜底），文件读取分块并行（IO_CHUNK=64）按扫描顺序
   应用保证条目顺序确定；parser 清洗层 stripLiteralsAndComments 加等价快路径
   （无 ' / -- / /* 且无跨行状态 → 跳过逐字符扫描，解析与扫描共同提速）；
   Ctrl+T 工作区符号搜索（searchSymbols，支持 pkg.func 双重过滤；**游标为仅搜索
   条目**——Emon 2026-09-24 决策纳入搜索：NodeType.CURSOR 进索引、lookup 过滤
   不参与跳转、缓存 v4（提取口径变更升版）、包内游标带所属包）；状态栏常驻三态
   （extension.ts createIndexStatusBar）。
8. **大纲交互五件套（Issue #36，v1.14.0）**：
   - 嵌套缩进改**原生树缩进**（configurationDefaults 提供 `workbench.tree.indent=16`
     + `renderIndentGuides=always`，用户显式配置优先），**推翻 #33 的 NBSP 标签伪缩进**
     （图标不随标签移动、参考线与文字错位，TreeItemData.displayIndent 已删除）；
   - **逐级展开**：控制结构/文件夹默认折叠，顶层对象沿 view.expandByDefault；
     forceExpandAll 补齐为文件夹也强制展开；
   - **搜索过滤**在 provider 层实现（computeChildren 原始口径 + applyFilter 保留
     命中与祖先链），过滤期间 id 加 `::f` 后缀获得独立展开状态、清空复原；
     **v1.17.0 起大纲为单 Webview 视图（plsqlOutline，Emon 最终选型）**——输入框
     与 HTML 树同窗格一体渲染；此前方案全部被实机像素证伪：双窗格必有 ≈90px
     空白带+1px 分隔线（TreeView 窗格无法渲染输入框、Webview 窗格高度无 API），
     节头归属交换/无节头/树首项伪搜索行均无法消除窗格边界；模型仍由 provider
     构建（computeChildren/applyFilter 全复用），OutlineWebviewManager 序列化
     全量树发 webview；searchBox.ts 与 TreeViewManager 已删除；光标跟随
     selectAndRevealTarget 语义保留（select 消息+id 定位）；缓存键含文件前缀
     （currentSourceFileTag）需 getChildren 预热后才一致（cursor_follow_region
     移植时发现）；
   - 光标跟随在过滤期间暂停；悬浮聚合走 getScopeCursorSqls（仅直接作用域）。
9. **书签（v1.17.0）**：交互为**单击行号切换 + Ctrl+Alt+K**（Emon 选型定案）。
   双击方案三轮失败后用 SendInput 真实 OS 输入 + 选区事件追踪日志实锤平台限制：
   **双击第二击落在已选中行上时 VS Code 对同值选区不派发任何事件**，双击在
   API 层不可检测；唯一可靠信号是点击未选中行号产生的整行选中事件
   `[L,0)-[L+1,0)`，onSelectionChanged 据此直接切换（Mouse kind 限定，塌陷/
   拖选/键盘忽略；同选区重复点击零事件=天然防手抖）。GutterClickDetector
   状态机作为死代码已删。渲染契约：gutter 装饰区间必须行起点零宽 +
   isWholeLine（区间吞换行符会渗染下一行图标，装机反馈修复）；失焦瞬间
   VS Code 偶发重放整行 Mouse 事件（幽灵建签），仅在 window.state.focused
   时接受切换。书签**锚定行内容**：
   行首插入带换行文本才推挤下移；"整行删除=删签"的判定口径是**变更区间吞掉该行
   换行符**（只删行内文本不删换行则保留）。所属/摘要实时从 currentParseResult
   计算（sourceFile 同源校验），不落盘。持久化 workspaceState v1 结构，文件
   重命名/删除跟随。设计原型图与 Issue 文案归档在 docs/design/bookmarks/。

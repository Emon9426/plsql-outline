# 项目概览（plsql-outline）

VS Code 扩展：解析 PL/SQL 代码为结构化大纲树，让 VS Code 拥有类似 PL/SQL Developer 的大纲视图。
- 仓库：github.com/Emon9426/plsql-outline（SSH 远端，直接提交 main；发版走 PR）
- 发布者：EmonZhang3438；许可证 MIT；引擎 `^1.74.0`
- 技术栈：TypeScript（strict）+ 纯 tsc 编译（无打包器），**零运行时依赖**
- 作者/用户：Emon，Windows + Git Bash，中文交流，以 PL/SQL Developer 的行为为 UX 基准

## 目录结构

```
src/            扩展源码（9 个模块，编译到 out/）
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
  ├─ treeView.ts ── PLSQLOutlineProvider（TreeDataProvider）+ TreeViewManager
  ├─ searchBox.ts ─ 大纲搜索框 Webview 视图（Issue #36，置于树上方）
  ├─ symbolIndex.ts 符号索引（跨文件跳转，磁盘缓存 symbol-index.json）
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
4. **图标**：树节点用 res/icons/ 自绘 SVG（数据库圆柱主题，P=蓝 / F=琥珀，深浅两套），
   由 `scripts/generate_icons.js` 生成；marketplace README 不允许内联 SVG，图标表用文字。
5. **解析器保持 vscode-free**：单元测试直接 `require('../../out/parser')`，
   因此 parser.ts 不得 import 'vscode'。
6. **中文注释/中文 UI**：代码注释与用户可见文案均为中文，保持既有风格。
7. **大纲交互五件套（Issue #36，v1.14.0）**：
   - 嵌套缩进改**原生树缩进**（configurationDefaults 提供 `workbench.tree.indent=16`
     + `renderIndentGuides=always`，用户显式配置优先），**推翻 #33 的 NBSP 标签伪缩进**
     （图标不随标签移动、参考线与文字错位，TreeItemData.displayIndent 已删除）；
   - **逐级展开**：控制结构/文件夹默认折叠，顶层对象沿 view.expandByDefault；
     forceExpandAll 补齐为文件夹也强制展开；
   - **搜索过滤**在 provider 层实现（computeChildren 原始口径 + applyFilter 保留
     命中与祖先链），过滤期间 id 加 `::f` 后缀获得独立展开状态、清空复原；
     搜索框是树上方独立 Webview 视图（searchBox.ts，过滤词为唯一持有方）；
   - 光标跟随在过滤期间暂停；悬浮聚合走 getScopeCursorSqls（仅直接作用域）。

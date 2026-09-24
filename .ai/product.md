# 产品说明（product）

## 功能清单（面向用户）

- **结构化大纲**：包规格/包体/存储过程/函数/触发器/匿名块/TYPE(BODY)/视图，
  支持嵌套子程序、声明区分组（变量/游标/常量/类型/异常）、控制结构（IF/LOOP/CASE…）、
  Exception 段；内联 DECLARE..END 块渲染为宿主 Body 内可展开分组。
- **大纲交互（Issue #36）**：
  - **逐级展开**：控制结构（含合并 IF）与区域文件夹默认折叠——展开父级只露出一级，
    子层级逐级手动展开；「展开所有」命令仍强制全展开；顶层对象沿 view.expandByDefault
    （默认开）展开一层。
  - **嵌套缩进**：层级由原生树缩进表达（图标随层级移动、图标-文字间距固定、参考线
    与图标对齐）；经 configurationDefaults 提供 `workbench.tree.indent=16`（默认 8 的
    两倍）与 `renderIndentGuides=always`，用户显式配置优先。
  - **搜索过滤**：大纲树上方常驻搜索框（Webview 视图），输入实时过滤（200ms 防抖）——
    命中节点/声明项及其祖先链保留，其余隐藏；过滤期间命中分支自动展开、标题栏显示
    命中数、光标跟随暂停；回车跳转首个命中，Esc/✕ 清除并恢复原展开状态。
  - **复制名称**：右键大纲项「复制名称」（过程/函数/包/触发器/TYPE/视图与声明项），
    复制干净标识符入剪贴板。
  - **悬浮游标 SQL 聚合**：悬浮大纲单元节点（或编辑器中的单元名）显示该单元直接
    作用域内声明的全部游标 SQL（逐条 ```sql 块，原生悬浮高度自适应；嵌套子程序
    作用域不并入父级）；悬浮单个游标项/游标名仍显示该游标完整 SQL（#33）。
- **代码导航**：点击节点跳转定义行；Ctrl+Click 跨文件跳转（符号索引，含代码仓库路径，
  最多 2 个、按优先级）；光标移动自动同步选中大纲节点（不自动展开）。
- **符号索引**（Issue #38/#39）：索引影子构建 + 原子切换——重建期间旧索引/磁盘缓存
  持续可查，不再出现"重建窗口期跳转全黑"；当前打开文件的符号在解析后即时并入索引
  （无需等仓库扫描完成）；**增量构建**（mtime+size 缓存命中即跳过，重启秒级就绪）+
  **轻量符号扫描器**（不建大纲树，只提取跳转所需符号；与全量解析器保持 corpus
  一致性对照）+ 分块并行文件读取；状态栏常驻三态项「PL/SQL 跳转未启用 /
  索引构建中 x/y / 索引就绪 · N 符号」（点击：未配置→打开设置页，已配置→查看日志）；
  构建中未命中跳转时状态栏提示"索引构建中，跨文件跳转暂不可用"；手动重建带真实
  进度、可取消、强制全量重扫、完成落盘；**Ctrl+T 工作区符号搜索**——基于索引按名
  搜索全仓库的包/函数/过程/触发器/**游标**（游标为仅搜索条目：包内带所属包可
  `pkg.cursor` 双重过滤，但不参与 Ctrl+Click 跳转解析，跳转语义不变），支持
  `pkg.func` 写法按包名+名称双重过滤。
- **块结构代码折叠**（Issue #23，#31 补段折叠）：FoldingRangeProvider 复用解析起止
  行号，提供编辑器原生折叠箭头——Function/Procedure→END、IF→END IF（IF/ELSIF/ELSE
  兄弟链合并）、LOOP/WHILE/FOR→END LOOP、CASE→END CASE、匿名块→END、Package Body
  整体；**BEGIN 段**（BEGIN 行→该块 END）与 **EXCEPTION 段**（EXCEPTION 行→END）
  独立折叠（#31）；ELSIF/ELSE/WHEN 不独立折叠；未闭合节点（包规格/触发器根）不折叠。
  计算逻辑在 src/folding.ts（vscode-free）。折叠保留首行为 VS Code 原生行为。
- **结构关键字配对高亮**（Issue #31）：DocumentHighlightProvider——双击（词高亮）
  结构关键字时配对关键字一起高亮：块级 DECLARE/BEGIN/EXCEPTION/END 按节点层级
  配对（子程序无 DECLARE 则 BEGIN/EXCEPTION/END）；IF→该块的 IF/ELSIF/ELSE/END IF；
  循环→其 FOR|WHILE/LOOP/END LOOP（END IF / END LOOP 中的 END 与 IF/LOOP 同样命中）。
  非结构关键字/字符串注释内/END CASE 等返回空——VS Code 回退原生相同词高亮，
  原生行为不受影响。关键字定位复用解析器 Q-quote 扫描（掩码与解析同口径），
  掩码/配对组按 (uri, version) 懒计算缓存。实现在 src/highlight.ts（vscode-free）。
- **解析进度与刷新**（Issue #23）：解析进度显示在大纲视图内（面板顶部进度条，
  解析完成大纲更新后才消失，替代右上角通知）；顶部 Refresh 按钮 = 强制重新解析
  当前活动文件并刷新大纲（旧实现仅重绘旧结果）。
- **实用工具**：解析统计、导出解析结果（JSON）、展开全部、切换结构块显示、调试模式、
  文件扩展名管理、设置页（`plsqlOutline.openSettings`）。
- **文件类型**：默认 `.sql .fnc .fcn .prc .pks .pkb .typ`（可配置）。
- **性能**：1 万行解析约 20–65ms；10MB / 5 万行硬保护；解析可取消（v1.8.0 起）。

## 设置项（v1.8.0 起，与 src/settingsSchema.ts 单源同步）

| 分组 | 键 | 类型/默认 | 说明 |
|---|---|---|---|
| 解析 | parsing.autoParseOnSave | bool / true | 保存时自动解析 |
| 解析 | parsing.autoParseOnSwitch | bool / true | 切换到 PL/SQL 文件时自动解析 |
| 解析 | parsing.maxNestingDepth | number / 15（5–30） | 最大嵌套深度保护 |
| 视图 | view.showStructureBlocks | bool / true | 显示 BEGIN/EXCEPTION/END 结构块 |
| 视图 | view.expandByDefault | bool / true | 默认展开节点 |
| 视图 | view.autoSelectOnCursor | bool / true | 光标移动自动选中节点 |
| 视图 | view.showDeclarations | bool / true | 显示声明项 |
| 视图 | view.groupDeclarations | bool / true | 声明项按类别分组 |
| 文件类型 | fileExtensions | string[] / 7 项默认 | 支持解析的扩展名（Global 作用域） |
| 代码仓库 | codeRepository.paths | object[] / []（≤2） | 跨文件跳转的仓库路径+优先级 |
| 代码仓库 | codeRepository.fileExtensions | string[] / 7 项默认 | 索引扫描的扩展名 |
| 代码仓库 | codeRepository.autoIndex | bool / true | 启动时自动构建索引 |
| 代码仓库 | codeRepository.maxFiles | number / 5000（100–20000） | 索引扫描文件上限 |
| 调试 | debug.enabled | bool / false | 调试输出（输出通道） |
| 调试 | debug.logLevel | enum / INFO | ERROR/WARN/INFO/DEBUG |

v1.8.0 删除的无效设置（从未被程序读取）：parsing.maxLines / maxParseTime /
maxFileSize / enableMemoryOptimization、debug.outputPath / keepFiles / maxFiles。

## 联系方式（README「反馈与联系」同源）

- GitHub Issues：https://github.com/Emon9426/plsql-outline/issues
  （好 issue 要素：VS Code 版本、扩展版本、最小复现代码片段、期望大纲 vs 实际大纲）
- 邮箱：emonzhang3438@outlook.com

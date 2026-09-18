# 产品说明（product）

## 功能清单（面向用户）

- **结构化大纲**：包规格/包体/存储过程/函数/触发器/匿名块/TYPE(BODY)/视图，
  支持嵌套子程序、声明区分组（变量/游标/常量/类型/异常）、控制结构（IF/LOOP/CASE…）、
  Exception 段；内联 DECLARE..END 块渲染为宿主 Body 内可展开分组。
- **代码导航**：点击节点跳转定义行；Ctrl+Click 跨文件跳转（符号索引，含代码仓库路径，
  最多 2 个、按优先级）；光标移动自动同步选中大纲节点（不自动展开）。
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

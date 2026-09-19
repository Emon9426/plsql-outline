# 更新日志 / Changelog

本文件记录 PL/SQL Outline 各版本的变化。完整的版本发布信息也可在
[GitHub Releases](https://github.com/Emon9426/plsql-outline/releases) 查看。

## v1.11.1 (2026-09-19)

- 🔴 **提供者按配置扩展名识别 PL/SQL 文档（#26）**：折叠/悬停/Ctrl+Click 跳转三个提供者此前只按语言 ID（sql/plsql）注册——`fileExtensions` 配置中未声明为语言的扩展名（如 `.fcn`/`.typ`）以 plaintext 打开、或文件被其他扩展接管语言 ID 时，大纲可用而折叠/悬停/跳转完全失效（v1.11.0 折叠功能"无效"的直接原因）。现在三者共用放行全部本地/未保存文档的选择器，回调内统一按「语言 ID 或配置扩展名」门控，与大纲识别口径一致；非 PL/SQL 文档在门控处立即返回，不触发解析
- 🧪 新增 foldRouting E2E（真实宿主：`.fcn`(plaintext) 命中折叠提供者、`.txt` 不命中、`.sql` 不回归），e2e 基线 +foldRouting 3/3；定义跳转单测/回归桩同步补 `isPLSQLFile` 协作者

## v1.11.0 (2026-09-19)

- 🟢 **块结构代码折叠（#23）**：注册 FoldingRangeProvider（plsql + sql 语言），编辑器内提供原生折叠箭头——Function/Procedure→END、IF→END IF（IF/ELSIF/ELSE 分支链整体折叠）、LOOP/WHILE/FOR→END LOOP、CASE→END CASE、匿名块→END、Package Body 整体；ELSIF/ELSE/WHEN 不产生独立箭头（已包含在宿主块内），未闭合节点（包规格/触发器根）不折叠。折叠范围复用大纲解析结果（uri+版本缓存，未命中兜底独立解析），计算逻辑独立为 vscode-free 的 `src/folding.ts`；新增 folding_test 21 断言，单元基线 364→**385/385（22 套件）**
- 🟢 **大纲视图内解析进度（#23）**：解析进度从右上角通知改为大纲面板顶部进度条——解析期间视图不再空白，进度持续到解析完成、大纲更新后才消失；解析可取消与失败提示保留
- 🟢 **刷新按钮强制重新解析（#23 + 评审 H1）**：顶部 🔄 刷新改为强制重新解析当前活动文件并刷新大纲——旧实现仅用旧解析结果重绘树，文件修改后点击无效；大纲树获得焦点（无活动编辑器）时自动回退最近的 PL/SQL 编辑器（新增 refresh_focus_test，回归基线 11→**12 套件**）
- 🔧 **解析前版本快照（评审 M1）**：`document.version` 改在解析前读取——此前解析 await 期间文档再编辑，陈旧结果会以新版本号写入折叠缓存/新鲜度标记，大纲与折叠范围滞后到下一次编辑

## v1.10.0 (2026-09-18)

- 🟢 **dbms_metadata.get_ddl 导出源码支持（#19，源自 #1）**：CREATE 语句容忍 `FORCE` / `EDITIONABLE` / `NONEDITIONABLE` 前导修饰词（三者独立可选）——此前 get_ddl 默认输出（如 `CREATE OR REPLACE FORCE EDITIONABLE PACKAGE BODY "APPS"."PKG" AS`）会把包体误判为顶层匿名块（结构错乱）、规格解析为 0 节点
- 🟢 **TYPE 名称后置 FORCE** 兼容（get_ddl 的 TYPE 输出特有形态 `TYPE "T1" FORCE AS OBJECT(...)`）
- 🧹 **CRLF 行尾加固**：预处理按 `\r?\n` 拆分（Windows/实机导出文件行尾不再残留 `\r`，此前依赖各正则 `\s*$` 隐式容忍）
- 🧪 语料新增 `package_body/pkg_body_get_ddl.pkb`（FORCE EDITIONABLE + 引号 schema 形态），基线 **35/35**；新增 get_ddl_test（13 断言：各对象类型 × 修饰词组合、名称后置 FORCE、CRLF、旧形态回归），单元基线 **364/364**
- 🙏 致谢 [@fddc](https://github.com/fddc)：其 [Issue #1](https://github.com/Emon9426/plsql-outline/issues/1) 及实机 `.pck` 样本（已收入语料）推动了 .pck 支持与本项改进

## v1.9.0 (2026-09-18)

- 🟢 **`.pck`（Package Complete）文件支持（#18，承接 PR #2）**：`.pck` 注册进 plsql 语言、默认扩展名、菜单条件与符号索引扫描；支持 spec+body 二合一的实机完整包文件
- 🟢 **带引号标识符解析（#18）**：CREATE 语句（包/函数/过程/触发器/TYPE/VIEW 全分支）支持 `"SCHEMA"."PKG_NAME"`、`"PKG"`、`SCHEMA.PKG` 等全部引号组合，大纲名称去引号显示；`END "名称"` 引号别名可正常闭合单元——此前引号形态匹配不到导致**大纲静默为空**（正则升级为模块级预编译模式表，不在热路径构造）
- 🟡 **静默失败提示（#18）**：内容含 CREATE 却解析出 0 节点时产生 warning，解析摘要会显示具体原因（如"未识别出可解析的 PL/SQL 程序单元……可能使用了暂不支持的语法"）——不再无声空白；基于剥离注释后的文本判定，纯 SQL 脚本与正常文件不误报
- 🧪 语料新增 `package_complete/XXCUST_TEST_PKG.pck`（PR #2 实机 APPS 文件，spec+body 双根 202 行），基线 **34/34**；新增 quoted_identifier_test（18 断言：四种 CREATE 形态、引号 END 闭合、双根语料、warning 三场景），单元基线 **351/351**
- 设置 schema 无漂移测试同步扩展名默认值（fileExtensions / codeRepository.fileExtensions）

## v1.8.0 (2026-09-18)

稳定性、效率与工程质量的整体重构轮。

- 🔴 **内联匿名块 currentLevel 泄漏修复（ZCodeTest 语料发现缺陷①）**：`startAnonymousBlock` 抬升的层级在匿名块闭合时不恢复、`unitStateStack` 帧也不保存层级——包体内每个含内联 `DECLARE..END;` 的成员永久泄漏 +1 层级，累积约 13 个成员即触发"嵌套深度超过限制"使整文件解析为 0 节点。现在匿名块闭合按宿主层级恢复、帧补存/恢复 `currentLevel`；**ZCodeTest 基线 31/33 → 33/33**
- ⚡ **解析性能与可取消**：让步策略从"每 50 行强制 setImmediate"改为按耗时（≥8ms）——中小文件单轮完成、大文件保持 UI 响应；删除恒等 stringCache（纯开销）；解析支持取消令牌，进度通知可随时中断（`ParseCancelledError` 不再误报为解析错误）；新增 `tests/bench.js` 基准
- ⚙️ **设置体系重构**：删除 7 个从未被程序读取的无效设置（`parsing.maxLines/maxParseTime/maxFileSize/enableMemoryOptimization`、`debug.outputPath/keepFiles/maxFiles`）；新增 `src/settingsSchema.ts` 单一事实源，设置页由 schema 生成，新增一致性测试锁定与 package.json 无漂移（修复旧页范围文案矛盾、缺漏新设置、暴露废弃设置三项问题）；写入作用域统一（解析/视图/调试→工作区优先，文件类型/代码仓库→用户级）
- 🎨 **设置页商务化重设计**：卡片分组（解析/视图/文件类型/代码仓库/调试）、搜索过滤、开关/标签编辑器/仓库路径行、范围与默认值提示、未保存指示与吸底操作栏、分组重置、配置导入/导出、内联 SVG 图标与 CSP nonce，纯 VS Code CSS 变量适配深浅色；补齐 `autoSelectOnCursor`/`showDeclarations`/`groupDeclarations`/`codeRepository.*` 全部缺失项
- 🎨 **封面图标重绘**：数据库 + 大纲层级线商务渐变风格（`res/Icon.svg` 设计源 + 1024×1024 PNG）
- 🧹 **架构清理**：删除 patterns.ts（25/40 成员死代码，16 个在用正则并入 parser 模块常量）、debug 层 DataBridge/工厂仪式层、types.ts 6 个死类型、重复 `getNodeTypeDisplayName`；4 个重复输出通道收敛为 `logger.ts` 单通道；新增 `shared.ts` 收敛 8 处重复判定/常量；修复设置变更双重刷新与 symbolIndex 防抖定时器泄漏
- 🗂️ **目录重构**：测试统一到 `tests/{unit,regression,corpus,e2e}`（原 GMLTest/ZCodeTest/test 三棵树）；删除 14 篇历史调查报告等临时文件；41 个 vsix（约 46MB）停止 git 跟踪（历史版本走 GitHub Releases，`npm run package` 输出到 `release/`）；Design/ 并入 docs/design/
- 📦 **打包泄漏修复**：`.vscodeignore` 重写，排除 tests/ 语料与生成报告（v1.7.3 曾把调查截图打进安装包），并加 `tmp*/temp*` 防护；README 截图保留在包内（marketplace 渲染需要）
- 📖 **AI 知识库统一**：新增 `.ai/`（项目/解析器手册/测试/工作流/产品说明），AGENTS.md 为入口、CLAUDE.md 与 copilot-instructions 同源；README 重写（badges、marketplace 直链、反馈与联系：GitHub Issues + emonzhang3438@outlook.com）
- 🧪 单元 333/333（新增 inline_anon_level 9 断言、cancellation 3 断言、settings_schema 8 断言）；corpus validate 33/33、render-validate 33 OK；回归 11/11；双 E2E 通过

## v1.7.3 (2026-09-18)

- 🔴 **并发解析互相污染修复（#15，实机 APPLY_PREMIUM.pkb 1.19MiB 场景）**：扩展层此前全局共享一个 PLSQLParser 实例，`parseCurrentFile` 与 `parseDocumentQuiet`（光标同步/悬停/跳转触发）并发时在同一实例上交错推进——`initializeGlobalVariables()` 重置共享状态、共享 `processedLines` 按行号使不同文档的解析互相"吞行"，产生成员丢失/嵌套错乱/杂交树（A 文件的解析结果里出现 B 文件的包名）。**每次解析改用独立 PLSQLParser 实例**，并发行为不变、彻底消除共享状态；`quietParseInFlight` 去重保留
- 📖 用户关键线索"切换文件再切回来就正确渲染"即非确定性证明：解析逻辑确定性缺陷重解析必然复现，只有并发污染能自愈
- 🧪 GMLTest 新增 concurrent_parse_isolation_test（7 断言：独立实例并发解析不同文档互不污染、交错启动、幂等性）；全套 313/313，ZCodeTest 基线不变，双 E2E 通过

## v1.7.2 (2026-09-18)

- 🔴 **内联匿名块不再整棵隐藏（#13，真实脚本 01_NB_MT110 场景）**：过程/函数/匿名块体内的内联 `DECLARE..BEGIN..END;` 块此前在显示层被整体跳过，其内部全部控制结构从大纲消失（Body 只剩块结束后的 IF）；现在作为宿主 Body 内**可展开的 `Anonymous Block` 分组**渲染，展开可见其 Declaration（局部变量/游标/异常）、Sub Program（块内嵌套子程序）、Body（控制结构）、Exception、End
- 🔴 **触发器主体改为代理渲染（补齐 ZCodeTest 缺口①）**：触发器唯一的匿名块子节点不再仅提升控制结构，其 DECLARE 区（变量/常量/异常）、嵌套子程序、Exception/End 直接挂在触发器下，无多余嵌套层；宿主自带异常区/END 时块内同类叶子不重复渲染
- 🔗 **getParent 显示父链同步修正**：块内控制结构的显示父级为匿名块自身的 Body 文件夹；代理渲染匿名块的分组/叶子父级为宿主单元——reveal 光标同步的可见性判断不再依赖跳过逻辑
- 🧹 **删除不可达的旧分区渲染路径**（isSection/createSectionTreeItem/createSectionChildItems/getSectionIcon，无任何创建点）
- 🧪 GMLTest 新增 inline_anon_visible_test（23 断言：真实脚本形态复现、过程内联块、触发器代理、显示父链、宿主叶子边界）；ZCodeTest render-validate 期望表收紧（触发器声明区/异常、内联块分组、块内子程序必现）；全套 306/306、render-validate 0 失败、双 E2E 通过

## v1.7.1 (2026-09-18)

- 🧪 **ZCodeTest 结构化测试语料库**：33 个文件 / 14.3 万行，覆盖 Function、Procedure、Package Spec+Body、Trigger、匿名块（DECLARE 形与顶层裸 BEGIN 形，各有/无 Exception）及 TYPE/TYPE BODY/VIEW，每种对象 × 简单/复杂/长代码(≥1万行)/长代码+复杂 四形态；复杂结构覆盖注释（单行/多行/注释掉的代码）、3 层嵌套子程序、全部循环种类、嵌套 3 层循环、多 WHEN 异常，另含 Q-quote/前置声明/内联匿名块/CASE ELSE/包初始化块/多行签名等解析器压力点；14 个万行文件由 `generate-long.js` 确定性生成
- 🧪 **解析层全量验证（validate.js）**：33 文件逐一真实解析，基线 31/33
- 🧪 **显示层全量渲染校验（render-validate.js）**：真实 treeView 显示层全树 getChildren/getTreeItem 遍历，断言根标签/必现标签/被注释代码不得渲染，基线 31 OK + 2 KNOWN
- 🧪 **真实 VS Code E2E 冒烟（zcodetest_smoke）**：7 类代表文件的语言关联（.fnc/.prc/.pks/.pkb/.trg→plsql）、解析命令、嵌套子程序跳转全链路验证
- 📋 **语料发现的缺陷（已记录待修，见 ZCodeTest/README.md）**：① 解析器内联匿名块 currentLevel 泄漏（pkg_body_long*.pkb 解析失败）；② 触发器 DECLARE 区/匿名块内子程序与包规格级声明不渲染；③ 共享解析器实例并发竞争导致快速多文件切换下解析结果偶发损坏
- 本版本无产品代码（src/）变更，为纯测试基建发布

## v1.7.0 (2026-09-18)

- 🔴 **常量声明标准语序识别（#4）**：`CONSTANT_DECLARATION` 正则修正为 Oracle 标准语序 `name CONSTANT type := value`，标准常量声明现在能正确记入 variableTable；全部测试 fixtures 同步改为标准语序
- 🔴 **CASE 的 ELSE 分支不再污染控制结构栈（#3）**：CASE 的 ELSE 仅作为 CASE 子节点、不压入控制栈，修复 CASE 嵌套在循环中时后续同级控制结构被吞并到 ELSE 分支下的问题
- 🔴 **顶层裸 BEGIN 匿名块支持（#5）**：无 DECLARE 的顶层 BEGIN 块解析为根级匿名块节点；已闭合单元后随的匿名块作为根节点，不再误挂子节点；包初始化段判定增加守卫
- 🔗 **匿名块 Ctrl+Click 跳转修复（#9）**：解析结果按 (uri, version) 跟踪，Definition/Hover 查询前按需静默重解析，编辑 500ms 防抖主动刷新——编辑未保存或新建未保存的匿名块边写边跳转可用（原仅打开/保存后解析）；新增真实 VS Code E2E 测试（executeDefinitionProvider 端到端）
- 🔗 **内联匿名块含子程序时父单元闭合修复（#11）**：子程序进入时保存（计数器+匿名块水位）上下文帧、END 闭合时恢复；BEGIN/EXCEPTION 归属感知内联匿名块水位——父单元 endLine 不再为 null
- 🧪 GMLTest 新增 5 套件（constant_declaration / case_else_nesting / top_level_anon / anon_subfunc_definition / inline_anon_subprogram），全套 282 项断言通过

## v1.6.5 (2026-08-08)
- 🧪 测试 gitgraph（文档流程验证）

## v1.6.4 (2026-08-08)
- 🖱️ **大纲取消跳转自动展开**：点击节点跳转时不再强制展开目标节点，展开/折叠状态完全由用户控制
- 👻 **修复前置声明幽灵节点导致不连续游标丢失**：包规范式前置声明（Function/Procedure Declaration）不再生成干扰节点，光标跟随不再丢失

## v1.6.3 (2026-08-08)
- 🖱️ **修复所有节点点击名称会展开**：Declaration 文件夹、Variables/Cursors 等声明分组文件夹原来缺少跳转命令，点击名称会触发展开。现所有可展开节点点击名称只跳转，展开仅靠箭头
- 📦 **紧凑过程生成 Body 节点**：`PROCEDURE x IS BEGIN xxx; END;` 这种 Body 内无控制结构的紧凑结构，原来不生成 Body 文件夹。现只要有 BEGIN 就生成 Body 节点，点击跳转到 BEGIN 行
- 🔧 触发器主体（嵌套匿名块）的控制结构提升到 Body 文件夹

## v1.6.2 (2026-08-08)
- 🐛 **修复内联匿名块误入 Sub Program 文件夹**（代码审查根因）：过程体内的 `DECLARE...BEGIN...END;` 块不再被当作 Sub Program 的可见子项渲染。三处展示路径修复：
  1. `createGroupedChildren` 分类逻辑：ANONYMOUS_BLOCK 不再走 else 分支进入 subprogramChildren
  2. `getChildren` subprogram 渲染分支：增加类型过滤兜底（仅 FUNCTION/PROCEDURE/DECLARATION）
  3. 触发器主体（单一匿名块子项）的控制结构子项提升到父级，避免空触发器
  - 解析层 `handleDeclareStatement` 保留建模（维持 BEGIN/END 配对），仅展示层调整
- 🧪 新增 GMLTest/anonymous_block_render_test（8 项）

## v1.6.1 (2026-08-08)
- 🔴 **支持跨行 Q-quote 字符串**：Q-quote 跨多行时不再破坏解析（跨行状态机追踪未闭合的 Q-quote/标准字符串，内容整体丢弃，内部 `--`/`/*` 不外泄）
- 🆕 **TYPE BODY 成员方法识别**：`MEMBER FUNCTION` / `STATIC FUNCTION` / `MEMBER PROCEDURE` / `CONSTRUCTOR` 等对象类型方法前缀被识别为子节点
- 🧪 新增 GMLTest/qquote_edge_test（30 项）：5 种定界符 + 任意定界符、Q-quote 内含双横线/斜杠星号/分号/BEGIN-END/单引号、跨行 Q-quote、200 个 Q-quote 性能、真实 EXECUTE IMMEDIATE 动态 SQL 包

## v1.6.0 (2026-08-08)
- 🔴 **修复 Q-quote 字符串导致实际代码解析失败（根因）**：支持 Oracle 替代引用 `q'[...]'` / `q'{...}'` / `q'<...>'` / `q'(...)'` / `q'|...|'` 及 `nq'...'`。原字符串剥离正则不识别 Q-quote，遇到含 `--` / `/* */` 的动态 SQL 时会提前结束、把残留当注释剥离，**删除真实代码**，导致 BEGIN/END 平衡崩溃、大纲塌陷。现改为字符级状态机剥离器，Q-quote 内部的注释标记与引号不再被误判
- 🔧 **放宽多行 CREATE 前瞻**：5 行 → 15 行、500 字符 → 2000 字符，避免真实长签名（多参数函数/过程）被丢弃；补充 `PARALLEL_ENABLE`/`AGGREGATE`/`ACCESSIBLE` 终止关键字
- 🆕 **支持 CREATE TYPE / TYPE BODY / VIEW**：新增 NodeType，识别为程序单元（原 `matchCreateStatement` 只认 PACKAGE/FUNCTION/PROCEDURE/TRIGGER，CREATE TYPE 等被丢弃）
- 🐛 **次要修复**：统一 `patterns.ts` 字符串正则（PL/SQL 用 `''` 而非 `\` 转义）；`isEndStatement` 排除带标签的 `END IF lbl;` / `END LOOP lbl;`
- 🧪 新增 GMLTest/qquote_create_test（17 项）

## v1.5.9 (2026-08-08)
- 🖱️ **修复光标在过程体内不跟随**：光标停在 BEGIN 与 EXCEPTION 之间的代码行（如过程体内任意语句）时，大纲现选中所属 Procedure/Function 节点（原 BEGIN 在新扁平结构无对应树节点导致 reveal 静默失败）
- 🗑️ **删除无效配置**：移除 `view.showControlStructures` 与 `parsing.controlStructureMaxDepth`（两项均未与代码接通，开关无效果）
- 🧹 **清理死代码**：移除遗留的旧 isSection 渲染链（buildSectionItem/countStructureBlocks/createStructureBlocks）、selectAndRevealNode、getAllTreeItems/collectAllTreeItems、findNodeByLine/getStructureBlockType/isLineInNode 等
- 🔧 **修复 expandAll 根节点标签不一致** + **findNodeInCurrentFile 递归传递 packageName**（代码 Review 项 3、4）

## v1.5.8 (2026-08-08)
- 🖱️ **修复光标同步**：selectAndRevealTarget 对节点目标构造的标签现与 getChildren 产出一致（子程序用纯名称、控制结构用简化标签），reveal 不再因标签不匹配而静默失败
- 🏷️ **移除 L1/L2/L3/L4 层级显示**：所有节点描述不再显示层级标识（需求4），声明项描述统一为"第N行"
- 🧪 cursor_sync_test 新增 reveal 标签一致性断言

## v1.5.7 (2026-08-08)
- 🔗 **修复嵌套子程序 Ctrl+Click 跳转**：findProcFuncInChildren 改为递归，任意深度嵌套子程序（如 calculate_total → compute_line_total → apply_rounding）的 Ctrl+Click 现在能跳转到声明行（原 Bug A：仅查直接子节点，嵌套 ≥2 级时静默返回 null，只显示 Hover 不跳转）
- 🔗 **修复跨文件跳转回退**：符号索引中存在当前文件定义时不再误返 null（Bug C 兜底）
- 🧪 新增 GMLTest/nested_definition_test（11 项，针对 order_mgmt_pkg 的 2/3 级嵌套子程序跳转）

## v1.5.6 (2026-08-08)
- 🎨 **图标完全重构（数据库主题）**：所有大纲节点图标改为统一的"数据库圆筒"主题自定义 SVG
- 🔤 **Procedure/Function 图标区分 P/F**：Procedure 图标含蓝色 "P"，Function 图标含琥珀色 "F"，仅看图标即可区分
- 🗄️ **活动栏图标**：改为数据库图形 `$(database)`
- 🌗 **明暗主题自适应**：每个图标提供 light/dark 变体，自动适配当前主题
- 🏷️ 各声明类别（变量/游标/常量/类型/异常）、文件夹（Declaration/Sub Program/Body）、结构块均有专属数据库风格图标

## v1.5.5 (2026-08-08)
- 📦 **包下子程序直接显示**：Package 下的 Function/Procedure 不再收纳在 "Sub Program" 文件夹中，直接挂在包名下（它们本就属于该包）；嵌套子程序（子程序内的子程序）仍用 Sub Program 文件夹
- 🎯 **点击节点只跳转，箭头负责展开**：点击大纲节点本身跳转到该节点首行；展开/折叠仅通过左侧箭头操作
- 🏷️ **子程序简洁显示**：Function/Procedure 仅显示名称+图标（去掉 "Function:"/"Procedure:" 前缀、行号、子项数描述）
- ▶️ **Body 跳转 BEGIN**：点击 Body 文件夹跳转到 BEGIN 关键字所在行

## v1.5.4 (2026-08-08)
- 📐 **扁平化分组样式（参照 PLSQL Developer）**：去掉 DECLARE/SUBPROGRAM/BODY 分区层，改为对象名下直接挂 Declaration / Sub Program / Body / Exception / End 文件夹
- 📁 **Declaration 包裹文件夹**：变量/游标/常量/类型/异常统一收纳在 Declaration 文件夹下，按类别子分组
- 🔄 **Sub Program 任意深度嵌套**：Sub Program 中的 Procedure/Function 可完整展开（含自身的 Declaration/Sub Program/Body），支持 Sub Program 内的 Sub Program 递归嵌套
- 🎨 **Procedure/Function 图标区分**：Procedure 用 symbol-method，Function 用 symbol-function
- 🧪 **GMLTest 测试套件**：新增独立 GMLTest 文件夹，含 4 级 Sub Program 嵌套用例，HTML 格式测试报告

## v1.5.3 (2026-08-08)
- 🗂️ **Sub Program 分组**：所有子程序（函数/过程）统一归入 "Sub Program (N)" 分组，不再平铺在 DECLARE 中
- 📐 **分区顺序优化**：对象名 → Declare(声明项) → Sub Program(子程序) → Body → Exception → End，更接近 PLSQL Developer
- 🖱️ **修复光标同步**：在代码页点击某行后，左侧大纲视图现在能正确选中对应位置（变量/游标/子程序/控制结构均可定位）
- 🔗 **修复 Ctrl+Click 跳转**：移除误杀导航调用的去重守卫，Ctrl+点击变量/游标/子程序名现在真正跳转（而非仅显示 Hover）
- 🧪 **新增测试**：光标同步测试、Definition 跳转测试；全套 1225 项断言通过

## v1.5.2 (2026-08-08)
- 📋 **声明项大纲展示**：在 DECLARE 区域按类别分组显示变量/游标/常量/类型/异常（参照 PLSQL Developer），每个声明项可点击跳转到声明行
- 🏷️ **新增声明识别**：支持 `CONSTANT`（常量）、`TYPE ... IS RECORD/TABLE OF/VARRAY/REF CURSOR`（自定义类型）
- 🐛 **修复变量未记录**：修正既有缺陷——变量声明此前因正则/分号处理不一致而从未被记录
- 🐛 **修复游标识别**：支持 `CURSOR name(params) IS` 后接换行 SELECT 的多行形式
- 🐛 **修复误判**：过滤 `PRAGMA EXCEPTION_INIT(...)`、`END IF;` 等被宽松变量正则误捕获的语句
- ⚙️ **新增配置**：`view.showDeclarations`、`view.groupDeclarations`
- ⚙️ **对齐限制**：`controlStructureMaxDepth` 默认值改为 10（上限 20）；文件大小上限统一为 10MB
- 🧪 **测试增强**：新增 13,259 行万级复杂多层嵌套测试用例 + 声明项渲染测试，全套 1206 项断言通过

## v1.5.0 ~ v1.5.1
- 🌳 **IF/LOOP/CASE 控制结构识别**：在方法体内识别 IF/ELSIF/ELSE、LOOP/WHILE/FOR、CASE/WHEN 并分层展示，支持多级嵌套与 IF 分支合并
- 🧩 **大纲分区**：程序名 → DECLARE → Subprogram → BEGIN → EXCEPTION → END 结构化分区
- 🔗 **跨文件 Ctrl+Click 导航**：点击子程序/游标/变量名跳转声明；同文件内未找到时搜索配置的代码仓库路径（支持优先级、QuickPick）
- 🐛 **Parser 修复**：schema 前缀、多行 CREATE、字符串字面量内注释、`IS NULL` 控制结构（BUG-A）、无初始化块包闭合（BUG-B）

## v1.4.6 (2025-01-20)
- 🔧 **智能调试控制**：只有在启用调试模式时才输出调试信息
- 🎯 **用户体验优化**：默认状态下控制台保持清洁，无调试输出
- 📊 **统一日志格式**：所有调试输出使用 `[PL/SQL Outline Debug]` 前缀
- ⚙️ **实时配置生效**：调试模式开关立即生效，无需重启扩展
- 🚀 **性能提升**：减少不必要的字符串处理和控制台输出开销
- 🛠️ **保留重要日志**：扩展激活、停用等关键信息始终输出

## v1.4.5 (2025-01-20)
- 🔧 **重大改进**：完全重新设计光标同步算法
- ✅ **新增**：候选收集机制，确保找到最佳匹配
- 📊 **新增**：优先级系统，精确匹配优先于范围匹配
- 🎯 **修复**：严格按照实际行号进行匹配
- 🚀 **优化**：单次遍历收集候选项，提高性能
- 📝 **原则**：精确性、可预测性、性能优化

## v1.3.0 (2025-01-19)
- 🔧 **重大修复**：设置页面保存功能完全修复
- ⚙️ **配置优化**：所有配置现在保存到工作区级别，确保设置生效
- 🔄 **状态同步**：保存后自动同步前端界面，配置立即生效
- 🎯 **用户体验**：修复设置丢失问题，提供可靠的配置管理
- 📋 **技术改进**：统一使用 Workspace 配置目标，支持项目特定设置

## v1.2.5 (2025-01-19)
- 🚀 **重大性能优化**：内存占用降低 90% 以上
- 🔧 **修复**：全部展开功能完全重写，现在可以正确展开根节点和所有子节点
- 🗑️ **移除**：删除复杂的文件日志系统，改用 VS Code 输出通道
- ⚡ **性能**：消除文件 I/O 阻塞，响应速度显著提升
- 🛠️ **技术改进**：添加 getParent 方法支持 VS Code reveal API
- 📊 **调试优化**：实时调试信息输出到 VS Code 输出面板
- 🧹 **内存管理**：实现 LRU 缓存机制，自动内存清理

## v1.1.0 (2025-01-19)
- ✨ 新增：可配置的文件扩展名支持
- ✨ 新增：一键展开/折叠功能
- ✨ 新增：文件扩展名管理界面
- 🎨 改进：大纲视图显示顺序（层级-子项-行号）
- 🎨 改进：视图标题更改为 "PLSQL Outline"
- 🔧 修复：更新工程图标为 Icon.png

## v1.0.2 (2025-01-19)
- 🐛 修复：END IF/LOOP/CASE 解析错误
- 🔧 改进：控制结构识别逻辑
- ✅ 测试：增加回归测试覆盖

## v1.0.1
- 🐛 修复：解析器稳定性问题
- 📝 文档：更新使用说明

## v1.0.0
- 🎉 首次发布
- ✨ 基础解析功能
- 🌳 大纲视图
- ⚙️ 配置选项

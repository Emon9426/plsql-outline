# tests/corpus — plsql-outline 测试语料库

面向 PL/SQL Outline 的结构化测试代码集。每个 `.sql/.fnc/.prc/.pks/.pkb/.trg` 文件
都是**合法的 PL/SQL**，可直接在 VS Code 中打开观察大纲（扩展已注册 `.pks/.pkb/.prc/.fnc/.trg`
→ `plsql`，`.sql` → `sql`），也可用 `validate.js` 走真实解析器批量校验。

## 目录结构

```
tests/corpus/
  generate-long.js   长代码文件生成器（确定性输出，可重复再生）
  validate.js        全量解析验证（调用 out/ 真实解析器）
  function/          函数（.fnc）
  procedure/         过程（.prc）
  package_spec/      包规格（.pks）
  package_body/      包体（.pkb）
  package_complete/  完整包（.pck，spec+body 二合一，实机文件）
  trigger/           触发器（.trg）
  anonymous/         匿名块（.sql）
  other_objects/     补充对象：TYPE / TYPE BODY / VIEW（.sql）
```

## 用例矩阵

每种对象 4 类形态（若该对象支持）：**简单结构**、**复杂结构**、**长代码**（≥10000 行）、
**长代码+复杂结构**（≥10000 行且全程穿插复杂特性）。匿名块按 `DECLARE..BEGIN..END` 与
顶层裸 `BEGIN..END` 两种形态各带“有/无 Exception”版本。

| 对象 | 简单 | 复杂 | 长代码 | 长代码+复杂 |
|---|---|---|---|---|
| Function | func_simple.fnc (30) | func_complex.fnc (185) | func_long.fnc (10100) | func_long_complex.fnc (10109) |
| Procedure | proc_simple.prc (37) | proc_complex.prc (178) | proc_long.prc (10107) | proc_long_complex.prc (10110) |
| Package Spec | pkg_spec_simple.pks (40) | pkg_spec_complex.pks (73) | pkg_spec_long.pks (10108) | pkg_spec_long_complex.pks (10102) |
| Package Body | pkg_body_simple.pkb (46) | pkg_body_complex.pkb (206) | pkg_body_long.pkb (10117) ⚠️ | pkg_body_long_complex.pkb (10109) ⚠️ |
| Trigger | trg_simple.trg (34) | trg_complex.trg (129) | trg_long.trg (10106) | trg_long_complex.trg (10101) |
| 匿名块 DECLARE 形 | anon_declare_simple_{exc,noexc}.sql (24/22) | anon_declare_complex.sql (136) | anon_declare_long.sql (10102) | anon_declare_long_complex.sql (10102) |
| 匿名块裸 BEGIN 形 | anon_begin_simple_{exc,noexc}.sql (22/20) | anon_begin_complex.sql (106) | anon_begin_long.sql (10107) | anon_begin_long_complex.sql (10125) |
| TYPE / TYPE BODY / VIEW（补充） | type_object_simple.sql / type_body_simple.sql / view_simple.sql | — | — | — |
| 完整包（.pck，Issue #18） | package_complete/XXCUST_TEST_PKG.pck（202 行，APPS 实机文件） | — | — | — |
| get_ddl 输出形态（Issue #1/#19） | package_body/pkg_body_get_ddl.pkb（38 行，FORCE EDITIONABLE + 引号 schema） | — | — | — |

括号内为文件行数。总计 35 个文件，约 14.3 万行，其中 14 个长文件由
`generate-long.js` 生成（勿手工编辑，改生成器后重新运行即可再生）。

## 形态定义（与需求对应）

**简单结构**：单一对象 + 声明区 + 直线体 + 基础控制结构 + **EXCEPTION 段**（必含）。

**复杂结构**（必含以下全部）：
- 注释：单行 `--`、多行 `/* */`、**注释掉正常代码结构**（单行注释掉的 IF 块/循环/成员、
  块注释掉的整个子过程/成员/匿名块）、行尾注释
- 嵌套子程序：Sub Function / Sub Procedure，且**子函数内再嵌套子程序**（3 层：
  过程 > 函数 > 过程）
- 循环：基础 `LOOP..EXIT WHEN`、`WHILE`、`FOR`、游标 `FOR`（内联子查询跨行形式）
- **嵌套 3 层循环**（如 FOR > WHILE > FOR）
- EXCEPTION 段（含多 WHEN 分支；各层子程序、内联匿名块、包初始化块各有自己的异常段）
- 附加（源自解析器实际特性的压力点）：Q-quote 字符串 `q'[...]'`/`q'{...}'`（内含
  `--` 与 `/* */`）、Oracle 标准语序常量、前置声明与同名真实定义、体内内联匿名块
  `DECLARE..BEGIN..EXCEPTION..END;`、CASE ELSE（Issue #3 场景）、包初始化块、
  多行签名（CREATE 跨行前瞻）、schema 前缀、PRAGMA EXCEPTION_INIT

**长代码**：≥10000 行。简单版 = 变量池 + 赋值/IF/ELSIF/ELSE/FOR/WHILE/基础 LOOP/
内联 DECLARE 块的直线体；复杂版 = 在此基础上每 9 段插入一个复杂段（3 层循环/注释风暴/
内联匿名块(含嵌套子程序)/Q-quote+CASE ELSE/游标 FOR 轮转）。

**形态差异说明**：
- 包规格（.pks）只有声明无实现体 → **不支持 EXCEPTION 段与子程序体**（由包体承担），
  复杂度体现在注释/多行签名/类型家族/Q-quote 常量/被注释掉的成员。
- 顶层裸 `BEGIN..END` 匿名块无声明区 → 复杂度经**内联 DECLARE 块**（可含嵌套子程序）表达。
- 触发器体在解析器中是 Trigger 节点下的匿名块（ANONYMOUS_BLOCK），嵌套子程序位于
  该匿名块声明区；未覆盖复合触发器（COMPOUND TRIGGER，解析器暂不支持）。

## 使用方式

```bash
# 1. 批量解析验证 —— 解析层（需先编译: npm run compile）
node tests/corpus/validate.js

# 2. 批量渲染验证 —— 显示层（真实 out/treeView.js + vscode mock, 全树 getChildren/getTreeItem 遍历）
node tests/corpus/render-validate.js

# 3. 真实 VS Code E2E 冒烟 —— 每类对象代表文件的语言关联/解析命令/嵌套子程序跳转
node test/integration/zcodetest_smoke.e2e.js

# 4. 重新生成长代码文件（确定性输出）
node tests/corpus/generate-long.js

# 5. 在 VS Code 中打开任意 .sql/.fnc/.prc/.pks/.pkb/.trg 文件查看大纲
```

`validate.js` 检查：解析无错误、有顶层节点、`_long` 文件 ≥10000 行；并打印每个文件的
顶层节点形态（声明行-结束行/是否含异常段）、节点总数、最大嵌套深度与耗时（长文件
约 20–65ms）。

`render-validate.js` 检查"VS Code 大纲真实显示"：每文件经 PLSQLOutlineProvider 全树渲染
不得抛异常、根标签正确、必现标签（嵌套子程序名/Sub Program/Declaration/Exception）存在、
被注释掉的代码（legacy_*）不得出现；当前基线 **33/33 全通过**。

`zcodetest_smoke.e2e.js` 在真实 VS Code 宿主内验证（@vscode/test-electron，--disable-extensions）：
① 语言关联（.fnc/.prc/.pks/.pkb/.trg → plsql，.sql → sql）；② `plsqlOutline.parseCurrentFile`
可执行完成；③ 各类对象内嵌套子程序 Ctrl+Click 跳转命中声明行（含触发器匿名块内、内联匿名块内、
前置声明函数）。跳转判定标准为"静默期 + 一次显式重解析后必须命中"——快速多文件切换下首查
可能落空（见下方已知问题③），重试兜底模拟用户再次点击。

## 当前验证结果（v1.8.0 解析器 + 显示层）

- **解析层 validate.js：33/33 通过**；**显示层 render-validate.js：33/33 OK**；
  **真实 VS Code E2E 冒烟：7/7 通过**。
- 已知无害行为（非缺陷，README 记录以便比对大纲）：
  `PACKAGE_HEADER / TRIGGER / TYPE / TYPE_BODY / VIEW` 的 `endLine` 保持 open
  （解析器仅对 PACKAGE_BODY 有顶层 END 闭合分支）；无初始化块的包体正常闭合（BUG-B 已修复）。
- 已知显示层行为（真实 VS Code 大纲即如此，修复需求待定）：
  ① ~~触发器仅渲染 `Body` 文件夹与提升的控制结构~~ **v1.7.2 已修复**：触发器主体
  （唯一匿名块子节点）代理渲染，DECLARE 区（变量/常量/异常）、匿名块内嵌套子程序、
  Exception 段均可见；
  ② 包规格仅渲染成员声明（FUNCTION/PROCEDURE Declaration），规格级常量/类型/游标/异常
  **不在大纲显示**（PACKAGE_HEADER 走 createFlatChildren）；
  ③ ~~体内内联匿名块（DECLARE..BEGIN..END;）整棵不渲染~~ **v1.7.2 已修复**：内联
  匿名块在宿主 `Body` 内渲染为可展开的 `Anonymous Block` 分组（含其
  Declaration/Sub Program/Body/Exception/End）。

## 已发现的缺陷（历史记录）

### ① 解析器：内联匿名块 currentLevel 泄漏 —— **v1.8.0 已修复**

**现象**：包体内多个成员，只要成员体内含内联匿名块（`DECLARE..BEGIN..END;`），
解析到约第 13 个此类成员时抛 “嵌套深度超过限制(15)”，**整个文件解析失败（0 节点）**。

**根因**（`src/parser.ts`）：
- `startAnonymousBlock()` 把 `currentLevel` 抬到匿名块层级；
- `handleEndStatement()` 的匿名块闭合分支恢复了 `currentActiveNode`
  但从不回退 `currentLevel`（`unitStateStack` 保存/恢复的也只有
  `beginEndCounter` 与 `anonBlockCounters`，不含 `currentLevel`）。

**修复**（v1.8.0）：匿名块闭合分支恢复 `currentLevel = parentNode.level`；
`unitStateStack` 帧补存/恢复 `currentLevel`（帧值优先，自愈体内漂移）。
回归：`pkg_body_long*.pkb` 即现成用例，validate.js 已 33/33；
单元层新增 `tests/unit/inline_anon_level_test.js`（18 成员×内联块层级一致 + 块内嵌套子程序）。

### ② 显示层：触发器与包规格的部分结构不出现在大纲（触发器/内联块部分 v1.7.2 已修复）

真实 VS Code 大纲中的实际行为（render-validate.js 已按现状编码为基线）：

- ~~**触发器**仅渲染 `Body` 文件夹与从匿名块提升的控制结构~~ **v1.7.2 已修复**
  （Issue #13）：唯一匿名块子节点改为**代理渲染**，触发器下直接显示其
  Declaration/Sub Program/Body/Exception/End，无多余嵌套层。
- ~~体内内联匿名块整棵不渲染~~ **v1.7.2 已修复**（Issue #13，真实脚本
  01_NB_MT110 场景）：非唯一子节点的内联匿名块在宿主 Body 内渲染为可见的
  `Anonymous Block` 分组；`getParent` 显示父链同步修正（reveal 可见性依赖）。
- **包规格**仅渲染成员声明；规格级常量/类型/游标/异常**不显示**
  （PACKAGE_HEADER 走 createFlatChildren，不查 variableTable）。

若 Emon 认为包规格的声明应可见，需改 createFlatChildren，
届时同步收紧 render-validate.js 的期望表。

### ③ 扩展层：共享解析器实例并发竞争（快速多文件切换下解析结果偶发损坏/为空）—— v1.7.3 已修复

真实 VS Code E2E 冒烟（zcodetest_smoke.e2e.js）3 轮观察：连续切换 7 个文件时，
跳转首次查询随机的多个文件落空（func/proc/pkg_body 均出现过），活动编辑器与
查询位置均正确；显式再次执行 `plsqlOutline.parseCurrentFile` 后**必然命中**。

根因分析：`PLSQLParser` 是**共享单实例且非可重入**——`parse()` 先在实例上
`initializeGlobalVariables()`，解析中每 50 行 `await yield()` 让出事件循环；
而编辑器切换事件触发的静默解析是 fire-and-forget（extension.ts `onDocumentChanged`/
活动编辑器切换处理器），与用户命令/定义查询触发的解析在**同一实例**上并发交叠，
互相清空/污染对方的状态数组 → 交叠期间完成的解析结果损坏或为空，直到下一次
无竞争解析自愈。PR #10 的 (uri,version) 新鲜度跟踪只保证"不重复解析"，
未保证"不并发解析"。

**v1.7.3 修复（Issue #15）**：实机 APPLY_PREMIUM.pkb（1.19MiB）确认更严重的形态——
不同文档解析重叠时共享 `processedLines` 按行号互相"吞行"，BEGIN/END 计数断链，
产生成员丢失/杂交树（A 文件的解析结果里出现 B 文件的包名）；用户关键线索
"切换文件再切回来就正确渲染"即非确定性证明。修复：**每次解析使用独立
PLSQLParser 实例**（`new PLSQLParser().parse(...)`），共享字段移除，
`quietParseInFlight` 去重保留。回归套件：GMLTest/concurrent_parse_isolation_test。
E2E 冒烟仍以"静默期 + 一次显式重解析后必须命中"为通过标准。

## 新增手工用例需遵守的格式约束（解析器为行驱动）

以下关键字必须独占一行（或处于行尾）：`BEGIN` / `EXCEPTION` / `DECLARE` /
`IS` / `AS`；`END [name];` 独占一行；`IF..THEN`、`WHILE..LOOP`、`FOR..LOOP`
单行完整；`END IF;` / `END LOOP;` / `END CASE;` 独占一行。单文件 ≤50000 行、
子程序嵌套 ≤15 层、控制结构深度 ≤10。SQL*Plus `/` 结束符可保留（解析器忽略）。

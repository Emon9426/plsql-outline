# ZCodeTest — plsql-outline 测试语料库

面向 PL/SQL Outline 的结构化测试代码集。每个 `.sql/.fnc/.prc/.pks/.pkb/.trg` 文件
都是**合法的 PL/SQL**，可直接在 VS Code 中打开观察大纲（扩展已注册 `.pks/.pkb/.prc/.fnc/.trg`
→ `plsql`，`.sql` → `sql`），也可用 `validate.js` 走真实解析器批量校验。

## 目录结构

```
ZCodeTest/
  generate-long.js   长代码文件生成器（确定性输出，可重复再生）
  validate.js        全量解析验证（调用 out/ 真实解析器）
  function/          函数（.fnc）
  procedure/         过程（.prc）
  package_spec/      包规格（.pks）
  package_body/      包体（.pkb）
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

括号内为文件行数。总计 33 个文件，约 14.3 万行，其中 14 个长文件由
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
# 1. 批量解析验证（需先编译: npm run compile）
node ZCodeTest/validate.js

# 2. 重新生成长代码文件（确定性输出）
node ZCodeTest/generate-long.js

# 3. 在 VS Code 中打开任意 .sql/.fnc/.prc/.pks/.pkb/.trg 文件查看大纲
```

`validate.js` 检查：解析无错误、有顶层节点、`_long` 文件 ≥10000 行；并打印每个文件的
顶层节点形态（声明行-结束行/是否含异常段）、节点总数、最大嵌套深度与耗时（长文件
约 20–65ms）。

## 当前验证结果（v1.7.0 解析器）

- **31/33 通过**。
- ⚠️ **2 个失败：pkg_body_long.pkb / pkg_body_long_complex.pkb**，触发
  “嵌套深度超过限制(15)”——这是语料**发现的真实解析器缺陷**（见下节）。
- 已知无害行为（非缺陷，README 记录以便比对大纲）：
  `PACKAGE_HEADER / TRIGGER / TYPE / TYPE_BODY / VIEW` 的 `endLine` 保持 open
  （解析器仅对 PACKAGE_BODY 有顶层 END 闭合分支）；无初始化块的包体正常闭合（BUG-B 已修复）。

## 发现的解析器缺陷：内联匿名块 currentLevel 泄漏

**现象**：包体内多个成员，只要成员体内含内联匿名块（`DECLARE..BEGIN..END;`），
解析到约第 13 个此类成员时抛 “嵌套深度超过限制(15)”，**整个文件解析失败（0 节点）**。

**最小复现**（18 个成员各含 1 个内联匿名块即失败）：

```
CREATE OR REPLACE PACKAGE BODY leak_pkg IS
    PROCEDURE m_1 IS l_a NUMBER := 0; BEGIN
        DECLARE l_local NUMBER := 0; BEGIN ... EXCEPTION WHEN OTHERS THEN NULL; END;
        ...
    EXCEPTION WHEN OTHERS THEN NULL; END m_1;
    ...（重复 18 次）
END leak_pkg;
```

**根因**（`src/parser.ts`）：
- `startAnonymousBlock()`（~L944）把 `currentLevel` 抬到匿名块层级；
- `handleEndStatement()` 的匿名块闭合分支（~L882-896）恢复了 `currentActiveNode`
  但**从不回退 `currentLevel`**（`unitStateStack` 保存/恢复的也只有
  `beginEndCounter` 与 `anonBlockCounters`，不含 `currentLevel`）。

于是包体内每个含内联匿名块的成员让 `currentLevel` 永久 +1：后续兄弟成员节点
`.level` 逐个漂移（大纲层级失真），累计到 15 触发 `handleSubFunctionProcedure`
的深度保护抛错。单单元文件（函数/过程/匿名块内）不创建后续兄弟子程序，故不触发，
只有“包体 + 多个含内联匿名块的成员”暴露此问题。

**建议修复方向**（未实施，待另开 Issue→PR）：匿名块闭合分支恢复
`currentLevel = parentNode.level`（与 PR #12 的 unitStateStack 保存/恢复同模式）。
修复后 `validate.js` 应 33/33 通过，`pkg_body_long*.pkb` 即现成回归用例。

## 新增手工用例需遵守的格式约束（解析器为行驱动）

以下关键字必须独占一行（或处于行尾）：`BEGIN` / `EXCEPTION` / `DECLARE` /
`IS` / `AS`；`END [name];` 独占一行；`IF..THEN`、`WHILE..LOOP`、`FOR..LOOP`
单行完整；`END IF;` / `END LOOP;` / `END CASE;` 独占一行。单文件 ≤50000 行、
子程序嵌套 ≤15 层、控制结构深度 ≤10。SQL*Plus `/` 结束符可保留（解析器忽略）。

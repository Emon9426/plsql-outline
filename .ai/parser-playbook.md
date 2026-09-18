# 解析器手册（parser-playbook）

改 `src/parser.ts` 或 `src/treeView.ts` 之前**必读**。解析器是行级状态机，
不是 tokenizer；大量行为靠精细的水位/栈机制维持，改动前先理解本文件。

## 解析管线

1. `preprocessContent()`：按行拆分后做**字符级单遍** `stripLiteralsAndComments()`——
   剥离字符串字面量（含 Oracle Q-quote）、`--` 与 `/* */` 注释，保留
   `originalLineNumber` 映射（lineMapping）。此层是 O(n) 且跨行状态感知的，质量高。
2. `parseLines()` → `parseLine()`：对清洗后的行依次尝试：声明判定（常量→变量→类型→
   游标→异常，顺序敏感）→ CREATE → DECLARE → 顶层裸 BEGIN → 子程序 → IS/AS →
   BEGIN → EXCEPTION → END → 控制结构。
3. 状态机构成：`currentLevel`、`beginEndCounter`(bec)、`nodeStack`、
   `currentActiveNode`、`controlStack`、`anonBlockCounters`（匿名块水位栈）、
   `unitStateStack`（子程序上下文帧：bec + 匿名块水位 + currentLevel）。

## 关键不变量（改动后必须保持）

- `currentLevel === currentActiveNode.level` 在任何时刻成立。
  匿名块/子程序开启抬升层级，闭合时**必须**恢复（v1.8.0 修复的泄漏即违反此条）。
- `unitStateStack` 帧在子程序开启时保存宿主 bec/水位/层级，闭合时按帧恢复；
  帧值优先于递减值（可自愈体内漂移）。
- 匿名块水位：DECLARE 记录当时 bec 为水位，块内 BEGIN → 水位+1，
  END 回到水位 → 闭合匿名块。
- 包体顶层 END：`currentLevel===1 && nodeStack.length===0` 时关闭 packageNode；
  已闭合后跟随的顶层裸 BEGIN 属于新匿名块（Issue #5）。

## Gotchas（每条都对应一次真实事故）

1. **内联匿名块**（`DECLARE..BEGIN..END;`）解析为宿主的 `ANONYMOUS_BLOCK` 子节点；
   显示层 `createGroupedChildren` 必须跳过它做子程序分类；唯一子节点且宿主无自身声明
   （触发器形态）时代理渲染（`isDelegatedAnonBlock`，v1.7.2）。
2. **前向声明**：声明区的 `PROCEDURE x(...);` 不得创建真实节点/切换 currentActiveNode
   （幽灵节点事故），`isForwardDeclaration` 向前看 ≤15 行区分；同名真实定义原位替换
   声明节点（Emon 选定的 UX）。游标声明支持 RETURN 子句、嵌套括号参数、多行参数。
3. **Q-quote**（`q'[...]'`/`q'{...}'`/任意定界符，含 nq）由字符级状态机处理，
   支持跨行；禁止退回单正则方案（会破坏含 `--`/`/*` 的 Q-quote）。
4. **多行 CREATE**：15 行/2000 字符向前看；终止符含 IS/AS/AUTHID/DETERMINISTIC/
   RESULT_CACHE/PIPELINED/PARALLEL_ENABLE/AGGREGATE/ACCESSIBLE。
5. **CREATE TYPE / TYPE BODY / VIEW** 是一等 NodeType；TYPE BODY 成员方法带
   MEMBER/STATIC/FINAL/OVERRIDING/CONSTRUCTOR/MAP 前缀。
6. **BEGIN/END 识别是整行的**：`^\s*BEGIN\s*$` 等——解析器只对格式化 PL/SQL 保证正确。
   `BEGIN stmt;` 同行、多行 SQL CASE 的裸 `END 别名` 行是已知未修缺陷（见下）。
7. **匹配函数/过程**用模块级缓存正则（性能教训：勿在热路径 new RegExp）。
8. `parsing.maxNestingDepth` 配置经 `parse(content, sourceFile, {maxNestingDepth})` 传入；
   文件大小（10MB）/行数（50k）保护为解析器内部常量。

## 显示层（treeView.ts）规则

- 扁平分组：对象名 → Declaration → Sub Program → Body → Exception → End；
  包体子程序直接挂包下，嵌套子程序才用 Sub Program 文件夹。
- Body 文件夹只要有 `beginLine` 就生成（v1.6.3）；触发器借用匿名块的 beginLine。
- 宿主自带 EXCEPTION/END 时，内联块内同类叶子去重。
- 所有可展开 TreeItem 必须有 `command` + 稳定 `id`（`generateCacheKey` 带源文件前缀）。
- `reveal` 前必须走 `getParent` 链可见性检查（用户覆盖态优先于默认折叠态）——
  VS Code `reveal()` 会强制展开祖先链，违反无自动展开策略。

## 已知未修缺陷（改动相关区域时留意）

1. `isBeginStatement` 仅匹配独占一行 → `BEGIN stmt;` 同行时 BEGIN 不计数，
   成员永不闭合、后继成员链式吞进 Sub Program。
2. `isEndStatement` 匹配裸 `END`/`END 别名` 行 → 多行 SQL CASE 的标准写法可被
   过早闭合 + 孤儿 `end;` 造成 bec 负漂移。调试手段：wrap
   `PLSQLParser.prototype.handleBeginStatement/handleEndStatement` 逐行观察 bec。
3. 包规格（PACKAGE_HEADER）只渲染成员声明，规格级常量/类型/游标/异常不显示
   （createFlatChildren 不查 variableTable）——是否显示待 Emon 决定。
4. PACKAGE_HEADER/TRIGGER/TYPE/TYPE_BODY/VIEW 根节点 endLine 保持 open 是**正常行为**。

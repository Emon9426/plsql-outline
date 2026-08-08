# PL/SQL Outline 插件 V1.5 开发需求文档

> 版本: 1.5.0  
> 基线版本: 1.4.8  
> 文档状态: 待开发

---

## 目录

1. [需求概述](#1-需求概述)
2. [需求一：Parser 准确性修复](#2-需求一parser-准确性修复)
3. [需求二：禁止 Outline 面板自动打开](#3-需求二禁止-outline-面板自动打开)
4. [需求三：IF/LOOP 控制结构识别](#4-需求三ifloop-控制结构识别)
5. [需求四：跨文件 Ctrl+Click 导航](#5-需求四跨文件-ctrlclick-导航)
6. [实施优先级与依赖关系](#6-实施优先级与依赖关系)
7. [非功能性需求](#7-非功能性需求)

---

## 1. 需求概述

| 编号 | 需求名称 | 优先级 | 影响范围 |
|------|----------|--------|----------|
| REQ-1 | Parser 准确性修复 | P0-Critical | parser.ts, patterns.ts |
| REQ-2 | 禁止 Outline 面板自动打开 | P1-High | extension.ts |
| REQ-3 | IF/LOOP 控制结构识别 | P1-High | parser.ts, types.ts, treeView.ts |
| REQ-4 | 跨文件 Ctrl+Click 导航 | P2-Medium | extension.ts, 新增 symbolIndex.ts, settingsPanel.ts |

---

## 2. 需求一：Parser 准确性修复

### 2.1 前置问题：源码与编译产物不一致

**问题描述**: `src/parser.ts` 源码与 `out/parser.js` 编译输出存在严重分歧。编译版本包含 `handleCreateStatement`、`handleBeginStatement`、`handleEndStatement` 等方法，但源码中缺少对应实现。

**修复要求**:
- 以 `out/parser.js`（当前运行版本）为准，反向更新 `src/parser.ts` 使其与编译输出一致
- 建立编译验证流程，确保后续开发中源码与产物同步

### 2.2 已识别的 Bug 列表

#### BUG-1: Schema 前缀不支持 [严重度: HIGH]

**现象**: `CREATE OR REPLACE PACKAGE schema_name.package_name` 无法被识别。

**根因**: `patterns.ts` 中的正则表达式不支持 `schema.object_name` 格式。

**影响 Pattern**:
- `CREATE_PACKAGE`: `/^\s*CREATE\s+OR\s+REPLACE\s+PACKAGE\s+(\w+)\s*(?:AS|IS)?\s*$/i`
- `CREATE_FUNCTION`: 同类问题
- `CREATE_PROCEDURE`: 同类问题
- `CREATE_TRIGGER`: 同类问题

**修复要求**:
- 所有 CREATE 语句的正则须支持可选的 `schema_name.` 前缀
- 修改后模式: `CREATE\s+OR\s+REPLACE\s+PACKAGE\s+(?:[\w]+\.)?(\w+)`
- 捕获组仍应只捕获对象名（不含 schema）
- 需支持带引号的标识符: `"SCHEMA"."PACKAGE_NAME"`

#### BUG-2: BEGIN/END 计数器 Package 初始化块双重递增 [严重度: HIGH]

**现象**: Package Body 中包含初始化块（最后一个 BEGIN...END 不属于任何子程序）时，`beginEndCounter` 被错误地递增两次。

**根因**: `handleBeginStatement` 方法在检测到 package 初始化块时同时递增了计数器并创建了节点，导致后续 END 匹配错位。

**修复要求**:
- Package 初始化块的 BEGIN 只递增一次 `beginEndCounter`
- 确保 Package 初始化块的 END 能正确匹配并关闭节点
- 添加单元测试覆盖此场景

#### BUG-3: CONTROL_END_STATEMENT 模式缺失 WHILE [严重度: HIGH]

**现象**: `END WHILE;` 未被识别为控制结构结束语句，导致被误判为程序体结束。

**根因**: `CONTROL_END_STATEMENT` 模式为 `/^\s*END\s+(IF|LOOP|CASE)\s*[;]?\s*$/i`，缺少 `WHILE`。

**修复要求**:
- 更新为: `/^\s*END\s+(IF|LOOP|CASE|WHILE)\s*[;]?\s*$/i`
- 注意: PL/SQL 标准中 `END WHILE` 不存在（WHILE ... LOOP 使用 END LOOP），但需确认目标方言是否使用

#### BUG-4: END 语句必须有分号/斜杠 [严重度: HIGH]

**现象**: 当 `END package_name` 后跟换行再跟 `/` 时，END 语句不被识别。

**根因**: `END_STATEMENT` 模式 `/^\s*END(\s+\w+)?\s*[;/]\s*$/i` 要求 `;` 或 `/` 在同一行。

**实际代码格式**:
```sql
END my_package
/
```

**修复要求**:
- 方案A: 允许 END 语句没有分号/斜杠也能匹配（仅在 `beginEndCounter === 0` 时）
- 方案B: 预处理时将下一行的 `/` 合并到 END 行
- 推荐方案A，并增加上下文判断

#### BUG-5: 多行 CREATE 检测过于贪婪 [严重度: MEDIUM-HIGH]

**现象**: `checkMultiLineCreate` 在缓冲多行拼接时，可能将不相关的后续行错误地拼接到 CREATE 语句中。

**根因**: 多行检测依赖行尾标记判断是否结束拼接，但某些 PL/SQL 格式不符合预期。

**修复要求**:
- 设置多行缓冲的最大行数限制（建议 5 行）
- 当遇到 `IS`/`AS`/`AUTHID`/`DETERMINISTIC` 等关键字时终止拼接
- 添加超时/行数保护机制

#### BUG-6: processedLines Set 导致跳过代码 [严重度: MEDIUM]

**现象**: 被多行 CREATE 检测处理过的行号加入 `processedLines` Set 后，后续解析循环跳过这些行，可能遗漏这些行中的其他有意义内容。

**修复要求**:
- 审查 processedLines 的使用逻辑
- 确保多行拼接完成后，完整拼接结果仍被正确解析
- 不应跳过多行 CREATE 语句中 IS/AS 之后可能出现的内容

#### BUG-7: 注释处理未排除字符串字面量 [严重度: MEDIUM]

**现象**: 字符串中的 `--` 或 `/* */` 被误判为注释。

**示例**:
```sql
v_sql := 'SELECT * FROM t -- this is not a comment';
```

**修复要求**:
- 注释剥离逻辑需先识别字符串字面量边界（`'...'`）
- 在字符串字面量内的 `--` 和 `/* */` 不应被处理
- 注意处理转义单引号 `''`

#### BUG-8: DECLARE 块处理缺陷 [严重度: MEDIUM]

**现象**: 独立的 `DECLARE...BEGIN...END` 匿名块中，DECLARE 后的变量声明区域可能被误解析。

**修复要求**:
- 正确识别 DECLARE 作为匿名块开始标记
- DECLARE 到 BEGIN 之间的内容作为声明区域，不应尝试匹配其他模式
- 支持嵌套匿名块

### 2.3 验收标准

| 验收项 | 标准 |
|--------|------|
| Schema 前缀 | `CREATE OR REPLACE PACKAGE hr.emp_pkg` 正确识别为 `emp_pkg` |
| BEGIN/END 计数 | 含初始化块的 Package Body 所有节点正确闭合 |
| 控制结构排除 | `END IF;` `END LOOP;` `END CASE;` 不触发程序体结束 |
| END 无分号 | `END pkg_name\n/` 格式正确识别 |
| 多行 CREATE | 超过5行仍未闭合的 CREATE 语句放弃拼接 |
| 字符串中注释 | 字符串内的 `--` 不被剥离 |
| 源码同步 | `npm run compile` 后产物与源码逻辑一致 |

---

## 3. 需求二：禁止 Outline 面板自动打开

### 3.1 当前行为分析

| 触发时机 | 当前行为 | 代码位置 |
|----------|----------|----------|
| 插件激活后 1s | 自动解析当前文件 | extension.ts:1011-1026 |
| 切换编辑器 | 自动解析新文件 | extension.ts:369-384 |
| 光标移动 | 自动选中对应节点 | extension.ts:417-456 |
| 解析完成 | TreeView.reveal() 调用 | treeView.ts:1026-1029 |

### 3.2 需求说明

**用户期望**: 识别到匹配的代码文件后，只做后台解析，不自动打开/激活 Outline 面板。光标同步等功能在面板已打开时仍可工作。

**具体要求**:

1. **插件激活时**: 仍然执行后台解析（保留当前 1s 延迟解析逻辑），但不触发面板展开
2. **切换编辑器时**: 仍然执行后台解析，但不激活面板
3. **光标同步**: 仅在 Outline 面板已经可见时执行节点高亮/选中
4. **关键修改点**: 
   - 移除任何导致 VS Code 自动切换到 Outline 面板的 `focus` 命令
   - `treeView.reveal()` 调用前检查面板是否已可见，不可见则跳过
   - 移除插件激活时的 `plsqlOutline.focus` 命令调用

### 3.3 技术实现要点

```typescript
// 核心变化: reveal 前检查面板可见性
if (this.treeView.visible) {
    this.treeView.reveal(targetNode, { select: true, focus: false, expand: true });
}
```

- 需利用 `TreeView.visible` 属性判断面板是否已被用户手动打开
- 解析操作不依赖面板状态，始终在后台执行
- 不新增配置项，此为默认行为修改

### 3.4 验收标准

| 验收项 | 标准 |
|--------|------|
| 新开文件 | 打开 PL/SQL 文件后 Outline 面板不自动弹出/激活 |
| 后台解析 | 打开文件后手动展开 Outline 面板，可直接看到解析结果（无需再次触发） |
| 光标同步 | 面板可见时光标同步正常工作，面板隐藏时不执行 reveal |
| 手动打开 | 用户手动点击 Outline 面板后，所有交互功能正常 |

---

## 4. 需求三：IF/LOOP 控制结构识别

### 4.1 需求说明

在方法（Function）、存储过程（Procedure）、Sub Function、Sub Procedure 的代码体内，识别 IF 分支和 LOOP 循环结构，并在 Outline 树中以层级关系展示。

**关键约束**:
- 支持多层嵌套（IF 内的 LOOP，LOOP 内的 IF，IF 内的 IF 等）
- 嵌套层级在 Outline 中正确体现
- 支持折叠和展开操作

### 4.2 需要识别的控制结构

| 结构类型 | PL/SQL 语法 | Outline 显示名称 | 结束标记 |
|----------|-------------|------------------|----------|
| IF | `IF condition THEN` | `IF condition` | `END IF;` |
| ELSIF | `ELSIF condition THEN` | `ELSIF condition` | （下一个 ELSIF/ELSE/END IF） |
| ELSE | `ELSE` | `ELSE` | `END IF;` |
| Basic LOOP | `LOOP` | `LOOP` | `END LOOP;` |
| WHILE LOOP | `WHILE condition LOOP` | `WHILE condition` | `END LOOP;` |
| FOR LOOP | `FOR var IN range LOOP` | `FOR var IN ...` | `END LOOP;` |
| CASE | `CASE expression` | `CASE expression` | `END CASE;` |
| WHEN | `WHEN condition THEN` | `WHEN condition` | （下一个 WHEN/ELSE/END CASE） |

### 4.3 类型系统扩展

```typescript
// types.ts 新增 NodeType
enum NodeType {
    // ... 现有类型 ...
    IF_STATEMENT,        // IF 语句
    ELSIF_BRANCH,        // ELSIF 分支
    ELSE_BRANCH,         // ELSE 分支
    LOOP_STATEMENT,      // 基础 LOOP
    WHILE_LOOP,          // WHILE ... LOOP
    FOR_LOOP,            // FOR ... LOOP
    CASE_STATEMENT,      // CASE 语句
    WHEN_BRANCH,         // WHEN 分支
}
```

### 4.4 树结构示例

```
📦 PACKAGE BODY my_pkg
  📘 PROCEDURE process_data
    🔀 IF v_count > 0
      🔁 FOR i IN 1..v_count
        🔀 IF v_items(i) IS NOT NULL
          ⋯ (省略)
        📎 ELSE
          ⋯ (省略)
      🔁 WHILE v_flag
        ⋯ (省略)
    📎 ELSIF v_count = 0
      ⋯ (省略)
    📎 ELSE
      ⋯ (省略)
  📘 FUNCTION calculate
    🔁 LOOP
      🔀 CASE v_type
        📋 WHEN 'A'
        📋 WHEN 'B'
        📎 ELSE
```

### 4.5 解析规则

#### 4.5.1 识别模式（patterns.ts 新增）

```typescript
// 控制结构开始模式
static readonly IF_START = /^\s*IF\s+(.+?)\s+THEN\s*$/i;
static readonly ELSIF_START = /^\s*ELSIF\s+(.+?)\s+THEN\s*$/i;
static readonly ELSE_START = /^\s*ELSE\s*$/i;
static readonly LOOP_START = /^\s*LOOP\s*$/i;
static readonly WHILE_LOOP_START = /^\s*WHILE\s+(.+?)\s+LOOP\s*$/i;
static readonly FOR_LOOP_START = /^\s*FOR\s+(\w+)\s+IN\s+(.+?)\s+LOOP\s*$/i;
static readonly CASE_START = /^\s*CASE\s*(.*?)\s*$/i;
static readonly WHEN_START = /^\s*WHEN\s+(.+?)\s+THEN\s*$/i;

// 控制结构结束模式
static readonly END_IF = /^\s*END\s+IF\s*;\s*$/i;
static readonly END_LOOP = /^\s*END\s+LOOP\s*(?:\s+\w+)?\s*;\s*$/i;
static readonly END_CASE = /^\s*END\s+CASE\s*;\s*$/i;
```

#### 4.5.2 嵌套处理逻辑

- 使用独立的控制结构栈 `controlStack` 管理嵌套关系
- 控制结构栈与现有 `beginEndCounter` / `nodeStack` 独立运作
- 控制结构仅在已进入方法/过程体后（`beginEndCounter > 0` 且当前在方法内部）才开始识别
- ELSIF/ELSE 不入栈，而是关闭前一个 IF/ELSIF 分支并创建同级新节点

#### 4.5.3 ELSIF/ELSE 的层级处理

```
IF condition1 THEN     -> 压入控制栈, 创建 IF 节点
  ...                  -> IF 节点的子内容
ELSIF condition2 THEN  -> 关闭当前 IF 节点, 创建同级 ELSIF 节点
  ...                  -> ELSIF 节点的子内容  
ELSE                   -> 关闭当前 ELSIF 节点, 创建同级 ELSE 节点
  ...                  -> ELSE 节点的子内容
END IF;                -> 关闭当前分支节点, 弹出控制栈
```

**Outline 层级关系**: ELSIF 和 ELSE 作为 IF 的**同级兄弟节点**（非子节点），统一归属于父方法节点下。

> **设计决策**: ELSIF/ELSE 显示为 IF 的同层兄弟。这样在 Outline 中折叠 IF 时，ELSIF/ELSE 也一并折叠，行为符合"一个完整 IF 块"的语义。如需将 ELSIF/ELSE 作为 IF 的子节点（折叠 IF 时隐藏分支），可在实现时再调整。

### 4.6 作用域限制

控制结构识别**仅在以下节点内部生效**:
- FUNCTION
- PROCEDURE
- Sub FUNCTION（SubProgram 内的函数）
- Sub PROCEDURE（SubProgram 内的过程）
- ANONYMOUS_BLOCK
- Package 初始化块

**不在以下区域识别**:
- Package Spec 声明区域
- 变量声明区域（DECLARE / IS-AS 到 BEGIN 之间）

### 4.7 显示名称截断

当条件表达式过长时，Outline 节点名称需截断：
- 最大显示长度: 60 字符
- 超出部分用 `...` 替代
- 示例: `IF v_employee_record.department_id = v_target_dep...`

### 4.8 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `showControlStructures` | boolean | true | 是否显示 IF/LOOP 控制结构 |
| `controlStructureMaxDepth` | number | 10 | 控制结构最大嵌套深度 |

### 4.9 验收标准

| 验收项 | 标准 |
|--------|------|
| IF 识别 | `IF condition THEN` 创建 IF 节点，显示条件 |
| 嵌套 | IF 内的 LOOP、LOOP 内的 IF 正确体现父子关系 |
| ELSIF/ELSE | 作为同级节点正确显示 |
| FOR/WHILE | 显示循环变量/条件信息 |
| CASE/WHEN | CASE 作为父节点，WHEN/ELSE 作为其下内容 |
| Sub Program | Sub Function/Procedure 内的控制结构正确识别 |
| 折叠展开 | 折叠 IF 节点可隐藏其下所有内容含 ELSIF/ELSE |
| 深层嵌套 | 3层以上嵌套正确显示层级 |
| 大文件性能 | 1000行以上的过程体，解析时间 < 500ms |
| 配置关闭 | `showControlStructures=false` 时不显示任何控制结构 |

---

## 5. 需求四：跨文件 Ctrl+Click 导航

### 5.1 需求说明

当 FunctionA 中调用 FunctionB 时，按住 Ctrl 点击 FunctionB 的名字，能够跳转到 FunctionB 的定义位置。如果 FunctionB 不在当前文件中，则打开对应文件并定位到定义行。

### 5.2 代码仓库路径设置

#### 5.2.1 配置结构

```jsonc
// settings.json
{
    "plsqlOutline.codeRepository": {
        "paths": [
            {
                "path": "D:/projects/main-repo/src/plsql",
                "priority": 1
            },
            {
                "path": "D:/projects/shared-lib/plsql",
                "priority": 2
            }
        ],
        "fileExtensions": [".sql", ".pks", ".pkb", ".prc", ".fnc", ".trg"]
    }
}
```

#### 5.2.2 路径规则

- 最多支持 **2 个**代码仓库路径
- 按优先级（priority 数值小者优先）顺序搜索
- 在高优先级路径中找到匹配文件后，**不再遍历**低优先级路径
- 只设置 1 个路径时仅遍历该路径
- 路径必须为绝对路径
- 搜索时递归遍历子目录

#### 5.2.3 设置界面

在现有 settingsPanel 中新增"代码仓库"设置区：
- 路径 1（高优先级）: 文件夹选择器 + 路径输入框
- 路径 2（低优先级）: 文件夹选择器 + 路径输入框（可选）
- 文件扩展名过滤: 多选/输入（默认 `.sql, .pks, .pkb, .prc, .fnc, .trg`）
- "重建索引"按钮: 手动触发重新扫描

### 5.3 符号索引系统

#### 5.3.1 索引构建

```typescript
interface SymbolEntry {
    name: string;              // 符号名称（大写标准化）
    type: NodeType;            // FUNCTION | PROCEDURE | PACKAGE_HEADER | PACKAGE_BODY | TRIGGER
    packageName?: string;      // 所属 Package 名称（如适用）
    filePath: string;          // 文件绝对路径
    line: number;              // 定义行号（0-based）
    parameters?: string[];     // 参数列表（用于重载区分）
}

interface SymbolIndex {
    symbols: Map<string, SymbolEntry[]>;  // key: 符号名（大写）
    lastBuildTime: number;
    fileCount: number;
}
```

#### 5.3.2 索引构建策略

1. **初始构建**: 插件激活时异步扫描配置路径下所有匹配文件
2. **增量更新**: 监听文件变化（FileSystemWatcher），仅更新变更文件的索引
3. **手动重建**: 提供 Command 和设置界面按钮触发全量重建
4. **懒加载**: 首次 Ctrl+Click 时如索引未就绪，触发按需构建并提示用户

#### 5.3.3 索引持久化

- 索引结果缓存到 `globalStoragePath` 下的 JSON 文件
- 启动时加载缓存，后台验证文件修改时间，增量更新变更部分
- 缓存文件格式版本化，版本不匹配时全量重建

### 5.4 定义跳转逻辑

#### 5.4.1 触发条件

- 用户在 PL/SQL 文件中 Ctrl+Click（或 F12）一个标识符
- 该标识符位于方法/过程调用位置（非声明、非字符串字面量、非注释）

#### 5.4.2 搜索策略（按优先级）

```
1. 当前文件内搜索
   ├── 当前方法/过程的局部变量/游标
   ├── 当前 Package 内的其他方法/过程
   └── 文件顶层声明

2. 跨文件搜索（仅在当前文件未找到时触发）
   ├── 符号索引精确匹配（名称 + Package 前缀）
   └── 符号索引模糊匹配（仅名称）
```

#### 5.4.3 Package 调用解析

| 调用格式 | 解析策略 |
|----------|----------|
| `pkg_name.proc_name(...)` | 搜索名为 `pkg_name` 的 Package 文件，定位其中的 `proc_name` |
| `proc_name(...)` | 先查当前文件，再查索引中所有 `proc_name` |
| `schema.pkg_name.proc_name(...)` | 忽略 schema，按 `pkg_name.proc_name` 搜索 |

#### 5.4.4 多匹配处理（弹出选择列表）

当存在多个匹配结果时（如重载过程、Spec + Body），弹出 VS Code 的 Quick Pick 选择列表：

```typescript
// 列表项格式
interface DefinitionChoice {
    label: string;       // 如: "process_data(p_id NUMBER, p_name VARCHAR2)"
    description: string; // 如: "Package Body - emp_pkg"
    detail: string;      // 如: "D:/repo/src/emp_pkg.pkb:45"
    location: vscode.Location;
}
```

**列表显示信息**:
- 函数/过程名 + 参数列表（用于区分重载）
- 所在位置类型（Package Spec / Package Body / Standalone）
- 文件路径 + 行号

#### 5.4.5 Package Spec vs Body 的处理

- 两者都作为候选项出现在选择列表中
- 排序规则: Package Body（实现）排在前面，Spec（声明）排在后面
- 如果只有一个匹配（仅 Spec 或仅 Body），直接跳转不弹出列表

### 5.5 文件匹配规则

#### 5.5.1 Package 文件命名惯例

搜索 Package 相关文件时，按以下命名约定查找：
- `{package_name}.pkb` — Package Body
- `{package_name}.pks` — Package Spec
- `{package_name}_body.sql` — Package Body（备选）
- `{package_name}_spec.sql` — Package Spec（备选）
- `{package_name}.sql` — 可能包含 Spec 和 Body

若命名约定未命中，则对目录下所有 SQL 文件进行内容索引匹配。

#### 5.5.2 独立过程/函数文件

- `{object_name}.prc` — Procedure
- `{object_name}.fnc` — Function
- `{object_name}.trg` — Trigger
- `{object_name}.sql` — 任意类型

### 5.6 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `codeRepository.paths` | array | [] | 代码仓库路径列表（最多2项） |
| `codeRepository.paths[].path` | string | "" | 仓库绝对路径 |
| `codeRepository.paths[].priority` | number | 1 | 优先级（1最高） |
| `codeRepository.fileExtensions` | string[] | [".sql",".pks",".pkb",".prc",".fnc",".trg"] | 扫描的文件扩展名 |
| `codeRepository.autoIndex` | boolean | true | 是否自动构建索引 |
| `codeRepository.maxFiles` | number | 5000 | 索引最大文件数量限制 |

### 5.7 验收标准

| 验收项 | 标准 |
|--------|------|
| 当前文件跳转 | Ctrl+Click 同文件内的函数名，跳转到定义行 |
| 跨文件跳转 | Ctrl+Click 其他文件的函数名，打开文件并定位 |
| Package 调用 | `pkg.proc_name` 格式正确解析并跳转 |
| 多匹配选择 | 存在重载时弹出选择列表 |
| Spec/Body | Package 的 Spec 和 Body 都作为候选项 |
| 路径优先级 | 高优先级路径匹配后不遍历低优先级路径 |
| 索引性能 | 1000 文件以下索引构建 < 10秒 |
| 增量更新 | 文件修改后索引自动更新 |
| 设置界面 | 可通过 UI 配置仓库路径和扩展名 |
| 无配置时 | 未配置仓库路径时，跨文件功能静默不生效 |

---

## 6. 实施优先级与依赖关系

```
REQ-1 (Parser修复) ──┐
                     ├──> REQ-3 (IF/LOOP识别) ──┐
REQ-2 (面板行为)     │                          ├──> 集成测试
                     └──> REQ-4 (跨文件导航) ───┘
```

**实施顺序建议**:

1. **Phase 1**: REQ-1 (Parser 修复) + REQ-2 (面板行为)
   - 原因: REQ-1 是后续功能的基础；REQ-2 改动小且独立
   
2. **Phase 2**: REQ-3 (IF/LOOP 识别)
   - 原因: 依赖 Parser 修复完成后的稳定基础

3. **Phase 3**: REQ-4 (跨文件导航)
   - 原因: 最复杂的新功能，需新增模块

---

## 7. 非功能性需求

### 7.1 性能要求

| 指标 | 要求 |
|------|------|
| 单文件解析（<1000行） | < 200ms |
| 单文件解析（1000-5000行） | < 1000ms |
| 单文件解析（>5000行） | < 3000ms |
| 索引构建（1000文件） | < 10s |
| 符号查找 | < 100ms |
| 跨文件跳转（含文件打开） | < 2s |

### 7.2 兼容性要求

- VS Code 最低版本: 1.74.0
- 操作系统: Windows / macOS / Linux
- 不影响现有 `showStructureBlocks` 功能的 BEGIN/EXCEPTION/END 显示

### 7.3 测试要求

- 每个 Bug 修复提供对应的回归测试用例
- IF/LOOP 识别提供覆盖所有结构类型的测试文件
- 跨文件导航提供模拟仓库结构的集成测试
- 大文件（5000+ 行）压力测试

### 7.4 源码管理要求

- 修复 `src/parser.ts` 与 `out/parser.js` 的分歧后，后续开发一律以 TypeScript 源码为准
- 建立 `npm run compile` + 验证的开发流程
- 新增代码须有类型标注

---

## 附录 A：受影响文件清单

| 文件 | REQ-1 | REQ-2 | REQ-3 | REQ-4 |
|------|-------|-------|-------|-------|
| src/parser.ts | ✅ 重构 | - | ✅ 新增控制结构解析 | - |
| src/patterns.ts | ✅ 修复正则 | - | ✅ 新增匹配模式 | - |
| src/types.ts | - | - | ✅ 新增 NodeType | ✅ 新增 SymbolEntry |
| src/extension.ts | - | ✅ 修改激活逻辑 | - | ✅ 修改 provideDefinition |
| src/treeView.ts | - | ✅ 修改 reveal | ✅ 新增控制结构节点渲染 | - |
| src/symbolIndex.ts | - | - | - | ✅ 新增文件 |
| src/settingsPanel.ts | - | - | ✅ 新增配置项 | ✅ 新增仓库路径设置 |
| package.json | - | - | ✅ 新增配置声明 | ✅ 新增配置声明 |

---

## 附录 B：测试用例文件结构建议

```
test/
├── fixtures/
│   ├── simple_package.sql          -- 基础 Package 测试
│   ├── schema_prefix.sql           -- Schema 前缀测试
│   ├── nested_control.sql          -- 嵌套 IF/LOOP 测试
│   ├── package_with_init.sql       -- Package 初始化块测试
│   ├── multiline_create.sql        -- 多行 CREATE 测试
│   ├── string_with_comments.sql    -- 字符串内注释测试
│   ├── large_package.sql           -- 大文件性能测试 (5000+ 行)
│   └── cross_file/
│       ├── main_proc.sql           -- 主调用过程
│       ├── util_pkg.pks            -- 工具包 Spec
│       ├── util_pkg.pkb            -- 工具包 Body
│       └── standalone_func.fnc     -- 独立函数
├── parser.test.ts
├── controlStructure.test.ts
├── symbolIndex.test.ts
└── navigation.test.ts
```

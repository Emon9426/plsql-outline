# PL/SQL Outline V1.5 测试结果文档

> 版本：1.6.1
> 测试日期：2026-08-08
> 测试环境：Node.js v22.x，Windows，TypeScript 编译后运行

## 一、测试总览

| 测试套件 | 用例数 | 状态 | 说明 |
|----------|--------|------|------|
| parser_test.js | 965 | ✅ 全部通过 | 核心解析回归（5 级嵌套、大包、schema 前缀、字符串/注释、包初始化、UI 一致性） |
| ecommerce_pkg_test.js | 54 | ✅ 全部通过 | 1331 行真实电商包（8 函数 / 9 过程 / 3 级嵌套 / IS NULL / 性能） |
| complex_realworld_test.js | 33 | ✅ 全部通过 | BUG-A(IS NULL)/BUG-B(无初始化块包闭合) 回归 |
| regression_edge_test.js | 23 | ✅ 全部通过 | 6 类边界场景（初始化块、独立函数、签名行 IS、ELSIF/ELSE、CASE WHEN） |
| ui_structure_test.js | 44 | ✅ 全部通过 | TreeView 分区（DECLARE/BODY/EXCEPTION/END）、IF 组合并、标签简化 |
| symbolIndex_test.js | 35 | ✅ 全部通过 | 跨文件符号索引（构建、查找、优先级、增量、持久化、大小写） |
| huge_package_test.js | 25 | ✅ 全部通过 | 13,259 行万级代码性能与正确性 |
| declaration_render_test.js | 32 | ✅ 全部通过 | Declaration 包裹层 + 包下子程序直接显示 + P/F 图标(proc/func) + Body 跳 BEGIN |
| cursor_sync_test.js | 16 | ✅ 全部通过 | 光标同步：声明项/子程序/控制结构行定位 + reveal 标签一致性 + 过程体内行选中所属子程序 |
| definition_test.js | 7 | ✅ 全部通过 | Ctrl+Click 跳转：去重守卫移除后两次调用都返回 Location |
| **GMLTest/nested_subprograms_test.js** | **32** | ✅ 全部通过 | 4 级 Sub Program 嵌套（Package Body） |
| **GMLTest/standalone_proc_func_test.js** | **30** | ✅ 全部通过 | 独立 Procedure/Function 渲染（无包包裹） |
| **GMLTest/anon_block_trigger_test.js** | **26** | ✅ 全部通过 | 匿名块（DECLARE...BEGIN...END）+ 触发器渲染 |
| **GMLTest/large_package_render_test.js** | **23** | ✅ 全部通过 | 万行级 Package 渲染（13,258 行，性能+扁平化样式） |
| **GMLTest/nested_definition_test.js** | **11** | ✅ 全部通过 | 嵌套子程序 Ctrl+Click 跳转（2/3 级嵌套，Bug A/C 回归） |
| **GMLTest/qquote_create_test.js** | **17** | ✅ 全部通过 | Q-quote 字符串 + CREATE TYPE/VIEW + 多行长签名 + 带标签 END + MEMBER FUNCTION |
| **GMLTest/qquote_edge_test.js** | **30** | ✅ **新增·全部通过** | **Q-quote 边界场景：5种定界符+任意定界、危险内容、跨行Q-quote、真实动态SQL、性能** |
| **合计** | **1403** | **✅ 100% 通过** | |

所有测试脚本位于 `test/` 与 `GMLTest/` 目录，运行方式：
```bash
npm run compile          # 先编译 TypeScript
node test/<测试文件>.js   # 直接运行（使用自研断言框架）
```

---

## 二、万行级测试（huge_package_test.js）

### 测试代码
- 生成器：`test/generate_huge_package.js`（可重复运行）
- 测试用例：`test/huge_package_10k.sql`（**13,259 行**，>10,000 行目标）
- 测试脚本：`test/huge_package_test.js`

### 测试代码结构（万行复杂多层循环与分支嵌套）
生成的 `huge_test_pkg` 包含：

| 维度 | 数量 | 说明 |
|------|------|------|
| 总行数 | 13,259 | 远超万行目标 |
| 顶层程序 | 150 | 函数/过程交替（75 函数 + 75 过程） |
| 子程序（2 级） | 150 | 每个顶层程序 1 个 sub_calc/sub_proc |
| 子子程序（3 级） | 150 | 每个 sub_proc 含 innermost 子函数 |
| IF 语句 | 600 | 含 IS NULL / IS NOT NULL 控制结构 |
| FOR 循环 | 450 | 含 REVERSE 形式 |
| WHILE 循环 | 300 | |
| CASE 语句 | 150 | 每个含 3 个 WHEN + ELSE |
| LOOP | 150 | 基本循环 + EXIT WHEN |

**控制嵌套层级示例**（每个顶层程序主体）：
```
FOR i IN 1..p LOOP                          -- L1
  IF p > 0 THEN                             -- L2
    FOR k IN REVERSE 1..5 LOOP              -- L3
      WHILE v < max LOOP                    -- L4
        CASE                                -- L5
          WHEN ... THEN ...                 -- L6
          ELSE ...
        END CASE;
      END LOOP;
    END LOOP;
  ELSE
    IF p IS NOT NULL THEN                   -- 验证 IS NOT NULL
      LOOP EXIT WHEN ...; END LOOP;
    END IF;
  END IF;
END LOOP;
```

### 测试结果
```
=== 万行级 PL/SQL 解析测试 ===
文件行数: 13259
--- 性能 ---
解析时间: 39~61 ms                        ✅ < 3000ms（远超目标）
--- 正确性 ---
解析错误数: 0                             ✅ 零错误
根节点: PACKAGE_BODY huge_test_pkg [L1-13258]   ✅ 闭合
--- 顶层程序 ---
顶层程序数: 150                           ✅ 全部闭合（未闭合数 0）
--- 控制嵌套 ---
最大嵌套深度: 11                          ✅ >= 6
控制结构: IF=600, FOR=450, WHILE=300, CASE=150, WHEN=450
--- 声明项 ---
变量: 770, 游标: 160, 常量: 162, 类型: 160, 异常: 158  ✅ 全部类别
所有声明项均带规范化 category 字段         ✅
--- 行号一致性 ---
所有节点行号一致（错误 0）                ✅
================================
测试结果: 25/25 通过
```

---

## 三、声明项分组渲染测试（declaration_render_test.js）

验证 Phase B 新增功能：声明项按类别（Variables / Cursors / Constants / Types / Exceptions）分组展示。

### 测试覆盖
1. ✅ 包体因含包级声明而使用分区分组（DECLARE/BODY/EXCEPTION/END）
2. ✅ DECLARE 分区下出现 5 类声明分组（Variables/Cursors/Constants/Types/Exceptions）
3. ✅ 分组可展开为声明项叶节点（带类别图标、行号描述、跳转命令）
4. ✅ 程序体（do_work）局部声明同样分组展示
5. ✅ 声明项 TreeItem 带 `plsqlOutline.goToLine` 跳转命令（支持 Ctrl+Click）
6. ✅ BODY 分区保留控制结构（IF/FOR），不被声明项影响
7. ✅ EXCEPTION / END 分区正常存在

### 大纲结构示例（demo_pkg）
```
📦 demo_pkg [PACKAGE_BODY]
├─ 📁 DECLARE
│  ├─ Procedure: do_work
│  ├─ 📋 Variables (1)
│  │  └─ g_count : NUMBER = 0        [L6]
│  ├─ 📋 Constants (1)
│  │  └─ c_limit : NUMBER = 100      [L7]
│  ├─ 📋 Cursors (1)
│  │  └─ c_all                       [L8]
│  ├─ 📋 Types (1)
│  │  └─ t_rec IS RECORD             [L11]
│  └─ 📋 Exceptions (1)
│     └─ e_bad                       [L12]
├─ ▶ BODY (控制结构: IF/FOR)
├─ ▶ EXCEPTION
└─ ▶ END
```

---

## 四、回归测试详情

### parser_test.js（965 项）
- 5 级控制嵌套链 `IF > FOR > IF > WHILE > CASE(WHEN×3)` 正确解析
- 大包（97 方法）解析 < 1000ms，全部方法闭合
- schema 前缀 `hr.test_nested_pkg` → `test_nested_pkg`
- 字符串内 `--` / `/* */` 不误判为注释
- 包初始化块 beginLine 正确设置
- ELSIF/ELSE 作为 IF 兄弟节点

### ecommerce_pkg_test.js（54 项）
- 1331 行真实包：8 函数 + 9 过程
- 3 级嵌套（calculate_order_total → compute_line_amount → apply_discount_and_round）
- BUG-A：IS NULL 控制结构（IF >= 40, CASE >= 5, FOR >= 10, WHILE >= 5）
- 性能 < 200ms

### complex_realworld_test.js（33 项）
- BUG-B：无初始化块包体正确闭合（endLine 非 null）
- BUG-A：IF x IS NULL / IS NOT NULL 识别
- 3 级子程序嵌套与状态恢复

### regression_edge_test.js（23 项）
- 初始化块包、独立函数、签名行 IS、同行 FUNCTION...RETURN...IS、多分支 ELSIF/ELSE、CASE WHEN IS NULL

### symbolIndex_test.js（35 项）
- 跨文件符号索引：构建、优先级查找、增量更新、JSON 持久化、大小写不敏感

---

## 五、本版本新增/修复

### 新增功能
1. **声明项大纲展示**：变量/游标/常量/类型/异常按类别分组显示在 DECLARE 区域（参照 PLSQL Developer）
2. **常量识别**：`name type CONSTANT := value` 形式
3. **类型识别**：`TYPE name IS RECORD/TABLE OF/VARRAY/REF CURSOR/OBJECT`
4. **声明项 Ctrl+Click 跳转**：复用 goToLine，点击声明项跳转到声明行
5. **万行级测试**：13,259 行复杂多层嵌套用例

### 修复的解析缺陷
1. **变量未被记录**（既有 bug）：原逻辑先剥离行尾 `;` 再匹配要求 `;` 的正则，导致变量声明从未被记录
2. **游标未识别多行 SELECT**（既有 bug）：`CURSOR x(params) IS` 行尾无后续内容时正则不匹配，改为 `IS\b`
3. **PRAGMA / END IF 被误判为变量**（既有 bug）：新增 PL/SQL 保留字集合过滤

### 配置项
- `plsql-outline.view.showDeclarations`（默认 true）：是否显示声明项
- `plsql-outline.view.groupDeclarations`（默认 true）：是否按类别分组（false 则扁平展开）

---

## 六、v1.5.3 修复（Sub Program 分组 + 光标同步 + Ctrl+Click 跳转）

### 1. Sub Program 分组（declaration_render_test.js，26 项）
- 所有子程序（函数/过程）统一归入 "Sub Program (N)" 分组，不再平铺在 DECLARE 中
- 分区顺序：对象名 → Declare(声明项) → **Sub Program(子程序)** → Body → Exception → End
- DECLARE 分区仅含声明项分组（变量/游标/常量/类型/异常）
- getParent 父链验证：声明项→声明分组→DECLARE分区→包节点；子程序→SUBPROGRAM分区

### 2. 光标同步修复（cursor_sync_test.js，13 项）
修复 4 个叠加 bug：
- **Bug A**：`findTargetByLine` 现在遍历 `variableTable`，点击变量/游标/常量/类型/异常声明行能定位到 declarationEntry（优先级 1100，高于节点声明行的 1000）
- **Bug B**：`reveal()` 改为 try/catch 容错（不可见时静默跳过，可见时不再被错误吞掉）
- **Bug C**：构造的 TreeItemData 字段与 getChildren 产出逐字段一致
- **Bug D**：`getParent()` 新增 section/declarationGroup/declarationEntry/子程序 的父链重建（buildSectionItem / buildDeclarationGroupItem / findOwnerNodeOfVariable）

验证场景：
- 点击 g_count / c_all / e_bad 声明行 → 定位到 declarationEntry
- 点击 v_local 局部变量行 → 定位到 declarationEntry
- 点击 do_work 声明行 → 定位到 node
- 点击 BEGIN / EXCEPTION 行 → 定位到结构块
- 声明项行优先于所在节点范围

### 3. Ctrl+Click 跳转修复（definition_test.js，7 项）
- **根因**：`provideDefinition` 的 100ms 去重守卫误杀 VS Code 第二次（真正导航）调用
- **修复**：移除去重守卫 + 对齐 DefinitionProvider 选择器为 `[{language:'sql'},{language:'plsql'}]`（与 HoverProvider 一致）
- **验证**：同一位置连续两次 provideDefinition 调用都返回 Location（不再第二次为 null）
- 变量跳转：点击 g_count 使用处 → 跳转到声明行

---

## 七、v1.5.4 扁平化分组样式（Declaration 包裹 + 递归 Sub Program）

### 7.1 GMLTest 嵌套测试（GMLTest/nested_subprograms_test.js，30 项，HTML 报告）
独立 GMLTest 文件夹，专门验证 Sub Program 任意深度嵌套。运行 `node GMLTest/run_all.js` 生成 `GMLTest/test_report.html`（浏览器可打开）。

测试对象 `GMLTest/nested_subprograms.pkb` 嵌套链（4 级 Sub Program）：
```
gml_test_pkg
└─ outer_proc (Procedure)
   └─ inner_func (Function)
      └─ deepest_proc (Procedure)
         └─ leaf_func (Function)
```

验证的 30 个 case 覆盖：
- **顶层扁平结构**：Declaration / Sub Program 文件夹，无旧 DECLARE/SUBPROGRAM 分区层
- **Declaration 包裹层**：5 类声明（Variables/Constants/Cursors/Types/Exceptions）收纳其下
- **Sub Program 嵌套 L1-L4**：每级子程序在父级 Sub Program 下，且可完整展开（含自身 Declaration/Sub Program/Body）
- **图标区分**：Procedure=symbol-method，Function=symbol-function
- **Body 各层**：每层子程序的 Body 含 IF/FOR/WHILE/CASE
- **递归 getParent 父链**：leaf_func 父链可逐级回溯到包根节点（reveal 不断链）

### 7.2 declaration_render_test.js（27 项，适配新结构）
- Declaration 包裹文件夹 + 5 类声明分组
- Sub Program 文件夹 + Procedure/Function 图标区分
- 子程序内部扁平化（Declaration/Body）
- getParent 父链：声明项→分组→Declaration→包；子程序→Sub Program→包

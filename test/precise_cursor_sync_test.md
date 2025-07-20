# 精准光标同步功能测试文档

## 功能描述
v1.4.1 改进功能：当用户在代码文件中点击某一行时，大纲视图会精准地选中对应的结构部分。

## 精准同步规则

### 1. 结构块精准识别
根据光标所在的行号位置，智能识别并选中对应的结构块：

#### BEGIN 块选中规则
- **条件**：光标在 BEGIN 行到 EXCEPTION 行之间（不包括 EXCEPTION 行）
- **或者**：光标在 BEGIN 行到 END 行之间（当没有 EXCEPTION 块时）
- **选中目标**：大纲视图中的 BEGIN 结构块

#### EXCEPTION 块选中规则
- **条件**：光标在 EXCEPTION 行到 END 行之间（不包括 END 行）
- **选中目标**：大纲视图中的 EXCEPTION 结构块

#### END 块选中规则
- **条件**：光标正好在 END 行上
- **选中目标**：大纲视图中的 END 结构块

#### 对象名选中规则
- **条件**：光标在声明行或其他不属于结构块的位置
- **选中目标**：大纲视图中的对象名部分（函数名、过程名等）

### 2. 嵌套结构优先级
- **子函数/过程优先**：如果光标在子函数或子过程内，只选中子函数/过程的对应部分
- **最具体原则**：总是选择最具体的嵌套层级

## 实现原理

### 核心算法

#### 1. `findTargetByLine()` 方法
```typescript
private findTargetByLine(nodes: ParseNode[], line: number): {
    type: 'node' | 'structureBlock', 
    node: ParseNode, 
    blockType?: string 
} | null
```

**工作流程**：
1. 递归遍历解析树
2. 优先检查子节点（确保选择最具体的节点）
3. 调用 `getStructureBlockType()` 判断结构块类型
4. 返回节点或结构块目标

#### 2. `getStructureBlockType()` 方法
```typescript
private getStructureBlockType(node: ParseNode, line: number): string | null
```

**判断逻辑**：
```
if (line === node.endLine) {
    return 'END';
}

if (node.exceptionLine && line >= node.exceptionLine) {
    if (node.endLine && line < node.endLine) {
        return 'EXCEPTION';
    }
}

if (node.beginLine && line >= node.beginLine) {
    if (node.exceptionLine && line < node.exceptionLine) {
        return 'BEGIN';
    } else if (node.endLine && line < node.endLine) {
        return 'BEGIN';
    }
}

return null; // 选中对象名
```

#### 3. `selectAndRevealTarget()` 方法
```typescript
async selectAndRevealTarget(target: {
    type: 'node' | 'structureBlock', 
    node: ParseNode, 
    blockType?: string 
}): Promise<void>
```

**处理逻辑**：
- 根据目标类型创建对应的 `TreeItemData`
- 使用 VS Code `reveal()` API 选中并展开
- 记录调试日志

## 测试用例

### 测试用例 1：基本结构块识别

**测试代码**：
```sql
FUNCTION test_function RETURN NUMBER IS
    v_result NUMBER;
BEGIN                    -- 第3行
    v_result := 1;       -- 第4行
    RETURN v_result;     -- 第5行
EXCEPTION               -- 第6行
    WHEN OTHERS THEN     -- 第7行
        RETURN -1;       -- 第8行
END test_function;      -- 第9行
```

**预期行为**：
- 光标在第1行：选中 `test_function (Function)`
- 光标在第3行：选中 `BEGIN`
- 光标在第4-5行：选中 `BEGIN`
- 光标在第6行：选中 `EXCEPTION`
- 光标在第7-8行：选中 `EXCEPTION`
- 光标在第9行：选中 `END`

### 测试用例 2：嵌套函数结构

**测试代码**：
```sql
FUNCTION outer_function RETURN NUMBER IS
    FUNCTION inner_function RETURN NUMBER IS
    BEGIN                    -- 第3行
        RETURN 1;           -- 第4行
    END inner_function;     -- 第5行
BEGIN                       -- 第6行
    RETURN inner_function;  -- 第7行
EXCEPTION                   -- 第8行
    WHEN OTHERS THEN        -- 第9行
        RETURN -1;          -- 第10行
END outer_function;         -- 第11行
```

**预期行为**：
- 光标在第3-4行：选中内层函数的 `BEGIN`
- 光标在第5行：选中内层函数的 `END`
- 光标在第6-7行：选中外层函数的 `BEGIN`
- 光标在第8-9行：选中外层函数的 `EXCEPTION`
- 光标在第11行：选中外层函数的 `END`

### 测试用例 3：无 EXCEPTION 块的函数

**测试代码**：
```sql
PROCEDURE simple_proc IS
BEGIN                    -- 第2行
    DBMS_OUTPUT.PUT_LINE('Hello');  -- 第3行
END simple_proc;        -- 第4行
```

**预期行为**：
- 光标在第1行：选中 `simple_proc (Procedure)`
- 光标在第2-3行：选中 `BEGIN`
- 光标在第4行：选中 `END`

### 测试用例 4：包体中的多个子程序

**测试代码**：
```sql
PACKAGE BODY test_pkg IS
    FUNCTION func1 RETURN NUMBER IS
    BEGIN                    -- 第3行
        RETURN 1;           -- 第4行
    END func1;              -- 第5行
    
    PROCEDURE proc1 IS
    BEGIN                    -- 第8行
        NULL;               -- 第9行
    EXCEPTION               -- 第10行
        WHEN OTHERS THEN    -- 第11行
            NULL;           -- 第12行
    END proc1;              -- 第13行
END test_pkg;               -- 第14行
```

**预期行为**：
- 光标在第3-4行：选中 `func1` 的 `BEGIN`
- 光标在第5行：选中 `func1` 的 `END`
- 光标在第8-9行：选中 `proc1` 的 `BEGIN`
- 光标在第10-12行：选中 `proc1` 的 `EXCEPTION`
- 光标在第13行：选中 `proc1` 的 `END`
- 光标在第14行：选中 `test_pkg` 的 `END`

## 配置选项

### 启用/禁用功能
```json
{
  "plsql-outline.view.autoSelectOnCursor": true
}
```

- `true`：启用精准光标同步（默认）
- `false`：禁用光标同步功能

### 结构块显示
```json
{
  "plsql-outline.view.showStructureBlocks": true
}
```

- `true`：显示结构块，启用精准同步（默认）
- `false`：隐藏结构块，只能选中对象名

## 技术实现细节

### 数据结构

#### TreeItemData 扩展
```typescript
interface TreeItemData {
    node?: ParseNode;
    structureBlock?: {
        type: StructureBlockType;
        line: number;
        parentNode: ParseNode;
    };
    isStructureBlock: boolean;
    label: string;
    line: number;
}
```

#### 目标类型定义
```typescript
type Target = {
    type: 'node' | 'structureBlock';
    node: ParseNode;
    blockType?: 'BEGIN' | 'EXCEPTION' | 'END';
}
```

### 性能优化

#### 1. 缓存机制
- 避免重复的节点查找
- 缓存 TreeItemData 对象
- 限制缓存大小防止内存泄漏

#### 2. 异步处理
- 所有 reveal 操作都是异步的
- 不阻塞主线程
- 错误容忍，单次失败不影响后续操作

#### 3. 条件检查
- 仅在 PL/SQL 文件中生效
- 检查配置开关状态
- 验证解析结果有效性

## 调试和故障排除

### 调试信息
启用调试模式后，可以在输出通道中看到：
```
[时间戳] 已选中结构块: BEGIN (第3行)
[时间戳] 已选中节点: test_function (第1行)
[时间戳] 选中目标失败: TreeItem not found
```

### 常见问题

#### Q: 光标移动时没有自动选中？
A: 检查以下设置：
1. `plsql-outline.view.autoSelectOnCursor` 是否为 `true`
2. `plsql-outline.view.showStructureBlocks` 是否为 `true`
3. 文件是否已正确解析
4. 是否为支持的 PL/SQL 文件类型

#### Q: 选中的不是期望的结构块？
A: 可能原因：
1. 解析结果中缺少对应的行号信息
2. 代码结构复杂，算法判断有偏差
3. 启用调试模式查看详细日志

#### Q: 嵌套结构选择错误？
A: 检查：
1. 子节点是否正确解析
2. 行号范围是否准确
3. 是否存在语法错误影响解析

## 版本历史

### v1.4.1 (2025-01-20)
- ✨ **新增**：精准结构块识别算法
- 🔧 **改进**：`findTargetByLine()` 方法支持结构块类型判断
- 🔧 **改进**：`selectAndRevealTarget()` 方法支持结构块选中
- 📊 **优化**：更详细的调试日志输出
- 🎯 **增强**：嵌套结构的精确识别

### v1.4.0 (2025-01-20)
- ✨ **新增**：基础光标同步功能
- ⚙️ **新增**：`autoSelectOnCursor` 配置选项
- 🔧 **实现**：基本的节点查找和选中功能

## 未来改进计划

1. **智能预测**：根据代码上下文预测用户意图
2. **视觉反馈**：添加选中时的视觉高亮效果
3. **反向同步**：大纲选中时自动移动编辑器光标
4. **快捷键支持**：添加键盘快捷键快速导航
5. **性能优化**：进一步优化大文件的响应速度

## 测试建议

### 手动测试步骤
1. 打开包含复杂嵌套结构的 PL/SQL 文件
2. 确保大纲视图已解析并显示结构
3. 在编辑器中点击不同位置的代码行
4. 观察大纲视图的选中状态是否符合预期
5. 测试各种边界情况（空行、注释行、语法错误等）

### 自动化测试
建议编写单元测试覆盖：
- `findTargetByLine()` 方法的各种输入情况
- `getStructureBlockType()` 方法的边界条件
- 嵌套结构的递归查找逻辑
- 错误处理和异常情况

---

**注意**：此功能需要正确的解析结果支持，确保 PL/SQL 代码语法正确且解析器能够识别所有结构块的行号信息。

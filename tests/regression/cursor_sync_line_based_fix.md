# 基于行号的光标同步修复文档

## 修改说明
v1.4.3 版本修复：移除了匿名块的特殊处理逻辑，确保光标同步功能严格基于行号和大纲视图结构进行选择。

## 用户需求
> "针对匿名块的处理还有问题。我希望在实现点击代码文件选中大纲视图的功能中，只根据行号和大纲视图结构区分。不要考虑忽略的匿名块和注释的部分。只要行号满足条件，则在大纲视图上选中对应的部分。"

## 核心原则
1. **纯行号驱动**：只根据行号范围判断选中目标
2. **大纲视图一致性**：选中的目标必须在大纲视图中存在
3. **不考虑语义忽略**：不考虑匿名块、注释等语义层面的忽略规则
4. **最具体优先**：优先选择最具体的嵌套节点

## 技术实现

### 修改前的问题代码（v1.4.2）
```typescript
// 问题：过滤掉匿名块，违反了用户需求
const nonAnonymousChildren = node.children.filter(child => child.type !== 'ANONYMOUS_BLOCK');
const childTarget = this.findTargetByLine(nonAnonymousChildren, line);
```

### 修改后的正确代码（v1.4.3）
```typescript
// 解决方案：不过滤任何节点类型，纯粹基于行号判断
const childTarget = this.findTargetByLine(node.children, line);
if (childTarget) {
    return childTarget;
}
```

## 工作逻辑

### 1. 递归查找算法
```typescript
private findTargetByLine(nodes: ParseNode[], line: number): {
    type: 'node' | 'structureBlock', 
    node: ParseNode, 
    blockType?: string 
} | null {
    for (const node of nodes) {
        // 检查当前节点的行号范围
        if (this.isLineInNode(node, line)) {
            // 先检查子节点，优先选择更具体的节点
            const childTarget = this.findTargetByLine(node.children, line);
            if (childTarget) {
                return childTarget;
            }
            
            // 检查是否在特定的结构块中
            const structureBlockType = this.getStructureBlockType(node, line);
            if (structureBlockType) {
                return {
                    type: 'structureBlock',
                    node: node,
                    blockType: structureBlockType
                };
            }
            
            // 如果不在结构块中，返回节点本身
            return {
                type: 'node',
                node: node
            };
        }
    }
    return null;
}
```

### 2. 行号范围判断
```typescript
private isLineInNode(node: ParseNode, line: number): boolean {
    const startLine = node.declarationLine;
    let endLine = node.endLine || startLine;
    
    // 如果有子节点，结束行应该包含所有子节点
    if (node.children.length > 0) {
        const lastChild = this.getLastChildNode(node);
        const lastChildEndLine = lastChild.endLine || lastChild.declarationLine;
        endLine = Math.max(endLine, lastChildEndLine);
    }
    
    return line >= startLine && line <= endLine;
}
```

### 3. 结构块类型判断
```typescript
private getStructureBlockType(node: ParseNode, line: number): string | null {
    // END 块：精确匹配 END 行
    if (node.endLine !== null && line === node.endLine) {
        return 'END';
    }
    
    // EXCEPTION 块：从 EXCEPTION 行到 END 行之间
    if (node.exceptionLine !== null && line >= node.exceptionLine) {
        if (node.endLine !== null && line < node.endLine) {
            return 'EXCEPTION';
        }
    }
    
    // BEGIN 块：从 BEGIN 行到 EXCEPTION/END 行之间
    if (node.beginLine !== null && line >= node.beginLine) {
        if (node.exceptionLine !== null && line < node.exceptionLine) {
            return 'BEGIN';
        } else if (node.endLine !== null && line < node.endLine) {
            return 'BEGIN';
        }
    }
    
    return null; // 选中节点本身
}
```

## 测试场景

### 场景1：匿名块处理
```sql
FUNCTION format_name(p_name VARCHAR2) RETURN VARCHAR2 IS
BEGIN                                          -- 第52行
    DECLARE                                    -- 第55行：匿名块开始
      v_names APEX_APPLICATION_GLOBAL.VC_ARR2;
      v_result VARCHAR2(100) := '';
    BEGIN                                      -- 第58行：匿名块BEGIN
      v_names := APEX_STRING.SPLIT(p_name, ' ');
      FOR i IN 1..v_names.COUNT LOOP           -- 第60行
        v_result := v_result || capitalize(v_names(i)) || ' ';  -- 第61行
      END LOOP;                                -- 第62行
      RETURN TRIM(v_result);
    EXCEPTION                                  -- 第64行：匿名块EXCEPTION
      WHEN OTHERS THEN                         -- 第65行
        RETURN p_name;                         -- 第66行
    END;                                       -- 第67行：匿名块结束
END format_name;                               -- 第68行
```

### 预期行为（v1.4.3）
- **如果匿名块在大纲视图中显示**：
  - 第55行：选中匿名块节点
  - 第58-63行：选中匿名块的 BEGIN 结构块
  - 第64-66行：选中匿名块的 EXCEPTION 结构块
  - 第67行：选中匿名块的 END 结构块

- **如果匿名块在大纲视图中不显示**：
  - 第55-67行：选中 `format_name` 函数的 BEGIN 结构块

### 场景2：嵌套函数结构
```sql
FUNCTION outer_function RETURN NUMBER IS       -- 第1行
    FUNCTION inner_function RETURN NUMBER IS   -- 第2行
    BEGIN                                      -- 第3行
        RETURN 1;                              -- 第4行
    END inner_function;                        -- 第5行
BEGIN                                          -- 第6行
    RETURN inner_function;                     -- 第7行
END outer_function;                            -- 第8行
```

### 预期行为
- 第1行：选中 `outer_function` 函数节点
- 第2行：选中 `inner_function` 函数节点
- 第3-4行：选中 `inner_function` 的 BEGIN 结构块
- 第5行：选中 `inner_function` 的 END 结构块
- 第6-7行：选中 `outer_function` 的 BEGIN 结构块
- 第8行：选中 `outer_function` 的 END 结构块

## 关键改进

### 1. 移除语义过滤
- **之前**：过滤掉 `ANONYMOUS_BLOCK` 类型的子节点
- **现在**：不过滤任何节点类型，纯粹基于行号范围

### 2. 大纲视图一致性
- 选中的目标必须在当前大纲视图中存在
- 如果某个节点类型被配置为不显示，则自动选择其父节点

### 3. 最具体优先原则
- 总是优先选择最内层的嵌套节点
- 在同一节点内，优先选择具体的结构块而不是节点本身

## 配置影响

### 结构块显示配置
```json
{
  "plsql-outline.view.showStructureBlocks": true
}
```
- `true`：显示结构块，可以选中 BEGIN、EXCEPTION、END
- `false`：不显示结构块，只能选中节点本身

### 光标同步配置
```json
{
  "plsql-outline.view.autoSelectOnCursor": true
}
```
- `true`：启用光标同步功能
- `false`：禁用光标同步功能

## 版本历史

### v1.4.3 (2025-01-20)
- 🔧 **修复**：移除匿名块特殊处理逻辑
- ✅ **改进**：纯粹基于行号和大纲视图结构进行选择
- 📝 **原则**：不考虑语义层面的忽略规则
- 🎯 **目标**：确保光标同步行为与大纲视图结构完全一致

### v1.4.2 (2025-01-20)
- ❌ **问题**：过滤匿名块，违反用户需求
- 🎯 **影响**：匿名块内的行无法正确选中对应结构

### v1.4.1 (2025-01-20)
- ✨ **新增**：精准光标同步功能
- 🔧 **实现**：基础的结构块识别算法

## 实现原则总结

1. **行号优先**：严格按照行号范围进行判断
2. **结构一致**：选中目标必须在大纲视图中存在
3. **最具体原则**：优先选择最内层的嵌套结构
4. **配置驱动**：行为受大纲视图配置影响
5. **无语义过滤**：不考虑代码语义层面的忽略规则

## 测试建议

### 手动测试步骤
1. 打开包含复杂嵌套结构的 PL/SQL 文件
2. 确保大纲视图已解析并显示结构
3. 在编辑器中点击不同位置的代码行
4. 观察大纲视图的选中状态是否与行号范围一致
5. 测试各种嵌套情况（函数、过程、匿名块等）

### 验证要点
- ✅ 选中的目标在大纲视图中可见
- ✅ 行号范围判断准确
- ✅ 嵌套结构优先级正确
- ✅ 结构块类型识别准确
- ✅ 配置变化时行为正确

---

**注意**：此修复确保光标同步功能完全基于行号和大纲视图结构，不受代码语义层面的忽略规则影响。

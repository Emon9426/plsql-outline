# 匿名块处理修复测试文档

## 问题描述
v1.4.1 版本中发现的问题：当用户点击函数或过程中匿名块内部的代码行时，光标同步功能会错误地选中匿名块，而不是选中包含该匿名块的父函数/过程的结构块。

## 问题原因
原始的 `findTargetByLine()` 方法会优先选择最具体的子节点，包括匿名块。但根据需求，匿名块应该在大纲视图中被忽略，不应该被选中。

## 修复方案
v1.4.2 版本修复：在查找目标时过滤掉匿名块，确保光标同步功能选中的是包含匿名块的父节点的相应结构块。

## 技术实现

### 修复前的问题代码
```typescript
// 问题：会选中匿名块
const childTarget = this.findTargetByLine(node.children, line);
if (childTarget) {
    if (childTarget.node.type === 'ANONYMOUS_BLOCK') {
        // 尝试处理匿名块，但逻辑复杂且不准确
    }
    return childTarget;
}
```

### 修复后的正确代码
```typescript
// 解决方案：直接过滤掉匿名块
const nonAnonymousChildren = node.children.filter(child => child.type !== 'ANONYMOUS_BLOCK');
const childTarget = this.findTargetByLine(nonAnonymousChildren, line);

if (childTarget) {
    return childTarget;
}
```

## 测试用例

### 测试文件：complex_package.pkb

#### 问题场景（第62行）
```sql
-- format_name 函数中的匿名块
FUNCTION format_name(p_name VARCHAR2) RETURN VARCHAR2 IS
    v_formatted VARCHAR2(100);
    
    FUNCTION capitalize(str VARCHAR2) RETURN VARCHAR2 IS
    BEGIN
      RETURN UPPER(SUBSTR(str, 1, 1)) || LOWER(SUBSTR(str, 2));
    END capitalize;
    
BEGIN
    -- 处理姓名格式
    DECLARE                                    -- 第55行：匿名块开始
      v_names APEX_APPLICATION_GLOBAL.VC_ARR2;
      v_result VARCHAR2(100) := '';
    BEGIN                                      -- 第58行：匿名块BEGIN
      v_names := APEX_STRING.SPLIT(p_name, ' ');
      FOR i IN 1..v_names.COUNT LOOP           -- 第60行
        v_result := v_result || capitalize(v_names(i)) || ' ';  -- 第61行
      END LOOP;                                -- 第62行：问题行
      RETURN TRIM(v_result);
    EXCEPTION
      WHEN OTHERS THEN
        RETURN p_name;
    END;                                       -- 第67行：匿名块结束
END format_name;
```

### 预期行为

#### 修复前（v1.4.1）
- 点击第62行：错误地选中匿名块（如果匿名块在大纲中显示）
- 或者：选中行为不一致，可能选中错误的结构

#### 修复后（v1.4.2）
- 点击第62行：正确选中 `format_name` 函数的 `BEGIN` 结构块
- 点击第55-67行之间的任何行：都应该选中 `format_name` 函数的相应结构块

### 详细测试场景

#### 场景1：匿名块内的不同位置
```sql
DECLARE                    -- 第55行 → 选中 format_name 的 BEGIN
  v_names ...;
  v_result VARCHAR2(100);
BEGIN                      -- 第58行 → 选中 format_name 的 BEGIN
  v_names := ...;          -- 第59行 → 选中 format_name 的 BEGIN
  FOR i IN 1..v_names.COUNT LOOP    -- 第60行 → 选中 format_name 的 BEGIN
    v_result := ...;       -- 第61行 → 选中 format_name 的 BEGIN
  END LOOP;                -- 第62行 → 选中 format_name 的 BEGIN
  RETURN TRIM(v_result);   -- 第63行 → 选中 format_name 的 BEGIN
EXCEPTION                  -- 第64行 → 选中 format_name 的 BEGIN
  WHEN OTHERS THEN         -- 第65行 → 选中 format_name 的 BEGIN
    RETURN p_name;         -- 第66行 → 选中 format_name 的 BEGIN
END;                       -- 第67行 → 选中 format_name 的 BEGIN
```

#### 场景2：函数的其他结构块
```sql
FUNCTION format_name(...) RETURN VARCHAR2 IS  -- 第44行 → 选中 format_name (Function)
    v_formatted VARCHAR2(100);                -- 第45行 → 选中 format_name (Function)
    
    FUNCTION capitalize(...) RETURN VARCHAR2 IS  -- 第47行 → 选中 capitalize (Function)
    BEGIN                                      -- 第48行 → 选中 capitalize 的 BEGIN
      RETURN ...;                              -- 第49行 → 选中 capitalize 的 BEGIN
    END capitalize;                            -- 第50行 → 选中 capitalize 的 END
    
BEGIN                                          -- 第52行 → 选中 format_name 的 BEGIN
    -- 匿名块部分（第55-67行）→ 都选中 format_name 的 BEGIN
END format_name;                               -- 第68行 → 选中 format_name 的 END
```

## 核心修复逻辑

### 过滤匿名块
```typescript
// 关键修改：过滤掉匿名块子节点
const nonAnonymousChildren = node.children.filter(child => child.type !== 'ANONYMOUS_BLOCK');
```

### 递归查找
```typescript
// 在过滤后的子节点中递归查找
const childTarget = this.findTargetByLine(nonAnonymousChildren, line);
```

### 结构块判断
```typescript
// 如果没有找到子节点目标，检查当前节点的结构块
const structureBlockType = this.getStructureBlockType(node, line);
if (structureBlockType) {
    return {
        type: 'structureBlock',
        node: node,
        blockType: structureBlockType
    };
}
```

## 测试验证

### 手动测试步骤
1. 打开 `test/complex_package.pkb` 文件
2. 确保大纲视图已解析并显示结构
3. 点击第62行（匿名块内的 `END LOOP;`）
4. 观察大纲视图是否选中 `format_name` 函数的 `BEGIN` 结构块
5. 测试第55-67行之间的其他行，确保都选中正确的结构块

### 预期结果
- ✅ 第55-67行：都应该选中 `format_name` 函数的 `BEGIN` 结构块
- ✅ 不会选中任何匿名块相关的项目
- ✅ 嵌套函数 `capitalize` 的行仍然正确选中对应的结构块
- ✅ 其他函数和过程的光标同步功能不受影响

### 边界情况测试
1. **多层嵌套匿名块**：确保都被正确忽略
2. **匿名块在不同结构块中**：BEGIN、EXCEPTION 块中的匿名块都应该被忽略
3. **匿名块与嵌套函数混合**：确保只忽略匿名块，不影响嵌套函数的选择

## 配置要求

### 必需配置
```json
{
  "plsql-outline.view.autoSelectOnCursor": true,
  "plsql-outline.view.showStructureBlocks": true
}
```

### 解析要求
- 文件必须正确解析，包含完整的节点结构信息
- 匿名块应该在解析结果中被标记为 `ANONYMOUS_BLOCK` 类型
- 父节点的结构块信息（beginLine、exceptionLine、endLine）必须准确

## 版本历史

### v1.4.2 (2025-01-20)
- 🐛 **修复**：匿名块光标同步问题
- 🔧 **改进**：过滤匿名块子节点，确保选中父节点结构块
- ✅ **测试**：验证复杂嵌套结构中的匿名块处理
- 📝 **文档**：添加匿名块处理测试文档

### v1.4.1 (2025-01-20)
- ❌ **问题**：匿名块内的行会错误选中匿名块
- 🎯 **影响**：用户在匿名块内点击时无法正确导航到父结构

## 相关需求

### 原始需求
> "需求文件中有忽略函数、过程中匿名块的要求"

### 实现策略
1. **解析阶段**：匿名块仍然被解析，但在大纲视图中不显示
2. **光标同步阶段**：匿名块被忽略，选中包含它的父节点结构块
3. **用户体验**：用户感觉不到匿名块的存在，导航更加直观

## 未来改进

### 可能的增强
1. **配置选项**：允许用户选择是否显示匿名块
2. **智能识别**：更精确地识别匿名块的边界
3. **性能优化**：减少匿名块过滤的性能开销
4. **调试支持**：在调试模式下显示被忽略的匿名块信息

---

**注意**：此修复确保了光标同步功能严格按照用户选择的行号解析，同时遵循忽略匿名块的设计要求。

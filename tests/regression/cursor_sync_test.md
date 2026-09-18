# 光标同步功能测试文档

## 功能描述
v1.4.0 新增功能：当用户在代码文件中点击某一行时，大纲视图会自动选中对应的部分。

## 实现原理

### 1. 光标位置监听
- 监听 `vscode.window.onDidChangeTextEditorSelection` 事件
- 获取当前光标位置（行号）
- 仅对PL/SQL文件生效

### 2. 节点查找算法
- 根据光标行号查找对应的解析节点
- 优先选择最具体的节点（子节点优于父节点）
- 考虑节点的行号范围（声明行到结束行）

### 3. 大纲视图同步
- 使用 `treeView.reveal()` API选中对应节点
- 自动展开到目标节点
- 不会强制聚焦，避免干扰用户操作

## 配置选项

新增配置项：
```json
{
  "plsql-outline.view.autoSelectOnCursor": {
    "type": "boolean",
    "default": true,
    "description": "当光标位置改变时自动选中对应的大纲节点"
  }
}
```

## 测试步骤

### 测试1：基本功能测试
1. 打开任意PL/SQL文件（.sql, .pks, .pkb等）
2. 确保大纲视图已解析并显示结构
3. 在编辑器中点击不同的行
4. 观察大纲视图是否自动选中对应的节点

### 测试2：嵌套结构测试
1. 打开包含嵌套函数/过程的PL/SQL文件
2. 点击嵌套函数内部的行
3. 验证是否选中最具体的节点（内层函数而非外层包）

### 测试3：配置开关测试
1. 打开VS Code设置
2. 搜索 "plsql-outline.view.autoSelectOnCursor"
3. 将其设置为 false
4. 验证光标移动时不再自动选中节点
5. 重新启用该选项，验证功能恢复

### 测试4：性能测试
1. 打开较大的PL/SQL文件（1000+行）
2. 快速移动光标到不同位置
3. 观察是否有明显的延迟或卡顿
4. 检查内存使用情况

## 预期行为

### 正常情况
- ✅ 光标移动时，大纲视图自动选中对应节点
- ✅ 选中的节点会自动展开显示
- ✅ 不会干扰用户的编辑操作
- ✅ 仅在PL/SQL文件中生效

### 边界情况
- ✅ 光标在注释行：不选中任何节点或选中包含该注释的节点
- ✅ 光标在空行：选中最近的有效节点
- ✅ 光标在文件开头/结尾：选中相应的根节点
- ✅ 没有解析结果时：不执行任何操作

### 错误处理
- ✅ reveal API失败时：记录日志但不显示错误消息
- ✅ 节点查找失败时：静默处理，不影响用户体验
- ✅ 配置读取失败时：使用默认值（启用）

## 技术实现细节

### 核心方法

#### `onCursorPositionChanged()`
```typescript
private async onCursorPositionChanged(event: vscode.TextEditorSelectionChangeEvent): Promise<void> {
    // 1. 检查文件类型
    // 2. 检查配置开关
    // 3. 获取光标位置
    // 4. 查找对应节点
    // 5. 同步大纲视图
}
```

#### `findNodeByLine()`
```typescript
private findNodeByLine(nodes: ParseNode[], line: number): ParseNode | null {
    // 递归查找包含指定行号的节点
    // 优先返回最具体的子节点
}
```

#### `selectAndRevealNode()`
```typescript
async selectAndRevealNode(targetNode: ParseNode): Promise<void> {
    // 使用VS Code TreeView API选中并展开节点
}
```

### 性能优化
- 避免频繁的节点查找操作
- 使用缓存机制减少重复计算
- 异步处理，不阻塞主线程
- 错误容忍，单次失败不影响后续操作

## 版本信息
- 功能版本：v1.4.0
- 实现日期：2025-01-20
- 相关文件：
  - `src/extension.ts` - 主要逻辑实现
  - `src/treeView.ts` - 树视图同步方法
  - `package.json` - 配置选项定义

## 已知限制
1. 仅支持已解析的PL/SQL文件
2. 依赖于解析结果的准确性
3. 复杂嵌套结构可能存在选择偏差
4. 不支持跨文件的节点同步

## 未来改进方向
1. 支持更精确的行号范围计算
2. 添加节点选中的视觉反馈
3. 支持反向同步（大纲选中时移动光标）
4. 优化大文件的性能表现

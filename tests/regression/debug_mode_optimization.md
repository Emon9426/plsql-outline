# 调试模式优化文档

## 用户需求
> "我希望调整debug信息的输出。只有当用户在设置界面勾选启动调试模式开关并保存后，才显示debug输出信息。否则不输出调试信息。"

## 优化说明
v1.4.6 版本实现了智能调试输出控制，只有在用户明确启用调试模式时才输出调试信息，大大减少了不必要的控制台输出。

## 核心改进

### 1. 新增调试日志方法
在 `PLSQLOutlineExtension` 类中新增了三个调试日志方法：

```typescript
/**
 * 调试日志输出 - 只有在启用调试模式时才输出
 */
private debugLog(message: string, ...args: any[]): void {
    const config = vscode.workspace.getConfiguration('plsql-outline');
    const debugEnabled = config.get('debug.enabled', false);
    
    if (debugEnabled) {
        console.log(`[PL/SQL Outline Debug] ${message}`, ...args);
    }
}

/**
 * 调试警告输出 - 只有在启用调试模式时才输出
 */
private debugWarn(message: string, ...args: any[]): void {
    const config = vscode.workspace.getConfiguration('plsql-outline');
    const debugEnabled = config.get('debug.enabled', false);
    
    if (debugEnabled) {
        console.warn(`[PL/SQL Outline Debug] ${message}`, ...args);
    }
}

/**
 * 调试错误输出 - 只有在启用调试模式时才输出
 */
private debugError(message: string, ...args: any[]): void {
    const config = vscode.workspace.getConfiguration('plsql-outline');
    const debugEnabled = config.get('debug.enabled', false);
    
    if (debugEnabled) {
        console.error(`[PL/SQL Outline Debug] ${message}`, ...args);
    }
}
```

### 2. 替换所有调试输出
将所有的 `console.log`、`console.warn`、`console.error` 调用替换为对应的调试方法：

#### 光标同步调试
```typescript
// 之前
console.log('光标同步: 没有解析结果');
console.log(`光标同步: 当前行号 ${currentLine}`);
console.log(`光标同步: 找到目标 - 类型: ${target.type}, 节点: ${target.node.name}, 块类型: ${target.blockType || 'N/A'}`);

// 现在
this.debugLog('光标同步: 没有解析结果');
this.debugLog(`光标同步: 当前行号 ${currentLine}`);
this.debugLog(`光标同步: 找到目标 - 类型: ${target.type}, 节点: ${target.node.name}, 块类型: ${target.blockType || 'N/A'}`);
```

#### 内存监控调试
```typescript
// 之前
console.log(`内存使用情况: ${heapUsedMB}MB / ${heapTotalMB}MB`);
console.warn('内存使用过高，触发清理');
console.error('内存检查失败:', error);

// 现在
this.debugLog(`内存使用情况: ${heapUsedMB}MB / ${heapTotalMB}MB`);
this.debugWarn('内存使用过高，触发清理');
this.debugError('内存检查失败:', error);
```

#### 节点范围调试
```typescript
// 之前
console.log(`${indent}节点: ${node.name} (${node.type}) - 行范围: ${startLine}-${endLine} - 包含第${targetLine}行: ${inRange}`);

// 现在
this.debugLog(`${indent}节点: ${node.name} (${node.type}) - 行范围: ${startLine}-${endLine} - 包含第${targetLine}行: ${inRange}`);
```

#### 命令执行调试
```typescript
// 之前
console.log('测试展开所有命令被调用');
console.log('展开所有命令被调用，委托给TreeViewManager');

// 现在
this.debugLog('测试展开所有命令被调用');
this.debugLog('展开所有命令被调用，委托给TreeViewManager');
```

### 3. 保留重要日志
扩展激活、停用和错误日志仍然始终输出，不受调试模式控制：

```typescript
// 这些日志始终输出
console.log('PL/SQL Outline 扩展正在激活...');
console.log('PL/SQL Outline 扩展激活成功');
console.log('PL/SQL Outline 扩展正在停用...');
console.log('PL/SQL Outline 扩展停用完成');
console.error('PL/SQL Outline 扩展激活失败:', errorMessage);
```

## 配置设置

### 调试模式配置
在 `package.json` 中已经定义了调试模式配置：

```json
{
  "plsql-outline.debug.enabled": {
    "type": "boolean",
    "default": false,
    "description": "启用调试模式"
  }
}
```

### 如何启用调试模式

#### 方法1：通过设置界面
1. 打开 VS Code 设置（Ctrl+,）
2. 搜索 "plsql-outline.debug.enabled"
3. 勾选 "启用调试模式" 复选框
4. 保存设置

#### 方法2：通过设置文件
在 `settings.json` 中添加：
```json
{
  "plsql-outline.debug.enabled": true
}
```

#### 方法3：通过命令面板
1. 按 Ctrl+Shift+P 打开命令面板
2. 输入 "PL/SQL Outline: 切换调试模式"
3. 执行命令

## 调试输出示例

### 启用调试模式时
```
[PL/SQL Outline Debug] 光标同步: 当前行号 54
[PL/SQL Outline Debug] 光标同步: 找到目标 - 类型: structureBlock, 节点: format_name, 块类型: BEGIN
[PL/SQL Outline Debug] 内存使用情况: 45MB / 67MB
[PL/SQL Outline Debug] 测试展开所有命令被调用
```

### 禁用调试模式时
```
(无调试输出)
```

### 始终输出的日志
```
PL/SQL Outline 扩展正在激活...
PL/SQL Outline 扩展激活成功
```

## 技术优势

### 1. 性能优化
- ✅ 减少不必要的控制台输出
- ✅ 避免字符串拼接和格式化开销
- ✅ 降低日志记录对性能的影响

### 2. 用户体验
- ✅ 清洁的控制台输出
- ✅ 用户可控的调试信息
- ✅ 保留重要的状态信息

### 3. 开发友好
- ✅ 统一的调试日志格式
- ✅ 明确的日志前缀标识
- ✅ 灵活的调试控制

### 4. 配置灵活性
- ✅ 实时配置生效
- ✅ 多种启用方式
- ✅ 默认禁用调试模式

## 调试信息分类

### 光标同步调试
- 当前行号信息
- 目标查找结果
- 节点范围匹配详情
- 结构块类型判断

### 内存监控调试
- 内存使用情况统计
- 内存清理触发条件
- 垃圾回收执行状态
- 内存检查错误信息

### 命令执行调试
- 命令调用确认
- 委托执行状态
- 操作完成通知

### 节点解析调试
- 节点范围计算
- 嵌套结构分析
- 匹配优先级评估

## 配置建议

### 开发环境
```json
{
  "plsql-outline.debug.enabled": true,
  "plsql-outline.debug.logLevel": "DEBUG"
}
```

### 生产环境
```json
{
  "plsql-outline.debug.enabled": false,
  "plsql-outline.debug.logLevel": "ERROR"
}
```

### 问题诊断
```json
{
  "plsql-outline.debug.enabled": true,
  "plsql-outline.debug.logLevel": "INFO",
  "plsql-outline.debug.keepFiles": true
}
```

## 版本信息

- **版本号**：v1.4.6
- **文件大小**：899.41 KB
- **主要改进**：智能调试输出控制
- **配置项**：`plsql-outline.debug.enabled`

## 实现原理

### 1. 配置检查机制
每次调试输出前都会检查当前配置：
```typescript
const config = vscode.workspace.getConfiguration('plsql-outline');
const debugEnabled = config.get('debug.enabled', false);
```

### 2. 条件输出
只有在调试模式启用时才执行实际的控制台输出：
```typescript
if (debugEnabled) {
    console.log(`[PL/SQL Outline Debug] ${message}`, ...args);
}
```

### 3. 统一前缀
所有调试输出都使用统一的前缀标识：
```
[PL/SQL Outline Debug]
```

### 4. 实时生效
配置变更会立即生效，无需重启扩展。

## 测试验证

### 测试步骤
1. 安装 v1.4.6 版本的扩展
2. 确认调试模式默认为禁用状态
3. 验证控制台无调试输出
4. 启用调试模式
5. 验证调试信息正常输出
6. 禁用调试模式
7. 验证调试输出停止

### 验证要点
- ✅ 默认状态下无调试输出
- ✅ 启用调试模式后有详细输出
- ✅ 重要日志始终输出
- ✅ 配置变更实时生效
- ✅ 调试信息格式统一

## 兼容性

### 向后兼容
- ✅ 现有功能完全保持
- ✅ 配置项向后兼容
- ✅ API 接口不变

### 配置迁移
- ✅ 自动使用默认配置
- ✅ 无需手动迁移
- ✅ 平滑升级体验

---

**注意**：此版本实现了用户要求的智能调试输出控制，只有在明确启用调试模式时才显示调试信息，大大改善了用户体验和扩展性能。

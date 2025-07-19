# PL/SQL Outline

一个强大的 Visual Studio Code 扩展，为 PL/SQL 代码提供智能结构解析和大纲视图功能。

![PL/SQL Outline](res/Icon.png)

## 🚀 功能特性

### 📋 代码结构解析
- **智能解析**：自动识别 PL/SQL 代码中的包、函数、过程、触发器等结构
- **多层嵌套**：支持复杂的嵌套结构解析
- **实时更新**：文件保存或切换时自动重新解析
- **错误处理**：提供详细的解析错误和警告信息

### 🌳 大纲视图
- **层次结构**：清晰展示代码的层次关系
- **快速导航**：点击节点直接跳转到对应代码行
- **结构块显示**：可选显示 BEGIN、EXCEPTION、END 等结构块
- **智能排序**：按层级、子项数量、行号的顺序显示信息

### 🔧 可配置的文件支持
- **自定义扩展名**：支持用户自定义文件扩展名列表
- **默认支持**：`.sql`、`.fnc`、`.fcn`、`.prc`、`.pks`、`.pkb`、`.typ`
- **动态管理**：可随时添加、删除或重置文件扩展名

### 🎛️ 丰富的操作功能
- **一键展开/折叠**：快速展开或折叠所有节点
- **刷新功能**：手动刷新解析结果
- **统计信息**：查看详细的解析统计数据
- **结果导出**：将解析结果导出为 JSON 格式

## 📦 安装

### 方法一：从 VS Code 扩展市场安装（推荐）

1. **打开 Visual Studio Code**
2. **打开扩展面板**：
   - 按 `Ctrl+Shift+X`（Windows/Linux）
   - 或按 `Cmd+Shift+X`（macOS）
   - 或点击左侧活动栏的扩展图标 🧩
3. **搜索扩展**：在搜索框中输入 "PL/SQL Outline"
4. **安装扩展**：找到 "PL/SQL Outline" 扩展，点击 "安装" 按钮
5. **重新加载**：安装完成后，VS Code 会自动重新加载

### 方法二：从 VSIX 文件安装

如果您有本地的 VSIX 文件，可以通过以下方式安装：

#### 使用命令行安装
```bash
# 安装最新版本 v1.3.0
code --install-extension plsql-outline-1.3.0.vsix

# 如果 code 命令不可用，请先添加到 PATH 或使用完整路径
"C:\Program Files\Microsoft VS Code\bin\code.cmd" --install-extension plsql-outline-1.3.0.vsix
```

#### 使用 VS Code 界面安装
1. **打开命令面板**：按 `Ctrl+Shift+P`（Windows/Linux）或 `Cmd+Shift+P`（macOS）
2. **输入命令**：输入 "Extensions: Install from VSIX..."
3. **选择文件**：浏览并选择 `plsql-outline-1.3.0.vsix` 文件
4. **确认安装**：点击 "安装" 按钮
5. **重新加载**：安装完成后重新加载 VS Code

#### 通过扩展面板安装
1. **打开扩展面板**：按 `Ctrl+Shift+X`
2. **点击菜单**：点击扩展面板右上角的 "..." 菜单
3. **选择选项**：选择 "从 VSIX 安装..."
4. **选择文件**：浏览并选择 VSIX 文件
5. **完成安装**：等待安装完成

### 方法三：开发者安装

如果您想从源代码安装或进行开发：

```bash
# 1. 克隆仓库
git clone https://github.com/Emon9426/plsql-outline.git
cd plsql-outline

# 2. 安装依赖
npm install

# 3. 编译项目
npm run compile

# 4. 打包扩展
npm run package

# 5. 安装生成的 VSIX 文件
code --install-extension plsql-outline-1.3.0.vsix
```

### 安装验证

安装完成后，您可以通过以下方式验证扩展是否正确安装：

1. **检查扩展列表**：
   - 打开扩展面板 (`Ctrl+Shift+X`)
   - 在已安装的扩展中查找 "PL/SQL Outline"
   - 确认状态显示为 "已启用"

2. **检查活动栏**：
   - 在 VS Code 左侧活动栏中应该出现 PL/SQL 大纲图标 📋
   - 点击图标应该显示 "PLSQL Outline" 面板

3. **测试功能**：
   - 打开任何 `.sql`、`.pks`、`.pkb` 等 PL/SQL 文件
   - 扩展应该自动解析文件并在大纲面板中显示结构

### 系统要求

- **VS Code 版本**：1.74.0 或更高版本
- **操作系统**：Windows、macOS、Linux
- **Node.js**：仅开发时需要（用户安装不需要）

### 支持的文件类型

扩展默认支持以下文件扩展名：
- `.sql` - SQL 脚本文件
- `.fnc` - 函数文件  
- `.fcn` - 函数文件（备用扩展名）
- `.prc` - 过程文件
- `.pks` - 包规范文件
- `.pkb` - 包体文件
- `.typ` - 类型定义文件

### 安装故障排除

**Q: 安装后没有看到扩展图标？**
A: 
1. 重新启动 VS Code
2. 检查扩展是否已启用
3. 确认 VS Code 版本符合要求

**Q: VSIX 文件安装失败？**
A:
1. 确认文件完整性（文件大小应该约为 900KB）
2. 检查 VS Code 版本兼容性
3. 尝试使用管理员权限运行 VS Code

**Q: 扩展安装后不工作？**
A:
1. 打开 PL/SQL 文件测试
2. 检查文件扩展名是否支持
3. 查看 VS Code 输出面板的错误信息
4. 尝试重新安装扩展

## 🎯 使用指南

### 基本使用

1. **打开 PL/SQL 文件**：打开任何支持的 PL/SQL 文件
2. **查看大纲**：在活动栏中点击 PL/SQL 大纲图标
3. **自动解析**：扩展会自动解析当前文件并显示结构
4. **导航代码**：点击大纲中的任意节点跳转到对应代码

### 工具栏按钮

大纲视图顶部提供了以下按钮：

| 按钮 | 功能 | 描述 |
|------|------|------|
| 🔄 | 刷新 | 重新解析当前文件 |
| 📄 | 解析当前文件 | 手动触发解析 |
| ⬇️ | 展开所有 | 展开大纲中的所有节点 |
| ⬆️ | 折叠所有 | 折叠大纲中的所有节点 |
| ⚙️ | 管理文件扩展名 | 配置支持的文件类型 |

### 右键菜单

在大纲节点上右键可以：
- **跳转到行**：快速定位到代码位置

### 命令面板

按 `Ctrl+Shift+P` 打开命令面板，可使用以下命令：

- `PL/SQL Outline: 解析当前文件`
- `PL/SQL Outline: 刷新`
- `PL/SQL Outline: 展开所有`
- `PL/SQL Outline: 折叠所有`
- `PL/SQL Outline: 切换结构块显示`
- `PL/SQL Outline: 切换调试模式`
- `PL/SQL Outline: 显示解析统计`
- `PL/SQL Outline: 导出解析结果`
- `PL/SQL Outline: 管理文件扩展名`

## ⚙️ 配置选项

### 解析设置

```json
{
  "plsql-outline.parsing.autoParseOnSave": true,
  "plsql-outline.parsing.autoParseOnSwitch": true,
  "plsql-outline.parsing.maxLines": 50000,
  "plsql-outline.parsing.maxNestingDepth": 20,
  "plsql-outline.parsing.maxParseTime": 30000
}
```

- `autoParseOnSave`：保存文件时自动解析
- `autoParseOnSwitch`：切换到 PL/SQL 文件时自动解析
- `maxLines`：最大解析行数限制（1000-200000）
- `maxNestingDepth`：最大嵌套深度限制（5-50）
- `maxParseTime`：最大解析时间限制，毫秒（5000-120000）

### 视图设置

```json
{
  "plsql-outline.view.showStructureBlocks": true,
  "plsql-outline.view.expandByDefault": true
}
```

- `showStructureBlocks`：在树视图中显示结构块（BEGIN、EXCEPTION、END）
- `expandByDefault`：默认展开树节点

### 文件扩展名设置

```json
{
  "plsql-outline.fileExtensions": [
    ".sql",
    ".fnc", 
    ".fcn",
    ".prc",
    ".pks",
    ".pkb",
    ".typ"
  ]
}
```

### 调试设置

```json
{
  "plsql-outline.debug.enabled": false,
  "plsql-outline.debug.outputPath": "${workspaceFolder}/.plsql-debug",
  "plsql-outline.debug.logLevel": "INFO",
  "plsql-outline.debug.keepFiles": true,
  "plsql-outline.debug.maxFiles": 50
}
```

## 🔧 文件扩展名管理

### 管理界面

点击工具栏中的 ⚙️ 按钮，可以：

1. **添加扩展名**：输入新的文件扩展名（如 `.tbl`）
2. **删除扩展名**：从列表中选择要删除的扩展名
3. **重置为默认值**：恢复到默认的扩展名列表
4. **查看当前列表**：显示当前配置的所有扩展名

### 添加新扩展名

1. 点击 "添加扩展名"
2. 输入扩展名（必须以 `.` 开头）
3. 确认添加

### 删除扩展名

1. 点击 "删除扩展名"
2. 从下拉列表中选择要删除的扩展名
3. 确认删除

### 重置默认值

点击 "重置为默认值" 将恢复到以下默认扩展名：
- `.sql` - SQL 脚本文件
- `.fnc` - 函数文件
- `.fcn` - 函数文件（备用扩展名）
- `.prc` - 过程文件
- `.pks` - 包规范文件
- `.pkb` - 包体文件
- `.typ` - 类型定义文件

## 📊 支持的 PL/SQL 结构

### 包结构
- **Package Header** (`.pks`)：包规范
- **Package Body** (`.pkb`)：包体

### 子程序
- **Function**：函数定义
- **Procedure**：过程定义
- **Function Declaration**：函数声明
- **Procedure Declaration**：过程声明

### 其他结构
- **Trigger**：触发器
- **Anonymous Block**：匿名块

### 结构块
- **BEGIN**：执行部分开始
- **EXCEPTION**：异常处理部分
- **END**：结构结束

## 🎨 大纲视图说明

### 节点信息显示

每个节点显示以下信息（按顺序）：
1. **层级**：`L2`、`L3` 等（仅显示 2 级以上）
2. **子项数量**：`3个子项`（仅当有子项时显示）
3. **行号**：`第15行`

### 图标说明

| 图标 | 类型 | 说明 |
|------|------|------|
| 📦 | Package | 包（Header/Body） |
| 🔧 | Function | 函数 |
| ⚙️ | Procedure | 过程 |
| ⚡ | Trigger | 触发器 |
| 📄 | Anonymous Block | 匿名块 |
| ▶️ | BEGIN | 执行部分开始 |
| ⚠️ | EXCEPTION | 异常处理部分 |
| ⏹️ | END | 结构结束 |

## 🐛 故障排除

### 常见问题

**Q: 为什么我的文件没有被解析？**
A: 请检查：
1. 文件扩展名是否在支持列表中
2. 是否启用了自动解析功能
3. 文件内容是否为有效的 PL/SQL 代码

**Q: 如何添加新的文件类型支持？**
A: 使用文件扩展名管理功能：
1. 点击工具栏中的 ⚙️ 按钮
2. 选择 "添加扩展名"
3. 输入新的扩展名（如 `.tbl`）

**Q: 解析速度很慢怎么办？**
A: 可以调整以下设置：
- 减少 `maxLines` 限制
- 减少 `maxNestingDepth` 限制
- 增加 `maxParseTime` 限制

**Q: 如何查看解析错误？**
A: 
1. 启用调试模式
2. 使用 "显示解析统计" 命令
3. 查看输出面板中的错误信息

### 调试模式

启用调试模式可以获得更详细的信息：

1. **启用调试**：
   - 使用命令面板：`Ctrl+Shift+P` → `PL/SQL Outline: 切换调试模式`
   - 或在设置中：`plsql-outline.debug.enabled` 设置为 `true`

2. **查看调试信息**：
   - 打开输出面板：`查看` → `输出`
   - 选择 `PL/SQL Outline Debug` 通道
   - 实时查看解析过程和错误信息

3. **调试信息包含**：
   - 解析进度和统计
   - 展开/折叠操作详情
   - 错误和警告信息
   - 性能指标

**注意**：v1.2.5版本已移除文件日志功能，所有调试信息现在直接输出到VS Code输出通道，更加高效且不占用磁盘空间。

## 📈 性能优化

### v1.2.5 重大性能改进

本版本进行了全面的性能优化，显著提升了扩展的响应速度和内存效率：

#### 🚀 内存优化
- **内存占用降低90%+**：移除文件日志系统，改用VS Code输出通道
- **LRU缓存机制**：智能缓存管理，自动清理过期数据
- **内存监控**：实时监控内存使用，自动触发清理
- **零文件I/O**：消除所有磁盘写入操作，避免I/O阻塞

#### ⚡ 响应速度提升
- **即时展开**：全部展开功能从无响应改为即时响应
- **异步处理**：所有操作采用异步模式，不阻塞主线程
- **批量操作**：优化树视图更新策略，减少重复渲染

#### 🛠️ 技术改进
- **getParent方法**：支持VS Code原生reveal API
- **双重展开策略**：强制展开标志 + reveal API确保完整展开
- **错误容忍**：单个节点失败不影响整体操作

### 大文件处理

对于大型 PL/SQL 文件：
- 调整 `maxLines` 设置（默认50000行）
- 考虑拆分超大文件
- 启用内存监控功能

### 内存使用建议

- **推荐设置**：保持默认配置即可获得最佳性能
- **调试模式**：仅在需要时启用，使用完毕后及时关闭
- **缓存管理**：扩展会自动管理缓存，无需手动干预

## 🔄 更新日志

### v1.3.0 (2025-01-19)
- 🔧 **重大修复**：设置页面保存功能完全修复
- ⚙️ **配置优化**：所有配置现在保存到工作区级别，确保设置生效
- 🔄 **状态同步**：保存后自动同步前端界面，配置立即生效
- 🎯 **用户体验**：修复设置丢失问题，提供可靠的配置管理
- 📋 **技术改进**：统一使用Workspace配置目标，支持项目特定设置

### v1.2.5 (2025-01-19)
- 🚀 **重大性能优化**：内存占用降低90%以上
- 🔧 **修复**：全部展开功能完全重写，现在可以正确展开根节点和所有子节点
- 🗑️ **移除**：删除复杂的文件日志系统，改用VS Code输出通道
- ⚡ **性能**：消除文件I/O阻塞，响应速度显著提升
- 🛠️ **技术改进**：添加getParent方法支持VS Code reveal API
- 📊 **调试优化**：实时调试信息输出到VS Code输出面板
- 🧹 **内存管理**：实现LRU缓存机制，自动内存清理

### v1.1.0 (2025-01-19)
- ✨ 新增：可配置的文件扩展名支持
- ✨ 新增：一键展开/折叠功能
- ✨ 新增：文件扩展名管理界面
- 🎨 改进：大纲视图显示顺序（层级-子项-行号）
- 🎨 改进：视图标题更改为 "PLSQL Outline"
- 🔧 修复：更新工程图标为 Icon.png

### v1.0.2 (2025-01-19)
- 🐛 修复：END IF/LOOP/CASE 解析错误
- 🔧 改进：控制结构识别逻辑
- ✅ 测试：增加回归测试覆盖

### v1.0.1
- 🐛 修复：解析器稳定性问题
- 📝 文档：更新使用说明

### v1.0.0
- 🎉 首次发布
- ✨ 基础解析功能
- 🌳 大纲视图
- ⚙️ 配置选项

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [GitHub 仓库](https://github.com/Emon9426/plsql-outline)
- [问题反馈](https://github.com/Emon9426/plsql-outline/issues)
- [更新日志](https://github.com/Emon9426/plsql-outline/releases)

## 💡 技术支持

如果您遇到问题或有建议，请：

1. 查看本文档的故障排除部分
2. 在 GitHub 上创建 Issue
3. 提供详细的错误信息和复现步骤

---

**享受使用 PL/SQL Outline！** 🎉

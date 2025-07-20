# PL/SQL Outline

**语言 / Language:** [中文](#plsql-outline) | [English](#plsql-outline-english)

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

### v1.4.6 (2025-01-20)
- 🔧 **智能调试控制**：只有在启用调试模式时才输出调试信息
- 🎯 **用户体验优化**：默认状态下控制台保持清洁，无调试输出
- 📊 **统一日志格式**：所有调试输出使用 `[PL/SQL Outline Debug]` 前缀
- ⚙️ **实时配置生效**：调试模式开关立即生效，无需重启扩展
- 🚀 **性能提升**：减少不必要的字符串处理和控制台输出开销
- 🛠️ **保留重要日志**：扩展激活、停用等关键信息始终输出

### v1.4.5 (2025-01-20)
- 🔧 **重大改进**：完全重新设计光标同步算法
- ✅ **新增**：候选收集机制，确保找到最佳匹配
- 📊 **新增**：优先级系统，精确匹配优先于范围匹配
- 🎯 **修复**：严格按照实际行号进行匹配
- 🚀 **优化**：单次遍历收集候选项，提高性能
- 📝 **原则**：精确性、可预测性、性能优化

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

---

# PL/SQL Outline (English)

A powerful Visual Studio Code extension that provides intelligent structure parsing and outline view functionality for PL/SQL code.

![PL/SQL Outline](res/Icon.png)

## 🚀 Features

### 📋 Code Structure Parsing
- **Intelligent Parsing**: Automatically identifies packages, functions, procedures, triggers, and other structures in PL/SQL code
- **Multi-level Nesting**: Supports parsing of complex nested structures
- **Real-time Updates**: Automatically re-parses when files are saved or switched
- **Error Handling**: Provides detailed parsing errors and warning information

### 🌳 Outline View
- **Hierarchical Structure**: Clearly displays the hierarchical relationships of code
- **Quick Navigation**: Click nodes to jump directly to corresponding code lines
- **Structure Block Display**: Optional display of BEGIN, EXCEPTION, END and other structure blocks
- **Smart Sorting**: Displays information in order of level, child count, and line number

### 🔧 Configurable File Support
- **Custom Extensions**: Supports user-defined file extension lists
- **Default Support**: `.sql`, `.fnc`, `.fcn`, `.prc`, `.pks`, `.pkb`, `.typ`
- **Dynamic Management**: Add, remove, or reset file extensions at any time

### 🎛️ Rich Operation Features
- **One-click Expand/Collapse**: Quickly expand or collapse all nodes
- **Refresh Function**: Manually refresh parsing results
- **Statistics**: View detailed parsing statistics
- **Result Export**: Export parsing results in JSON format

## 📦 Installation

### Method 1: Install from VS Code Extension Marketplace (Recommended)

1. **Open Visual Studio Code**
2. **Open Extensions Panel**:
   - Press `Ctrl+Shift+X` (Windows/Linux)
   - Or press `Cmd+Shift+X` (macOS)
   - Or click the Extensions icon 🧩 in the left activity bar
3. **Search Extension**: Type "PL/SQL Outline" in the search box
4. **Install Extension**: Find "PL/SQL Outline" extension and click "Install" button
5. **Reload**: VS Code will automatically reload after installation

### Method 2: Install from VSIX File

If you have a local VSIX file, you can install it as follows:

#### Install via Command Line
```bash
# Install latest version v1.4.6
code --install-extension plsql-outline-1.4.6.vsix

# If code command is not available, add to PATH first or use full path
"C:\Program Files\Microsoft VS Code\bin\code.cmd" --install-extension plsql-outline-1.4.6.vsix
```

#### Install via VS Code Interface
1. **Open Command Palette**: Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
2. **Enter Command**: Type "Extensions: Install from VSIX..."
3. **Select File**: Browse and select `plsql-outline-1.4.6.vsix` file
4. **Confirm Installation**: Click "Install" button
5. **Reload**: Reload VS Code after installation

#### Install via Extensions Panel
1. **Open Extensions Panel**: Press `Ctrl+Shift+X`
2. **Click Menu**: Click "..." menu in the top-right corner of extensions panel
3. **Select Option**: Choose "Install from VSIX..."
4. **Select File**: Browse and select VSIX file
5. **Complete Installation**: Wait for installation to complete

### Method 3: Developer Installation

If you want to install from source code or for development:

```bash
# 1. Clone repository
git clone https://github.com/Emon9426/plsql-outline.git
cd plsql-outline

# 2. Install dependencies
npm install

# 3. Compile project
npm run compile

# 4. Package extension
npm run package

# 5. Install generated VSIX file
code --install-extension plsql-outline-1.4.6.vsix
```

### Installation Verification

After installation, you can verify the extension is correctly installed:

1. **Check Extension List**:
   - Open Extensions panel (`Ctrl+Shift+X`)
   - Look for "PL/SQL Outline" in installed extensions
   - Confirm status shows "Enabled"

2. **Check Activity Bar**:
   - PL/SQL Outline icon 📋 should appear in VS Code left activity bar
   - Clicking the icon should display "PLSQL Outline" panel

3. **Test Functionality**:
   - Open any `.sql`, `.pks`, `.pkb` PL/SQL file
   - Extension should automatically parse the file and display structure in outline panel

### System Requirements

- **VS Code Version**: 1.74.0 or higher
- **Operating System**: Windows, macOS, Linux
- **Node.js**: Only required for development (not needed for user installation)

### Supported File Types

Extension supports the following file extensions by default:
- `.sql` - SQL script files
- `.fnc` - Function files  
- `.fcn` - Function files (alternative extension)
- `.prc` - Procedure files
- `.pks` - Package specification files
- `.pkb` - Package body files
- `.typ` - Type definition files

### Installation Troubleshooting

**Q: Don't see extension icon after installation?**
A: 
1. Restart VS Code
2. Check if extension is enabled
3. Confirm VS Code version meets requirements

**Q: VSIX file installation failed?**
A:
1. Confirm file integrity (file size should be about 900KB)
2. Check VS Code version compatibility
3. Try running VS Code with administrator privileges

**Q: Extension doesn't work after installation?**
A:
1. Open PL/SQL file to test
2. Check if file extension is supported
3. View error information in VS Code output panel
4. Try reinstalling the extension

## 🎯 Usage Guide

### Basic Usage

1. **Open PL/SQL File**: Open any supported PL/SQL file
2. **View Outline**: Click PL/SQL Outline icon in activity bar
3. **Auto Parse**: Extension will automatically parse current file and display structure
4. **Navigate Code**: Click any node in outline to jump to corresponding code

### Toolbar Buttons

The outline view provides the following buttons at the top:

| Button | Function | Description |
|--------|----------|-------------|
| 🔄 | Refresh | Re-parse current file |
| 📄 | Parse Current File | Manually trigger parsing |
| ⬇️ | Expand All | Expand all nodes in outline |
| ⬆️ | Collapse All | Collapse all nodes in outline |
| ⚙️ | Manage File Extensions | Configure supported file types |

### Context Menu

Right-click on outline nodes to:
- **Go to Line**: Quickly locate to code position

### Command Palette

Press `Ctrl+Shift+P` to open command palette, available commands:

- `PL/SQL Outline: Parse Current File`
- `PL/SQL Outline: Refresh`
- `PL/SQL Outline: Expand All`
- `PL/SQL Outline: Collapse All`
- `PL/SQL Outline: Toggle Structure Blocks`
- `PL/SQL Outline: Toggle Debug Mode`
- `PL/SQL Outline: Show Parse Statistics`
- `PL/SQL Outline: Export Parse Result`
- `PL/SQL Outline: Manage File Extensions`

## ⚙️ Configuration Options

### Parsing Settings

```json
{
  "plsql-outline.parsing.autoParseOnSave": true,
  "plsql-outline.parsing.autoParseOnSwitch": true,
  "plsql-outline.parsing.maxLines": 50000,
  "plsql-outline.parsing.maxNestingDepth": 20,
  "plsql-outline.parsing.maxParseTime": 30000
}
```

- `autoParseOnSave`: Auto parse when saving files
- `autoParseOnSwitch`: Auto parse when switching to PL/SQL files
- `maxLines`: Maximum parsing line limit (1000-200000)
- `maxNestingDepth`: Maximum nesting depth limit (5-50)
- `maxParseTime`: Maximum parsing time limit in milliseconds (5000-120000)

### View Settings

```json
{
  "plsql-outline.view.showStructureBlocks": true,
  "plsql-outline.view.expandByDefault": true,
  "plsql-outline.view.autoSelectOnCursor": true
}
```

- `showStructureBlocks`: Show structure blocks (BEGIN, EXCEPTION, END) in tree view
- `expandByDefault`: Expand tree nodes by default
- `autoSelectOnCursor`: Auto select corresponding outline node when cursor position changes

### File Extension Settings

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

### Debug Settings

```json
{
  "plsql-outline.debug.enabled": false,
  "plsql-outline.debug.outputPath": "${workspaceFolder}/.plsql-debug",
  "plsql-outline.debug.logLevel": "INFO",
  "plsql-outline.debug.keepFiles": true,
  "plsql-outline.debug.maxFiles": 50
}
```

## 🔧 File Extension Management

### Management Interface

Click the ⚙️ button in toolbar to:

1. **Add Extension**: Enter new file extension (e.g., `.tbl`)
2. **Remove Extension**: Select extension to remove from list
3. **Reset to Default**: Restore to default extension list
4. **View Current List**: Display all currently configured extensions

### Adding New Extensions

1. Click "Add Extension"
2. Enter extension (must start with `.`)
3. Confirm addition

### Removing Extensions

1. Click "Remove Extension"
2. Select extension to remove from dropdown
3. Confirm removal

### Reset to Default

Click "Reset to Default" to restore these default extensions:
- `.sql` - SQL script files
- `.fnc` - Function files
- `.fcn` - Function files (alternative extension)
- `.prc` - Procedure files
- `.pks` - Package specification files
- `.pkb` - Package body files
- `.typ` - Type definition files

## 📊 Supported PL/SQL Structures

### Package Structures
- **Package Header** (`.pks`): Package specifications
- **Package Body** (`.pkb`): Package bodies

### Subprograms
- **Function**: Function definitions
- **Procedure**: Procedure definitions
- **Function Declaration**: Function declarations
- **Procedure Declaration**: Procedure declarations

### Other Structures
- **Trigger**: Triggers
- **Anonymous Block**: Anonymous blocks

### Structure Blocks
- **BEGIN**: Execution section start
- **EXCEPTION**: Exception handling section
- **END**: Structure end

## 🎨 Outline View Description

### Node Information Display

Each node displays the following information (in order):
1. **Level**: `L2`, `L3`, etc. (only shown for level 2 and above)
2. **Child Count**: `3 children` (only shown when there are children)
3. **Line Number**: `Line 15`

### Icon Description

| Icon | Type | Description |
|------|------|-------------|
| 📦 | Package | Package (Header/Body) |
| 🔧 | Function | Function |
| ⚙️ | Procedure | Procedure |
| ⚡ | Trigger | Trigger |
| 📄 | Anonymous Block | Anonymous Block |
| ▶️ | BEGIN | Execution section start |
| ⚠️ | EXCEPTION | Exception handling section |
| ⏹️ | END | Structure end |

## 🐛 Troubleshooting

### Common Issues

**Q: Why isn't my file being parsed?**
A: Please check:
1. File extension is in supported list
2. Auto parsing is enabled
3. File content is valid PL/SQL code

**Q: How to add new file type support?**
A: Use file extension management feature:
1. Click ⚙️ button in toolbar
2. Select "Add Extension"
3. Enter new extension (e.g., `.tbl`)

**Q: Parsing is slow, what to do?**
A: You can adjust these settings:
- Reduce `maxLines` limit
- Reduce `maxNestingDepth` limit
- Increase `maxParseTime` limit

**Q: How to view parsing errors?**
A: 
1. Enable debug mode
2. Use "Show Parse Statistics" command
3. Check error information in output panel

### Debug Mode

Enable debug mode for more detailed information:

1. **Enable Debug**:
   - Use command palette: `Ctrl+Shift+P` → `PL/SQL Outline: Toggle Debug Mode`
   - Or in settings: Set `plsql-outline.debug.enabled` to `true`

2. **View Debug Information**:
   - Open output panel: `View` → `Output`
   - Select `PL/SQL Outline Debug` channel
   - View real-time parsing process and error information

3. **Debug Information Includes**:
   - Parsing progress and statistics
   - Expand/collapse operation details
   - Error and warning information
   - Performance metrics

**Note**: Since v1.2.5, file logging has been removed. All debug information now outputs directly to VS Code output channel, which is more efficient and doesn't consume disk space.

## 📈 Performance Optimization

### v1.2.5 Major Performance Improvements

This version underwent comprehensive performance optimization, significantly improving extension response speed and memory efficiency:

#### 🚀 Memory Optimization
- **90%+ Memory Usage Reduction**: Removed file logging system, switched to VS Code output channel
- **LRU Cache Mechanism**: Intelligent cache management with automatic cleanup of expired data
- **Memory Monitoring**: Real-time memory usage monitoring with automatic cleanup triggers
- **Zero File I/O**: Eliminated all disk write operations, avoiding I/O blocking

#### ⚡ Response Speed Improvement
- **Instant Expansion**: Expand all function changed from unresponsive to instant response
- **Asynchronous Processing**: All operations use async mode, no main thread blocking
- **Batch Operations**: Optimized tree view update strategy, reduced redundant rendering

#### 🛠️ Technical Improvements
- **getParent Method**: Support for VS Code native reveal API
- **Dual Expansion Strategy**: Force expand flag + reveal API ensures complete expansion
- **Error Tolerance**: Single node failure doesn't affect overall operation

### Large File Handling

For large PL/SQL files:
- Adjust `maxLines` setting (default 50000 lines)
- Consider splitting oversized files
- Enable memory monitoring feature

### Memory Usage Recommendations

- **Recommended Settings**: Keep default configuration for optimal performance
- **Debug Mode**: Only enable when needed, disable promptly after use
- **Cache Management**: Extension automatically manages cache, no manual intervention needed

## 🔄 Changelog

### v1.4.6 (2025-01-20)
- 🔧 **Smart Debug Control**: Debug information only outputs when debug mode is enabled
- 🎯 **User Experience Optimization**: Console stays clean by default with no debug output
- 📊 **Unified Log Format**: All debug output uses `[PL/SQL Outline Debug]` prefix
- ⚙️ **Real-time Configuration**: Debug mode toggle takes effect immediately without extension restart
- 🚀 **Performance Improvement**: Reduced unnecessary string processing and console output overhead
- 🛠️ **Preserve Important Logs**: Extension activation, deactivation and other critical information always output

### v1.4.5 (2025-01-20)
- 🔧 **Major Improvement**: Completely redesigned cursor synchronization algorithm
- ✅ **New**: Candidate collection mechanism ensures finding the best match
- 📊 **New**: Priority system with exact matches prioritized over range matches
- 🎯 **Fix**: Strictly match based on actual line numbers
- 🚀 **Optimization**: Single traversal candidate collection improves performance
- 📝 **Principles**: Precision, predictability, performance optimization

### v1.3.0 (2025-01-19)
- 🔧 **Major Fix**: Settings page save functionality completely fixed
- ⚙️ **Configuration Optimization**: All configurations now save to workspace level, ensuring settings take effect
- 🔄 **State Synchronization**: Auto sync frontend interface after saving, configurations take effect immediately
- 🎯 **User Experience**: Fixed settings loss issue, providing reliable configuration management
- 📋 **Technical Improvement**: Unified use of Workspace configuration target, supporting project-specific settings

### v1.2.5 (2025-01-19)
- 🚀 **Major Performance Optimization**: Memory usage reduced by 90%+
- 🔧 **Fix**: Expand all functionality completely rewritten, now correctly expands root nodes and all child nodes
- 🗑️ **Removal**: Deleted complex file logging system, switched to VS Code output channel
- ⚡ **Performance**: Eliminated file I/O blocking, significantly improved response speed
- 🛠️ **Technical Improvement**: Added getParent method supporting VS Code reveal API
- 📊 **Debug Optimization**: Real-time debug information output to VS Code output panel
- 🧹 **Memory Management**: Implemented LRU cache mechanism with automatic memory cleanup

### v1.1.0 (2025-01-19)
- ✨ New: Configurable file extension support
- ✨ New: One-click expand/collapse functionality
- ✨ New: File extension management interface
- 🎨 Improvement: Outline view display order (level-children-line)
- 🎨 Improvement: View title changed to "PLSQL Outline"
- 🔧 Fix: Updated project icon to Icon.png

### v1.0.2 (2025-01-19)
- 🐛 Fix: END IF/LOOP/CASE parsing errors
- 🔧 Improvement: Control structure recognition logic
- ✅ Test: Added regression test coverage

### v1.0.1
- 🐛 Fix: Parser stability issues
- 📝 Documentation: Updated usage instructions

### v1.0.0
- 🎉 Initial release
- ✨ Basic parsing functionality
- 🌳 Outline view
- ⚙️ Configuration options

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push branch: `git push origin feature/AmazingFeature`
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Related Links

- [GitHub Repository](https://github.com/Emon9426/plsql-outline)
- [Issue Tracker](https://github.com/Emon9426/plsql-outline/issues)
- [Changelog](https://github.com/Emon9426/plsql-outline/releases)

## 💡 Technical Support

If you encounter issues or have suggestions, please:

1. Check the troubleshooting section in this documentation
2. Create an Issue on GitHub
3. Provide detailed error information and reproduction steps

---

**Enjoy using PL/SQL Outline!** 🎉

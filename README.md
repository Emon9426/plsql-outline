# PL/SQL Outline

一个强大的 VS Code 扩展，用于解析和显示 PL/SQL 代码结构。

## 功能特性

### 🔍 智能解析
- 支持 Package Header (.pks) 和 Package Body (.pkb) 文件
- 解析函数、存储过程、触发器等 PL/SQL 对象
- 识别嵌套结构和代码块
- 准确定位声明、BEGIN、EXCEPTION、END 等关键位置

### 📊 结构化视图
- 树形大纲视图，清晰展示代码层次结构
- 显示函数/过程的参数信息
- 支持结构块（BEGIN/EXCEPTION/END）显示
- 一键跳转到代码位置

### 🛠️ 调试支持
- 详细的解析日志
- 错误和警告信息
- 解析统计信息
- 调试文件导出

### ⚙️ 高度可配置
- 自动解析设置
- 视图显示选项
- 性能限制配置
- 调试模式控制

## 支持的文件类型

- `.sql` - SQL 脚本文件
- `.pks` - Package Header 文件
- `.pkb` - Package Body 文件
- `.prc` - 存储过程文件
- `.fnc` - 函数文件
- `.trg` - 触发器文件

## 安装

1. 在 VS Code 中打开扩展市场
2. 搜索 "PL/SQL Outline"
3. 点击安装

## 使用方法

### 基本使用

1. 打开任何 PL/SQL 文件
2. 扩展会自动激活并解析文件
3. 在资源管理器中查看 "PL/SQL大纲" 面板
4. 点击树节点跳转到对应代码位置

### 命令

- `PL/SQL Outline: 解析当前文件` - 手动解析当前文件
- `PL/SQL Outline: 刷新` - 刷新大纲视图
- `PL/SQL Outline: 切换结构块显示` - 显示/隐藏 BEGIN/END 块
- `PL/SQL Outline: 切换调试模式` - 启用/禁用调试模式
- `PL/SQL Outline: 显示解析统计` - 查看解析统计信息
- `PL/SQL Outline: 导出解析结果` - 导出解析结果为 JSON

### 配置选项

#### 解析设置
```json
{
  "plsql-outline.parsing.autoParseOnSave": true,
  "plsql-outline.parsing.autoParseOnSwitch": true,
  "plsql-outline.parsing.maxLines": 50000,
  "plsql-outline.parsing.maxNestingDepth": 20,
  "plsql-outline.parsing.maxParseTime": 30000
}
```

#### 视图设置
```json
{
  "plsql-outline.view.showStructureBlocks": true,
  "plsql-outline.view.expandByDefault": true
}
```

#### 调试设置
```json
{
  "plsql-outline.debug.enabled": false,
  "plsql-outline.debug.outputPath": "${workspaceFolder}/.plsql-debug",
  "plsql-outline.debug.logLevel": "INFO",
  "plsql-outline.debug.keepFiles": true,
  "plsql-outline.debug.maxFiles": 50
}
```

## 解析能力

### Package Header 解析
- 函数和过程声明
- 参数列表和类型
- 返回类型（函数）
- 注释和文档

### Package Body 解析
- 函数和过程实现
- 嵌套子程序
- BEGIN/EXCEPTION/END 块
- 局部变量声明

### 复杂结构支持
- 多层嵌套函数/过程
- 复杂参数列表（IN/OUT/IN OUT）
- 默认参数值
- 重载函数/过程
- 异常处理块

## 示例

### Package Header (.pks)
```sql
CREATE OR REPLACE PACKAGE my_package AS
  -- 简单函数声明
  FUNCTION get_user_name(p_user_id IN NUMBER) RETURN VARCHAR2;
  
  -- 复杂过程声明
  PROCEDURE process_data(
    p_input_data  IN  CLOB,
    p_output_data OUT SYS_REFCURSOR,
    p_status      OUT NUMBER
  );
END my_package;
```

### Package Body (.pkb)
```sql
CREATE OR REPLACE PACKAGE BODY my_package AS
  
  FUNCTION get_user_name(p_user_id IN NUMBER) RETURN VARCHAR2 IS
    v_name VARCHAR2(100);
  BEGIN
    SELECT name INTO v_name 
    FROM users 
    WHERE id = p_user_id;
    
    RETURN v_name;
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RETURN NULL;
  END get_user_name;
  
  PROCEDURE process_data(
    p_input_data  IN  CLOB,
    p_output_data OUT SYS_REFCURSOR,
    p_status      OUT NUMBER
  ) IS
  BEGIN
    -- 处理逻辑
    p_status := 1;
  EXCEPTION
    WHEN OTHERS THEN
      p_status := -1;
  END process_data;
  
END my_package;
```

## 故障排除

### 解析失败
1. 检查 PL/SQL 语法是否正确
2. 确认文件编码为 UTF-8
3. 启用调试模式查看详细错误信息

### 性能问题
1. 调整 `maxLines` 和 `maxParseTime` 设置
2. 对于大文件，考虑禁用自动解析
3. 使用手动解析命令

### 视图问题
1. 刷新大纲视图
2. 重新解析当前文件
3. 检查文件类型是否被正确识别

## 技术架构

### 核心组件
- **解析器 (Parser)**: 基于正则表达式的 PL/SQL 语法解析
- **安全模块 (Safety)**: 性能限制和错误处理
- **模式匹配 (Patterns)**: PL/SQL 语法模式定义
- **树视图 (TreeView)**: VS Code 树形视图集成
- **调试支持 (Debug)**: 日志记录和调试文件生成

### 解析流程
1. 文本预处理（注释处理、格式化）
2. 语法模式匹配
3. 结构层次分析
4. 节点关系建立
5. 元数据收集

## 开发

### 构建项目
```bash
npm install
npm run compile
```

### 运行测试
```bash
npm test
```

### 打包扩展
```bash
npm run package
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 更新日志

### 1.0.0
- 初始版本发布
- 支持 Package Header 和 Package Body 解析
- 树形大纲视图
- 基本调试功能
- 配置选项支持

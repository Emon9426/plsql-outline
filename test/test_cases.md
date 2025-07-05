# PL/SQL解析器测试用例

## 1. 长过程文件测试 (`long_procedure.sql`)

### 测试状态：🟡 部分通过

### 测试目的
验证解析器对超长PL/SQL过程的处理能力，包含多层嵌套块和异常处理。

### 关键测试点
- 主过程`long_procedure`的识别
- 嵌套函数`factorial`和过程`print_stars`的识别
- 多层嵌套块（DECLARE-BEGIN-END）的层次结构
- 异常处理块（EXCEPTION）的识别
- 注释中的关键字不干扰解析

### 测试结果
- ✅ 结构识别正确
- ❌ 输出格式与预期不匹配（字段名、类型格式差异）

### 预期结果
```plaintext
- PROCEDURE long_procedure
  |- FUNCTION factorial
      |- BEGIN
  |- PROCEDURE print_stars
      |- BEGIN
  |- BEGIN (主执行块)
      |- DECLARE (嵌套块1)
      |- BEGIN (嵌套块1执行体)
          |- DECLARE (内层嵌套)
          |- BEGIN (内层执行体)
      |- EXCEPTION (嵌套块1异常)
      |- BEGIN (嵌套块2)
  |- EXCEPTION (主块异常)
```

## 2. 复杂包规范测试 (`complex_package.pks`)

### 测试状态：❌ 失败

### 测试目的
验证解析器对包规范中各种声明元素的识别能力。

### 关键测试点
- 包名`complex_package`的识别
- 常量`MAX_VALUE`的识别
- 记录类型`t_employee`和表类型`t_employee_tab`的识别
- 异常`invalid_value`的识别
- 函数/过程声明的识别
- 注释中的关键字不干扰解析

### 测试结果
- ✅ 包名识别正确
- ❌ 缺少所有内部声明元素（常量、类型、异常、函数/过程声明）
- ❌ 解析器不支持包规范中的声明元素

### 预期结果
```plaintext
- PACKAGE complex_package
  |- CONSTANT MAX_VALUE
  |- TYPE t_employee
  |- TYPE t_employee_tab
  |- EXCEPTION invalid_value
  |- FUNCTION calculate_bonus
  |- PROCEDURE process_employees
  |- FUNCTION format_name
```

## 3. 复杂包体测试 (`complex_package.pkb`)

### 测试状态：🟡 部分通过

### 测试目的
验证解析器对包体实现中多层嵌套结构的处理能力。

### 关键测试点
- 包体`complex_package`的识别
- 函数`calculate_bonus`中的嵌套函数`validate_factor`
- 过程`process_employees`中的嵌套过程`update_salary`
- 函数`format_name`中的深层嵌套函数`capitalize`
- 多层嵌套块（DECLARE-BEGIN-END）的处理
- 异常处理块的识别

### 测试结果
- ✅ 包体和所有嵌套函数/过程结构识别正确
- ✅ 异常处理块正确识别
- ❌ 类型标识差异（实际：`package`，预期：`PACKAGE_BODY`）
- ❌ 输出格式与预期不匹配

### 预期结果
```plaintext
- PACKAGE BODY complex_package
  |- FUNCTION calculate_bonus
      |- FUNCTION validate_factor
          |- BEGIN
      |- BEGIN
  |- PROCEDURE process_employees
      |- PROCEDURE update_salary
          |- BEGIN
      |- BEGIN
  |- FUNCTION format_name
      |- FUNCTION capitalize
          |- BEGIN
      |- DECLARE (嵌套块)
      |- BEGIN
      |- EXCEPTION
```

## 4. 多层嵌套函数测试 (`nested_functions.fcn`)

### 测试状态：🟡 部分通过

### 测试目的
验证解析器对深层嵌套函数（4层）的处理能力。

### 关键测试点
- 主函数`level1_function`的识别
- 嵌套函数`level2_function`的识别
- 深层嵌套函数`level3_function`和`level4_function`的识别
- 函数层次结构的正确表示

### 测试结果
- ✅ 4层嵌套函数结构完全正确
- ✅ 函数层次关系准确
- ❌ 实际输出包含了每层的BEGIN块，预期输出中level2和level3函数缺少BEGIN块
- ❌ 输出格式差异

### 预期结果
```plaintext
- FUNCTION level1_function
  |- FUNCTION level2_function
      |- FUNCTION level3_function
          |- FUNCTION level4_function
              |- BEGIN
  |- BEGIN
```

## 5. 边界情况测试 (`edge_cases.prc`)

### 测试状态：🟡 部分通过

### 测试目的
验证解析器对各种边界情况的处理能力。

### 关键测试点
- 不同END写法的处理：
  - 只有END（`END;`）
  - END后跟名称（`END func_name;`）
- 混合END写法的嵌套结构
- 注释中的嵌套结构不干扰解析
- 异常处理块的识别
- 空执行块（NULL语句）的处理

### 测试结果
- ✅ 主过程和所有嵌套过程/函数正确识别
- ✅ 混合END写法处理正确
- ✅ 异常处理块正确识别
- ❌ 输出格式与预期不匹配（字段名、类型格式差异）

### 预期结果
```plaintext
- PROCEDURE edge_case_procedure
  |- PROCEDURE simple_end
      |- BEGIN
  |- FUNCTION func_with_named_end
      |- BEGIN
  |- PROCEDURE mixed_end
      |- FUNCTION inner_func
          |- BEGIN
      |- PROCEDURE inner_proc
          |- BEGIN
      |- BEGIN
          |- DECLARE
          |- BEGIN
  |- BEGIN
      |- DECLARE
      |- BEGIN
          |- BEGIN (异常测试块)
          |- EXCEPTION
  |- EXCEPTION
```

## 测试结果汇总

| 测试用例 | 状态 | 结构匹配 | 主要问题 |
|---------|------|---------|---------|
| 长过程文件测试 | 🟡 部分通过 | ✅ | 输出格式差异 |
| 复杂包规范测试 | ❌ 失败 | ❌ | 不支持包规范声明元素 |
| 复杂包体测试 | 🟡 部分通过 | ✅ | 类型标识和格式差异 |
| 多层嵌套函数测试 | 🟡 部分通过 | ✅ | BEGIN块处理和格式差异 |
| 边界情况测试 | 🟡 部分通过 | ✅ | 输出格式差异 |

### 总体评估
- **通过率**: 0/5 完全通过，4/5 部分通过，1/5 失败
- **结构识别能力**: 优秀（除包规范外）
- **主要问题**: 输出格式标准化、包规范解析缺失

### 优先改进建议
1. **紧急**: 实现包规范中声明元素的解析支持
2. **重要**: 统一输出格式（字段名、类型格式）
3. **建议**: 完善测试基准，匹配实际合理输出

## 测试注意事项
1. 所有注释内容（包括含关键字的注释）不应被解析为代码结构
2. 每个节点的范围（RANGE）应准确定位到代码位置
3. 点击大纲节点应能正确跳转到对应代码位置
4. 异常处理块应作为独立节点显示
5. 空块（如`BEGIN NULL; END;`）也应被正确解析

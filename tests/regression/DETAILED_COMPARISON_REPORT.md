# PL/SQL解析器详细比较报告

生成时间: 2025/7/19 00:06:37

## 📊 总体统计

| 指标 | 数值 | 百分比 |
|------|------|--------|
| 总测试数 | 12 | 100% |
| 通过测试 | 12 | 100.0% |
| 失败测试 | 0 | 0.0% |

## 📋 测试结果概览

| 测试名称 | 状态 | Actual节点 | Expected节点 | Actual深度 | Expected深度 | 差异数 |
|----------|------|------------|--------------|------------|--------------|--------|
| comma_leading_params_test | ✅ PASS | 6 | 6 | 2 | 2 | 0 |
| comment_complex_cases | ✅ PASS | 1 | 1 | 2 | 2 | 0 |
| comment_interference_test | ✅ PASS | 1 | 1 | 2 | 2 | 0 |
| complex_nested_functions | ✅ PASS | 1 | 1 | 3 | 3 | 0 |
| complex_package | ✅ PASS | 1 | 1 | 3 | 3 | 0 |
| complex_package_pks | ✅ PASS | 1 | 1 | 2 | 2 | 0 |
| debug_comment | ✅ PASS | 1 | 1 | 1 | 1 | 0 |
| edge_cases | ✅ PASS | 1 | 1 | 3 | 3 | 0 |
| exception_complex_cases | ✅ PASS | 10 | 10 | 3 | 3 | 0 |
| exception_when_test | ✅ PASS | 2 | 2 | 1 | 1 | 0 |
| extreme_comment_nesting | ✅ PASS | 1 | 1 | 2 | 2 | 0 |
| extreme_multiline_test | ✅ PASS | 7 | 7 | 2 | 2 | 0 |

## ✅ 通过测试列表

- **comma_leading_params_test**: 6个节点, 最大深度2
- **comment_complex_cases**: 1个节点, 最大深度2
- **comment_interference_test**: 1个节点, 最大深度2
- **complex_nested_functions**: 1个节点, 最大深度3
- **complex_package**: 1个节点, 最大深度3
- **complex_package_pks**: 1个节点, 最大深度2
- **debug_comment**: 1个节点, 最大深度1
- **edge_cases**: 1个节点, 最大深度3
- **exception_complex_cases**: 10个节点, 最大深度3
- **exception_when_test**: 2个节点, 最大深度1
- **extreme_comment_nesting**: 1个节点, 最大深度2
- **extreme_multiline_test**: 7个节点, 最大深度2

## 💡 总结与建议

🎉 **恭喜！所有测试都通过了！**

actual和expected目录中的所有文件内容完全一致，解析器工作正常。

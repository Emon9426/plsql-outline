# PL/SQL解析器测试报告

生成时间: 2025/7/19 00:03:57

## 📊 总体统计

| 指标 | 数值 | 百分比 |
|------|------|--------|
| 总测试数 | 12 | 100% |
| 通过测试 | 12 | 100.0% |
| 失败测试 | 0 | 0.0% |

## 📋 测试结果概览

| 测试名称 | 状态 | 期望节点 | 实际节点 | 期望深度 | 实际深度 | 结果 |
|----------|------|----------|----------|----------|----------|------|
| comma_leading_params_test | ✅ | 6 | 6 | 2 | 2 | 测试通过 |
| comment_complex_cases | ✅ | 1 | 1 | 2 | 2 | 测试通过 |
| comment_interference_test | ✅ | 1 | 1 | 2 | 2 | 测试通过 |
| complex_nested_functions | ✅ | 1 | 1 | 3 | 3 | 测试通过 |
| complex_package | ✅ | 1 | 1 | 3 | 3 | 测试通过 |
| complex_package_pks | ✅ | 1 | 1 | 2 | 2 | 测试通过 |
| debug_comment | ✅ | 1 | 1 | 1 | 1 | 测试通过 |
| edge_cases | ✅ | 1 | 1 | 3 | 3 | 测试通过 |
| exception_complex_cases | ✅ | 10 | 10 | 3 | 3 | 测试通过 |
| exception_when_test | ✅ | 2 | 2 | 1 | 1 | 测试通过 |
| extreme_comment_nesting | ✅ | 1 | 1 | 2 | 2 | 测试通过 |
| extreme_multiline_test | ✅ | 7 | 7 | 2 | 2 | 测试通过 |

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

解析器工作正常，完全符合预期结果。

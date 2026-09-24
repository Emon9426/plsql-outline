# AGENTS.md — PL/SQL Outline 项目指令（ZCode / GLM 入口）

VS Code 扩展：解析 PL/SQL 为结构化大纲。TypeScript strict + 纯 tsc，零运行时依赖，
中文注释与中文 UI。完整知识库在 **`.ai/`**（唯一事实源）：

| 需要 | 读 |
|---|---|
| 项目结构 / 设计决策 | [.ai/project.md](.ai/project.md) |
| 改解析器或显示层 | [.ai/parser-playbook.md](.ai/parser-playbook.md)（必读） |
| 跑测试 / 补用例 | [.ai/testing.md](.ai/testing.md) |
| 提交 / 发版 / 打包 | [.ai/workflow.md](.ai/workflow.md) |
| 设置项 / 功能 / 联系方式 | [.ai/product.md](.ai/product.md) |

## 铁律

1. **改动必跑全量回归**：`test:corpus`（35/35）→ `npm test`（504/504）→
   `test:regression`（14/14）→ `test:e2e`（anonDefinition + smoke 7/7 + foldRouting 8/8
   + indexJump 11/11）。基线变了先更新 .ai/testing.md。
2. **提交信息**：中文 Conventional Commits（`fix(parser): 描述`）；禁 `git add -A`。
3. **死代码/无效配置删除，不补接线**（用户明确偏好）。
4. 修复缺陷走 Issue → 分支 → PR（`Fixes #N`）；解析器每次解析必须独立实例。
5. 解析器不得 import 'vscode'（测试直接 require out/parser）。
6. 打包前过 .ai/workflow.md 防泄漏检查单。

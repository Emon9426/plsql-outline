# AI 知识库索引（plsql-outline）

本目录是本仓库所有 AI 工具（ZCode / GLM / Claude Code / Copilot）的**唯一事实源**。
根目录 `AGENTS.md` 是入口；`CLAUDE.md` 与 `.github/copilot-instructions.md` 均为指向本目录的薄指针。

## 阅读顺序

| 文件 | 内容 | 何时读 |
|---|---|---|
| [project.md](project.md) | 项目定位、模块架构、关键设计决策 | 首次接触 / 改动跨模块时 |
| [parser-playbook.md](parser-playbook.md) | 解析器机制、gotchas、已知限制 | 改 `src/parser.ts` / `src/treeView.ts` 前**必读** |
| [testing.md](testing.md) | 测试手册：目录、命令、基线、新增用例规范 | 任何代码改动后 |
| [workflow.md](workflow.md) | Git 工作流、提交规范、发布与打包检查单 | 提交 / 发布前 |
| [product.md](product.md) | 面向用户的功能清单、设置项说明、联系人 | 改设置 / README / 命令时 |

## 硬性规则（摘要，详见各文件）

1. 改解析器/显示层前先读 parser-playbook.md，**任何修改跑全量回归**（testing.md）。
2. 提交信息用中文 Conventional Commits：`fix(scope): 描述`（workflow.md）。
3. 死代码/无效配置一律**删除**而非补接线（用户明确偏好）。
4. 修复缺陷走 Issue → 分支 → PR（`Fixes #N`）→ 合并 → 关闭 → README/CHANGELOG → 版本+打包。
5. 打包前过一遍 workflow.md 的防泄漏检查单（`.vscodeignore` 曾两次出事故）。

# PL/SQL Outline 项目指令（Copilot）

本项目所有 AI 工具共用同一知识库：入口为根目录 [AGENTS.md](../AGENTS.md)，
详细知识库在 `.ai/`（项目概览 / 解析器手册 / 测试手册 / 工作流 / 产品说明）。

核心规则摘要：

1. 任何修改跑全量回归：`npm run test:corpus`（33/33）→ `npm test`（322/322）→
   `npm run test:regression`（11/11）→ `npm run test:e2e`。
2. 提交信息：中文 Conventional Commits，如 `fix(parser): 描述`。
3. 改 `src/parser.ts` / `src/treeView.ts` 前必读 `.ai/parser-playbook.md`。
4. 死代码与无效配置一律删除，不做兼容性补接线。
5. 保持中文注释与中文 UI 风格；解析器保持不依赖 vscode 模块。

# 工作流（workflow）

## Git 流程

- 常规缺陷修复：**Issue → 分支 → 修复 → 测试 → PR（`Fixes #N`）→ 合并 → 关闭 Issue →
  README/CHANGELOG → 版本号 + 打包**。
- 版本号语义：功能 → minor（v1.X.0），修复 → patch（v1.X.Y）。
- 大型重构轮（如 v1.8.0）：单分支承载、缺陷修复在前、逐工作项独立提交，最后一个总 PR。
- 分支从最新 main 切出；**禁止 `git add -A`**（曾把 300MB `.vscode-test/` 提交进去，
  GitHub pre-receive 拦下才幸免）——只 add 明确路径。
- 本地 main 领先远端时，squash-merge 后先 `git fetch && git reset --hard origin/main`
  核对再继续。

## 提交信息

中文 Conventional Commits：`<type>(<scope>): 描述`。
type ∈ feat / fix / refactor / perf / docs / chore / test / release。
发版提交：`release(vX.Y.Z): 主题`。
（历史文件里的 `[YYYY-MM-DD HH:mm]` 前缀规则已废弃，勿再使用。）

## 发布检查单

1. 全量回归绿（.ai/testing.md 四步）+ 代码审查（HIGH/MED/LOW 问题清零或记录）。
2. `package.json` 版本号；`CHANGELOG.md` 顶部新增条目（中英标题、中文正文）。
3. README 若受影响（功能/设置/路径/联系方式）同步更新。
4. `npm run package` → `release/plsql-outline-X.Y.Z.vsix`（不入库）。
5. **打包审计**：`unzip -l release/*.vsix` 确认——
   - 不得出现：tests/ corpus/ .ai/ docs/ src/ .mimosa/ tmp* *.log / 任何调查文件
     （v1.7.3 曾把 3.5MB 调查截图打进包，根因是 .vscodeignore 缺规则）；
   - 必须存在：out/*.js、package.json、README.md、CHANGELOG.md、LICENSE.txt、
     language-configuration.json、res/Icon.png、**res/screenshots/**（marketplace
     渲染 README 只认包内图片，严禁排除）。
6. GitHub Release 上传 vsix（vsix 不再随 git 提交，历史版本走 Releases）。

## 环境事实

- Windows + Git Bash；Mimosa 插件已**禁用**（`~/.zcode/cli/config.json`），
  重新启用会复活误报的 git-gate（test 文件被误判"代码注入"），勿开。
- E2E 依赖 `.vscode-test/` 缓存的 VS Code 实例（约 1.1GB，已 gitignore）。
- 用户级 ZCode 记忆在 `~/.zcode/cli/memories/projects/plsql-outline-*/memory/`，
  由 ZCode 管理；项目事实以本目录（.ai/）为准，记忆只存会话状态与行为反馈。

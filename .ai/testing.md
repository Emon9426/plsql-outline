# 测试手册（testing）

**任何 src 修改 ⇒ 全量回归，缺一不可。** 基线数字即验收门槛；修复缺陷后如基线变化，
先更新本文件再合并。

## 前置

```bash
npm run compile   # 所有测试直接 require out/ 编译产物，必须先编译
```

## 全量回归清单（按序执行）

| # | 命令 | 基线 | 覆盖 |
|---|---|---|---|
| 1 | `npm run test:corpus`（= validate.js + render-validate.js） | **34/34 + 34 OK** | 143k 行语料（含 .pck）的解析层 + 显示层 |
| 2 | `npm test`（= compile + tests/unit/run_all.js） | **351/351（20 套件）** | 解析/渲染/导航/取消/设置/引号标识符契约 |
| 3 | `npm run test:regression` | **11/11 套件** | 真实世界包/超大文件/边界/光标同步/定义跳转/符号索引/内存 |
| 4 | `npm run test:e2e` | **anonDefinition 通过 + smoke 7/7** | 真实 VS Code 宿主（@vscode/test-electron） |

补充：`node tests/bench.js` 输出语料大文件解析耗时基准（性能改动的证据）。

## 目录与机制

- `tests/unit/`：自研断言（`{ run }` 返回 `{ suiteName, cases, parseTime }`），
  `run_all.js` 汇总并生成 `test_report.html`（已 gitignore）。vscode 模块通过
  `Module._resolveFilename` 劫持 mock。**新套件必须注册进 run_all.js**。
- `tests/regression/`：11 个可独立运行的脚本（`node tests/regression/<name>.js`），
  `run_all.js` 依次 spawn 聚合退出码。`parser_test.js` 使用 expected/ golden 文件
  （12 组 JSON 对比）。**不要运行 generate_*.js**（生成确定性 fixture，勿覆盖）。
- `tests/corpus/`：33 个 PL/SQL 文件（7 类对象 × simple/complex/long/long+complex，
  long ≥10k 行）。19 个手写（文件头注释写明期望大纲）、14 个由 `generate-long.js`
  确定性生成（勿手编）。详见其 README（含文件矩阵与行格式约束）。
- `tests/e2e/`：`*.e2e.test.js` 是启动器（下载/复用 `.vscode-test/` 的 VS Code），
  `*.inVS.test.js` 在宿主内运行（新宿主无 mocha 全局，用 `module.exports.run()`）。
  运行时工作区副本 `tests/e2e/ws/` 已 gitignore。

## 新增用例规范

1. **先分析覆盖缺口成因**（缺什么场景、为什么既有套件没兜住），再补用例。
2. 缺陷修复的回归文件放对应层：解析契约 → tests/unit；真实大纲形态 → tests/corpus；
   跨文件/宿主行为 → tests/e2e 或 tests/regression。
3. 套件命名 `<feature>_test.js`，文件头注释写明背景（对应 Issue/事故）与锁定的契约。
4. 不许为了让测试通过而修改/删除无关测试（用户红线）。

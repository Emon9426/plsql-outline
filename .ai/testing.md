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
| 1 | `npm run test:corpus`（= validate.js + render-validate.js） | **35/35 + 35 OK** | 143k 行语料（含 .pck / get_ddl 形态）的解析层 + 显示层 |
| 2 | `npm test`（= compile + tests/unit/run_all.js） | **501/501（29 套件）** | 解析/渲染/导航/取消/设置/引号标识符/get_ddl/折叠/关键字配对高亮/游标SQL悬浮/逐级展开与原生缩进/搜索过滤/复制名称/悬浮聚合SQL/符号扫描器（corpus 一致性对照，#39） 契约 |
| 3 | `npm run test:regression` | **14/14 套件** | 真实世界包/超大文件/边界/光标同步/区域跟随（#22）/定义跳转/符号索引/内存/Refresh 焦点回退/激活自动解析 |
| 4 | `npm run test:e2e` | **anonDefinition 通过 + smoke 7/7 + foldRouting 8/8 + indexJump 9/9** | 真实 VS Code 宿主（@vscode/test-electron）；foldRouting 锁定提供者路由（#26）+ 段折叠/配对高亮/原生回退（#31）；indexJump 双代码仓库路径跨文件跳转（#38：独立工作区 ws-index 预置双路径 settings.json，启动自动建索引 + 高/低优先级可达 + 同名冲突优先级消解 + 包名限定优先 + 当前文件游标 + watcher 新建/修改增量；#39：Ctrl+T 工作区符号搜索） |

补充：`node tests/bench.js` 输出语料大文件解析耗时基准（性能改动的证据）；
`node tests/stress/index_stress.js` 符号索引压力测试（#38/#39，独立脚本不进
四步链；合成双目录仓库默认 2000 文件，`PLSQL_STRESS_FILES=5000` 满配；
11 阶段断言：首建/零重扫/扰动/取消/并发查询/upsert/缓存 round-trip/watcher
风暴/maxFiles 收缩/病态一致性/查询延迟/内存稳定性；满配实测首建 ~1s、
无变化重建 <50ms、lookup 0.2µs、缓存 9MB load 65ms）。

## 目录与机制

- `tests/unit/`：自研断言（`{ run }` 返回 `{ suiteName, cases, parseTime }`），
  `run_all.js` 汇总并生成 `test_report.html`（已 gitignore）。vscode 模块通过
  `Module._resolveFilename` 劫持 mock。**新套件必须注册进 run_all.js**。
  run_all 单进程共享 vscode_mock 缓存：**构造 TreeViewManager 的套件**（需要
  createTreeView/命令捕获）须先 `delete require.cache` 掉 out/treeView 再以
  自身 mock 重新 require（见 outline_filter/copy_name_test 头部注释）。
- `tests/regression/`：14 个可独立运行的脚本（`node tests/regression/<name>.js`），
  `run_all.js` 依次 spawn 聚合退出码。`parser_test.js` 使用 expected/ golden 文件
  （12 组 JSON 对比）。**不要运行 generate_*.js**（生成确定性 fixture，勿覆盖）。
- `tests/corpus/`：33 个 PL/SQL 文件（7 类对象 × simple/complex/long/long+complex，
  long ≥10k 行）。19 个手写（文件头注释写明期望大纲）、14 个由 `generate-long.js`
  确定性生成（勿手编）。详见其 README（含文件矩阵与行格式约束）。
- `tests/e2e/`：`*.e2e.test.js` 是启动器（下载/复用 `.vscode-test/` 的 VS Code），
  `*.inVS.test.js` 在宿主内运行（新宿主无 mocha 全局，用 `module.exports.run()`）。
  运行时工作区副本 `tests/e2e/ws/`、`tests/e2e/ws-index/`（indexJump 双仓库夹，
  启动器每次重建、结束保留供排障）已 gitignore。

## 新增用例规范

1. **先分析覆盖缺口成因**（缺什么场景、为什么既有套件没兜住），再补用例。
2. 缺陷修复的回归文件放对应层：解析契约 → tests/unit；真实大纲形态 → tests/corpus；
   跨文件/宿主行为 → tests/e2e 或 tests/regression。
3. 套件命名 `<feature>_test.js`，文件头注释写明背景（对应 Issue/事故）与锁定的契约。
4. 不许为了让测试通过而修改/删除无关测试（用户红线）。

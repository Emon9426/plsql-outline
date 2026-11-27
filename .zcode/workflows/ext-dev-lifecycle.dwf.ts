/* zcode-workflow
description: 从一个 Issue 或一段需求出发，走完需求确认、测试用例与技术方案、开发、代码评审、测试与回归、文档、PR、合并、打包发布和复盘的完整开发流程
whenToUse: 需要对 GitBoard、MarkdownEditor、plsql-outline 或 SQLAdmin
  之一做一次完整的开发交付（Issue → 发布）时；可用 stopAfter 只跑到指定环节，例如先跑到“方案”做评审
args:
  issue:
    type: string
    description: Issue 号；或者一段需求描述（会先整理成新 Issue）
    required: true
  repo:
    type: string
    description: 仓库：GitBoard、MarkdownEditor、plsql-outline 或 SQLAdmin
    required: true
  stopAfter:
    type: string
    description: 跑到哪个环节为止：需求、方案、开发、PR、合并、发版
    default: 发版
*/
/* ==========================================================================
 * 扩展开发生命周期工作流
 *
 * Issue → 分支 → 需求 → 测试用例与技术方案 → 开发 → 代码评审 → 测试与回归
 * → 文档 → PR → 合并（处理冲突）→ 合并后复测 → 打包发布 → 复盘
 *
 * 设计要点：
 * - 测试是否通过一律由命令的退出码决定，不采信任何人的口头汇报。
 * - 每个阶段换新的子代理：写方案的人和审方案的人不是同一个，评审发现的问题逐条独立复核。
 * - 需要用户拍板的节点会停下来等待：确认需求、确认方案、确认合并、确认发版。
 * - 四个仓库的协作规则不同，全部写在下面的 PROFILES 里。
 * ========================================================================== */

interface RepoProfile {
  /** GitHub 仓库，形如 Emon9426/VSCodeGitGUI。 */
  githubRepo: string;
  /** 本地克隆目录。 */
  localDir: string;
  /** 插件市场里的扩展 id。 */
  extensionId: string;
  /** 开工前必须先读的协作规则文件（相对仓库根）。 */
  ruleFiles: string[];
  /** 每轮修改后都要跑的快速检查（npm 脚本名）。 */
  fastScripts: string[];
  /** 单元测试（npm 脚本名）。 */
  unitScripts: string[];
  /** 合并与发布前必须按顺序跑完的最强检查（npm 脚本名）。 */
  strongScripts: string[];
  /** 打包 vsix 的 npm 脚本名。 */
  packageScript: string;
  /** vsix 的输出目录（相对仓库根）。 */
  vsixDir: string;
  /** Git 协作方式：issue-flow 表示分支、提交、PR、合并都必须用仓库自带的 scripts/issue-flow.sh。 */
  gitFlow: "issue-flow" | "conventional";
  /** vsix 里禁止出现的条目前缀。 */
  packageForbidden: string[];
  /** vsix 里必须存在的条目；比较时忽略大小写，以星号结尾表示“以此开头即可”。 */
  packageRequired: string[];
  /** vsix 里出现后会提醒、但不阻止发布的条目前缀（例如可能不需要随插件发布的开发脚本）。 */
  packageWarn: string[];
  /** 这个仓库发版时的分支、提交和 CHANGELOG 约定。 */
  releaseConvention: string;
  /** 这个仓库对长期记忆的约定，复盘时告诉主持人。 */
  memoryConvention: string;
}

const PROFILES: Record<string, RepoProfile> = {
  GitBoard: {
    githubRepo: "Emon9426/VSCodeGitGUI",
    localDir: "D:/01_WorkSpace/01_Project/09_GitGraph",
    extensionId: "EmonZhang3438.gitboard",
    ruleFiles: ["AGENTS.md", "docs/issue-workflow.md"],
    fastScripts: ["typecheck"],
    unitScripts: ["test"],
    strongScripts: ["typecheck", "test"],
    packageScript: "package",
    vsixDir: ".",
    gitFlow: "issue-flow",
    packageForbidden: [
      "extension/src/", "extension/test/", "extension/node_modules/", "extension/.vscode/",
      "extension/docs/", "extension/scripts/", "extension/prototype/", "extension/design/",
      "extension/.zcode/", "extension/.mimosa/", "extension/.github/", "extension/AGENTS.md",
    ],
    packageRequired: ["extension.vsixmanifest", "extension/package.json", "extension/out/extension.js", "extension/readme.md", "extension/license*"],
    packageWarn: [],
    releaseConvention: "分支名 chore-bump-X-Y-Z（例如 chore-bump-0-40-0）；提交标题 chore: 版本号 A → B；仓库没有 CHANGELOG，不要新建",
    memoryConvention: "没有特别约定：项目事实写进仓库文档，工作方式和用户偏好写进 ZCode 记忆。",
  },
  MarkdownEditor: {
    githubRepo: "Emon9426/VSCodeMarkDownEditor",
    localDir: "D:/01_WorkSpace/01_Project/08_MarkdownEditor",
    extensionId: "EmonZhang3438.wysiwyg-markdown-editor",
    ruleFiles: ["README.md"],
    fastScripts: [],
    unitScripts: ["test"],
    strongScripts: ["test"],
    packageScript: "package",
    vsixDir: ".",
    gitFlow: "conventional",
    packageForbidden: ["extension/test/", "extension/docs/", "extension/.vscode/", "extension/.zcode/", "extension/.mimosa/", "extension/.github/"],
    packageRequired: ["extension.vsixmanifest", "extension/package.json", "extension/src/extension.js", "extension/readme.md", "extension/changelog.md", "extension/license*"],
    packageWarn: ["extension/scripts/"],
    releaseConvention: "分支名 release/vX.Y.Z；提交标题参考 git log 的历史风格（形如 v1.9.3：主题）；CHANGELOG.md 顶部新增条目",
    memoryConvention: "没有特别约定：项目事实写进仓库文档，工作方式和用户偏好写进 ZCode 记忆。",
  },
  "plsql-outline": {
    githubRepo: "Emon9426/plsql-outline",
    localDir: "D:/01_WorkSpace/01_Project/05_Outline/plsql-outline",
    extensionId: "EmonZhang3438.plsql-outline",
    ruleFiles: ["AGENTS.md", ".ai/project.md", ".ai/parser-playbook.md", ".ai/testing.md", ".ai/workflow.md", ".ai/product.md"],
    fastScripts: ["lint"],
    unitScripts: ["test"],
    strongScripts: ["test:corpus", "test", "test:regression", "test:e2e"],
    packageScript: "package",
    vsixDir: "release",
    gitFlow: "conventional",
    packageForbidden: [
      "extension/src/", "extension/tests/", "extension/scripts/", "extension/docs/", "extension/release/",
      "extension/.ai/", "extension/.github/", "extension/.zcode/", "extension/.qoder/", "extension/.qoder-credits/",
      "extension/.mimosa/", "extension/AGENTS.md", "extension/CLAUDE.md",
    ],
    packageRequired: [
      "extension.vsixmanifest", "extension/package.json", "extension/out/extension.js", "extension/readme.md",
      "extension/changelog.md", "extension/license*", "extension/language-configuration.json", "extension/res/Icon.png",
      "extension/res/screenshots/*",
    ],
    packageWarn: [],
    releaseConvention: "分支名 release/vX.Y.Z；提交标题 release(vX.Y.Z): 主题；CHANGELOG.md 顶部新增条目（中英标题、中文正文）；版本号语义：功能 minor、修复 patch",
    memoryConvention: "仓库规定：项目事实记在 .ai/ 知识库里（唯一事实源），ZCode 记忆只存会话状态和行为反馈。",
  },
  SQLAdmin: {
    githubRepo: "Emon9426/SQLAdmin",
    localDir: "D:/01_WorkSpace/01_Project/13_SqlAdmin",
    extensionId: "EmonZhang3438.sqladmin",
    ruleFiles: ["README.md"],
    fastScripts: ["typecheck"],
    unitScripts: ["test:unit"],
    strongScripts: ["typecheck", "test"],
    packageScript: "package:vsix",
    vsixDir: ".",
    gitFlow: "conventional",
    packageForbidden: ["extension/src/", "extension/test/", "extension/out/", "extension/docs/", "extension/.vscode/", "extension/.zcode/", "extension/.github/"],
    packageRequired: ["extension.vsixmanifest", "extension/package.json", "extension/dist/extension.js", "extension/readme.md", "extension/changelog.md", "extension/license*"],
    packageWarn: [],
    releaseConvention: "分支名 release/vX.Y.Z；提交标题参考 git log 的历史风格；CHANGELOG.md 顶部新增条目",
    memoryConvention: "没有特别约定：项目事实写进仓库文档，工作方式和用户偏好写进 ZCode 记忆。",
  },
};

const STOPS = ["需求", "方案", "开发", "PR", "合并", "发版"];

/** 在 stopAfter 处及之后的位置停下。 */
function reached(stopAfter: string, point: string): boolean {
  const wanted = STOPS.indexOf(stopAfter);
  const current = STOPS.indexOf(point);
  return wanted >= 0 && current >= 0 && current >= wanted;
}

/**
 * 交给 bash 的程序文本是固定的：进入第一个参数指定的目录，再运行仓库自带的 scripts/issue-flow.sh。
 * 目录和全部参数都作为位置参数传入，不拼进命令文本。
 * 需要它是因为 Windows 上工作流直接启动的 bash 是 WSL 版本，访问不到 D 盘。
 */
const CD_AND_RUN_ISSUE_FLOW = 'cd "$1" && shift && exec scripts/issue-flow.sh "$@"';

/** 在仓库目录里运行 scripts/issue-flow.sh（Git for Windows 自带的 bash）。 */
function issueFlow(dir: string, helperArgs: string[], timeoutMs: number): Promise<WorldRunResult> {
  return world.run("C:\\Program Files\\Git\\bin\\bash.exe", ["-c", CD_AND_RUN_ISSUE_FLOW, "issue-flow", dir, ...helperArgs], { timeoutMs, output: { tail: 16384 } });
}

/** 运行仓库里的一个 npm 脚本。Windows 上 npm 不是独立可执行文件，所以用 node 运行 npm 本体。 */
function npmScript(npmCli: string, dir: string, script: string, timeoutMs: number): Promise<WorldRunResult> {
  return world.run("node", [npmCli, "--prefix", dir, "run", "--silent", script], { timeoutMs, output: { tail: 16384 } });
}

/* ---------- 各步骤交换的结果 ---------- */

interface IssueDraft {
  /** Issue 标题，一句话，简体中文。 */
  title: string;
  /** Issue 正文（Markdown）：背景、期望效果、验收要点。 */
  body: string;
  /** 需求类型，决定分支前缀和版本号语义。 */
  kind: "feat" | "fix" | "docs" | "refactor" | "chore";
  /** 分支名用的英文小写片段，只含字母、数字和连字符，最多 5 个词；全是中文标题时留空。 */
  slug: string;
}

interface IssueInfo {
  /** Issue 号。 */
  number: number;
  /** 标题。 */
  title: string;
  /** 正文。 */
  body: string;
  /** OPEN 或 CLOSED。 */
  state: string;
}

interface RequirementDoc {
  /** 一句话说明这个需求要解决什么问题。 */
  summary: string;
  /** 为什么要做，来自 Issue 或用户的原话。 */
  background: string;
  /** 明确要做的范围，每条一句话。 */
  inScope: string[];
  /** 明确不做的范围，每条一句话。 */
  outOfScope: string[];
  /** 可验证的验收标准，每条都能用测试或操作来验证。 */
  acceptanceCriteria: string[];
  /** 受影响的代码区域，写成相对仓库根的路径。 */
  affectedAreas: string[];
  /** 还没弄清楚、需要用户决定的问题；没有则为空数组。 */
  openQuestions: string[];
}

interface TestCase {
  /** 用例编号，形如 TC-01。 */
  id: string;
  /** 用例标题，一句话。 */
  title: string;
  /** unit、regression、e2e 或 manual。 */
  level: "unit" | "regression" | "e2e" | "manual";
  /** 对应哪条验收标准（写编号或原文）。 */
  covers: string;
  /** 操作步骤。 */
  steps: string[];
  /** 预期结果。 */
  expected: string;
  /** 这条用例对应仓库里的哪个测试文件（相对路径）；新建的写计划路径。 */
  testFile: string;
}

interface TestCaseSet {
  /** 用例文档在仓库里的相对路径。 */
  file: string;
  /** 全部用例。 */
  cases: TestCase[];
}

interface FileChange {
  /** 相对仓库根的路径；新文件写计划路径。 */
  path: string;
  /** 新增、修改或删除。 */
  action: "新增" | "修改" | "删除";
  /** 这个文件要做的改动，一两句话。 */
  purpose: string;
}

interface TechPlan {
  /** 方案文档在仓库里的相对路径。 */
  file: string;
  /** 总体思路，三五句话。 */
  approach: string;
  /** 要新增或修改的文件及各自的职责。 */
  changes: FileChange[];
  /** 主要风险及应对。 */
  risks: string[];
  /** 需要用户拍板的取舍；没有则为空数组。 */
  decisions: string[];
}

interface ReviewComment {
  /** 问题的位置：文件路径加行号，或文档的小节名。 */
  where: string;
  /** 问题是什么，一句话。 */
  problem: string;
  /** 严重程度；high 只用于数据丢失、崩溃或结果错误。 */
  severity: "low" | "medium" | "high";
}

interface DocReview {
  /** 只有在不存在必须修改的问题时才是 true。 */
  approved: boolean;
  /** 必须修改的问题；approved 为 true 时为空数组。 */
  mustFix: ReviewComment[];
  /** 可选的改进建议。 */
  suggestions: string[];
}

interface DevResult {
  /** 改了什么，逐条说明。 */
  summary: string[];
  /** 新增或修改的文件（相对仓库根）。 */
  changedFiles: string[];
  /** 为这次改动新增或修改的测试。 */
  testsAdded: string[];
  /** 没有完成或需要用户知道的事；没有则为空数组。 */
  notes: string[];
}

interface CodeReview {
  /** 发现的问题；没有则为空数组。 */
  findings: ReviewComment[];
}

interface Confirmation {
  /** 独立复核后，问题是否确实存在。 */
  confirmed: boolean;
  /** 复核依据：读了哪些行，或运行了什么。 */
  evidence: string;
}

interface CommitPlan {
  /** 提交标题（单行），不含 Fixes、Closes、Resolves 这类关闭关键字。 */
  subject: string;
  /** 提交正文（可多行）；没有则为空字符串。 */
  body: string;
  /** 需要纳入提交的文件或目录（相对仓库根，逐个列出）。 */
  paths: string[];
}

interface PrText {
  /** PR 标题（单行）。 */
  title: string;
  /** PR 正文（Markdown）：改了什么、为什么、怎么验证的。 */
  body: string;
}

interface DocResult {
  /** 更新或新增的文档（相对仓库根）。 */
  files: string[];
  /** 没有更新文档时说明原因；有更新则为空字符串。 */
  skippedBecause: string;
}

interface ReleasePlan {
  /** 新版本号，形如 1.19.0。 */
  version: string;
  /** 发版分支名。 */
  branch: string;
  /** 提交标题（单行）。 */
  commitSubject: string;
  /** 发版说明的标题。 */
  releaseTitle: string;
  /** 发版说明正文（Markdown）。 */
  releaseNotes: string;
  /** 改了哪些文件（相对仓库根）。 */
  changedFiles: string[];
}

interface Lesson {
  /** 一句话说明学到了什么。 */
  lesson: string;
  /** 依据：这次运行里具体发生了什么。 */
  evidence: string;
  /** 该记到哪里：memory 是 ZCode 长期记忆（行为反馈）；knowledge-base 是仓库内的知识库文件（项目事实）。 */
  target: "memory" | "knowledge-base";
  /** target 为 knowledge-base 时，建议写入的仓库文件（相对路径）；否则为空字符串。 */
  file: string;
}

interface Retro {
  lessons: Lesson[];
  /** 做得顺利、下次要保持的做法。 */
  wentWell: string[];
  /** 下次要改的做法。 */
  improve: string[];
}

interface Finding {
  /** 位置：文件路径加行号，或文档小节名。 */
  where: string;
  /** 一句话：问题是什么。 */
  what: string;
  /** 依据：读到的代码，或复核员的结论。 */
  evidence: string;
  /** verified 表示独立复核确认；unconfirmed 表示复核没能确认或没有复核。 */
  status: "verified" | "unconfirmed";
  /** 严重程度；high 只用于数据丢失、崩溃或结果错误。 */
  severity: "low" | "medium" | "high";
}

interface GateDecision {
  /** true 表示同意继续；false 表示停止。 */
  approved: boolean;
  /** 用户的修改意见或停止原因；同意时为空字符串。 */
  feedback: string;
}

interface Remedy {
  /** true 表示问题已处理，可以继续；false 表示就此停止。 */
  proceed: boolean;
  /** 处理方式或停止原因，一句话。 */
  note: string;
}

interface PrInfo {
  number: number;
  /** MERGEABLE、CONFLICTING 或 UNKNOWN。 */
  mergeable: string;
  /** CLEAN、BLOCKED、UNSTABLE 等。 */
  mergeStateStatus: string;
  /** PR 分支当前最新的提交。 */
  headRefOid: string;
  /** OPEN、MERGED 或 CLOSED。 */
  state: string;
  /** PR 正文。 */
  body: string;
  /** PR 网址。 */
  url: string;
}

interface PkgInfo {
  name: string;
  version: string;
}

interface VersionList {
  /** 各版本的列表，最新的在前。 */
  versions?: { version: string }[];
}

interface RunList {
  /** 最近一次运行的编号。 */
  databaseId?: number;
}

interface UrlList {
  url: string;
}

interface FinalReport {
  /** 两三句话：这次做到了哪一步，结果如何。 */
  conclusion: string;
  findings: Finding[];
  /** 这次实际跑过并起了决定作用的检查。 */
  verified: string[];
  /** 没有检查到的部分及原因。 */
  notCovered: string[];
  /** 停在哪个环节。 */
  stoppedAt: string;
  issueNumber: string;
  branch: string;
  prUrl: string;
  releaseTag: string;
  /** 需要写入长期记忆或知识库的经验教训。 */
  lessons: Lesson[];
}

/* ---------- 工具函数 ---------- */

function tailOf(result: WorldRunResult, max: number): string {
  return `${result.stdout}\n${result.stderr}`.trim().slice(-max);
}

/** 从 gh issue create 的输出（Issue 网址）里取 Issue 号；没有则为空字符串。 */
function issueNumberIn(text: string): string {
  const match = text.match(/\/issues\/(\d+)/);
  return match === null ? "" : match[1];
}

/** 解析 git rev-list --left-right --count 的输出：“本地领先数 远端领先数”。 */
function parseAheadBehind(text: string): { ahead: number; behind: number } {
  const parts = text.trim().split(/\s+/);
  const ahead = Number(parts[0]);
  const behind = Number(parts[1]);
  return { ahead: Number.isNaN(ahead) ? 0 : ahead, behind: Number.isNaN(behind) ? 0 : behind };
}

/** 比较两个版本号：a 大返回 1，小返回 -1，相等返回 0。 */
function compareVersions(a: string, b: string): number {
  const left = a.replace(/^v/, "").split(".").map(Number);
  const right = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i] < right[i] ? -1 : 1;
  }
  return 0;
}

/** 是否是可以逐行评审的文本文件。 */
function isCodeFile(path: string): boolean {
  return /\.(ts|tsx|js|mjs|cjs|json|html|css|scss|sql|ya?ml|sh|ps1)$/.test(path) && !/package-lock\.json$/.test(path);
}

/** 安装包里是否有一个满足要求的条目。入参是已转成小写的条目；要求以星号结尾时，以此开头即可。 */
function entryPresent(loweredEntries: string[], needed: string): boolean {
  const wanted = needed.toLowerCase();
  return wanted.endsWith("*")
    ? loweredEntries.some((entry) => entry.startsWith(wanted.slice(0, -1)))
    : loweredEntries.indexOf(wanted) >= 0;
}

/** 从 gh pr list --json url 的输出里取第一个网址；没有则为空字符串。 */
function firstUrl(text: string): string {
  const list = JSON.parse(text) as UrlList[];
  return list.length > 0 ? list[0].url : "";
}

/** 从 gh run list --json databaseId 的输出里取最近一次运行的编号；没有则为空字符串。 */
function latestRunId(text: string): string {
  const list = JSON.parse(text) as RunList[];
  return list.length > 0 && list[0].databaseId !== undefined ? String(list[0].databaseId) : "";
}

/** 从插件市场的查询结果里取最新版本号；查不到则为空字符串。 */
function marketVersionOf(text: string): string {
  const parsed = JSON.parse(text) as VersionList;
  return parsed.versions !== undefined && parsed.versions.length > 0 ? parsed.versions[0].version : "";
}

/* ---------- 运行中累积的记录 ---------- */

const findings: Finding[] = [];
const verified: string[] = [];
const notCovered: string[] = [];
const lessons: Lesson[] = [];
/** 运行中遇到的意外及处理方式，复盘时用。 */
const incidents: string[] = [];
let repoLabel = "";
let issueNumber = "";
let branch = "";
let prUrl = "";
let releaseTag = "";
let stoppedAt = "";

artifact.table("stages", {
  title: "各阶段进度",
  columns: [
    { field: "stage", label: "阶段" },
    { field: "status", label: "状态" },
    { field: "detail", label: "说明" },
  ],
  key: "stage",
});

artifact.table("findings", {
  title: "评审发现的问题",
  columns: [
    { field: "where", label: "位置" },
    { field: "severity", label: "严重程度" },
    { field: "what", label: "问题" },
    { field: "status", label: "复核结果" },
  ],
  key: "id",
});

function setStage(stage: string, status: string, detail: string): void {
  report({ stage, status, detail }, "stages");
}

/** 记录一条评审发现：独立复核之后，标记它是“已确认”还是“未能确认”。 */
function recordFinding(id: string, finding: ReviewComment, confirmation: Confirmation): void {
  const entry: Finding = {
    where: finding.where,
    what: finding.problem,
    evidence: confirmation.evidence,
    status: confirmation.confirmed ? "verified" : "unconfirmed",
    severity: finding.severity,
  };
  findings.push(entry);
  report({ id, where: entry.where, severity: entry.severity, what: entry.what, status: confirmation.confirmed ? "已确认" : "未能确认" }, "findings");
}

function buildReportMarkdown(): string {
  const lines: string[] = [
    "# 开发与发布报告",
    "",
    `- 仓库：${repoLabel === "" ? "（未确定）" : repoLabel}`,
    `- Issue：${issueNumber === "" ? "（无）" : `#${issueNumber}`}`,
    `- 分支：${branch === "" ? "（无）" : branch}`,
    `- PR：${prUrl === "" ? "（无）" : prUrl}`,
    `- 发布版本：${releaseTag === "" ? "（无）" : releaseTag}`,
    `- 停在：${stoppedAt}`,
    "",
    "## 起了决定作用的检查",
    "",
    ...(verified.length === 0 ? ["（无）"] : verified.map((item) => `- ${item}`)),
    "",
    "## 评审发现的问题",
    "",
    ...(findings.length === 0 ? ["（无）"] : findings.map((item) => `- [${item.severity}][${item.status === "verified" ? "已确认" : "未能确认"}] ${item.where}：${item.what}`)),
    "",
    "## 没有检查到的部分",
    "",
    ...(notCovered.length === 0 ? ["（无）"] : notCovered.map((item) => `- ${item}`)),
    "",
    "## 运行中的意外",
    "",
    ...(incidents.length === 0 ? ["（无）"] : incidents.map((item) => `- ${item}`)),
    "",
    "## 经验教训",
    "",
    ...(lessons.length === 0 ? ["（无）"] : lessons.map((item) => `- [${item.target === "memory" ? "长期记忆" : "知识库"}] ${item.lesson}`)),
  ];
  return lines.join("\n");
}

async function finish(reason: string): Promise<FinalReport> {
  stoppedAt = reason;
  try {
    await artifact.markdown("report", buildReportMarkdown(), {
      title: "开发与发布报告",
      description: "需求、方案、评审、测试证据、合并与发布结果，以及本次的经验教训。",
      primary: true,
    });
  } catch {
    log("报告卡片没有发布成功，结果仍然在返回值里。");
  }
  return { conclusion: reason, findings, verified, notCovered, stoppedAt, issueNumber, branch, prUrl, releaseTag, lessons };
}

/* ---------- 读取参数 ---------- */

const repoKey = String(args.repo ?? "").trim();
const issueInput = String(args.issue ?? "").trim();
const stopAfter = String(args.stopAfter ?? "发版");

if (!PROFILES[repoKey]) {
  return await finish(`没有名为“${repoKey}”的仓库配置。可选：${Object.keys(PROFILES).join("、")}。`);
}
const profile = PROFILES[repoKey];
repoLabel = `${profile.githubRepo}（本地 ${profile.localDir}）`;
if (issueInput === "") {
  return await finish("没有提供 Issue：请给出 Issue 号，或者一段需求描述。");
}
if (STOPS.indexOf(stopAfter) < 0) {
  return await finish(`stopAfter 只能是 ${STOPS.join("、")} 之一。`);
}
const dir = profile.localDir;
const ghRepo = profile.githubRepo;
const rules = profile.ruleFiles.map((file) => `${dir}/${file}`).join("、");
const fastChecks = [...profile.fastScripts, ...profile.unitScripts];
const PR_FIELDS = "number,mergeable,mergeStateStatus,headRefOid,state,body,url";

/* ==========================================================================
 * 1. 读取或创建需求 Issue
 * ========================================================================== */

phase("读取或创建需求 Issue");
setStage("读取或创建需求 Issue", "进行中", "");

// 找到 npm 本体；之后一律用 node 运行它。
const npmCli = (await world.run("node", ["-p", "require('path').join(process.execPath, '..', 'node_modules', 'npm', 'bin', 'npm-cli.js')"])).stdout.trim();

const clerk = agent("需求记录员", "你负责把零散的需求信息整理成规范的 GitHub Issue，并判断需求类型。只做整理和判断，不修改任何代码。如果原始信息不足以形成可执行的 Issue，直接说明缺什么，不要自行编造。如果要求互相矛盾，直接说明并上报。");

let issueTitle = "";
let issueBody = "";
let issueKind: IssueDraft["kind"] = "feat";
let issueSlug = "";

if (/^\d+$/.test(issueInput)) {
  const viewed = await world.run("gh", ["issue", "view", issueInput, "--repo", ghRepo, "--json", "number,title,body,state"]);
  if (viewed.exitCode !== 0) {
    return await finish(`读取 Issue #${issueInput} 失败：${tailOf(viewed, 500)}`);
  }
  const info = JSON.parse(viewed.stdout) as IssueInfo;
  if (info.state !== "OPEN") {
    return await finish(`Issue #${info.number} 当前是 ${info.state}，不是待处理状态，已停止。`);
  }
  issueNumber = String(info.number);
  issueTitle = info.title;
  issueBody = info.body;
  const triage = await clerk.ask<IssueDraft>(`下面是 ${ghRepo} 仓库里一个已有的 Issue，请判断它的需求类型并给出分支名用的英文 slug。\n\n标题：${info.title}\n\n正文：${info.body}\n\n只返回 kind 和 slug；title 和 body 原样带回。`);
  issueKind = triage.kind;
  issueSlug = triage.slug;
} else {
  const draft = await clerk.ask<IssueDraft>(`用户给了这样一段需求，请整理成一个可以执行的 GitHub Issue（仓库：${ghRepo}）。全部用简体中文。\n\n需求原话：${issueInput}\n\n如果这段话里有含糊到无法执行的地方，在正文里单列“待确认”一节。`);
  const created = await world.run("gh", ["issue", "create", "--repo", ghRepo, "--title", draft.title, "--body", draft.body]);
  if (created.exitCode !== 0) {
    return await finish(`创建 Issue 失败：${tailOf(created, 500)}`);
  }
  issueNumber = issueNumberIn(created.stdout);
  issueTitle = draft.title;
  issueBody = draft.body;
  issueKind = draft.kind;
  issueSlug = draft.slug;
  log(`已创建 Issue #${issueNumber}：${issueTitle}`);
}

const safeSlug = issueSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
const slugPart = safeSlug === "" ? "" : `-${safeSlug}`;
branch = profile.gitFlow === "issue-flow" ? `issue-${issueNumber}${slugPart}` : `${issueKind}/issue-${issueNumber}${slugPart}`;
setStage("读取或创建需求 Issue", "已完成", `Issue #${issueNumber} ${issueTitle}`);

/* ==========================================================================
 * 2. 拉取最新代码并创建分支
 * ========================================================================== */

phase("拉取最新代码并创建分支");
setStage("拉取最新代码并创建分支", "进行中", "");

const dirty = await world.run("git", ["-C", dir, "status", "--porcelain"]);
if (dirty.exitCode !== 0) {
  return await finish(`无法读取本地仓库 ${dir} 的状态：${tailOf(dirty, 500)}`);
}
const dirtyLines = dirty.stdout.split("\n").filter((line) => line.trim().length > 0);
if (dirtyLines.length > 0) {
  const remedy = await hole<Remedy>(
    "未提交的改动怎么处理",
    `本地仓库 ${dir} 有 ${dirtyLines.length} 个未提交的改动。流程不会自动暂存或丢弃它们。\n\n${dirtyLines.slice(0, 40).join("\n")}`,
  );
  if (!remedy.proceed) {
    return await finish(`本地仓库有未提交的改动，已按要求停止：${remedy.note}`);
  }
  incidents.push(`本地仓库有 ${dirtyLines.length} 个未提交的改动：${remedy.note}`);
}

const fetched = await world.run("git", ["-C", dir, "fetch", "origin"]);
if (fetched.exitCode !== 0) {
  const remedy = await hole<Remedy>("拉取最新代码失败怎么办", `在 ${dir} 执行 git fetch origin 失败：\n${tailOf(fetched, 1500)}`);
  if (!remedy.proceed) {
    return await finish(`拉取最新代码失败，已按要求停止：${remedy.note}`);
  }
  incidents.push(`git fetch 失败：${remedy.note}`);
}

const counts = await world.run("git", ["-C", dir, "rev-list", "--left-right", "--count", "main...origin/main"]);
const divergence = parseAheadBehind(counts.stdout);
if (divergence.ahead > 0) {
  const remedy = await hole<Remedy>(
    "本地 main 领先远端怎么办",
    `本地 main 比 origin/main 多 ${divergence.ahead} 个提交（远端比本地多 ${divergence.behind} 个）。从这里切分支会把未推送的提交一起带出去，流程不会自行决定怎么处理。`,
  );
  if (!remedy.proceed) {
    return await finish(`本地 main 领先远端，已按要求停止：${remedy.note}`);
  }
  incidents.push(`本地 main 领先远端 ${divergence.ahead} 个提交：${remedy.note}`);
}

let branchError = "";
if (profile.gitFlow === "issue-flow") {
  // 仓库规则：分支必须由 issue-flow.sh 创建（gh issue develop），不能手工 git checkout -b。
  const startArgs = safeSlug === "" ? ["start", issueNumber] : ["start", issueNumber, safeSlug];
  const started = await issueFlow(dir, startArgs, 600_000);
  if (started.exitCode !== 0) branchError = tailOf(started, 600);
} else {
  const toMain = await world.run("git", ["-C", dir, "switch", "main"]);
  if (toMain.exitCode !== 0) {
    branchError = tailOf(toMain, 600);
  } else {
    const synced = await world.run("git", ["-C", dir, "pull", "--ff-only", "origin", "main"]);
    if (synced.exitCode !== 0) {
      branchError = tailOf(synced, 600);
    } else {
      const createdBranch = await world.run("git", ["-C", dir, "switch", "-c", branch]);
      if (createdBranch.exitCode !== 0) branchError = tailOf(createdBranch, 600);
    }
  }
}

const currentBranch = (await world.run("git", ["-C", dir, "branch", "--show-current"])).stdout.trim();
if (branchError !== "" || currentBranch !== branch) {
  const remedy = await hole<Remedy>(
    "创建分支失败怎么办",
    `在 ${dir} 创建分支 ${branch} 没有成功，当前分支是“${currentBranch}”。命令输出：\n${branchError === "" ? "（无）" : branchError}`,
  );
  if (!remedy.proceed) {
    return await finish(`创建分支失败，已按要求停止：${remedy.note}`);
  }
  incidents.push(`创建分支失败：${remedy.note}`);
}
setStage("拉取最新代码并创建分支", "已完成", branch);

/* ==========================================================================
 * 3. 记录改动前的测试基线
 * ========================================================================== */

phase("记录改动前的测试基线");
setStage("记录改动前的测试基线", "进行中", "");
log(`在分支 ${branch} 上先跑一遍现有检查，作为基线`);

const baselineFailures: string[] = [];
const baselinePassed: string[] = [];
for (const script of fastChecks) {
  const result = await npmScript(npmCli, dir, script, 900_000);
  if (result.exitCode === 0) {
    baselinePassed.push(`npm run ${script}`);
  } else {
    baselineFailures.push(`npm run ${script}（退出码 ${result.exitCode}）\n${tailOf(result, 5000)}`);
  }
}
if (baselineFailures.length > 0) {
  const remedy = await hole<Remedy>("改动前的基线就没有通过怎么办", `还没改代码，这些检查就没有通过：\n\n${baselineFailures.join("\n\n")}`);
  if (!remedy.proceed) {
    return await finish(`改动前的基线就没有通过，已按要求停止：${remedy.note}`);
  }
  incidents.push(`改动前基线未通过：${remedy.note}`);
} else {
  verified.push(`改动前基线通过：${baselinePassed.join("、")}`);
}
setStage("记录改动前的测试基线", "已完成", baselineFailures.length === 0 ? "全部通过" : "有未通过项，已处理");

/* ==========================================================================
 * 4. 理解需求
 * ========================================================================== */

phase("理解需求");
setStage("理解需求", "进行中", "");

const analyst = agent("需求分析师", "你是资深需求分析师。你读 Issue 和相关代码，把需求写成开发和测试都能照着做的说明：范围清楚、验收标准可验证、疑问单列。只读代码，不修改任何文件。遇到自相矛盾或无法判断的地方直接说明并上报，不要猜测。");

const requirement = await analyst.ask<RequirementDoc>(
  `仓库目录：${dir}。开工前先读这些协作规则：${rules}。全部用简体中文回答。\n\n请理解 Issue #${issueNumber} 的需求并给出需求说明。\n\n标题：${issueTitle}\n\n正文：${issueBody}\n\n要求：验收标准必须逐条可验证；把 Issue 里没说清、需要用户决定的问题放进 openQuestions，不要替用户做决定。`,
);

const requirementGate = await hole<GateDecision>(
  "确认需求",
  `请用户确认 Issue #${issueNumber} 的需求：\n${JSON.stringify(requirement)}`,
);
if (!requirementGate.approved) {
  return await finish(`需求没有得到确认：${requirementGate.feedback}`);
}
if (requirementGate.feedback !== "") incidents.push(`需求确认时的意见：${requirementGate.feedback}`);

// 把确认后的需求写回 Issue，留一条可追溯的记录。
const requirementComment = [
  "## 确认后的需求",
  "",
  requirement.summary,
  "",
  "### 范围内",
  ...requirement.inScope.map((item) => `- ${item}`),
  "",
  "### 范围外",
  ...requirement.outOfScope.map((item) => `- ${item}`),
  "",
  "### 验收标准",
  ...requirement.acceptanceCriteria.map((item) => `- ${item}`),
].join("\n");
await world.run("gh", ["issue", "comment", issueNumber, "--repo", ghRepo, "--body", requirementComment]);
setStage("理解需求", "已完成", requirement.summary);

if (reached(stopAfter, "需求")) {
  return await finish(`已按 stopAfter=${stopAfter} 停在“确认需求”之后。分支 ${branch} 已创建，没有改动任何代码。`);
}

/* ==========================================================================
 * 5. 设计测试用例与技术方案（两件事互不依赖，同时进行，各自有人复核）
 * ========================================================================== */

const testDesignWork = future(async () => {
  phase("设计测试用例");
  setStage("设计测试用例", "进行中", "");
  const designer = agent("测试设计师", "你是资深测试设计师。你根据确认后的需求设计测试用例，覆盖正常路径、边界和回归风险，并把用例写进仓库的文档。你只写测试用例文档，不修改源码和测试代码。如果需求本身无法验证，直接说明并上报。");
  let cases = await designer.ask<TestCaseSet>(
    `仓库目录：${dir}。先读协作规则：${rules}。全部用简体中文。\n\n请为下面的需求设计测试用例，并把用例文档写进仓库（放在仓库文档目录下，文件名包含 issue-${issueNumber}；不要提交 git）。\n\n需求：${JSON.stringify(requirement)}\n\n每条验收标准至少有一条用例覆盖；标明每条用例落在哪个测试文件。`,
  );
  const reviewer = agent("测试用例评审员", "你是测试负责人，专门找测试设计的漏洞：漏掉的场景、不可验证的预期结果、没有覆盖到的验收标准。只读文档，不修改任何文件。认为没有问题时，必须说明你核对过哪些验收标准。");
  for (let round = 1; round <= 3; round++) {
    const review = await reviewer.ask<DocReview>(
      `第 ${round} 轮。请挑这份测试用例文档的毛病：${cases.file}（仓库目录 ${dir}）。对应的需求：${JSON.stringify(requirement)}。\n\n要回答的是：哪些场景没覆盖？哪些预期结果没法验证？不要回答“看起来不错”。`,
    );
    if (review.approved) break;
    log(`测试用例第 ${round} 轮评审提出 ${review.mustFix.length} 个必须修改的问题`);
    cases = await designer.ask<TestCaseSet>(`评审提出了必须修改的问题，请修订用例文档并返回更新后的结果：${JSON.stringify(review.mustFix)}`);
  }
  const finalRead = await agent("独立复审员·测试用例", "你是第一次看到这份测试用例文档的测试负责人。只凭文档本身判断它是否清楚、完整、可执行。只读，不修改任何文件。").ask<DocReview>(
    `请独立复审测试用例文档 ${cases.file}（仓库目录 ${dir}），对应的需求：${JSON.stringify(requirement)}。还有哪些验收标准没被覆盖，或哪些用例无法执行？`,
  );
  if (!finalRead.approved) {
    cases = await designer.ask<TestCaseSet>(`独立复审提出了必须修改的问题，请最后修订一次：${JSON.stringify(finalRead.mustFix)}`);
  }
  setStage("设计测试用例", "已完成", `${cases.cases.length} 条用例，文档 ${cases.file}`);
  return cases;
});

const techDesignWork = future(async () => {
  phase("设计技术方案");
  setStage("设计技术方案", "进行中", "");
  const architect = agent("技术方案设计师", "你是资深架构师。你读需求和相关代码，写出与仓库现有结构一致的技术方案。只写方案文档，不修改源码。如果需求在现有代码下无法实现或代价明显不合理，直接说明，不要硬凑方案。");
  let plan = await architect.ask<TechPlan>(
    `仓库目录：${dir}。先读协作规则：${rules}。全部用简体中文。\n\n请为下面的需求写技术方案，并把方案文档写进仓库（放在仓库文档目录下，文件名包含 issue-${issueNumber}；不要提交 git）。\n\n需求：${JSON.stringify(requirement)}\n\n方案必须基于你亲自读过的代码；把需要用户拍板的取舍放进 decisions。`,
  );
  const reviewer = agent("方案评审员", "你是资深架构评审。你要找出方案里会出问题的地方：遗漏的调用点、兼容性、性能、测试可行性。必须亲自读方案涉及的代码再下结论。只读，不修改任何文件。认为没有问题时，必须列出你核对过的文件。");
  for (let round = 1; round <= 3; round++) {
    const review = await reviewer.ask<DocReview>(
      `第 ${round} 轮。请挑这份技术方案的毛病：${plan.file}（仓库目录 ${dir}）。对应的需求：${JSON.stringify(requirement)}。\n\n先读方案涉及的代码，再回答：什么情况下这个方案会出错或行不通？`,
    );
    if (review.approved) break;
    log(`技术方案第 ${round} 轮评审提出 ${review.mustFix.length} 个必须修改的问题`);
    plan = await architect.ask<TechPlan>(`评审提出了必须修改的问题，请修订方案并返回更新后的结果：${JSON.stringify(review.mustFix)}`);
  }
  const finalRead = await agent("独立复审员·技术方案", "你是第一次看到这份技术方案的资深架构师。必须亲自读方案涉及的代码，判断方案是否成立。只读，不修改任何文件。").ask<DocReview>(
    `请独立复审技术方案 ${plan.file}（仓库目录 ${dir}），对应的需求：${JSON.stringify(requirement)}。读完相关代码后回答：这个方案哪里站不住脚？`,
  );
  if (!finalRead.approved) {
    plan = await architect.ask<TechPlan>(`独立复审提出了必须修改的问题，请最后修订一次：${JSON.stringify(finalRead.mustFix)}`);
  }
  setStage("设计技术方案", "已完成", plan.file);
  return plan;
});

// 汇合：确认节点需要同时看到测试用例和技术方案。
const [testCases, techPlan] = await Promise.all([testDesignWork, techDesignWork]);

const designGate = await hole<GateDecision>(
  "确认测试用例和技术方案",
  `请用户确认 Issue #${issueNumber} 的测试用例和技术方案。\n\n测试用例（${testCases.cases.length} 条，文档 ${testCases.file}）：${JSON.stringify(testCases)}\n\n技术方案（文档 ${techPlan.file}）：${JSON.stringify(techPlan)}`,
);
if (!designGate.approved) {
  return await finish(`测试用例和技术方案没有得到确认：${designGate.feedback}`);
}
if (designGate.feedback !== "") incidents.push(`方案确认时的意见：${designGate.feedback}`);

if (reached(stopAfter, "方案")) {
  return await finish(`已按 stopAfter=${stopAfter} 停在“确认方案”之后。用例文档 ${testCases.file}、方案文档 ${techPlan.file} 已写入分支 ${branch}，没有改动源码。`);
}

/* ==========================================================================
 * 6. 开发代码
 * ========================================================================== */

phase("开发代码");
setStage("开发代码", "进行中", "");

const developer = agent("开发工程师", "你是这个 VS Code 扩展项目的资深开发工程师，按确认的需求、测试用例和技术方案实现代码和测试。严格遵守仓库的协作规则。不要 git add、commit、push、建 PR，这些由流程统一处理；禁止 git add -A。如果要求互相矛盾、检查不可能通过、或方案行不通，直接说明并上报，不要绕过或伪造结果。");

let dev = await developer.ask<DevResult>(
  `仓库目录：${dir}，当前分支 ${branch}。先读协作规则：${rules}。全部用简体中文，注释和文档也用中文。\n\n请按方案实现需求，并为新的测试用例补上自动化测试。\n\n需求：${JSON.stringify(requirement)}\n\n测试用例：${JSON.stringify(testCases)}\n\n技术方案：${JSON.stringify(techPlan)}\n\n只改与本需求有关的文件。流程会在你之后运行检查和完整回归，你只需要运行快速检查自检，不要自己跑完整回归。`,
);

let devChecksOk = false;
let devFailures: string[] = [];
for (let round = 1; round <= 5; round++) {
  devFailures = [];
  const devPassed: string[] = [];
  for (const script of fastChecks) {
    const result = await npmScript(npmCli, dir, script, 900_000);
    if (result.exitCode === 0) {
      devPassed.push(`npm run ${script}`);
    } else {
      devFailures.push(`npm run ${script}（退出码 ${result.exitCode}）\n${tailOf(result, 6000)}`);
    }
  }
  if (devFailures.length === 0) {
    devChecksOk = true;
    verified.push(`开发后快速检查通过：${devPassed.join("、")}`);
    break;
  }
  log(`开发后第 ${round} 轮检查有 ${devFailures.length} 项没有通过，交回开发`);
  if (round < 5) {
    dev = await developer.ask<DevResult>(`这些检查没有通过，请修复后返回更新后的结果：\n\n${devFailures.join("\n\n")}`);
  }
}
if (!devChecksOk) {
  const remedy = await hole<Remedy>("开发后的检查始终没有通过怎么办", `开发工程师修了 5 轮，快速检查仍然没有通过：\n\n${devFailures.join("\n\n")}`);
  if (!remedy.proceed) {
    return await finish(`开发后的检查始终没有通过，已按要求停止：${remedy.note}`);
  }
  incidents.push(`开发后检查 5 轮未通过：${remedy.note}`);
}
setStage("开发代码", "已完成", dev.summary.join("；"));

/* ==========================================================================
 * 7. 代码评审
 * ========================================================================== */

phase("代码评审");
setStage("代码评审", "进行中", "");

// 相对 origin/main 的全部改动，加上尚未纳入 git 的文件。
const changedTracked = await world.run("git", ["-C", dir, "diff", "--name-only", "-z", "origin/main"]);
const untracked = await world.run("git", ["-C", dir, "ls-files", "--others", "--exclude-standard", "-z"]);
const changedPaths = Array.from(new Set([...changedTracked.stdout.split("\0"), ...untracked.stdout.split("\0")].filter((path) => path.length > 0)));
const codeFiles = changedPaths.filter(isCodeFile);
const reviewedFiles = codeFiles.slice(0, 20);

log(`共 ${changedPaths.length} 个改动文件，其中 ${reviewedFiles.length} 个代码文件逐个评审`);

// 每个文件一位评审员；每个问题紧跟一位独立复核员，复核随该文件的评审结束立即开始。
const fileReviews = Promise.all(
  reviewedFiles.map(async (file) => {
    const review = await agent(`代码评审员·${file}`, "你是严格的代码评审员，只负责一个文件。找出真实的缺陷：逻辑错误、边界遗漏、错误处理缺失、与需求不符。不要提风格偏好。只读，不修改任何文件。").ask<CodeReview>(
      `请评审 ${ghRepo} 仓库里文件 ${file} 相对 origin/main 的改动（仓库目录 ${dir}，当前分支 ${branch}）。这份改动要实现的需求：${JSON.stringify(requirement)}。\n\n先看这个文件的 diff，再读它周围的代码。只报告真实存在的问题，每条写明位置和一句话的问题。`,
    );
    const confirmations = await Promise.all(
      review.findings.map((finding, index) =>
        agent(`问题复核员·${file}·${index + 1}`, "你是独立复核员。只凭给你的问题和证据，亲自读代码或运行检查，判断问题是否真实存在。只读，不修改任何文件。").ask<Confirmation>(
          `请独立复核这个问题是否真实存在（仓库目录 ${dir}，当前分支 ${branch}）：${JSON.stringify(finding)}\n\n亲自读相关代码；只有自己确认了才返回 confirmed=true，并写明依据。`,
        ),
      ),
    );
    return review.findings.map((finding, index) => ({ id: `${file}#${index + 1}`, finding, confirmation: confirmations[index] }));
  }),
);

const holisticReview = (async () => {
  const review = await agent("整体评审员", "你是负责整体质量的代码评审员，关注跨文件的配合：接口是否对齐、调用方是否都更新、有没有遗漏的入口。只读，不修改任何文件。").ask<CodeReview>(
    `请在仓库目录 ${dir}（当前分支 ${branch}）运行 git diff origin/main 查看全部改动，从整体上找问题。要实现的需求：${JSON.stringify(requirement)}；技术方案：${JSON.stringify(techPlan)}。\n\n回答：跨文件的配合哪里会出问题？有没有哪个入口被漏掉？`,
  );
  const confirmations = await Promise.all(
    review.findings.map((finding, index) =>
      agent(`整体问题复核员·${index + 1}`, "你是独立复核员。只凭给你的问题和证据，亲自读代码或运行检查，判断问题是否真实存在。只读，不修改任何文件。").ask<Confirmation>(
        `请独立复核这个问题是否真实存在（仓库目录 ${dir}，当前分支 ${branch}）：${JSON.stringify(finding)}\n\n亲自读相关代码；只有自己确认了才返回 confirmed=true，并写明依据。`,
      ),
    ),
  );
  return review.findings.map((finding, index) => ({ id: `整体#${index + 1}`, finding, confirmation: confirmations[index] }));
})();

const securityReview = (async () => {
  const review = await agent("安全评审员", "你是安全评审员：找凭据泄漏、注入、不安全的输入处理、越权、数据丢失风险。只读，不修改任何文件。").ask<CodeReview>(
    `请在仓库目录 ${dir}（当前分支 ${branch}）运行 git diff origin/main 查看全部改动，从安全角度找问题。\n\n回答：有没有凭据或密钥被写进代码？有没有不安全的输入处理、注入、越权或数据丢失风险？`,
  );
  const confirmations = await Promise.all(
    review.findings.map((finding, index) =>
      agent(`安全问题复核员·${index + 1}`, "你是独立复核员。只凭给你的问题和证据，亲自读代码或运行检查，判断问题是否真实存在。只读，不修改任何文件。").ask<Confirmation>(
        `请独立复核这个安全问题是否真实存在（仓库目录 ${dir}，当前分支 ${branch}）：${JSON.stringify(finding)}\n\n亲自读相关代码；只有自己确认了才返回 confirmed=true，并写明依据。`,
      ),
    ),
  );
  return review.findings.map((finding, index) => ({ id: `安全#${index + 1}`, finding, confirmation: confirmations[index] }));
})();

// 汇合：开发工程师需要一次拿到全部已确认的问题。
const [fileFindings, holisticFindings, securityFindings] = await Promise.all([fileReviews, holisticReview, securityReview]);
const allFindings = [...fileFindings.flat(), ...holisticFindings, ...securityFindings];
for (const item of allFindings) {
  recordFinding(item.id, item.finding, item.confirmation);
}
const mustFix = allFindings.filter((item) => item.confirmation.confirmed && item.finding.severity !== "low");
if (codeFiles.length > reviewedFiles.length) {
  notCovered.push(`${codeFiles.length - reviewedFiles.length} 个代码文件超出逐个评审的上限（20 个），只被整体评审覆盖`);
}
log(`评审共发现 ${allFindings.length} 个问题，其中 ${mustFix.length} 个已确认且需要修改`);

if (mustFix.length > 0) {
  const fixList = JSON.stringify(mustFix.map((item) => ({ where: item.finding.where, problem: item.finding.problem })));
  await developer.ask<DevResult>(`代码评审确认了以下问题，请逐条修复，不要改动无关代码：\n\n${fixList}`);
  const recheck = await agent("修复复查员", "你是修复复查员，核对评审确认的问题是否都被正确修复，且没有引入新问题。只读，不修改任何文件。").ask<CodeReview>(
    `请在仓库目录 ${dir}（当前分支 ${branch}）核对这些问题是否都已被正确修复，并且修复没有引入新问题：${fixList}\n\n只报告仍然存在或新出现的问题。`,
  );
  if (recheck.findings.length > 0) {
    await developer.ask<DevResult>(`复查发现问题没有被完全修好，请再修一次：${JSON.stringify(recheck.findings)}`);
    incidents.push(`评审问题的修复经复查后仍需二次修正：${recheck.findings.length} 条`);
  }
  for (const script of fastChecks) {
    const result = await npmScript(npmCli, dir, script, 900_000);
    if (result.exitCode !== 0) {
      return await finish(`修复评审问题后 npm run ${script} 没有通过：${tailOf(result, 2000)}`);
    }
  }
  verified.push("修复评审问题后快速检查通过");
}
setStage("代码评审", "已完成", `${allFindings.length} 个问题，${mustFix.length} 个已修复`);

/* ==========================================================================
 * 8. 执行测试与回归
 * ========================================================================== */

phase("执行测试与回归");
setStage("执行测试与回归", "进行中", "");

let regressionOk = false;
let regressionFailures: string[] = [];
for (let round = 1; round <= 3; round++) {
  regressionFailures = [];
  const regressionPassed: string[] = [];
  for (const script of profile.strongScripts) {
    const result = await npmScript(npmCli, dir, script, 3_600_000);
    if (result.exitCode === 0) {
      regressionPassed.push(`npm run ${script}`);
    } else {
      regressionFailures.push(`npm run ${script}（退出码 ${result.exitCode}）\n${tailOf(result, 8000)}`);
    }
  }
  if (regressionFailures.length === 0) {
    regressionOk = true;
    verified.push(`回归通过：${regressionPassed.join("、")}`);
    break;
  }
  log(`回归第 ${round} 轮有 ${regressionFailures.length} 项没有通过，交回开发`);
  if (round < 3) {
    await developer.ask<DevResult>(`回归测试没有通过，请找出原因并修复，不要删除或跳过无关测试：\n\n${regressionFailures.join("\n\n")}`);
  }
}
if (!regressionOk) {
  const remedy = await hole<Remedy>("回归测试没有通过怎么办", `回归测试修了 3 轮仍然没有通过：\n\n${regressionFailures.join("\n\n")}`);
  if (!remedy.proceed) {
    return await finish(`回归测试没有通过，已按要求停止：${remedy.note}`);
  }
  incidents.push(`回归测试 3 轮未通过：${remedy.note}`);
}
setStage("执行测试与回归", "已完成", regressionOk ? "全部通过" : "经处理后继续");

/* ==========================================================================
 * 9. 整理文档
 * ========================================================================== */

phase("整理文档");
setStage("整理文档", "进行中", "");

const docWriter = agent("文档工程师", "你是技术文档工程师，负责让 README、CHANGELOG 和仓库内文档与代码保持一致。只改文档，不改源码；不新增空的或没有信息量的文档。");

const docs = await docWriter.ask<DocResult>(
  `仓库目录：${dir}，当前分支 ${branch}。先读协作规则：${rules}。全部用简体中文。\n\n请根据这次改动更新文档：README 里受影响的功能说明和用法、CHANGELOG 的未发布条目、仓库内其他会因此过时的文档。\n\n本次改动：${JSON.stringify(dev.summary)}\n\n需求：${JSON.stringify(requirement)}\n\n只更新确实受影响的内容；不要改版本号。不要提交 git。`,
);

for (const script of fastChecks) {
  const result = await npmScript(npmCli, dir, script, 900_000);
  if (result.exitCode !== 0) {
    return await finish(`整理文档后 npm run ${script} 没有通过：${tailOf(result, 2000)}`);
  }
}
verified.push("整理文档后快速检查通过");
setStage("整理文档", "已完成", docs.files.length === 0 ? docs.skippedBecause : docs.files.join("、"));

if (reached(stopAfter, "开发")) {
  return await finish(`已按 stopAfter=${stopAfter} 停在“整理文档”之后。改动留在分支 ${branch} 的工作区里，尚未提交。`);
}

/* ==========================================================================
 * 10. 提交并创建 PR
 * ========================================================================== */

phase("提交并创建 PR");
setStage("提交并创建 PR", "进行中", "");

const commitPlan = await developer.ask<CommitPlan>(
  `请为这次改动拟一份提交计划（仓库目录 ${dir}，当前分支 ${branch}，Issue #${issueNumber}）。遵守仓库的提交信息约定：${profile.gitFlow === "issue-flow" ? "格式 <type>: <中文描述>，Issue 关联由脚本自动附加，标题里不要写 Issue 号" : `中文 Conventional Commits；在正文里写一行 Fixes #${issueNumber}`}。\n\npaths 必须逐个列出要提交的文件或目录，不要包含 *.vsix、测试报告等产物。`,
);
if (commitPlan.paths.length === 0 || commitPlan.paths.some((path) => /[\r\n\0]/.test(path) || path.trim() === "" || /\.vsix$/.test(path))) {
  return await finish("提交计划里没有可提交的文件，或含有不允许的路径（空路径、换行或 vsix 文件），已停止。");
}

let committed = false;
let commitError = "";
for (let attempt = 1; attempt <= 3 && !committed; attempt++) {
  const staged = await world.run("git", ["-C", dir, "add", "--", ...commitPlan.paths]);
  if (staged.exitCode !== 0) {
    commitError = tailOf(staged, 500);
    break;
  }
  // 提交信息走参数列表，不经过 shell，所以中文和换行都安全。
  const commitRun = profile.gitFlow === "issue-flow"
    ? await issueFlow(dir, ["commit", commitPlan.subject], 900_000)
    : await world.run("git", ["-C", dir, "commit", "-m", commitPlan.subject, "-m", `${commitPlan.body}${commitPlan.body === "" ? "" : "\n\n"}Refs #${issueNumber}`]);
  committed = commitRun.exitCode === 0;
  if (!committed) {
    commitError = tailOf(commitRun, 1500);
    incidents.push(`提交失败（第 ${attempt} 次）：${commitError}`);
    if (attempt < 3) {
      await developer.ask<DevResult>(`提交没有成功，请根据下面的输出处理后返回（如果是安全门禁拦截，按提示修正代码）：\n\n${commitError}`);
    }
  }
}
if (!committed) {
  const remedy = await hole<Remedy>("提交没有成功怎么办", `提交分支 ${branch} 上的改动没有成功。命令输出：\n${commitError}`);
  if (!remedy.proceed) {
    return await finish(`提交没有成功，已按要求停止：${remedy.note}`);
  }
  incidents.push(`提交遇到问题：${remedy.note}`);
}

const pushed = await world.run("git", ["-C", dir, "push", "-u", "origin", branch], { timeoutMs: 600_000 });
if (pushed.exitCode !== 0) {
  const remedy = await hole<Remedy>("推送分支失败怎么办", `推送 ${branch} 到 origin 失败：\n${tailOf(pushed, 1500)}`);
  if (!remedy.proceed) {
    return await finish(`推送分支失败，已按要求停止：${remedy.note}`);
  }
  incidents.push(`推送分支失败：${remedy.note}`);
}

const prText = await developer.ask<PrText>(
  `请为这次改动拟 PR 的标题和正文（全部简体中文）。正文包含：改了什么、为什么、怎么验证的（列出通过的检查）、更新了哪些文档。\n\n本次改动：${JSON.stringify(dev.summary)}\n\n已通过的检查：${verified.join("；")}`,
);

// 仓库规则：GitBoard 的 PR 必须由 issue-flow.sh 创建，它会再跑一遍 typecheck 和测试，全绿才允许建 PR。
// 其他仓库直接用 gh 创建，正文里带 Closes 关闭 Issue。
const prFailed = profile.gitFlow === "issue-flow"
  ? await issueFlow(dir, ["pr"], 1_800_000)
  : await world.run("gh", ["pr", "create", "--repo", ghRepo, "--base", "main", "--head", branch, "--title", prText.title, "--body", `${prText.body}\n\n---\n\nCloses #${issueNumber}`], { timeoutMs: 600_000 });

prUrl = firstUrl((await world.run("gh", ["pr", "list", "--repo", ghRepo, "--head", branch, "--state", "open", "--json", "url"])).stdout);
if (prUrl === "") {
  const remedy = await hole<Remedy>("创建 PR 没有成功怎么办", `没有找到分支 ${branch} 对应的 PR。命令输出：\n${tailOf(prFailed, 2000)}`);
  if (!remedy.proceed) {
    return await finish(`创建 PR 没有成功，已按要求停止：${remedy.note}`);
  }
  prUrl = firstUrl((await world.run("gh", ["pr", "list", "--repo", ghRepo, "--head", branch, "--state", "open", "--json", "url"])).stdout);
  if (prUrl === "") {
    return await finish(`创建 PR 没有成功，已按要求停止：${remedy.note}`);
  }
  incidents.push(`创建 PR 遇到问题：${remedy.note}`);
}

// issue-flow.sh 生成的正文只有“关联 Issue”和“验证”两节，这里补上完整的说明。
if (profile.gitFlow === "issue-flow") {
  const current = JSON.parse((await world.run("gh", ["pr", "view", prUrl, "--repo", ghRepo, "--json", PR_FIELDS])).stdout) as PrInfo;
  await world.run("gh", ["pr", "edit", String(current.number), "--repo", ghRepo, "--body", `${prText.body}\n\n---\n\n${current.body}`]);
}
verified.push(`PR 已创建：${prUrl}`);
setStage("提交并创建 PR", "已完成", prUrl);

if (reached(stopAfter, "PR")) {
  return await finish(`已按 stopAfter=${stopAfter} 停在“创建 PR”之后。PR：${prUrl}`);
}

/* ==========================================================================
 * 11. 合并 PR 并处理冲突
 * ========================================================================== */

phase("合并 PR 并处理冲突");
setStage("合并 PR 并处理冲突", "进行中", "");

const merger = agent("冲突处理工程师", "你是处理合并冲突的工程师。在仓库里完成与 origin/main 的合并，逐个解决冲突，保持双方改动的意图，完成合并提交。不要 push，由流程统一处理；如果冲突无法安全解决，直接说明并上报。");

let prInfo: PrInfo = { number: 0, mergeable: "UNKNOWN", mergeStateStatus: "UNKNOWN", headRefOid: "", state: "OPEN", body: "", url: prUrl };
for (let round = 1; round <= 3; round++) {
  const infoResult = await world.run("gh", ["pr", "view", prUrl, "--repo", ghRepo, "--json", PR_FIELDS]);
  if (infoResult.exitCode !== 0) {
    return await finish(`读取 PR ${prUrl} 的状态失败：${tailOf(infoResult, 500)}`);
  }
  prInfo = JSON.parse(infoResult.stdout) as PrInfo;
  if (prInfo.mergeable !== "CONFLICTING") break;

  log(`PR 与 main 有冲突，第 ${round} 轮处理`);
  await world.run("git", ["-C", dir, "fetch", "origin", "main"]);
  // 有冲突时 git merge 以非零退出码结束并留下冲突标记，这是预期的。
  await world.run("git", ["-C", dir, "merge", "origin/main"]);
  await merger.ask<DevResult>(`仓库目录 ${dir}，当前分支 ${branch}。刚刚执行了 git merge origin/main，存在冲突。\n\n请逐个解决冲突：保留双方改动的意图，不要为了让冲突消失而丢弃任何一方的代码。解决后对解决的文件执行 git add <文件>，再用 git commit 完成合并提交（使用默认的合并说明）。不要 push。如果某个冲突你无法安全解决，直接说明是哪个文件、为什么。`);

  // 代码发生了改动：再跑一轮回归。
  const afterMergeFailures: string[] = [];
  const afterMergePassed: string[] = [];
  for (const script of profile.strongScripts) {
    const result = await npmScript(npmCli, dir, script, 3_600_000);
    if (result.exitCode === 0) {
      afterMergePassed.push(`npm run ${script}`);
    } else {
      afterMergeFailures.push(`npm run ${script}（退出码 ${result.exitCode}）\n${tailOf(result, 6000)}`);
    }
  }
  if (afterMergeFailures.length > 0) {
    await developer.ask<DevResult>(`解决冲突后回归测试没有通过，请修复：\n\n${afterMergeFailures.join("\n\n")}`);
    for (const script of profile.strongScripts) {
      const result = await npmScript(npmCli, dir, script, 3_600_000);
      if (result.exitCode !== 0) {
        const remedy = await hole<Remedy>("解决冲突后回归没有通过怎么办", `与 main 合并并解决冲突后，npm run ${script} 仍然没有通过：\n${tailOf(result, 4000)}`);
        if (!remedy.proceed) {
          return await finish(`解决冲突后回归没有通过，已按要求停止：${remedy.note}`);
        }
        incidents.push(`解决冲突后回归未通过：${remedy.note}`);
      }
    }
    verified.push(`解决合并冲突并修复后回归通过：${profile.strongScripts.map((script) => `npm run ${script}`).join("、")}`);
  } else {
    verified.push(`解决合并冲突后回归通过：${afterMergePassed.join("、")}`);
  }
  const pushedMerge = await world.run("git", ["-C", dir, "push"], { timeoutMs: 600_000 });
  if (pushedMerge.exitCode !== 0) {
    return await finish(`推送合并结果失败：${tailOf(pushedMerge, 1000)}`);
  }
  incidents.push(`第 ${round} 轮处理了与 main 的合并冲突`);
}
if (prInfo.mergeable !== "MERGEABLE") {
  const remedy = await hole<Remedy>("PR 无法合并怎么办", `PR ${prUrl} 的可合并状态是 ${prInfo.mergeable}（${prInfo.mergeStateStatus}），不是可以合并的状态。`);
  if (!remedy.proceed) {
    return await finish(`PR 无法合并，已按要求停止：${remedy.note}`);
  }
}

const mergeGate = await hole<GateDecision>(
  "确认合并",
  `请用户确认合并 PR ${prUrl}（Issue #${issueNumber}，分支 ${branch}）。已通过的检查：${verified.join("；")}。合并方式：squash，并删除分支。`,
);
if (!mergeGate.approved) {
  return await finish(`合并没有得到确认：${mergeGate.feedback}`);
}

// GitBoard 的仓库规则要求用 issue-flow.sh merge；其他仓库用 gh，并钉住刚才确认过的那个提交。
const mergeRun = profile.gitFlow === "issue-flow"
  ? await issueFlow(dir, ["merge"], 900_000)
  : await world.run("gh", ["pr", "merge", String(prInfo.number), "--repo", ghRepo, "--squash", "--delete-branch", "--match-head-commit", prInfo.headRefOid], { timeoutMs: 900_000 });
const mergedState = JSON.parse((await world.run("gh", ["pr", "view", prUrl, "--repo", ghRepo, "--json", PR_FIELDS])).stdout) as PrInfo;
if (mergeRun.exitCode !== 0 || mergedState.state !== "MERGED") {
  const remedy = await hole<Remedy>("合并没有成功怎么办", `合并 PR ${prUrl} 没有成功（当前状态 ${mergedState.state}）。命令输出：\n${tailOf(mergeRun, 1500)}`);
  if (!remedy.proceed) {
    return await finish(`合并没有成功，已按要求停止：${remedy.note}`);
  }
  incidents.push(`合并遇到问题：${remedy.note}`);
}
verified.push(`PR ${prUrl} 已合并（squash）`);
setStage("合并 PR 并处理冲突", "已完成", prUrl);

/* ==========================================================================
 * 12. 合并后复测
 * ========================================================================== */

phase("合并后复测");
setStage("合并后复测", "进行中", "");

const backToMain = await world.run("git", ["-C", dir, "switch", "main"]);
const pulledMain = backToMain.exitCode === 0 ? await world.run("git", ["-C", dir, "pull", "--ff-only", "origin", "main"]) : backToMain;
if (pulledMain.exitCode !== 0) {
  const remedy = await hole<Remedy>("合并后本地 main 无法快进怎么办", `合并后把本地 main 更新到 origin/main 失败：\n${tailOf(pulledMain, 1500)}\n\n流程不会自动 reset 或丢弃本地提交。`);
  if (!remedy.proceed) {
    return await finish(`合并后本地 main 无法更新，已按要求停止：${remedy.note}`);
  }
  incidents.push(`合并后本地 main 无法快进：${remedy.note}`);
}

// 合并后的 main 与测过的分支内容是否完全一致；不一致才需要再测一轮。
const remoteTree = (await world.run("git", ["-C", dir, "rev-parse", "origin/main^{tree}"])).stdout.trim();
const testedTree = prInfo.headRefOid === "" ? "" : (await world.run("git", ["-C", dir, "rev-parse", `${prInfo.headRefOid}^{tree}`])).stdout.trim();
const retestNeeded = remoteTree !== testedTree;
if (retestNeeded) {
  log("合并后的 main 与测过的分支不完全一致，再跑一轮回归");
  const retestFailures: string[] = [];
  const retestPassed: string[] = [];
  for (const script of profile.strongScripts) {
    const result = await npmScript(npmCli, dir, script, 3_600_000);
    if (result.exitCode === 0) {
      retestPassed.push(`npm run ${script}`);
    } else {
      retestFailures.push(`npm run ${script}（退出码 ${result.exitCode}）\n${tailOf(result, 6000)}`);
    }
  }
  if (retestFailures.length > 0) {
    const remedy = await hole<Remedy>("合并后的复测没有通过怎么办", `合并到 main 后这些检查没有通过：\n\n${retestFailures.join("\n\n")}`);
    if (!remedy.proceed) {
      return await finish(`合并后的复测没有通过，已按要求停止：${remedy.note}`);
    }
    incidents.push(`合并后复测未通过：${remedy.note}`);
  } else {
    verified.push(`合并后在 main 上复测通过：${retestPassed.join("、")}`);
  }
} else {
  verified.push("合并后的 main 与测过的分支内容完全一致，无需重复测试");
}
setStage("合并后复测", "已完成", retestNeeded ? "已重新跑完回归" : "内容与测过的一致");

if (reached(stopAfter, "合并")) {
  return await finish(`已按 stopAfter=${stopAfter} 停在“合并后复测”之后。PR ${prUrl} 已合并，没有打包发布。`);
}

/* ==========================================================================
 * 13. 打包发布
 * ========================================================================== */

phase("打包发布");
setStage("打包发布", "进行中", "");

const pkgInfo = JSON.parse((await world.run("node", [npmCli, "--prefix", dir, "pkg", "get", "name", "version"])).stdout) as PkgInfo;
const marketBefore = marketVersionOf((await world.run("node", [npmCli, "exec", "--yes", "--", "@vscode/vsce@latest", "show", profile.extensionId, "--json"], { timeoutMs: 600_000, output: { tail: 200000 } })).stdout);
if (marketBefore === "") {
  return await finish(`读取插件市场上 ${profile.extensionId} 的最新版本失败，已停止。`);
}

const releaseManager = agent("发版负责人", "你是发版负责人，负责版本号、CHANGELOG 和发版说明。只改版本号、CHANGELOG 和必要文档，不改源码。如果版本号该怎么升不清楚，直接说明并上报。");

// 本地版本不高于市场版本时，先在一个单独的发版分支上把版本号和 CHANGELOG 准备好。
let newVersion = pkgInfo.version;
let releasePrUrl = "";
let releaseTitle = `${pkgInfo.name} ${pkgInfo.version}`;
let releaseNotes = "";
if (compareVersions(pkgInfo.version, marketBefore) > 0) {
  verified.push(`版本号 ${pkgInfo.version} 已高于市场版本 ${marketBefore}，无需再改版本号`);
} else {
  const releasePlan = await releaseManager.ask<ReleasePlan>(
    `仓库目录：${dir}，当前分支 main。先读协作规则：${rules}。全部用简体中文。\n\n请准备发版，但不要 git add、commit、push、建 PR：\n1. 从最新的 main 新建分支（命名见下面的约定）并切换过去；\n2. 按语义升版本号：功能升 minor，修复升 patch；当前 ${pkgInfo.version}，市场最新 ${marketBefore}；同步 package-lock.json 里的版本号；\n3. 按约定更新 CHANGELOG；\n4. 写发版说明。\n\n约定：${profile.releaseConvention}\n\n本次改动：${JSON.stringify(dev.summary)}\n\nIssue：#${issueNumber}`,
  );
  newVersion = releasePlan.version;
  releaseTitle = releasePlan.releaseTitle;
  releaseNotes = releasePlan.releaseNotes;
  if (compareVersions(newVersion, marketBefore) <= 0) {
    return await finish(`发版负责人给出的版本号 ${newVersion} 不高于市场版本 ${marketBefore}，已停止。`);
  }
  const stagedRelease = await world.run("git", ["-C", dir, "add", "--", ...releasePlan.changedFiles]);
  const committedRelease = stagedRelease.exitCode === 0
    ? await world.run("git", ["-C", dir, "commit", "-m", releasePlan.commitSubject, "-m", `Refs #${issueNumber}`])
    : stagedRelease;
  const pushedRelease = committedRelease.exitCode === 0
    ? await world.run("git", ["-C", dir, "push", "-u", "origin", releasePlan.branch], { timeoutMs: 600_000 })
    : committedRelease;
  if (pushedRelease.exitCode !== 0) {
    const remedy = await hole<Remedy>("发版准备没有完成怎么办", `提交或推送发版分支 ${releasePlan.branch} 没有成功：\n${tailOf(pushedRelease, 1500)}`);
    if (!remedy.proceed) {
      return await finish(`发版准备没有完成，已按要求停止：${remedy.note}`);
    }
  }
  const releasePr = await world.run("gh", ["pr", "create", "--repo", ghRepo, "--base", "main", "--head", releasePlan.branch, "--title", releasePlan.commitSubject, "--body", `发版 ${newVersion}。\n\nRefs #${issueNumber}`], { timeoutMs: 600_000 });
  releasePrUrl = firstUrl((await world.run("gh", ["pr", "list", "--repo", ghRepo, "--head", releasePlan.branch, "--state", "open", "--json", "url"])).stdout);
  if (releasePrUrl === "") {
    const remedy = await hole<Remedy>("发版 PR 没有建成怎么办", `没有找到发版分支 ${releasePlan.branch} 对应的 PR。命令输出：\n${tailOf(releasePr, 1500)}`);
    if (!remedy.proceed) {
      return await finish(`发版 PR 没有建成，已按要求停止：${remedy.note}`);
    }
    releasePrUrl = firstUrl((await world.run("gh", ["pr", "list", "--repo", ghRepo, "--head", releasePlan.branch, "--state", "open", "--json", "url"])).stdout);
    if (releasePrUrl === "") {
      return await finish(`发版 PR 没有建成，已按要求停止：${remedy.note}`);
    }
  }
  // 改了版本号，确认快速检查仍然通过。
  for (const script of fastChecks) {
    const result = await npmScript(npmCli, dir, script, 900_000);
    if (result.exitCode !== 0) {
      return await finish(`改版本号后 npm run ${script} 没有通过：${tailOf(result, 2000)}`);
    }
  }
  verified.push("改版本号后快速检查通过");
}
if (releaseNotes === "") {
  releaseNotes = await releaseManager.ask<string>(`请用简体中文为 ${ghRepo} 的 ${newVersion} 版本写一段简短的发版说明（Markdown 列表，三五条以内），只写这次新增或修复的内容：${JSON.stringify(dev.summary)}\n\n只返回说明正文。`);
}

// 打包并审计，最多三轮：审计不通过就停下来处理，处理后重新打包再查。
let vsixPath = "";
let entryCount = 0;
let auditProblems: string[] = [];
let auditWarnings: string[] = [];
for (let attempt = 1; attempt <= 3; attempt++) {
  const packaged = await npmScript(npmCli, dir, profile.packageScript, 1_800_000);
  if (packaged.exitCode !== 0) {
    const remedy = await hole<Remedy>("打包没有成功怎么办", `第 ${attempt} 次尝试：在 ${dir} 执行 npm run ${profile.packageScript} 没有成功：\n${tailOf(packaged, 3000)}`);
    if (!remedy.proceed) {
      return await finish(`打包没有成功，已按要求停止：${remedy.note}`);
    }
    incidents.push(`打包失败后处理：${remedy.note}`);
    continue;
  }

  // 找到刚打出来的、文件名含新版本号的 vsix（含被 git 忽略的文件）。
  const vsixListed = await world.run("git", ["-C", dir, "ls-files", "-z", "--cached", "--others", "--ignored", "--exclude-standard", "--", "*.vsix"]);
  const vsixCandidates = vsixListed.stdout.split("\0").filter((path) => path.endsWith(".vsix") && path.includes(newVersion));
  const vsixInDir = vsixCandidates.filter((path) => profile.vsixDir === "." ? path.indexOf("/") < 0 : path.startsWith(`${profile.vsixDir}/`));
  const vsixRelative = vsixInDir.length > 0 ? vsixInDir[vsixInDir.length - 1] : vsixCandidates.length > 0 ? vsixCandidates[vsixCandidates.length - 1] : "";
  if (vsixRelative === "") {
    const remedy = await hole<Remedy>("找不到打好的安装包怎么办", `打包命令执行成功，但在 ${dir}/${profile.vsixDir} 下没有找到文件名包含 ${newVersion} 的 vsix。`);
    if (!remedy.proceed) {
      return await finish(`找不到版本 ${newVersion} 的 vsix，已按要求停止：${remedy.note}`);
    }
    continue;
  }
  vsixPath = `${dir}/${vsixRelative}`;

  // 打包审计：看安装包里到底装了什么（条目名统一按小写比较）。
  const entries = (await world.run("tar", ["-tf", vsixPath])).stdout.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
  const lowered = entries.map((entry) => entry.toLowerCase());
  entryCount = entries.length;
  auditProblems = [
    ...profile.packageForbidden.filter((prefix) => lowered.some((entry) => entry.startsWith(prefix.toLowerCase()))).map((prefix) => `不应打包的条目：${prefix}`),
    ...profile.packageRequired.filter((needed) => !entryPresent(lowered, needed)).map((needed) => `缺少必须的条目：${needed}`),
    ...entries.filter((entry) => /[^\x00-\x7F]/.test(entry)).map((entry) => `条目名含非 ASCII 字符（市场会因此发布失败）：${entry}`),
    ...entries.filter((entry) => entry.endsWith(".vsix")).map((entry) => `安装包里又套了安装包：${entry}`),
  ];
  auditWarnings = profile.packageWarn.flatMap((prefix) => entries.filter((entry) => entry.toLowerCase().startsWith(prefix.toLowerCase())));
  if (auditProblems.length === 0) break;
  log(`打包审计发现 ${auditProblems.length} 个问题，第 ${attempt} 次尝试`);
  const remedy = await hole<Remedy>("打包审计没有通过怎么办", `版本 ${newVersion} 的安装包 ${vsixPath} 审计发现 ${auditProblems.length} 个问题：\n\n${auditProblems.join("\n")}`);
  if (!remedy.proceed) {
    return await finish(`打包审计没有通过，已按要求停止：${remedy.note}`);
  }
  incidents.push(`打包审计发现 ${auditProblems.length} 个问题（第 ${attempt} 次尝试）：${remedy.note}`);
}
if (auditProblems.length > 0) {
  return await finish(`打包审计三轮后仍有 ${auditProblems.length} 个问题，没有发布：\n\n${auditProblems.join("\n")}`);
}
verified.push(`打包审计通过：${entryCount} 个条目，无禁止条目、无非 ASCII 条目名`);

// 提醒类条目不阻止发布，但要让用户知道包里带了什么。
for (const entry of auditWarnings) {
  const note = `安装包里带有可能不需要发布的开发文件：${entry}`;
  findings.push({ where: vsixPath, what: note, evidence: "tar -tf 列出的条目", status: "verified", severity: "low" });
  report({ id: `安装包#${findings.length}`, where: vsixPath, severity: "low", what: note, status: "已确认" }, "findings");
}

const releaseGate = await hole<GateDecision>(
  "确认发版",
  `请用户确认发布 ${profile.extensionId} ${newVersion}（市场当前 ${marketBefore}）。\n\n发版说明：${releaseNotes}\n\n安装包：${vsixPath}\n\n发布动作：${releasePrUrl === "" ? "无需发版 PR；" : `合并发版 PR ${releasePrUrl}；`}然后创建 GitHub Release v${newVersion}，并通过可信发布工作流发布到插件市场。`,
);
if (!releaseGate.approved) {
  return await finish(`发版没有得到确认：${releaseGate.feedback}`);
}

// 有发版分支时：合并后把本地 main 更新到最新。
if (releasePrUrl !== "") {
  const releaseInfo = JSON.parse((await world.run("gh", ["pr", "view", releasePrUrl, "--repo", ghRepo, "--json", PR_FIELDS])).stdout) as PrInfo;
  const mergedRelease = await world.run("gh", ["pr", "merge", String(releaseInfo.number), "--repo", ghRepo, "--squash", "--delete-branch", "--match-head-commit", releaseInfo.headRefOid], { timeoutMs: 900_000 });
  if (mergedRelease.exitCode !== 0) {
    const remedy = await hole<Remedy>("发版 PR 合并没有成功怎么办", `合并发版 PR ${releasePrUrl} 没有成功：\n${tailOf(mergedRelease, 1500)}`);
    if (!remedy.proceed) {
      return await finish(`发版 PR 合并没有成功，已按要求停止：${remedy.note}`);
    }
  }
  const backMain = await world.run("git", ["-C", dir, "switch", "main"]);
  const pullMain = backMain.exitCode === 0 ? await world.run("git", ["-C", dir, "pull", "--ff-only", "origin", "main"]) : backMain;
  if (pullMain.exitCode !== 0) {
    const remedy = await hole<Remedy>("发版后本地 main 无法快进怎么办", `发版 PR 合并后更新本地 main 失败：\n${tailOf(pullMain, 1500)}`);
    if (!remedy.proceed) {
      return await finish(`发版后本地 main 无法更新，已按要求停止：${remedy.note}`);
    }
  }
}

releaseTag = `v${newVersion}`;
const runIdBefore = latestRunId((await world.run("gh", ["run", "list", "--repo", ghRepo, "--workflow", "publish.yml", "--limit", "1", "--json", "databaseId"])).stdout);
// Release 不能是草稿：发布工作流只有只读权限，下载不到草稿里的文件。
const releaseCreate = await world.run("gh", ["release", "create", releaseTag, "--repo", ghRepo, "--title", releaseTitle, "--notes", releaseNotes, vsixPath], { timeoutMs: 900_000 });
if (releaseCreate.exitCode !== 0) {
  // Release 已存在时，只更新安装包。
  const upload = await world.run("gh", ["release", "upload", releaseTag, vsixPath, "--repo", ghRepo, "--clobber"], { timeoutMs: 900_000 });
  if (upload.exitCode !== 0) {
    const remedy = await hole<Remedy>("上传安装包没有成功怎么办", `创建 Release ${releaseTag} 和上传 vsix 都没有成功：\n${tailOf(releaseCreate, 1000)}\n${tailOf(upload, 1000)}`);
    if (!remedy.proceed) {
      return await finish(`上传安装包没有成功，已按要求停止：${remedy.note}`);
    }
  }
}
const dispatched = await world.run("gh", ["workflow", "run", "publish.yml", "--repo", ghRepo, "--ref", "main", "-f", `tag=${releaseTag}`], { timeoutMs: 600_000 });
if (dispatched.exitCode !== 0) {
  const remedy = await hole<Remedy>("触发发布工作流没有成功怎么办", `触发 ${ghRepo} 的 publish.yml 失败：\n${tailOf(dispatched, 1500)}`);
  if (!remedy.proceed) {
    return await finish(`触发发布工作流没有成功，已按要求停止：${remedy.note}`);
  }
}

// 找到这次发布的运行记录并等它跑完。
let runId = "";
for (let attempt = 1; attempt <= 10 && runId === ""; attempt++) {
  const candidate = latestRunId((await world.run("gh", ["run", "list", "--repo", ghRepo, "--workflow", "publish.yml", "--event", "workflow_dispatch", "--limit", "1", "--json", "databaseId"])).stdout);
  if (candidate !== "" && candidate !== runIdBefore) runId = candidate;
}
if (runId === "") {
  const remedy = await hole<Remedy>("找不到发布任务怎么办", `已触发 ${ghRepo} 的 publish.yml，但没有找到新的运行记录。`);
  if (!remedy.proceed) {
    return await finish(`找不到发布任务，已按要求停止：${remedy.note}`);
  }
}
if (runId !== "") {
  const watched = await world.run("gh", ["run", "watch", runId, "--repo", ghRepo, "--exit-status", "--interval", "10"], { timeoutMs: 3_600_000, output: { tail: 8000 } });
  if (watched.exitCode !== 0) {
    const remedy = await hole<Remedy>("发布没有成功怎么办", `${ghRepo} 的发布任务 https://github.com/${ghRepo}/actions/runs/${runId} 没有成功：\n${tailOf(watched, 3000)}`);
    if (!remedy.proceed) {
      return await finish(`发布没有成功，已按要求停止：${remedy.note}`);
    }
    incidents.push(`发布任务失败：${remedy.note}`);
  }
}

// 到市场上核对。
let publishedVersion = "";
for (let attempt = 1; attempt <= 6 && publishedVersion !== newVersion; attempt++) {
  publishedVersion = marketVersionOf((await world.run("node", [npmCli, "exec", "--yes", "--", "@vscode/vsce@latest", "show", profile.extensionId, "--json"], { timeoutMs: 600_000, output: { tail: 200000 } })).stdout);
}
if (publishedVersion === newVersion) {
  verified.push(`插件市场已显示 ${profile.extensionId} ${newVersion}`);
} else {
  notCovered.push(`发布任务成功，但市场上还没查到 ${newVersion}（查到的是 ${publishedVersion === "" ? "无结果" : publishedVersion}），可能是市场索引延迟，请稍后核对`);
}
setStage("打包发布", "已完成", `v${newVersion}`);

/* ==========================================================================
 * 14. 复盘并沉淀经验
 * ========================================================================== */

phase("复盘并沉淀经验");
setStage("复盘并沉淀经验", "进行中", "");

const retro = await agent("复盘主持人", "你是复盘主持人。根据这次的运行记录总结经验教训：哪些做法有效、哪些要改、每条该记到哪里。只写结论，不修改任何文件。").ask<Retro>(
  `请对这次开发过程做复盘，全部用简体中文。\n\n仓库：${ghRepo}；Issue #${issueNumber}；分支 ${branch}；PR ${prUrl}；版本 ${newVersion}。\n\n开发改动：${JSON.stringify(dev.summary)}\n\n评审发现的问题：${JSON.stringify(findings)}\n\n运行中的意外：${JSON.stringify(incidents)}\n\n起了决定作用的检查：${JSON.stringify(verified)}\n\n关于长期记忆的约定：${profile.memoryConvention}\n\n每条经验都要有这次运行里的具体依据。关于项目事实（代码怎么工作、流程怎么定）的，target 写 knowledge-base 并给出文件；关于工作方式、用户偏好的，target 写 memory。`,
);
lessons.push(...retro.lessons);
for (const lesson of lessons) {
  report(lesson);
}
notCovered.push("评审和自动化测试之外：界面观感和真实使用手感，需要用户自己在 VS Code 里验证");
setStage("复盘并沉淀经验", "已完成", `${lessons.length} 条经验`);

return await finish(
  `Issue #${issueNumber} 已完成：PR ${prUrl} 已合并，${profile.extensionId} ${newVersion} 已发布。复盘得到 ${lessons.length} 条经验，需要由主会话写入长期记忆或知识库。`,
);

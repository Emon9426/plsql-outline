/**
 * 设置项单一事实源（v1.8.0）。
 *
 * 本模块为纯数据 + 纯函数，禁止 import 'vscode'——单元测试直接 require
 * 编译产物并与 package.json 的 contributes.configuration 比对
 * （tests/unit/settings_schema_test.js 锁定两侧无漂移）。
 *
 * 修改设置项时：① 改这里 ② 同步 package.json ③ 跑 npm test。
 * v1.8.0 删除的无效设置（从未被程序读取，勿再添加）：
 * parsing.maxLines / maxParseTime / maxFileSize / enableMemoryOptimization、
 * debug.outputPath / keepFiles / maxFiles。
 */

export type SettingGroupId = 'parsing' | 'view' | 'files' | 'repository' | 'debug';

export interface SettingGroup {
    id: SettingGroupId;
    title: string;
    /** codicon 名称（webview 内用字体图标） */
    icon: string;
    subtitle: string;
}

export interface SettingDefinition {
    /** 不含 'plsql-outline.' 前缀的配置键，如 'parsing.autoParseOnSave' */
    key: string;
    group: SettingGroupId;
    type: 'boolean' | 'number' | 'enum' | 'extensions' | 'repositoryPaths';
    label: string;
    description: string;
    default: unknown;
    /** number 类型的取值范围（与 package.json minimum/maximum 一致） */
    min?: number;
    max?: number;
    /** enum 类型的取值列表 */
    values?: string[];
    /** 写入作用域：user=始终写用户级（机器相关/跨项目），缺省=工作区优先 */
    scope?: 'user';
}

export const SETTING_GROUPS: SettingGroup[] = [
    { id: 'parsing', title: '解析', icon: 'zap', subtitle: '自动解析行为与保护限制' },
    { id: 'view', title: '视图', icon: 'list-tree', subtitle: '大纲树的展示与联动' },
    { id: 'files', title: '文件类型', icon: 'file-code', subtitle: '参与解析的文件扩展名' },
    { id: 'repository', title: '代码仓库', icon: 'database', subtitle: '跨文件跳转的符号索引来源' },
    { id: 'debug', title: '调试', icon: 'bug', subtitle: '诊断输出' }
];

export const SETTING_DEFINITIONS: SettingDefinition[] = [
    // ===== 解析 =====
    {
        key: 'parsing.autoParseOnSave', group: 'parsing', type: 'boolean',
        label: '保存时自动解析',
        description: '保存 PL/SQL 文件后自动刷新大纲，无需手动触发。',
        default: true
    },
    {
        key: 'parsing.autoParseOnSwitch', group: 'parsing', type: 'boolean',
        label: '切换文件时自动解析',
        description: '切换到 PL/SQL 文件时自动解析并在大纲中展示其结构。',
        default: true
    },
    {
        key: 'parsing.maxNestingDepth', group: 'parsing', type: 'number',
        label: '最大嵌套深度',
        description: '超过该深度的嵌套子程序不再向下解析，作为深度保护防止异常嵌套耗尽资源。',
        default: 15, min: 5, max: 30
    },
    // ===== 视图 =====
    {
        key: 'view.showStructureBlocks', group: 'view', type: 'boolean',
        label: '显示结构块',
        description: '在大纲中显示 BEGIN、EXCEPTION、END 等结构块节点。',
        default: true
    },
    {
        key: 'view.expandByDefault', group: 'view', type: 'boolean',
        label: '默认展开节点',
        description: '解析完成后默认展开大纲树的第一层节点。',
        default: true
    },
    {
        key: 'view.autoSelectOnCursor', group: 'view', type: 'boolean',
        label: '光标联动选中',
        description: '光标移动时自动在大纲中选中对应的节点（仅选中，不展开、不滚动编辑器）。',
        default: true
    },
    {
        key: 'view.showDeclarations', group: 'view', type: 'boolean',
        label: '显示声明项',
        description: '在 DECLARE 区域显示变量、游标、常量、类型、异常等声明项。',
        default: true
    },
    {
        key: 'view.groupDeclarations', group: 'view', type: 'boolean',
        label: '声明项按类别分组',
        description: '开启后声明项归入 Variables / Cursors / Constants / Types / Exceptions 分组；关闭则扁平列出。',
        default: true
    },
    // ===== 文件类型 =====
    {
        key: 'fileExtensions', group: 'files', type: 'extensions', scope: 'user',
        label: '支持的文件扩展名',
        description: '这些扩展名的文件会被解析并在大纲中展示。此设置跨工作区生效（用户级）。',
        default: ['.sql', '.fnc', '.fcn', '.prc', '.pks', '.pkb', '.typ']
    },
    // ===== 代码仓库 =====
    {
        key: 'codeRepository.paths', group: 'repository', type: 'repositoryPaths', scope: 'user',
        label: '代码仓库路径',
        description: '跨文件跳转（Ctrl+Click）的检索目录，最多 2 个；优先级数字越小越先命中。',
        default: []
    },
    {
        key: 'codeRepository.fileExtensions', group: 'repository', type: 'extensions', scope: 'user',
        label: '索引扫描扩展名',
        description: '构建符号索引时扫描哪些扩展名的文件。',
        default: ['.sql', '.fnc', '.fcn', '.prc', '.pks', '.pkb', '.typ']
    },
    {
        key: 'codeRepository.autoIndex', group: 'repository', type: 'boolean', scope: 'user',
        label: '启动时自动构建索引',
        description: '扩展激活后自动扫描代码仓库路径并构建符号索引。',
        default: true
    },
    {
        key: 'codeRepository.maxFiles', group: 'repository', type: 'number', scope: 'user',
        label: '索引扫描文件上限',
        description: '构建符号索引时最多扫描的文件数量，防止超大目录拖慢启动。',
        default: 5000, min: 100, max: 20000
    },
    // ===== 调试 =====
    {
        key: 'debug.enabled', group: 'debug', type: 'boolean',
        label: '启用调试日志',
        description: '在输出面板（PL/SQL Outline 通道）记录解析过程与统计信息。',
        default: false
    },
    {
        key: 'debug.logLevel', group: 'debug', type: 'enum',
        label: '日志级别',
        description: '调试日志的详细程度；ERROR 最精简，DEBUG 最详细。',
        default: 'INFO', values: ['ERROR', 'WARN', 'INFO', 'DEBUG']
    }
];

/** 设置快照（按分组组织，供 webview 前后端交换与导入/导出） */
export interface ExtensionConfig {
    parsing: {
        autoParseOnSave?: boolean;
        autoParseOnSwitch?: boolean;
        maxNestingDepth?: number;
    };
    view: {
        showStructureBlocks?: boolean;
        expandByDefault?: boolean;
        autoSelectOnCursor?: boolean;
        showDeclarations?: boolean;
        groupDeclarations?: boolean;
    };
    fileExtensions?: string[];
    codeRepository: {
        paths?: Array<{ path: string; priority?: number }>;
        fileExtensions?: string[];
        autoIndex?: boolean;
        maxFiles?: number;
    };
    debug: {
        enabled?: boolean;
        logLevel?: string;
    };
}

/** 从完整配置键还原分组键：'parsing.autoParseOnSave' → ['parsing', 'autoParseOnSave'] */
export function splitConfigKey(key: string): [string, string] {
    const idx = key.indexOf('.');
    if (idx < 0) return [key, ''];
    return [key.slice(0, idx), key.slice(idx + 1)];
}

/** 将快照值裁剪到 schema 允许的范围（数字越界收敛、非法枚举回落默认） */
export function clampValue(def: SettingDefinition, value: unknown): unknown {
    if (value === undefined || value === null) {
        return undefined;
    }
    switch (def.type) {
        case 'number': {
            let n = typeof value === 'number' ? value : NaN;
            if (Number.isNaN(n)) return def.default;
            if (def.min !== undefined) n = Math.max(def.min, n);
            if (def.max !== undefined) n = Math.min(def.max, n);
            return n;
        }
        case 'enum':
            return def.values?.includes(String(value)) ? value : def.default;
        case 'extensions': {
            if (!Array.isArray(value)) return def.default;
            const seen = new Set<string>();
            const out: string[] = [];
            for (const item of value) {
                let ext = String(item).trim().toLowerCase();
                if (!ext) continue;
                if (!ext.startsWith('.')) ext = '.' + ext;
                if (!/^\.[a-z0-9_]+$/.test(ext)) continue;
                if (seen.has(ext)) continue;
                seen.add(ext);
                out.push(ext);
            }
            return out;
        }
        case 'repositoryPaths': {
            if (!Array.isArray(value)) return def.default;
            const out: Array<{ path: string; priority?: number }> = [];
            for (const item of value.slice(0, 2)) {
                const p = item && typeof item === 'object' ? String((item as { path?: unknown }).path ?? '').trim() : '';
                if (!p) continue;
                const rawPriority = (item as { priority?: unknown }).priority;
                const priority = typeof rawPriority === 'number' && Number.isFinite(rawPriority)
                    ? rawPriority
                    : 1;
                out.push({ path: p, priority });
            }
            return out;
        }
        case 'boolean':
            return typeof value === 'boolean' ? value : def.default;
    }
}

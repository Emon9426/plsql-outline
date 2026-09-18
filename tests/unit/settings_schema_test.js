/**
 * GMLTest: 设置 schema 与 package.json 一致性回归测试（v1.8.0）
 *
 * 背景：旧设置页与 package.json 曾各自为政——范围文案矛盾（UI 1000-200000 vs
 * schema 最大 50000）、缺漏新设置、暴露已废弃设置。v1.8.0 起以
 * src/settingsSchema.ts 为单一事实源，本套件锁定它与 package.json
 * contributes.configuration 之间的无漂移契约。
 */
const { SETTING_DEFINITIONS, SETTING_GROUPS } = require('../../out/settingsSchema');
const pkg = require('../../package.json');

function makeRecorder() {
    const cases = [];
    function assert(name, desc, cond, actual) { cases.push({ name, desc, passed: !!cond, actual: String(actual) }); }
    return { cases, assert };
}

const PROPS = pkg.contributes.configuration.properties;
const PREFIX = 'plsql-outline.';
// v1.8.0 删除的无效设置（从未被程序读取）——不得再出现在 package.json
const DEAD_KEYS = [
    'plsql-outline.parsing.maxLines',
    'plsql-outline.parsing.maxParseTime',
    'plsql-outline.parsing.maxFileSize',
    'plsql-outline.parsing.enableMemoryOptimization',
    'plsql-outline.debug.outputPath',
    'plsql-outline.debug.keepFiles',
    'plsql-outline.debug.maxFiles'
];

async function run() {
    const rec = makeRecorder();

    rec.assert('c1_key_count', 'schema 定义数 = package.json 属性数（15）',
        SETTING_DEFINITIONS.length === Object.keys(PROPS).length,
        `schema=${SETTING_DEFINITIONS.length} pkg=${Object.keys(PROPS).length}`);

    const missing = SETTING_DEFINITIONS.filter(d => !(PREFIX + d.key in PROPS));
    rec.assert('c2_all_keys_in_pkg', 'schema 全部键都存在于 package.json',
        missing.length === 0,
        missing.map(d => d.key).join(',') || 'none missing');

    const defaultDiffs = SETTING_DEFINITIONS.filter(d => {
        const p = PROPS[PREFIX + d.key];
        return JSON.stringify(p.default) !== JSON.stringify(d.default);
    });
    rec.assert('c3_defaults_match', '默认值与 package.json 完全一致',
        defaultDiffs.length === 0,
        defaultDiffs.map(d => `${d.key}(${JSON.stringify(PROPS[PREFIX + d.key].default)} vs ${JSON.stringify(d.default)})`).join(' | ') || 'none');

    const rangeDiffs = SETTING_DEFINITIONS.filter(d => {
        const p = PROPS[PREFIX + d.key];
        if (d.min !== undefined && p.minimum !== d.min) return true;
        if (d.max !== undefined && p.maximum !== d.max) return true;
        if (d.min === undefined && d.max === undefined && (p.minimum !== undefined || p.maximum !== undefined)) return true;
        return false;
    });
    rec.assert('c4_ranges_match', '数值范围与 package.json 完全一致',
        rangeDiffs.length === 0,
        rangeDiffs.map(d => d.key).join(',') || 'none');

    const enumDiffs = SETTING_DEFINITIONS.filter(d => {
        const p = PROPS[PREFIX + d.key];
        if (d.type !== 'enum') return false;
        return JSON.stringify(p.enum) !== JSON.stringify(d.values);
    });
    rec.assert('c5_enums_match', '枚举取值与 package.json 完全一致',
        enumDiffs.length === 0,
        enumDiffs.map(d => d.key).join(',') || 'none');

    const alive = DEAD_KEYS.filter(k => k in PROPS);
    rec.assert('c6_dead_keys_gone', '7 个已删除的无效设置不再出现在 package.json',
        alive.length === 0, alive.join(',') || 'none');

    rec.assert('c7_no_extra_props', 'package.json 无 schema 之外的未知属性',
        Object.keys(PROPS).every(k => SETTING_DEFINITIONS.some(d => PREFIX + d.key === k)),
        Object.keys(PROPS).filter(k => !SETTING_DEFINITIONS.some(d => PREFIX + d.key === k)).join(',') || 'none');

    const groupIds = new Set(SETTING_GROUPS.map(g => g.id));
    const orphanDefs = SETTING_DEFINITIONS.filter(d => !groupIds.has(d.group));
    rec.assert('c8_groups_cover_defs', '每个定义都归属已声明的分组',
        orphanDefs.length === 0, orphanDefs.map(d => d.key).join(',') || 'none');

    return { suiteName: 'settings_schema_test', cases: rec.cases, parseTime: 0 };
}

module.exports = { run };

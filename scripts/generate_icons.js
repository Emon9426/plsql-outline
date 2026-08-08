/**
 * 生成 PL/SQL Outline 大纲图标集（数据库圆筒主题 + P/F 字母区分）
 *
 * 输出：res/icons/<name>.svg（dark 变体，浅色描边/字）
 *       res/icons/<name>-light.svg（light 变体，深色描边/字）
 *
 * 设计：以"数据库圆筒"为基础视觉锚点；Procedure=蓝色"P"、Function=琥珀色"F"，
 * 字母居中，明暗主题下文字颜色自适应。
 *
 * 运行：node scripts/generate_icons.js
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'res', 'icons');

// 颜色定义
// dark 变体（用于深色主题）：圆筒描边浅色、字母浅色 + 强调色
// light 变体（用于浅色主题）：圆筒描边深色、字母深色 + 强调色
const COLORS = {
    dark: {
        cylinder: '#c5c8ce',   // 圆筒描边/填充（浅灰，深色主题可见）
        cylinderFill: 'none',
        label: '#e6e6e6',      // 默认字母色（浅）
        proc: '#4d9bff',       // Procedure 蓝（深色主题下的亮蓝）
        func: '#f0c040',       // Function 琥珀（深色主题下的亮琥珀）
        accent: '#7fb4ff'
    },
    light: {
        cylinder: '#42566b',   // 圆筒描边（深蓝灰，浅色主题可见）
        cylinderFill: 'none',
        label: '#2c3e50',      // 默认字母色（深）
        proc: '#1f6fd6',       // Procedure 蓝（浅色主题下的深蓝）
        func: '#c8881a',       // Function 琥珀（浅色主题下的深琥珀）
        accent: '#1f6fd6'
    }
};

/**
 * 数据库圆筒（cylinder）路径，16x16 画布。
 * 顶部椭圆 + 侧身 + 底部椭圆弧。返回 SVG 片段。
 */
function cylinder(c) {
    // 顶椭圆中心 (8,3.2)，rx=5, ry=1.7；身侧从 x=3 到 x=13，顶 y=3.2 底 y=12.8
    return `
  <ellipse cx="8" cy="3.2" rx="5" ry="1.7" fill="${c.cylinderFill}" stroke="${c.cylinder}" stroke-width="1.1"/>
  <path d="M 3 3.2 L 3 12.8 A 5 1.7 0 0 0 13 12.8 L 13 3.2" fill="${c.cylinderFill}" stroke="${c.cylinder}" stroke-width="1.1"/>
  <path d="M 3 6.2 A 5 1.7 0 0 0 13 6.2" fill="none" stroke="${c.cylinder}" stroke-width="0.7" opacity="0.55"/>
  <path d="M 3 9.0 A 5 1.7 0 0 0 13 9.0" fill="none" stroke="${c.cylinder}" stroke-width="0.7" opacity="0.4"/>
`;
}

function svg(inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">${inner}\n</svg>`;
}

// ---- 各图标生成器（接收 c=颜色组，返回 SVG 内容）----

function procIcon(c) {
    // 圆筒 + 大号 "P"（蓝色）
    return svg(`
  ${cylinder(c)}
  <text x="8" y="11.2" font-family="Segoe UI, Arial, sans-serif" font-size="7.2" font-weight="700"
        text-anchor="middle" fill="${c.proc}">P</text>`);
}

function funcIcon(c) {
    // 圆筒 + 大号 "F"（琥珀色）
    return svg(`
  ${cylinder(c)}
  <text x="8" y="11.2" font-family="Segoe UI, Arial, sans-serif" font-size="7.2" font-weight="700"
        text-anchor="middle" fill="${c.func}">F</text>`);
}

function packageIcon(c) {
    // 圆筒 + 顶部小包/盒标记
    return svg(`
  ${cylinder(c)}
  <rect x="5.6" y="1.0" width="4.8" height="2.2" rx="0.4" fill="${c.cylinder}" opacity="0.9"/>
  <path d="M 7.2 1.4 L 8 2.0 L 8.8 1.4" fill="none" stroke="${c.label}" stroke-width="0.5" opacity="0.6"/>`);
}

function triggerIcon(c) {
    // 圆筒 + 闪电
    return svg(`
  ${cylinder(c)}
  <path d="M 8.6 4.5 L 6.4 8.4 L 7.9 8.4 L 7.0 11.6 L 9.6 7.4 L 8.1 7.4 Z"
        fill="${c.func}" stroke="${c.func}" stroke-width="0.3"/>`);
}

function anonIcon(c) {
    // 圆筒 + </> 代码括号
    return svg(`
  ${cylinder(c)}
  <path d="M 6.0 8.5 L 4.6 10.0 L 6.0 11.5" fill="none" stroke="${c.accent}" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 10.0 8.5 L 11.4 10.0 L 10.0 11.5" fill="none" stroke="${c.accent}" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>`);
}

function cursorIcon(c) {
    // 圆筒 + 向右箭头（游标）
    return svg(`
  ${cylinder(c)}
  <path d="M 4.5 10.5 L 9.5 10.5 M 7.8 9.0 L 9.5 10.5 L 7.8 12.0"
        fill="none" stroke="${c.proc}" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>`);
}

function variableIcon(c) {
    // 圆筒 + 小写 v
    return svg(`
  ${cylinder(c)}
  <text x="8" y="11.4" font-family="Segoe UI, Arial, sans-serif" font-size="6.4" font-weight="600"
        text-anchor="middle" fill="${c.label}">v</text>`);
}

function constantIcon(c) {
    // 圆筒 + 小写 c（常量）
    return svg(`
  ${cylinder(c)}
  <text x="8" y="11.4" font-family="Segoe UI, Arial, sans-serif" font-size="6.4" font-weight="600"
        text-anchor="middle" fill="${c.func}">c</text>`);
}

function typeIcon(c) {
    // 圆筒 + T（类型）
    return svg(`
  ${cylinder(c)}
  <text x="8" y="11.4" font-family="Segoe UI, Arial, sans-serif" font-size="6.6" font-weight="700"
        text-anchor="middle" fill="${c.label}">T</text>`);
}

function exceptionIcon(c) {
    // 圆筒 + !
    return svg(`
  ${cylinder(c)}
  <text x="8" y="11.6" font-family="Segoe UI, Arial, sans-serif" font-size="7.2" font-weight="700"
        text-anchor="middle" fill="#e0556a">!</text>`);
}

// 文件夹（数据库风格的圆筒文件夹）
function folderIcon(c, tag) {
    // 文件夹外形 + 数据库圆筒小标
    return svg(`
  <path d="M 1.5 4.0 L 6.0 4.0 L 7.2 5.2 L 14.5 5.2 L 14.5 13.0 L 1.5 13.0 Z"
        fill="${c.cylinder}" fill-opacity="0.18" stroke="${c.cylinder}" stroke-width="1.0" stroke-linejoin="round"/>
  <ellipse cx="8" cy="9.2" rx="2.6" ry="0.9" fill="none" stroke="${c.cylinder}" stroke-width="0.7"/>
  <path d="M 5.4 9.2 L 5.4 11.0 A 2.6 0.9 0 0 0 10.6 11.0 L 10.6 9.2" fill="none" stroke="${c.cylinder}" stroke-width="0.7"/>
  ${tag ? `<text x="12.6" y="11.6" font-family="Segoe UI, Arial, sans-serif" font-size="4.6" font-weight="700" text-anchor="middle" fill="${c.proc}">${tag}</text>` : ''}`);
}

function folderDecl(c) { return folderIcon(c, 'D'); }
function folderSub(c) { return folderIcon(c, 'S'); }
function folderBody(c) { return folderIcon(c, 'B'); }

// 结构块
function beginIcon(c) {
    return svg(`
  <circle cx="8" cy="8" r="5.2" fill="none" stroke="#3fb950" stroke-width="1.3"/>
  <path d="M 6.4 5.4 L 11.0 8.0 L 6.4 10.6 Z" fill="#3fb950"/>`);
}
function exceptionBlockIcon(c) {
    return svg(`
  <path d="M 8 2.5 L 14 13.5 L 2 13.5 Z" fill="none" stroke="#e0556a" stroke-width="1.2" stroke-linejoin="round"/>
  <text x="8" y="12.4" font-family="Segoe UI, Arial, sans-serif" font-size="6.4" font-weight="700"
        text-anchor="middle" fill="#e0556a">!</text>`);
}
function endIcon(c) {
    return svg(`
  <rect x="3" y="3" width="10" height="10" rx="1.5" fill="none" stroke="#888c93" stroke-width="1.3"/>
  <path d="M 5.6 5.6 L 10.4 10.4 M 10.4 5.6 L 5.6 10.4" stroke="#888c93" stroke-width="1.2" stroke-linecap="round"/>`);
}

// 图标清单
const ICONS = {
    proc: procIcon,
    func: funcIcon,
    package: packageIcon,
    trigger: triggerIcon,
    anon: anonIcon,
    cursor: cursorIcon,
    variable: variableIcon,
    constant: constantIcon,
    type: typeIcon,
    exception: exceptionIcon,
    'folder-decl': folderDecl,
    'folder-sub': folderSub,
    'folder-body': folderBody,
    begin: beginIcon,
    'exception-block': exceptionBlockIcon,
    end: endIcon
};

// 写入
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

ensureDir(OUT_DIR);
let count = 0;
for (const [name, gen] of Object.entries(ICONS)) {
    fs.writeFileSync(path.join(OUT_DIR, `${name}.svg`), gen(COLORS.dark), 'utf8');       // dark 变体
    fs.writeFileSync(path.join(OUT_DIR, `${name}-light.svg`), gen(COLORS.light), 'utf8'); // light 变体
    count += 2;
}
console.log(`已生成 ${count} 个 SVG 图标到 ${OUT_DIR}`);
console.log('图标列表:', Object.keys(ICONS).join(', '));

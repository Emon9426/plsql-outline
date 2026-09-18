/**
 * 应用封面图标生成器：输出 res/Icon.svg（设计源）。
 * PNG（1024×1024）由浏览器渲染截图得到：
 *   node scripts/capture-app-icon.js 或手动在浏览器打开后截图
 *
 * 设计语言：圆角方形深蓝渐变底 + 白色数据库圆柱（产品身份）+
 * 右侧大纲层级线（产品核心"Outline"），琥珀色节点圆点呼应树节点图标的 F 色。
 */
const fs = require('fs');
const path = require('path');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3a7fc2"/>
      <stop offset="0.55" stop-color="#2565a3"/>
      <stop offset="1" stop-color="#163a5e"/>
    </linearGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- 底板 -->
  <rect x="0" y="0" width="1024" height="1024" rx="200" fill="url(#bg)"/>
  <rect x="0" y="0" width="1024" height="1024" rx="200" fill="url(#gloss)"/>

  <!-- 数据库圆柱（左） -->
  <g stroke="#ffffff" stroke-width="30" fill="none" stroke-linecap="round">
    <ellipse cx="392" cy="330" rx="150" ry="64"/>
    <path d="M242 330 v178 c0 35 67 64 150 64 s150 -29 150 -64 v-178"/>
    <path d="M242 508 v178 c0 35 67 64 150 64 s150 -29 150 -64 v-178"/>
  </g>

  <!-- 大纲层级线（右）：树状缩进 + 琥珀节点 -->
  <g>
    <circle cx="614" cy="380" r="30" fill="#e8a33d"/>
    <circle cx="662" cy="508" r="30" fill="#e8a33d"/>
    <circle cx="710" cy="636" r="30" fill="#e8a33d"/>
    <rect x="664" y="362" width="196" height="36" rx="18" fill="#ffffff"/>
    <rect x="712" y="490" width="148" height="36" rx="18" fill="#ffffff" opacity="0.9"/>
    <rect x="760" y="618" width="100" height="36" rx="18" fill="#ffffff" opacity="0.8"/>
  </g>
</svg>
`;

const outFile = path.join(__dirname, '..', 'res', 'Icon.svg');
fs.writeFileSync(outFile, svg, 'utf8');
console.log('SVG 已生成: ' + outFile);

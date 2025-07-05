const WHEN_REGEX = /^\s*WHEN\s+([^T]+)\s+THEN\s*$/i;

const testLines = [
    "    WHEN NO_DATA_FOUND THEN",
    "    WHEN TOO_MANY_ROWS THEN", 
    "    WHEN VALUE_ERROR THEN",
    "    WHEN OTHERS THEN",
    "        WHEN INVALID_NUMBER THEN",
    "        WHEN OTHERS THEN",
    "    WHEN NO_DATA_FOUND THEN",
    "    WHEN TOO_MANY_ROWS THEN",
    "    WHEN OTHERS THEN"
];

console.log('=== WHEN 正则表达式测试 ===\n');
console.log('正则表达式:', WHEN_REGEX);
console.log();

testLines.forEach((line, index) => {
    const match = line.match(WHEN_REGEX);
    console.log(`第${index + 1}行: "${line}"`);
    if (match) {
        console.log(`  ✅ 匹配成功: "${match[1].trim()}"`);
    } else {
        console.log(`  ❌ 匹配失败`);
    }
    console.log();
});

// 测试改进的正则表达式
console.log('=== 测试改进的正则表达式 ===\n');
const IMPROVED_WHEN_REGEX = /^\s*WHEN\s+(.+?)\s+THEN\s*$/i;
console.log('改进的正则表达式:', IMPROVED_WHEN_REGEX);
console.log();

testLines.forEach((line, index) => {
    const match = line.match(IMPROVED_WHEN_REGEX);
    console.log(`第${index + 1}行: "${line}"`);
    if (match) {
        console.log(`  ✅ 匹配成功: "${match[1].trim()}"`);
    } else {
        console.log(`  ❌ 匹配失败`);
    }
    console.log();
});

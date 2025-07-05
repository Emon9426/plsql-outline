import * as fs from 'fs';
import * as path from 'path';
import { parsePLSQL as parse } from '../src/parser';

// 定义测试文件路径
const testFiles = [
    'test/long_procedure.sql',
    'test/complex_package.pks',
    'test/complex_package.pkb',
    'test/nested_functions.fcn',
    'test/edge_cases.prc',
    // 新增的注释复杂测试用例
    'test/comment_complex_cases.sql',
    'test/string_comment_edge_cases.pks',
    'test/extreme_comment_nesting.fcn'
];

// 输出目录
const outputDir = 'test/actual';

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 处理每个测试文件
testFiles.forEach(filePath => {
    try {
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 解析PL/SQL结构
        const result = parse(content);
        
        // 生成输出文件名
        const fileName = path.basename(filePath);
        const outputPath = path.join(outputDir, `${fileName}.json`);
        
        // 写入JSON文件
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
        console.log(`Successfully generated: ${outputPath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
});

console.log('All JSON files generated successfully!');

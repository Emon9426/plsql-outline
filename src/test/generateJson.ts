import * as fs from 'fs';
import * as path from 'path';
import { parsePLSQL } from '../parser';
import { stringify } from 'flatted';

const TEST_DIR = path.join(__dirname, '..', '..', 'test');
const ACTUAL_DIR = path.join(TEST_DIR, 'actual');
const EXPECTED_DIR = path.join(TEST_DIR, 'expected');

function generateJson() {
    // 确保目录存在
    if (!fs.existsSync(ACTUAL_DIR)) {
        fs.mkdirSync(ACTUAL_DIR, { recursive: true });
    }

    // 读取测试文件
    const testFiles = fs.readdirSync(TEST_DIR).filter(file => 
        ['.sql', '.pks', '.pkb', '.fcn', '.prc'].some(ext => file.endsWith(ext))
    );

    console.log(`Found ${testFiles.length} test files`);

    testFiles.forEach(file => {
        const filePath = path.join(TEST_DIR, file);
        const fileName = path.basename(file, path.extname(file));
        
        try {
            console.log(`Processing ${filePath}`);
            const content = fs.readFileSync(filePath, 'utf8');
            const result = parsePLSQL(content);
            
            // 创建深拷贝并断开循环引用
            const cleanedResult = JSON.parse(JSON.stringify(result, (key, value) => {
                // 完全跳过 parent 属性
                if (key === 'parent') return undefined;
                
                // 对于节点对象，创建一个没有 parent 属性的副本
                if (value && typeof value === 'object' && value.label && value.type) {
                    const { parent, ...rest } = value;
                    return rest;
                }
                return value;
            }));
            
            const jsonContent = stringify(cleanedResult, undefined, 2);
            
            const outputPath = path.join(ACTUAL_DIR, `${fileName}.json`);
            fs.writeFileSync(outputPath, jsonContent);
            console.log(`Successfully generated: ${outputPath}`);
        } catch (error) {
            console.error(`Error processing ${filePath}: ${error}`);
        }
    });

    console.log('All JSON files generated successfully!');
}

generateJson();

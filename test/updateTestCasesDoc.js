const fs = require('fs');
const path = require('path');

const TEST_DIR = path.join(__dirname);
const ACTUAL_DIR = path.join(TEST_DIR, 'actual');
const EXPECTED_DIR = path.join(TEST_DIR, 'expected');
const TEST_CASES_MD = path.join(TEST_DIR, 'test_cases.md');

// 获取所有测试用例的实际结果和预期结果
const testCases = [
  { name: '长过程文件测试', file: 'long_procedure.sql.json' },
  { name: '复杂包规范测试', file: 'complex_package.pks.json' },
  { name: '复杂包体测试', file: 'complex_package.pkb.json' },
  { name: '多层嵌套函数测试', file: 'nested_functions.fcn.json' },
  { name: '边界情况测试', file: 'edge_cases.prc.json' }
];

// 比较两个JSON文件是否相同
function compareFiles(actualPath, expectedPath) {
  try {
    const actual = JSON.parse(fs.readFileSync(actualPath, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));
    return JSON.stringify(actual) === JSON.stringify(expected);
  } catch (e) {
    return false;
  }
}

// 更新测试文档
function updateTestCasesDoc() {
  let mdContent = fs.readFileSync(TEST_CASES_MD, 'utf8');
  
  testCases.forEach(testCase => {
    const actualPath = path.join(ACTUAL_DIR, testCase.file);
    const expectedPath = path.join(EXPECTED_DIR, testCase.file);
    
    // 检查文件是否存在
    if (!fs.existsSync(actualPath)) {
      console.error(`实际结果文件不存在: ${actualPath}`);
      return;
    }
    
    if (!fs.existsSync(expectedPath)) {
      console.error(`预期结果文件不存在: ${expectedPath}`);
      return;
    }
    
    // 比较文件
    const isMatch = compareFiles(actualPath, expectedPath);
    
    // 构建状态标记
    const status = isMatch ? '✅ 通过' : '❌ 失败';
    
    // 更新测试文档
    const regex = new RegExp(`## (\\d+\\.\\s*${testCase.name}.*?)(?=##|$)`);
    const match = mdContent.match(regex);
    
    if (match) {
      const section = match[0];
      const updatedSection = section.replace(
        /(### 预期结果\s*```plaintext\s*)[^`]*(\s*```)/,
        `$1${status}$2`
      );
      
      mdContent = mdContent.replace(section, updatedSection);
    }
  });
  
  // 保存更新后的文档
  fs.writeFileSync(TEST_CASES_MD, mdContent);
  console.log('测试文档已更新');
}

// 执行更新
updateTestCasesDoc();

/**
 * SymbolIndex 跨文件符号索引测试
 */
const path = require('path');
const fs = require('fs');

// Mock vscode module before any require that depends on it
const Module = require('module');
const mockVscode = {
    RelativePattern: class RelativePattern {
        constructor(base, pattern) {
            this.base = base;
            this.pattern = pattern;
        }
    },
    workspace: {
        createFileSystemWatcher: () => ({
            onDidCreate: (cb) => ({ dispose: () => {} }),
            onDidChange: (cb) => ({ dispose: () => {} }),
            onDidDelete: (cb) => ({ dispose: () => {} }),
            dispose: () => {}
        })
    },
    Uri: {
        file: (f) => ({ fsPath: f })
    }
};

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
    if (request === 'vscode') {
        return 'vscode_mock';
    }
    return originalResolve.call(this, request, parent, isMain, options);
};
require.cache['vscode_mock'] = { id: 'vscode_mock', filename: 'vscode_mock', loaded: true, exports: mockVscode };

const { SymbolIndex } = require('../../out/symbolIndex');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        passed++;
    } else {
        failed++;
        console.error(`  ✗ FAIL: ${message}`);
    }
}

function assertEqual(actual, expected, message) {
    if (actual === expected) {
        passed++;
    } else {
        failed++;
        console.error(`  ✗ FAIL: ${message} (expected: ${expected}, got: ${actual})`);
    }
}

// 模拟 OutputChannel
const mockOutputChannel = {
    appendLine: (msg) => { /* silent */ },
    dispose: () => {}
};

async function runTests() {
    console.log('PL/SQL SymbolIndex 测试套件');
    console.log('================================\n');

    // ============ 测试1: 索引构建和查找 ============
    console.log('=== 测试1: 索引构建和查找 ===');
    
    const testDir = path.join(__dirname);
    const symbolIndex = new SymbolIndex(mockOutputChannel);
    
    const pathConfigs = [
        { path: testDir, priority: 1 }
    ];
    
    await symbolIndex.buildIndex(pathConfigs, ['.sql'], 100);
    
    const status = symbolIndex.getStatus();
    assert(status.fileCount > 0, `应有索引文件: ${status.fileCount}`);
    assert(status.symbolCount > 0, `应有符号: ${status.symbolCount}`);
    console.log(`  索引: ${status.fileCount} 文件, ${status.symbolCount} 符号`);
    
    // ============ 测试2: 查找Package ============
    console.log('\n=== 测试2: 查找 Package ===');
    
    // 在large_package_100funcs.sql中, 包名是 large_test_pkg
    const pkgEntries = symbolIndex.lookup('large_test_pkg');
    assert(pkgEntries.length > 0, 'large_test_pkg 应被索引');
    if (pkgEntries.length > 0) {
        console.log(`  找到 large_test_pkg: ${pkgEntries.length} 条`);
        assertEqual(pkgEntries[0].name.toLowerCase(), 'large_test_pkg', 'Package名称正确');
    }
    
    // ============ 测试3: 查找Package内的Function ============
    console.log('\n=== 测试3: 查找 Package 内的 Function ===');
    
    // 在large_package_100funcs.sql中应该有 func_001 到 func_051
    const funcEntries = symbolIndex.lookup('func_001');
    assert(funcEntries.length > 0, 'func_001 应被索引');
    if (funcEntries.length > 0) {
        console.log(`  找到 func_001: ${funcEntries.length} 条`);
        assert(funcEntries[0].packageName !== undefined, '应有Package名');
    }
    
    // ============ 测试4: 包名限定查找 ============
    console.log('\n=== 测试4: 包名限定查找 ===');
    
    const qualifiedEntries = symbolIndex.lookup('func_001', 'large_test_pkg');
    assert(qualifiedEntries.length > 0, 'large_test_pkg.func_001 应被找到');
    if (qualifiedEntries.length > 0) {
        assertEqual(
            qualifiedEntries[0].packageName.toLowerCase(),
            'large_test_pkg',
            '包名匹配'
        );
    }
    
    // ============ 测试5: 优先级路径查找 ============
    console.log('\n=== 测试5: 优先级路径查找 ===');
    
    // 使用多路径配置（虚拟的高优先级路径不存在文件）
    const multiPathConfigs = [
        { path: 'D:\\nonexist_high_priority', priority: 1 },
        { path: testDir, priority: 2 }
    ];
    
    const priorityEntries = symbolIndex.lookupWithPriority('func_001', undefined, multiPathConfigs);
    assert(priorityEntries.length > 0, '应从低优先级路径找到');
    if (priorityEntries.length > 0) {
        assert(
            priorityEntries[0].filePath.toLowerCase().startsWith(testDir.toLowerCase()),
            '结果应来自testDir'
        );
    }
    
    // 高优先级路径有匹配时不查找低优先级
    const singlePathConfigs = [
        { path: testDir, priority: 1 }
    ];
    const highPriorityEntries = symbolIndex.lookupWithPriority('func_001', undefined, singlePathConfigs);
    assert(highPriorityEntries.length > 0, '高优先级路径找到后应停止');
    
    // ============ 测试6: 查找不存在的符号 ============
    console.log('\n=== 测试6: 查找不存在的符号 ===');
    
    const notFound = symbolIndex.lookup('this_does_not_exist_xyz');
    assertEqual(notFound.length, 0, '不存在的符号应返回空数组');
    
    // ============ 测试7: 增量更新 ============
    console.log('\n=== 测试7: 增量更新 (removeFile) ===');
    
    const testFile = path.join(testDir, 'large_package_100funcs.sql');
    const beforeCount = symbolIndex.getStatus().symbolCount;
    
    symbolIndex.removeFile(testFile);
    const afterRemoveCount = symbolIndex.getStatus().symbolCount;
    assert(afterRemoveCount < beforeCount, `移除文件后符号数应减少: ${beforeCount} -> ${afterRemoveCount}`);
    
    // 重新索引
    await symbolIndex.updateFile(testFile);
    const afterReaddCount = symbolIndex.getStatus().symbolCount;
    assertEqual(afterReaddCount, beforeCount, `重新索引后符号数应恢复: ${afterReaddCount}`);
    
    // ============ 测试8: 索引持久化 ============
    console.log('\n=== 测试8: 索引持久化 (save/load) ===');
    
    const tempStorage = path.join(testDir, '.temp_symbol_index.json');
    await symbolIndex.save(tempStorage);
    assert(fs.existsSync(tempStorage), '索引文件应被创建');
    
    const newIndex = new SymbolIndex(mockOutputChannel);
    const loaded = await newIndex.load(tempStorage);
    assert(loaded, '索引应成功加载');
    
    const loadedStatus = newIndex.getStatus();
    assertEqual(loadedStatus.symbolCount, status.symbolCount, '加载后符号数应一致');
    
    // 验证加载后的查找功能
    const loadedEntries = newIndex.lookup('func_001');
    assert(loadedEntries.length > 0, '加载后的索引应能查找符号');

    // v2 缓存同时恢复 fileSymbols：加载后更新文件不得产生重复条目（Issue #38 修复点）
    const loadedPkgFile = path.join(testDir, 'large_package_100funcs.sql');
    const beforeReloadCount = newIndex.lookup('large_test_pkg').length;
    await newIndex.updateFile(loadedPkgFile);
    assertEqual(
        newIndex.lookup('large_test_pkg').length,
        beforeReloadCount,
        '加载后 updateFile 不应产生重复条目'
    );

    // 清理临时文件
    fs.unlinkSync(tempStorage);
    
    // ============ 测试9: 嵌套文件中的符号 ============
    console.log('\n=== 测试9: 嵌套文件中的符号 ===');
    
    // nested_control_5levels.sql 中有 test_nested_pkg, process_data, calculate 等
    const nestedPkgEntries = symbolIndex.lookup('test_nested_pkg');
    assert(nestedPkgEntries.length > 0, 'test_nested_pkg 应被索引');
    
    const procEntries = symbolIndex.lookup('process_data', 'test_nested_pkg');
    assert(procEntries.length > 0, 'process_data 应被索引');
    if (procEntries.length > 0) {
        assertEqual(procEntries[0].packageName.toLowerCase(), 'test_nested_pkg', 'procedure 应属于正确的包');
    }
    
    const calcEntries = symbolIndex.lookup('calculate', 'test_nested_pkg');
    assert(calcEntries.length > 0, 'calculate 应被索引');
    
    // ============ 测试10: parseCallAtPosition 逻辑验证 ============
    console.log('\n=== 测试10: pkg.proc_name 格式解析验证 ===');
    
    // 模拟 parseCallAtPosition 的逻辑
    function parseCallFormat(text) {
        const dotIndex = text.indexOf('.');
        if (dotIndex > 0) {
            const packageName = text.substring(0, dotIndex);
            const name = text.substring(dotIndex + 1);
            if (name) {
                return { name, packageName };
            }
        }
        return { name: text };
    }
    
    const call1 = parseCallFormat('my_pkg.my_func');
    assertEqual(call1.name, 'my_func', 'pkg.func 格式 - name 正确');
    assertEqual(call1.packageName, 'my_pkg', 'pkg.func 格式 - packageName 正确');
    
    const call2 = parseCallFormat('standalone_proc');
    assertEqual(call2.name, 'standalone_proc', '独立名称格式 - name 正确');
    assertEqual(call2.packageName, undefined, '独立名称格式 - 无 packageName');
    
    const call3 = parseCallFormat('schema.pkg');
    assertEqual(call3.name, 'pkg', 'schema.pkg 格式 - name 正确');
    assertEqual(call3.packageName, 'schema', 'schema.pkg 格式 - packageName 正确');
    
    // ============ 测试11: 大小写不敏感查找 ============
    console.log('\n=== 测试11: 大小写不敏感查找 ===');
    
    const upperEntries = symbolIndex.lookup('FUNC_001');
    const lowerEntries = symbolIndex.lookup('func_001');
    const mixedEntries = symbolIndex.lookup('Func_001');
    
    assertEqual(upperEntries.length, lowerEntries.length, '大小写应返回相同结果数');
    assertEqual(lowerEntries.length, mixedEntries.length, '混合大小写应返回相同结果数');
    
    // ============ 测试12: SymbolEntry 完整性 ============
    console.log('\n=== 测试12: SymbolEntry 字段完整性 ===');
    
    const entries = symbolIndex.lookup('proc_001');
    if (entries.length > 0) {
        const entry = entries[0];
        assert(entry.name !== undefined && entry.name !== '', 'name 字段应存在');
        assert(entry.type !== undefined && entry.type !== '', 'type 字段应存在');
        assert(entry.filePath !== undefined && entry.filePath !== '', 'filePath 字段应存在');
        assert(entry.line > 0, 'line 字段应大于0');
        assert(fs.existsSync(entry.filePath), 'filePath 应指向存在的文件');
    } else {
        assert(false, 'proc_001 应被索引');
    }

    // ============ 测试13: 影子构建期间旧索引可查 ============
    console.log('\n=== 测试13: 影子构建期间旧索引可查（Issue #38） ===');

    assert(symbolIndex.isBuilding() === false, '非构建期 isBuilding 应为 false');
    // 不 await：构建启动后立刻查询，应命中旧索引（而非清空后的部分结果）
    const shadowBuildPromise = symbolIndex.buildIndex(pathConfigs, ['.sql'], 100);
    assert(symbolIndex.isBuilding() === true, '构建期 isBuilding 应为 true');
    const shadowEntries = symbolIndex.lookup('large_test_pkg');
    assert(shadowEntries.length > 0, '构建期间旧索引应持续可查');
    const shadowDone = await shadowBuildPromise;
    assertEqual(shadowDone, true, '无取消时构建应成功返回 true');
    assert(symbolIndex.isBuilding() === false, '构建结束 isBuilding 应回到 false');
    assert(symbolIndex.lookup('large_test_pkg').length > 0, '构建结束后新索引应可查');

    // ============ 测试14: 构建期间变更重放不丢失 ============
    console.log('\n=== 测试14: 构建期间变更重放（Issue #38） ===');

    const pkgFile = path.join(testDir, 'large_package_100funcs.sql');
    const beforeReplayCount = symbolIndex.lookup('large_test_pkg').length;
    const replayBuildPromise = symbolIndex.buildIndex(pathConfigs, ['.sql'], 100);
    // 构建中触发 watcher 语义的更新 → 进入待处理队列，构建结束重放
    await symbolIndex.updateFile(pkgFile);
    await replayBuildPromise;
    assertEqual(
        symbolIndex.lookup('large_test_pkg').length,
        beforeReplayCount,
        '构建期间的更新重放后不应产生重复条目'
    );

    // ============ 测试15: 当前文件解析结果即时并入（upsert） ============
    console.log('\n=== 测试15: upsertFromParseResult 即时并入（Issue #38） ===');

    const { PLSQLParser } = require('../../out/parser');
    const upsertIndex = new SymbolIndex(mockOutputChannel);
    const upsertSource = fs.readFileSync(pkgFile, 'utf8');
    const upsertResult = await new PLSQLParser().parse(upsertSource, pkgFile);
    upsertIndex.upsertFromParseResult(upsertResult, pkgFile);
    const upserted = upsertIndex.lookup('large_test_pkg');
    assert(upserted.length > 0, 'upsert 后应能查到符号');
    assertEqual(upsertIndex.getStatus().fileCount, 1, 'upsert 后文件数应为 1');
    // 同文件重复 upsert 不产生重复条目
    upsertIndex.upsertFromParseResult(upsertResult, pkgFile);
    assertEqual(
        upsertIndex.lookup('large_test_pkg').length,
        upserted.length,
        '重复 upsert 不应产生重复条目'
    );

    // ============ 测试16: v1 旧格式缓存拒绝 ============
    console.log('\n=== 测试16: v1 旧格式缓存拒绝 ===');

    const v1Path = path.join(testDir, '.temp_symbol_index_v1.json');
    fs.writeFileSync(v1Path, JSON.stringify({
        version: 1, buildTime: 0, fileCount: 0, symbols: {}
    }), 'utf8');
    const v1Index = new SymbolIndex(mockOutputChannel);
    const v1Loaded = await v1Index.load(v1Path);
    assert(v1Loaded === false, 'v1 缓存应被拒绝（触发全量重建）');
    fs.unlinkSync(v1Path);

    // ============ 测试17: 双仓库路径真实同名冲突（Issue #38 E2E 的纯逻辑对照） ============
    console.log('\n=== 测试17: 双路径真实冲突按优先级消解 ===');

    const os = require('os');
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'plsql-outline-index-'));
    try {
        const dirA = path.join(tmpRoot, 'repo_a');
        const dirB = path.join(tmpRoot, 'repo_b');
        fs.mkdirSync(dirA, { recursive: true });
        fs.mkdirSync(dirB, { recursive: true });
        fs.writeFileSync(path.join(dirA, 'pkg_a.pkb'),
            'CREATE OR REPLACE PACKAGE BODY pkg_a AS\n' +
            '    PROCEDURE process_data(p_a IN VARCHAR2) IS\n' +
            '    BEGIN\n        NULL;\n    END process_data;\n' +
            'END pkg_a;\n/\n', 'utf8');
        fs.writeFileSync(path.join(dirA, 'shared_a.sql'),
            'CREATE OR REPLACE PROCEDURE process_data(p_x IN NUMBER) IS\n' +
            'BEGIN\n    NULL;\nEND process_data;\n/\n', 'utf8');
        fs.writeFileSync(path.join(dirB, 'pkg_b.pkb'),
            'CREATE OR REPLACE PACKAGE BODY pkg_b AS\n' +
            '    PROCEDURE process_data(p_b IN VARCHAR2) IS\n' +
            '    BEGIN\n        NULL;\n    END process_data;\n' +
            'END pkg_b;\n/\n', 'utf8');
        fs.writeFileSync(path.join(dirB, 'shared_b.sql'),
            'CREATE OR REPLACE PROCEDURE process_data(p_y IN DATE) IS\n' +
            'BEGIN\n    NULL;\nEND process_data;\n/\n', 'utf8');

        const dualIndex = new SymbolIndex(mockOutputChannel);
        await dualIndex.buildIndex(
            [{ path: dirA, priority: 1 }, { path: dirB, priority: 2 }], ['.sql', '.pkb'], 100);

        // 裸名 process_data 共 4 条（2 独立 + 2 包成员）
        assertEqual(dualIndex.lookup('process_data').length, 4,
            '双仓库同名符号应全部入索引');

        // A 优先级高：全部结果来自 A
        const aFirst = dualIndex.lookupWithPriority('process_data', undefined,
            [{ path: dirA, priority: 1 }, { path: dirB, priority: 2 }]);
        assert(aFirst.length > 0 && aFirst.every(e =>
            path.normalize(e.filePath).toLowerCase().startsWith(path.normalize(dirA).toLowerCase())
        ), 'A 优先时结果应全部来自 A');

        // B 优先级高：全部结果来自 B
        const bFirst = dualIndex.lookupWithPriority('process_data', undefined,
            [{ path: dirB, priority: 1 }, { path: dirA, priority: 2 }]);
        assert(bFirst.length > 0 && bFirst.every(e =>
            path.normalize(e.filePath).toLowerCase().startsWith(path.normalize(dirB).toLowerCase())
        ), 'B 优先时结果应全部来自 B');

        // 包名限定优先于路径优先级
        const qualified = dualIndex.lookup('process_data', 'pkg_b');
        assertEqual(qualified.length, 1, '包名限定应唯一命中 pkg_b 成员');
        assert(path.normalize(qualified[0].filePath).toLowerCase()
            .startsWith(path.normalize(dirB).toLowerCase()),
            'pkg_b 限定应命中 B 仓库（即使 A 优先级更高）');
    } finally {
        fs.rmSync(tmpRoot, { recursive: true, force: true });
    }

    // ============ 测试18: mtime 增量构建（Issue #39） ============
    console.log('\n=== 测试18: mtime 增量构建 ===');

    const tmpIncr = fs.mkdtempSync(path.join(require('os').tmpdir(), 'plsql-outline-incr-'));
    try {
        const procSrc = (name) => `CREATE OR REPLACE PROCEDURE ${name} IS\nBEGIN\n    NULL;\nEND ${name};\n/\n`;
        fs.writeFileSync(path.join(tmpIncr, 'a.sql'), procSrc('pa'), 'utf8');
        fs.writeFileSync(path.join(tmpIncr, 'b.sql'), procSrc('pb'), 'utf8');

        const incrIndex = new SymbolIndex(mockOutputChannel);
        await incrIndex.buildIndex([{ path: tmpIncr, priority: 1 }], ['.sql'], 100);
        assertEqual(incrIndex.lookup('PA').length, 1, '首次构建：pa 入索引');
        assertEqual(incrIndex.lookup('PB').length, 1, '首次构建：pb 入索引');

        // 二次构建无变化：全部命中 mtime 缓存，无重扫（building 快照 total 恒 0）
        const snapshots = [];
        incrIndex.setStatusListener(p => snapshots.push({ ...p }));
        await incrIndex.buildIndex([{ path: tmpIncr, priority: 1 }], ['.sql'], 100);
        incrIndex.setStatusListener(null);
        assert(incrIndex.lookup('PA').length === 1 && incrIndex.lookup('PB').length === 1,
            '命中缓存的重建后符号保持');
        assert(!snapshots.some(p => p.building && p.total > 0),
            `无变化构建不应有重扫文件，快照 ${JSON.stringify(snapshots)}`);

        // 修改 + 新增 + 删除 → 只重扫变化文件，索引正确迁移
        await new Promise(r => setTimeout(r, 5)); // 保证 mtime 推进
        fs.writeFileSync(path.join(tmpIncr, 'b.sql'), procSrc('pb2'), 'utf8');
        fs.writeFileSync(path.join(tmpIncr, 'c.sql'), procSrc('pc'), 'utf8');
        fs.unlinkSync(path.join(tmpIncr, 'a.sql'));
        await incrIndex.buildIndex([{ path: tmpIncr, priority: 1 }], ['.sql'], 100);
        assertEqual(incrIndex.lookup('PA').length, 0, '删除文件后符号应移除');
        assertEqual(incrIndex.lookup('PB').length, 0, '修改文件的旧符号应被替换');
        assertEqual(incrIndex.lookup('PB2').length, 1, '修改后的新符号应入索引');
        assertEqual(incrIndex.lookup('PC').length, 1, '新增文件符号应入索引');

        // forceFull：忽略 mtime 缓存全量重扫
        await incrIndex.buildIndex([{ path: tmpIncr, priority: 1 }], ['.sql'], 100, { forceFull: true });
        assert(incrIndex.lookup('PB2').length === 1 && incrIndex.lookup('PC').length === 1,
            'forceFull 全量重扫后符号保持');
    } finally {
        fs.rmSync(tmpIncr, { recursive: true, force: true });
    }

    // ============ 测试19: 旧格式缓存拒绝（v4 起含游标搜索条目） ============
    console.log('\n=== 测试19: v2/v3 旧格式缓存拒绝 ===');

    for (const ver of [2, 3]) {
        const oldPath = path.join(testDir, `.temp_symbol_index_v${ver}.json`);
        const body = ver === 2
            ? { version: 2, buildTime: 0, fileCount: 0, symbols: {}, fileSymbols: {} }
            : { version: 3, buildTime: 0, fileCount: 0, symbols: {}, fileSymbols: {}, fileStats: {} };
        fs.writeFileSync(oldPath, JSON.stringify(body), 'utf8');
        const oldIndex = new SymbolIndex(mockOutputChannel);
        const oldLoaded = await oldIndex.load(oldPath);
        assert(oldLoaded === false, `v${ver} 缓存应被拒绝（触发全量重建）`);
        fs.unlinkSync(oldPath);
    }

    // ============ 测试20: 工作区符号搜索（Ctrl+T，Issue #39） ============
    console.log('\n=== 测试20: 工作区符号搜索 ===');

    const foundByName = symbolIndex.searchSymbols('func_00');
    assert(foundByName.length > 0 &&
        foundByName.every(e => e.name.toUpperCase().includes('FUNC_00')),
        '按名搜索结果均包含查询词');
    const foundQualified = symbolIndex.searchSymbols('large_test_pkg.func_001');
    assert(foundQualified.length > 0 &&
        foundQualified.every(e => (e.packageName || '').toUpperCase() === 'LARGE_TEST_PKG'),
        'pkg.func 写法按包名+名称双重过滤');
    assertEqual(symbolIndex.searchSymbols('').length, 0, '空查询应返回空');

    // ============ 测试21: 游标为仅搜索条目（Emon 决策，Issue #39） ============
    console.log('\n=== 测试21: 游标纳入搜索但不参与跳转 ===');

    const tmpCur = fs.mkdtempSync(path.join(require('os').tmpdir(), 'plsql-outline-cursor-'));
    try {
        const curFile = path.join(tmpCur, 'cur_pkg.pkb');
        fs.writeFileSync(curFile, [
            'CREATE OR REPLACE PACKAGE BODY cur_pkg AS',
            '    CURSOR c_pkg_level IS SELECT 1 FROM dual;',
            '    PROCEDURE m1 IS',
            '    BEGIN',
            '        NULL;',
            '    END m1;',
            'END cur_pkg;',
            '/'
        ].join('\n'), 'utf8');

        const curIndex = new SymbolIndex(mockOutputChannel);
        await curIndex.buildIndex([{ path: tmpCur, priority: 1 }], ['.pkb'], 100);

        // 跳转口径：lookup 不返回游标（Ctrl+Click 语义不变）
        assertEqual(curIndex.lookup('c_pkg_level').length, 0, '游标不应出现在跳转查找结果');
        assertEqual(curIndex.lookupWithPriority('c_pkg_level', undefined,
            [{ path: tmpCur, priority: 1 }]).length, 0, '优先级查找同样排除游标');

        // 搜索口径：Ctrl+T 可搜到，带所属包与声明行
        const hits = curIndex.searchSymbols('c_pkg_level');
        assertEqual(hits.length, 1, 'Ctrl+T 应搜到游标');
        assertEqual(hits[0].packageName, 'cur_pkg', '游标搜索结果带所属包');
        assertEqual(hits[0].line, 2, '游标搜索结果带声明行');
        const qualified = curIndex.searchSymbols('cur_pkg.c_pkg_level');
        assertEqual(qualified.length, 1, 'pkg.cursor 双重过滤命中');
    } finally {
        fs.rmSync(tmpCur, { recursive: true, force: true });
    }

    // ============ 输出结果 ============
    console.log('\n================================');
    console.log(`测试结果: ${passed}/${passed + failed} 通过`);
    
    if (failed > 0) {
        console.log(`\n失败: ${failed} 个测试`);
        process.exit(1);
    } else {
        console.log('\n所有测试通过!');
    }
    
    // 清理
    symbolIndex.dispose();
}

runTests().catch(err => {
    console.error('测试执行出错:', err);
    process.exit(1);
});

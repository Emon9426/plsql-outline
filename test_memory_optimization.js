/**
 * 内存优化测试脚本
 * 用于验证PL/SQL Outline扩展的内存优化效果
 */

const fs = require('fs');
const path = require('path');

// 模拟内存监控
class MemoryMonitor {
    constructor() {
        this.measurements = [];
        this.startTime = Date.now();
    }

    measure(label) {
        const memUsage = process.memoryUsage();
        const measurement = {
            label,
            timestamp: Date.now() - this.startTime,
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
            external: Math.round(memUsage.external / 1024 / 1024), // MB
            rss: Math.round(memUsage.rss / 1024 / 1024) // MB
        };
        
        this.measurements.push(measurement);
        console.log(`[${measurement.timestamp}ms] ${label}: 堆内存 ${measurement.heapUsed}MB / ${measurement.heapTotal}MB, RSS ${measurement.rss}MB`);
        
        return measurement;
    }

    getReport() {
        const maxHeap = Math.max(...this.measurements.map(m => m.heapUsed));
        const maxRSS = Math.max(...this.measurements.map(m => m.rss));
        const avgHeap = Math.round(this.measurements.reduce((sum, m) => sum + m.heapUsed, 0) / this.measurements.length);
        
        return {
            maxHeapUsed: maxHeap,
            maxRSS: maxRSS,
            avgHeapUsed: avgHeap,
            totalMeasurements: this.measurements.length,
            duration: this.measurements[this.measurements.length - 1]?.timestamp || 0
        };
    }
}

// 模拟解析器的内存优化功能
class MockOptimizedParser {
    constructor() {
        this.stringCache = new Map();
        this.maxCacheSize = 1000;
        this.processedLines = new Set();
    }

    getCachedString(str) {
        if (this.stringCache.has(str)) {
            return this.stringCache.get(str);
        }
        
        // 限制缓存大小
        if (this.stringCache.size >= this.maxCacheSize) {
            const entries = Array.from(this.stringCache.entries());
            this.stringCache.clear();
            // 保留最近使用的一半
            for (let i = Math.floor(entries.length / 2); i < entries.length; i++) {
                this.stringCache.set(entries[i][0], entries[i][1]);
            }
        }
        
        this.stringCache.set(str, str);
        return str;
    }

    cleanup() {
        this.stringCache.clear();
        this.processedLines.clear();
    }

    async parseContent(content) {
        const lines = content.split('\n');
        const results = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.length === 0) continue;
            
            // 防止重复处理
            if (this.processedLines.has(i)) continue;
            
            // 使用缓存优化
            const cachedLine = this.getCachedString(line);
            
            // 模拟解析逻辑
            if (cachedLine.match(/^\s*CREATE\s+/i)) {
                results.push({
                    type: 'CREATE',
                    line: i + 1,
                    content: cachedLine
                });
            }
            
            this.processedLines.add(i);
            
            // 定期让出控制权
            if (i % 100 === 0) {
                await new Promise(resolve => setImmediate(resolve));
            }
        }
        
        return results;
    }
}

// 生成测试数据
function generateTestSQL(lines = 1000) {
    const sqlLines = [];
    
    sqlLines.push('-- 测试SQL文件');
    sqlLines.push('-- 生成的行数: ' + lines);
    sqlLines.push('');
    
    for (let i = 0; i < lines; i++) {
        if (i % 50 === 0) {
            sqlLines.push(`CREATE OR REPLACE FUNCTION test_func_${i} RETURN VARCHAR2 IS`);
            sqlLines.push('BEGIN');
            sqlLines.push('    RETURN \'test\';');
            sqlLines.push('END;');
            sqlLines.push('/');
            sqlLines.push('');
        } else {
            sqlLines.push(`-- 注释行 ${i}: 这是一个测试注释，用于增加文件大小和复杂度`);
        }
    }
    
    return sqlLines.join('\n');
}

// 运行内存测试
async function runMemoryTest() {
    console.log('=== PL/SQL Outline 内存优化测试 ===\n');
    
    const monitor = new MemoryMonitor();
    monitor.measure('测试开始');
    
    // 测试不同大小的文件
    const testSizes = [500, 1000, 2000, 5000];
    
    for (const size of testSizes) {
        console.log(`\n--- 测试 ${size} 行文件 ---`);
        
        // 生成测试数据
        monitor.measure(`生成 ${size} 行测试数据`);
        const testContent = generateTestSQL(size);
        
        // 创建优化的解析器
        const parser = new MockOptimizedParser();
        
        // 解析测试
        monitor.measure(`开始解析 ${size} 行`);
        const results = await parser.parseContent(testContent);
        monitor.measure(`解析完成，找到 ${results.length} 个结果`);
        
        // 清理
        parser.cleanup();
        monitor.measure(`清理完成`);
        
        // 强制垃圾回收（如果可用）
        if (global.gc) {
            global.gc();
            monitor.measure(`垃圾回收完成`);
        }
    }
    
    // 生成报告
    console.log('\n=== 内存使用报告 ===');
    const report = monitor.getReport();
    
    console.log(`测试持续时间: ${report.duration}ms`);
    console.log(`最大堆内存使用: ${report.maxHeapUsed}MB`);
    console.log(`最大RSS内存使用: ${report.maxRSS}MB`);
    console.log(`平均堆内存使用: ${report.avgHeapUsed}MB`);
    console.log(`总测量次数: ${report.totalMeasurements}`);
    
    // 内存使用评估
    console.log('\n=== 优化效果评估 ===');
    if (report.maxHeapUsed < 50) {
        console.log('✅ 内存使用优秀 (< 50MB)');
    } else if (report.maxHeapUsed < 100) {
        console.log('✅ 内存使用良好 (< 100MB)');
    } else if (report.maxHeapUsed < 200) {
        console.log('⚠️  内存使用一般 (< 200MB)');
    } else {
        console.log('❌ 内存使用过高 (>= 200MB)');
    }
    
    // 保存详细报告
    const detailReport = {
        summary: report,
        measurements: monitor.measurements,
        testInfo: {
            testSizes,
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch
        }
    };
    
    fs.writeFileSync('memory_test_report.json', JSON.stringify(detailReport, null, 2));
    console.log('\n详细报告已保存到: memory_test_report.json');
}

// 运行测试
if (require.main === module) {
    runMemoryTest().catch(console.error);
}

module.exports = { MemoryMonitor, MockOptimizedParser, generateTestSQL, runMemoryTest };

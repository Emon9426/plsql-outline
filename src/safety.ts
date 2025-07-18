import { SafetyConfig, LogLevel, ParseError } from './types';

/**
 * 默认安全配置
 */
export const DEFAULT_SAFETY_CONFIG: SafetyConfig = {
    maxLines: 50000,
    maxNestingDepth: 20,
    maxParseTime: 30000,
    maxBeginEndCounter: 100,
    maxStackDepth: 50,
    maxIterations: 100000,
    progressCheckInterval: 100
};

/**
 * 安全错误类
 */
export class SafetyError extends Error {
    public line: number;
    
    constructor(message: string, line: number = 0) {
        super(message);
        this.name = 'SafetyError';
        this.line = line;
    }
}

/**
 * 解析安全管理器
 */
export class ParseSafetyManager {
    private config: SafetyConfig;
    private currentLine: number = 0;
    private iterationCount: number = 0;
    private loopCount: number = 0;
    private maxLoopCount: number = 10;

    constructor(config: SafetyConfig = DEFAULT_SAFETY_CONFIG) {
        this.config = config;
    }

    /**
     * 重置计数器
     */
    reset(): void {
        this.currentLine = 0;
        this.iterationCount = 0;
        this.loopCount = 0;
    }

    /**
     * 检查行数限制
     */
    checkLineLimit(): boolean {
        this.currentLine++;
        if (this.currentLine > this.config.maxLines) {
            throw new Error(`文件行数超过限制 ${this.config.maxLines}`);
        }
        return true;
    }

    /**
     * 检查迭代次数限制
     */
    checkIterationLimit(): boolean {
        this.iterationCount++;
        if (this.iterationCount > this.config.maxIterations) {
            throw new Error(`迭代次数超过限制 ${this.config.maxIterations}`);
        }
        return true;
    }

    /**
     * 检查解析状态是否陷入循环
     */
    checkParseLoop(currentLine: number, lastProcessedLine: number): void {
        // 只有当连续多次处理同一行且没有进展时才认为是循环
        if (currentLine === lastProcessedLine && currentLine > 0) {
            this.loopCount++;
            if (this.loopCount > this.maxLoopCount) {
                throw new SafetyError('检测到解析状态循环', currentLine);
            }
        } else {
            // 重置循环计数器
            this.loopCount = 0;
        }
    }

    /**
     * 获取当前行号
     */
    getCurrentLine(): number {
        return this.currentLine;
    }

    /**
     * 获取迭代次数
     */
    getIterationCount(): number {
        return this.iterationCount;
    }
}

/**
 * 嵌套深度管理器
 */
export class NestingManager {
    private maxNestingDepth: number;
    private currentDepth: number = 0;

    constructor(maxDepth: number = DEFAULT_SAFETY_CONFIG.maxNestingDepth) {
        this.maxNestingDepth = maxDepth;
    }

    /**
     * 进入嵌套层级
     */
    enterNesting(): void {
        this.currentDepth++;
        if (this.currentDepth > this.maxNestingDepth) {
            throw new Error(`嵌套深度超过限制 ${this.maxNestingDepth}`);
        }
    }

    /**
     * 退出嵌套层级
     */
    exitNesting(): void {
        this.currentDepth = Math.max(0, this.currentDepth - 1);
    }

    /**
     * 获取当前深度
     */
    getCurrentDepth(): number {
        return this.currentDepth;
    }

    /**
     * 重置深度
     */
    reset(): void {
        this.currentDepth = 0;
    }
}

/**
 * 超时管理器
 */
export class TimeoutManager {
    private maxParseTime: number;
    private startTime: number = 0;

    constructor(maxTime: number = DEFAULT_SAFETY_CONFIG.maxParseTime) {
        this.maxParseTime = maxTime;
    }

    /**
     * 开始计时
     */
    startParsing(): void {
        this.startTime = Date.now();
    }

    /**
     * 检查是否超时
     */
    checkTimeout(): boolean {
        const elapsed = Date.now() - this.startTime;
        if (elapsed > this.maxParseTime) {
            throw new Error(`解析超时，已用时 ${elapsed}ms，限制 ${this.maxParseTime}ms`);
        }
        return true;
    }

    /**
     * 获取已用时间
     */
    getElapsedTime(): number {
        return Date.now() - this.startTime;
    }
}

/**
 * BEGIN_END计数器
 */
export class BeginEndCounter {
    private counter: number = 0;
    private maxCounter: number;

    constructor(maxCounter: number = DEFAULT_SAFETY_CONFIG.maxBeginEndCounter) {
        this.maxCounter = maxCounter;
    }

    /**
     * 增加计数
     */
    increment(): void {
        this.counter++;
        if (this.counter > this.maxCounter) {
            throw new Error(`BEGIN_END_COUNTER 超过安全限制 ${this.maxCounter}`);
        }
    }

    /**
     * 减少计数
     */
    decrement(): void {
        this.counter--;
        if (this.counter < 0) {
            throw new Error('BEGIN_END_COUNTER 出现负值，可能存在不匹配的END');
        }
    }

    /**
     * 获取当前值
     */
    getValue(): number {
        return this.counter;
    }

    /**
     * 重置计数器
     */
    reset(): void {
        this.counter = 0;
    }
}

/**
 * 结构验证器
 */
export class StructureValidator {
    private beginStack: Array<{line: number, type: string}> = [];
    private maxStackSize: number;

    constructor(maxStackSize: number = DEFAULT_SAFETY_CONFIG.maxStackDepth) {
        this.maxStackSize = maxStackSize;
    }

    /**
     * 记录BEGIN语句
     */
    recordBegin(line: number, type: string): void {
        this.beginStack.push({line, type});
        if (this.beginStack.length > this.maxStackSize) {
            throw new Error(`BEGIN语句嵌套过深，超过限制 ${this.maxStackSize}`);
        }
    }

    /**
     * 记录END语句
     */
    recordEnd(line: number): void {
        if (this.beginStack.length === 0) {
            throw new Error(`第${line}行：发现不匹配的END语句`);
        }
        this.beginStack.pop();
    }

    /**
     * 获取当前栈深度
     */
    getStackDepth(): number {
        return this.beginStack.length;
    }

    /**
     * 检查是否有未匹配的BEGIN
     */
    hasUnmatchedBegin(): boolean {
        return this.beginStack.length > 0;
    }

    /**
     * 获取未匹配的BEGIN信息
     */
    getUnmatchedBegins(): Array<{line: number, type: string}> {
        return [...this.beginStack];
    }

    /**
     * 重置验证器
     */
    reset(): void {
        this.beginStack = [];
    }
}

/**
 * 状态跟踪器（检测循环状态）
 */
export class StateTracker {
    private stateHistory: string[] = [];
    private maxHistorySize: number = 1000;

    /**
     * 记录状态
     */
    recordState(state: string): void {
        // 检测重复状态模式
        if (this.detectCycle(state)) {
            throw new Error('检测到解析状态循环');
        }
        
        this.stateHistory.push(state);
        if (this.stateHistory.length > this.maxHistorySize) {
            this.stateHistory.shift(); // 保持历史记录大小
        }
    }

    /**
     * 检测循环模式
     */
    private detectCycle(newState: string): boolean {
        const recentStates = this.stateHistory.slice(-10);
        const pattern = recentStates.join('|') + '|' + newState;
        
        // 检测简单的重复模式（连续重复3次以上）
        const regex = /(.+)\1{3,}/;
        return regex.test(pattern);
    }

    /**
     * 重置状态历史
     */
    reset(): void {
        this.stateHistory = [];
    }
}

/**
 * 进度监控器
 */
export class ProgressMonitor {
    private lastProgress: number = 0;
    private stuckCounter: number = 0;
    private maxStuckCount: number = 100;

    /**
     * 更新进度
     */
    updateProgress(currentLine: number, totalLines: number): void {
        const progress = totalLines > 0 ? currentLine / totalLines : 0;
        
        if (Math.abs(progress - this.lastProgress) < 0.001) {
            this.stuckCounter++;
            if (this.stuckCounter > this.maxStuckCount) {
                throw new Error('解析进度停滞，可能存在死循环');
            }
        } else {
            this.stuckCounter = 0;
        }
        
        this.lastProgress = progress;
    }

    /**
     * 重置监控器
     */
    reset(): void {
        this.lastProgress = 0;
        this.stuckCounter = 0;
    }
}

/**
 * 安全文件读取器
 */
export class SafeFileReader {
    private lineIndex: number = 0;
    private lines: string[];
    private safetyManager: ParseSafetyManager;

    constructor(content: string, safetyManager: ParseSafetyManager) {
        this.lines = content.split('\n');
        this.safetyManager = safetyManager;
    }

    /**
     * 读取下一行
     */
    readNextLine(): string | null {
        this.safetyManager.checkIterationLimit();
        
        if (this.lineIndex >= this.lines.length) {
            return null; // 文件结束
        }
        
        return this.lines[this.lineIndex++];
    }

    /**
     * 是否还有更多行
     */
    hasMoreLines(): boolean {
        return this.lineIndex < this.lines.length;
    }

    /**
     * 获取当前行号
     */
    getCurrentLineNumber(): number {
        return this.lineIndex;
    }

    /**
     * 获取总行数
     */
    getTotalLines(): number {
        return this.lines.length;
    }

    /**
     * 重置读取器
     */
    reset(): void {
        this.lineIndex = 0;
    }
}

/**
 * 综合安全管理器
 */
export class ComprehensiveSafetyManager {
    private safetyManager: ParseSafetyManager;
    private nestingManager: NestingManager;
    private timeoutManager: TimeoutManager;
    private beginEndCounter: BeginEndCounter;
    private structureValidator: StructureValidator;
    private stateTracker: StateTracker;
    private progressMonitor: ProgressMonitor;

    constructor(config: SafetyConfig = DEFAULT_SAFETY_CONFIG) {
        this.safetyManager = new ParseSafetyManager(config);
        this.nestingManager = new NestingManager(config.maxNestingDepth);
        this.timeoutManager = new TimeoutManager(config.maxParseTime);
        this.beginEndCounter = new BeginEndCounter(config.maxBeginEndCounter);
        this.structureValidator = new StructureValidator(config.maxStackDepth);
        this.stateTracker = new StateTracker();
        this.progressMonitor = new ProgressMonitor();
    }

    /**
     * 开始解析
     */
    startParsing(): void {
        this.reset();
        this.timeoutManager.startParsing();
    }

    /**
     * 执行所有安全检查
     */
    performSafetyChecks(currentLine: number, totalLines: number, state?: string): void {
        this.safetyManager.checkLineLimit();
        this.timeoutManager.checkTimeout();
        this.progressMonitor.updateProgress(currentLine, totalLines);
        
        if (state) {
            this.stateTracker.recordState(state);
        }
    }

    /**
     * 重置所有管理器
     */
    reset(): void {
        this.safetyManager.reset();
        this.nestingManager.reset();
        this.beginEndCounter.reset();
        this.structureValidator.reset();
        this.stateTracker.reset();
        this.progressMonitor.reset();
    }

    /**
     * 获取各个管理器的实例
     */
    getSafetyManager(): ParseSafetyManager { return this.safetyManager; }
    getNestingManager(): NestingManager { return this.nestingManager; }
    getTimeoutManager(): TimeoutManager { return this.timeoutManager; }
    getBeginEndCounter(): BeginEndCounter { return this.beginEndCounter; }
    getStructureValidator(): StructureValidator { return this.structureValidator; }
    getStateTracker(): StateTracker { return this.stateTracker; }
    getProgressMonitor(): ProgressMonitor { return this.progressMonitor; }

    /**
     * 生成安全报告
     */
    generateSafetyReport(): any {
        return {
            currentLine: this.safetyManager.getCurrentLine(),
            iterationCount: this.safetyManager.getIterationCount(),
            nestingDepth: this.nestingManager.getCurrentDepth(),
            elapsedTime: this.timeoutManager.getElapsedTime(),
            beginEndCounter: this.beginEndCounter.getValue(),
            structureStackDepth: this.structureValidator.getStackDepth(),
            hasUnmatchedBegin: this.structureValidator.hasUnmatchedBegin(),
            unmatchedBegins: this.structureValidator.getUnmatchedBegins()
        };
    }
}

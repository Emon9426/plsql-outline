// ESLint flat config（v1.8.0 起落地；此前 devDependencies 里的 eslint 一直没有配置文件）
// 只检查 src/——tests/ 为自研断言脚本，out/ 为编译产物，均不检查。
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['out/**', 'node_modules/**', 'tests/**', 'release/**', 'docs/**', 'scripts/**']
    },
    ...tseslint.configs.recommended.map(config => ({
        ...config,
        files: ['src/**/*.ts']
    })),
    {
        files: ['src/**/*.ts'],
        rules: {
            // 本项目为中文注释的手写解析器：允许带下划线前缀的未用参数，
            // any 仅允许在既有 webview 消息边界等处（数量受控）
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            'no-prototype-builtins': 'off'
        }
    }
);

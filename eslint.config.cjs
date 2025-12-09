const js = require('@eslint/js');
const ts = require('typescript-eslint');
const prettier = require('eslint-config-prettier');

module.exports = [
    js.configs.recommended,
    ...ts.configs.recommended,
    prettier,
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: ts.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
        },
        ignores: ['eslint.config.cjs', 'ecosystem.config.js'],
    },
];

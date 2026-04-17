/* eslint-env node */
/* eslint-disable no-undef */
// eslint.config.js (CommonJS)
const js = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
const prettier = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    ignores: ['node_modules/**'],
    languageOptions: {
      parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        console: true,
        process: true,
        module: true,
        __dirname: true,
        require: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off', // tắt rule JS gốc
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  prettier,
];

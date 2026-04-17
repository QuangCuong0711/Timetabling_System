// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

const frontendFiles = ['frontend/**/*.{js,jsx}'];
const frontendIgnores = ['frontend/dist/**'];

const frontendHooksConfig = {
  ...reactHooks.configs['recommended-latest'],
  files: frontendFiles,
  ignores: frontendIgnores,
};

const frontendRefreshConfig = {
  ...reactRefresh.configs.vite,
  files: frontendFiles,
  ignores: frontendIgnores,
};

export default [
  js.configs.recommended,
  {
    files: frontendFiles,
    ignores: frontendIgnores,
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  frontendHooksConfig,
  frontendRefreshConfig,
  {
    files: ['backend/src/**/*.ts'],
    ignores: ['frontend/**', 'node_modules/**'],
    languageOptions: {
      parser,
      parserOptions: {
        project: ['./backend/tsconfig.json'],
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

// Migrated from .eslintrc.json for ESLint v9+
import js from '@eslint/js';
import next from 'eslint-config-next';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config} */
export default [
  js.configs.recommended,
  ...next,
  ...prettier,
  {
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];

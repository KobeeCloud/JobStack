/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // Next.js recommended rules (incl. core-web-vitals)
  ...require('eslint-config-next'),
  // Prettier should disable formatting-related rules
  require('eslint-config-prettier'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      // eslint-config-next already brings react-hooks; keep the same intent as .eslintrc.json
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]

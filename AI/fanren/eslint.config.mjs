import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { sourceType: 'module', ecmaVersion: 2022 },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['**/assets/images/screen_*', '**/assets/animation/code_*'], message: '禁止直接引用原始素材文件名，请通过 asset manifest 的逻辑 ID 引用。' }] },
      ],
    },
  },
  {
    files: ['tools/**/*.mjs'],
    languageOptions: { parserOptions: { sourceType: 'module', ecmaVersion: 2022 } },
    rules: {},
  },
];

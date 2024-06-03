import { ESLint } from 'eslint';

export default new ESLint({
  overrideConfig: {
    parser: '@typescript-eslint/parser',
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ],
    plugins: [
      '@typescript-eslint',
      'prettier',
      'import',
      'decorator-position',
      'react-hooks',
      'react',
    ],
    rules: {
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 120,
        },
      ],
      'no-console': 'warn',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-floating-promises': ['warn'],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-use-before-define': 0,
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      'no-shadow': 'off',
      'max-params': ['error', 6],
      'no-nested-ternary': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'require-await': 'off',
      'no-return-await': 'error',
      'react/prop-types': 0,
      'react/display-name': 0,
      'import/order': [
        'error',
        {
          pathGroups: [
            {
              pattern: 'react',
              group: 'builtin',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          groups: [
            ['builtin', 'external'],
            'internal',
            'parent',
            ['sibling', 'index'],
          ],
          alphabetize: {
            order: 'asc',
          },
        },
      ],
      'max-lines': [
        'error',
        { max: 1000, skipBlankLines: true, skipComments: true },
      ],
    },
    ignorePatterns: ['.eslint.config.mjs', 'node_modules'],
  },
});

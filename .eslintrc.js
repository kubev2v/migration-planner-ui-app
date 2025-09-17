module.exports = {
  extends: [
    '@redhat-cloud-services/eslint-config-redhat-cloud-services', 
    'prettier' // Disable ESLint rules that conflict with Prettier
  ],
  globals: {
    insights: 'readonly',
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'simple-import-sort', 'react-hooks'],
      extends: ['plugin:@typescript-eslint/recommended', 'plugin:react-hooks/recommended'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'all',
            argsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/explicit-function-return-type': 'warn',
        'sort-imports': 'off', // Disable default sort-imports in favor of simple-import-sort
        'simple-import-sort/imports': [
          'error',
          {
            'groups': [
              // `react` first, `next` second, then packages starting with a character
              ['^react$', '^next', '^[a-z]'],
              // Packages starting with `@`
              ['^@'],
              // Packages starting with `~`
              ['^~'],
              // Imports starting with `../`
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              // Imports starting with `./`
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              // Style imports
              ['^.+\\.s?css$'],
              // Side effect imports
              ['^\\u0000']
            ]
          }]                 
      },
    },
  ],
  rules: {
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
      },
    ],
    // Enable this if you want to use absolute import paths
    'rulesdir/forbid-pf-relative-imports': 'off',
    // Disable prettier ESLint rules since we use separate format validation
    'prettier/prettier': 'off',
  },
};

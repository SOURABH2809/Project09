import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/database/generated/**',
      '**/coverage/**',
      '**/*.js',  // Skip all .js files, only lint .ts
    ]
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
         ...globals.es2021, 
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { 
          args: 'none', 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'  
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'eslint-comments/no-unused-disable': 'off',

      // Bugs & correctness
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-duplicate-imports': 'error',
      'no-empty': ['warn', { allowEmptyCatch: true }],

      // Safety
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-return-await': 'error',

      // Readability
      'no-var': 'error',
      'prefer-const': 'error',

    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "no-undef": "off"
    }
  }
];

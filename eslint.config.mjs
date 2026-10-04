import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    ignores: ['dist/**'],

    linterOptions: {
      noInlineConfig: true,
    },
  },

  {
    files: ['**/*.ts'],

    languageOptions: {
      globals: globals.browser,
    },

    extends: [js.configs.recommended, tseslint.configs.recommended],

    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
    },
  },
]);

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import unicorn from 'eslint-plugin-unicorn';

export default defineConfig([
  {
    ignores: ['dist/**'],

    linterOptions: {
      noInlineConfig: true,
    },
  },

  {
    files: ['**/*.ts'],

    plugins: {
      unicorn,
    },

    languageOptions: {
      globals: globals.browser,
    },

    extends: [js.configs.recommended, tseslint.configs.recommended, 'unicorn/recommended'],

    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
]);

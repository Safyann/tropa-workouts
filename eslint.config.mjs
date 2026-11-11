import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['.build-check/', 'dist/', 'graphify-out/', 'storybook-static/']),
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    extends: [js.configs.recommended],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
  },
  {
    files: ['src/**/*.{ts,tsx}', '.storybook/preview.tsx'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['scripts/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['scripts/worker.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        // Эти переменные добавляет prepare-offline.mjs при генерации сервис-воркера.
        assets: 'readonly',
        version: 'readonly',
      },
    },
  },
  prettier,
);

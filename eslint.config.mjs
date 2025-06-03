import js from '@eslint/js';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { FlatCompat } from '@eslint/eslintrc';

/**
 * Production-ready ESLint Configuration
 * Strict rules for code quality and consistency
 */

const reactPlugin = eslintPluginReact || {};
const reactHooksPlugin = eslintPluginReactHooks || {};

// Next.js compatibility
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});
const nextRules = compat.extends('next/core-web-vitals');

const baseConfig = {
  files: ['src/**/*.{js,mjs,cjs,jsx,ts,tsx}'],
  ignores: [
    '**/node_modules/**',
    '**/.next/**',
    '**/out/**',
    '**/build/**',
    '**/dist/**',
    '**/coverage/**',
    '**/test-results/**',
    '**/playwright-report/**',
    'prisma/**',
    'public/**',
    '.vercel/**',
    '.github/**',
    'docs/**',
    'backup/**',
  ],
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2022,
      React: 'readonly',
      JSX: 'readonly',
    },
  },
  linterOptions: {
    reportUnusedDisableDirectives: 'error',
  },
  plugins: {
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
  },
  rules: {
    ...js.configs.recommended.rules,
    'no-unused-vars': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-script-url': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-return': 'error',
    'no-unreachable': 'error',
    'consistent-return': 'error',
    'eqeqeq': ['error', 'always'],
    'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/no-unescaped-entities': 'off',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-no-script-url': 'error',
  },
};
const reactConfig = {
  files: ['src/**/*.{jsx,tsx}'],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    ...(reactPlugin.configs?.recommended?.rules || {}),
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'error',
    'react/jsx-key': 'error',
    'react/no-array-index-key': 'off',
    'react/no-direct-mutation-state': 'error',
    'react/no-typos': 'error',
  },
};
const typeScriptConfig = {
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
  languageOptions: {
    parser: tseslintParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      project: './tsconfig.json',
    },
  },
  plugins: {
    '@typescript-eslint': tseslintPlugin,
  },
  rules: {
    ...tseslintPlugin.configs.recommended.rules,
    '@typescript-eslint/no-unused-vars': ['error', {
      'vars': 'all',
      'args': 'after-used',
      'ignoreRestSiblings': true,
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/await-thenable': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
    // PRISMA TYPE ENFORCEMENT RULES
    'no-restricted-imports': ['error', {
      'patterns': [
        {
          'group': ['**/types/*', '!**/types/ui-types*'],
          'message': 'Import types from @prisma/client or @/lib/prisma-types instead of manual type files. UI component types from @/types/ui-types are allowed.'
        }
      ],
      'paths': [
        {
          'name': '@/types/customer-types',
          'message': 'Use @/lib/prisma-types for Customer types - they are auto-generated from Prisma'
        },
        {
          'name': '@/types/payments-types',
          'message': 'Use @/lib/prisma-types for Payment types - they are auto-generated from Prisma'
        },
        {
          'name': '@/types/booking-types',
          'message': 'Use @/lib/prisma-types for Booking types - they are auto-generated from Prisma'
        },
        {
          'name': '@/types/appointment-types',
          'message': 'Use @/lib/prisma-types for Appointment types - they are auto-generated from Prisma'
        }
      ]
    }],
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
};

// Test files configuration
const testConfig = {
  files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
  languageOptions: {
    parser: tseslintParser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      project: './tsconfig.test.json',
    },
  },
  plugins: {
    '@typescript-eslint': tseslintPlugin,
  },
  rules: {
    ...tseslintPlugin.configs.recommended.rules,
    '@typescript-eslint/no-unused-vars': ['error', {
      'vars': 'all',
      'args': 'after-used',
      'ignoreRestSiblings': true,
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_'
    }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
};

export default [
  {
    ignores: [
      '**/.next/**',
      '**/node_modules/**',
      '**/out/**',
      '**/build/**',
      '**/dist/**',
      '**/coverage/**',
      '**/backup/**',
    ],
  },
  ...nextRules.map(config => ({
    ...config,
    rules: {
      ...config.rules,
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      'jsx-a11y/alt-text': 'warn',
      'import/no-anonymous-default-export': 'off',
    },
  })),
  baseConfig,
  reactConfig,
  typeScriptConfig,
  testConfig,
];
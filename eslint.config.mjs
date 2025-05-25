import js from '@eslint/js';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

/**
 * Production-ready ESLint Configuration
 * Strict rules for code quality and consistency
 */

const reactPlugin = eslintPluginReact || {};
const reactHooksPlugin = eslintPluginReactHooks || {};

// Base configuration for all JS/TS files
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
    
    // Error-level rules for production
    'no-unused-vars': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-script-url': 'error',
    
    // Code quality
    'prefer-const': 'error',
    'no-var': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-return': 'error',
    'no-unreachable': 'error',
    'consistent-return': 'error',
    'eqeqeq': ['error', 'always'],
    
    // React specific
    'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/no-unescaped-entities': 'off',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-no-script-url': 'error',
  },
};

// React configuration
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
    'react/no-array-index-key': 'warn',
    'react/no-direct-mutation-state': 'error',
    'react/no-typos': 'error',
  },
};

// TypeScript configuration
const typeScriptConfig = {
  files: ['src/**/*.{ts,tsx}'],
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
    
    // Strict TypeScript rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    
    // Override base rules for TypeScript
    'no-unused-vars': 'off',
    'no-undef': 'off',
  },
};

// Test files configuration
const testConfig = {
  files: [
    '**/*.test.{ts,tsx,js,jsx}',
    '**/*.spec.{ts,tsx,js,jsx}',
    '**/tests/**/*.{ts,tsx,js,jsx}',
    '**/e2e/**/*.{ts,tsx,js,jsx}',
  ],
  languageOptions: {
    globals: {
      ...globals.jest,
      ...globals.node,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'no-console': 'off',
  },
};

export default [
  baseConfig,
  reactConfig,
  typeScriptConfig,
  testConfig,
];
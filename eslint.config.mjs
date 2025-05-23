import js from '@eslint/js';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

// Fix for missing plugin: ensure plugins are correctly loaded
const reactPlugin = eslintPluginReact || {};
const reactHooksPlugin = eslintPluginReactHooks || {};

/**
 * ESLint Configuration for the tattoo-website project
 *
 * This file is organized into separate sections for:
 * 1. Base configuration - Applies to all JavaScript and TypeScript files with ignores
 * 2. React configuration - JSX/TSX specific rules
 * 3. TypeScript configuration - TS specific rules and overrides
 * 4. Special directories - Custom rules for specific project directories
 * 5. Test files - Configurations for all types of test files
 * 6. Generated files - Configurations for auto-generated files (Prisma, etc.)
 */

// =======================================
// 1. Base configuration for all JS/TS files
// =======================================
const baseConfig = {
  files: ['src/**/*.{js,mjs,cjs,jsx,ts,tsx}'], // Only lint src directory
  ignores: [
    // Build and output directories
    '**/node_modules/**',
    '**/.next/**',
    '.next',
    '**/out/**',
    '**/build/**',
    '**/dist/**',
    '**/coverage/**',

    // Test directories
    '**/tests/**',
    '**/test/**',
    '**/e2e/**',
    '**/unit/**',
    '**/test-results-standalone/**',
    'test-results/**',
    'playwright-report/**',
    'playwright-report-standalone/**',

    // Configuration files
    '.eslintrc.*',
    '.prettierrc.*',
    'eslint.config.mjs',
    'postcss.config.mjs',
    'next.config.js',
    'components.json',

    // Special directories that should never be linted
    'scripts/**',
    'docs/**',
    'logs/**',
    'public/**',
    'prisma/**', // Exclude entire prisma directory

    // Dot directories
    '.claude/**',
    '.github/**',
    '.husky/**',
    '.vscode/**',
    '.vercel/**',

    // Next.js generated files
    '.next/types/**/*',
    '.next/**/*',
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
    'no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'prefer-const': 'warn',
    'no-extra-boolean-cast': 'warn',
    'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'off',
  },
};

// =======================================
// 2. React configuration for JSX/TSX files
// =======================================
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
    'react/display-name': 'off',
  },
};
// =======================================
// 3. TypeScript configuration
// =======================================
const typeScriptConfig = [
  {
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
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
    },
  },
];

// =======================================
// 4. Special directory configurations
// =======================================
const srcConfig = {
  files: ['src/**/*.{js,mjs,cjs,jsx,ts,tsx}'],
  rules: {
    'no-unused-expressions': 'warn',
    'no-useless-concat': 'warn',
    'prefer-template': 'warn',
  },
};

// =======================================
// 5. Test files configurations
// =======================================

// Config for files in the tests directory
const testsDirectoryConfig = {
  files: ['tests/**/*.{ts,tsx,js,jsx,mjs}'],
  languageOptions: {
    globals: {
      ...globals.jest,
      ...globals.mocha,
      ...globals.browser,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-undef': 'off',
    'no-console': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    'no-case-declarations': 'off',
    'no-empty-pattern': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
  },
};

// Config for test files outside the tests directory (e.g., in src)
const testFilesConfig = {
  files: [
    '**/*.test.{ts,tsx,js,jsx,mjs}',
    '**/*.spec.{ts,tsx,js,jsx,mjs}',
    '**/test/**/*.{ts,tsx,js,jsx,mjs}',
    '**/tests/**/*.{ts,tsx,js,jsx,mjs}',
    '**/e2e/**/*.{ts,tsx,js,jsx,mjs}',
    '**/unit/**/*.{ts,tsx,js,jsx,mjs}',
  ],
  languageOptions: {
    globals: {
      ...globals.jest,
      ...globals.mocha,
      ...globals.browser,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-undef': 'off',
    'no-console': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    'no-case-declarations': 'off',
    'no-empty-pattern': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
  },
};

// =======================================
// 6. Generated files configurations
// =======================================
const prismaClientConfig = {
  files: ['prisma/client/**/*.ts', 'prisma/client/**/*.d.ts', 'prisma/**/*.d.ts'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-unnecessary-type-constraint': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    '@typescript-eslint/ban-types': 'off',
    'no-undef': 'off',
  },
};

// Global ignores that apply to ALL configurations
const globalIgnores = {
  ignores: [
    'prisma/**/*',
    'scripts/**/*',
    'docs/**/*',
    'public/**/*',
    '.next/**/*',
    'node_modules/**/*',
    '**/*.d.ts', // Ignore all TypeScript declaration files
  ]
};

// Prettier configuration to disable conflicting rules
const prettierConfig = {
  rules: {
    // Disable rules that conflict with Prettier
    'semi': 'off',
    'quotes': 'off',
    'comma-dangle': 'off',
    'max-len': 'off',
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'indent': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/semi': 'off',
    '@typescript-eslint/quotes': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    'prettier/prettier': 'off', // Disable if prettier plugin is installed
  },
};

// Export the complete configuration
export default [
  globalIgnores, // Apply global ignores first
  baseConfig,
  reactConfig,
  ...typeScriptConfig,
  srcConfig,
  testsDirectoryConfig,
  testFilesConfig,
  prismaClientConfig,
  // Add Prettier config last to override conflicting rules
  prettierConfig,
];

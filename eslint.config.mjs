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
  files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
  ignores: [
    // Build and output directories - use absolute patterns to ensure proper exclusion
    '**/node_modules/**',
    '**/.next/**',
    '.next',
    '**/out/**',
    '**/build/**',
    '**/dist/**',
    '**/coverage/**',
    '**/tests/**',
    '**/test/**',
    '**/e2e/**',
    '**/unit/**',
    '**/test-results-standalone/**',

    // Configuration files
    '.eslintrc.*',
    '.prettierrc.*',
    'eslint.config.mjs',
    'postcss.config.mjs',
    'next.config.js',
    'components.json',

    // Generated directories
    'prisma/**/*.ts',
    'prisma/**/*.js',
    'prisma/client/**',
    'prisma/migrations/**',
    'prisma/generated/**',
    'prisma/**/*.d.ts',

    // Special directories
    'scripts/**',
    'docs/**',
    'logs/**',
    'public/**',
    'supabase/**/*.ts',

    // Dot directories
    '.claude/**',
    '.github/**',
    '.husky/**',
    '.vscode/**',
    '.vercel/**',

    // Test results and output directories
    'test-results/**',
    'playwright-report/**',
    'playwright-report-standalone/**',

    // Next.js type definitions which are auto-generated
    '.next/types/**/*.ts',
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
  files: ['**/*.{jsx,tsx}'],
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
    files: ['**/*.{ts,tsx}'],
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

// Special config for Next.js generated types
const nextGeneratedTypesConfig = {
  files: ['.next/types/**/*.ts'],
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

// Export the complete configuration
export default [
  baseConfig,
  reactConfig,
  ...typeScriptConfig,
  srcConfig,
  testsDirectoryConfig,
  testFilesConfig,
  prismaClientConfig,
  nextGeneratedTypesConfig,
];

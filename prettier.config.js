/**
 * Prettier configuration for consistent code formatting
 * Matches the project's coding standards and ESLint rules
 */

module.exports = {
  // Core formatting
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,

  // Line formatting
  printWidth: 80,
  endOfLine: 'lf',

  // Object and array formatting
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,

  // Arrow function formatting
  arrowParens: 'avoid',

  // JSX formatting
  jsxSingleQuote: false,

  // File type specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
  ],

  // Plugin configuration
  plugins: [],

  // Ignored files (handled by .prettierignore)
  ignorePath: '.prettierignore',
};

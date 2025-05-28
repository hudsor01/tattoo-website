/**
 * Lint-staged configuration for pre-commit hooks
 * Ensures code quality before commits
 */

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => f.split(process.cwd())[1])
    .join(' --file ')}`

export default {
  '*.{js,jsx,ts,tsx}': [
    buildEslintCommand,
    'prettier --write',
  ],
  '*.{json,md,yml,yaml}': [
    'prettier --write',
  ],
  // Run type check on all TypeScript files
  '*.{ts,tsx}': () => 'npm run type-check',
}
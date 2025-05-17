/**
 * ESLint rules for enforcing consistent type imports
 * 
 * These rules should be merged into your existing ESLint configuration
 */

module.exports = {
  rules: {
    // Prevent direct imports from specific files
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['*/types/Appointment', '*/types/Booking', '*/types/Contacts', '*/types/Lead', '*/types/Payment'],
            message: 'Please import from the new types structure instead: import { ... } from "@/types"',
          },
        ],
      },
    ],
    
    // Ensure imports use the proper paths
    'import/no-duplicates': 'error',
    
    // Force imports to come from barrel files
    'import/no-internal-modules': [
      'error',
      {
        allow: [
          '@/types', 
          '@/types/core',
          '@/types/domain',
          '@/types/api', 
          '@/types/ui',
          '@/types/utils',
        ],
      },
    ],
    
    // Ensure there are no cyclic dependencies
    'import/no-cycle': 'error',
    
    // Group and order imports
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
          },
          {
            pattern: '@/types/**',
            group: 'internal',
            position: 'before',
          },
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    
    // Prevent unused types
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    
    // Ensure consistent type imports
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],
  },
};

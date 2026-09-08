// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'
import importPlugin from 'eslint-plugin-import'
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

import { noRawSection } from './scripts/eslint-rules/no-raw-section.mjs'
import { noButtonStyleClass } from './scripts/eslint-rules/no-button-style-class.mjs'
import { noRawButton } from './scripts/eslint-rules/no-raw-button.mjs'
import { noSectionRootToneClass } from './scripts/eslint-rules/no-section-root-tone-class.mjs'

const teavisionPlugin = {
  rules: {
    'no-button-style-class': noButtonStyleClass,
    'no-raw-button': noRawButton,
    'no-raw-section': noRawSection,
    'no-section-root-tone-class': noSectionRootToneClass,
  },
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    '.next-e2e/**',
    'out/**',
    'build/**',
    'storybook-static/**',
    'next-env.d.ts',
    // Generated GraphQL output is checked by TypeScript; lint the source queries/config.
    'src/lib/shopify/types/generated/**',
    // Git worktrees
    '.worktrees/**',
    // Claude Code agent worktrees and local settings
    '.claude/**',
    // Design mockup reference sources (not application code)
    'design/**',
    '.codex-temp/**',
  ]),
  ...storybook.configs['flat/recommended'],

  // Import ordering — all files
  {
    plugins: { import: importPlugin },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
          ],
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
        },
      ],
    },
  },

  // No default exports — components and lib files only
  {
    files: ['src/components/**/*.tsx', 'src/lib/**/*.ts'],
    rules: {
      'import/no-default-export': 'error',
    },
  },

  // Storefront section layout primitive
  {
    files: ['src/app/**/*.tsx', 'src/components/**/*.tsx'],
    ignores: ['src/components/ui/section/section.tsx'],
    plugins: { teavision: teavisionPlugin },
    rules: {
      'teavision/no-raw-section': 'error',
      'teavision/no-raw-button': 'error',
      'teavision/no-button-style-class': 'error',
      'teavision/no-section-root-tone-class': 'error',
    },
  },

  // Allow default exports where Next.js or Storybook requires them
  {
    files: [
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      'src/app/**/error.tsx',
      'src/app/**/not-found.tsx',
      'src/app/**/loading.tsx',
      'src/app/**/route.ts',
      'src/app/**/robots.ts',
      'src/app/**/sitemap.ts',
      '**/*.stories.tsx',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },

  // Explicit react-hooks exhaustive-deps (already set by eslint-config-next but made explicit)
  {
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])

export default eslintConfig

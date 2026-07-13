import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'coverage/**', 'next-env.d.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooksPlugin.configs.flat.recommended,
  jsxA11yPlugin.flatConfigs.recommended,
  eslintConfigPrettier,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // A scrollable `log` live region (Madame Zara's readings) must be keyboard-
      // focusable so it can be scrolled without a pointer (WCAG 2.1.1 — axe's
      // scrollable-region-focusable). Allow tabIndex on that role.
      'jsx-a11y/no-noninteractive-tabindex': [
        'error',
        { tags: [], roles: ['tabpanel', 'log'], allowExpressionValues: true },
      ],
    },
  },
  {
    // react-three-fiber JSX uses three.js scene-graph props unknown to eslint-plugin-react
    files: ['src/components/three/**'],
    rules: {
      'react/no-unknown-property': 'off',
    },
  },
  {
    // Client code gets CV data via props or the scene store — only the server-only
    // cv/ components read @/content/cv directly (docs/refactor-plan.md, Phase 2).
    files: ['src/components/overlays/**', 'src/components/nav/**', 'src/components/three/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/content/cv',
              message:
                'Client code must not import the CV directly — take props or read the scene store. See docs/refactor-plan.md Phase 2.',
            },
          ],
        },
      ],
    },
  },
  {
    // Recorded exceptions: the overlay content panels render CV sections directly
    // (moving the import server-side would shift the same bytes to the RSC
    // payload). Tests may read the CV to compute expected values.
    files: [
      'src/components/overlays/SectionContent.tsx',
      'src/components/overlays/CareerTickets.tsx',
      'src/**/*.test.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    // Node CLI scripts (build/asset tooling) — Node globals, not browser
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly' },
    },
  },
);

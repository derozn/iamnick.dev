const { FlatCompat } = require('@eslint/eslintrc');
const { fixupConfigRules } = require('@eslint/compat');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = fixupConfigRules(
  compat.config({
    parser: '@typescript-eslint/parser',
    parserOptions: {
      tsconfigRootDir: __dirname,
    },
    extends: ['@banterstudiosuk/eslint-config-typescript/react'],
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    rules: {
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
    ignorePatterns: ['build/*', '.turbo/*', 'output/*'],
  }),
);

const { FlatCompat } = require('@eslint/eslintrc');
const { fixupConfigRules } = require('@eslint/compat');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = fixupConfigRules(
  compat.config({
    env: {
      es6: true,
    },
    rules: {},
    ignorePatterns: ['node_modules/*', 'coverage/*', 'build/*', '.yarn/*', '.turbo/*'],
  })
)

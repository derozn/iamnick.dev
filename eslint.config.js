const { FlatCompat } = require('@eslint/eslintrc');
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = fixupConfigRules(
  compat.config({
    env: {
      es6: true
    },
    rules: {}
  })
);

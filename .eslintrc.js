module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: ['@banterstudiosuk/eslint-config-typescript/react'],
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
  },
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },
};

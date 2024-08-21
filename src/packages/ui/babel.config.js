module.exports = {
  presets: [
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        throwIfNamespace: false,
      },
    ],
    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'cjs' }],
  ],
};

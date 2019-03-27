module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    [
      'babel-plugin-styled-components',
      {
        ssr: true,
      },
    ],
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@root': './',
          '@client': './src/client',
          '@shared': './src/shared',
          '@server': './src/server',
          '@tools': './tools',
        },
        transformFunctions: ['module.hot.accept'],
      },
    ],
    'react-hot-loader/babel',
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: 'commonjs',
          },
        ],
      ],
    },
  },
};

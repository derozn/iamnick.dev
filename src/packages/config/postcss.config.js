module.exports = {
  plugins: {
    'postcss-import': {},
    'postcss-inline-svg': {},
    'postcss-svgo': {
      plugins: [
        {
          name: 'convertColors',
          params: {
            currentColor: true,
          },
        },
      ],
    },
    'postcss-discard-duplicates': {},
    tailwindcss: {},
    autoprefixer: {},
  },
};

module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    });

    return config;
  },
};

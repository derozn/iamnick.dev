module.exports = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      exclude: /node_modules/,
      use: ['ts-shader-loader'],
    });

    return config;
  },
};

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    });

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});

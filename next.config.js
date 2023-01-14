/** @type {import('next').NextConfig} */

const withGLSLLoader = require('./plugins/next-glsl-loader');

const nextConfig = {};

module.exports = () => {
  const plugins = [withGLSLLoader];
  return plugins.reduce((acc, plugin) => plugin(acc), { ...nextConfig });
};

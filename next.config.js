const withPlugins = require('next-compose-plugins');
const withGLSLLoader = require('./plugins/next-glsl-loader');

module.exports = withPlugins([withGLSLLoader]);

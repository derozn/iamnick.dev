import webpack from 'webpack';
import path from 'path';
import HtmlWebpackHarddiskPlugin from 'html-webpack-harddisk-plugin';
import webpackMerge from 'webpack-merge';
import webpackCommon from './webpack.common';

const outputPath = path.join(__dirname, '../build');

const HTMLWebpackHardDiskPlugin = new HtmlWebpackHarddiskPlugin({
  outputPath
});

module.exports = webpackMerge(webpackCommon, {
  mode: 'development',
  entry: [
    'webpack-hot-middleware/client'
  ],
  plugins: [
    HTMLWebpackHardDiskPlugin,
    new webpack.ProgressPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
  ],
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  },
  devtool: 'cheap-module-eval-source-map',
});

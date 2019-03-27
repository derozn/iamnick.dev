import webpack from 'webpack'
import path from 'path'
import HtmlWebpackHarddiskPlugin from 'html-webpack-harddisk-plugin'

const outputPath = path.join(__dirname, '../../build')

const HTMLWebpackHardDiskPlugin = new HtmlWebpackHarddiskPlugin({
  outputPath
})

module.exports = {
  mode: 'development',
  entry: [
    'webpack-hot-middleware/client'
  ],
  plugins: [
    HTMLWebpackHardDiskPlugin,
    new webpack.ProgressPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  ],
  devtool: 'cheap-module-eval-source-map'
}

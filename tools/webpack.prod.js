import webpack from 'webpack'
import TerserWebpackPlugin from 'terser-webpack-plugin'
import CompressionWebpackPlugin from 'compression-webpack-plugin'

module.exports = {
  mode: 'production',
  output: {
    filename: 'js/app.[hash].js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new CompressionWebpackPlugin({
      exclude: /\.handlebars$/
    })
  ],
  devtool: 'source-map',
  performance: {
    hints: false
  },
  optimization: {
    sideEffects: false,
    minimizer: [
      new TerserWebpackPlugin()
    ]
  }
}

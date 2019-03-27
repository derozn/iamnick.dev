import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'

const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.join(__dirname, '../../src/server/templates/index.handlebars'),
  filename: 'views/index.handlebars',
  alwaysWriteToDisk: true,
  inject: 'body',
  minify: {
    collapseWhitespace: true,
    collapseInlineTagWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true
  }
})

const cleanWebpackBuild = new CleanWebpackPlugin(['build'], {
  root: path.join(__dirname, '../../'),
  verbose: true,
  dry: false,
  exclude: ['.gitkeep']
})

module.exports = {
  name: 'client',
  target: 'web',
  entry: [
    '@babel/polyfill',
    path.join(__dirname, '../../src/client')
  ],
  output: {
    path: path.join(__dirname, '../../build'),
    filename: 'js/app.js',
    publicPath: '/'
  },
  resolveLoader: {
    moduleExtensions: ['-loader']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loaders: ['babel']
      },
      {
        test: /\.(jpe?g|png|gif|svg|ttf|woff|eot|mp4|woff2)$/i,
        loader: 'file-loader',
        query: {
          name: 'assets/[path][name].[ext]',
          context: '../../src/shared/assets'
        }
      }
    ]
  },
  plugins: [
    cleanWebpackBuild,
    HTMLWebpackPluginConfig
  ],
  resolve: {
    extensions: ['.js', '.json', '.jsx']
  }
}

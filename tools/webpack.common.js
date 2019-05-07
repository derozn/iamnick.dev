import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CleanWebpackPlugin from 'clean-webpack-plugin'

const viewTemplatePath = path.join(__dirname, '../src/server/templates/index.handlebars');

const HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: viewTemplatePath,
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

const cleanWebpackBuild = new CleanWebpackPlugin({
  verbose: true,
  dry: false,
})

module.exports = {
  name: 'client',
  target: 'web',
  entry: [
    '@babel/polyfill',
    path.join(__dirname, '../src/client')
  ],
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'js/app.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loaders: ['babel-loader']
      },
      {
        test: /\.(jpe?g|png|gif|svg|ttf|woff|eot|mp4|woff2)$/i,
        loader: 'file-loader',
        query: {
          name: 'assets/[path][name].[ext]',
          context: '../src/shared/assets'
        }
      },
      {
				test: /\.(glsl|frag|vert)$/i,
				use: ['glslify-import-loader', 'raw-loader', 'glslify-loader'],
			},
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

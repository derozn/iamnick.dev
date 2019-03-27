import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackConfig from '@tools/webpack.dev'

export default (app) => {
  const compiler = webpack(webpackConfig)

  app.use(webpackDevMiddleware(compiler, {
    hot: true,
    filename: webpackConfig.output.filename,
    noInfo: true,
    stats: {
      colors: true
    },
    historyApiFallback: true,
    publicPath: webpackConfig.output.publicPath,
    serverSideRender: true
  }))

  app.use(webpackHotMiddleware(clientCompiler, {
    log: console.log,
    heartbeat: 10 * 1000
  }))

  // Allows for server side reloading of files without restarting the server.
  compiler.plugin('done', () => {
    Object.keys(require.cache).forEach((id) => {
      // Only delete cache for files in server and shared folders
      if (/[/\\](shared|server)[/\\]/.test(id)) {
        delete require.cache[id]
      }
    })
  })
}

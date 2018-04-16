const browsersync = require('browser-sync');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
// const proxy = require('http-proxy-middleware');
const historyApiFallback = require('connect-history-api-fallback');

const config = require('../webpack/webpack.config.dev');

// const serverProxy = proxy(['/api', '/auth', '/img', '/v1'], {
//   target: `https://localhost:3000`,
//   secure: false // Must be present even though readme says otherwise
// });

const bundler = webpack(config);

browsersync.init({
    port: 3010,
    https: true,
    server: {
      baseDir: ['src'],
      middleware: [
        //serverProxy,
        historyApiFallback(),
        webpackDevMiddleware(bundler, {
          publicPath: config.output.publicPath,
          stats: {
            maxModules: 10,
            colors: true
          },
          noInfo: false
        }),
        webpackHotMiddleware(bundler)
      ]
    },
    files: [
      'src/*.html'
    ],
  
    ghostMode: false,
    open: false,
    reloadOnRestart: true
  });
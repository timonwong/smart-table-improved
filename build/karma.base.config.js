// Shared config for all unit tests
var path = require('path');

module.exports = {
  frameworks: ['jasmine'],
  files: [
    '../test/specs/index.js'
  ],
  preprocessors: {
    '../test/specs/index.js': ['webpack', 'sourcemap']
  },
  webpack: {
    devtool: 'inline-source-map',
    module: {
      loaders: [{
        test: /\.js$/,
        exclude: path.resolve(__dirname, '../node_modules/'),
        loader: 'babel'
      }]
    },
    babel: {
      presets: ['es2015'],
      plugins: ['transform-runtime']
    }
  },
  webpackMiddleware: {
    noInfo: true
  },
  singleRun: true
};

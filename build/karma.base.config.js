// Shared config for all unit tests
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
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }]
    }
  },
  webpackServer: {
    stats: {
      colors: true
    }
  },
  webpackMiddleware: {
    noInfo: true
  },
  colors: true,
  singleRun: true
};

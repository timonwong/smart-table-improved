// Shared config for all unit tests
module.exports = {
  frameworks: ['jasmine'],
  files: [],
  webpack: {
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

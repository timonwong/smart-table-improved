// Shared config for all unit tests
module.exports = {
  frameworks: ['jasmine'],
  files: [],
  webpack: {
    module: {
      loaders: [{
        test: /\.js$/,
        exclude: /(test|node_modules)/,
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      }]
    }
  },
  webpackMiddleware: {
    noInfo: true
  },
  singleRun: true
};

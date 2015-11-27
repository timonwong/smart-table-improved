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
  singleRun: true,
  autoWatch: false,
  plugins: [
    'karma-chrome-launcher',
    'karma-firefox-launcher',
    'karma-jasmine',
    'karma-webpack'
  ]
};

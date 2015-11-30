var assign = require('object-assign');
var base = require('./karma.base.config');
var path = require('path');

module.exports = function (config) {
  var options = assign(base, {
    browsers: ['PhantomJS'],
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      reporters: [
        { type: 'lcov', dir: '../coverage', subdir: '.' },
        { type: 'text-summary', dir: '../coverage', subdir: '.' }
      ]
    }
  });

  options.webpack.module.preLoaders = [
    {
      test: /\.js$/,
      exclude: [
        path.resolve(__dirname, '../test/'),
        path.resolve(__dirname, '../node_modules/'),
        /[\/\\]sti-templates.js$/
      ],
      loader: 'isparta'
    }
  ];

  config.set(options);
};

var assign = require('object-assign');
var base = require('./karma.base.config.js');

module.exports = function (config) {
  config.set(assign(base, {
    files: [
      '../test/specs/index.js'
    ],
    preprocessors: {
      '../test/specs/index.js': ['webpack']
    },

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera (has to be installed with `npm install karma-opera-launcher`)
    // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
    // - PhantomJS
    // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
    browsers: ['Chrome', 'Firefox'],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress']
  }));
};

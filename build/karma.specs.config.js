var assign = require('object-assign');
var base = require('./karma.base.config');

module.exports = function (config) {
  var browsers = ['Firefox'];
  if (process.env.TRAVIS) {
    browsers.push('Chrome_Travis_CI');
  } else {
    browsers.push('Chrome');
  }

  config.set(assign(base, {
    browsers: browsers,
    reporters: ['progress'],
    customLaunchers: {
      'Chrome_Travis_CI': {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    }
  }));
};

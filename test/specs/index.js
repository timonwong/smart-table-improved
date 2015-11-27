require('babel-polyfill');
require('angular');
require('angular-mocks');
require('../../src/index');

var testsContext = require.context('.', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);

import 'babel-polyfill';
import 'angular';
import 'angular-mocks/angular-mocks';
import 'angular-smart-table';
import '../../src';

// require all test files
var testsContext = require.context('.', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);

import 'babel-polyfill';
import $ from 'jquery';
import 'angular';
import 'angular-mocks/angular-mocks';
import 'angular-smart-table';
import '../../src';

var scope = typeof window === 'undefined' ? global : window;

// Use global jQuery
scope.$ = $;
// require all test files
var testsContext = require.context('.', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);

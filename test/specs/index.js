import 'babel-polyfill';
import $ from 'jquery';
import 'angular';
import 'angular-mocks/angular-mocks';
import 'angular-smart-table';
import '../../src';

// Use global jQuery
window.$ = $;
var testsContext = require.context('.', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);

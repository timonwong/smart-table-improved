import * as angular from 'angular';

angular
  .module('smart-table-improved.templates', []);

angular
  .module('smart-table-improved', [
    'smart-table',
    'smart-table-improved.templates'
  ]);

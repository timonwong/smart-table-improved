import angular from 'angular';

angular
  .module('smart-table-improved')
  .directive('stiTable', stiTable);


stiTable.$inject = ['$parse'];
function stiTable($parse) {
  return {
    restrict: 'A',
    require: 'stTable',
    scope: true,
    link: link
  };

  function link(scope, element, attrs, ctrl) {
    let stTableCtrl = ctrl;

    if (attrs.defaultSort) {
      let reverse = !!$parse(attrs.defaultSortReverse)(scope);
      stTableCtrl.sortBy(attrs.defaultSort, reverse);
    }
  }
}

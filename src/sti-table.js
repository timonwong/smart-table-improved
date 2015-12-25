import angular from 'angular';

angular
  .module('smart-table-improved')
  .directive('stiTable', stiTable);


/**
 * @ngdoc directive
 * @name smart-table-improved.directive:stiTable
 * @restrict A
 * @scope true
 *
 * @description
 * The stiTable directive is a helper to stTable directive.
 *
 * @element table st-table='rowCollection'
 * @param {string} defaultSort
 * @param {string} defaultSortReverse
 * @param {Expression} onPagination Expression to evaluate upon pagination state
 * changes. (Pagination object is available as $pagination, with `currentPage`,
 * `numberOfPages` and `totalItemCount` inside)
 *
 */
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
    let onPaginationHandler;

    if (attrs.onPagination) {
      onPaginationHandler = $parse(attrs.onPagination);

      scope.$watch(() => {
        return stTableCtrl.tableState().pagination;
      }, handlePaginationChange, true);
    }

    if (attrs.defaultSort) {
      let reverse = !!$parse(attrs.defaultSortReverse)(scope);
      stTableCtrl.sortBy(attrs.defaultSort, reverse);
    }

    function handlePaginationChange() {
      let paginationState = stTableCtrl.tableState().pagination;
      let pagination = {
        currentPage: Math.floor(paginationState.start / paginationState.number) + 1,
        numberOfPages: paginationState.numberOfPages,
        totalItemCount: paginationState.totalItemCount
      };

      onPaginationHandler(scope, {$pagination: pagination});
    }
  }
}

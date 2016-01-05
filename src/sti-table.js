import * as angular from 'angular';
import {EventNames} from './constants';

angular
  .module('smart-table-improved')
  .controller('StiTableController', StiTableController)
  .directive('stiTable', stiTable);

/**
 * @ngdoc controller
 * @name smart-table-improved.controller:StiTableController
 * @description
 * Controller used by `stiTable`
 */
StiTableController.$inject = ['$scope'];
function StiTableController($scope) {
  let ctrl = this;

  $scope.$stiSelected = {};
  $scope.$stiNumSelected = 0;

  ctrl.isSelected = isSelected;
  ctrl.select = select;
  ctrl.updateSelectedStatus = updateSelectedStatus;

  /**
   * Return true if the row is selected.
   * @param {Object} row
   * @returns {Boolean}
   */
  function isSelected(row) {
    let rowIdField = $scope.$stiRowIdField;
    let rowState = $scope.$stiSelected[row[rowIdField]];
    return rowState && rowState.checked;
  }

  /**
   * Set row checked state
   * @param {Object} row
   * @param {Boolean} checkedState
   * @param {Boolean} broadcast (default false)
   */
  function select(row, checkedState, {broadcast = false} = {}) {
    let rowIdField = $scope.$stiRowIdField;
    $scope.$stiSelected[row[rowIdField]] = {
      checked: checkedState,
      row: row
    };

    if (checkedState) {
      $scope.$stiNumSelected++;
    } else {
      $scope.$stiNumSelected--;
    }

    if (broadcast) {
      let rowObj = {
        row: row,
        checked: checkedState
      };
      $scope.$broadcast(EventNames.rowSelected, rowObj);
    }
  }

  /**
   * Update current selection status from latest collection
   */
  function updateSelectedStatus(collection) {
    let rowIdField = $scope.$stiRowIdField;
    let lastSelected = $scope.$stiSelected;
    let nextSelected = {};
    let nextNumSelected = 0;

    angular.forEach(collection, (item) => {
      let id = item[rowIdField];
      let selectedItem = lastSelected[id];

      if (!selectedItem) {
        return;
      }

      nextSelected[id] = selectedItem;
      if (selectedItem.checked) {
        nextNumSelected++;
      }
    });

    $scope.$stiNumSelected = nextNumSelected;
    $scope.$stiSelected = nextSelected;
  }
}

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
 * @param {string} defaultSort A sort key which can be specified to sort the table
 * initially by.
 * @param {Boolean} defaultSortReverse Whether to sort reversely with defaultSort
 * (default false)
 * @param {Expression} onPagination Expression to evaluate upon pagination state
 * changes. (Pagination object is available as $pagination, with `currentPage`,
 * `numberOfPages` and `totalItemCount` inside)
 * @param {string} rowIdField (default '$$hashkey')
 * @param {string|Boolean} trackSelectedMode (default false)
 *
 */
stiTable.$inject = ['$parse'];
function stiTable($parse) {
  return {
    restrict: 'A',
    require: ['stTable', 'stiTable'],
    scope: true,
    controller: 'StiTableController',
    controllerAs: 'stiTableCtrl',
    link: link
  };

  function link(scope, element, attrs, ctrls) {
    let [stTableCtrl, stiTableCtrl] = ctrls;

    scope.$stiRowIdField = angular.isDefined(attrs.rowIdField) ? attrs.rowIdField : '$$hashKey';
    if (attrs.trackSelectedMode === 'all') {
      // Track all collection (from st-safe-src attribute)
      scope.$watchCollection(attrs.stSafeSrc, stiTableCtrl.updateSelectedStatus.bind(stiTableCtrl));
    } else if (attrs.trackSelectedMode === 'displayed') {
      // Track displayed collection only
      scope.$watchCollection(attrs.stTable, stiTableCtrl.updateSelectedStatus.bind(stiTableCtrl));
    }

    if (attrs.defaultSort) {
      let reverse = angular.isDefined(attrs.defaultSortReverse) ? scope.$parent.$eval(attrs.defaultSortReverse) : false;
      stTableCtrl.sortBy(attrs.defaultSort, reverse);
    }

    let onPaginationHandler;
    if (attrs.onPagination) {
      onPaginationHandler = $parse(attrs.onPagination);

      scope.$watch(() => {
        return stTableCtrl.tableState().pagination;
      }, handlePaginationChange, true);
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

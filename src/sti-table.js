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

  $scope.selected = {};
  $scope.numSelected = 0;

  ctrl.isSelected = isSelected;
  ctrl.select = select;
  ctrl.updateSelectedStatus = updateSelectedStatus;

  /**
   * Return true if the row is selected.
   * @param {Object} row
   * @returns {Boolean}
   */
  function isSelected(row) {
    let rowState = $scope.selected[row[$scope.$stiRowIdField]];
    return rowState && rowState.checked;
  }

  /**
   * Set row checked state
   * @param {Object} row
   * @param {Boolean} checkedState
   * @param {Boolean} broadcast (default false)
   */
  function select(row, checkedState, {broadcast = false} = {}) {
    $scope.selected[row[$scope.$stiRowIdField]] = {
      checked: checkedState,
      item: row
    };

    if (checkedState) {
      $scope.numSelected++;
    } else {
      $scope.numSelected--;
    }

    if (broadcast) {
      let rowObj = {
        row: row,
        checked: checkedState
      };
      $scope.$broadcast(EventNames.rowSelected, rowObj);
    }
  }

  function updateSelectedStatus(collection) {
    let idField = $scope.$stiRowIdField;
    let lastSelected = $scope.selected;
    let nextSelected = {};

    for (let item of collection) {
      let id = item[idField];
      if (lastSelected[id]) {
        nextSelected[id] = lastSelected[id];
      }
    }

    $scope.selected = nextSelected;
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
 * @param {string} defaultSort
 * @param {string} defaultSortReverse
 * @param {Expression} onPagination Expression to evaluate upon pagination state
 * changes. (Pagination object is available as $pagination, with `currentPage`,
 * `numberOfPages` and `totalItemCount` inside)
 * @param {string} rowIdField
 * @param {Boolean} trackSelected
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
    let trackSelected = angular.isDefined(attrs.trackSelected) ? scope.$parent.$eval(attrs.trackSelected) : true;
    if (trackSelected) {
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

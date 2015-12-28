/*
 * angular-smart-table-improved v0.4.0
 * https://github.com/timonwong/smart-table-improved
 *
 * (c) 2015 Timon Wong
 * License: MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('angular')) :
  typeof define === 'function' && define.amd ? define(['angular'], factory) :
  factory(global.angular);
}(this, function (angular) { 'use strict';

  angular = 'default' in angular ? angular['default'] : angular;

  angular.module('smart-table-improved.templates', []);

  angular.module('smart-table-improved', ['smart-table', 'smart-table-improved.templates']);

  angular.module('smart-table-improved').directive('stiTable', stiTable);

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
      var stTableCtrl = ctrl;
      var onPaginationHandler = undefined;

      if (attrs.onPagination) {
        onPaginationHandler = $parse(attrs.onPagination);

        scope.$watch(function () {
          return stTableCtrl.tableState().pagination;
        }, handlePaginationChange, true);
      }

      if (attrs.defaultSort) {
        var reverse = !!$parse(attrs.defaultSortReverse)(scope);
        stTableCtrl.sortBy(attrs.defaultSort, reverse);
      }

      function handlePaginationChange() {
        var paginationState = stTableCtrl.tableState().pagination;
        var pagination = {
          currentPage: Math.floor(paginationState.start / paginationState.number) + 1,
          numberOfPages: paginationState.numberOfPages,
          totalItemCount: paginationState.totalItemCount
        };

        onPaginationHandler(scope, { $pagination: pagination });
      }
    }
  }

  angular.module('smart-table-improved').constant('stiPaginationConfig', {
    itemsPerPage: 10,
    maxSize: 10,
    templateUrl: 'sti/template/sti-pagination.html'
  }).directive('stiPagination', stiPagination);

  stiPagination.$inject = ['stiPaginationConfig'];
  function stiPagination(stiPaginationConfig) {
    return {
      restrict: 'EA',
      require: '^stTable',
      scope: {
        itemsPerPage: '=?',
        maxSize: '=?',
        onPageChange: '&',
        autoHide: '=?'
      },
      templateUrl: function templateUrl(element, attrs) {
        return attrs.templateUrl || stiPaginationConfig.templateUrl;
      },
      link: link
    };

    function link(scope, element, attrs, ctrl) {
      scope.itemsPerPage = scope.itemsPerPage ? scope.itemsPerPage : stiPaginationConfig.itemsPerPage;
      scope.maxSize = scope.maxSize ? scope.maxSize : stiPaginationConfig.maxSize;

      scope.autoHide = angular.isDefined(scope.autoHide) ? scope.autoHide : false;
      scope.directionLinks = angular.isDefined(attrs.directionLinks) ? scope.$parent.$eval(attrs.directionLinks) : true;
      scope.boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$parent.$eval(attrs.boundaryLinks) : false;
      scope.paginationClass = attrs.paginationClass || '';

      var paginationRange = Math.max(scope.maxSize, 5);
      scope.pages = [];
      scope.pagination = {
        last: 1,
        current: 1
      };
      scope.range = {
        lower: 1,
        upper: 1
      };

      // table state --> view
      scope.$watch(function () {
        return ctrl.tableState().pagination;
      }, redraw, true);

      // scope --> table state  (--> view)
      scope.$watch('itemsPerPage', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          scope.selectPage(1);
        }
      });

      scope.$watch('maxSize', redraw);

      // view -> table state
      scope.selectPage = function (page) {
        if (page > 0 && page <= scope.numPages) {
          ctrl.slice((page - 1) * scope.itemsPerPage, scope.itemsPerPage);
        }
      };

      if (!ctrl.tableState().pagination.number) {
        ctrl.slice(0, scope.itemsPerPage);
      }

      /**
       * Custom "track by" function which allows for duplicate "..." entries on long lists,
       * yet fixes the problem of wrongly-highlighted links which happens when using
       * "track by $index" - see https://github.com/michaelbromley/angularUtils/issues/153
       * @param id
       * @param index
       * @returns {string}
       */
      scope.tracker = function (id, index) {
        return id + '_' + index;
      };

      function redraw() {
        var paginationState = ctrl.tableState().pagination;
        var prevPage = scope.currentPage;

        scope.currentPage = Math.floor(paginationState.start / paginationState.number) + 1;
        scope.totalItemCount = paginationState.totalItemCount;
        scope.numPages = paginationState.numberOfPages;
        scope.pages = generatePagesArray(scope.currentPage, paginationState.totalItemCount, scope.itemsPerPage, paginationRange);

        scope.range.lower = paginationState.start + 1;
        scope.range.upper = paginationState.start + paginationState.number + 1;

        if (prevPage !== scope.currentPage) {
          scope.onPageChange({ newPage: scope.currentPage });
        }
      }
    }

    /**
     * Generate an array of page numbers (or the '...' string) which is used in an ng-repeat to generate the
     * links used in pagination
     *
     * @param currentPage
     * @param rowsPerPage
     * @param paginationRange
     * @param collectionLength
     * @returns {Array}
     */
    function generatePagesArray(currentPage, collectionLength, rowsPerPage, paginationRange) {
      var pages = [];
      var totalPages = Math.ceil(collectionLength / rowsPerPage);
      var halfWay = Math.ceil(paginationRange / 2);
      var position = undefined;

      if (currentPage <= halfWay) {
        position = 'start';
      } else if (totalPages - halfWay < currentPage) {
        position = 'end';
      } else {
        position = 'middle';
      }

      var ellipsesNeeded = paginationRange < totalPages;
      var i = 1;
      while (i <= totalPages && i <= paginationRange) {
        var pageNumber = calculatePageNumber(i, currentPage, paginationRange, totalPages);

        var openingEllipsesNeeded = i === 2 && (position === 'middle' || position === 'end');
        var closingEllipsesNeeded = i === paginationRange - 1 && (position === 'middle' || position === 'start');
        if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
          pages.push('...');
        } else {
          pages.push(pageNumber);
        }
        i++;
      }
      return pages;
    }

    /**
     * Given the position in the sequence of pagination links [i], figure out what page number corresponds to that position.
     *
     * @param i
     * @param currentPage
     * @param paginationRange
     * @param totalPages
     * @returns {*}
     */
    function calculatePageNumber(i, currentPage, paginationRange, totalPages) {
      var halfWay = Math.ceil(paginationRange / 2);
      if (i === paginationRange) {
        return totalPages;
      } else if (i === 1) {
        return i;
      } else if (paginationRange < totalPages) {
        if (totalPages - halfWay < currentPage) {
          return totalPages - paginationRange + i;
        } else if (halfWay < currentPage) {
          return currentPage - halfWay + i;
        } else {
          return i;
        }
      } else {
        return i;
      }
    }
  }

  var angular$1 = require('angular');
  angular$1.module("smart-table-improved.templates").run(["$templateCache", function ($templateCache) {
    $templateCache.put("sti/template/sti-pagination.html", "<ul class=\"pagination {{ paginationClass }}\" ng-if=\"pages.length > 1 || !autoHide\">\n  <li ng-if=\"::boundaryLinks\" ng-class=\"{disabled: currentPage === 1}\">\n    <a href=\"\" ng-click=\"selectPage(1)\">&laquo;</a>\n  </li>\n  <li ng-if=\"::directionLinks\" ng-class=\"{disabled: currentPage === 1}\">\n    <a href=\"\" ng-click=\"selectPage(currentPage - 1)\">&lsaquo;</a>\n  </li>\n  <li ng-repeat=\"pageNumber in pages track by tracker(pageNumber, $index)\" ng-class=\"{active: currentPage === pageNumber, disabled: pageNumber === \'...\'}\" class=\"pagenumbers\">\n    <a href=\"\" ng-click=\"selectPage(pageNumber)\">{{ pageNumber }}</a>\n  </li>\n  <li ng-if=\"::directionLinks\" ng-class=\"{disabled: currentPage === numPages}\">\n    <a href=\"\" ng-click=\"selectPage(currentPage + 1)\">&rsaquo;</a>\n  </li>\n  <li ng-if=\"::boundaryLinks\" ng-class=\"{disabled: currentPage === numPages}\">\n    <a href=\"\" ng-click=\"selectPage(numPages)\">&raquo;</a>\n  </li>\n</ul>\n");
  }]);

}));
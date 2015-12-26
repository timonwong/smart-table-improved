import * as angular from 'angular';

angular
  .module('smart-table-improved')
  .constant('stiPaginationConfig', {
    itemsPerPage: 10,
    maxSize: 10,
    templateUrl: 'sti/template/sti-pagination.html'
  })
  .directive('stiPagination', stiPagination);


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
    templateUrl: function (element, attrs) {
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

    let paginationRange = Math.max(scope.maxSize, 5);
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
    scope.$watch(() => {
      return ctrl.tableState().pagination;
    }, redraw, true);

    // scope --> table state  (--> view)
    scope.$watch('itemsPerPage', (newValue, oldValue) => {
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
      return `${id}_${index}`;
    };

    function redraw() {
      let paginationState = ctrl.tableState().pagination;
      let prevPage = scope.currentPage;

      scope.currentPage = Math.floor(paginationState.start / paginationState.number) + 1;
      scope.totalItemCount = paginationState.totalItemCount;
      scope.numPages = paginationState.numberOfPages;
      scope.pages = generatePagesArray(scope.currentPage, paginationState.totalItemCount, scope.itemsPerPage, paginationRange);

      scope.range.lower = paginationState.start + 1;
      scope.range.upper = paginationState.start + paginationState.number + 1;

      if (prevPage !== scope.currentPage) {
        scope.onPageChange({newPage: scope.currentPage});
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
    let pages = [];
    let totalPages = Math.ceil(collectionLength / rowsPerPage);
    let halfWay = Math.ceil(paginationRange / 2);
    let position;

    if (currentPage <= halfWay) {
      position = 'start';
    } else if (totalPages - halfWay < currentPage) {
      position = 'end';
    } else {
      position = 'middle';
    }

    let ellipsesNeeded = paginationRange < totalPages;
    let i = 1;
    while (i <= totalPages && i <= paginationRange) {
      let pageNumber = calculatePageNumber(i, currentPage, paginationRange, totalPages);

      let openingEllipsesNeeded = (i === 2 && (position === 'middle' || position === 'end'));
      let closingEllipsesNeeded = (i === paginationRange - 1 && (position === 'middle' || position === 'start'));
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
    let halfWay = Math.ceil(paginationRange / 2);
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

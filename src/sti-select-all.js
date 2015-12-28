import * as angular from 'angular';
import {EventNames} from './constants';

angular
  .module('smart-table-improved')
  .directive('stiSelectAll', stiSelectAll);

stiSelectAll.$inject = [];
function stiSelectAll() {
  return {
    restrict: 'A',
    require: [
      '^stiTable',
      '^stTable'
    ],
    scope: {
      rows: '=stiSelectAll'
    },
    link: link
  };

  function link(scope, element, attrs, ctrls) {
    let [stiTableCtrl, stTableCtrl] = ctrls;

    element.on('click', clickHandler);

    // Watch the table state for changes (sort, filter, pagination, etc)
    scope.$watch(() => stTableCtrl.tableState(), updateRowCheckState, true);
    // Watch the row length for added/removed rows
    scope.$watch('rows.length', updateRowCheckState);
    // Watch for row selection
    scope.$on(EventNames.rowSelected, updateRowCheckState);

    // Toggle checked state for "select all" checkbox
    function clickHandler() {
      scope.$apply(() => {
        let checked = element.prop('checked');
        angular.forEach(scope.rows, (row) => {
          let selected = stiTableCtrl.isSelected(row);
          if (selected !== checked) {
            stiTableCtrl.select(row, checked);
          }
        });
      });
    }

    // Update "select all" checkbox when table state changes
    function updateRowCheckState() {
      let visibleRows = scope.rows;
      let numVisibleRows = visibleRows.length;
      let checkedCount = visibleRows.filter(stiTableCtrl.isSelected).length;
      element.prop('checked', numVisibleRows > 0 && numVisibleRows === checkedCount);
    }
  }
}

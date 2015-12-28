import * as angular from 'angular';

angular
  .module('smart-table-improved')
  .directive('stiSelect', stiSelect);

stiSelect.$inject = [];
function stiSelect() {
  return {
    restrict: 'A',
    require: '^stiTable',
    scope: {
      row: '=stiSelect'
    },
    link: link
  };

  function link(scope, element, attrs, ctrl) {
    let stiTableCtrl = ctrl;

    element.on('click', clickHandler);

    // Select or unselect row
    function clickHandler() {
      scope.$apply(() => {
        let checkedState = element.prop('checked');
        stiTableCtrl.select(scope.row, checkedState, {broadcast: true});
      });
    }
  }
}

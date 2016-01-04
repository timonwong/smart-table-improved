import {kebabCase} from './string-helper';

describe('sti-select directive', () => {
  let $compile;
  let $scope;
  let $timeout;
  let element;

  function compileElement(directiveOptions = {trackSelectedMode: 'displayed'}) {
    let attrs = [];
    angular.forEach(directiveOptions, (value, key) => {
      attrs.push(`${kebabCase(key)}="${value}"`);
    });

    let template = `<table st-table="displayCollection" st-safe-src="rowCollection" sti-table ${attrs.join(' ')}>
      <thead>
        <tr>
          <td></td>
          <td colspan="3"><input st-search="name"></td>
        </tr>
        <tr>
          <th><input type="checkbox" sti-select-all="displayCollection"></th>
          <th>Name</th>
          <th>First Name</th>
          <th>Age</th>
        </tr>
      </thead>
      <tbody>
        <tr ng-repeat="row in displayCollection">
          <td><input type="checkbox" sti-select="row" ng-model="$stiSelected[row[$stiRowIdField]].checked"></td>
          <td>{{ row.name }}</td>
          <td>{{ row.firstName }}</td>
          <td>{{ row.age }}</td>
        </tr>
      </tbody>
    </table>`;
    element = $compile(template)($scope);
    $scope.$apply();
  }

  beforeEach(angular.mock.module('smart-table-improved'));

  beforeEach(angular.mock.inject((_$compile_, $rootScope, _$timeout_) => {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $timeout = _$timeout_;
    $scope.rowCollection = [
      {id: 1, name: 'Renard', firstName: 'Laurent', age: 66},
      {id: 2, name: 'Francoise', firstName: 'Frere', age: 99},
      {id: 3, name: 'Renard', firstName: 'Olivier', age: 33},
      {id: 4, name: 'Leponge', firstName: 'Bob', age: 22},
      {id: 5, name: 'Faivre', firstName: 'Blandine', age: 44}
    ];

    compileElement();
  }));

  describe('sti-table controller table/row select functionality', () => {
    it('should have each checkbox initially unchecked', () => {
      let checkboxes = element.find('input[sti-select]');

      expect(checkboxes.length).toBeGreaterThan(0);
      angular.forEach(checkboxes, (checkbox) => {
        expect(checkbox.checked).toBeFalsy();
      });
    });

    it('should return false when calling isSelected for each row', () => {
      let stiTableCtrl = element.controller('stiTable');

      angular.forEach($scope.rowCollection, (row) => {
        expect(stiTableCtrl.isSelected(row)).toBeFalsy();
      });
    });

    it('should update selected an $stiNumSelected when select called', () => {
      let stiTableCtrl = element.controller('stiTable');
      let firstRow = $scope.rowCollection[0];
      stiTableCtrl.select(firstRow, true);

      let stiTableScope = element.scope();
      expect(stiTableScope.$stiSelected[firstRow[stiTableScope.$stiRowIdField]]).toBeDefined();
      expect(stiTableScope.$stiNumSelected).toBe(1);
    });
  });

  describe('sti-select directive', () => {
    let checkboxes;

    beforeEach(() => {
      checkboxes = element.find('input[sti-select]');
    });

    it('should have $stiNumSelected === 1 when first checkbox is clicked', () => {
      let checkbox = checkboxes.first();
      checkbox[0].checked = true;
      checkbox.triggerHandler('click');
      $scope.$apply();

      expect(element.scope().$stiNumSelected).toBe(1);
    });

    it('should have $stiNumSelected === 0 when first checkbox is clicked, then unclicked', () => {
      let checkbox = checkboxes.first();
      checkbox[0].checked = true;
      checkbox.triggerHandler('click');
      $scope.$apply();

      expect(element.scope().$stiNumSelected).toBe(1);

      checkbox[0].checked = false;
      checkbox.triggerHandler('click');
      $scope.$apply();

      expect(element.scope().$stiNumSelected).toBe(0);
    });

    it('should have $stiNumSelected === 5 and select-all checked when all rows selected', () => {
      angular.forEach(checkboxes, (checkbox) => {
        checkbox.checked = true;
        angular.element(checkbox).triggerHandler('click');
      });
      $scope.$apply();

      expect(element.scope().$stiNumSelected).toBe(5);
      expect(element.find('input[sti-select-all]')[0].checked).toBeTruthy();
    });

    it('should have select-all unchecked when all rows selected, then one deselected', () => {
      angular.forEach(checkboxes, (checkbox) => {
        checkbox.checked = true;
        angular.element(checkbox).triggerHandler('click');
      });
      $scope.$apply();

      // all checkboxes selected so check-all should be checked
      expect(element.scope().$stiNumSelected).toBe(5);
      expect(element.find('input[sti-select-all]')[0].checked).toBeTruthy();

      // deselect one checkbox
      let firstCheckbox = checkboxes.first();
      firstCheckbox[0].checked = false;
      firstCheckbox.triggerHandler('click');
      $scope.$apply();

      // check-all should be unchecked
      expect(element.scope().$stiNumSelected).toBe(4);
      expect(element.find('input[sti-select-all]')[0].checked).toBeFalsy();
    });

    it('should reset checked states from removed items if data soruce changed', () => {
      angular.forEach(checkboxes, (checkbox) => {
        checkbox.checked = true;
        angular.element(checkbox).triggerHandler('click');
      });
      $scope.$apply();

      // all checkboxes selected so check-all should be checked
      let stiTableScope = element.scope();
      let id = $scope.rowCollection[0].$$hashKey;
      expect(stiTableScope.$stiNumSelected).toBe(5);
      expect(element.find('input[sti-select-all]')[0].checked).toBeTruthy();
      expect(stiTableScope.$stiSelected[id]).toBeDefined();

      // Remove an item from data source
      $scope.rowCollection.splice(0, 1);
      $scope.$apply();

      expect(stiTableScope.$stiSelected[id]).toBeUndefined();
    });

    it('should not reset checked states from removed items if data soruce changed when track-selected-mode attributed is set to "false"', () => {
      compileElement({trackSelectedMode: 'false'});
      let firstCheckbox = element.find('input[sti-select]')[0];

      firstCheckbox.checked = true;
      angular.element(firstCheckbox).triggerHandler('click');
      $scope.$apply();

      // all checkboxes selected so check-all should be checked
      let stiTableScope = element.scope();
      let id = $scope.rowCollection[0].$$hashKey;
      expect(stiTableScope.$stiNumSelected).toBe(1);
      expect(stiTableScope.$stiSelected[id]).toBeDefined();

      // Remove item from data source
      $scope.rowCollection.splice(0, 1);
      $scope.$apply();

      expect(stiTableScope.$stiSelected[id]).toBeDefined();
    });

    it('should reset checked states when only displayed collection changed by default', () => {
      let firstCheckbox = element.find('input[sti-select]')[0];

      firstCheckbox.checked = true;
      angular.element(firstCheckbox).triggerHandler('click');
      $scope.$apply();

      // Trigger a search, which deliberately returns empty match
      let input = element.find('input[st-search]');
      input.val('@@@INVALID INPUT@@@');
      input.triggerHandler('input');
      $timeout.flush();

      expect(element.scope().$stiNumSelected).toBe(0);

      // Clear the search
      input.val('');
      input.triggerHandler('input');
      $scope.$apply();
      $timeout.flush();

      expect(element.scope().$stiNumSelected).toBe(0);
    });

    it('should not reset check states when only display collection changed and track-selected-mode is set to "all"', () => {
      compileElement({trackSelectedMode: 'all'});
      let firstCheckbox = element.find('input[sti-select]')[0];

      firstCheckbox.checked = true;
      angular.element(firstCheckbox).triggerHandler('click');
      $scope.$apply();

      // Trigger a search, which deliberately returns empty match
      let input = element.find('input[st-search]');
      input.val('@@@INVALID INPUT@@@');
      input.triggerHandler('input');
      $timeout.flush();

      expect(element.scope().$stiNumSelected).toBe(1);

      // Clear the search
      input.val('');
      input.triggerHandler('input');
      $scope.$apply();
      $timeout.flush();

      expect(element.scope().$stiNumSelected).toBe(1);
    });
  });

  describe('sti-select-all directive', () => {
    it('should not be selected if there are no rows in the table', () => {
      let selectAll = element.find('input[sti-select-all]').first();

      $scope.rowCollection = [];
      $scope.displayCollection = [];
      $scope.$apply();

      expect(selectAll[0].checked).toBeFalsy();
    });

    it('should select all checkboxes if select-all checked', () => {
      let selectAll = element.find('input[sti-select-all]').first();
      selectAll[0].checked = true;
      selectAll.triggerHandler('click');
      $scope.$apply();

      expect(element.scope().$stiNumSelected).toBe(5);
      let checkboxes = element.find('tbody input[sti-select]');
      angular.forEach(checkboxes, (checkbox) => {
        expect(checkbox.checked).toBeTruthy();
      });
    });

    it('should deselect all checkboxes if select-all checked, then unchecked', () => {
      let selectAll = element.find('input[sti-select-all]').first();
      selectAll[0].checked = true;
      selectAll.triggerHandler('click');

      let checkboxes = element.find('tbody input[sti-select]');

      expect(element.scope().$stiNumSelected).toBe(5);
      angular.forEach(checkboxes, (checkbox) => {
        expect(checkbox.checked).toBeTruthy();
      });

      selectAll[0].checked = false;
      selectAll.triggerHandler('click');
      $scope.$apply();

      expect(element.scope().$stiNumSelected).toBe(0);
      angular.forEach(checkboxes, (checkbox) => {
        expect(checkbox.checked).toBeFalsy();
      });
    });

    it('should select all checkboxes if select-all checked with one row selected', () => {
      // select the first checkbox
      let checkbox = element.find('input[sti-select]').first();
      checkbox[0].checked = true;
      checkbox.triggerHandler('click');

      // now click select-all checkbox
      let selectAll = element.find('input[sti-select-all]').first();
      selectAll[0].checked = true;
      selectAll.triggerHandler('click');
      $scope.$apply();

      expect(element.scope().$stiNumSelected).toBe(5);
      let checkboxes = element.find('tbody input[sti-select]');
      angular.forEach(checkboxes, (checkbox) => {
        expect(checkbox.checked).toBeTruthy;
      });
    });
  });
});

import {kebabCase} from './string-helper';

describe('sti-select directive', () => {
  let $compile;
  let $scope;
  let element;

  function compileElement(directiveOptions = {trackSelected: 'true'}) {
    let attrs = [];
    angular.forEach(directiveOptions, (value, key) => {
      attrs.push(`${kebabCase(key)}="${value}"`);
    });

    let template = `<table st-table="displayCollection" st-safe-src="rowCollection" sti-table ${attrs.join(' ')}>
      <thead>
        <tr>
          <th><input type="checkbox" sti-select-all="displayCollection"></th>
          <th>Name</th>
          <th>First Name</th>
          <th>Age</th>
        </tr>
      </thead>
      <tbody>
        <tr ng-repeat="row in displayCollection">
          <td><input type="checkbox" sti-select="row" ng-model="selected[row[$stiRowIdField]].checked"></td>
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

  beforeEach(angular.mock.inject((_$compile_, $rootScope) => {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $scope.rowCollection = [
      {id: 1, name: 'Renard', firstname: 'Laurent', age: 66},
      {id: 2, name: 'Francoise', firstname: 'Frere', age: 99},
      {id: 3, name: 'Renard', firstname: 'Olivier', age: 33},
      {id: 4, name: 'Leponge', firstname: 'Bob', age: 22},
      {id: 5, name: 'Faivre', firstname: 'Blandine', age: 44}
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

    it('should update selected an numSelected when select called', () => {
      let stiTableCtrl = element.controller('stiTable');
      let firstRow = $scope.rowCollection[0];
      stiTableCtrl.select(firstRow, true);

      let stiTableScope = element.scope();
      expect(stiTableScope.selected[firstRow[stiTableScope.$stiRowIdField]]).toBeDefined();
      expect(stiTableScope.numSelected).toBe(1);
    });
  });

  describe('sti-select directive', () => {
    let checkboxes;

    beforeEach(() => {
      checkboxes = element.find('input[sti-select]');
    });

    it('should have numSelected === 1 when first checkbox is clicked', () => {
      let checkbox = checkboxes.first();
      checkbox[0].checked = true;
      checkbox.triggerHandler('click');
      $scope.$apply();

      expect(element.scope().numSelected).toBe(1);
    });

    it('should have numSelected === 0 when first checkbox is clicked, then unclicked', () => {
      let checkbox = checkboxes.first();
      checkbox[0].checked = true;
      checkbox.triggerHandler('click');
      $scope.$apply();

      expect(element.scope().numSelected).toBe(1);

      checkbox[0].checked = false;
      checkbox.triggerHandler('click');
      $scope.$apply();

      expect(element.scope().numSelected).toBe(0);
    });

    it('should have numSelected === 5 and select-all checked when all rows selected', () => {
      angular.forEach(checkboxes, (checkbox) => {
        checkbox.checked = true;
        angular.element(checkbox).triggerHandler('click');
      });
      $scope.$apply();

      expect(element.scope().numSelected).toBe(5);
      expect(element.find('input[sti-select-all]')[0].checked).toBeTruthy();
    });

    it('should have select-all unchecked when all rows selected, then one deselected', () => {
      angular.forEach(checkboxes, (checkbox) => {
        checkbox.checked = true;
        angular.element(checkbox).triggerHandler('click');
      });
      $scope.$apply();

      // all checkboxes selected so check-all should be checked
      expect(element.scope().numSelected).toBe(5);
      expect(element.find('input[sti-select-all]')[0].checked).toBeTruthy();

      // deselect one checkbox
      let firstCheckbox = checkboxes.first();
      firstCheckbox[0].checked = false;
      firstCheckbox.triggerHandler('click');
      $scope.$apply();

      // check-all should be unchecked
      expect(element.scope().numSelected).toBe(4);
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
      expect(element.scope().numSelected).toBe(5);
      expect(element.find('input[sti-select-all]')[0].checked).toBeTruthy();
      expect(stiTableScope.selected[id]).toBeDefined();

      // Remove an item from data source
      $scope.rowCollection.splice(0, 1);
      $scope.$apply();

      expect(stiTableScope.selected[id]).toBeUndefined();
    });

    it('should not reset checked states from removed items if data soruce changed when track-selected attributed is set to "false"', () => {
      compileElement({trackSelected: 'false'});
      let firstCheckbox = element.find('input[sti-select]')[0];

      firstCheckbox.checked = true;
      angular.element(firstCheckbox).triggerHandler('click');
      $scope.$apply();

      // all checkboxes selected so check-all should be checked
      let stiTableScope = element.scope();
      let id = $scope.rowCollection[0].$$hashKey;
      expect(element.scope().numSelected).toBe(1);
      expect(stiTableScope.selected[id]).toBeDefined();

      // Remove item from data source
      $scope.rowCollection.splice(0, 1);
      $scope.$apply();

      expect(stiTableScope.selected[id]).toBeDefined();
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

      expect(element.scope().numSelected).toBe(5);
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

      expect(element.scope().numSelected).toBe(5);
      angular.forEach(checkboxes, (checkbox) => {
        expect(checkbox.checked).toBeTruthy();
      });

      selectAll[0].checked = false;
      selectAll.triggerHandler('click');
      $scope.$apply();

      expect(element.scope().numSelected).toBe(0);
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

      expect(element.scope().numSelected).toBe(5);
      let checkboxes = element.find('tbody input[sti-select]');
      angular.forEach(checkboxes, (checkbox) => {
        expect(checkbox.checked).toBeTruthy;
      });
    });
  });
});

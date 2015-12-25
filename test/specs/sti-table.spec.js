describe('sti-table directive', () => {
  let $compile;
  let $scope;
  let element;

  function trToModel(trs) {
    return Array.prototype.map.call(trs, (ele) => {
      return {
        name: ele.cells[0].innerHTML,
        firstname: ele.cells[1].innerHTML,
        age: +(ele.cells[2].innerHTML)
      };
    });
  }

  beforeEach(window.module('smart-table-improved'));

  beforeEach(window.inject((_$compile_, $rootScope) => {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $scope.rowCollection = [
      {name: 'Renard', firstname: 'Laurent', age: 66},
      {name: 'Francoise', firstname: 'Frere', age: 99},
      {name: 'Renard', firstname: 'Olivier', age: 33},
      {name: 'Leponge', firstname: 'Bob', age: 22},
      {name: 'Faivre', firstname: 'Blandine', age: 44}
    ];
  }));

  let commonTemplatePart = `<thead>
    <tr>
      <th st-sort="name">name</th>
      <th>firstname</th>
      <th>age</th>
    </tr>
    </thead>
    <tbody>
      <tr class="test-row" ng-repeat="row in rowCollection">
        <td>{{ row.name }}</td>
        <td>{{ row.firstname }}</td>
        <td>{{ row.age }}</td>
      </tr>
    </tbody>`;

  describe('default-sort on init', () => {
    it('should sort', () => {
      let template = `
        <table sti-table st-table="rowCollection" default-sort="age">
          ${commonTemplatePart}
        </table>`;

      element = $compile(template)($scope);
      $scope.$apply();

      let actual = trToModel(element.find('tr.test-row'));
      expect(actual).toEqual([
        {name: 'Leponge', firstname: 'Bob', age: 22},
        {name: 'Renard', firstname: 'Olivier', age: 33},
        {name: 'Faivre', firstname: 'Blandine', age: 44},
        {name: 'Renard', firstname: 'Laurent', age: 66},
        {name: 'Francoise', firstname: 'Frere', age: 99}
      ]);
    });

    it('should sort reversely by default-sort-reverse', () => {
      let template = `
        <table sti-table st-table="rowCollection" default-sort="age" default-sort-reverse="true">
          ${commonTemplatePart}
        </table>`;

      element = $compile(template)($scope);
      $scope.$apply();

      let actual = trToModel(element.find('tr.test-row'));
      expect(actual).toEqual([
        {name: 'Francoise', firstname: 'Frere', age: 99},
        {name: 'Renard', firstname: 'Laurent', age: 66},
        {name: 'Faivre', firstname: 'Blandine', age: 44},
        {name: 'Renard', firstname: 'Olivier', age: 33},
        {name: 'Leponge', firstname: 'Bob', age: 22}
      ]);
    });
  });

  describe('on-pagination callback', () => {
    beforeEach(() => {
      $scope.onPagination = jasmine.createSpy('onPagination');
    });

    function getPages() {
      return Array.prototype.map.call(element.find('li'), (ele) => {
        return angular.element(ele);
      });
    }

    it('should work', () => {
      $scope.itemsPerPage = 1;

      let template = `
        <table sti-table st-table="rowCollection" on-pagination="onPagination($pagination)">
        <tfoot><tr><td id="pagination" st-pagination="" st-items-by-page="itemsPerPage"></td></tr></tfoot>
        </table>`;
      element = $compile(template)($scope);
      $scope.$apply();

      expect($scope.onPagination).toHaveBeenCalledWith({
        currentPage: 1,
        numberOfPages: 5,
        totalItemCount: 5
      });

      // Change page number
      let pages = getPages();
      angular.element(pages[2].children()[0]).triggerHandler('click');
      $scope.$apply();

      expect($scope.onPagination).toHaveBeenCalledWith({
        currentPage: 3,
        numberOfPages: 5,
        totalItemCount: 5
      });

      // Change items per page
      $scope.itemsPerPage = 2;
      $scope.$apply();

      expect($scope.onPagination).toHaveBeenCalledWith({
        currentPage: 1,
        numberOfPages: 3,
        totalItemCount: 5
      });
      expect($scope.onPagination.calls.count()).toEqual(3);
    });
  });
});

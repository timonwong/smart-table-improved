describe('sti-table directive', () => {
  let $compile;
  let scope;
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
    scope = $rootScope.$new();
    scope.rowCollection = [
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

  describe('Sort should work on init', () => {
    it('should sort by default-sort attribute', () => {
      let template = `
      <table sti-table st-table="rowCollection" default-sort="age">
      ${commonTemplatePart}
      </table>`;

      element = $compile(template)(scope);
      scope.$apply();

      let actual = trToModel($(element).find('tr.test-row'));
      expect(actual).toEqual([
        {name: 'Leponge', firstname: 'Bob', age: 22},
        {name: 'Renard', firstname: 'Olivier', age: 33},
        {name: 'Faivre', firstname: 'Blandine', age: 44},
        {name: 'Renard', firstname: 'Laurent', age: 66},
        {name: 'Francoise', firstname: 'Frere', age: 99}
      ]);
    });

    it('shoud sort reversely by default-sort and default-sort-reverse', () => {
      let template = `
      <table sti-table st-table="rowCollection" default-sort="age" default-sort-reverse="true">
      ${commonTemplatePart}
      </table>`;

      element = $compile(template)(scope);
      scope.$apply();

      let actual = trToModel($(element).find('tr.test-row'));
      expect(actual).toEqual([
        {name: 'Francoise', firstname: 'Frere', age: 99},
        {name: 'Renard', firstname: 'Laurent', age: 66},
        {name: 'Faivre', firstname: 'Blandine', age: 44},
        {name: 'Renard', firstname: 'Olivier', age: 33},
        {name: 'Leponge', firstname: 'Bob', age: 22}
      ]);
    });
  });
});

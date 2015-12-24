describe('sti-pagination directive', () => {
  let $compile;
  let $rootScope;
  let stiPaginationConfig;
  let tableState = {
    sort: {},
    search: {},
    pagination: {start: 0, totalItemCount: 0}
  };

  let controllerMock = {
    tableState: function () {
      return tableState;
    },

    slice: function (start, number) {
      tableState.pagination.start = start;
      tableState.pagination.number = number;
    }
  };

  function ControllerMock() {
    this.tableState = controllerMock.tableState;
    this.slice = controllerMock.slice;
  }

  beforeEach(window.module('smart-table-improved', ($controllerProvider) => {
    $controllerProvider.register('stTableController', ControllerMock);
  }));

  beforeEach(window.inject((_$compile_, _$rootScope_, _stConfig_, _stiPaginationConfig_) => {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    stiPaginationConfig = _stiPaginationConfig_;

    $rootScope.rowCollection = [
      {name: 'Renard', firstname: 'Laurent', age: 66},
      {name: 'Francoise', firstname: 'Frere', age: 99},
      {name: 'Renard', firstname: 'Olivier', age: 33},
      {name: 'Leponge', firstname: 'Bob', age: 22},
      {name: 'Faivre', firstname: 'Blandine', age: 44}
    ];
  }));

  describe('init', () => {
    it('should call for the first page with default itemsPerPage if "items-per-page" is unset', () => {
      spyOn(controllerMock, 'slice');
      let template = `<div st-table="rowCollection"><table></table><sti-pagination></sti-pagination></div>`;
      $compile(template)($rootScope);
      $rootScope.$apply();
      expect(controllerMock.slice).toHaveBeenCalledWith(0, stiPaginationConfig.itemsPerPage);
    });

    it('should call for the first page on init', () => {
      spyOn(controllerMock, 'slice');
      let template = `<div st-table="rowCollection"><table></table><sti-pagination items-per-page="5"></sti-pagination></div>`;
      $compile(template)($rootScope);
      $rootScope.$apply();
      expect(controllerMock.slice).toHaveBeenCalledWith(0, 5);
    });

    it('should call for the first page with overriden default stiPaginationConfig.itemsPerPage', () => {
      let defaultItemsPerPage = stiPaginationConfig.itemsPerPage;
      stiPaginationConfig.itemsPerPage = 23;
      spyOn(controllerMock, 'slice');
      let template = `<div st-table="rowCollection"><table></table><sti-pagination></sti-pagination></div>`;
      $compile(template)($rootScope);
      $rootScope.$apply();
      expect(controllerMock.slice).toHaveBeenCalledWith(0, 23);
      stiPaginationConfig.itemsPerPage = defaultItemsPerPage;
    });
  });

  describe('template', () => {
    let $templateCache;

    beforeEach(window.inject((_$templateCache_) => {
      $templateCache = _$templateCache_;
    }));

    it('should load custom template from stiPaginationConfig\'s "template-url"', () => {
      let defaultTemplate = stiPaginationConfig.templateUrl;
      stiPaginationConfig.templateUrl = 'custom_stiPaginationConfig_templateUrl.html';

      $templateCache.put('custom_stiPaginationConfig_templateUrl.html', `<ul id="custom_stiPaginationConfig_templateUrl"></ul>`);

      let template = `<div st-table="rowCollection"><table></table><sti-pagination></sti-pagination></div>`;
      let element = $compile(template)($rootScope);
      $rootScope.$apply();
      expect(element.find('#custom_stiPaginationConfig_templateUrl').length).toBe(1);
      stiPaginationConfig.templateUrl = defaultTemplate;
    });

    it('should load custom template from attribute "template-url"', () => {
      $templateCache.put('custom_templateUrl.html', `<ul id="custom_templateUrl"></ul>`);

      let template = `<div st-table="rowCollection"><table></table><sti-pagination template-url="custom_templateUrl.html"></sti-pagination></div>`;
      let element = $compile(template)($rootScope);
      $rootScope.$apply();
      expect(element.find('#custom_templateUrl').length).toBe(1);
    });
  });
});

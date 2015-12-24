describe('sti-pagination directive', () => {
  let $compile;
  let $rootScope;
  let $scope;
  let stiPaginationConfig;
  let element;
  let tableState;
  let rowCollection = [];

  // Generate rowCollection
  for (let i = 0; i < 200; i++) {
    rowCollection.push({id: i, name: `item-${i}`});
  }

  let controllerMock = {
    tableState: function () {
      return tableState;
    },

    slice: function (start, number) {
      tableState.pagination.start = start;
      tableState.pagination.number = number;
    }
  };

  function compileElement(paginationState, {itemsPerPage = undefined, templateUrl = undefined, onPageChange = undefined} = {}) {
    let attrs = [];
    if (angular.isDefined(itemsPerPage)) {
      attrs.push(`items-per-page="${itemsPerPage}"`);
    }
    if (angular.isDefined(templateUrl)) {
      attrs.push(`template-url="${templateUrl}"`);
    }
    if (angular.isDefined(onPageChange)) {
      attrs.push(`on-page-change="${onPageChange}"`);
    }
    let template = `<div st-table="rowCollection"><table></table><sti-pagination ${attrs.join(' ')}></sti-pagination></div>`;
    element = $compile(template)($scope);
    $.extend(tableState.pagination, paginationState);
    $scope.$apply();
  }

  function getPageLinksArray() {
    return element.find('ul.pagination li').map(function() {
      return $(this).text().trim();
    }).get();
  }

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

    $scope = $rootScope.$new();
    $scope.rowCollection = rowCollection;

    // Reset tableState
    tableState = {
      sort: {},
      search: {},
      pagination: {start: 0, totalItemCount: rowCollection.length}
    };
  }));

  describe('init', () => {
    it('should call for the first page with default itemsPerPage if "items-per-page" is unset', () => {
      spyOn(controllerMock, 'slice');
      compileElement();

      expect(controllerMock.slice).toHaveBeenCalledWith(0, stiPaginationConfig.itemsPerPage);
    });

    it('should call for the first page on init', () => {
      spyOn(controllerMock, 'slice');
      compileElement({}, {itemsPerPage: 5});

      expect(controllerMock.slice).toHaveBeenCalledWith(0, 5);
    });

    it('should call for the first page with overriden default stiPaginationConfig.itemsPerPage', () => {
      let defaultItemsPerPage = stiPaginationConfig.itemsPerPage;
      stiPaginationConfig.itemsPerPage = 23;
      spyOn(controllerMock, 'slice');
      compileElement();

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
      compileElement();

      expect(element.find('#custom_stiPaginationConfig_templateUrl').length).toBe(1);
      stiPaginationConfig.templateUrl = defaultTemplate;
    });

    it('should load custom template from attribute "template-url"', () => {
      $templateCache.put('custom_templateUrl.html', `<ul id="custom_templateUrl"></ul>`);
      compileElement({}, {templateUrl: 'custom_templateUrl.html'});

      expect(element.find('#custom_templateUrl').length).toBe(1);
    });
  });

  describe('draw pages', () => {
    it('should show the correct pagination links at start of sequence', () => {
      compileElement({
        start: 0,
        numberOfPages: Math.ceil(rowCollection.length / 10),
        number: 10
      });

      let pageLinks = getPageLinksArray();

      expect(pageLinks.length).toBe(12);
      expect(pageLinks).toEqual(['‹', '1', '2', '3', '4', '5', '6', '7', '8', '...', '20', '›']);
    });

    it('should show the correct pagination links in middle sequence', () => {
      compileElement({
        start: 90,
        numberOfPages: Math.ceil(rowCollection.length / 10),
        number: 10
      });

      let pageLinks = getPageLinksArray();

      expect(pageLinks.length).toBe(12);
      expect(pageLinks).toEqual(['‹', '1', '...', '8', '9', '10', '11', '12', '13', '...', '20', '›']);
    });

    it('should show the correct pagination links at end of sequence', () => {
      compileElement({
        start: 150,
        numberOfPages: Math.ceil(rowCollection.length / 10),
        number: 10
      });

      let pageLinks = getPageLinksArray();

      expect(pageLinks.length).toBe(12);
      expect(pageLinks).toEqual(['‹', '1', '...', '13', '14', '15', '16', '17', '18', '19', '20', '›']);
    });
  });

  describe('on-page-change callback', () => {
    beforeEach(() => {
      $scope.onPageChange = jasmine.createSpy('onPageChange');
    });

    it('should call the callback once when page link clicked', function() {
      compileElement({
        number: 10,
        numberOfPages: Math.ceil(rowCollection.length / 10)
      }, {
        itemsPerPage: 13, onPageChange: 'onPageChange(newPage)'
      });

      let pagination = element.find('ul.pagination');

      expect($scope.onPageChange).toHaveBeenCalledWith(1);
      expect($scope.onPageChange.calls.count()).toEqual(1);

      pagination.children().eq(2).find('a').triggerHandler('click');
      $scope.$apply();

      expect($scope.onPageChange).toHaveBeenCalledWith(2);
      expect($scope.onPageChange.calls.count()).toEqual(2);
    });

    it('should not call when current page is not changed', () => {
      compileElement({
        number: 10,
        numberOfPages: Math.ceil(rowCollection.length / 10)
      }, {
        itemsPerPage: 13, onPageChange: 'onPageChange(newPage)'
      });

      let pagination = element.find('ul.pagination');

      expect($scope.onPageChange).toHaveBeenCalledWith(1);
      expect($scope.onPageChange.calls.count()).toEqual(1);

      pagination.children().eq(1).find('a').triggerHandler('click');
      $scope.$apply();

      expect($scope.onPageChange.calls.count()).toEqual(1);
    });
  });
});

'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'nbleser';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ipCookie',
        'ngAnimate',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'ui.utils',
        'chieffancypants.loadingBar'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName) {
      // Create angular module
      angular.module(moduleName, []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('leser');'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    });
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  'Menus',
  '$anchorScroll',
  '$location',
  '$modal',
  'ReaderControls',
  function ($scope, Menus, $anchorScroll, $location, $modal, ReaderControls) {
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    $scope.controls = ReaderControls;
    // Terms
    var modalInstance;
    $scope.showTerms = function () {
      modalInstance = $modal.open({
        templateUrl: '/modules/core/views/terms.client.view.html',
        scope: $scope
      });
    };
    $scope.closeTerms = function () {
      modalInstance.close();
    };
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  '$location',
  '$rootScope',
  '$http',
  'Search',
  '$modal',
  'ReaderControls',
  function ($scope, $location, $rootScope, $http, Search, $modal, ReaderControls) {
    // variables
    var modalInstance;
    ReaderControls.show = false;
    // hide controls in home view
    $scope.read = function (urn, close) {
      $location.url('/leser/' + urn);
      if (close) {
        modalInstance.close();
      }
    };
    // check country
    $http.get('/geoip').success(function (geoip) {
      if (geoip.error) {
        console.log(geoip.error);
      }
      if (geoip.country !== 'NO') {
        modalInstance = $modal.open({
          templateUrl: '/modules/core/views/norwegian-modal.client.view.html',
          scope: $scope
        });
      }
    });
    $scope.readFirst = function (query) {
      $scope.error = false;
      var searchPromise = Search.get(query);
      searchPromise.then(function (data) {
        var urn = data.entry[0]['nb:urn'].$t;
        $location.url('/leser/' + urn);
      }, function (err) {
        $scope.error = err;
      });
    };
    $scope.search = function (query) {
      $scope.error = false;
      $scope.searchResults = [];
      var searchPromise = Search.get(query);
      searchPromise.then(function (data) {
        $scope.searchResults.push(data);
        //console.log(data);
        modalInstance = $modal.open({
          size: 'lg',
          templateUrl: '/modules/core/views/search-modal.client.view.html',
          scope: $scope
        });
      }, function (error) {
        $scope.error = error;
      });
    };
    $scope.closeModal = function () {
      modalInstance.close();
    };
  }
]);'use strict';
angular.module('core').directive('focusMe', [
  '$timeout',
  function ($timeout) {
    return {
      link: function (scope, element) {
        $timeout(function () {
          element[0].focus();
        }, 500);
      }
    };
  }
]);'use strict';
angular.module('core').directive('history', [
  '$window',
  function ($window) {
    return {
      link: function postLink(scope, element, attrs) {
        if (attrs.history === 'forward') {
          element.addClass('glyphicon glyphicon-chevron-right history');
          element.on('click', function () {
            $window.history.forward();
          });
        } else {
          element.addClass('glyphicon glyphicon-chevron-left history');
          element.on('click', function () {
            $window.history.back();
          });
        }
      }
    };
  }
]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', function () {
  // Define the menus object
  this.menus = {};
  // Validate menu existance
  this.validateMenuExistance = function (menuId) {
    if (menuId && menuId.length) {
      if (this.menus[menuId]) {
        return true;
      } else {
        throw new Error('Menu does not exists');
      }
    } else {
      throw new Error('MenuId was not provided');
    }
    return false;
  };
  // Get the menu object by menu id
  this.getMenu = function (menuId) {
    // Validate that the menu exists
    this.validateMenuExistance(menuId);
    // Return the menu object
    return this.menus[menuId];
  };
  // Add new menu object by menu id
  this.addMenu = function (menuId) {
    // Create the new menu
    this.menus[menuId] = { items: [] };
    // Return the menu object
    return this.menus[menuId];
  };
  // Remove existing menu object by menu id
  this.removeMenu = function (menuId) {
    // Validate that the menu exists
    this.validateMenuExistance(menuId);
    // Return the menu object
    delete this.menus[menuId];
  };
  // Add menu item object
  this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemUIRoute) {
    // Validate that the menu exists
    this.validateMenuExistance(menuId);
    // Push new menu item
    this.menus[menuId].items.push({
      title: menuItemTitle,
      link: menuItemURL,
      uiRoute: menuItemUIRoute || '/' + menuItemURL
    });
    // Return the menu object
    return this.menus[menuId];
  };
  // Remove existing menu object by menu id
  this.removeMenuItem = function (menuId, menuItemURL) {
    // Validate that the menu exists
    this.validateMenuExistance(menuId);
    // Search for menu item to remove
    for (var itemIndex in this.menus[menuId].items) {
      if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
        this.menus[menuId].items.splice(itemIndex, 1);
      }
    }
    // Return the menu object
    return this.menus[menuId];
  };
  //Adding the topbar menu
  this.addMenu('topbar');
});'use strict';
angular.module('core').factory('Search', [
  '$http',
  '$q',
  '$sce',
  function ($http, $q, $sce) {
    var currentData;
    var deferred;
    function refine(data) {
      var urlTemplate = 'http://www.nb.no/services/image/resolver?url_ver=geneza&maxLevel=5&level=1&col=0&row=0&resX=2400&resY=3000&tileWidth=1024&tileHeight=102&urn=';
      if (Array.isArray(data.entry) !== true) {
        data.entry = [data.entry];
      }
      for (var i = 0; i < data.entry.length; i++) {
        var entry = data.entry[i];
        if (typeof entry['nb:urn'] === 'undefined' || typeof entry['nb:digital'] === 'undefined' || entry['nb:digital'].$t === 'false') {
          var removed = data.entry.splice(i, 1);
          console.log('error with data, removing ', removed);
          break;
        }
        var urn = entry['nb:urn'].$t;
        entry.cover = urlTemplate + urn + '_C1';
        if (urn.search('; ') !== -1) {
          // found several urns - fix
          var splitted = urn.split('; ');
          entry['nb:urn'].$t = splitted[splitted.length - 1];
        }
      }
      return data;
    }
    function get(q, index, limit) {
      currentData = [];
      // reset upon new search
      deferred = $q.defer();
      // advanced search
      q = q.replace(/(forfatter|f)[:=]/i, 'namecreators:');
      q = q.replace(/(år|å)[:=]/i, 'year:');
      q = q.replace(/(isbn|i)[:=]/i, 'isbn:');
      q = q.replace(/(beskrivelse|b)[:=]/i, 'description:');
      // free text search
      var ftRegex = /(fritekst|ft)[:=](ja|j)/i;
      if (q.search(ftRegex) !== -1) {
        q = q.replace(ftRegex, '');
        q += '&ft=1';
      }
      // t: after ft:
      q = q.replace(/(tittel|titel|titell|t)[:]/i, 'title:');
      // remove malformed search
      q = q.replace(/[:=&/]$/i, '');
      // append parameters
      index = index || 1;
      limit = limit || 50;
      q += '&index=' + index;
      q += '&items=' + limit;
      $http.get('/search?q=' + q).success(function (data) {
        /* object format:
            ns2:itemsPerPage
            ns2:startIndex
            ns2:totalResults
            link[].href - urls: [0] this, [1] next, [2] spec
            entry[] - hits
                .link[] - [0] book info, [2] urn url, [3] image structure
                .nb:date.$t
                .nb:isbn.$t
                .nb:languages.$t - format "mul; eng; nob"
                .nb:mainentry.$t  - author
                .nb:namecreator.$t - author
                .nb:namecreators.$t - authors
                .nb:subjecttopic.$t - topic
                .nb:urn.$t
                .nb:year.$t
                .summary.$t - format [redaktører/editors: Nevanka Dobljekar, ...;
                                         tekst/text: Arve Hovig, ...;
                                         oversettelse/translation: Marith Hope, ...;
                                         fotografi/photography: Halvard Haugerud] Parallell norsk og engelsk tekst Utstillingskatalog
                .title.$t
            nb:snippet.$t extract of free text search
            */
        data = data.feed;
        if (data.entry) {
          data = refine(data);
          currentData = data;
          deferred.resolve(data);
        } else {
          deferred.reject('Ingen treff.');
        }
      }).error(function (err, stat) {
        deferred.reject('En feil oppstod. Har du avsluttet alle anf\xf8rselstegn?');
      });
      return deferred.promise;
    }
    return { get: get };
  }
]);'use strict';
//Setting up route
angular.module('leser').config([
  '$stateProvider',
  function ($stateProvider) {
    // Leser state routing
    $stateProvider.state('/leser', {
      url: '/leser/:urn',
      templateUrl: 'modules/leser/views/leser.client.view.html'
    });
  }
]);'use strict';
angular.module('leser').controller('LeserController', [
  '$scope',
  '$rootScope',
  'Tilemap',
  '$document',
  '$stateParams',
  '$location',
  '$window',
  'ReaderControls',
  function ($scope, $rootScope, Tilemap, $document, $stateParams, $location, $window, ReaderControls) {
    $rootScope.error = '';
    // reset error messages
    var urn = $stateParams.urn;
    $scope.controls = ReaderControls;
    $scope.controls.show = true;
    $scope.scrollTop = 0;
    // initial position
    $document.on('scroll', function () {
      $scope.scrollTop = window.pageYOffset;
      $scope.$digest();
    });
    $document.on('touchstart', function () {
      $scope.scrollTop = window.pageYOffset;
      $scope.$digest();
    });
    var bookPromise = Tilemap.getPages(urn);
    bookPromise.then(function (pages) {
      var i;
      $scope.pages = pages;
      $scope.controls.currentPage = $location.hash() || 1;
      $scope.controls.pages = pages.length;
      $scope.controls.firstRun = true;
      $scope.controls.levels = pages.getNumberOfLevels();
      $scope.pages.updateLevel($scope.controls.level);
      $scope.$watch('controls.level', function (level) {
        $scope.pages.updateLevel(level);
      });
    }, function (error) {
      $rootScope.error = error;
      $location.url('/');
    });
  }
]);'use strict';
angular.module('leser').directive('bookWidth', function () {
  return {
    link: function postLink(scope, element, attrs) {
      // Book-width directive logic
      var width = scope.$eval(attrs.bookWidth);
      element.css('width', width + '%');
      scope.$watch(attrs.bookWidth, function updateWidth(value) {
        width = value;
        element.css('width', width + '%');
      });
    }
  };
});'use strict';
angular.module('leser').directive('pageHeight', [
  '$timeout',
  '$document',
  '$window',
  function ($timeout, $document, $window) {
    // internal variables
    var _position = 0;
    var _windowHeight = $window.innerHeight;
    var _windowWidth = $window.innerWidth;
    return {
      link: function postLink(scope, element, attrs) {
        // set height of each page manually
        // such that div take up space, even if its not containing images
        // and also, such that images scales
        function setHeight() {
          if (scope.page.currentLevel) {
            // only do stuff if we've got data
            var realWidth = _windowWidth * scope.$eval(attrs.zoom) / 100;
            var sourceWidth = scope.page.currentLevel.width;
            var scale = realWidth / sourceWidth;
            var height = Math.ceil(scope.page.currentLevel.height * scale);
            element.css('height', height + 'px');
            // store offsetTop to the page json
            scope.page.offsetTop = _position;
            _position += height;
            scope.page.offsetBottom = _position;
          }
        }
        scope.$watch(attrs.zoom, function () {
          if (scope.$index === 0)
            _position = 0;
          // reset position
          setHeight();
        });
        angular.element($window).on('resize', function () {
          if (scope.$index === 0)
            _position = 0;
          // reset position
          _windowHeight = $window.innerHeight;
          _windowWidth = $window.innerWidth;
          setHeight();
        });
      }
    };
  }
]);'use strict';
angular.module('leser').directive('scaleImage', function () {
  return {
    link: function postLink(scope, element, attrs) {
      // use flexbox to scale images
      var scale;
      if (scope.$last) {
        scale = scope.page.currentLevel.lastColumnScale;
        element.css('-webkit-box-flex', scale);
        element.css('-moz-box-flex', scale);
        element.css('-ms-box-flex', scale);
        element.css('-webkit-flex', scale);
        element.css('-ms-flex', scale);
        element.css('flex', scale);
      } else
        element.css('-webkit-flex', 1);
    }
  };
});'use strict';
angular.module('leser').directive('scaleRow', function () {
  return {
    link: function postLink(scope, element, attrs) {
      // use flexbox to scale images
      var scale;
      if (scope.$last) {
        scale = scope.page.currentLevel.lastRowScale;
        element.css('-webkit-box-flex', scale);
        element.css('-moz-box-flex', scale);
        element.css('-ms-box-flex', scale);
        element.css('-webkit-flex', scale);
        element.css('-ms-flex', scale);
        element.css('flex', scale);
      } else
        element.css('-webkit-flex', 1);
    }
  };
});'use strict';
angular.module('leser').factory('ReaderControls', [
  '$location',
  '$anchorScroll',
  '$modal',
  'ipCookie',
  '$window',
  '$rootScope',
  function ($location, $anchorScroll, $modal, ipCookie, $window, $rootScope) {
    var _zoomValues = [];
    for (var i = 10; i < 101; i += 10) {
      _zoomValues.push({
        value: i,
        text: i + '%'
      });
    }
    var _windowHeight = $window.innerHeight;
    var _controls = {
        currentPage: 1,
        pages: 1,
        pageList: [],
        firstRun: true,
        level: ipCookie('level') || 5,
        levels: 6,
        levelList: [
          0,
          1,
          2,
          3,
          4,
          5
        ],
        show: false,
        zoomValues: _zoomValues,
        zoom: ipCookie('zoom') || 100,
        goto: function () {
          // goes to currentPage
          var id = 'p' + this.currentPage;
          console.log(id);
          if (!document.getElementById(id)) {
            var modalInstance = $modal.open({ template: '<div class="alert alert-danger">Finner ikke siden.</div>' });
          } else {
            $location.hash(id);
            $anchorScroll();
          }
        },
        showPage: function (windowPageYOffset, elementTopOffset, elementBottomOffset) {
          if (Math.abs(windowPageYOffset - elementTopOffset) > 5000)
            return false;  // short curcuit
          else {
            return Math.abs(windowPageYOffset - elementTopOffset) < _windowHeight || Math.abs(windowPageYOffset - elementBottomOffset) < _windowHeight || elementTopOffset - windowPageYOffset < 0 && windowPageYOffset + _windowHeight - elementBottomOffset < 0;  // AND bottom under view
          }
        }
      };
    // update cookie when quality level updates
    $rootScope.$watch(function () {
      return _controls.level;
    }, function (newValue, oldValue) {
      ipCookie('level', newValue, { expires: 365 });
    });
    // update cookie when zoom updates
    $rootScope.$watch(function () {
      return _controls.zoom;
    }, function (newValue, oldValue) {
      ipCookie('zoom', newValue, { expires: 365 });
    });
    // update pageList when pages updates
    $rootScope.$watch(function () {
      return _controls.pages;
    }, function (pages, oldValue) {
      if (pages !== oldValue) {
        _controls.pageList = [];
        for (var i = 1; i <= pages; i++) {
          _controls.pageList.push(i);
        }
      }
    });
    // update levelList when levels updates
    $rootScope.$watch(function () {
      return _controls.levels;
    }, function (levels, oldValue) {
      if (levels !== oldValue) {
        _controls.levelList = [];
        for (var i = 0; i < levels; i++) {
          _controls.levelList.push(i);
        }
        if (levels - 1 < _controls.level)
          _controls.level = levels - 1;
      }
    });
    // Public API
    return _controls;
  }
]);'use strict';
angular.module('leser').factory('Tilemap', [
  '$http',
  '$timeout',
  '$q',
  function ($http, $timeout, $q) {
    var _pages;
    var updateLevel = function (level) {
      angular.forEach(_pages, function (page) {
        page.currentLevel = page.tileMap.levels[level];
      });
    };
    var getNumberOfLevels = function () {
      return _pages[0].tileMap.levels.length;
    };
    function createImageArray(level, templateUrl) {
      // store images in 2d array for easier access
      for (var i = 0; i < level.rows; i++) {
        level.images.push([]);
        for (var j = 0; j < level.columns; j++) {
          var url = templateUrl.replace('{row}', i).replace('{column}', j);
          level.images[i].push(url);
        }
      }
      return level;
    }
    function processLevels(levels, pageIndex) {
      for (var i = 0; i < levels.length; i++) {
        var level = levels[i];
        var templateUrl = level.uri.template;
        level.images = [];
        // set scale of last row/column
        var pixels;
        var tileHeight = _pages[pageIndex].tileMap.tileHeight;
        var tileWidth = _pages[pageIndex].tileMap.tileWidth;
        if (level.height > tileHeight) {
          pixels = level.height - (level.rows - 1) * tileHeight;
          level.lastRowScale = pixels / tileHeight;
        }
        if (level.width > tileWidth) {
          pixels = level.width - (level.columns - 1) * tileWidth;
          level.lastColumnScale = pixels / tileWidth;
        }
        level = createImageArray(level, templateUrl);
      }
      return levels;
    }
    var getPages = function (urn) {
      _pages = [];
      _pages.updateLevel = updateLevel;
      _pages.getNumberOfLevels = getNumberOfLevels;
      var deferred = $q.defer();
      $http.get('/tilemap/' + urn).success(function (data) {
        if (!data.pages) {
          deferred.reject('Fant ikke urn: ' + urn);
        } else {
          // refactor
          for (var i = 0; i < data.pages.pages.length; i++) {
            var page = data.pages.pages[i];
            if (page.pg_type === 'COVER_SPINE') {
              break;
            } else {
              _pages.push({
                pageId: page.pg_id,
                pageLabel: page.pg_label,
                pageType: page.pg_type,
                resolution: page.resolution,
                tileHeight: page.tileHeight,
                tileMap: page.tileMap.image.pyramid
              });
            }
            _pages[i].tileMap.levels = processLevels(_pages[i].tileMap.levels, i);
          }
        }
        deferred.resolve(_pages);  //console.log(_pages);
      });
      return deferred.promise;
    };
    // Public API
    return { getPages: getPages };
  }
]);
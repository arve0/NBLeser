angular.module('core', []);

// Setting up route
angular.module('core').config(
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
        state('home', {
            url: '/',
            templateUrl: 'views/home.html'
        });
    }
);


angular.module('core').controller('HeaderController',
    function($scope, Menus, $anchorScroll, $location, $modal, ReaderControls, BookInfo) {
        $scope.bookInfo = BookInfo;
        $scope.showSettings = false;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
        };

        $scope.controls = ReaderControls;

        // Terms
        var modalInstance;
        $scope.showTerms = function(){
            modalInstance = $modal.open({
              templateUrl: 'views/terms.html',
              scope: $scope,
            });
        };
        $scope.closeTerms = function () {
            modalInstance.close();
        };

    }
);


angular.module('core').controller('HomeController',
function ($scope, $location, $rootScope, $http, Search, $modal, ReaderControls, $window) {
    // variables
    ReaderControls.show = false; // hide controls in home view

    // sett tittel
    $window.document.title = 'NBLeser - Les over 170-tusen ebøker gratis fra Nasjonalbiblioteket';

    // button actions
    $scope.search = function(query){
        $location.url('/search/' + query);
    };
    $scope.readFirstHit = function(query){
        $scope.error = false;
        var searchPromise = Search.get(query);
        searchPromise.then(function(data){
            var urn = data.entry[0]['nb:urn'].content;
            $location.url('/leser/' + urn);
        },function(err){
            $scope.error = err;
        });
    };
    $scope.read = function(urn){
        $location.url('/leser/' + urn);
    };

});


angular.module('core').directive('focusMe',
function($timeout) {
    return {
    link: function (scope, element) {
        $timeout(function(){
            element[0].focus();
        }, 500);
    }
};
});


angular.module('core').directive('history',
function($window) {
    return {
        link: function postLink(scope, element, attrs) {
            if (attrs.history === 'forward'){
                element.addClass('glyphicon glyphicon-chevron-right history');
                element.on('click', function() {
                    $window.history.forward();
                });
            }
            else {
                element.addClass('glyphicon glyphicon-chevron-left history');
                element.on('click', function() {
                    $window.history.back();
                });
            }
        }
    };
});


//Menu service used for managing  menus
angular.module('core').service('Menus',
	function() {
		// Define the menus object
		this.menus = {};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
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
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId) {
			// Create the new menu
			this.menus[menuId] = {
				items: [],
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemUIRoute) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
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
	}
);
'use strict';
angular.module('search', []);

//Setting up route
angular.module('search').config(['$stateProvider',
	function($stateProvider) {
		// Search state routing
		$stateProvider.
		state('search', {
			url: '/search/:query',
			templateUrl: 'views/search.html'
		});
	}
]);


angular.module('search').controller('SearchController',
function($rootScope, $scope, $stateParams, $location, Search, ReaderControls, $window) {

    var query = $stateParams.query;

    $window.document.title = 'Søkeresultat for ' + query;
    ReaderControls.show = false;

    $scope.query = query;

    $scope.error = false;
    $scope.searchResults = [];
    var searchPromise = Search.get(query);
    searchPromise.then(function(data){
        $scope.searchResults.push(data);
        if (data.entry.length === 1){
            var urn = data.entry[0]['nb:urn'].content;
            $location.url('/leser/' + urn);
        }
        //console.log(data);
    },function(error){
        $rootScope.error = error;
        $location.url('/');
    });
});


angular.module('search').filter('semicolonList',
function() {
    function unique(value, index, self) {
        return self.indexOf(value) === index;
    }
    function capitalize(value, index, self) {
        return value.toLowerCase().charAt(0).toUpperCase() + value.slice(1);
    }

    return function(input) {
        var list = input.split('; ');
        list = list.map(capitalize).sort();
        list = list.filter(unique);
        var listHtml = '';
        for (var i=0; i<list.length; i++){
            listHtml += list[i] + ', ';
        }
        listHtml = listHtml.slice(0, -2) + '.';
        return listHtml;
    };
});


angular.module('core').factory('Search',
function($http, $q) {
    var currentData;
    var deferred;

    function refine(data) {
        var coverUrlTemplate = 'https://www.nb.no/services/image/resolver?url_ver=geneza&maxLevel=5&level=1&col=0&row=0&resX=1649&resY=2655&tileWidth=1024&tileHeight=1024&urn=';
        if (Array.isArray(data.entry) !== true){
            data.entry = [data.entry];
        }
        for (var i=0; i < data.entry.length; i++){
            var entry = data.entry[i];
            // get sesamid from link[0]
            entry.sesamid = entry.link[0].href.replace(/^http:\/\/[a-z.]*(\/[a-z0-9]+){4}\//i, '');
            if (typeof entry['nb:urn'] === 'undefined' ||
                typeof entry['nb:digital'] === 'undefined' ||
                entry['nb:digital'].content === 'false') {
                var removed = data.entry.splice(i,1);
                console.log('error with data, removing i:', i, removed);
                continue;
            }
            var urn = entry['nb:urn'].content;
            entry.cover = coverUrlTemplate + urn + '_C1';
            if (urn.search('; ') !== -1){
                // found several urns - fix
                var splitted = urn.split('; ');
                entry['nb:urn'].content = splitted[splitted.length -1];
            }
        }
        return data;
    }

    function get(query, index, limit) {
        currentData = []; // reset upon new search
        deferred = $q.defer();

        // advanced search
        query = query.replace(/(forfatter|f)[:=]/i, 'namecreators:');
        query = query.replace(/(år|å)[:=]/i, 'year:');
        query = query.replace(/(isbn|i)[:=]/i, 'isbn:');
        query = query.replace(/(beskrivelse|b)[:=]/i, 'description:');

        // free text search
        var ftRegex = /(fritekst|ft)[:=](ja|j)/i;
        if (query.search(ftRegex) !== -1){
            query = query.replace(ftRegex, '');
            query += '&ft=true';
        }
        // t: after ft:
        query = query.replace(/(tittel|titel|titell|t)[:]/i, 'title:');

        // remove malformed search
        query = query.replace(/[:=&/]$/i, '');

        // append parameters
        index = (index || 1);
        limit = (limit || 50);
        query += '&Index=' + index;
        query += '&itemsPerPage=' + limit;
        query += '&sort=date:desc';

        $http.get('https://www.nb.no/services/search/v2/search?q=contentClasses:bokhylla ' + query).success(function(data){
            // console.log(data);
            /* object format:
            ns2:itemsPerPage
            ns2:startIndex
            ns2:totalResults
            link[].href - urls: [0] this, [1] next, [2] spec
            entry[] - hits
                .link[] - [0] book info, [2] urn url, [3] image structure
                .nb:date.content
                .nb:isbn.content
                .nb:languages.content - format "mul; eng; nob"
                .nb:mainentry.content  - author
                .nb:namecreator.content - author
                .nb:namecreators.content - authors
                .nb:subjecttopic.content - topic
                .nb:urn.content
                .nb:year.content
                .summary.content - format [redaktører/editors: Nevanka Dobljekar, ...;
                                         tekst/text: Arve Hovig, ...;
                                         oversettelse/translation: Marith Hope, ...;
                                         fotografi/photography: Halvard Haugerud] Parallell norsk og engelsk tekst Utstillingskatalog
                .title.content
            nb:snippet.content extract of free text search
            */

            data = data.feed;
            if (data.entry) {
                data = refine(data);
                currentData = data;
                deferred.resolve(data);
            }
            else {
                deferred.reject('Ingen treff.');
            }

        }).error(function(err, stat){
            deferred.reject('En feil oppstod. Har du avsluttet alle anførselstegn?');
        });

        return deferred.promise;
    }

    return {
        get: get,
    };

});
'use strict';
angular.module('leser', []);

//Setting up route
angular.module('leser').config(
    function($stateProvider) {
        // Leser state routing
        $stateProvider.
        state('leser', {
            url: '/leser/:urn',
            templateUrl: 'views/leser.html'
        });
    }
);


angular.module('leser').controller('LeserController',
        function($scope, $rootScope, Tilemap, $document, $stateParams, $location, ReaderControls, $timeout, Search, $window, BookInfo) {

        $rootScope.error = ''; // reset error messages
        $scope.showSettings = false;

        var urn = $stateParams.urn;
        BookInfo.urn = urn;


        // set title and get book information
        var searchPromise = Search.get('urn:"' + urn + '"');
        searchPromise.then(function(data){
            $window.document.title = data.entry[0].title.content + ', av ' + data.entry[0]['nb:mainentry'].content + ' - Les/stream gratis med NBLeser';
            // book info service
            BookInfo.author = data.entry[0]['nb:mainentry'].content;
            BookInfo.get(data.entry[0].sesamid);
        });


        $scope.controls = ReaderControls;
        $scope.controls.show = true;

        $scope.scrollTop = 0; // initial position
        $document.on('scroll', function(){
            $scope.scrollTop = window.pageYOffset;
            if ($scope.pages) { // wait for data
                for (var i=0; i<$scope.pages.length; i++){
                    if ($scope.scrollTop < $scope.pages[i].offsetTop) {
                        // we are past page
                        $scope.controls.currentPage = $scope.controls.pageList[i-1];
                        break;
                    }
                }
            }
            $rootScope.$digest();
        });
        $document.on('touchstart', function(){
            $scope.scrollTop = window.pageYOffset;
            $scope.$digest();
        });


        var tilemapPromise = Tilemap.getPages(urn);
        tilemapPromise.then(function(pages){
            //console.log(pages);
            var i;
            $scope.pages = pages;
            $scope.controls.pages = pages.length;
            $scope.controls.firstRun = true;
            $scope.controls.levels = pages.getNumberOfLevels();
            $scope.pages.updateLevel($scope.controls.level);
            $scope.$watch('controls.level', function(level){
                $scope.pages.updateLevel(level);
            });
            $timeout(function(){
                var page = $location.hash().replace(/^p/, '');
                if (page) {
                    $scope.controls.currentPage = $scope.controls.pageList[page - 1];
                    $scope.controls.goto();
                }
            });
        }, function(error){
            $rootScope.error = error;
            $location.url('/');
        });

    }
);


angular.module('leser').directive('bookWidth',
function() {


return {
    link: function postLink(scope, element, attrs) {
        // Book-width directive logic
        var width = scope.$eval(attrs.bookWidth);
        element.css('width', width + '%');

        scope.$watch(attrs.bookWidth, function updateWidth(value){
            width = value;
            element.css('width', width + '%');
        });
    }
};


});


angular.module('leser').directive('pageHeight',
    function($timeout, $document, $window) {
        // internal variables
        var _position = 0;
        var _windowHeight = $window.innerHeight;
        var _windowWidth = $window.innerWidth;


        return {
            link: function postLink(scope, element, attrs) {
                // set height of each page manually
                // such that div take up space, even if its not containing images
                // and also, such that images scales
                function setHeight(){
                    if (scope.page.currentLevel) {
                        // only do stuff if we've got data
                        var realWidth = _windowWidth * scope.$eval(attrs.zoom)/100;
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

                scope.$watch(attrs.zoom, function(){
                    if (scope.$index === 0) _position=0; // reset position
                    setHeight();
                });

                angular.element($window).on('resize', function(){
                    if (scope.$index === 0) _position=0; // reset position
                    _windowHeight = $window.innerHeight;
                    _windowWidth = $window.innerWidth;
                    setHeight();
                });
            }
        };
    }
);


angular.module('leser').directive('scaleImage',
function() {
return {
    link: function postLink(scope, element, attrs) {
        // use flexbox to scale images
        var scale;
        if (scope.$last) {
            // convert scale to string, avoid setting scale in pixels
            scale = '' + scope.page.currentLevel.lastColumnScale;
            element.css('-webkit-box-flex', scale);
            element.css('-moz-box-flex', scale);
            element.css('-ms-box-flex', scale);
            element.css('box-flex', scale);
            element.css('-webkit-flex', scale);
            element.css('-ms-flex', scale);
            element.css('flex', scale);
        }
    }
};
});


angular.module('leser').directive('scaleRow',
function() {
return {
    link: function postLink(scope, element, attrs) {
        // use flexbox to scale images
        var scale;
        if (scope.$last) {
            // convert scale to string, avoid setting scale in pixels
            scale = '' + scope.page.currentLevel.lastRowScale;
            element.css('-webkit-box-flex', scale);
            element.css('-moz-box-flex', scale);
            element.css('-ms-box-flex', scale);
            element.css('box-flex', scale);
            element.css('-webkit-flex', scale);
            element.css('-ms-flex', scale);
            element.css('flex', scale);
        }
    }
};
});


angular.module('leser').filter('extent',
function() {
    return function(input) {
    // Extent directive logic
    // transform abbreviations
        // s. -> sider
        var out = input.replace(/ s\./gi,' sider');
        // bl. -> blad
        out = out.replace(/ bl\./gi,' blad');
        // ill. -> illustrert
        out = out.replace(/ ill\./gi, ' illustrert');
        // fold. -> foldet
        out = out.replace(/ fold\./gi, ' foldet');
        // kart. -> kart
        out = out.replace(/ kart\./gi, ' kartblad');
        // commas
        out = out.replace(/([a-z]) /gi, '$1, ');
        // remove special case commas
        out = out.replace(/ foldet, kartblad/gi, ' foldet kartblad');

        return out;
    };
});


angular.module('leser').filter('publisher', [
    function() {
        return function(input) {
            // Forlag directive logic
            // forl. -> forlag
            input = input.replace('forl.', 'forlag');

            return input;
        };
    }
]);


angular.module('leser').factory('BookInfo',
function($http, $modal, $rootScope) {
    // Object to return
    var _bookInfo = {
        data: {},
        show: false,
    };

    function _getWorldcatMetadata(isbn){
        // enhance metadata
        _bookInfo.metadata = {};
        var url = 'https://crossorigin.me/';
        url += 'http://xisbn.worldcat.org/webservices/xid/isbn/';
        url += isbn;
        url += '?method=getMetadata&format=json&fl=*&count=1';
        $http.get(url).success(function(data){
            if (data.stat === 'ok'){
                //console.log(data);
                _bookInfo.metadata = data;
                var metadata = data.list[0];
                // override data
                if (metadata.publisher) _bookInfo.data.publisher = metadata.publisher;
            }
        }).error(function(err){
            console.log(err);
        });

    }

    // initialize function
    function _get(id){
        _bookInfo.data = {};
        var url = 'https://www.nb.no/services/search/v2/mods/' + id;
        $http.get(url).success(function(data){
            //console.log(data);
            var d = new DOMParser().parseFromString(data, 'text/xml');
            function __get (name, key) {
                key = key || 'innerHTML';
                var el = d.querySelector(name);
                return el ? el[key] : '';
            }

            _bookInfo.data = {};
            // map useful data to shorter names
            _bookInfo.data.extent = __get('extent');
            _bookInfo.data.publisher = __get('publisher');
            // title
            _bookInfo.data.title = __get('title');

            // Issued
            _bookInfo.data.issued = __get('dateIssued');
            // ISBN
            if (__get('identifier', 'attributes').type === 'isbn'){
                _bookInfo.data.isbn = __get('identifier');
                var isbn = Number(_bookInfo.data.isbn.split(' ')[0]);
                if (typeof isbn === 'number') {
                    _getWorldcatMetadata(isbn);
                }
            }
            // Author(s)
            _bookInfo.data.authors = __get('note');


        }).error(function(err){
            console.log(err);
        });
    }
    _bookInfo.get = _get;


    // modal
    $rootScope.$watch(function(){
        return _bookInfo.show;
    }, function (newValue, oldValue){
        if (newValue === true) {
            var modalInstance = $modal.open({
                templateUrl: 'views/book-info-modal.html',
                controller: 'BookInfoController',
            });
            modalInstance.result.then(function(){
                // closed
                _bookInfo.show = false;
            }, function(){
                // dismissed
                _bookInfo.show = false;
            });
        }
    });

    // Public API
    return _bookInfo;

});

angular.module('leser').controller('BookInfoController', function($scope, BookInfo, $stateParams){
    $scope.bookInfo = BookInfo;
});



angular.module('leser').factory('ReaderControls',
function($location, $anchorScroll, $modal, ipCookie, $window, $rootScope, $timeout) {

    var _zoomValues = [];
    for (var i=10;i<101;i+=10){
        _zoomValues.push({value: i, text: i + '%'});
    }

    var _windowHeight = $window.innerHeight;
    var _pageList = [1];
    var _level = ipCookie('level');
    if (_level === undefined) {
        _level = 5;
    }

    var _controls = {
        pages: 1,
        pageList: _pageList,
        currentPage: _pageList[0],
        firstRun: true,
        level: _level,
        levels: 6,
        levelList: [0,1,2,3,4,5],
        show: false,
        zoomValues: _zoomValues,
        zoom: ipCookie('zoom') || 100,
        goto: function() {
            // goes to currentPage
            var id = 'p' + this.currentPage;
            if (!document.getElementById(id)) {
                var modalInstance = $modal.open({
                    template: '<div class="alert alert-danger">Finner ikke siden.</div>',
                });
            }
            else {
                $location.hash(id);
                $timeout($anchorScroll);
            }
        },
        showPage: function(windowPageYOffset, elementTopOffset, elementBottomOffset) {
            // if page in view => make it visible
            if (Math.abs(windowPageYOffset - elementTopOffset) < _windowHeight) {
                // top in view
                return true;
            }
            if (Math.abs(windowPageYOffset - elementBottomOffset) < _windowHeight) {
                // bottom in view
                return true;
            }
            if ((elementTopOffset - windowPageYOffset) < 0 &&
                (windowPageYOffset + _windowHeight - elementBottomOffset) < 0 ) {
                // special case, top over view
                // AND bottom under view
                return true;
            }
            // pages in proximity (10k pixels) to view
            return Math.abs(windowPageYOffset - elementTopOffset) < 10000;
        },
    };


    // update cookie when quality level updates
    $rootScope.$watch(function(){
        return _controls.level;
    }, function(newValue, oldValue){
        ipCookie('level', newValue, {expires: 365});
    });

    // update cookie when zoom updates
    $rootScope.$watch(function(){
        return _controls.zoom;
    }, function(newValue, oldValue){
        ipCookie('zoom', newValue, {expires: 365});
    });

    // update pageList when pages updates
    $rootScope.$watch(function(){
        return _controls.pages;
    }, function(pages, oldValue){
        if (pages !== oldValue){
            _pageList = [];
            for (var i=1; i <= pages; i++){
                _pageList.push(i);
            }
            _controls.pageList = _pageList;
            _controls.currentPage = _pageList[0];
        }
    });

    // update levelList when levels updates
    $rootScope.$watch(function(){
        return _controls.levels;
    }, function(levels, oldValue){
        if (levels !== oldValue){
            _controls.levelList = [];
            for (var i=0; i < levels; i++){
                _controls.levelList.push(i);
            }
            if ((levels-1) < _controls.level) _controls.level = levels-1;
        }
    });


    // Public API
    return _controls;
});


angular.module('leser').factory('Tilemap',
    function($http, $timeout, $q) {
        var _pages;


        var updateLevel = function(level){
            angular.forEach(_pages, function(page){
                page.currentLevel = page.tileMap.levels[level];
            });
        };

        var getNumberOfLevels = function(){
            return _pages[0].tileMap.levels.length;
        };

        function createImageArray(level, templateUrl){
            // store images in 2d array for easier access
            for (var i=0; i < level.rows; i++){
                level.images.push([]);
                for (var j=0; j < level.columns; j++){
                    var url = templateUrl.replace('{row}', i).replace('{column}', j);
                    url = url.replace(/^http:/, 'https:');
                    level.images[i].push(url);
                }
            }
            return level;
        }

        function processLevels(levels, pageIndex){
            for (var i=0; i < levels.length; i++) {
                var level = levels[i];
                var templateUrl = level.uri.template;
                level.images = [];
                // set scale of last row/column
                var pixels;
                var tileHeight = _pages[pageIndex].tileMap.tileHeight;
                var tileWidth = _pages[pageIndex].tileMap.tileWidth;
                if (level.height > tileHeight) {
                    pixels = level.height - (level.rows-1) * tileHeight;
                    level.lastRowScale = pixels / tileHeight;
                }
                if (level.width > tileWidth) {
                    pixels = level.width - (level.columns-1) * tileWidth;
                    level.lastColumnScale = pixels / tileWidth;
                }
                level = createImageArray(level, templateUrl);
            }
            return levels;
        }
        var getPages = function(urn){
            _pages = [];
            _pages.updateLevel = updateLevel;
            _pages.getNumberOfLevels = getNumberOfLevels;

            var deferred = $q.defer();
            var url = 'https://crossorigin.me/';
            url += 'http://www.nb.no/services/tilesv2/tilemap?viewer=html&pagetype=&format=json&URN=';
            url += urn;
            $http.get(url).success(function(data){
                if (!data.pages) {
                    deferred.reject('Fant ikke urn: ' + urn);
                }
                else { // refactor
                    for (var i=0; i < data.pages.pages.length; i++){
                        var page = data.pages.pages[i];
                        if (page.pg_type === 'COVER_SPINE') {
                            break;
                        }
                        else {
                            _pages.push({
                                pageId: page.pg_id,
                                pageLabel: page.pg_label,
                                pageType: page.pg_type,
                                resolution: page.resolution,
                                tileHeight: page.tileHeight,
                                tileMap: page.tileMap.image.pyramid,
                            });
                        }
                        _pages[i].tileMap.levels = processLevels(_pages[i].tileMap.levels, i);
                    }
                }
                deferred.resolve(_pages);
                //console.log(_pages);
            }).error(function(err, stat){
                deferred.reject('Finner ikke boken.');
            });
            return deferred.promise;
        };


        // Public API
        return {
            getPages: getPages,
        };
    }
);
'use strict';

angular.module('nbleser', ['ngResource', 'ipCookie', 'ngAnimate', 'ngTouch', 'ngSanitize', 'ui.router', 'ui.bootstrap', 'ui.utils', 'core', 'leser', 'search' ]);

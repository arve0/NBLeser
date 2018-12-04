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
        searchPromise.then(function(entries){
            $window.document.title = entries[0].title + ', av ' + entries[0].mainentry + ' - Les/stream gratis med NBLeser';
            // book info service
            BookInfo.author = entries[0].mainentry;
            BookInfo.get(entries[0].sesamid);
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
        var url = 'https://cors.seljebu.no/';
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
            var url = 'https://www.nb.no/services/tilesv2/tilemap?viewer=html&pagetype=&format=json&URN=';
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

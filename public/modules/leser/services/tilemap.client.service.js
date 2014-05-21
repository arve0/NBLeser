'use strict';

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
            $http.get('/tilemap/' + urn).success(function(data){
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
            });
            return deferred.promise;
        };


        // Public API
        return {
            getPages: getPages,
        };
    }
);

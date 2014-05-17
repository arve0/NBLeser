'use strict';

angular.module('leser').factory('Tilemap', ['$http', '$timeout', '$q',
    function($http, $timeout, $q) {
        var _tilemap = [];
        var _done = false;

        var requestTiles = function(urn, level){
            $http.get('/getJSON/' + urn).success(function(data){
                angular.forEach(data.pages.pages, function(page){
                    var templateUrl = page.tileMap.image.pyramid.levels[level].uri.template;
                    var rows = page.tileMap.image.pyramid.levels[level].rows;
                    var columns = page.tileMap.image.pyramid.levels[level].columns;
                    for (var i=0; i < rows; i++){
                        _tilemap.push([]);
                        for (var j=0; j < columns; j++){
                            var url = templateUrl.replace('{row}', i).replace('{column}', j);
                            var lastRow = _tilemap.length - 1;
                            _tilemap[lastRow].push({url: url});
                        }
                    }
                });
            _done = true;
            });
        };


        var get = function(index, count, next){
            index -= 1;
            console.log('getting slice: ', index, count);
            if (index + count <= 0) return next([]);
            var start = index > 0 ? index : 0;
            return next(_tilemap.slice(start,index + count));
        };

        var revision = function() {
            return _done;
        };


        // Public API
        return {
            requestTiles: requestTiles,
            get: get,
            revision: revision,
        };
    }
]);

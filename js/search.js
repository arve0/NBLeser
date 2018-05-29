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
        if (data.length === 1){
            $location.url('/leser/' + data[0].urn);
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
    var deferred;

    function get(query, index, limit) {
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

        var url = 'https://cors.seljebu.no/';
        url += 'https://www.nb.no/services/search/v2/search?q=contentClasses:bokhylla ';
        url += query;

        $http.get(url).success(function(data){
            var parser = new DOMParser()
            var dom = parser.parseFromString(data, 'application/xml');
            var entries = Array.from(dom.getElementsByTagName('entry'))
                .map(parseEntry)
                .filter(function (entry) {
                    // fjern ugyldige treff
                    return entry.urn && entry.digital && entry.digital === 'true';
                });
            if (entries.length > 0) {
                deferred.resolve(entries);
            }
            else {
                deferred.reject('Ingen treff.');
            }

        }).error(function(err, stat){
            deferred.reject('En feil oppstod. Har du avsluttet alle anførselstegn?');
        });

        return deferred.promise;
    }

    /**
     * Get values for, urn, cover, title, namecreators, year, isbn and subjecttopic.
     * @param {dom} entry
     */
    function parseEntry (entry) {
        var keys = ['urn','cover','title','namecreators','year','isbn','subjecttopic', 'digital', 'sesamid', 'mainentry'];

        var coverUrlTemplate = 'https://www.nb.no/services/image/resolver?url_ver=geneza&maxLevel=5&level=1&col=0&row=0&resX=1649&resY=2655&tileWidth=1024&tileHeight=1024&urn=';

        return keys.reduce(function (e, k) {
            if (k === 'urn') {
                var urn = entry.querySelector(k).textContent;
                if (urn.search('; ') !== -1){
                    // found several urns - fix by taking last
                    var splitted = urn.split('; ');
                    urn = splitted[splitted.length - 1];
                }
                e[k] = urn;
            } else if (k === 'cover') {
                e[k] = coverUrlTemplate + e.urn + '_C1';
            } else {
                var element = entry.querySelector(k)
                e[k] = element && element.textContent;
            }
            return e;
        }, {});
    }

    return {
        get: get,
    };

});

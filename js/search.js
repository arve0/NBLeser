'use strict';
angular.module('search', []);

//Setting up route
angular.module('search').config(['$stateProvider',
	function($stateProvider) {
		// Search state routing
		$stateProvider.
		state('search', {
			url: '/search/:query',
			templateUrl: '../views/search.html'
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
        var coverUrlTemplate = 'http://www.nb.no/services/image/resolver?url_ver=geneza&maxLevel=5&level=1&col=0&row=0&resX=1649&resY=2655&tileWidth=1024&tileHeight=1024&urn=';
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

        $http.get('http://www.nb.no/services/search/v2/search?q=contentClasses:bokhylla ' + query).success(function(data){
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

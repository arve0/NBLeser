'use strict';

angular.module('search').controller('SearchController',
function($rootScope, $scope, $stateParams, $location, Search, ReaderControls, $window) {
    
    var query = $stateParams.query;

    $window.document.title = 'Søkeresultat for ' + query;
    ReaderControls.show = false;

    $scope.query = query;

    $scope.read = function(urn){
        $location.url('/leser/' + urn);
    };

    $scope.error = false;
    $scope.searchResults = [];
    var searchPromise = Search.get(query);
    searchPromise.then(function(data){
        $scope.searchResults.push(data);
        if (data.entry.length === 1){
            var urn = data.entry[0]['nb:urn'].$t;
            $location.url('/leser/' + urn);
        }
        //console.log(data);
        //console.log(data.entry[0]['nb:sesamid']);
    },function(error){
        $rootScope.error = error;
        $location.url('/');
    });
});

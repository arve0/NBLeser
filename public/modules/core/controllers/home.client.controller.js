'use strict';

angular.module('core').controller('HomeController',
function ($scope, $location, $rootScope, $http, Search, $modal) {
    // variables
    var modalInstance;
    $rootScope.controls = {};
    $rootScope.controls.show = false;

    $scope.read = function(urn, close){
        $location.url('/leser/' + urn);
        if (close) {
            modalInstance.close();
        }
    };
    
    $scope.readFirst = function(query){
        $scope.error = false;
        var searchPromise = Search.get(query);
        searchPromise.then(function(data){
            var urn = data.entry[0]['nb:urn'].$t;
            $location.url('/leser/' + urn);
        },function(err){
            $scope.error = err;
        });
    };
    $scope.search = function(query){
        $scope.error = false;
        $scope.searchResults = [];
        var searchPromise = Search.get(query);
        searchPromise.then(function(data){
            $scope.searchResults.push(data);
            modalInstance = $modal.open({
                size: 'lg',
                templateUrl: '/modules/core/views/search-modal.client.view.html',
                scope: $scope,
            });
        },function(error){
            $scope.error = error;
        });
    };
    $scope.closeSearchModal = function () {
        modalInstance.close();
    };
});

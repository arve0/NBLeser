'use strict';

angular.module('core').controller('HomeController', ['$scope', '$location', '$rootScope', '$http',
function ($scope, $location, $rootScope, $http) {
    $scope.les = function(urn){
        $location.url('/leser/' + urn);
    };
    $rootScope.controls = {};
    $rootScope.controls.show = false;

    $scope.search = function(query){
        $http.get('/search?q=' + query).success(function(data){
            var urn = data.feed.entry[0]['nb:urn'][0]._;
            $location.url('/leser/' + urn);
        });
    };
}]);

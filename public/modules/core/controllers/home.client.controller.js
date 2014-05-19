'use strict';

angular.module('core').controller('HomeController', ['$scope', '$location',
function ($scope, $location) {
    $scope.les = function(urn){
        $location.url('/leser/' + urn);
    };
}]);

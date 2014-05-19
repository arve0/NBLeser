'use strict';

angular.module('core').controller('HomeController', ['$scope', '$location', '$rootScope',
function ($scope, $location, $rootScope) {
    $scope.les = function(urn){
        $location.url('/leser/' + urn);
    };
    $rootScope.controls = {};
    $rootScope.controls.show = false;
}]);

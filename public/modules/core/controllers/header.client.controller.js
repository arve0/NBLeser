'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$rootScope', 'Menus', '$anchorScroll', '$location', 
    function($scope, $rootScope, Menus, $anchorScroll, $location) {
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
        };

        $scope.goto = function(page) {
            console.log('going to: ', page);
            $location.hash(page);
            $anchorScroll();
        };
    }
]);

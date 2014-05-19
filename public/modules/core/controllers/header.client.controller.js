'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$rootScope', 'Menus', '$anchorScroll', '$location',
    function($scope, $rootScope, Menus, $anchorScroll, $location) {
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
        };


        $rootScope.level = 5;
        $rootScope.zoom = 100;

        $scope.$watch('zoom', function(zoom){
            $rootScope.zoom = zoom;
        });
        $scope.$watch('level', function(level){
            $rootScope.level = level;
        });

        $scope.goto = function(page) {
            console.log('going to: ', page);
            $location.hash(page);
            $anchorScroll();
        };
    }
]);

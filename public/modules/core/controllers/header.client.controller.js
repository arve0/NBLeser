'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$rootScope', 'Menus', '$anchorScroll', '$location', '$modal',
    function($scope, $rootScope, Menus, $anchorScroll, $location, $modal) {
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

        // Terms
        var modalInstance;
        $scope.showTerms = function(){
            modalInstance = $modal.open({
              templateUrl: '/modules/core/views/terms.client.view.html',
            });
        };
        // make close available at all controllers
        $rootScope.closeTerms = function () {
            modalInstance.close();
        };

    }
]);

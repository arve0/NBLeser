'use strict';

angular.module('core').controller('HeaderController',
    function($scope, Menus, $anchorScroll, $location, $modal) {
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
        };

        $scope.goto = function(page){
            page = (page || $scope.controls.currentPage);
            console.log('going to ', page);
            if (!document.getElementById(page)) {
                modalInstance = $modal.open({
                    template: '<div class="alert alert-danger">Siden eksisterer ikke.</div>',
                });
            }
            $location.hash(page);
            $anchorScroll();
        };

        // Terms
        var modalInstance;
        $scope.showTerms = function(){
            modalInstance = $modal.open({
              templateUrl: '/modules/core/views/terms.client.view.html',
              scope: $scope,
            });
        };
        $scope.closeTerms = function () {
            modalInstance.close();
        };

    }
);

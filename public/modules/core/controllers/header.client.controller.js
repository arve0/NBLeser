'use strict';

angular.module('core').controller('HeaderController',
    function($scope, Menus, $anchorScroll, $location, $modal, ReaderControls) {
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
        };
        
        $scope.controls = ReaderControls;

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

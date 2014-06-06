'use strict';

angular.module('leser').controller('LeserController',
        function($scope, $rootScope, Tilemap, $document, $stateParams, $location, $window, ReaderControls) {

        $rootScope.error = ''; // reset error messages
        
        var urn = $stateParams.urn;

        $scope.controls = ReaderControls;
        $scope.controls.show = true;


        $scope.show = function(windowPosition, elementPosition){
            return Math.abs(windowPosition - elementPosition) < 5000;
        };

        var bookPromise = Tilemap.getPages(urn);
        bookPromise.then(function(pages){
            var i;
            $scope.pages = pages;
            $scope.controls.currentPage = $location.hash() || 1;
            $scope.controls.pages = pages.length;
            $scope.controls.firstRun = true;
            for (i=0;i<pages.getNumberOfLevels();i++){
                $scope.controls.levels.push(i);
            }
            $scope.pages.updateLevel($scope.controls.level);
            $scope.$watch('controls.level', function(level){
                $scope.pages.updateLevel(level);
            });
        }, function(error){
            $rootScope.error = error;
            $location.url('/');
        });

    }
);

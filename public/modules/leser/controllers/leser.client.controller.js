'use strict';

angular.module('leser').controller('LeserController',
        function($scope, $rootScope, Tilemap, $document, $stateParams, $location, $window, ReaderControls) {

        $rootScope.error = ''; // reset error messages
        
        var urn = $stateParams.urn;

        $scope.controls = ReaderControls;
        $scope.controls.show = true;

        $scope.scrollTop = 0; // initial position
        $document.on('scroll', function(){
            $scope.scrollTop = window.pageYOffset;
            $scope.$digest();
        });
        $document.on('touchstart', function(){
            $scope.scrollTop = window.pageYOffset;
            $scope.$digest();
        });


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

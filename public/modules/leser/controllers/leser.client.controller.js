'use strict';

angular.module('leser').controller('LeserController',
        function($scope, $rootScope, Tilemap, $document, $stateParams, $location, $window) {


        var urn = $stateParams.urn;

        $rootScope.controls = {};
        $rootScope.controls.show = true;
        $rootScope.controls.level = 5;
        $rootScope.controls.zoom = 100;
        $rootScope.controls.zoomValues = [];
        for (var z=10; z<=100; z+=10){
            $rootScope.controls.zoomValues.push({value: z, text: z + '%'});
        }

        $rootScope.$watch('controls.zoom', function(value){
            $scope.width = function(){
                return { 
                    width: value + '%',
                    height: ($window.innerHeight - 52) + 'px',
                    };
            };
        });
        angular.element($window).on('resize', function(){
            $scope.width = function(){
                return { 
                    width: $scope.controls.zoom + '%',
                    height: ($window.innerHeight - 52) + 'px',
                    };
            };
        });

        $scope.scrollTop = {};
        $scope.scrollTop.value = 0;

        $document.on('scroll', function(){
            $scope.scrollTop.value = (window.pageYOffset || this.scrollTop || 0)  - (this.clientTop || 0);
            $scope.$digest();
        });
        $document.on('touchstart', function(){
            $scope.scrollTop.value = (window.pageYOffset || this.scrollTop || 0)  - (this.clientTop || 0);
            $scope.$digest();
        });
        


        $scope.show = function(windowPosition, elementPosition){
            return Math.abs(windowPosition - elementPosition) < 5000;
        };

        var bookPromise = Tilemap.getPages(urn);
        bookPromise.then(function(pages){
            var i;
            $scope.pages = pages;
            $rootScope.controls.pages = [];
            for (i=1; i <= pages.length; i++){
                $rootScope.controls.pages.push(i);
            }
            $rootScope.controls.currentPage = 1;
            $rootScope.controls.levels = [];
            for (i=0;i<pages.getNumberOfLevels();i++){
                $rootScope.controls.levels.push(i);
            }
            $scope.pages.updateLevel($rootScope.controls.level);
            $rootScope.$watch('controls.level', function(level){
                $scope.pages.updateLevel(level);
            });
        }, function(error){
            $rootScope.error = error;
            $location.url('/');
        });

    }
);

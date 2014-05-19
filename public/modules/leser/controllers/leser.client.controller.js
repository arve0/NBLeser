'use strict';

angular.module('leser').controller('LeserController', ['$scope', '$rootScope', 'Tilemap', '$document', '$stateParams',
        function($scope, $rootScope, Tilemap, $document, $stateParams) {

        var urn = $stateParams.urn;
        var pagePromise = Tilemap.getPages(urn);

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
                    height: value + '%',
                    };
            };
        });

        $scope.scrollTop = {};
        $scope.scrollTop.value = 0;

        $document.on('scroll', function(){
            $scope.scrollTop.value = (window.pageYOffset || this.scrollTop || 0)  - (this.clientTop || 0);
            $scope.$digest();
        });


        $scope.show = function(windowPosition, elementPosition){
            return Math.abs(windowPosition - elementPosition) < 5000;
        };

        pagePromise.then(function(pages){
            $scope.pages = pages;
            $rootScope.controls.levels = [];
            for (var i=0;i<pages.getNumberOfLevels();i++){
                $rootScope.controls.levels.push(i);
            }
            $scope.pages.updateLevel($rootScope.controls.level);
            $rootScope.$watch('controls.level', function(level){
                $scope.pages.updateLevel(level);
            });
        });

    }
]);

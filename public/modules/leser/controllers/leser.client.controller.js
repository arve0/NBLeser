'use strict';

angular.module('leser').controller('LeserController', ['$scope', '$rootScope', 'Tilemap', '$document', '$stateParams',
        function($scope, $rootScope, Tilemap, $document, $stateParams) {
        // Controller Logic
        var urn = $stateParams.urn;
        var pagePromise = Tilemap.getPages(urn);

        $rootScope.$watch('zoom', function(value){
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
            $scope.pages.updateLevel($scope.level);
            $scope.$watch('level', function(level){
                $scope.pages.updateLevel(level);
            });
        });

    }
]);

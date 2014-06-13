'use strict';

angular.module('leser').controller('LeserController',
        function($scope, $rootScope, Tilemap, $document, $stateParams, $location, ReaderControls, $timeout, Search, $window) {

        $rootScope.error = ''; // reset error messages
        
        var urn = $stateParams.urn;

        // set title
        var searchPromise = Search.get('urn:"' + urn + '"');
        searchPromise.then(function(data){
            $window.document.title = data.entry[0].title.$t;
        });


        $scope.controls = ReaderControls;
        $scope.controls.show = true;

        $scope.scrollTop = 0; // initial position
        $document.on('scroll', function(){
            $scope.scrollTop = window.pageYOffset;
            if ($scope.pages) { // wait for data
                for (var i=0; i<$scope.pages.length; i++){
                    if ($scope.scrollTop < $scope.pages[i].offsetTop) {
                        // we are past page
                        $scope.controls.currentPage = $scope.controls.pageList[i-1];
                        break;
                    }
                }
            }
            $rootScope.$digest();
        });
        $document.on('touchstart', function(){
            $scope.scrollTop = window.pageYOffset;
            $scope.$digest();
        });


        var tilemapPromise = Tilemap.getPages(urn);
        tilemapPromise.then(function(pages){
            //console.log(pages);
            var i;
            $scope.pages = pages;
            $scope.controls.pages = pages.length;
            $scope.controls.firstRun = true;
            $scope.controls.levels = pages.getNumberOfLevels();
            $scope.pages.updateLevel($scope.controls.level);
            $scope.$watch('controls.level', function(level){
                $scope.pages.updateLevel(level);
            });
            $timeout(function(){
                var page = $location.hash().replace(/^p/, '');
                if (page) {
                    $scope.controls.currentPage = $scope.controls.pageList[page - 1];
                    $scope.controls.goto();
                }
            });
        }, function(error){
            $rootScope.error = error;
            $location.url('/');
        });

    }
);

'use strict';

angular.module('core').controller('HomeController',
function ($scope, $location, $rootScope, $http, Search, $modal, ReaderControls, $window) {
    // variables
    var modalInstance;
    ReaderControls.show = false; // hide controls in home view

    // sett tittel
    $window.document.title = 'NBLeser - Les over 170-tusen gratis ebøker fra Nasjonalbiblioteket';

    // check country
    if (! $rootScope.geoChecked) {
        $http.get('/geoip').success(function(geoip){
            if (geoip.error) {
                console.log(geoip.error);
            }
            if (geoip.country !== 'NO') {
                modalInstance = $modal.open({
                    templateUrl: '/modules/core/views/norwegian-modal.client.view.html',
                    scope: $scope,
                });
            }
            $rootScope.geoChecked = true;
        });
    }
    $scope.closeModal = function () {
        modalInstance.close();
    };
    
    // button actions
    $scope.search = function(query){
        $location.url('/search/' + query);
    };
    $scope.readFirstHit = function(query){
        $scope.error = false;
        var searchPromise = Search.get(query);
        searchPromise.then(function(data){
            var urn = data.entry[0]['nb:urn'].$t;
            $location.url('/leser/' + urn);
        },function(err){
            $scope.error = err;
        });
    };
    $scope.read = function(urn){
        $location.url('/leser/' + urn);
    };

});

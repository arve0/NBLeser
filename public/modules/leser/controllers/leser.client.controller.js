'use strict';

angular.module('leser').controller('LeserController', ['$scope', '$http', 'Tilemap', '$q',
        function($scope, $http, Tilemap, $q) {
        // Controller Logic 
        var urn = 'URN:NBN:no-nb_digibok_2009030404129';
        Tilemap.requestTiles(urn, 5);

    }
]);

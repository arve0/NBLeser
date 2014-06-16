'use strict';

//Setting up route
angular.module('leser').config(
    function($stateProvider) {
        // Leser state routing
        $stateProvider.
        state('leser', {
            url: '/leser/:urn',
            templateUrl: 'modules/leser/views/leser.client.view.html'
        });
    }
);

'use strict';

//Setting up route
angular.module('leser').config(['$stateProvider',
	function($stateProvider) {
		// Leser state routing
		$stateProvider.
		state('/leser', {
			url: '/leser',
			templateUrl: 'modules/leser/views/leser.client.view.html'
		});
	}
]);

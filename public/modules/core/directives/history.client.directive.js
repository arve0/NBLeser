'use strict';

angular.module('core').directive('history',
function($window) {
    return {
        link: function postLink(scope, element, attrs) {
            if (attrs.history === 'forward'){
                element.addClass('glyphicon glyphicon-chevron-right history');
                element.on('click', function() {
                    $window.history.forward();
                });
            } 
            else {
                element.addClass('glyphicon glyphicon-chevron-left history');
                element.on('click', function() {
                    $window.history.back();
                });
            } 
        }
    };
});

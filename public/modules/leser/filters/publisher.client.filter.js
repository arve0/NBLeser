'use strict';

angular.module('leser').filter('publisher', [
    function() {
        return function(input) {
            // Forlag directive logic 
            // forl. -> forlag
            input = input.replace('forl.', 'forlag');

            return input;
        };
    }
]);

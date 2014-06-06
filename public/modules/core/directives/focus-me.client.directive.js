'use strict';

angular.module('core').directive('focusMe',
function($timeout) {
    return {
    link: function (scope, element) {
        $timeout(function(){
            element[0].focus();
        }, 500);
    }
};
});

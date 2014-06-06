'use strict';

angular.module('leser').directive('bookWidth',
function() {


return {
    link: function postLink(scope, element, attrs) {
        // Book-width directive logic
        var width = scope.$eval(attrs.bookWidth);
        element.css('width', width + '%');

        scope.$watch(attrs.bookWidth, function updateWidth(value){
            width = value;
            element.css('width', width + '%');
        });
    }
};


});

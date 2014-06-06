'use strict';

angular.module('leser').directive('scaleImage',
function() {
return {
    link: function postLink(scope, element, attrs) {
        // use flexbox to scale images
        var scale;
        if (scope.$last) {
            scale = scope.page.currentLevel.lastColumnScale;
            element.css('-webkit-flex', scale);
        }
        else element.css('-webkit-flex', 1);
    }
};
});

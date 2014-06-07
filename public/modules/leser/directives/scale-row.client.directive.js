'use strict';

angular.module('leser').directive('scaleRow',
function() {
return {
    link: function postLink(scope, element, attrs) {
        // use flexbox to scale images
        var scale;
        if (scope.$last) {
            scale = scope.page.currentLevel.lastRowScale;
            element.css('-webkit-box-flex', scale);
            element.css('-moz-box-flex', scale);
            element.css('-ms-box-flex', scale);
            element.css('-webkit-flex', scale);
            element.css('-ms-flex', scale);
            element.css('flex', scale);
        }
        else element.css('-webkit-flex', 1);
    }
};
});

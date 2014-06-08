'use strict';

angular.module('leser').directive('scaleImage',
function() {
return {
    link: function postLink(scope, element, attrs) {
        // use flexbox to scale images
        var scale;
        if (scope.$last) {
            scale = scope.page.currentLevel.lastColumnScale;
            element.css('-webkit-box-flex', scale);
            element.css('-moz-box-flex', scale);
            element.css('-ms-box-flex', scale);
            element.css('box-flex', scale);
            element.css('-webkit-flex', scale);
            element.css('-ms-flex', scale);
            element.css('flex', scale);
        }
    }
};
});

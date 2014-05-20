'use strict';

angular.module('leser').directive('pageHeight',
    function($timeout) {
        return {
            link: function postLink(scope, element, attrs) {
                // set height of each page manual
                // such that div take up space, even if its not containing images
                function setHeight(){
                    if (scope.page.currentLevel) {
                        // only do stuff if we're in the right scope
                        var realWidth = element.prop('offsetWidth');
                        var sourceWidth = scope.page.currentLevel.width;
                        var zoom = realWidth / sourceWidth;
                        var height = Math.ceil(scope.page.currentLevel.height * zoom);
                        element.css('height', height + 'px');

                        // store offsetTop to the page json
                        scope.page.offsetTop = element.prop('offsetTop');
                    }
                }

                scope.$watch('controls.zoom', function(){
                    // let browser get time to resize images before height is set
                    $timeout(setHeight);
                });
            }
        };
    }
);

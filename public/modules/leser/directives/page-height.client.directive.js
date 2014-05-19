'use strict';

angular.module('leser').directive('pageHeight', ['$timeout',
    function($timeout) {
        return {
            link: function postLink(scope, element, attrs) {
                // set height of each page manual
                // such that div take up space, even if its not containing images
                function setHeight(){
                    var realWidth = element.prop('offsetWidth');
                    var sourceWidth = scope.page.currentLevel.width;
                    var zoom = realWidth / sourceWidth;
                    var height = Math.ceil(scope.page.currentLevel.height * zoom);
                    element.css('height', height + 'px');

                    // store offsetTop to the page json
                    scope.page.offsetTop = element.prop('offsetTop');
                }

                scope.$watch('zoom', function(){
                    // let browser get time to resize images before height is set
                    $timeout(setHeight);
                });
            }
        };
    }
]);

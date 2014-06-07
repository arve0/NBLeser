'use strict';

angular.module('leser').directive('pageHeight',
    function($timeout, $document, $window) {
        // internal variables
        var _position = 0;
        var _windowHeight = $window.innerHeight;
        var _windowWidth = $window.innerWidth;


        return {
            link: function postLink(scope, element, attrs) {
                // set height of each page manually
                // such that div take up space, even if its not containing images
                // and also, such that images scales
                function setHeight(){
                    if (scope.page.currentLevel) {
                        // only do stuff if we've got data
                        var realWidth = _windowWidth * scope.$eval(attrs.zoom)/100;
                        var sourceWidth = scope.page.currentLevel.width;
                        var scale = realWidth / sourceWidth;
                        var height = Math.ceil(scope.page.currentLevel.height * scale);
                        element.css('height', height + 'px');

                        // store offsetTop to the page json
                        scope.page.offsetTop = _position;
                        _position += height;
                        scope.page.offsetBottom = _position;
                    }
                }

                scope.$watch(attrs.zoom, function(){
                    if (scope.$index === 0) _position=0; // reset position
                    setHeight();
                });

                angular.element($window).on('resize', function(){
                    if (scope.$index === 0) _position=0; // reset position
                    _windowHeight = $window.innerHeight;
                    _windowWidth = $window.innerWidth;
                    setHeight();
                });
            }
        };
    }
);

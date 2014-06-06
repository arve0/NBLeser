'use strict';

angular.module('leser').directive('pageHeight',
    function($timeout, $document, $window) {
        // helper functions
        function showPage(element){
            var bounding = element[0].getBoundingClientRect();
            var buffer = 1000; // buffer in pixels
            var condition = (bounding.bottom >= -buffer && bounding.bottom <= ($window.innerHeight+buffer)) || // bottom in view
                            (bounding.top >= -buffer && bounding.top <= ($window.innerHeight+buffer)) ||       // top in view
                            (bounding.top < 0 && bounding.bottom > $window.innerHeight);        // special case: top over, bottom under view
            return condition;
        }

        return {
            link: function postLink(scope, element, attrs) {
                // set height of each page manually
                // such that div take up space, even if its not containing images
                // and also, such that images scales
                function setHeight(){
                    if (scope.page.currentLevel) {
                        // only do stuff if we're in the right scope
                        var realWidth = element.prop('offsetWidth');
                        var sourceWidth = scope.page.currentLevel.width;
                        var scale = realWidth / sourceWidth;
                        var height = Math.ceil(scope.page.currentLevel.height * scale);
                        element.css('height', height + 'px');

                        // store offsetTop to the page json
                        scope.page.offsetTop = element.prop('offsetTop');
                    }
                }

                // show page, if its in view
                var inProcess = false;
                if (scope.controls.firstRun && scope.$index <= 2) {
                    // show first pages, upon initiate
                    scope.page.show = true;
                    if (scope.$index === 2) {
                        scope.controls.firstRun = false;
                    }
                }
                $document.on('scroll', function(){
                    if (!inProcess){
                        inProcess = true;
                        $timeout(function(){
                            scope.page.show = showPage(element);
                            inProcess = false;
                        },100);
                    }
                });
                $document.on('touchstart', function(){
                    if (!inProcess){
                        inProcess = true;
                        $timeout(function(){
                            scope.page.show = showPage(element);
                            inProcess = false;
                        },100);
                    }

                });

                scope.$watch(attrs.zoom, function(){
                    // let browser get time to resize images before height is set
                    $timeout(setHeight);
                });
            }
        };
    }
);

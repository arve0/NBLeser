'use strict';

angular.module('leser').factory('ReaderControls',
function($location, $anchorScroll, $modal, ipCookie, $window, $rootScope, $timeout) {

    var _zoomValues = [];
    for (var i=10;i<101;i+=10){
        _zoomValues.push({value: i, text: i + '%'});
    }

    var _windowHeight = $window.innerHeight;
    var _pageList = [1];
    var _level = ipCookie('level');
    if (_level === undefined) {
        _level = 5;
    }

    var _controls = {
        pages: 1,
        pageList: _pageList,
        currentPage: _pageList[0],
        firstRun: true,
        level: _level,
        levels: 6,
        levelList: [0,1,2,3,4,5],
        show: false,
        zoomValues: _zoomValues,
        zoom: ipCookie('zoom') || 100,
        goto: function() {
            // goes to currentPage
            var id = 'p' + this.currentPage;
            if (!document.getElementById(id)) {
                var modalInstance = $modal.open({
                    template: '<div class="alert alert-danger">Finner ikke siden.</div>',
                });
            }
            else {
                $location.hash(id);
                $timeout($anchorScroll);
            }
        },
        showPage: function(windowPageYOffset, elementTopOffset, elementBottomOffset){
            if (Math.abs(windowPageYOffset - elementTopOffset) > 5000) return false; // short curcuit
            else {
                return Math.abs(windowPageYOffset - elementTopOffset) < _windowHeight    || // top in view
                       Math.abs(windowPageYOffset - elementBottomOffset) < _windowHeight || // bottom in view
                       ( (elementTopOffset - windowPageYOffset) < 0 &&                      // special case, top over view
                         (windowPageYOffset + _windowHeight - elementBottomOffset) < 0 );   // AND bottom under view
            }
        },
    };


    // update cookie when quality level updates
    $rootScope.$watch(function(){
        return _controls.level;
    }, function(newValue, oldValue){
        ipCookie('level', newValue, {expires: 365});
    });

    // update cookie when zoom updates
    $rootScope.$watch(function(){
        return _controls.zoom;
    }, function(newValue, oldValue){
        ipCookie('zoom', newValue, {expires: 365});
    });

    // update pageList when pages updates
    $rootScope.$watch(function(){
        return _controls.pages;
    }, function(pages, oldValue){
        if (pages !== oldValue){
            _pageList = [];
            for (var i=1; i <= pages; i++){
                _pageList.push(i);
            }
            _controls.pageList = _pageList;
            _controls.currentPage = _pageList[0];
        }
    });

    // update levelList when levels updates
    $rootScope.$watch(function(){
        return _controls.levels;
    }, function(levels, oldValue){
        if (levels !== oldValue){
            _controls.levelList = [];
            for (var i=0; i < levels; i++){
                _controls.levelList.push(i);
            }
            if ((levels-1) < _controls.level) _controls.level = levels-1;
        }
    });
    

    // Public API
    return _controls;
});

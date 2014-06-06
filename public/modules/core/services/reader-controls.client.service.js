'use strict';

angular.module('core').factory('ReaderControls',
function($location, $anchorScroll, $modal, ipCookie, $window, $rootScope) {

    var _zoomValues = [];
    for (var i=10;i<101;i+=10){
        _zoomValues.push({value: i, text: i + '%'});
    }

    var _controls = {
        currentPage: 1,
        pages: 1,
        pageList: [],
        firstRun: true,
        levels: [],
        show: false,
        level: 5,
        zoomValues: _zoomValues,
        zoom: ipCookie('zoom') || 100,
        goto: function() {
            // goes to currentPage
            var id = 'p' + this.currentPage;
            console.log(id);
            if (!document.getElementById(id)) {
                var modalInstance = $modal.open({
                    template: '<div class="alert alert-danger">Finner ikke siden.</div>',
                });
            }
            else {
                $location.hash(id);
                $anchorScroll();
            }
        },
    };


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
            _controls.pageList = [];
            for (var i=1; i <= pages; i++){
                _controls.pageList.push(i);
            }
        }
    });

    // Public API
    return _controls;
});

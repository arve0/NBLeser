'use strict';

angular.module('leser').factory('BookInfo',
function($http, $modal, $rootScope) {
    // Object to return
    var _bookInfo = {
        data: {},
        show: false,
    };

    function _getWorldcatMetadata(isbn){
        // enhance metadata
        _bookInfo.metadata = {};
        $http.get('/metadata/' + isbn).success(function(data){
            if (data.stat === 'ok'){
                //console.log(data);
                _bookInfo.metadata = data;
                var metadata = data.list[0];
                // override metadata
                if (metadata.publisher) _bookInfo.publisher = metadata.publisher;
                if (metadata.ed) _bookInfo.edition = metadata.ed;
                if (metadata.city) _bookInfo.city = metadata.city;
            }
        }).error(function(err){
            console.log(err);
        });
        
    }

    // initialize function
    function _get(id){
        _bookInfo.data = {};
        $http.get('/bookinfo/' + id).success(function(data){
            //console.log(data);
            _bookInfo.data = data.mods;
            // map useful data to shorter names
            _bookInfo.extent = _bookInfo.data.physicalDescription.extent;
            _bookInfo.publisher = _bookInfo.data.originInfo.publisher;
            _bookInfo.title = _bookInfo.data.titleInfo.title;
            // Issued
            if (Array.isArray(_bookInfo.data.originInfo.dateIssued)){
                _bookInfo.issued = _bookInfo.data.originInfo.dateIssued[1].$t;
            }
            else _bookInfo.issued = _bookInfo.data.originInfo.dateIssued;
            // ISBN
            if (_bookInfo.data.identifier[0].type === 'isbn'){
                _bookInfo.isbn = _bookInfo.data.identifier[0].$t;
                var isbn = Number(_bookInfo.isbn.split(' ')[0]);
                if (typeof isbn === 'number') {
                    _getWorldcatMetadata(isbn);
                }
            }
            // Author(s)
            if (Array.isArray(_bookInfo.data.note)){
                _bookInfo.authors = _bookInfo.data.note[0].$t;
            }
            else _bookInfo.author = _bookInfo.data.note.$t; //store to two different names, detect which is present in view


        }).error(function(err){
            console.log(err);
        });
    }
    _bookInfo.get = _get;

    
    // modal
    $rootScope.$watch(function(){
        return _bookInfo.show;
    }, function (newValue, oldValue){
        if (newValue === true) {
            var modalInstance = $modal.open({
                templateUrl: '/modules/leser/views/book-info-modal.view.html',
                controller: 'BookInfoController',
            });
            modalInstance.result.then(function(){
                // closed
                _bookInfo.show = false;
            }, function(){
                // dismissed
                _bookInfo.show = false;
            });
        }
    });

    // Public API
    return _bookInfo;

});

angular.module('leser').controller('BookInfoController', function($scope, BookInfo, $stateParams){
    $scope.bookInfo = BookInfo;
});


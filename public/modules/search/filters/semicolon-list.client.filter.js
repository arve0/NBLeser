'use strict';

angular.module('search').filter('semicolonList',
function() {
    function unique(value, index, self) { 
        return self.indexOf(value) === index;
    }
    function capitalize(value, index, self) {
        return value.toLowerCase().charAt(0).toUpperCase() + value.slice(1);
    }

    return function(input) {
        var list = input.split('; ');
        list = list.map(capitalize).sort();
        list = list.filter(unique);
        var listHtml = '';
        for (var i=0; i<list.length; i++){
            listHtml += list[i] + ', ';
        }
        listHtml = listHtml.slice(0, -2) + '.';
        return listHtml;
    };
});

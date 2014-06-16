'use strict';

angular.module('core').factory('Search',
function($http, $q) {
    var currentData;
    var deferred;

    function refine(data) {
        var coverUrlTemplate = 'http://www.nb.no/services/image/resolver?url_ver=geneza&maxLevel=5&level=1&col=0&row=0&resX=1649&resY=2655&tileWidth=1024&tileHeight=1024&urn='; 
        if (Array.isArray(data.entry) !== true){
            data.entry = [data.entry];
        }
        for (var i=0; i < data.entry.length; i++){
            var entry = data.entry[i];
            // get sesamid from link[0]
            entry.sesamid = entry.link[0].href.replace(/^http:\/\/[a-z.]*(\/[a-z0-9]+){4}\//i, '');
            if (typeof entry['nb:urn'] === 'undefined' || typeof entry['nb:digital'] === 'undefined' ||
                    entry['nb:digital'].$t === 'false') {
                var removed = data.entry.splice(i,1);
                console.log('error with data, removing i:', i, removed);
                continue;
            }
            var urn = entry['nb:urn'].$t;
            entry.cover = coverUrlTemplate + urn + '_C1';
            if (urn.search('; ') !== -1){
                // found several urns - fix
                var splitted = urn.split('; ');
                entry['nb:urn'].$t = splitted[splitted.length -1];
            }
        }
        return data;
    }

    function get(query, index, limit) {
        currentData = []; // reset upon new search
        deferred = $q.defer();

        // advanced search
        query = query.replace(/(forfatter|f)[:=]/i, 'namecreators:');
        query = query.replace(/(år|å)[:=]/i, 'year:');
        query = query.replace(/(isbn|i)[:=]/i, 'isbn:');
        query = query.replace(/(beskrivelse|b)[:=]/i, 'description:');

        // free text search
        var ftRegex = /(fritekst|ft)[:=](ja|j)/i;
        if (query.search(ftRegex) !== -1){
            query = query.replace(ftRegex, '');
            query += '&ft=1';
        }
        // t: after ft:
        query = query.replace(/(tittel|titel|titell|t)[:]/i, 'title:');
        
        // remove malformed search
        query = query.replace(/[:=&/]$/i, '');

        // append parameters
        index = (index || 1);
        limit = (limit || 50);
        query += '&index=' + index;
        query += '&items=' + limit;

        $http.get('/search?q=' + query).success(function(data){
            //console.log(data);
            /* object format:
            ns2:itemsPerPage
            ns2:startIndex
            ns2:totalResults
            link[].href - urls: [0] this, [1] next, [2] spec
            entry[] - hits
                .link[] - [0] book info, [2] urn url, [3] image structure
                .nb:date.$t
                .nb:isbn.$t
                .nb:languages.$t - format "mul; eng; nob"
                .nb:mainentry.$t  - author
                .nb:namecreator.$t - author
                .nb:namecreators.$t - authors
                .nb:subjecttopic.$t - topic
                .nb:urn.$t
                .nb:year.$t
                .summary.$t - format [redaktører/editors: Nevanka Dobljekar, ...;
                                         tekst/text: Arve Hovig, ...;
                                         oversettelse/translation: Marith Hope, ...;
                                         fotografi/photography: Halvard Haugerud] Parallell norsk og engelsk tekst Utstillingskatalog
                .title.$t
            nb:snippet.$t extract of free text search
            */
            
            data = data.feed;
            if (data.entry) {
                data = refine(data);
                currentData = data;
                deferred.resolve(data);
            }
            else {
                deferred.reject('Ingen treff.');
            }

        }).error(function(err, stat){
            deferred.reject('En feil oppstod. Har du avsluttet alle anførselstegn?');
        });

        return deferred.promise;
    }

    return {
        get: get,
    };

});

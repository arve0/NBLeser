'use strict';

var http = require('http');

/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('index');
};

exports.tilemap = function(req,res) {
    var _url = 'http://www.nb.no/services/tilesv2/tilemap?viewer=html&pagetype=&format=json&callback=JSONP&URN=' + req.params.urn;
    http.get(_url,function(response){
        var data = '';
        response.on('data', function(chunk){
            data += chunk;
        });
        response.on('end', function(){
            res.send(data);
        });
    });
};

var parseString = require('xml2js').parseString;

exports.search = function(req, res) {
/*
currentHit:-1
currentSesamid:
page:0
searchString:arve
excludeSearch:
phraseSearch:
searchTitle:
customDateFrom:
customDateTo:
format:Digitalt tilgjengelig
action:advanced_search
advancedMediatypeList:bøker
_eventId_search:Søk
*/
/*    var query = {
        q = req.query.q + ' (contentClasses:"public")';

    } */
    var query = req.query.q + ' contentClasses:bokhylla'; //' digital:"true"'; //'&filter=digital:true';
    var getIndex = (req.query.index || 10);
    var getItems = (req.query.items || 10);
    var url = 'http://www.nb.no/services/search/v2/search?&itemsPerPage=' + getItems + '&q=' + query;
    http.get(url,function(response){
        var xml = '';
        response.on('data', function(chunk){
            xml += chunk;
        });
        response.on('end', function(){
            parseString(xml, function (err, json) {
                res.send(json);
            });
        });
    });
};

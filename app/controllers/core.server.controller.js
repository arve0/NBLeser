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

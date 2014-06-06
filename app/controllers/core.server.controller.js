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

var parse = require('xml2json');

exports.search = function(req, res) {
    /* get xml from nasjonalbiblioteket and convert to json
    Url: http://www.nb.no/services/search/v2/search
    Parameters:
        q={searchTerms}
            - field:value
            - examples
                * namecreators:arve (writers named arve)
                * contentClasses:bokhylla (digital available)
                * year:1998
            - field/advanced search is a part of the query (parsed at client, search.client.service.js)
        startIndex={startIndex?}
        itemsPerPage={count?}
        facet={nb:facetOn?} - return only specified fields
        fq={nb:facetQuery?}
        filter={nb:filterQuery?}
        sort={nb:sort?}
        qp={nb:qp?}
        ft={nb:ft?} - full text
        da={nb:da?}
    */

    var query = 'http://www.nb.no/services/search/v2/search?q=contentClasses:bokhylla ';
    query += req.query.q;
    query += '&Index=' + (req.query.index || 1);
    query += '&itemsPerPage=' + (req.query.items || 10);
    query += '&sort=date:desc';
    query += (req.query.ft === '1' ? '&ft=true':'');

    //console.log('getting xml', query);
    http.get(query, function(response){
        var xml = '';
        response.on('data', function(chunk){
            xml += chunk;
        });
        response.on('end', function(){
            var json, error;
            try {
                json = parse.toJson(xml, {coerce: false, sanitize: false});
            }
            catch (e) {
                error = e;
            }
            finally {
                if (error) res.send({}, 500);
                else res.send(json);
            }
        });
    });
};

/* GeoIP lite country */
var geoip = require('geoip-lite-country');

exports.geoip = function(req, res) {
    var geo = geoip.lookup(req.ip);
    if (geo === null) {
        res.send({ error: req.ip + ' not found in geoip database.' });
    }
    else {
        geo.ip = req.ip;
        res.send(geo);
    }
};

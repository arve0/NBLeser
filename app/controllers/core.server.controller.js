'use strict';

var http = require('http');
var parse = require('xml2json');

/**
 * Internal helper functions
 */
function _getXMLSendJSON(query, callback){
    // gets xml and returns json to callback(json, err)
    http.get(query, function(response){
        var xml = '';
        response.on('data', function(chunk){
            xml += chunk;
        });
        response.on('end', function(){
            if (xml === '') {
                callback({}, { message: 'Mottok ingen data fra ' + query });
                return;
            }
            var json, error;
            try {
                json = parse.toJson(xml, {coerce: false, sanitize: false});
            }
            catch (e) {
                error = e;
            }
            finally {
                if (error) callback({}, error);
                else callback(json);
            }
        });
    });
}
 



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
    _getXMLSendJSON(query, function(json, err){
        if (err) res.send(err, 500);
        else res.send(json);
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

/* metadata for books */
exports.metadata = function(req, res) {
    var query = 'http://xisbn.worldcat.org/webservices/xid/isbn/';
    query += req.params.isbn;
    query += '?method=getMetadata&format=json&fl=*&count=1';

    http.get(query, function(response){
        var json = '';
        response.on('data', function(chunk){
            json += chunk;
        });
        response.on('end', function(){
            res.send(json);
        });
    });
    
};

/* book info */
exports.bookinfo = function(req, res) {
    var sesamid = req.params.id;
    var query = 'http://www.nb.no/services/search/v2/mods/' + sesamid;

    _getXMLSendJSON(query, function(json, err){
        if (err) res.send(err, 500);
        else if (json === {}) res.send({error: 'Ingen treff.'}, 404);
        else res.send(json);
    });
};

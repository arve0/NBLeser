'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../app/controllers/core');
	app.route('/').get(core.index);
	app.route('/tilemap/:urn').get(core.tilemap);
	app.route('/metadata/:isbn').get(core.metadata);
	app.route('/search').get(core.search);
	app.route('/geoip').get(core.geoip);
};

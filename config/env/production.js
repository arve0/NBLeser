'use strict';

module.exports = {
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.min.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
				'public/lib/github-fork-ribbon-css/gh-fork-ribbon.css',
                                'public/lib/angular-spinner-loading/src/loading-bar.css',
			],
			js: [
				'public/lib/angular/angular.min.js',
				'public/lib/angular-resource/angular-resource.min.js',
				'public/lib/angular-cookie/angular-cookie.min.js',
				'public/lib/angular-animate/angular-animate.min.js',
				'public/lib/angular-touch/angular-touch.min.js',
				'public/lib/angular-sanitize/angular-sanitize.min.js',
				'public/lib/angular-ui-router/release/angular-ui-router.min.js',
				'public/lib/angular-ui-utils/ui-utils.min.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
                                'public/lib/angular-spinner-loading/src/loading-bar.js',
			]
		},
		css: 'public/dist/application.min.css',
		js: 'public/dist/application.min.js'
	},
};

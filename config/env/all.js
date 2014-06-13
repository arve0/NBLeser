'use strict';

module.exports = {
	app: {
		title: 'NBLeser',
		description: 'Stream over 170-tusen norske ebøker fra Nasjonalbiblioteket gratis! Fungerer bra på iPad og Android nettbrett.',
		keywords: 'gratis, ebok, ebøker, norske ebøker, norsk ebok, stream, nasjonalbiblioteket, ipad, android, nettbrett, app, webapp, bokhylla.no, html5 leser'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
				'public/lib/github-fork-ribbon-css/gh-fork-ribbon.css',
                                'public/lib/angular-spinner-loading/src/loading-bar.css'
			],
			js: [
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-cookie/angular-cookie.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-touch/angular-touch.js',
				'public/lib/angular-sanitize/angular-sanitize.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                                'public/lib/angular-spinner-loading/src/loading-bar.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};

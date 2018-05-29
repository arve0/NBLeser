angular.module('core', []);

// Setting up route
angular.module('core').config(
    function($stateProvider, $urlRouterProvider) {
        // Redirect to home view when route not found
        $urlRouterProvider.otherwise('/');

        // Home state routing
        $stateProvider.
        state('home', {
            url: '/',
            templateUrl: 'views/home.html'
        });
    }
);


angular.module('core').controller('HeaderController',
    function($scope, Menus, $anchorScroll, $location, $modal, ReaderControls, BookInfo) {
        $scope.bookInfo = BookInfo;
        $scope.showSettings = false;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');

        $scope.toggleCollapsibleMenu = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
        };

        $scope.controls = ReaderControls;

        // Terms
        var modalInstance;
        $scope.showTerms = function(){
            modalInstance = $modal.open({
              templateUrl: 'views/terms.html',
              scope: $scope,
            });
        };
        $scope.closeTerms = function () {
            modalInstance.close();
        };

    }
);


angular.module('core').controller('HomeController',
function ($scope, $location, $rootScope, $http, Search, $modal, ReaderControls, $window) {
    // variables
    ReaderControls.show = false; // hide controls in home view

    // sett tittel
    $window.document.title = 'NBLeser - Les over 170-tusen ebøker gratis fra Nasjonalbiblioteket';

    // button actions
    $scope.search = function(query){
        $location.url('/search/' + query);
    };
    $scope.readFirstHit = function(query){
        $scope.error = false;
        var searchPromise = Search.get(query);
        searchPromise.then(function(data){
            $location.url('/leser/' + data[0].urn);
        },function(err){
            $scope.error = err;
        });
    };
    $scope.read = function(urn){
        $location.url('/leser/' + urn);
    };

});


angular.module('core').directive('focusMe',
function($timeout) {
    return {
    link: function (scope, element) {
        $timeout(function(){
            element[0].focus();
        }, 500);
    }
};
});


angular.module('core').directive('history',
function($window) {
    return {
        link: function postLink(scope, element, attrs) {
            if (attrs.history === 'forward'){
                element.addClass('glyphicon glyphicon-chevron-right history');
                element.on('click', function() {
                    $window.history.forward();
                });
            }
            else {
                element.addClass('glyphicon glyphicon-chevron-left history');
                element.on('click', function() {
                    $window.history.back();
                });
            }
        }
    };
});


//Menu service used for managing  menus
angular.module('core').service('Menus',
	function() {
		// Define the menus object
		this.menus = {};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId) {
			// Create the new menu
			this.menus[menuId] = {
				items: [],
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemUIRoute) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
);

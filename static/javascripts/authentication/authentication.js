angular.module('app')
.controller( 'LoginController', ['$location', '$scope', 'Authentication', function($location, $scope, Authentication) {
	//var vm = this;

    //vm.login = login;

    

    /**
    * @name activate
    * @desc Actions to be performed when this controller is instantiated
    * @memberOf app.authentication.controllers.LoginController
    */
    $scope.activate = function() {
      // If the user is authenticated, they should not be here.
      if (Authentication.isAuthenticated()) {
        $location.url('/');
      }
    }

    /**
    * @name login
    * @desc Log the user in
    * @memberOf app.authentication.controllers.LoginController
    */
    // function login() {
    //   Authentication.login(vm.username, vm.password);
    // }
    $scope.login = function() {
        Authentication.login($scope.vm.username, $scope.vm.password);
    }

    $scope.activate();
}])

.controller('RegisterController', [ '$location', '$scope', 'Authentication', function($location, $scope, Authentication) {
	var vm = this;

    vm.register = register;

    $scope.activate();

    /**
     * @name activate
     * @desc Actions to be performed when this controller is instantiated
     * @memberOf app.authentication.controllers.RegisterController
     */
    $scope.activate = function() {
      // If the user is authenticated, they should not be here.
      if (Authentication.isAuthenticated()) {
        $location.url('/');
      }
    }

    /**
     * @name register
     * @desc Register a new user
     * @memberOf app.authentication.controllers.RegisterController
     */
    $scope.register = function() {
      Authentication.register($scope.vm.email, $scope.vm.password, $scope.vm.username);
    }
}])
.factory('Authentication',['$scope','$cookies', '$http', '$state' ,function($scope,$cookies, $http, $state) {
	
	// csrf settings for the $http resource
	$http.defaults.xsrfHeaderName = 'X-CSRFToken';
  $http.defaults.xsrfCookieName = 'csrftoken';
  $http.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
	var Authentication = {
      getAuthenticatedAccount: $scope.getAuthenticatedAccount,
      isAuthenticated: $scope.isAuthenticated,
      login: $scope.login,
      logout: $scope.logout,
      register: $scope.register,
      setAuthenticatedAccount: $scope.setAuthenticatedAccount,
      unauthenticate: $scope.unauthenticate
    };

    return Authentication;

    ///////////////////

    /**
     * @name getAuthenticatedAccount
     * @desc Return the currently authenticated account
     * @returns {object|undefined} Account if authenticated, else `undefined`
     * @memberOf app.authentication.services.Authentication
     */
    $scope.getAuthenticatedAccount = function() {
      if (!$cookies.authenticatedAccount) {
        return;
      }

      return JSON.parse($cookies.authenticatedAccount);
    }


    /**
     * @name isAuthenticated
     * @desc Check if the current user is authenticated
     * @returns {boolean} True is user is authenticated, else false.
     * @memberOf app.authentication.services.Authentication
     */
    $scope.isAuthenticated = function() {
      return !!$cookies.authenticatedAccount;
    }


    /**
     * @name login
     * @desc Try to log in with email `email` and password `password`
     * @param {string} email The email entered by the user
     * @param {string} password The password entered by the user
     * @returns {Promise}
     * @memberOf app.authentication.services.Authentication
     */
    $scope.login = function(username, password) {
      //console.log("In There");
      
      // $http({
      //   method: 'POST',
      //   url: '/api/v1/user/login/',
      //   headers: {'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
      //   data: { username: username, password: password},
      // }).success(function(data, status, headers, config) {
      //   //console.log("Created new author " + data.name);
      //   window.location.href = "/authors";
      // }).error(function(response, status) {
      //   console.log("Failed to create new author " + status + ' ' + response);
      // });
	     // console.log(username, password)
      return $http.post('/api/v1/user/login/', {
        username: username, password: password
      }).then(loginSuccessFn, loginErrorFn);

      /**
       * @name loginSuccessFn
       * @desc Set the authenticated account and redirect to index
       */
      function loginSuccessFn(data, status, headers, config) {
        console.log("Data is",data);
        Authentication.setAuthenticatedAccount(data.data);

        window.location = '/';
      }

      /**
       * @name loginErrorFn
       * @desc Log "Epic failure!" to the console
       */
      function loginErrorFn(data, status, headers, config) {
        console.error('Epic failure!');
      }
    }


    /**
     * @name logout
     * @desc Try to log the user out
     * @returns {Promise}
     * @memberOf app.authentication.services.Authentication
     */
    $scope.logout = function() {
      return $http.post('/api/v1/user/logout/')
        .then(logoutSuccessFn, logoutErrorFn);

      /**
       * @name logoutSuccessFn
       * @desc Unauthenticate and redirect to index with page reload
       */
      function logoutSuccessFn(data, status, headers, config) {
        Authentication.unauthenticate();

        $state.go('home');
      }

      /**
       * @name logoutErrorFn
       * @desc Log "Epic failure!" to the console
       */
      function logoutErrorFn(data, status, headers, config) {
        console.error('Epic failure!');
      }
    }


    /**
    * @name register
    * @desc Try to register a new user
    * @param {string} email The email entered by the user
    * @param {string} password The password entered by the user
    * @param {string} username The username entered by the user
    * @returns {Promise}
    * @memberOf app.authentication.services.Authentication
    */
    $scope.register = function(email, password, username) {
      return $http.post('/api/v1/user/register/', {
        username: username,
        password: password,
        email: email
      }).then(registerSuccessFn, registerErrorFn);

      /**
      * @name registerSuccessFn
      * @desc Log the new user in
      */
      function registerSuccessFn(data, status, headers, config) {
        Authentication.login(email, password);
      }

      /**
      * @name registerErrorFn
      * @desc Log "Epic failure!" to the console
      */
      function registerErrorFn(data, status, headers, config) {
        console.error('Epic failure!');
      }
    }


    /**
     * @name setAuthenticatedUser
     * @desc Stringify the account object and store it in a cookie
     * @param {Object} account The acount object to be stored
     * @returns {undefined}
     * @memberOf app.authentication.services.Authentication
     */
    $scope.setAuthenticatedAccount = function(account) {
      $cookies.authenticatedAccount = JSON.stringify(account);
    }


    /**
     * @name unauthenticate
     * @desc Delete the cookie where the account object is stored
     * @returns {undefined}
     * @memberOf app.authentication.services.Authentication
     */
    $scope.unauthenticate = function() {
      delete $cookies.authenticatedAccount;
    }
}]);
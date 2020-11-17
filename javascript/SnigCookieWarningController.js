(function() {
  goog.provide('snig_cookie_warning_controller');

  goog.require('gn_search_snig_config');
  
  var module = angular.module('snig_cookie_warning_controller', ['ngCookies', 'gn_search_snig_config']);
  
  module.controller('SnigCookieWarningController', [
    '$scope','$cookies', '$rootScope', 'gnSearchSettings',
    function($scope, $cookies, $rootScope, searchSettings) {
      if (searchSettings.cookieConsent) {
    	  $rootScope.showCookieWarning = 
    		  $cookies.get(searchSettings.cookieConsent.name) ? false : true;
      } else {
          $rootScope.showCookieWarning =
              window.localStorage.getItem('cookiesAccepted') !== 'true';    	  
      }
      $rootScope.close = function($event) {
        $rootScope.showCookieWarning = false;
        if (searchSettings.cookieConsent) {
        	var expireDate = new Date;
        	expireDate.setDate(expireDate.getDate() + 60);        	
        	$cookies.put(searchSettings.cookieConsent.name, searchSettings.cookieConsent.value, {'path': searchSettings.cookieConsent.path, 'expires': expireDate});
        	angular.element('.snig-cookie-warning').hide();
        } else {
        	window.localStorage.setItem('cookiesAccepted', true);
        	angular.element('.cookie-warning').hide();
        }
      };

      $rootScope.goAway = function($event) {
        angular.forEach($cookies, function(cookie, key) {
          if (key.indexOf('NAV-') > -1) {
            $window.sessionStorage.setItem(key, cookie);
            delete $cookies[key];
          }
        });
        window.history.back();
      };
    }]);

})();
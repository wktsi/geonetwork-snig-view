(function() {
  goog.provide('snig_cookie_warning_directive');

  var module = angular.module('snig_cookie_warning_directive', []);

  module
      .directive(
          'snigcookiewarning',
          function() {
            return {
              restrict: 'AE',
              replace: true,
              templateUrl:
              '../../catalog/views/snig/directives/partials/cookieWarning.html'
            };
          });

})();
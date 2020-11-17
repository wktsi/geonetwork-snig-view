(function() {
  goog.provide('snig_cookie_warning');

  goog.require('snig_cookie_warning_controller');
  goog.require('snig_cookie_warning_directive');

  var module = angular.module('snig_cookie_warning', ['snig_cookie_warning_controller',
    'snig_cookie_warning_directive']);
})();

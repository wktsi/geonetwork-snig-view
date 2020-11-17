(function () {
  goog.provide('snig_search_home_controller');

  var module = angular.module('snig_search_home_controller', []);

  module.controller('SnigSearchHomeController', ['$scope', '$location', '$log',
    function ($scope, $location, $log) {

      $scope.resetHomeParams = function () {
        $scope.searchHomeParams = {
          anysnig: null,
          geometry: null,
          fast: 'index'
        };
      };


      $scope.performSearchHome = function () {
        var searchParams = angular.extend({}, $scope.searchHomeParams)
        if (!$scope.searchHomeParams.geometry) {
          delete searchParams.geometry;
        }

        $location.path('/search').search(searchParams);

      };


      $scope.$on('$locationChangeSuccess', function (event, newUrl) {
        var activeTab = $location.path().match(/^(\/[a-zA-Z0-9]*)($|\/.*)/)[1];
        // reset search paramameters
        if (activeTab === '/home') {
          $scope.resetHomeParams();
        }
      });

      // Init search params
      $scope.resetHomeParams();
    }]);


})();

/*
 * Copyright (C) 2001-2016 Food and Agriculture Organization of the
 * United Nations (FAO-UN), United Nations World Food Programme (WFP)
 * and United Nations Environment Programme (UNEP)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
 *
 * Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
 * Rome - Italy. email: geonetwork@osgeo.org
 */

(function() {

  goog.provide('gn_search_snig_directive');
  goog.require('gn_utility_service');

  var module = angular.module('gn_search_snig_directive', ['gn_utility_service']);
  
  module.directive('gnInfoList', ['gnMdView',
    function(gnMdView) {
      return {
        restrict: 'A',
        replace: true,
        templateUrl: '../../catalog/views/snig/directives/' +
            'partials/infolist.html',
        link: function linkFn(scope, element, attr) {
          scope.showMore = function(isDisplay) {
            var div = $('#gn-info-list' + this.md.getUuid());
            $(div.children()[isDisplay ? 0 : 1]).addClass('hidden');
            $(div.children()[isDisplay ? 1 : 0]).removeClass('hidden');
          };
          scope.go = function(uuid) {
            gnMdView(index, md, records);
            gnMdView.setLocationUuid(uuid);
          };
        }
      };
    }
  ]);

  module.directive('gnAttributeTableRenderer', ['gnMdView',
    function(gnMdView) {
      return {
        restrict: 'A',
        replace: true,
        templateUrl: '../../catalog/views/snig/directives/' +
        'partials/attributetable.html',
        scope: {
          attributeTable: '=gnAttributeTableRenderer'
        },
        link: function linkFn(scope, element, attrs) {
          if (angular.isDefined(scope.attributeTable) &&
            !angular.isArray(scope.attributeTable)) {
            scope.attributeTable = [scope.attributeTable];
          }
          scope.showCodeColumn = false;
          angular.forEach(scope.attributeTable, function(elem) {
            if(elem.code > '') {
              scope.showCodeColumn = true;
            }
          });
        }
      };
    }
  ]);

  module.directive('gnLinksBtn', [ 'gnTplResultlistLinksbtn',
    function(gnTplResultlistLinksbtn) {
      return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: gnTplResultlistLinksbtn
      };
    }
  ]);
  
  module.directive('snigServicesBtn', [ 'snigTplResultlistServicesLinksbtn',
	    function(snigTplResultlistServicesLinksbtn) {
	      return {
	        restrict: 'E',
	        replace: true,
	        scope: true,
	        templateUrl: snigTplResultlistServicesLinksbtn
	      };
	    }
	  ]);  

  module.directive('gnMdActionsMenu', ['gnMetadataActions',
    function(gnMetadataActions) {
      return {
        restrict: 'A',
        replace: true,
        templateUrl: '../../catalog/views/snig/directives/' +
            'partials/mdactionmenu.html',
        link: function linkFn(scope, element, attrs) {
          scope.mdService = gnMetadataActions;
          scope.md = scope.$eval(attrs.gnMdActionsMenu);
          
          scope.$watch(attrs.gnMdActionsMenu, function(a) {
            scope.md = a;
          });

          scope.getScope = function() {
            return scope;
          }
        }
      };
    }
  ]);

  module.directive('gnPeriodChooser', [
    function() {
      return {
        restrict: 'A',
        replace: true,
        templateUrl: '../../catalog/views/snig/directives/' +
            'partials/periodchooser.html',
        scope: {
          label: '@gnPeriodChooser',
          dateFrom: '=',
          dateTo: '='
        },
        link: function linkFn(scope, element, attr) {
          var today = moment();
          scope.format = 'YYYY-MM-DD';
          scope.options = ['today', 'yesterday', 'thisWeek', 'thisMonth',
            'last3Months', 'last6Months', 'thisYear'];
          scope.setPeriod = function(option) {
            if (option === 'today') {
              var date = today.format(scope.format);
              scope.dateFrom = date;
            } else if (option === 'yesterday') {
              var date = today.clone().subtract(1, 'day')
                .format(scope.format);
              scope.dateFrom = date;
              scope.dateTo = today.format(scope.format);
              return;
            } else if (option === 'thisWeek') {
              scope.dateFrom = today.clone().startOf('week')
                .format(scope.format);
            } else if (option === 'thisMonth') {
              scope.dateFrom = today.clone().startOf('month')
                .format(scope.format);
            } else if (option === 'last3Months') {
              scope.dateFrom = today.clone().startOf('month').
                  subtract(3, 'month').format(scope.format);
            } else if (option === 'last6Months') {
              scope.dateFrom = today.clone().startOf('month').
                  subtract(6, 'month').format(scope.format);
            } else if (option === 'thisYear') {
              scope.dateFrom = today.clone().startOf('year')
                .format(scope.format);
            }
            scope.dateTo = today.add(1, 'day').format(scope.format);
          };
        }
      };
    }
  ]);
  
  /**
   * Panel to manage user saved selection content
   */
  module.directive('gnSnigSavedSelectionsPanel', [
    '$translate', 'gnLangs', 'gnSavedSelectionConfig',
    function($translate, gnLangs, gnSavedSelectionConfig) {
      function link(scope, element, attrs, controller) {
        scope.lang = gnLangs.current;
        scope.selections = null;
        scope.actions = gnSavedSelectionConfig.actions;

        scope.$watch('user', function(n, o) {
          if (n !== o || scope.selections === null) {
            scope.selections = null;
            controller.getSelections(scope.user).then(function(selections) {
              scope.selections = selections;
            });
          }
        });

        scope.remove = function(selection, uuid) {
          controller.remove(selection, scope.user, uuid);
        };

        scope.doAction = function(sel) {
          var actionFn = scope.actions[sel.name].fn;
          if (angular.isFunction(actionFn)) {
            actionFn(sel.records, scope.selections.records);
          }
          // Local selection with no storage
          // trigger a clear selection once done.
          if (sel.storage === null) {
            var nbRecords = sel.records.length;
            for (var i = 0; i < nbRecords; i++) {
              controller.remove(sel, scope.user, sel.records[0]);
            }
          }
        };
      }

      return {
        restrict: 'A',
        require: '^gnSavedSelections',
        templateUrl: '../../catalog/views/snig/directives/' +
        	'partials/savedSelectionsPanel.html',
        link: link,
        scope: {
          user: '=gnSavedSelectionsPanel'
        }
      };
    }]);
  
  /**
   * Button to add or remove item from user saved selection.
   */
  module.directive('gnSnigSavedSelectionsAction',
      ['gnSavedSelectionConfig', '$rootScope',
       function(gnSavedSelectionConfig, $rootScope) {
         function link(scope, element, attrs, controller) {
           scope.selectionsWithRecord = [];
           scope.selections = {};
           scope.uuid = scope.record['geonet:info'].uuid;

           $rootScope.$on('savedSelectionsUpdate', function(e, n, o) {
             scope.selections = n;
             // Check in which selection this record is in
             scope.selectionsWithRecord = [];
             for (var i = 0; i < scope.selections.list.length; i++) {
               var s = scope.selections.list[i];
               if (s.records) {
                 for (var j = 0; j < s.records.length; j++) {
                   if (s.records[j] === scope.uuid) {
                     scope.selectionsWithRecord.push(s.id);
                     break;
                   }
                 }
               }
             }
           });

           controller.getSelections(scope.user).then(function(selections) {
             scope.selections = selections;
           });

           scope.add = function(selection) {
             controller.add(selection, scope.user, scope.uuid);
           };

           scope.remove = function(selection) {
             controller.remove(selection, scope.user, scope.uuid);
           };


           function check(selection, canBeAdded) {
             // Authenticated user can't use local anymous selections
             if (scope.user && scope.user.id !== undefined &&
              selection.isAnonymousOnly === true) {
               return false;
             }

             // Check if selection has an advanced filter
             var selConfig = gnSavedSelectionConfig.actions[selection.name];
             var isValidRecord = false;
             if (selConfig && selConfig.filterFn &&
              angular.isFunction(selConfig.filterFn)) {
               isValidRecord = selConfig.filterFn(scope.record);
             } else {
               isValidRecord = true;
             }

             if (angular.isArray(selection.records) &&
                 isValidRecord && canBeAdded) {
               // Check if record already in current selection
               return selection.records.indexOf(scope.uuid) === -1;
             } else if (angular.isArray(selection.records) &&
                        isValidRecord && canBeAdded === false) {
               // Check if record not already in current selection
               return selection.records.indexOf(scope.uuid) !== -1;
             } else {
               return false;
             }
           }

           function checkStatus(selection, addedOrRemoved) {
             if (selection) {
               return check(selection, addedOrRemoved);
             } else {
               var result = false;
               if (scope.selections.list === undefined) {
                 return false;
               }
               for (var i = 0; i < scope.selections.list.length; i++) {
                 if (check(scope.selections.list[i], addedOrRemoved)) {
                   result = true;
                 }
               }
               return result;
             }
           }

           scope.canBeAdded = function(selection) {
             return checkStatus(selection, true);
           };
           scope.canBeRemoved = function(selection) {
             return checkStatus(selection, false);
           };

         }
         return {
           restrict: 'A',
           templateUrl: '../../catalog/views/snig/directives/' +
       			'partials/savedSelectionsAction.html',
           require: '^gnSavedSelections',
           link: link,
           scope: {
             selection: '@gnSavedSelectionsAction',
             record: '=',
             user: '=',
             lang: '='
           }
         };
       }]);
  
})();
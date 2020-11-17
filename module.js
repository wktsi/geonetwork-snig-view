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

  goog.provide('gn_search_snig');

  goog.require('snig_cookie_warning');
  goog.require('gn_mdactions_directive');
  goog.require('gn_related_directive');
  goog.require('gn_search');
  goog.require('gn_gridrelated_directive');
  goog.require('gn_search_snig_config');
  goog.require('gn_search_snig_directive');
  goog.require('gn_search_snig_facets_directive');
  goog.require('snig_search_controller');
  goog.require('snig_multi_location_directive');
  goog.require('snig_search_home_controller');
  goog.require('gn_cors_interceptor');
  goog.require('gn_popup');

  var module = angular.module('gn_search_snig',
	      ['gn_search', 'gn_search_snig_config',
	       'gn_search_snig_directive', 'gn_search_snig_facets_directive', 'gn_related_directive',
	       'snig_cookie_warning', 'gn_mdactions_directive', 'gn_gridrelated_directive', 'snig_search_controller',
	       'snig_multi_location_directive', 'snig_search_home_controller',
	       'gn_cors_interceptor', 'gn_popup']);
  
  module.filter('escape', function() {
    return window.encodeURIComponent;
  });  

  module.controller('gnsSearchPopularController', [
    '$scope', 'gnSearchSettings',
    function($scope, gnSearchSettings) {
      $scope.searchObj = {
        permalink: false,
        filters: gnSearchSettings.filters,
        params: {
          sortBy: 'popularity',
          from: 1,
          to: 9
        }
      };
    }]);


  module.controller('gnsSearchLatestController', [
    '$scope', 'gnSearchSettings',
    function($scope, gnSearchSettings) {
      $scope.searchObj = {
        permalink: false,
        filters: [{ 'type': 'dataset'}],
        params: {
          sortBy: 'changeDate',
          from: 1,
          to: 9
        }
      };
    }]);

  module.controller('gnsSearchTopEntriesController', [
    '$scope', 'gnGlobalSettings',
    function($scope, gnGlobalSettings) {
      $scope.resultTemplate = '../../catalog/components/' +
        'search/resultsview/partials/viewtemplates/grid4maps.html';
      $scope.searchObj = {
        permalink: false,
        filters: {
          'type': 'interactiveMap'
        },
        params: {
          sortBy: 'changeDate',
          from: 1,
          to: 30
        }
      };
    }]);


  module.controller('gnsSNIG', [
    '$scope',
    '$location',
    'suggestService',
    '$http',
    '$translate',
    '$filter',
    'gnUtilityService',
    'gnSearchSettings',
    'gnViewerSettings',
    'gnMap',
    'gnMdView',
    'gnMdViewObj',
    'gnWmsQueue',
    'gnSearchLocation',
    'gnOwsContextService',
    'gnPopup',
    'hotkeys',
    'gnGlobalSettings',
    function($scope, $location, suggestService, $http, $translate,$filter,
             gnUtilityService, gnSearchSettings, gnViewerSettings,
             gnMap, gnMdView, mdView, gnWmsQueue,
             gnSearchLocation, gnOwsContextService, gnPopup,
             hotkeys, gnGlobalSettings) {

      var viewerMap = gnSearchSettings.viewerMap;
      var searchMap = gnSearchSettings.searchMap;
      
      gnMap.zoomLayerToExtent = function(map) {
    	  map.getView().fit(map.getView().
              getProjection().getExtent(), map.getSize());
        };
     
        
      var removeDuplicateLinks = function(arr){ 
			var newArr = [];
			angular.forEach(arr, function(value, key) {
				var exists = false;
				angular.forEach(newArr, function(val2, key) {
					if(angular.equals(value, val2)){ exists = true }; 
				});
				if(exists == false && value.url != "") { newArr.push(value); }
			});
		  return newArr;
		};   
        
      var getViewLinks = function (links) {
    	  var values = [];
    	  
    	  if (links && links.length) {
	    	  for (var i=0; i<links.length; i++) {
	    		  if (links[i].toLowerCase().indexOf('wms-c') > -1) {
	    			  values.push({ 'type': 'WMS-C', 'url': links[i]});
	    		  } else if (links[i].toLowerCase().indexOf('wms') > -1) {
	    			  values.push({ 'type': 'WMS', 'url': links[i]});
	    		  } else if (links[i].toLowerCase().indexOf('wmts') > -1) {
	    			  values.push({ 'type': 'WMTS', 'url': links[i]});
	    		  }
	    	  }
    	  }
    	  
    	  return values;
      };   
        
      var getDowloadLinks = function (links) {
    	  var values = [];
    	  
    	  if (links && links.length) {
	    	  for (var i=0; i<links.length; i++) {
	    		  if (links[i].toLowerCase().indexOf('zip') > -1) {
	    			  values.push({ 'type': 'FILE', 'url': links[i]});
	    		  } else if (links[i].toLowerCase().indexOf('wfs') > -1) {
	    			  values.push({ 'type': 'WFS', 'url': links[i]});
	        	  } else if (links[i].toLowerCase().indexOf('wcs') > -1) {
	        		  values.push({ 'type': 'WCS', 'url': links[i]});    			  
	    		  } else if (links[i].toLowerCase().indexOf('atom') > -1) {
	    			  values.push({ 'type': 'ATOM', 'url': links[i]});
	    		  }
	    	  }
    	  }
    	  
    	  return values;    	  
      };
        

      $scope.modelOptions = angular.copy(gnGlobalSettings.modelOptions);
      $scope.modelOptionsForm = angular.copy(gnGlobalSettings.modelOptions);
      $scope.isFilterTagsDisplayedInSearch = gnGlobalSettings.gnCfg.mods.search.isFilterTagsDisplayedInSearch;
      $scope.gnWmsQueue = gnWmsQueue;
      $scope.$location = $location;
      $scope.activeTab = '/home';
      //$scope.currentTabMdView = 'identification';
      $scope.currentTabMdView = 'intro';
      $scope.resultTemplate = gnSearchSettings.resultTemplate;
      $scope.facetsSummaryType = gnSearchSettings.facetsSummaryType;
      $scope.facetConfig = gnSearchSettings.facetConfig;
      $scope.facetTabField = gnSearchSettings.facetTabField;
      $scope.location = gnSearchLocation;
      $scope.toggleMap = function () {
        $(searchMap.getTargetElement()).toggle();
        $('button.gn-minimap-toggle > i').toggleClass('fa-angle-double-left fa-angle-double-right');
      };
      $scope.toggleFilter = function () {
    	console.log('toggleFilter');
    	$('div.gn-search-facet').toggleClass('hidden-sm hidden-xs');
        //$(searchMap.getTargetElement()).toggle();
        //$('button.gn-minimap-toggle > i').toggleClass('fa-angle-double-left fa-angle-double-right');
	  };      
      hotkeys.bindTo($scope)
        .add({
            combo: 'h',
            description: $translate.instant('hotkeyHome'),
            callback: function(event) {
              $location.path('/home');
            }
          }).add({
            combo: 't',
            description: $translate.instant('hotkeyFocusToSearch'),
            callback: function(event) {
              event.preventDefault();
              var anyField = $('#gn-any-field');
              if (anyField) {
                gnUtilityService.scrollTo();
                $location.path('/search');
                anyField.focus();
              }
            }
          }).add({
            combo: 'enter',
            description: $translate.instant('hotkeySearchTheCatalog'),
            allowIn: 'INPUT',
            callback: function() {
              $location.search('tab=search');
            }
            //}).add({
            //  combo: 'r',
            //  description: $translate.instant('hotkeyResetSearch'),
            //  allowIn: 'INPUT',
            //  callback: function () {
            //    $scope.resetSearch();
            //  }
          }).add({
            combo: 'm',
            description: $translate.instant('hotkeyMap'),
            callback: function(event) {
              $location.path('/map');
            }
          });


      // TODO: Previous record should be stored on the client side
      $scope.mdView = mdView;
      gnMdView.initMdView();
      $scope.goToSearch = function (any) {
        $location.path('/search').search({'anysnig': any});
      };
      $scope.canEdit = function(record) {
        // TODO: take catalog config for harvested records
        if (record && record['geonet:info'] &&
            record['geonet:info'].edit == 'true') {
          return true;
        }
        return false;
      };
      $scope.openRecord = function(index, md, records) {
        gnMdView.feedMd(index, md, records);
      };

      $scope.closeRecord = function() {
        gnMdView.removeLocationUuid();
        $location.search('tab', null);

      };
      $scope.nextRecord = function() {
        var nextRecordId = mdView.current.index + 1;
        if (nextRecordId === mdView.records.length) {
          // When last record of page reached, go to next page...
          // Not the most elegant way to do it, but it will
          // be easier using index search components
          $scope.$broadcast('nextPage');
        } else {
          $scope.openRecord(nextRecordId);
        }
      };
      $scope.previousRecord = function() {
        var prevRecordId = mdView.current.index - 1;
        if (prevRecordId === -1) {
          $scope.$broadcast('previousPage');
        } else {
          $scope.openRecord(prevRecordId);
        }
      };

      $scope.infoTabs = {
        lastRecords: {
          title: 'lastRecords',
          titleInfo: '',
          active: true
        },
        preferredRecords: {
          title: 'preferredRecords',
          titleInfo: '',
          active: false
        }};

      // Set the default browse mode for the home page
      $scope.$watch('searchInfo', function (n, o) {
        if (angular.isDefined($scope.searchInfo.facet)) {
          if ($scope.searchInfo.facet['inspireThemes'].length > 0) {
            $scope.browse = 'inspire';
          } else if ($scope.searchInfo.facet['topicCats'].length > 0) {
            $scope.browse = 'topics';
          //} else if ($scope.searchInfo.facet['categories'].length > 0) {
          //  $scope.browse = 'cat';
          }
        }
      });

      $scope.$on('layerAddedFromContext', function(e,l) {
        var md = l.get('md');
        if(md) {
          var linkGroup = md.getLinkGroup(l);
          gnMap.feedLayerWithRelated(l,linkGroup);
        }
      });

      $scope.resultviewFns = {
        addMdLayerToMap: function (link, md) {
          var config = {
             uuid: md?md.getUuid():null,
             type: link.protocol.indexOf('WMTS') > -1 ? 'wmts' : 'wms',
             url: $filter('gnLocalized')(link.url) || link.url
           };
 
          if (link.name && link.name !== '') {
            config.name = link.name;
            config.group = link.group;
            // Related service return a property title for the name
          } else if (link.title) {
            config.name = $filter('gnLocalized')(link.title) || link.title;
          }

          // This is probably only a service
          // Open the add service layer tab
          $location.path('map').search({
            add: encodeURIComponent(angular.toJson([config]))});
          return;
        },
        addAllMdLayersToMap: function (layers, md) {
          angular.forEach(layers, function (layer) {
            $scope.resultviewFns.addMdLayerToMap(layer, md);
          });
        },
        loadMap: function (map, md) {
          gnOwsContextService.loadContextFromUrl(map.url, viewerMap);
        },
        showViewLinks: function(md) {
        	var urls = '';        	
        	var allLinks = [];
        	var singleLinks = [];
        	
        	if (md.linksTree.length) {
        		for (var k=0; k<md.linksTree.length; k++) {
        			var links = md.linksTree[k];
        			
                	for(var i=0;i<links.length;i++) {
                		if (links[i].url.toLowerCase().indexOf('wms-c') > -1) {
                			allLinks.push({ 'type': 'WMS-C', 'url': links[i].url });
                		} else if (links[i].url.toLowerCase().indexOf('wms') > -1) {
                			allLinks.push({ 'type': 'WMS', 'url': links[i].url });
                		} else if (links[i].url.toLowerCase().indexOf('wmts') > -1) {
                			allLinks.push({ 'type': 'WMTS', 'url': links[i].url });
                		}
                	}        			
        		}
        	};        	
        	
        	singleLinks = removeDuplicateLinks(allLinks);        	
        	if (singleLinks.length) {
        		for (var i=0; i<singleLinks.length; i++) {
        			urls = urls + '<div style="word-wrap: break-word;"><b>' + singleLinks[i].type + '</b>:<br />' + singleLinks[i].url + '</div>';
        		}        		
        	}
        	
       	    var popup = gnPopup.createModal({
                title: md.title || md.defaultTitle,
                content: urls
             });        	
        },
        showDownloadLinks: function(md) {
        	var urls = '';        	
        	var allLinks = [];
        	var singleLinks = [];       	
        	  
        	if (md.linksTree.length) {
        		for (var k=0; k<md.linksTree.length; k++) {
	        		var links = md.linksTree[k];
	        		
	        		for(var i=0;i<links.length;i++) {
		        		if (links[i].url.toLowerCase().indexOf('zip') > -1) {
		        			allLinks.push({ 'type': 'Ficheiro', 'url': links[i].url });
		        		} else if (links[i].url.toLowerCase().indexOf('wfs') > -1) {
		        			allLinks.push({ 'type': 'WFS', 'url': links[i].url });
		        		} else if (links[i].url.toLowerCase().indexOf('wcs') > -1) {
		        			allLinks.push({ 'type': 'WCS', 'url': links[i].url });
		        		}  else if (links[i].url.toLowerCase().indexOf('atom') > -1) {
		        			allLinks.push({ 'type': 'ATOM', 'url': links[i].url });
		        		}
	        		}
	        	}
        	}
        	
        	singleLinks = removeDuplicateLinks(allLinks);        	
        	if (singleLinks.length) {
        		for (var i=0; i<singleLinks.length; i++) {
        			urls = urls + '<div style="word-wrap: break-word;"><b>' + singleLinks[i].type + '</b>:<br />' + singleLinks[i].url + '</div>';
        		}        		
        	}        	
        	
       	    var popup = gnPopup.createModal({
               title: md.title || md.defaultTitle,
               content: '<div>' + urls + '</div>'
            }); 
        	
        }        
      };
      
      $scope.getDowloadLinks = getDowloadLinks;            
      $scope.getViewLinks = getViewLinks;
      
      // Load WMS layers as TileWMS
      gnViewerSettings.singleTileWMS = false;      
      
      // Share map loading functions
      gnViewerSettings.resultviewFns = $scope.resultviewFns;

      // Manage route at start and on $location change
      // depending on configuration
      if (!$location.path()) {
        var m = gnGlobalSettings.gnCfg.mods;
        $location.path(
          m.home.enabled ? '/home' :
          m.search.enabled ? '/search' :
          m.map.enabled ? '/map' : 'home'
        );
      }

      // Manage route at start and on $location change
      if (!$location.path()) {
        $location.path('/home');
      }
      try {
      if ($location.path().indexOf("|")==1) location.href="catalog.search#/metadata/"+$location.path().substring($location.path().indexOf("|")+1);

      $scope.activeTab = $location.path().
          match(/^(\/[a-zA-Z0-9]*)($|\/.*)/)[1];
      } catch (e){}

      var availableTabs = ['responsible', 'metainfo', 'keywords', 'techinfo'];
      $scope.changeTabMdView =function(newTab) {
        if (availableTabs.indexOf(newTab) == -1) {
          newTab = availableTabs[0];
        }
        $location.search('tab', newTab);
      };

      $scope.$on('tabChangeRequested', function(event, requestedTab) {
        //$scope.changeTabMdView(requestedTab);
        $scope.changeTabWithoutModifyingUrl(requestedTab);
      });

      $scope.changeTabWithoutModifyingUrl = function (newTab) {
        if (newTab && availableTabs.indexOf(newTab) != -1) {
          $scope.currentTabMdView = newTab;
        } else {
            //$scope.currentTabMdView = 'identification';
        	$scope.currentTabMdView = 'intro';
        }
      };
      
      $scope.$on('locationBackToSearch', function(evt, args) {
     	 if (args.lastSearchParams) {
     		 args.current.restoreSearch(args.lastSearchParams);
     	 }
       });      

      $scope.$on('$locationChangeSuccess', function(next, current) {
        try {
        $scope.activeTab = $location.path().
            match(/^(\/[a-zA-Z0-9]*)($|\/.*)/)[1];
        } catch(e) {}
        var search = $location.search();

        if (search.tab && availableTabs.indexOf(search.tab) != -1) {
          $scope.currentTabMdView = search.tab;
        } else {
          //$scope.currentTabMdView = 'identification';
        	$scope.currentTabMdView = 'intro';
        }

        if (gnSearchLocation.isSearch() && (!angular.isArray(
            searchMap.getSize()) || searchMap.getSize()[0] < 0)) {
          setTimeout(function() {
            searchMap.updateSize();

            // if an extent was obtained from a loaded context, apply it
            if(searchMap.get('lastExtent')) {
              searchMap.getView().fit(
                searchMap.get('lastExtent'),
                searchMap.getSize(), { nearest: true });
            }
          }, 0);
        }
        if (gnSearchLocation.isMap() && (!angular.isArray(
            viewerMap.getSize()) || viewerMap.getSize().indexOf(0) >= 0)) {
          setTimeout(function() {
            viewerMap.updateSize();

	    // if an extent was obtained from a loaded context, apply it
            if(viewerMap.get('lastExtent')) {
              viewerMap.getView().fit(
                viewerMap.get('lastExtent'),
                viewerMap.getSize(), { nearest: true });
            }

            var map = $location.search().map;
            if (angular.isDefined(map)) {
              $scope.resultviewFns.loadMap({url: map});
            }

          }, 0);
        }
      });           

      angular.extend($scope.searchObj, {
        advancedMode: false,
        from: 1,
        to: 30,
        selectionBucket: 's101',
        viewerMap: viewerMap,
        searchMap: searchMap,
        mapfieldOption: {
          relations: ['within_bbox']
        },
        hitsperpageValues: gnSearchSettings.hitsperpageValues,
        filters: gnSearchSettings.filters,
        defaultParams: {
          'facet.q': '',
          resultType: gnSearchSettings.facetsSummaryType || 'details',
          sortBy: gnSearchSettings.sortBy || 'referenceDateOrd',
          //sortOrder: 'reverse',
          sortOrder: ''
          //,relation: 'within_bbox'
        },
        params: {
          'facet.q': '',
          resultType: gnSearchSettings.facetsSummaryType || 'details',
          sortBy: gnSearchSettings.sortBy || 'referenceDateOrd',
          //sortOrder: 'reverse'
          sortOrder: ''
          //,relation: 'within_bbox'
        },
        sortbyValues: gnSearchSettings.sortbyValues
      });
    }]);
})();
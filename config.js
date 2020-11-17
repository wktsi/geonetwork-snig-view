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

  goog.provide('gn_search_snig_config');
  
  goog.require('gn_snig_gazetteer_factory');

  var module = angular.module('gn_search_snig_config', ['gn_snig_gazetteer_factory']);

  module.value('gnTplResultlistLinksbtn',
  '../../catalog/views/snig/directives/partials/linksbtn.html');
  module.value('snigTplResultlistServicesLinksbtn',
  '../../catalog/views/snig/directives/partials/servicesLinksbtn.html');  

  module
      .run([
        'gnSearchSettings',
        'gnViewerSettings',
        'gnOwsContextService',
        'gnHttpServices',
        'gnMap',
        'gnMapsManager',
        'gnDefaultGazetteer',
        'gnSnigGazetteer',
        function(searchSettings, viewerSettings, gnOwsContextService, gnHttpServices,
                 gnMap, gnMapsManager, gnDefaultGazetteer, gnSnigGazetteer) {

          if(viewerSettings.mapConfig.viewerMapLayers) {
            console.warn('[geonetwork] Use of "mapConfig.viewerMapLayers" is deprecated. ' +
              'Please configure layer per map type.')
          }

          // Keep one layer in the background
          // while the context is not yet loaded.
          viewerSettings.bgLayers = [
            gnMap.createLayerForType('osm')
          ];
          viewerSettings.servicesUrl =
            viewerSettings.mapConfig.listOfServices || {};

          // WMS settings
          // If 3D mode is activated, single tile WMS mode is
          // not supported by ol3cesium, so force tiling.
          if (viewerSettings.mapConfig.is3DModeAllowed) {
            viewerSettings.singleTileWMS = false;
            // Configure Cesium to use a proxy. This is required when
            // WMS does not have CORS headers. BTW, proxy will slow
            // down rendering.
            viewerSettings.cesiumProxy = true;
          } else {
            viewerSettings.singleTileWMS = true;
          }
          
          //SNIG Custom
          //Force single tile WMS for all situations
          //Doesn't work well with single tile images (requests for very large images)
          viewerSettings.singleTileWMS = false;          
          
          //Function to override zoomMapExtent method from gnMainViewer directive
          viewerSettings.zoomToMapExtent = function (map) {
        	  if (this.maxExtent) {
        		  map.getView().fit(this.maxExtent, map.getSize());
        	  } else {
                  map.getView().fit(map.getView().
                          getProjection().getExtent(), map.getSize());        		  
        	  }
          }          

          var bboxStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgba(255,0,0,1)',
              width: 2
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255,0,0,0.3)'
            })
          });
          searchSettings.olStyles = {
            drawBbox: bboxStyle,
            mdExtent: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'orange',
                width: 2
              })
            }),
            mdExtentHighlight: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'orange',
                width: 3
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255,255,0,0.3)'
              })
            })

          };
          
          //--------------------------------------------
          //SNIG Filters:
          //--------------------------------------------
          var snigFilterField = 'type';
          var snigFilterValue = 'dataset+or+series';          
          // To configure search filter
          searchSettings.filters[snigFilterField] = snigFilterValue;        	  
          // To configure search suggestion service
          gnHttpServices.suggest = 'suggestsnig';
          searchSettings.suggestFilter = {
        	field: snigFilterField,
            value: snigFilterValue
          };
          
          // To configure DataType
          searchSettings.dataTypeFacet = {
          	areas: [
        		{
	        		value: 'vector',
	        		label: 'Vetor'
        		},          		
        		{
	        		value: 'grid',
	        		label: 'Raster'
        		}
        	]
          };
          
          // To configure DenominatorFacet
          searchSettings.denominatorFacet = {
        	ranges: [
        		{
	        		min: 1,
	        		max: 9999,
	        		label: 'Inferior a 1:10 000'
        		},
        		{
	        		min: 10000,
	        		max: 99999,
	        		label: 'De 1:10 000 a 1:100 000'        			
        		},
        		{
	        		min: 100000,
	        		max: 99999999,
	        		label: 'Superior a 1:100 000'
        		}
        	]
          };                    
          

          var searchMap = gnMapsManager.createMap(gnMapsManager.SEARCH_MAP);
          var viewerMap = gnMapsManager.createMap(gnMapsManager.VIEWER_MAP);

          // To configure a gazetteer provider
          viewerSettings.gazetteerProvider = gnSnigGazetteer;
          
          /* Custom templates for search result views */
          searchSettings.resultTemplate="../../catalog/views/snig/templates/card.html";
          searchSettings.resultViewTpls = [{
            tplUrl: '../../catalog/views/snig/templates/card.html',
            tooltip: 'Grid',
            icon: 'fa-th'
          }];
          
          // Mapping for md links in search result list.
          searchSettings.linkTypes = {
            links: ['LINK', 'kml', 'pdf', 'docx', 'gml', 'geojson'],
            downloads: ['DOWNLOAD','Inspire atom'],
            //layers:['OGC', 'kml'],
            layers:['OGC'],
            maps: ['OGC:OWC']
          };          
          
          // Map protocols used to load layers/services in the map viewer
          searchSettings.mapProtocols = {
            layers: [
              'OGC:WMS',
              'OGC:WMTS',
              'OGC:WMS-1.1.1-http-get-map',
              'OGC:WMS-1.3.0-http-get-map',
              'OGC:WFS'
              ],
            services: [
              'OGC:WMS-1.3.0-http-get-capabilities',
              'OGC:WMS-1.1.1-http-get-capabilities',
              'OGC:WMTS-1.0.0-http-get-capabilities',
              'OGC:WFS-1.0.0-http-get-capabilities'
              ]
          };
          
          // Override sortbValues
          searchSettings.sortbyValues = [
        	 {
           	  sortBy: "referenceDateOrd",
           	  sortOrder: ""
           	 },
        	 {
           	  sortBy: "orgNameSNIG",
           	  sortOrder: "reverse"
           	 },
        	 {
          	  sortBy: "title",
          	  sortOrder: "reverse"
          	 },
          	 {
        	  sortBy: "topicCatLang",
        	  sortOrder: "reverse"
        	 }          	 
          ];
          searchSettings.sortBy = 'referenceDateOrd';
          
          // Cookies
          searchSettings.cookieConsent = {
        	name: 'snig-cookie-agreed',
        	value: '2',
        	path: '/'
          };
          

          // Set custom config in gnSearchSettings
          angular.extend(searchSettings, {
            viewerMap: viewerMap,
            searchMap: searchMap
          });

        }]);
})();
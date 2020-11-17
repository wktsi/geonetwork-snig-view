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
  goog.provide('gn_snig_gazetteer_factory');

  var module = angular.module('gn_snig_gazetteer_factory', []);

  module.provider('gnSnigGazetteer', function() {
    return {
      $get : [
        '$http',
        'gnGlobalSettings',
        'gnViewerSettings',
        'gnGetCoordinate',
        function($http, gnGlobalSettings, gnViewerSettings, gnGetCoordinate) {
          var zoomTo = function(extent, map, zoom) {
          	  if(zoom){
          		  map.getView().fit(extent, map.getSize(), zoom);
          	  } else {
          		  map.getView().fit(extent, map.getSize());
          	  }            
          }
          return {
            onClick: function(scope, loc, map) {            	

              var extent = loc.geom.transform('EPSG:4326', scope.map.getView().getProjection()).getExtent();            	
                            
              var zoom_ops = { minResolution: 0.5 };
              if (loc.geom.getType() == 'Point' || loc.geom.getType() == 'MultiPoint') {
                   zoom_ops.minResolution = 2;
              }
              if (loc.type && loc.type.toLowerCase() == 'ih' ) {
            	  zoom_ops.minResolution = 80;
              }
              
              zoomTo(extent, map, zoom_ops);
              scope.query = loc.name;
              scope.collapsed = true;
            },
            search: function(scope, loc, query) {
                if (query.length < 3) return;

                var coord = gnGetCoordinate(
                    scope.map.getView().getProjection().getWorldExtent(), query);

                if (coord) {
                  function moveTo(map, zoom, center) {
                    var view = map.getView();

                    view.setZoom(zoom);
                    view.setCenter(center);
                  }
                  moveTo(scope.map, 5, ol.proj.transform(coord,
                      'EPSG:4326', 'EPSG:28992'));
                  return;
                }
                var formatter = function(loc) {
                  var props = [];
                  //['toponymName', 'adminName1', 'countryName'].
                  //['nome', 'tipo'].
                  ['designacao', 'concelho'].
                      forEach(function(p) {
                        if (loc[p]) { props.push(loc[p]); }
                      });
                  return (props.length == 0) ? '' : props.join(', ');
                };

                //TODO: move api url to config
                /*
                var url = 'https://geoportal.cm-portimao.pt/autocomplete';
                $http.get(url, {
                  params: {
                    //q: query
                	term: query
                  }
                }).
                */                
                //var url = 'http://snig2018.wkt.pt/geographical_names/search';
                var url = 'https://snig.dgterritorio.gov.pt/geographical_names/search';                
                $http.get(url, {
                    params: {
                    	_min_similarity: 0.2,
                    	_filter: query,
                    	_maxrows: 20                    	
                    }
                }).                
                success(function(response) {
                  // array for the search results
                  scope.results = [];

                  // no results, just stop, don't build the dropdown                  
                  var numResults = response.length || 0;

                  if (numResults == 0) {
                    return;
                  }

                  // get the results
                  $features = response;

                  //var format = new ol.format.GeoJSON();
                  var format = new ol.format.WKT();
                  
                  // loop through the results
                  $.each($features, function(i, item) {               	  
                	                      
                    //var geom = format.readGeometry(item.geom_json);
                	  var geom = format.readGeometry(item.geom_wkt); 
                	  
                    // create the result
                	/*
                    scope.results.push({
                        id: item.id,
                        name: formatter(item),
                        type: item.tipo,
                        geom: geom,                        
                        score: 0,
                        "extra_info": null
                    });
                    */
                    scope.results.push({
                    	id: i,
                        name: formatter(item),
                        type: item.origem,
                        geom: geom,                        
                        score: 0,
                        "extra_info": null
                    });                	  
                  });

                });
            }
          }
        }]
    }
  });
})();
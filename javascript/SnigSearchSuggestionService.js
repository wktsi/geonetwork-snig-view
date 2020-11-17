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
  goog.provide('snig_searchsuggestion_service');  
  goog.require('gn_searchsuggestion_service');

  angular.module('snig_searchsuggestion_service', [
	  'gn_searchsuggestion_service'
  ])

      /**
   * @ngdoc service
   * @kind function
   * @name snig_searchsuggestion.service:suggestService
   * @requires gnHttpServices
   * @requires gnUrlUtils
   * @requires suggestService
   * @requires $http
   *
   * @description
   * The `snigSuggestService` service provides a customization to get
   * suggestions from the index.
   */

      .service('snigSuggestService', [
    	'gnSearchSettings',
        'gnHttpServices',
        'gnUrlUtils',
        'suggestService',
        '$http',
        function(gnSearchSettings, gnHttpServices, gnUrlUtils, suggestService, $http) {
    		
    	  this.filter = gnSearchSettings.suggestFilter;	
    		
          /**
           * @ngdoc method
           * @methodOf snig_searchsuggestion.service:snigSuggestService
           * @name snigSuggestService#getAnySuggestions
           *
           * @description
           * Return suggestion for field 'any'
           *
           * @param {string} val any filter
           * @return {HttpPromise} promise
           */
          this.getAnySuggestions = function(val) {
            var url = suggestService.getUrl(val, 'anylightsnig',      	  
                ('STARTSWITHFIRST'));
            
            if (this.filter && this.filter.field && this.filter.value)  {
                url = gnUrlUtils.append(url, 
	                    gnUrlUtils.toKeyValue({
	                    	filterField: this.filter.field,
	                    	filterValue: this.filter.value
	                      })		
                	);          	            	
            }

            return $http.get(url, {
            }).then(function(res) {
              return res.data[1];
            });
          };

        }]);
})();
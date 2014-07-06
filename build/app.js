///<reference path="../typings/tsd.d.ts" />
var bostonBiking;
(function (bostonBiking) {
    var CircleMarkerLayer = (function () {
        function CircleMarkerLayer(baseData) {
            this._markers = [];
            this.setBaseData(baseData);
        }
        CircleMarkerLayer.prototype.setBaseData = function (baseData) {
            this._baseData = baseData;
            this._dirty = true;
            this.createMarkers();
        };

        CircleMarkerLayer.prototype.createMarkers = function () {
            this._markers = [];

            for (var i = 0; i < this._baseData.features.length; i++) {
                var feature = this._baseData.features[i];
                var marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], CircleMarkerLayer._visibleMarker);
                marker.properties = feature.properties;
                this._markers.push(marker);
            }
            this._markerLayer = L.featureGroup(this._markers);
        };

        CircleMarkerLayer.prototype.bindMap = function (map) {
            map.addLayer(this._markerLayer);
            map.fitBounds(this._markerLayer.getBounds());
        };

        CircleMarkerLayer.prototype.setFilter = function (filter) {
            this._filterFunction = filter;
            this._dirty = true;
        };

        CircleMarkerLayer.prototype.runFilter = function () {
            if (!this._dirty) {
                return;
            }

            for (var i = 0; i < this._markers.length; i++) {
                var marker = this._markers[i];
                if (!this._filterFunction(marker)) {
                    marker.setStyle(CircleMarkerLayer._invisibleMarker);
                } else {
                    marker.setStyle(CircleMarkerLayer._visibleMarker);
                }
            }

            this._dirty = false;
        };

        CircleMarkerLayer.prototype.getBounds = function () {
            return this._markerLayer.getBounds();
        };
        CircleMarkerLayer._visibleMarker = {
            radius: 4,
            fillOpacity: 0.7,
            color: '#121212',
            fillColor: '#990909',
            opacity: 1,
            weight: 0.5,
            clickable: true
        };

        CircleMarkerLayer._invisibleMarker = {
            radius: 0,
            fillOpacity: 0,
            opacity: 0,
            weight: 0,
            clickable: false
        };
        return CircleMarkerLayer;
    })();
    bostonBiking.CircleMarkerLayer = CircleMarkerLayer;
})(bostonBiking || (bostonBiking = {}));
///<reference path="../typings/tsd.d.ts" />
///<reference path="CircleMarkerLayer.ts" />

var bostonBiking;
(function (bostonBiking) {
    var app = angular.module('bostonBiking.map', []);

    var MapService = (function () {
        function MapService($http, $q) {
            this.$http = $http;
            this.$q = $q;
        }
        MapService.prototype.init = function () {
            if (this.mapPromise) {
                return this.mapPromise;
            }
            var deferred = this.$q.defer();
            this.mapPromise = deferred.promise;

            var lMap = L.mapbox.map('map-canvas', ambient.mapKey);
            lMap.on('load', function () {
                var map = new Map(lMap);
                deferred.resolve(map);
            });

            return this.mapPromise;
        };
        MapService.$inject = ['$http', '$q'];
        return MapService;
    })();
    bostonBiking.MapService = MapService;

    app.service('mapService', MapService);

    var Map = (function () {
        function Map(map) {
            this.map = map;
        }
        Map.prototype.addFeatures = function (geoJson) {
            this._markerLayer = new bostonBiking.CircleMarkerLayer(geoJson);
            this._markerLayer.bindMap(this.map);
        };

        Map.prototype.setFilter = function (dataFilter) {
            this._markerLayer.setFilter(dataFilter);
            this._markerLayer.runFilter();
        };
        return Map;
    })();
    bostonBiking.Map = Map;
})(bostonBiking || (bostonBiking = {}));
var bostonBiking;
(function (bostonBiking) {
    var app = angular.module('bostonBiking.data', []);

    var DataService = (function () {
        function DataService($http, $q) {
            this.$http = $http;
            this.$q = $q;
        }
        DataService.prototype.getData = function () {
            var deferred = this.$q.defer();

            this.$http.get('/data/bikes_raw.json').then(function (data) {
                return deferred.resolve(data.data);
            });

            return deferred.promise;
        };
        DataService.$inject = ['$http', '$q'];
        return DataService;
    })();
    bostonBiking.DataService = DataService;

    app.service('dataService', DataService);
})(bostonBiking || (bostonBiking = {}));
var bostonBiking;
(function (bostonBiking) {
    var app = angular.module('bostonBiking.dataFilters', []);

    var DataFilterService = (function () {
        function DataFilterService($http, $q) {
            this.$http = $http;
            this.$q = $q;
            this.dataFilterFunctionFactory = new DataFilterFunctionFactory();
        }
        DataFilterService.prototype.getDataFilters = function () {
            var _this = this;
            var deferred = this.$q.defer();

            this.$http.get('data/filters.json').then(function (data) {
                return _this.updateFilters(data.data.filters);
            }).then(function (data) {
                return deferred.resolve(data);
            });

            return deferred.promise;
        };

        DataFilterService.prototype.updateFilters = function (dataFilters) {
            return this.createFilters(dataFilters);
        };

        DataFilterService.prototype.combineFilters = function (filterFunctions) {
            return function (data) {
                for (var i = 0; i < filterFunctions.length; i++) {
                    if (!filterFunctions[i].filterFunction) {
                        continue;
                    }
                    if (!filterFunctions[i].filterFunction(data)) {
                        return false;
                    }
                }
                return true;
            };
        };

        DataFilterService.prototype.createFilters = function (filters) {
            var _this = this;
            filters = filters.map(this.createFilter).map(this.populateValues);
            filters.forEach(function (filter) {
                return _this.addFilterFunction(filter);
            });
            return filters;
        };

        DataFilterService.prototype.createFilter = function (filter) {
            return filter;
        };

        DataFilterService.prototype.populateValues = function (filter, dataPoints) {
            return filter;
        };

        DataFilterService.prototype.addFilterFunction = function (filter) {
            filter.filterFunction = this.dataFilterFunctionFactory.create(filter);
        };
        DataFilterService.$inject = ['$http', '$q'];
        return DataFilterService;
    })();
    bostonBiking.DataFilterService = DataFilterService;

    var DataFilterFunctionFactory = (function () {
        function DataFilterFunctionFactory() {
            this.cachedFunctions = {};
        }
        DataFilterFunctionFactory.prototype.create = function (dataFilter) {
            if (dataFilter.type === 'text') {
                return this.createTextDataFilter(dataFilter.value, dataFilter.column);
            }
            return function (str) {
                return true;
            };
        };

        DataFilterFunctionFactory.prototype.createTextDataFilter = function (text, column) {
            return function (featureData) {
                if (text === '' || text === null) {
                    return true;
                }
                var data = featureData.properties[column];
                if (!data) {
                    return false;
                }

                return data.toLowerCase().indexOf(text) > -1;
            };
        };
        return DataFilterFunctionFactory;
    })();

    var DataFilter = (function () {
        function DataFilter() {
        }
        return DataFilter;
    })();
    bostonBiking.DataFilter = DataFilter;

    app.service('dataFilterService', DataFilterService);
})(bostonBiking || (bostonBiking = {}));
///<reference path="../typings/tsd.d.ts" />
///<reference path="mapService.ts" />
///<reference path="dataService.ts" />
///<reference path="dataFilterService.ts" />
var bostonBiking;
(function (bostonBiking) {
    var app = angular.module('bostonBiking', ['bostonBiking.map', 'bostonBiking.data', 'bostonBiking.dataFilters']);
    app.controller('mapCtrl', [
        '$scope', 'mapService', 'dataService', 'dataFilterService',
        function ($scope, mapService, dataService, dataFilterService) {
            mapService.init().then(function (map) {
                $scope.map = map;
                return dataService.getData();
            }).then(function (data) {
                console.log(data);
                $scope.map.addFeatures(data);
            });
        }]);

    app.controller('filterCtrl', [
        '$scope', 'mapService', 'dataService', 'dataFilterService',
        function ($scope, mapService, dataService, dataFilterService) {
            $scope.updateFilters = function () {
                $scope.map.setFilter(dataFilterService.combineFilters(dataFilterService.updateFilters($scope.dataFilters)));
            };

            dataFilterService.getDataFilters().then(function (filters) {
                $scope.dataFilters = filters;
                return mapService.init();
            }).then(function (map) {
                $scope.map = map;
            });
        }]);
})(bostonBiking || (bostonBiking = {}));

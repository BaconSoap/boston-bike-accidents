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
var bostonBiking;
(function (bostonBiking) {
    bostonBiking.config = {
        provider: 1 /* Stamen */,
        dataUrl: '/data/bikes_raw.json',
        filterUrl: '/data/generated_filters.json'
    };

    (function (MapProvider) {
        MapProvider[MapProvider["Mapbox"] = 0] = "Mapbox";
        MapProvider[MapProvider["Stamen"] = 1] = "Stamen";
    })(bostonBiking.MapProvider || (bostonBiking.MapProvider = {}));
    var MapProvider = bostonBiking.MapProvider;
})(bostonBiking || (bostonBiking = {}));
///<reference path="../typings/tsd.d.ts" />
///<reference path="CircleMarkerLayer.ts" />
///<reference path="config.ts" />

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
            var resolve = function () {
                var map = new Map(lMap);
                deferred.resolve(map);
            };

            var lMap;
            if (bostonBiking.config.provider === 0 /* Mapbox */) {
                lMap = L.mapbox.map('map-canvas', ambient.mapKey);
                lMap.once('load', resolve);
            } else if (bostonBiking.config.provider === 1 /* Stamen */) {
                lMap = L.mapbox.map('map-canvas');

                var tl = L.tileLayer('http://{s}tile.stamen.com/terrain/{z}/{x}/{y}.png', {
                    'type': 'png',
                    'subdomains': [
                        'a.',
                        'b.',
                        'c.',
                        'd.'
                    ],
                    'minZoom': 12,
                    'maxZoom': 18,
                    'attribution': 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
                });
                tl.addTo(lMap);
                tl.once('load', resolve);
            }

            lMap.options.maxZoom = 18;
            lMap.options.minZoom = 12;
            lMap.setView([42.3490298, -71.0619507], 15);

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

            this.$http.get(bostonBiking.config.dataUrl).then(function (data) {
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
///<reference path="../typings/tsd.d.ts" />
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

            this.$http.get(bostonBiking.config.filterUrl).then(function (data) {
                return _this.initializeFilterValues(data.data.filters);
            }).then(function (filters) {
                return _this.updateFilters(filters);
            }).then(function (filters) {
                return deferred.resolve(filters);
            });

            return deferred.promise;
        };

        DataFilterService.prototype.initializeFilterValues = function (filters) {
            filters.forEach(function (filter) {
                if (filter.type === 'date') {
                    filter.value = {
                        from: null,
                        to: null
                    };
                } else {
                    filter.value = null;
                }
            });
            return filters;
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
            filters.forEach(function (filter) {
                return _this.addFilterFunction(filter);
            });
            return filters;
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
            this.passThrough = function (f) {
                return true;
            };
            this.cachedFunctions = {};
        }
        DataFilterFunctionFactory.prototype.create = function (dataFilter) {
            switch (dataFilter.type) {
                case 'text':
                    return this.createTextDataFilter(dataFilter.value, dataFilter.column);
                case 'multi':
                    return this.createMultiSelect2DataFilter(dataFilter.value, dataFilter.column);
                case 'date':
                    return this.createDateRangeDataFilter(dataFilter.value, dataFilter.column);
                default:
                    return this.passThrough;
            }
        };

        DataFilterFunctionFactory.prototype.createTextDataFilter = function (text, column) {
            var lowerText = (!!text ? text.toLowerCase() : text);
            return function (featureData) {
                if (text === '' || text === null || typeof text === 'undefined') {
                    return true;
                }
                var data = '' + featureData.properties[column];
                if (!data) {
                    return false;
                }

                return data.toLowerCase().indexOf(lowerText) > -1;
            };
        };

        DataFilterFunctionFactory.prototype.createMultiSelect2DataFilter = function (values, column) {
            var lowerValues = _.map(values, function (val) {
                return (val + '').toLowerCase();
            });
            return function (featureData) {
                if (lowerValues.length === 0) {
                    return true;
                }
                var data = '' + featureData.properties[column];
                if (!data) {
                    return false;
                }

                return lowerValues.indexOf(data.toLowerCase()) > -1;
            };
        };

        DataFilterFunctionFactory.prototype.createDateRangeDataFilter = function (value, column) {
            var from = moment(new Date(value.from));
            var to = moment(new Date(value.to));
            var fromValid = from.isValid() && (value.from !== null);
            var toValid = to.isValid() && (value.to !== null);

            if (!(fromValid || toValid)) {
                return this.passThrough;
            }
            return function (featureData) {
                var momentDate;
                var match = true;

                momentDate = moment(new Date(featureData.properties[column]));
                if (!momentDate.isValid()) {
                    return true;
                }

                if (fromValid) {
                    match = match && from.isBefore(momentDate);
                }
                if (toValid) {
                    match = match && to.isAfter(momentDate);
                }
                return match;
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
    var app = angular.module('bostonBiking', ['bostonBiking.map', 'bostonBiking.data', 'bostonBiking.dataFilters', 'ui.select2', 'ngQuickDate']);

    app.config([
        'ngQuickDateDefaultsProvider', function (defaults) {
            defaults.set('parseDateFunction', function (str) {
                var d = moment(new Date(str));
                var isValid = d.isValid() && (str !== null && typeof str !== 'undefined' && str != '');
                return isValid ? d.toDate() : null;
            });
        }]);

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

            $scope.viewModel = {};
            $scope.viewModel.multiSelect2Options = {
                multiple: true
            };

            dataFilterService.getDataFilters().then(function (filters) {
                $scope.dataFilters = filters;
                return mapService.init();
            }).then(function (map) {
                $scope.map = map;
            });
        }]);
})(bostonBiking || (bostonBiking = {}));

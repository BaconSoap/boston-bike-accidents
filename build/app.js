var bostonBiking;
(function (bostonBiking) {
    var app = angular.module('bostonBiking.map', []);

    var MapService = (function () {
        function MapService($http, $q) {
            this.$http = $http;
            this.$q = $q;
        }
        MapService.prototype.init = function () {
            var deferred = this.$q.defer();

            var lMap = L.mapbox.map('map-canvas', ambient.mapKey);
            lMap.on('load', function () {
                var map = new Map(lMap);
                deferred.resolve(map);
            });

            return deferred.promise;
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
            L.geoJson(geoJson, {
                pointToLayer: function (feature, latLng) {
                    return L.circleMarker(latLng, {
                        radius: 4,
                        fillOpacity: 0.7,
                        color: '#990909',
                        opacity: 1,
                        weight: 0.5
                    });
                }
            }).addTo(this.map);
        };
        return Map;
    })();
    bostonBiking.Map = Map;
})(bostonBiking || (bostonBiking = {}));
///<reference path="../typings/tsd.d.ts" />
///<reference path="mapService.ts" />
var bostonBiking;
(function (bostonBiking) {
    var app = angular.module('bostonBiking', ['bostonBiking.map', 'bostonBiking.data']);
    app.controller('mapCtrl', [
        '$scope', 'mapService', 'dataService', function ($scope, mapService, dataService) {
            mapService.init().then(function (map) {
                $scope.map = map;
                return dataService.getData();
            }).then(function (data) {
                console.log(data);
                $scope.map.addFeatures(data);
            });
        }]);
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

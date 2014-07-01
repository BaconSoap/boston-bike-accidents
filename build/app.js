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
        return Map;
    })();
    bostonBiking.Map = Map;
})(bostonBiking || (bostonBiking = {}));
///<reference path="../typings/tsd.d.ts" />
///<reference path="mapService.ts" />
var bostonBiking;
(function (bostonBiking) {
    var app = angular.module('bostonBiking', ['bostonBiking.map']);
    app.controller('mapCtrl', [
        'mapService', function (mapService) {
            mapService.init().then(function (map) {
                console.log('initted');
            });
        }]);
})(bostonBiking || (bostonBiking = {}));

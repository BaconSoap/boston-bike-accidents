declare var ambient: {mapKey: string};

module bostonBiking {
	var app = angular.module('bostonBiking.map', []);

	export class MapService {
		public static $inject = ['$http', '$q'];
		public constructor(private $http, private $q: ng.IQService) {

		}

		public init(): ng.IPromise<Map> {
			var deferred = this.$q.defer<Map>();

			var lMap = L.mapbox.map('map-canvas', ambient.mapKey);
			lMap.on('load', () => {
				var map = new Map(lMap);
				deferred.resolve(map);
			});

			return deferred.promise;
		}
	}

	app.service('mapService', MapService);

	export class Map {
		public constructor(private map: L.mapbox.Map) {}
	}
}

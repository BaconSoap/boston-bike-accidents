///<reference path="../typings/tsd.d.ts" />
///<reference path="CircleMarkerLayer.ts" />

declare var ambient: {mapKey: string};

module bostonBiking {
	var app = angular.module('bostonBiking.map', []);

	export class MapService {
		private mapPromise: ng.IPromise<Map>;
		public static $inject = ['$http', '$q'];
		public constructor(private $http, private $q: ng.IQService) {

		}

		public init(): ng.IPromise<Map> {
			if (this.mapPromise) {
				return this.mapPromise;
			}
			var deferred = this.$q.defer<Map>();
			this.mapPromise = deferred.promise;

			var lMap = L.mapbox.map('map-canvas', ambient.mapKey);
			lMap.on('load', () => {
				var map = new Map(lMap);
				deferred.resolve(map);
			});

			return this.mapPromise;
		}
	}

	app.service('mapService', MapService);

	export class Map {
		private _markerLayer: bostonBiking.CircleMarkerLayer;

		public constructor(private map: L.mapbox.Map) {}

		public addFeatures(geoJson: any) {
			this._markerLayer = new bostonBiking.CircleMarkerLayer(geoJson);
			this._markerLayer.bindMap(this.map);
		}

		public setFilter(dataFilter: L.mapbox.FilterFunction) {
			this._markerLayer.setFilter(dataFilter);
			this._markerLayer.runFilter();
		}
	}
}

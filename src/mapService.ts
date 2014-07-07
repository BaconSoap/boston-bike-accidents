///<reference path="../typings/tsd.d.ts" />
///<reference path="CircleMarkerLayer.ts" />
///<reference path="config.ts" />

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
			var resolve = () => {
				var map = new Map(lMap);
				deferred.resolve(map);
			};

			var lMap: any;
			if (config.provider === MapProvider.Mapbox) {
				lMap = L.mapbox.map('map-canvas', ambient.mapKey);
				lMap.once('load', resolve);
			} else if (config.provider === MapProvider.Stamen) {

				lMap = L.mapbox.map('map-canvas');

				var tl = L.tileLayer('http://{s}tile.stamen.com/terrain/{z}/{x}/{y}.png', <any>{
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

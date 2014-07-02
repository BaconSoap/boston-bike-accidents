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
		public constructor(private map: L.mapbox.Map) {}

		public addFeatures(geoJson: any) {
			var geo = L.mapbox.featureLayer(geoJson, {
				pointToLayer: (feature, latLng) => {
					return L.circleMarker(latLng, {
						radius: 4,
						fillOpacity: 0.7,
						color: '#121212',
						fillColor: '#990909',
						opacity: 1,
						weight: 0.5
					});
				}
			});

			geo.on('ready', function() {
				this.eachLayer(marker => {
					marker.setIcon(null);
				});
			});
			geo.addTo(this.map);
			this.map.featureLayer = <any>geo;
		}

		public setFilter(dataFilter: L.mapbox.FilterFunction) {
			console.log(dataFilter);
			console.log(dataFilter({properties: {GENDER: 'male'}}));
			this.map.featureLayer.setFilter(dataFilter);
		}
	}
}

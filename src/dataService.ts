module bostonBiking {
	var app = angular.module('bostonBiking.data', []);

	export class DataService {
		public static $inject = ['$http', '$q'];
		public constructor(private $http, private $q: ng.IQService) {}

		public getData(): ng.IPromise<L.GeoJSON> {
			var deferred = this.$q.defer<L.GeoJSON>();

			this.$http.get(config.dataUrl).then(data => deferred.resolve(data.data));

			return deferred.promise;
		}

	}

	app.service('dataService', DataService);
}

///<reference path="../typings/tsd.d.ts" />
///<reference path="mapService.ts" />

module bostonBiking {
	var app = angular.module('bostonBiking', ['bostonBiking.map', 'bostonBiking.data']);
	app.controller('mapCtrl', ['$scope', 'mapService', 'dataService', ($scope, mapService: MapService, dataService: DataService) => {
		mapService
			.init().then(map => {
				$scope.map = map;
				return dataService.getData();
			}).then(data => {
				console.log(data);
				$scope.map.addFeatures(data);
			});
	}]);
}

///<reference path="../typings/tsd.d.ts" />
///<reference path="mapService.ts" />

module bostonBiking {
	var app = angular.module('bostonBiking', ['bostonBiking.map']);
	app.controller('mapCtrl', ['mapService', (mapService: MapService) => {
		mapService.init().then(map => {
			console.log('initted');
		})
	}]);
}

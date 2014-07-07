///<reference path="../typings/tsd.d.ts" />
///<reference path="mapService.ts" />
///<reference path="dataService.ts" />
///<reference path="dataFilterService.ts" />

module bostonBiking {
	var app = angular.module('bostonBiking', ['bostonBiking.map', 'bostonBiking.data', 'bostonBiking.dataFilters', 'ui.select2']);
	app.controller('mapCtrl',
		['$scope', 'mapService', 'dataService', 'dataFilterService',
		($scope, mapService: MapService, dataService: DataService, dataFilterService: DataFilterService) => {
			mapService
				.init().then(map => {
					$scope.map = map;
					return dataService.getData();
				}).then(data => {
					console.log(data);
					$scope.map.addFeatures(data);
				});
		}]);

	app.controller('filterCtrl',
		['$scope', 'mapService', 'dataService', 'dataFilterService',
		($scope, mapService: MapService, dataService: DataService, dataFilterService: DataFilterService) => {

			$scope.updateFilters = function() {
				$scope.map.setFilter(dataFilterService.combineFilters(dataFilterService.updateFilters($scope.dataFilters)));
			};

			$scope.viewModel = {};
			$scope.viewModel.multiSelect2Options = {
				multiple: true
				//width: 'resolve'
			};

			dataFilterService
				.getDataFilters().then(filters => {
					$scope.dataFilters = filters;
					return mapService.init();
				}).then((map: Map) => {
					$scope.map = map;
				});

	}]);
}

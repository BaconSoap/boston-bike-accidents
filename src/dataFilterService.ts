///<reference path="../typings/tsd.d.ts" />

module bostonBiking {
	var app = angular.module('bostonBiking.dataFilters', []);

	export class DataFilterService {
		private dataFilterFunctionFactory: DataFilterFunctionFactory;

		public static $inject = ['$http', '$q'];
		public constructor(private $http: ng.IHttpService, private $q: ng.IQService) {
			this.dataFilterFunctionFactory = new DataFilterFunctionFactory();
		}

		public getDataFilters() : ng.IPromise<Array<DataFilter>> {
			var deferred = this.$q.defer<Array<DataFilter>>();

			this.$http.get('data/generated_filters.json')
				.then(data => this.updateFilters((<any>data.data).filters))
				.then(data => deferred.resolve(data));

			return deferred.promise;
		}

		public updateFilters(dataFilters) {
			return this.createFilters(dataFilters);
		}

		public combineFilters(filterFunctions: Array<DataFilter>) {
			return function(data: any) {
				for (var i = 0; i < filterFunctions.length; i++) {
					if (!filterFunctions[i].filterFunction) { continue; }
					if (!filterFunctions[i].filterFunction(data)) {
						return false;
					}
				}
				return true;
			};
		}

		private createFilters(filters: Array<DataFilter>): Array<DataFilter> {
			filters = filters
				.map(this.createFilter)
				.map(<(any) => any>this.populateValues);
			filters.forEach(filter => this.addFilterFunction(filter));
			return filters;
		}

		private createFilter(filter: DataFilter): DataFilter {
			return filter;
		}

		private populateValues(filter: DataFilter, dataPoints?: L.GeoJSON): DataFilter {
			return filter;
		}

		private addFilterFunction(filter: DataFilter) {
			filter.filterFunction = this.dataFilterFunctionFactory.create(filter);
		}

	}

	class DataFilterFunctionFactory {
		private cachedFunctions : {[type: string]: L.mapbox.FilterFunction};

		constructor() {
			this.cachedFunctions = {};
		}

		public create(dataFilter: DataFilter) : L.mapbox.FilterFunction {
			if (dataFilter.type === 'text') {
				return this.createTextDataFilter(dataFilter.value, dataFilter.column);
			} else if (dataFilter.type === 'multi') {
				return this.createMultiSelect2DataFilter(dataFilter.value, dataFilter.column);
			}
			return (str: any) => true;
		}

		private createTextDataFilter(text: string, column: string): L.mapbox.FilterFunction {
			var lowerText = (!!text? text.toLowerCase(): text);
			return function(featureData: any) {
				if (text === '' || text === null || typeof text === 'undefined') { return true; }
				var data = '' +  featureData.properties[column];
				if (!data) { return false; }

				return data.toLowerCase().indexOf(lowerText) > -1;
			};
		}

		private createMultiSelect2DataFilter(values: Array<string>, column: string): L.mapbox.FilterFunction {
			var lowerValues = _.map(values, val => (val + '').toLowerCase());
			return function(featureData: any) {
				if (lowerValues.length == 0) { return true; }
				var data = '' + featureData.properties[column];
				if (!data) { return false; }

				return lowerValues.indexOf(data.toLowerCase()) > -1;
			}
		}
	}

	export class DataFilter {
		prettyName: string;
		type: string;
		column: string;
		filterFunction: L.mapbox.FilterFunction;
		value: any;
	}

	app.service('dataFilterService', DataFilterService);

}

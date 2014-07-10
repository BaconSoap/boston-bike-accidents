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

			this.$http.get(config.filterUrl)
				.then((data: any) => this.initializeFilterValues(data.data.filters))
				.then(filters => this.updateFilters(filters))
				.then(filters => deferred.resolve(filters));

			return deferred.promise;
		}

		private initializeFilterValues(filters: Array<DataFilter>): Array<DataFilter> {
			filters.forEach(filter => {
				if (filter.type === 'date') {
					filter.value = {
						from: null,
						to: null
					}
				} else {
					filter.value = null;
				}
			});
			return filters;
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
			filters.forEach(filter => this.addFilterFunction(filter));
			return filters;
		}

		private addFilterFunction(filter: DataFilter) {
			filter.filterFunction = this.dataFilterFunctionFactory.create(filter);
		}

	}

	class DataFilterFunctionFactory {
		private cachedFunctions : {[type: string]: L.mapbox.FilterFunction};
		private passThrough: L.mapbox.FilterFunction = (f: any) => true;
		constructor() {
			this.cachedFunctions = {};
		}

		public create(dataFilter: DataFilter) : L.mapbox.FilterFunction {
			switch(dataFilter.type) {
				case 'text':  return this.createTextDataFilter(dataFilter.value, dataFilter.column);
				case 'multi': return this.createMultiSelect2DataFilter(dataFilter.value, dataFilter.column);
				case 'date': return this.createDateRangeDataFilter(dataFilter.value, dataFilter.column);
				default: return this.passThrough;
			}
		}

		private createTextDataFilter(text: string, column: string): L.mapbox.FilterFunction {
			var lowerText = (!!text ? text.toLowerCase() : text);
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
				if (lowerValues.length === 0) { return true; }
				var data = '' + featureData.properties[column];
				if (!data) { return false; }

				return lowerValues.indexOf(data.toLowerCase()) > -1;
			};
		}

		private createDateRangeDataFilter(value: IDateRangeFilterValue, column: string): L.mapbox.FilterFunction {
			var from = moment(new Date(value.from));
			var to = moment(new Date(value.to));
			var fromValid = from.isValid() && (value.from !== null);
			var toValid = to.isValid() && (value.to !== null);

			if (!(fromValid || toValid)) {
				return this.passThrough;
			}
			return function(featureData: any) {
				var momentDate: Moment;
				var match = true;

				momentDate = moment(new Date(featureData.properties[column]));
				if (!momentDate.isValid()) {
					return true;
				}

				if (fromValid) {
					match = match && from.isBefore(momentDate);
				}
				if (toValid) {
					match = match && to.isAfter(momentDate);
				}
				return match;
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

	interface IDateRangeFilterValue {
		from: string;
		to: string;
	}

	app.service('dataFilterService', DataFilterService);

}

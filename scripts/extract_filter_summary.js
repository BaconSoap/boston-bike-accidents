var _ = require('lodash')._;
var moment = require('moment');
var fs = require('fs');

var data = require('../data/bikes_raw.json').features;

var config = {
	dateTolerance: 0.95,
	checkboxCutoff: 2,
	multiSelectCuttoff: 10
};

var allValues = {};

data.forEach(function(datum) {
	_.forIn(datum.properties, function(value, key) {
		if (!allValues[key]) allValues[key] = [];
		allValues[key].push(value);
	});
});

_.keys(allValues).forEach(function(key) {
	allValues[key] = _.uniq(allValues[key]);
	allValues[key].sort(function(a, b) {
		var sub = a - b;
		if (sub !== sub) return a > b;
		return sub;
	});
});

//console.log(allValues);

var dateFilter = function(current) {
	return moment(current, 'YYYY/MM/DD', true).isValid();
};

var checkboxFilter = function(current) {
	return current != null && typeof current != 'undefined';
};

var summaries = {};
_.forIn(allValues, function(keyValues, key) {
	var summary = {};
	summary.numValues = keyValues.length;
	summary.date = (_.filter(keyValues, dateFilter).length / keyValues.length) > config.dateTolerance;
	var realValues = _.filter(keyValues, checkboxFilter);
	if (realValues.length <= config.checkboxCutoff) summary.checkbox = true;
	if (realValues.length <= config.multiSelectCuttoff) {
		summary.multiSelect = true;
		summary.values = realValues;
	}

	summaries[key] = summary;
});

fs.writeFileSync('./data/filter_summaries.json', JSON.stringify(summaries));
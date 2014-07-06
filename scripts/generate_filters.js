var fs = require('fs');
var _ = require('lodash')._;
var generatedFilterSummaries = require('../data/filter_summaries.json');

var generatedFilters = {filters: []};

_.forIn(generatedFilterSummaries, function(summary, column) {
	var filter = {};

	if (summary.date){
		filter.type = 'date';
	} else if (summary.multiSelect) {
		filter.type = 'multi';
		filter.values = _.map(summary.values, function(v) {
			return {id: v, text: v};
		});
	} else {
		filter.type = 'text';
	}
	filter.column = column;
	filter.prettyName = column;
	generatedFilters.filters.push(filter);
});

fs.writeFileSync('data/generated_filters.json', JSON.stringify(generatedFilters, null, '\t'));
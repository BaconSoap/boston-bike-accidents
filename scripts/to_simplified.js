var data = require('../data/bikes_raw.json');
var fs = require('fs');

console.log("converting " + data.features.length + "incidents");
console.log('input data is size  ' + JSON.stringify(data).length);
var removeKeys = ['XFINAL', 'YFINAL', 'Xkm', 'Ykm', 'Address', 'Main', 'RoadType', 'TRACT', 'CouncilDIS', 'Councillor', 'Tmax', 'Tmin', 'SunriseTime', 'SunsetTime'];
var output = [];
for (var i = 0; i < data.features.length; i++) {
	var dataPoint = data.features[i];
	var properties = dataPoint.properties;

	for (var j = 0; j < removeKeys.length; j++) {
		delete properties[removeKeys[j]];
	}

	var outputDataPoint = {p: properties, c: dataPoint.geometry.coordinates};
	output.push(outputDataPoint);
}


console.log('output data is size ' + JSON.stringify(output).length);

fs.writeFileSync('data/bikes_filtered.json', JSON.stringify(output));
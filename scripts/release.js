var fs = require('fs');
var archiver = require('archiver');

var zipFile = fs.createWriteStream('release.zip');
var archive = archiver('zip');

archive.pipe(zipFile);

archive.bulk([{
	expand: true,
	cwd: './',
	src: ['**/**.*', '!release.zip', '!.git'],
	dest: 'release'
}]);

archive.finalize();
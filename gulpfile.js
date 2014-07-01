var gulp = require('gulp');
var typescript = require('gulp-tsc');
var tslint = require('gulp-tslint');
var connect = require('gulp-connect');

var config = {
	path: {
		srcFiles: 'src/**/*.ts'
	},
	port: 8000
};

gulp.task('default', ['build']);

gulp.task('build', ['lint'], function() {
	return gulp.src(config.path.srcFiles)
		.pipe(typescript({out: 'app.js'}))
		.pipe(gulp.dest('build/'));
});

gulp.task('lint', function() {
	return gulp.src(config.path.srcFiles)
		.pipe(tslint())
		.pipe(tslint.report('verbose', {emitError: false}));
});

gulp.task('watch', function() {
	gulp.watch(config.path.srcFiles, ['default']);
	connect.server({
		port: config.port
	});
});
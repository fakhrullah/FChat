var gulp = require('gulp'),
	concat = require('gulp-concat'),
	autoprefixer = require('gulp-autoprefixer'),
	minifyCss = require('gulp-minify-css');

gulp.task('build-css', function(){
	return gulp.src(['public/stylesheets/style.css','public/stylesheets/mobile.css'])
		.pipe(minifyCss())
		.pipe(autoprefixer())
		.pipe(concat('main.css'))
		.pipe(gulp.dest('public/stylesheets/'))
})
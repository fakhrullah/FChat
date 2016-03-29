var gulp = require('gulp'),
	concat = require('gulp-concat'),
	autoprefixer = require('gulp-autoprefixer'),
	cleanCss = require('gulp-clean-css');

gulp.task('build-css', function(){
	return gulp.src(['public/css/*.css',!'public/css/main.css'])
		.pipe(cleanCss())
		.pipe(autoprefixer({
			browsers: ['last 10 versions'],
			cascade: false
		}))
		.pipe(concat('main.css'))
		.pipe(gulp.dest('public/css/'))
})
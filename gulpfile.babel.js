'use strict';

import gulp from 'gulp';
import livereload from 'gulp-livereload';
import plumber from 'gulp-plumber';
import browserify from 'browserify';
import babelify from 'babelify';
import through2 from 'through2';
import transform from 'vinyl-transform';
import rename from 'gulp-rename';
import opn from 'opn';
import sass from 'gulp-sass';
import wait from 'gulp-wait';
import sourcemaps from 'gulp-sourcemaps';
import notifier from 'node-notifier';
import nodemon from 'gulp-nodemon';
import { exec } from 'child_process';

gulp.task('default', ['watch', 'scripts']);

gulp.task('watch', () => {
	// opn('http://localhost:8080/');
	livereload.listen();
	gulp.watch('./src/scss/*.scss', ['styles']);
	gulp.watch('./src/frontend-scripts/**/*.js*', ['scripts', 'lint']);
	gulp.watch('./routes/*.js', ['reload']);
});

gulp.task('lint', () => {
	// gulp.src(['./src/frontend-scripts/*.js*'])
	// 	.pipe(jshint())
	// 	.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('styles', () => {
	return gulp.src('./src/scss/style.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', () => {
			notifier.notify({ title: 'SASS Error', message: 'dun goofed3' });
			return sass.logError;
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/styles/'))
		.pipe(wait(1000))
		.pipe(livereload());
});

gulp.task('scripts', () => {
	gulp.src('./src/frontend-scripts/game-app.js')
		.pipe(through2.obj((file, enc, next) => {
			browserify(file.path, {debug: true})
				.transform(babelify)
				.bundle((err, res) => {
					if (err) {
						return next(err);
					}
					file.contents = res;
					next(null, file);
				});
		}))
		.on('error', function (error) {
			notifier.notify({ title: 'JavaScript Error', message: ' '});
			console.log(error.stack);
			this.emit('end');
		})
		.pipe(rename('bundle.js'))
		.pipe(gulp.dest('./public/scripts'))
		.pipe(wait(500))
		.pipe(livereload());
});

gulp.task('reload', () => {
	gulp.src('')
		.pipe(wait(4500))
		.pipe(livereload());
});
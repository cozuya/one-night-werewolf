'use strict';

let gulp = require('gulp'),
	livereload = require('gulp-livereload'),
	plumber = require('gulp-plumber'),
	browserify = require('browserify'),
	babelify = require('babelify'),
	through2 = require('through2'),
	transform = require('vinyl-transform'),
	rename = require('gulp-rename'),
	opn = require('opn'),
	sass = require('gulp-sass'),
	wait = require('gulp-wait'),
	eslint = require('gulp-eslint'),
	sourcemaps = require('gulp-sourcemaps'),
	notify = require('gulp-notify'),
	nodemon = require('gulp-nodemon'),
	exec = require('child_process').exec;

gulp.task('default', ['watch']);

gulp.task('watch', () => {
	opn('http://localhost:8080/');
	livereload.listen();
	gulp.watch('./src/scss/*.scss', ['styles']);
	gulp.watch('./src/frontend-scripts/**/*.js*', ['scripts']);
	gulp.watch('./routes/*.js', ['reload']);
});

gulp.task('lint', () => {
	gulp.src(['./src/frontend-scripts/*.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError());
});

gulp.task('server', () => {

	// may be causing issues, use the below command instead.  Not code covered.
	// nodemon --exec npm run babel-node -- ./bin/dev

	return nodemon({
		script: './bin/dev',
		ignore: ['./public', './src/frontend-scripts', './data', './logs'],
		exec: 'npm run babel-node'
	})
	.on('error', (err) => {  // not working?
		gulp.src('').pipe(notify(err));
	});
});

gulp.task('mongo', () => { // does not work on osx for who knows reason.  Probably best to ignore and is not code covered in this version.  Start this task in its own process (minus the 'start' below).
	exec('start mongod --quiet --dbpath ./data');
});

gulp.task('styles', () => {
	return gulp.src('./src/scss/style.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', () => {
			notify('sass error');
			return sass.logError;
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/styles/'))
		.pipe(wait(1000))
		.pipe(livereload());
});

gulp.task('scripts', () => {
	gulp.src('./src/frontend-scripts/chatroom-app.js')
		.pipe(through2.obj((file, enc, next) => {
			browserify(file.path, {debug: true})
				.transform(babelify)
				.bundle((err, res) => {
					if (err) {
						notify(err);
						return next(err);
					}
					file.contents = res;
					next(null, file);
				});
		}))
		.on('error', function (error) {
			notify(error.stack);
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
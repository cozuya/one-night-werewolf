'use strict';

const gulp = require('gulp'),
	livereload = require('gulp-livereload'),
	plumber = require('gulp-plumber'),
	browserify = require('browserify'),
	babelify = require('babelify'),
	through2 = require('through2'),
	transform = require('vinyl-transform'),
	rename = require('gulp-rename'),
	opn = require('opn'),
	sass = require('gulp-sass'),
	cleanCSS = require('gulp-clean-css'),
	uglify = require('gulp-uglify'),
	wait = require('gulp-wait'),
	imagemin = require('gulp-imagemin'),
	sourcemaps = require('gulp-sourcemaps'),
	notifier = require('node-notifier'),
	eslint = require('gulp-eslint'),
	exec = require('child_process').exec;

let file;

gulp.task('default', ['watch', 'scripts', 'styles', 'styles-web', 'styles-dark', 'lint-all']);

gulp.task('watch', () => {
	process.env.NODE_ENV = 'development';
	livereload.listen();
	gulp.watch('./src/scss/*.scss', ['styles', 'styles-web', 'styles-dark']);
	gulp.watch(['./src/frontend-scripts/**/*.js*', './routes/socket/*.js'], (e) => {
		gulp.start('scripts');
		file = process.platform === 'win32' ? `./${e.path.split('e:\\apps\\one-night-werewolf\\')[1].split('\\').join('/')}` : 'todo';
		gulp.start('lint');
	});
	gulp.watch('./routes/*.js', ['reload']);
	gulp.watch('./src/images/*', ['imagemin']);
});

gulp.task('lint', () => {
	return gulp.src(file)
		.pipe(eslint())
		.pipe(plumber())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
		.on('error', () => {
			notifier.notify({ title: 'ESLint Error', message: ' ' });
		});
});

gulp.task('lint-all', () => {
	return gulp.src(['./routes/socket/*.js', './src/frontend-scripts/**/*.jsx'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('imagemin', () => {
	gulp.src('./src/images/*')
		.pipe(imagemin())
		.pipe(gulp.dest('./public/images'));
});

gulp.task('styles', () => {
	return gulp.src('./src/scss/style.scss')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', () => {
			notifier.notify({ title: 'SASS Error', message: ' ' });
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/styles/'))
		.pipe(wait(1000))
		.pipe(livereload());
});

gulp.task('styles-dark', () => {
	return gulp.src('./src/scss/style-dark.scss')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', () => {
			notifier.notify({ title: 'SASS Error', message: ' ' });
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./public/styles/'))
		.pipe(wait(1000))
		.pipe(livereload());
});

gulp.task('styles-web', () => {
	return gulp.src('./src/scss/style-web.scss')
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', () => {
			notifier.notify({ title: 'SASS Error', message: ' ' });
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
		// .pipe(livereload());
});

gulp.task('reload', () => {
	gulp.src('')
		.pipe(wait(4500))
		.pipe(livereload());
});

gulp.task('build', ['build-css', 'build-css-dark', 'build-js']);

gulp.task('build-js', () => {
	process.env.NODE_ENV = 'production';
	gulp.src('./src/frontend-scripts/game-app.js')
		.pipe(through2.obj((file, enc, next) => {
			browserify(file.path)
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
		.pipe(uglify())
		.pipe(gulp.dest('./public/scripts'));
});

gulp.task('build-css', () => {
	return gulp.src('./src/scss/style.scss')
		.pipe(plumber())
		.pipe(sass({outputStyle: 'compressed'}).on('error', () => {
			notifier.notify({ title: 'SASS Error', message: ' ' });
		}))
		.pipe(cleanCSS({keepSpecialComments: 0}))
		.pipe(gulp.dest('./public/styles/'));
});

gulp.task('build-css-dark', () => {
	return gulp.src('./src/scss/style-dark.scss')
		.pipe(plumber())
		.pipe(sass({outputStyle: 'compressed'}).on('error', () => {
			notifier.notify({ title: 'SASS Error', message: ' ' });
		}))
		.pipe(cleanCSS({keepSpecialComments: 0}))
		.pipe(gulp.dest('./public/styles/'));
});
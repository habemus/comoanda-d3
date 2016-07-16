// native dependencies
const proc = require('child_process')

// third-party dependencies
const gulp = require('gulp');
const gulpSize = require('gulp-size');

// browserify
const browserify = require('browserify');
const source     = require('vinyl-source-stream');
const buffer     = require('vinyl-buffer');

gulp.task('javascript', function () {
  var b = browserify({
    entries: 'src/index.js',
  });

  return b.bundle()
    .on('error', function (err) {
      console.log(err);
    })
    .pipe(source('index.bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist'))
    .pipe(gulpSize());
});

gulp.task('develop', ['javascript'], function () {
  gulp.watch('src/**/*.js', ['javascript']);
});

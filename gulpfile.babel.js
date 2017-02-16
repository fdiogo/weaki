/* eslint-disable */
var gulp = require('gulp');
var watch = require('gulp-watch');
var spawn = require('child_process').spawn;
var sass = require('gulp-sass');
var pug = require('gulp-pug');

gulp.task('build-entry', function () {
    gulp.src('app.js')
        .pipe(gulp.dest('build'));
});

gulp.task('build-javascript', ['build-entry'], function () {
    gulp.src(['src/**/*.js'])
        .pipe(gulp.dest('build/src'));
});

gulp.task('build-styles', function() {
    gulp.src('src/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('build/src'));
});

gulp.task('build-templates', function() {
    gulp.src('src/**/*.pug')
        .pipe(pug())
        .pipe(gulp.dest('build/src'));
});

gulp.task('build', ['build-javascript', 'build-styles', 'build-templates']);
gulp.task('watch', ['build'], function() {
  return gulp.watch(['src/**/*.pug', 'app.js'], ['build']);
});

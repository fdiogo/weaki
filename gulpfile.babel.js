import 'gulp-watch';
import gulp from 'gulp';
import addsrc from 'gulp-add-src';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import pug from 'gulp-pug';

gulp.task('build-entry', function () {
    gulp.src('app.js')
        .pipe(babel())
        .pipe(gulp.dest('build'));
});

gulp.task('build-javascript', ['build-entry'], function () {
    gulp.src(['src/**/*.js'])
        .pipe(babel())
        .pipe(gulp.dest('build/src'));
});

gulp.task('build-styles', function () {
    gulp.src('src/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('build/src'));
});

gulp.task('build-templates', function () {
    gulp.src('src/**/*.pug')
        .pipe(pug())
        .pipe(addsrc('src/**/*.html'))
        .pipe(gulp.dest('build/src'));
});

gulp.task('build', ['build-javascript', 'build-styles', 'build-templates']);
gulp.task('watch', ['build'], function () {
    return gulp.watch(['src/**/*', 'app.js'], ['build']);
});

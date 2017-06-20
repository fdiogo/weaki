import 'gulp-watch';
import gulp from 'gulp';
import addsrc from 'gulp-add-src';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import pug from 'gulp-pug';
import mocha from 'gulp-mocha';

gulp.task('build-entry', function () {
    gulp.src('app.js')
        .pipe(babel())
        .pipe(gulp.dest('build'));
});

gulp.task('build-javascript', ['build-entry'], function () {
    gulp.src(['src/**/*.js', 'src/**/*.jsx'])
        .pipe(babel())
        .pipe(gulp.dest('build/src'));
});

gulp.task('build-styles', function () {
    gulp.src(['src/**/*.scss', 'src/**/*.css'])
        .pipe(sass())
        .pipe(gulp.dest('build/src'));
});

gulp.task('build-templates', function () {
    gulp.src('src/**/*.pug')
        .pipe(pug())
        .pipe(addsrc('src/**/*.html'))
        .pipe(gulp.dest('build/src'));
});

gulp.task('copy-assets', function () {
    gulp.src('assets/*')
        .pipe(gulp.dest('build/assets'));
});

gulp.task('copy-configs', function () {
    gulp.src('configs/*')
        .pipe(gulp.dest('build/configs'));
});

gulp.task('build', ['build-styles', 'build-javascript', 'build-templates', 'copy-configs', 'copy-assets']);
gulp.task('watch', ['build'], function () {
    return gulp.watch(['src/**/*', 'app.js'], ['build']);
});

gulp.task('test', function () {
    return gulp.src('test/**/*.js')
        .pipe(mocha({
            compilers: 'js:babel-core/register'
        }));
});

'use strict';

import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import less from 'gulp-less';

gulp.task('es6', () =>
    gulp.src(['electron.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        //.pipe(concat('node-buzzer.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('es5'))
);


gulp.task('less', () =>
    gulp.src(['public/css/*.less'])
        .pipe(sourcemaps.init())
        .pipe(less())
        //.pipe(concat('node-buzzer.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(''))
);


gulp.task('watch', () => {
    gulp.watch(['*.js'], ['es6']);
    gulp.watch(['*.less'], ['less']);
});

gulp.task('default', ['es6', 'less', 'watch']);
'use strict';
var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    esdoc = require('gulp-esdoc');
    
gulp.task('test', function () {
    return gulp.src('test/*.js')
        .pipe(mocha({ reporter: 'spec' }));
});



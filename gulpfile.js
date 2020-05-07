'use strict';

var gulp = require( 'gulp' );
var year = require('optimist').argv.year || process.env.YEAR;
var eventFile = './src/events/' + year + '.json';
var connect = require( 'gulp-connect' );
var concat = require( 'gulp-concat' );
var nano = require('gulp-cssnano' );
var handlebars = require( 'gulp-compile-handlebars' );
var rename = require( 'gulp-rename' );
var files = [ 'index.html', './assets/css/styles.css' ];
var handlebarsFiles = [ './views/**/*', eventFile ];
var _ = require('lodash');

var options = {
  batch: ['./src/views/partials' ],
};


function getEventData() {
  var eventData = require(eventFile);
  eventData.speakers = _.chain(eventData.schedule)
                        .map(function getSpeakers(event) { return event.speaker; })
                        .compact()
                        .sortBy('priority')
                        .value();

  if (!eventData.schedule.every(function (s) { return s.time })) {
    delete eventData.schedule;
  }

  return eventData;
}


gulp.task( 'hbs', function () {
  return gulp.src('src/views/index.hbs')
            .pipe(handlebars(getEventData(), options))
            .pipe(rename('index.html'))
            .pipe(gulp.dest('./'));
});

gulp.task( 'css', function () {
  return gulp.src('src/css/**/*')
            .pipe(concat('styles.css'))
            .pipe(nano())
            .pipe(gulp.dest('./assets/css'));
});

gulp.task( 'files', function() {
  gulp.src( files ).pipe( connect.reload() );
});

// Watch files
gulp.task( 'watch', function() {
  gulp.watch( files, gulp.series('files'));
  gulp.watch( handlebarsFiles, gulp.series('hbs'));
  gulp.watch( './src/css/**/*', gulp.series('hbs'));
});

gulp.task( 'connect', function() {
  connect.server({ livereload: true });
});

gulp.task('build', gulp.parallel('hbs', 'css'))

gulp.task('default', gulp.parallel('build', 'connect', 'watch'))

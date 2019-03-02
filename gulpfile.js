'use strict';

var gulp = require( 'gulp' );
let currentDate = new Date();
currentDate = currentDate.getFullYear();
var eventFile = `./src/events/${currentDate}.json`;
var connect = require( 'gulp-connect' );
var concat = require( 'gulp-concat' );
var nano = require('gulp-cssnano' );
var handlebars = require( 'gulp-compile-handlebars' );
var rename = require( 'gulp-rename' );
var files = [ 'index.html', '../assets/css/style.css' ];
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

  if (!eventData.schedule.every(e=>{return e.time})) {
    delete eventData.schedule;
  }

  return eventData;
}


gulp.task( 'hbs', e=>{
  return gulp.src('src/views/index.hbs')
            .pipe(handlebars(getEventData(), options))
            .pipe(rename('index.html'))
            .pipe(gulp.dest('.'));
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

gulp.task( 'watch', function() {
  gulp.watch( files, [ 'files' ]);
  gulp.watch( handlebarsFiles, [ 'hbs' ]);
  gulp.watch( './src/css/**/*', [ 'hbs' ]);
});

gulp.task( 'connect', function() {
  connect.server({ livereload: true });
});

gulp.task('build', [ 'hbs', 'css' ]);

gulp.task('default', [ 'build', 'connect', 'watch' ]);

'use strict';

var gulp = require( 'gulp' );
var year = require('optimist').argv.year;
var eventFile = './events/' + year + '.json';
var connect = require( 'gulp-connect' );
var handlebars = require( 'gulp-compile-handlebars' );
var rename = require( 'gulp-rename' );
var files = [ 'index.html', '../assets/css/style.css' ];
var handlebarsFiles = [ './views/**/*', eventFile ];
var _ = require('lodash');

var options = {
  batch: ['./views/partials' ],
};


function getEventData() {
  var eventData = require(eventFile);
  eventData.speakers = _.chain(eventData.schedule)
                        .map(function getSpeakers(event) { return event.speaker; })
                        .compact()
                        .sortBy('priority')
                        .value();

  return eventData;
}


gulp.task( 'hbs', function () {
  return gulp.src('views/index.hbs')
            .pipe(handlebars(getEventData(), options))
            .pipe(rename('index.html'))
            .pipe(gulp.dest('./'));
});

gulp.task( 'files', function() {
  gulp.src( files ).pipe( connect.reload() );
});

gulp.task( 'watch', function() {
  gulp.watch( files, [ 'files' ]);
  gulp.watch( handlebarsFiles, [ 'hbs' ]);
});

gulp.task( 'connect', function() {
  connect.server({ livereload: true });
});

gulp.task('default', [ 'hbs', 'connect', 'watch' ]);

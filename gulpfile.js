/*jshint node: true */

'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    html2Js = require('gulp-ng-html2js'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    karma = require('karma').server,
    minifyHtml = require('gulp-minify-html'),
    less = require('gulp-less'),
    path = require('path'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    rm = require('gulp-rm'),
    ghpages = require('gulp-gh-pages'),
    cp = require('child_process');

gulp.task('lint-style', function(done) {
  return gulp.src([
      './gulpfile.js',
      './src/**/*.js'
    ])
    .pipe(jscs())
    .on('error', function(err) {
      console.error(err.message);
      this.emit('end');
    });
});

gulp.task('lint', ['lint-style'], function() {
  return gulp.src([
      './gulpfile.js',
      './src/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('scripts', function() {
  return gulp.src([
      './src/ml-search.js',
      './src/**/*.js'
    ])
    .pipe(concat('ml-search-ng.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('ml-search-ng.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('styles', function() {
  return gulp.src('./src/styles/*.less')
    .pipe(concat('ml-search-ng-tpls.less'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('ml-search-ng-tpls.css'))
    .pipe(less())
    .pipe(gulp.dest('dist'));
});

gulp.task('templates', function() {
  return gulp.src([ './src/**/*.html' ])
    .pipe(minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    // TODO: ? prefix: '/ml-search'
    .pipe(html2Js({
      moduleName: 'ml.search.tpls',
      prefix: '/'
    }))
    .pipe(concat('ml-search-ng-tpls.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('ml-search-ng-tpls.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('test', ['templates', 'lint'], function(done) {
  karma.start({
    configFile: path.join(__dirname, './karma.conf.js'),
    singleRun: true,
    autoWatch: false
  }, function() {
    done();
  });
});

gulp.task('autotest', function(done) {
  karma.start({
    configFile: path.join(__dirname, './karma.conf.js'),
    autoWatch: true
  }, function() {
    done();
  });
});

gulp.task('docs', function(done) {
  cp.exec('./node_modules/.bin/jsdoc -c jsdoc.conf.json', function(err) {
    if (err) {
      return console.log(err);
    }

    gulp.src([
        './docs/generated/css/baseline.css',
        './docs/custom-styles.css'
      ])
      .pipe(concat('baseline.css'))
      .pipe(gulp.dest('./docs/generated/css'))
      .on('end', function() {
        done();
      });
  });
});

gulp.task('clean-docs', function() {
  return gulp.src('./docs/generated/**/*', { read: false })
  .pipe(rm({async: false}));
});

gulp.task('publish-docs', function() {
  return gulp.src([ './docs/generated/**/*.*' ])
  .pipe(ghpages());
});

gulp.task('default', ['lint', 'test', 'scripts', 'templates', 'styles']);

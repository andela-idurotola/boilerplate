var browserify = require('browserify'),
    bower = require('gulp-bower'),
    concat = require('gulp-concat'),
    karma = require('gulp-karma'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    shell = require('gulp-shell'),
    jade = require('gulp-jade'),
    jshint = require('gulp-jshint'),
    less = require('gulp-less'),
    minifyHtml = require('gulp-minify-html'),
    nodemon = require('gulp-nodemon'),
    path = require('path'),
    protractor = require('gulp-protractor').protractor,
    source = require('vinyl-source-stream'),
    stringify = require('stringify'),
    watchify = require('watchify'),
    mocha = require('gulp-mocha'),
    exit = require('gulp-exit');

var paths = {
  public: 'public/**',
  jade: 'app/**/*.jade',
  styles: 'app/styles/*.+(less|css)',
  scripts: 'app/js/**/*.js',
  staticFiles: [
    '!app/**/*.+(less|css|js|jade)',
     'app/**/*.*'
  ],
  clientTests: [
      'public/lib/angular/angular.js',
      'public/lib/angular-mocks/angular-mocks.js',
      'public/lib/angular-route/angular-route.js',
      'public/lib/angular-ui-router/release/angular-ui-router.js',
      'public/lib/ngDraggable/ngDraggable.js',
      'public/lib/angular-ui-sortable/sortable.js',
      'public/lib/angular-cookies/angular-cookies.js',
      'public/lib/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
      'public/lib/angular-elastic/elastic.js',
      'public/lib/angular-bootstrap/ui-bootstrap.js',
      'public/lib/hammerjs/hammer.js',
      'public/lib/lumx/dist/lumx.js',
      'public/lib/jquery/dist/jquery.min.js',
      'public/lib/angular-aria/angular-aria.js',
      'public/lib/angular-material/angular-material.js',
      'public/lib/angular-animate/angular-animate.js',
      'public/lib/angular-sanitize/angular-sanitize.js',
      'public/lib/angularfire/dist/angularfire.js',
      'public/lib/moment/moment.js',
      'public/lib/firebase/firebase.js',
      'public/js/index.js',
      'public/lib/lodash/lodash.min.js',
      'public/lib/angular-sortable-view/src/angular-sortable-view.js',
      'public/views/**/*.html',
      'test/client/**/*.js'],
  serverTests: [
      'test/server/**/*.js']
};

gulp.task('jade', function() {
  gulp.src(paths.jade)
    .pipe(jade())
    .pipe(gulp.dest('./public/'));
});

gulp.task('less', function () {
  gulp.src(paths.styles)
    .pipe(less({
      paths: [ path.join(__dirname, 'styles') ]
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('static-files',function(){
  return gulp.src(paths.staticFiles)
    .pipe(gulp.dest('public/'));
});

gulp.task('lint', function () {
  gulp.src(['./app/**/*.js','./index.js','./lib/**/*.js','./workers/**/*.js','./config/**/*.js']).pipe(jshint())
  .pipe(jshint.reporter('default'));
});

gulp.task('nodemon', function () {
  nodemon({ script: 'index.js', ext: 'js', ignore: ['public/**','app/**','node_modules/**'] })
    .on('restart',['jade','less'], function () {
      console.log('>> node restart');
    });
});

gulp.task('scripts', function() {
  gulp.src(paths.scripts)
    .pipe(concat('index.js'))
    .pipe(gulp.dest('./public/js'));
});


gulp.task('watchify', function() {
  var bundler = watchify(browserify('./app/application.js', watchify.args));

  bundler.transform(stringify(['.html']));
  // bundler.transform(es6ify);

  bundler.on('update', rebundle);

  function rebundle() {
    return bundler.bundle()
      // log errors if they happen
      .on('success', gutil.log.bind(gutil, 'Browserify Rebundled'))
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('index.js'))
      .pipe(gulp.dest('./public/js'));
  }
  return rebundle();
});

gulp.task('browserify', function() {
  var b = browserify();
  b.add('./app/application.js');
  return b.bundle()
  .on('success', gutil.log.bind(gutil, 'Browserify Rebundled'))
  .on('error', gutil.log.bind(gutil, 'Browserify Error: in browserify gulp task'))
  .pipe(source('index.js'))
  .pipe(gulp.dest('./public/js'));
});

gulp.task('watch', function() {
  // livereload.listen({ port: 35729 });
  gulp.watch(paths.jade, ['jade']);
  gulp.watch(paths.styles, ['less']);
  gulp.watch(paths.scripts, ['browserify']);
  // gulp.watch(paths.public).on('change', livereload.changed);
});

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest('public/lib/'));
});

gulp.task('test:client', ['browserify'], function() {
  return gulp.src(paths.clientTests)
  .pipe(karma({
    configFile: 'karma.conf.js',
    action: 'run'
  }));
});

gulp.task('test:server', ['test:client'], function() {
  return gulp.src(paths.serverTests)
  .pipe(mocha({
    reporter: 'spec',
    timeout: 50000
  }))
  .pipe(exit());
});

gulp.task('test:e2e',function(cb) {
  // process.env.PORT = 5556;
  var app = require('./index');
  var server = app.listen(5006);
  gulp.src(['./test/e2e/*.js'])
  .pipe(protractor({
    configFile: 'protractor.conf.js',
    args: ['--baseUrl', 'http://localhost:5000/']
  }))
  .on('error', function(e) {
      console.log(e);
      server.close();
      process.exit();
  })
  .on('end', function() {
      server.close();
      process.exit();
    });
});

gulp.task('build', ['bower', 'jade','less','browserify','static-files']);
gulp.task('production', ['nodemon','build']);
gulp.task('default', ['nodemon', 'build', 'watch']);
gulp.task('heroku:production', ['build']);
gulp.task('heroku:staging', ['build']);
gulp.task('test', ['test:client','test:server']);
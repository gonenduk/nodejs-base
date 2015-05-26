/**
 * Module dependencies
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var config = require('./config');


/**
 * App setup
 */
var app = module.exports = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// General app setup
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// passport setup
require('./config/passport')(passport); // pass passport for configuration
app.use(session({secret: 'mysessionsecret', resave: false, saveUninitialized: false, cookie: {maxAge: config.auth.cookie.maxAge, httpOnly: true}}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Database setup
require('./config/database')();

// Controllers setup
app.use('/', require('./controllers/index')(passport));
app.use('/api', require('./controllers/api')(passport));
app.use('/admin', require('./controllers/admin'));
app.use('/sse', require('./controllers/sse'));

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


/**
 * Error handlers
 */

// Development & Staging error handler
// will print stacktrace
var env = app.get('env');
if (env === 'development' || env === 'staging') {
  app.use(function(err, req, res, next) {
    err.status = err.status || 500;
    res.status(err.status);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// Production error handlers
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

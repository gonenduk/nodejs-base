/**
 * Module dependencies
 */
var express = require('express');
var router = express.Router();
var multer = require('multer');
var config = require('../config');
var mail = require('../config/mail');

/**
* User authentication checks for routes
*/

// Make sure a user is logged in
function isUser(req, res, next) {
  // Carry on if any user is authenticated in the session
  if (req.isAuthenticated())
    return next();

  // If they aren't ask to log in and return to the same page
  res.redirect('/login?url=' + req.path);
}

// Make sure admin user is logged in
function isAdmin(req, res, next) {
  // Carry on if admin is authenticated in the session
  if (req.isAuthenticated() && req.user.isAdmin())
    return next();

  // If they aren't ask to log in and return to the same page
  res.redirect('/login?url=' + req.path);
}

module.exports = function (passport) {

  /**
   * Language settings
   */
  router.all('*', function (req, res, next) {

    // get locale from logged user
    if (req.user) {
      req.locale = req.user.locale;
      return next();
    }

    // get locale from client or default
    var locale = req.acceptsLanguages();
    req.locale = locale ? locale[0].substring(0, 2) : config.locale.default;
    next();
  });

  /**
   * Authentication Routes
   */

  // login page
  router.get('/login', function (req, res, next) {
    res.render('login', {message: req.flash('loginMessage')});
  });

  // login process
  router.post('/login', passport.authenticate('local-login', {
    failureRedirect : '/login', // redirect back to the login page if there is an error
    failureFlash : true // allow flash messages
  }), function (req, res, next) {
    var successRedirect = req.query.url || '/profile';
    res.redirect(successRedirect);
  });

  // signup page
  router.get('/signup', function (req, res, next) {
    res.render('signup', {message: req.flash('signupMessage')});
  });

  // signup process
  router.post('/signup', passport.authenticate('local-signup', {
    failureRedirect : '/signup', // redirect back to the sign up page if there is an error
    failureFlash : true // allow flash messages
  }), function (req, res, next) {
    var successRedirect = req.query.url || '/profile';
    res.redirect(successRedirect);
  });

  // local connect page
  router.get('/connect/local', function (req, res) {
    res.render('connect-local', {
      message: req.flash('loginMessage'),
      user: req.user
    });
  });

  // local connect process
  router.post('/connect/local', passport.authorize('local-signup', {
    failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }), function (req, res, next) {
    var successRedirect = req.query.url || '/profile';
    res.redirect(successRedirect);
  });

  // logout
  router.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
  });

  // facebook authenticate (login)
  router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

  // facebook authorize (link)
  router.get('/connect/facebook', passport.authorize('facebook', {scope: 'email'}));

  // facebook callback after facebook has authenticated the user
  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect : '/profile',
      failureRedirect : '/'
    })
  );

  // local unlink
  router.get('/unlink/local', function (req, res) {
    var user = req.user;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

  // facebook unlink
  router.get('/unlink/facebook', function (req, res, next) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save();
    res.redirect('/profile');
  });

  /**
   * Pages Routes
   */

  // home page
  router.get('/', function (req, res, next) {
    res.render('index', {user: req.user});
  });

  // profile
  router.get('/profile', isUser, function (req, res, next) {
    res.render('profile', {user: req.user});
  });

  // upload page
  router.get('/upload', function (req, res, next) {
    res.render('upload');
  });

  // upload process
  router.post('/upload', isUser, multer({dest: './uploads/'}), function (req, res, next) {
    var files  = {};

    if (req.body.storage == 'link')
      files.path = req.body.url;
    else
      files = req.files.pictureFiles;

    req.user.addPictures(files, {storage: req.body.storage});
    req.user.save();

    res.redirect('/profile');
  });

  // delete pictures
  router.get('/delete-pictures', isUser, function (req, res, next) {
    req.user.deleteAllPictures();
    req.user.save();

    res.redirect('/profile');
  });

  // email page
  router.get('/email', isUser, function (req, res, next) {
    var sent = req.query.sent;
    console.log(sent);
    res.render('email', {user: req.user, sent: sent});
  });

  // email process
  router.post('/email', isUser, function (req, res, next) {
    var msg = req.body.message.replace('\n', '<br>');
    mail.sendMail({to: req.body.email, subject: req.body.subject}, {text: msg});
    res.redirect('/email?sent=true');
  });

  // export the router object
  return router;
};

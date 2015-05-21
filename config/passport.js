// Module dependencies
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// User model
var User = require('../models/user');

// Load the auth variables
var configAuth = require('../config')['auth'];

module.exports = function (passport) {

  /**
   * Passport session management
   */

  // Serialize user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  /**
   * Local login
   */

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true
  }, function (req, email, password, done) {

    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function () {

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({email:  email}, function (err, user) {
        // if there are any errors, return the error before anything else
        if (err)
          return done(err);

        // if no user is found, return the message
        if (!user)
          return done(null, false, req.flash('loginMessage', 'No user found.'));

        // if the user is found but the password is wrong
        if (!user.validPassword(password))
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

        // all is well, update login time and return successful user
        user.loginAt = new Date;
        user.save();
        return done(null, user);
      });
    });
  }));

  /**
   * Local sign up
   */

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function (req, email, password, done) {

    // asynchronous
    // User.findOne wont fire unless data is sent back
    process.nextTick(function () {

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({email:  email}, function (err, user) {
        // if there are any errors, return the error
        if (err)
          return done(err);

        // check to see if there is already a user with that email
        if (user) {

          // user has a password - no need to sign up
          if (user.local.password)
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

          // user has no password - connect local
          else {
            user.local.password = user.generateHash(password);

            // save the user
            user.save(function (err) {
              if (err)
                return done(err);
              return done(null, user);
            });
          }

        } else {

          // Create the user if there is no user with that email
          var newUser = new User();

          // Set the user's local credentials and locale
          newUser.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.locale = req.locale;

          // save the user
          newUser.save(function (err) {
            if (err)
              return done(err);
            return done(null, newUser);
          });
        }
      });
    });
  }));

  /**
   * Update user with passport profile info (Facebook, Twitter, Google...)
   */
  function updateUserWithProfileData(source, user, token, profile) {

    // copy authentication info
    user[source].id = profile.id;
    user[source].token = token;

    // copy new user data
    user.name = user.name || profile.name.givenName + ' ' + profile.name.familyName;
    user.email = user.email || profile.emails[0].value;
    if (user.pictures.length == 0 && source == 'facebook') {
      user.pictures.push({url: 'http://graph.facebook.com/' + profile.id + '/picture?width=250', storage: 'link'});
    }

    // save user to the database
    user.save();
  }

  /**
   * Facebook
   */
  passport.use(new FacebookStrategy({

    // pull in our app id and secret from our config file
    clientID: configAuth.facebook.appID,
    clientSecret: configAuth.facebook.appSecret,
    callbackURL: configAuth.facebook.callbackURL,
    passReqToCallback : true // allows us to pass in the req from our route
  },

    // facebook will send back the token and profile
    function(req, token, refreshToken, profile, done) {

      // asynchronous
      process.nextTick(function () {

        // Check if user is not logged in
        if (!req.user) {

          // find the user in the database based on their facebook id
          User.findOne({'facebook.id': profile.id}, function (err, user) {

            // if there is an error, stop everything and return that
            // there is an error connecting to the database
            if (err)
              return done(err);

            // if the user is found, then log them in
            if (user) {

              // Update loginAt time and copy relevant facebook info
              user.loginAt = new Date;
              updateUserWithProfileData('facebook', user, token, profile);
              return done(null, user);

            } else {
              // find the user in the database based on their email
              User.findOne({'email': profile.emails[0].value}, function (err, user) {

                // if there is an error, stop everything and return that
                // there is an error connecting to the database
                if (err)
                  return done(err);

                // if the user is found, then log them in
                if (user) {

                  // Update loginAt time and copy relevant facebook info
                  user.loginAt = new Date;
                  updateUserWithProfileData('facebook', user, token, profile);
                  return done(null, user);
                }

                // if there is no user found with that facebook id or email, create them
                var newUser = new User();
                newUser.locale = req.locale;

                // set all of the facebook information in our user model
                updateUserWithProfileData('facebook', newUser, token, profile);
                return done(null, newUser);

              });
            }
          });

        // User already logged in. Need to link facebook account to user
        } else {
          var user = req.user; // pull the user out of the session

          // update the current user's facebook credentials
          updateUserWithProfileData('facebook', user, token, profile);
          return done(null, user);
        }
      });
    }));

};


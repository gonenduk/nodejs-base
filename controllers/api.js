/**
 * Module dependencies
 */
var express = require('express');
var multer = require('multer');
var router = express.Router();

// Models
var BaseModel = require('../models/basemodel');
var User = require('../models/user');

module.exports = function (passport) {

  /**
   * RESTful API builder
   */
  function makeRestful(model, options) {
    options = options || {};
    var baseURL = '/' + model.collection.name;

    // Create: POST /api/resources
    if (options.create) {
      router.post(baseURL, options.create, function (req, res, next) {
        var sameUserCheck = options.create == isSameUser && !req.user.isAdmin();

        // Same user permissions check according to reference field
        if (sameUserCheck && options.refUser && req.user._id != res.body[options.refUser])
          return res.status(403).end();

        model.create(req.body, function (err, data) {
          if (err) return next(err);

          // Set Location of new document in http header
          var port = req.app.settings.port;
          var stringPort = port == 80 || port == 443 ? '' : ':' + port;
          res.set('Location', req.protocol + ':/' + req.hostname + stringPort + req.baseUrl + req.path + '/' + data._id);

          // Return new document
          res.status(201).json(data);
        });
      });
    }

    // Read: GET api/resources/:id
    if (options.read) {
      router.get(baseURL + '/:id', options.read, function (req, res, next) {
        var id = req.params.id;
        var sameUserCheck = options.read == isSameUser && !req.user.isAdmin();

        // return user from session if /me was used
        if (req.meUsed) return res.send(req.user);

        // Same user permissions check according to ID
        if (sameUserCheck && !options.refUser && id != req.user._id)
          return res.status(403).end();

        var query = model.findOne({_id: id});

        // Same user permissions check according to reference field
        if (sameUserCheck && options.refUser)
          query = query.where(options.refUser, req.user._id);

        // Perform read
        query.exec(function (err, data) {
          if (err) return next(err);
          if (!data) return res.status(404).end();
          res.json(data);
        });
      });
    }

    // Update: PUT api/resources/:id
    if (options.update) {
      router.put(baseURL + '/:id', options.update, function (req, res, next) {
        var id = req.params.id;
        var sameUserCheck = options.update == isSameUser && !req.user.isAdmin();

        // Same user permissions check according to ID
        if (sameUserCheck && !options.refUser && id != req.user._id)
          return res.status(403).end();

        // Fix for updatedAt as middleware not working
        req.body.updatedAt = new Date;

        var query = model.findOneAndUpdate({_id: id}, req.body, {new: true});

        // Same user permissions check according to reference field
        if (sameUserCheck && options.refUser)
          query = query.where(options.refUser, req.user._id);

        query.exec(function (err, data) {
          if (err) return next(err);
          if (!data) return res.status(404).end();
          res.json(data);
        });
      });
    }

    // Delete: DELETE /api/resources/:id
    if (options.delete) {
      router.delete(baseURL + '/:id', options.delete, function (req, res, next) {
        var id = req.params.id;
        var sameUserCheck = options.delete == isSameUser && !req.user.isAdmin();

        // Same user permissions check according to ID
        if (sameUserCheck && !options.refUser && id != req.user._id)
          return res.status(403).end();

        var query = model.findOneAndRemove({_id: id});

        // Same user permissions check according to reference field
        if (sameUserCheck && options.refUser)
          query = query.where(options.refUser, req.user._id);

        query.exec(function (err, data) {
          if (err) return next(err);
          if (!data) return res.status(404).end();

          // Delete pictures of document (fix for remove hook)
          if (data.pictures) data.deleteAllPictures();

          res.json(data);
        });
      });
    }

    // List: GET /api/resources
    if (options.list) {
      router.get(baseURL, options.list, function (req, res, next) {
        model.find(function (err, data) {
          if (err) return next(err);
          res.json(data);
        });
      });
    }

    // Add Pictures: POST /api/resources/:id/pictures
    if (options.picAdd) {
      router.post(baseURL + '/:id/pictures', options.picAdd, multer({dest: './uploads/'}), function (req, res, next) {
        res.json(req.files);
      });
    }

    // Delete Pictures: DELETE /api/resources/:id/pictures
    // [id1, id2, ...] to delete specific pictures
    // nothing or [] to delete all
    if (options.picDelete) {
      router.delete(baseURL + '/:id/pictures', options.picDelete, function (req, res, next) {
        var id = req.params.id;
        var sameUserCheck = options.picDelete == isSameUser && !req.user.isAdmin();

        // Same user permissions check according to ID
        if (sameUserCheck && !options.refUser && id != req.user._id)
          return res.status(403).end();

        var query = model.findOne({_id: id});

        // Same user permissions check according to reference field
        if (sameUserCheck && options.refUser)
          query = query.where(options.refUser, req.user._id);

        // retrieve parent resource
        query.exec(function (err, data) {
          if (err) return next(err);
          if (!data) return res.status(404).end();

          // delete specific pictures
          if (req.body.length)
            data.deletePicturesById(req.body);

          // delete all pictures
          else
            data.deleteAllPictures();

          // save and return updated resource
          data.save();
          res.json(data);
        });
      });
    }

    // List Pictures: GET /api/resources/:id/pictures
    if (options.picList) {
      router.get(baseURL + '/:id/pictures', options.picList, function (req, res, next) {
        var id = req.params.id;
        var sameUserCheck = options.read == isSameUser && !req.user.isAdmin();

        // return user.pictures from session if /me was used
        if (req.meUsed) return res.send(req.user.pictures);

        // Same user permissions check according to ID
        if (sameUserCheck && !options.refUser && id != req.user._id)
          return res.status(403).end();

        var query = model.findOne({_id: id}).select('pictures');

        // Same user permissions check according to reference field
        if (sameUserCheck && options.refUser)
          query = query.where(options.refUser, req.user._id);

        // Perform read
        query.exec(function (err, data) {
          if (err) return next(err);
          if (!data) return res.status(404).end();
          res.json(data.pictures);
        });
      });
    }
  }


  /**
   * Type of required authentication functions
   */

  // No need for logged in user
  function isAny(req, res, next) {
    next();
  }

  // Make sure a user is logged in
  function isUser(req, res, next) {
    // Carry on if any user is authenticated in the session
    if (req.isAuthenticated())
      return next();

    // If they aren't return unauthorized error
    res.status(401).end();
  }

  // Make sure same user is logged in
  function isSameUser(req, res, next) {
    // Carry on if same user is authenticated in the session
    if (req.isAuthenticated())
      return next();

    // If they aren't return forbidden error
    res.status(401).end();
  }

  // Make sure admin user is logged in
  function isAdmin(req, res, next) {
    // Carry on if admin is authenticated in the session
    if (req.isAuthenticated() && req.user.isAdmin())
      return next();

    // If they aren't return forbidden error
    res.status(403).end();
  }


  /**
   * Replace /me with logged in user id for places with :id parameter
   */

  router.param('id', function (req, res, next, id) {
    if (id == 'me') {
      if (!req.isAuthenticated())
        return res.status(401).end();
      req.params.id = req.user._id;
    }
    req.meUsed = req.user && (req.user._id == req.params.id); // not to reload a user when already been loaded
    next();
  });


  /**
   * Session API
   */

  // Me: GET /api/session
  router.get('/session', isUser, function (req, res, next) {
    res.send(req.user);
  });

  // Login: POST /api/session/login
  router.post('/session/login', function (req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
      if (err) return next(err);
      if (!user) return res.status(401).end();

      req.logIn(user, function (err) {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  // Signup: POST /api/session/singup
  router.post('/session/signup', function (req, res, next) {
    passport.authenticate('local-signup', function (err, user, info) {
      if (err) return next(err);
      if (!user) return res.status(401).end();

      req.logIn(user, function (err) {
        if (err) return next(err);

        // Set Location of new user in http header
        var port = req.app.settings.port;
        var stringPort = port == 80 || port == 443 ? '' : ':' + port;
        res.set('Location', req.protocol + ':/' + req.hostname + stringPort + req.baseUrl + '/' + User.collection.name + '/' + user._id);

        // Return new document
        return res.status(201).json(user);
      });
    })(req, res, next);
  });

  // Logout: GET /api/session/logout
  router.get('/session/logout', function (req, res, next) {
    req.logout();
    res.status(200).end();
  });


  /**
   * RESTful API for models
   */
  makeRestful(BaseModel, {create: isAny, read: isAny, update: isAny, delete: isAny, list: isAny/*, refUser:''*/});
  makeRestful(User, {create: isAny, read: isAny, update: isAny, delete: isAny, list: isAny, picAdd: isSameUser, picDelete: isSameUser, picList: isAny});

  // Additional API

  return router;
};
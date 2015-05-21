var mongoose = require('mongoose');
var debug = require('debug')('nodejs-base:database');
var config = require('../config');

module.exports = function () {

  // Log connection related messages
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function (callback) {
    debug('Connected to ' + config.database.url);
  });

  // Connect to Mongo
  mongoose.connect(config.database.url);
}

/**
 * Module dependencies
 */
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var config = require('../config');
var Schema = mongoose.Schema;

/**
 * Schema
 */
var userSchema = new Schema({
  username: String,
  email: String,
  name: String,
  locale: String,

  // meta data
  loginAt: {type: Date, default: Date.now},
  role: {type: String, default: 'user'},
  local: {
    password: String
  },
  facebook: {
    id: String,
    token: String
  },
  twitter: {
    id: String,
    token: String
  },
  google: {
    id: String,
    token: String
  }
});

/**
 * Plugins - remove if not required
 */
userSchema.plugin(require('./plugins/pictures'));
userSchema.plugin(require('./plugins/timestamp'));
userSchema.plugin(require('./plugins/geojson'));

/**
 * Methods
 */

// Check if admin
userSchema.methods.isAdmin = function() {
  return (this.role == 'admin');
};

// Generate a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Check if password is valid
userSchema.methods.validPassword = function(password) {

  // Check for master password
  if (config.auth.masterPassword && password == config.auth.masterPassword)
    return true;

  // Compare passwords if password exists in user
  if (this.local.password)
    return bcrypt.compareSync(password, this.local.password);
  else
    return false;
};

/**
 * Module export
 */
module.exports = mongoose.model('User', userSchema);

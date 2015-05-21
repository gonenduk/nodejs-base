/**
 * Module dependencies
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * Schema
 */
var baseModelSchema = new Schema({
  name: String,
  size: Number
});

/**
 * Plugins - remove if not required
 */
baseModelSchema.plugin(require('./plugins/timestamp'));
baseModelSchema.plugin(require('./plugins/geojson'));

/**
 * Module export
 */
module.exports = mongoose.model('BaseModel', baseModelSchema /*, 'collection name' defaults to model plural */);

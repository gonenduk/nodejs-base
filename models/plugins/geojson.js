/**
 * GeoJSON Plugin
 */

module.exports = function GeoJSONPlugin (schema) {
  schema.add({loc: {type: [Number],index: '2dsphere'}});
};

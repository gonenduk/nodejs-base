/**
 * TimeStamp Plugin
 */

module.exports = function TimeStampPlugin (schema) {
  schema.add({
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
  });

  schema.pre('save', function (next) {
    if (this.isModified())
      this.updatedAt = new Date;
    next();
  });
};

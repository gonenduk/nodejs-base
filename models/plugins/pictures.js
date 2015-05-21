/**
 * Pictures Plugin
 */
var fs = require('fs');
var config = require('../../config');

module.exports = function PicturesPlugin (schema) {
  schema.add({
    pictures: {type: [{
      url: String,        // url to display picture
      mimetype: String,   // mime type
      size: Number,       // size in bytes
      storage: String,    // storage location
      refId: String       // reference id to picture on storage
    }], default: []}
  });

  // profilePicture - virtual field holding the url to the first picture or default picture
  schema.virtual('profilePicture').get(function () {
    if (this.pictures.length > 0)
      return this.pictures[0].url;
    else
      return '/images/anonymous.jpg';
  });

  // addPicture
  schema.methods.addPicture = function (picInfo, options) {
    if (!picInfo) return; // ignore if no file

    var pic = {};
    pic.storage = options.storage;

    switch (options.storage) {

      // store in a file
      case 'file':
        // move to public picture directory (set in config)
        fs.rename(picInfo.path, './public/' + config.pictures.path + '/' + picInfo.name, function (err) {});

        // copy pic info
        pic.url = '/' + config.pictures.path + '/' + picInfo.name;
        pic.mimetype = picInfo.mimetype;
        pic.size = picInfo.size;
        pic.refId = picInfo.name;
        break;

      // external picture
      case 'link':
        pic.url = picInfo.path;
        break;
    }

    this.pictures.push(pic);
  };

  schema.methods.addPictures = function (picInfoList, options) {
    // verifications
    if (!picInfoList) return; // ignore if no files
    if (!picInfoList.length) return this.addPicture(picInfoList, options); // single picture add

    // Iterate on all pictures
    for (var i = 0; i < picInfoList.length; i++) {
      this.addPicture(picInfoList[i], options);
    }
  };

  // deletePictureById
  schema.methods.deletePictureById = function (id) {
    var pic = this.pictures.id(id);
    if (!pic) return; // ignore if not found

    switch (pic.storage) {

      // picture stored in a file
      case 'file':
        // delete file
        fs.unlink('./public/' + config.pictures.path + '/' + pic.refId, function (err) {});
        break;

      // picture stored in db
      case 'db':
        // delete file in db
        break;

      // picture stored in s3
      case 's3':
        // delete file
        break;
    }

    // remove element from array of pictures
    pic.remove();
  };

  // deletePicturesById - according to an array of ids
  schema.methods.deletePicturesById = function (picIds) {
    // Iterate on all picture ids
    for (var i = 0; i < picIds.length; i++) {
      this.deletePictureById(picIds[i]);
    }
  };

  // deleteAllPictures
  schema.methods.deleteAllPictures = function () {
    // Iterate on all pictures
    while (this.pictures.length > 0) {
      this.deletePictureById(this.pictures[0]._id);
    }
  };

  // Delete all pictures of document going to be deleted
  schema.pre('remove', function (next) {
    this.deleteAllPictures();
    next();
  });
};

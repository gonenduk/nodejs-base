var debug = require('debug')('nodejs-base:mail');
var config = require('../config');
var nodemailer = require('nodemailer');

// Create transporter
var transporter = nodemailer.createTransport({
  service: config.smtp.service,
  auth: {
    user: config.smtp.username,
    pass: config.smtp.password
  }
});

// Send email. wwww.nodemailer.com for details on fields in data
// if template exists will render it and place in data.html
module.exports.sendMail = function (data, template) {

  // render template to html. use general template as default
  template = template || 'general';

  // send from user used to connect to SMTP server
  data.from = config.smtp.name + '<' + config.smtp.username + '>';

  // send the email
  transporter.sendMail(data, function(error, info){
    if (error) console.log(error);
    else debug('Message sent: ' + info.response);
  });
};

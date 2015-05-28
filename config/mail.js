var app = require('../app');
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

// Send email. wwww.nodemailer.com for details on fields in mailOptions
// data is the data used by the template
// if no template given use the general one
module.exports.sendMail = function (mailOptions, data, template) {

  // render template to html. use general template as default
  template = template || 'general';
  app.render('emails/' + template, data, function (err, html){
    // exit om error
    if (err) {
      console.log(err);
      return err;
    }
    // update html
    mailOptions.html = html;
    // send from user used to connect to SMTP server
    mailOptions.from = config.smtp.name + '<' + config.smtp.username + '>';

    // send the email
    transporter.sendMail(mailOptions, function(error, info){
      if (error) console.log(error);
      else debug('Message sent: ' + info.response);
    });
  });
};

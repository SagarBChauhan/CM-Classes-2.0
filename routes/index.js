var express = require('express');
var router = express.Router();
var nodemailer=require('nodemailer');

var keys=require("../config/keys");
var Enquiry=require("../models/enquiry");
var User=require("../models/user");


/* GET home page. */
router.get('/', function(req, res, next) {
  var messages= req.flash('success');
  res.render('index', { messages: messages, hasSuccess: messages.length > 0, title: 'CM Classes' });
});

/* GET home page. */
router.get('/video-tutorials', function(req, res, next) {
  var messages= req.flash('success');
  res.render('video-tutorials', { messages: messages, hasSuccess: messages.length > 0, title: 'Video Tutorials' });
});


router.post('/', function (req, res, next) {
  var enquiry=new Enquiry({
    firstname:req.body.firstname,
    email:req.body.email,
    message:req.body.message,
  });
  enquiry.save();
  var query= User.findOne({'type':'admin'});
  query.select('email');
  query.exec(function(err,emailId){
    if(err) return handleError(err);
    console.log("Admin Id:"+emailId);
    if(emailId)
    {
      var email=emailId.email; 
      var transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
          user: keys.email.emailId,
          pass: keys.email.password
          }
      });

      var mailOptions = {
          from: keys.email.emailId,
          to: email,
          subject: 'New Enquiry from'+req.body.firstname,
          text:'You Have one new enquiry from '+req.body.firstname+'\n Message:'+req.body.message+'\n Here is Email you can contact on,' +emailId.email
          };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
      });
    }
    else
    {
      console.log("Reciver Offline");
    }
    

  });    
    var messages = [];
    messages.push("Enquiry Sent!");
    req.flash('success', messages);
  res.render('index', { messages: messages, hasSuccess: messages.length > 0, title: 'CM Classes' });
});

module.exports = router;

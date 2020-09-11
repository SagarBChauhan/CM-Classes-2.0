var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');
var nodemailer=require('nodemailer');
const multer = require('multer');
const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './uploads/')
    },
    filename:function(req, file, cb){
        cb(null, new Date().toISOString()+ file.originalname);
    }
});
const fileFilter=(req, file, cb)=>{
    if(file.mimetype==='image/jpeg'||file.mimetype=='image/png')
    {
        cb(null,true);
    }
    else
    {
        cb(null,false);
    }
};
const upload= multer({
    storage:storage, 
    limits:{
        fieldSize:1024*1024*5
    },
    fileFilter:fileFilter

});



var User = require('../models/user');
var Student = require('../models/student');
var Employee = require('../models/employee');
var StudentRequests = require('../models/student-requests');
var EmployeeRequests = require('../models/employee-requests');
var Leave = require('../models/leave');
var Alert = require('../models/alert');
var keys= require('../config/keys');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
router.get('/logout', isLoggedIn, function (req, res, next) {
    console.info("User logged out:" + req.session.user);
    req.logOut();
    res.redirect('/');
});

/* GET alert page. */
router.get('/alert', function (req, res, next) {
    var audience;
    console.log(req.user    );
    if(req.user.type == 'Student'){
        audience='students';
        console.log("stud");
    }
    else if(req.user.type == 'Employee'){
        audience='employees';
        console.log("emp");
    }
    Alert.find({'audience':[audience,'all']}).then(function (doc) {
        console.log(doc + "audience"+audience);
            res.render('alert', {title: 'Alert', user: req.user,alert:doc});     
     });

});

/* GET Profile page. */
router.get('/profile', function (req, res, next) {
    console.log("Is Authenticated: "+req.isAuthenticated());
    User.findById(req.user.id, function (err, doc) {
        console.info("User:" + doc);
        if (err) {
            return res.write('Error!');
        }
        if (doc.type == 'pending') {
            res.redirect('send-otp');
        } else if (doc.type == 'admin') {
            res.redirect('../dashboard');
        } else if (doc.type == 'Employee') {
            Employee.findOne({'user':doc.id},function (err,doc2){
                res.render('profile', {title: 'Profile employee', user: doc,data:doc2});
            });
        } else if (doc.type == 'Student') {
            Student.findOne({'user':doc.id},function (err,doc2){
                res.render('profile', {title: 'Profile student', user: doc,data:doc2});
            });
        } else {
            res.render('profile', {title: 'Profile', user: doc,verified:true});
        }
    });
});

/* GET forget password page. */
router.get('/forget-password', notLoggedIn, function (req, res, next) {
    var messages = req.flash('error');
    res.render('forget-password', {
        csrfToken: req.csrfToken,
        messages: messages, hasErrors: messages.length > 0, title: 'Forget password'
    });
});
/* Post forget password page. */
router.post('/forget-password', notLoggedIn, function (req, res, next) {
    User.findOne({'email': req.body.email}, function(err, user) {

        if(user){
            console.log('user exists'+user);    
            var email=user.email;
            var otp=Math.floor(100000 + Math.random() * 900000);
            req.session.otp=otp;
            req.session.otp_mail=email;
            console.log("Otp : "+req.session.otp+" is sent to "+user.email);
    
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
                  subject: 'OTP for forget password',
                  text:'Your One Time Password is : '+otp
                };
    
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
                res.redirect('verify-otp-fp');
              }
            });
            res.redirect('verify-otp-fp');
        }
        else{
            console.log('user not exists');    
            var messages = [];
            
            messages.push("user not exists");
            req.flash('error', messages);
            res.redirect('forget-password');
        }
    });
});

/* GET verify otp page. */
router.get('/verify-otp-fp', notLoggedIn, function (req, res, next) {
    var messages = req.flash('error');
    res.render('verify-otp-forget-password', {
        csrfToken: req.csrfToken,
        messages: messages, hasErrors: messages.length > 0, title: 'Verify otp',
        user:req.session.otp_mail
    });
});

/* POST verify otp page. */
router.post('/verify-otp-fp', function (req, res, next) {
        var otp=req.session.otp;
        var otp_in=req.body.otp;
        if(otp==otp_in){
            console.log("OTP matched");       
            res.redirect('forget-password-reset');
        }
        else{
            console.log("OTP not match");
            var messages = [];
            
            messages.push("OTP not match");
            req.flash('error', messages);
            res.redirect('verify-otp-fp');
        }
});


/* GET reset password page. */
router.get('/forget-password-reset', function (req, res, next) {
    var messages = req.flash('error');
    res.render('forget-password-reset', {
        csrfToken: req.csrfToken,
        messages: messages, hasErrors: messages.length > 0, title: 'Reset Password',
        user:req.session.otp_mail
    });
});

/* Post reset password page. */
router.post('/forget-password-reset', function (req, res, next) {
    User.findOne({'email': req.session.otp_mail}, function(err, user) {
        var password=req.body.password;
        if(user){
            user.password=user.encryptPassword(password);
            user.save();
            console.log('Password Reseted for '+user.email);    
            var email=user.email; 
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
                  subject: 'Password reset successfully',
                  text:'Your password for '+user.email+' has been reset successfully.\nNow you can try to login using new password.'
                };
    
            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
            res.redirect('forget-password-success');

        }
    });
});

/* GET forget password sucess page. */
router.get('/forget-password-success', function (req, res, next) {
    var messages = req.flash('error');
    res.render('forget-password-success', {
        csrfToken: req.csrfToken,
        messages: messages, hasErrors: messages.length > 0, title: 'Success'
    });
});

/* GET change password page. */
router.get('/change-password', function (req, res, next) {
    var messages_e = req.flash('error');
    var messages_s = req.flash('success');
    res.render('change-password', {
        csrfToken: req.csrfToken,
        messages_e: messages_e, hasErrors: messages_e.length > 0,
        messages_s: messages_s, hasSuccess: messages_s.length > 0,
        title: 'Change Password',
        user:req.user
    });
});

/* Post change password page. */
router.post('/change-password', function (req, res, next) {
    User.findOne({'email': req.user.email}, function(err, user) {

        var password=req.body.password;
        var new_password=req.body.new_password;

        if(user.validPassword(password))
        {
            console.log('Valid password..');
            if(!user.validPassword(new_password)){


                user.password=user.encryptPassword(new_password);
                user.save();

                var email=user.email; 
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
                    subject: 'Password changed successfully',
                    text:'Your password for '+user.email+' has been changed successfully.\n'
                    };
        
                transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
                });

                console.log("Password successfully changed");

                var messages = [];
                messages.push("Password successfully changed");
                req.flash('success', messages);
            }
            else{
                console.log("Old password and New password can not be same");

                var messages = [];
                messages.push("Old password and New password can not be same");
                req.flash('error', messages);
            }
        }
        else{
            console.log('Old password not matched');
            
            var messages = [];
            messages.push("Old password not matched");
            req.flash('error', messages);
        }

        res.redirect('change-password');

    });
});
/* GET send otp page. */
router.get('/send-otp', isLoggedIn, function (req, res, next) {
    User.findById(req.user.id, function (err, user) {
        if (err) {
            return res.write('Error!');
        }
        var messages = req.flash('error');
        res.render('send-otp', {
            csrfToken: req.csrfToken,
            messages: messages, hasErrors: messages.length > 0,
            title: 'Send otp', user: user
        });
    });
});

/* POST send otp page. */
router.post('/send-otp', function (req, res, next) {
    var messages = [];

    User.findById(req.user.id, function (err, user) {
        if (err) {
            return res.write('Error!');
        }
        var email=user.email;
        var otp=Math.floor(100000 + Math.random() * 900000);
        req.session.otp=otp;
        console.log(user.email +", Otp:"+req.session.otp);
        
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: keys.email.emailId,
              pass: keys.email.password
            }
          });

          var mailOptions = {
              from:  keys.email.emailId,
              to: email,
              subject: 'OTP for signup',
              text:'Your one time password is:'+otp
            };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            messages.push("OTP not sent: "+error.message);
            req.flash('error', messages);
            res.redirect('send-otp');
          } else {
            console.log('Email sent: ' + info.response);
            res.redirect('verify-otp');
          }
        });

    });
});

/* GET verify otp page. */
router.get('/verify-otp', isLoggedIn, function (req, res, next) {
    User.findById(req.user.id, function (err, user) {
        if (err) {
            return res.write('Error!');
        }
        res.render('verify-otp', {title: 'Verify otp', user: user});
    });
});


/* POST verify otp page. */
router.post('/verify-otp', function (req, res, next) {
    User.findById(req.user.id, function (err, user) {
        if (err) {
            return res.write('Error!');
        }
        var otp=req.session.otp;
        var otp_in=req.body.otp;
        if(otp==otp_in){
            console.log("OTP matched");       
            user.type = 'verified';
            user.save().then(function () {
                res.redirect('profile');
            });
        }
        else{
            console.log("OTP not match");
            messages.push("OTP not match");
            req.flash('error', messages);
            res.render('verify-otp', {title: 'Verify otp', user: user,hasErrors:true});
        }

    });
});

/* GET student details page. */
router.get('/student-details', isLoggedIn, function (req, res, next) {

    StudentRequests.findOne({'user': req.user.id}, function (err, doc) {
        var messages = req.flash('error');
        if (err) {
            console.error("error, no entry found");
        }
        // console.log("id:"+req.user+"..."+doc);
        res.render('student-details', {
            csrfToken: req.csrfToken,
            messages: messages, hasErrors: messages.length > 0,
            title: 'Student details', user: doc,
            status:"Ture"
        });
    });
});


/* POST student details page. */
router.post('/student-details',function (req, res, next) {
    console.log(req.file);
    var messages = [];
    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        res.redirect('student-details', req.flash('error', messages));
    }
    StudentRequests.findOne({'user': req.user.id}, function (err, doc) {
        if (err) {
            console.error("error, no entry found");
        }
        if (!doc) {
            console.info("New Student");

            let ts = Date.now();
            let date_ob = new Date(ts);
            let date = date_ob.getDate();
            let month = date_ob.getMonth() + 1;
            let year = date_ob.getFullYear();
            var contact = req.body.contact;

            var studentRequests = new StudentRequests({
                user: req.user,
                firstName: req.body.firstname,
                middleName: req.body.middlename,
                lastName: req.body.lastname,
                gender: req.body.gender,
                dob: req.body.dob,
                address: req.body.address,
                address2: req.body.address2,
                state: req.body.state,
                city: req.body.city,
                pinCode: req.body.pin,
                email: req.body.email,
                contact: contact,                
                enrollmentNo:ts,
                stream: req.body.stream,
                medium: req.body.medium,
                schoolName: req.body.schoolName,
                schoolAddress: req.body.schoolAddress,
                standard: req.body.standard,
                profilePicture: "",
                registrationDate:Date( date + "-" + month + "-" + year),
                leaveDate: ""
            });
            studentRequests.save().then(function (err, result) {
                if (err) {
                    // req.flash('error', "Failed:1  " + err.toString());
                }
                console.info("Data Inserted!");
                res.redirect('student-details');
            });
        } else {
            console.info("Exist Student");
            var address2 = req.body.address2;
            var contact = req.body.contact;

            if (doc.user == req.user.id) {
                doc.firstName = req.body.firstname;
                doc.middleName = req.body.middlename;
                doc.lastName = req.body.lastname;
                // doc.gender = req.body.gender;
                doc.dob = req.body.dob;
                doc.address = req.body.address;
                doc.address2 = address2;
                doc.state = req.body.state;
                doc.city = req.body.city;
                doc.pinCode = req.body.pin;
                doc.email = req.body.email;
                doc.contact = contact;
                // doc.enrollmentNo= ts,
                doc.stream= req.body.stream,
                doc.medium= req.body.medium,
                doc.schoolName= req.body.schoolName,
                doc.schoolAddress= req.body.schoolAddress,
                doc.standard= req.body.standard,
                doc.profilePicture = "";
                doc.leaveDate = "";
                doc.save();
                console.info("Data updated!");
                console.info(doc);
                res.redirect('student-details');
            }
        }


    });

});


/* GET employee details page. */
router.get('/employee-details', isLoggedIn, function (req, res, next) {
    EmployeeRequests.findOne({'user': req.user.id}, function (err, doc) {
        var messages = req.flash('error');
        if (err) {
            console.error("error, no entry found");
        }
        console.log("id:"+req.user+"..."+doc);
        res.render('employee-details', {
            csrfToken: req.csrfToken,
            messages: messages, hasErrors: messages.length > 0,
            title: 'Employee details', 
            user: doc,
            status:req.user.status
        });
    });
});


/* POST employee details page. */
router.post('/employee-details', function (req, res, next) {
    var messages = [];
    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        res.redirect('employee-details', req.flash('error', messages));
    }
    EmployeeRequests.findOne({'user': req.user.id}, function (err, doc) {
        if (err) {
            console.error("error, no entry found");
        }
        if (!doc) {
            console.info("New employee");

            let ts = Date.now();
            let date_ob = new Date(ts);
            let date = date_ob.getDate();
            let month = date_ob.getMonth() + 1;
            let year = date_ob.getFullYear();
            var contact = req.body.contact;

            var employeeRequests = new EmployeeRequests({
                user: req.user,
                firstName: req.body.firstname,
                middleName: req.body.middlename,
                lastName: req.body.lastname,
                gender: req.body.gender,
                dob: req.body.dob,
                address: req.body.address,
                address2: req.body.address2,
                state: req.body.state,
                city: req.body.city,
                pinCode: req.body.pin,
                email: req.body.email,
                contact: contact,                
                enrollmentNo:ts,
                department: req.body.department,
                salary: "",
                designation: req.body.designation,
                skill: req.body.skill,
                profilePicture: "",
                registrationDate:Date( date + "-" + month + "-" + year),
                leaveDate: ""
            });
            employeeRequests.save().then(function (err, result) {
                if (err) {
                    // req.flash('error', "Failed:1  " + err.toString());
                }
                console.info("Data Inserted!");
                res.redirect('employee-details');
            });
        } else {
            console.info("Exist employee");
            var address2 = req.body.address2;
            var contact = req.body.contact;

            if (doc.user == req.user.id) {
                doc.firstName = req.body.firstname;
                doc.middleName = req.body.middlename;
                doc.lastName = req.body.lastname;
                // doc.gender = req.body.gender;
                doc.dob = req.body.dob;
                doc.address = req.body.address;
                doc.address2 = address2;
                doc.state = req.body.state;
                doc.city = req.body.city;
                doc.pinCode = req.body.pin;
                doc.email = req.body.email;
                doc.contact = contact;
                // doc.enrollmentNo= ts,
                department= req.body.department,
                // salary= "",
                doc.designation=req.body.designation,
                doc.skill= req.body.skill,
                doc.profilePicture = "";
                doc.leaveDate = "";
                doc.save();
                console.info("Data updated!");
                console.info(doc);
                res.redirect('employee-details');
            }
        }


    });

});

/* New Google Auth */
router.get('/google',
  passport.authenticate('google', { scope: 
      [ 'https://www.googleapis.com/auth/plus.login',
      , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));

router.get( '/users/google/redirect', 
    passport.authenticate( 'google', { 
        successRedirect: '/users/profile',
        failureRedirect: '/auth/google/failure'
}));

/*
// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));


//callback route for google users
// router.get('/google/redirect',passport.authenticate('google'),function(req, res) {
//   res.send(req.user);
// });

router.get('/google/redirect',
    passport.authenticate('google', {
        failureRedirect: '/users/login', failureFlash: true
    }),
    function (req, res) {
        console.log("will profile");
        // if (req.session.oldUrl) {
        //     var oldUrl = req.session.oldUrl;
        //     req.session.oldUrl = null;
        //     res.redirect(oldUrl);
        // } else {
        //     console.log("Profile");
        //     res.redirect('/users/profile');
        // }
        res.redirect('/users/profile');
    });

    */

/* Sign up */
router.get('/signup', notLoggedIn, function (req, res, next) {
    var messages = req.flash('error');
    res.render('signup', {
        csrfToken: req.csrfToken,
        messages: messages, hasErrors: messages.length > 0, title: 'Sign Up'
    });
});
router.post('/signup', passport.authenticate('local.signup', {
    failureRedirect: 'signup',
    failureFlash: true
}), function (req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('send-otp');
    }
});


/* Login */
router.get('/login', notLoggedIn, function (req, res, next) {
    var messages = req.flash('error');
    res.render('login', {
        csrfToken: req.csrfToken,
        messages: messages, hasErrors: messages.length > 0, title: 'Login'
    });
});

router.post('/login', passport.authenticate('local.signin', {
    failureRedirect: 'login',
    failureFlash: true
}), function (req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('profile');
    }
});

/* GET leave. */
router.get('/leave', isLoggedIn,function (req, res, next) {
    var messages_e = req.flash('error');
    var messages_s = req.flash('success');

    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    
    // console.log(req.user.id);
    User.findById(req.user.id, function (err, doc) {
        Student.findOne({'user':doc.id},function (err,doc2){
            // console.log(doc2.id);
            // console.log(doc2.firstName);
            // console.log(doc2.middleName);
            // console.log(doc2.lastName);
            // console.log(doc2.enrollmentNo);
            // console.log(doc2.standard);
            // console.log(doc2.contact);    
            doc.student=doc2;
            // console.log(doc);
            Leave.find({'student.user':req.user.id},function (err, Leaves) {
                if (err) return console.error(err);
                console.log(Leaves);

                res.render('leave', {
                    csrfToken: req.csrfToken,
                    messages_e: messages_e, hasErrors: messages_e.length > 0,
                    messages_s: messages_s, hasSuccess: messages_s.length > 0,
                    title: 'Leave',
                    date:Date( date + "-" + month + "-" + year),
                    user:doc,
                    leaves:Leaves
                });              
            });

        });
    });

});

/* Post leave page. */
router.post('/leave',isLoggedIn, function (req, res, next) {
    
    var user=req.body.userId;
    var fromDate=req.body.fromDate;
    var toDate=req.body.toDate;
    var reason=req.body.reason;
    var status="pending";
    var remark="";
       
    Student.findOne({'user':user},function (err,doc2){
        var leave = new Leave({
            reason:reason,
            from:fromDate,
            to:toDate,
            status:status,
            remark:remark
        });
        leave.student=doc2;
        
        leave.save().then(function(err,result){
                if(err){
                    var messages = [];
                    messages.push(err);
                    req.flash('error', messages);
                    console.log(err);
                }
                else{
                    var messages = [];
                    messages.push("Leave applied successfully");
                    req.flash('success', messages);
                    console.log("Leave applied successfully");
                }
                console.log(result);
        });
    });
 
    
    res.redirect('leave');
});

/* Post change password page. */
router.post('/change-password', function (req, res, next) {
    User.findOne({'email': req.user.email}, function(err, user) {

        var password=req.body.password;
        var new_password=req.body.new_password;

        if(user.validPassword(password))
        {
            console.log('Valid password..');
            if(!user.validPassword(new_password)){


                user.password=user.encryptPassword(new_password);
                user.save();

                var email=user.email; 
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
                    subject: 'Password changed successfully',
                    text:'Your password for '+user.email+' has been changed successfully.\n'
                    };
        
                transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
                });

                console.log("Password successfully changed");

                var messages = [];
                messages.push("Password successfully changed");
                req.flash('success', messages);
            }
            else{
                console.log("Old password and New password can not be same");

                var messages = [];
                messages.push("Old password and New password can not be same");
                req.flash('error', messages);
            }
        }
        else{
            console.log('Old password not matched');
            
            var messages = [];
            messages.push("Old password not matched");
            req.flash('error', messages);
        }

        res.redirect('change-password');

    });
});


module.exports = router;

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}


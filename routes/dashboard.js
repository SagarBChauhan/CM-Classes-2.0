var express = require('express');
var router = express.Router();
var Enquiry = require('../models/enquiry');
var StudentRequests = require('../models/student-requests');
var EmployeeRequests = require('../models/employee-requests');
var Student = require('../models/student');
var Employee = require('../models/employee');
var Users = require('../models/user');
var Class = require('../models/class');
var Subject = require('../models/subject');
var Leave = require('../models/leave');
var Alert = require('../models/alert');
var nodemailer=require('nodemailer');

var keys=require("../config/keys");

/* GET home page. */
router.get('/', function (req, res, next) {
    EmployeeRequests.find().then(function (doc) {
        Employee.find().then(function (doc2) {
        res.render('dashboard/dashboard', {title: 'Dashboard', li1: true, dashboard: true, user: req.user,employeeReq:doc,employee:doc2});
        });
    });
});

/* GET alert page. */
router.get('/alert', function (req, res, next) {
    Alert.find().then(function (doc) {
        console.log(doc);
        res.render('dashboard/alert', {title: 'Alert', li10: true, dashboard: true, user: req.user,alert:doc});     
     });

});

/* POST alert page. */
router.post('/alert', function (req, res, next) {
    const title=req.body.title;
    const description=req.body.description;
    const audience=req.body.audience;
    let ts = Date.now();
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let date_now=Date( date + "-" + month + "-" + year);

    var alert = new Alert({
        title:title,
        description:description,
        audience:audience,
        date:date_now
    });

    alert.save().then(function(err,result){
            if(err){
                var messages = [];
                messages.push(err);
                req.flash('error', messages);
                console.log(err);
            }
            else{
                var messages = [];
                messages.push("Alert published successfully");
                req.flash('success', messages);
                console.log("Alert published successfully");
            }
            console.log(result);
    });
    res.redirect('alert');
});

router.get('/alert-remove/:id', function (req, res, next) {
    var id = req.params.id;
    Alert.findByIdAndDelete(id, function (err) {
        if(err) {
            res.write('false');
            res.end();
            console.log(err)
        }
        else{        
            console.log("Successful deletion");
            res.write('true');
            res.end();   
        }
    });
    console.log("alert-remove");
});

/* GET alert-add page. */
router.get('/alert-add', function (req, res, next) {
    res.render('dashboard/alert-add', {title: 'Alert Add', li10: true, dashboard: true, user: req.user});     
});
/* GET alert-add page. */
router.get('/alert-add', function (req, res, next) {
    Alert.find().then(function (doc) {
        console.log(doc);
        res.render('dashboard/alert-add', {title: 'Alert Add', li10: true, dashboard: true, user: req.user,alert:doc});     
     });

});

/* GET enquiry page. */
router.get('/enquiry', function (req, res, next) {
    Enquiry.find().then(function (doc) {
        console.log(doc);
        res.render('dashboard/enquiry', {title: 'Enquiry', li7: true, dashboard: true, user: req.user,enquiry:doc});     
     });

});

/* POST enquiry page. */
router.post('/enquiry', function (req, res, next) {
    
    console.log("enter");
    const name=req.body.name;
    const mail=req.body.mail;
    const refId=req.body.refId;
    const refMsg=req.body.refMsg;
    const Msg=req.body.msg;
      
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
        user: keys.email.emailId,
        pass: keys.email.password
        }
    });

    var mailOptions = {
        from: keys.email.emailId,
        to: mail,
        subject: 'Enquirey response for '+refMsg,
        text:'Thank you '+name+' for contact us,\n Your Message was: '+refMsg+'\n Here is our response: ,' +Msg+'\n\n Sent using CM Classes quick reply'
        };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });

    Enquiry.findById(refId, function (err, doc) {
        doc.status='true';
        console.log('Done');
        doc.save();
    });

    Enquiry.find().then(function (doc) {
        console.log(doc);
        res.render('dashboard/enquiry', {title: 'Enquiry', li7: true, dashboard: true, user: req.user,enquiry:doc,msg:"Replyed successfully"});     
     });
});


/* GET roles page. */
router.get('/roles', function (req, res, next) {
    Users.find().then(function (doc) {
        console.log(doc);
        res.render('dashboard/roles', {title: 'User roles', li9: true, dashboard: true, user: req.user,users:doc});     
     });

});

router.get('/role-change/:id/:type', function (req, res, next) {
    var id = req.params.id;
    var type = req.params.type;
    Users.findById(id).then(function (doc) {
        console.log(doc.type+"to"+type);
        doc.type=type;
        doc.save();
        console.log("role-change");    
     });

});



/* GET leave page. */
router.get('/leave', function (req, res, next) {
    Leave.find().then(function (doc) {
        console.log(doc);
        res.render('dashboard/leave', {title: 'Leave', li8: true, dashboard: true, user: req.user,leave:doc});     
     });

});

/* GET leave-accept page. */
router.get('/leave/accept/:id', function (req, res, next) {
    var reqId = req.params.id;
    Leave.findById(reqId, function (err, doc) {
        doc.status='Accepted';
        console.log('Accepted');
        doc.save();
    });
    res.redirect('/dashboard/leave');
});

/* GET leave-reject page. */
router.get('/leave/reject/:id', function (req, res, next) {
    var reqId = req.params.id;
    Leave.findById(reqId, function (err, doc) {
        doc.status='Rejected';
        console.log('Rejected');
        doc.save();
    });
    res.redirect('/dashboard/leave');
});


/* GET profile page. */
router.get('/profile', function (req, res, next) {
    res.render('dashboard/profile', {title: 'Profile', li2: true, dashboard: true, user: req.user});
});

/* GET admission page. */
router.get('/admission', function (req, res, next) {
    StudentRequests.find().then(function (doc) {
        console.log(doc);
        EmployeeRequests.find().then(function (doc2) {
            console.log(doc2);
            res.render('dashboard/admission', {title: 'Admission', li3: true, dashboard: true, user: req.user, students: doc,employees:doc2});
        });
    });
});

/* GET admission edit page. */
router.get('/admission-edit/:type/:id', function (req, res, next) {
    var type = req.params.type;
    var userId = req.params.id;
    if(type=="Student"){
        
        StudentRequests.findById(userId, function (err, doc) {
            if (err) {
                return res.write('Error!');
            }
            console.log('student:'+doc);
            res.render('dashboard/admission-edit', {title: 'Admission edit', li3: true, dashboard: true, user: req.user, items: doc});
        });
    }
    else if(type=="Employee"){
        EmployeeRequests.findById(userId, function (err, doc) {
            if (err) {
                return res.write('Error!');
            }
            console.log('employee:'+doc);
            res.render('dashboard/admission-edit', {title: 'Admission edit', li3: true, dashboard: true, user: req.user, items: doc});
        });
    }
});
/* Post admission edit page. */
router.post('/admission-edit/:type/:id', function (req, res, next) {
    var messages = [];
    var type = req.params.type;
    var userId = req.params.id;
    if(type=="Student"){
        StudentRequests.findById(userId, function (err, doc) {
            if (err) {
                return res.write('Error!');
            }
            var address2 = req.body.address2;
            var contact = req.body.contact;

            // doc.firstName = req.body.firstname;
            // doc.middleName = req.body.middlename;
            // doc.lastName = req.body.lastname;
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
            // doc.profilePicture = "";
            // doc.leaveDate = "";
            doc.save();
            console.info("Data updated!");
            console.info(doc);
            res.render('dashboard/admission-edit', {title: 'Admission edit', li3: true, dashboard: true, user: req.user, items: doc,msg:"Successfully updated!"});
        });
    }
    else if(type=="Employee"){
        EmployeeRequests.findById(userId, function (err, doc) {
            if (err) {
                return res.write('Error!');
            }
            var address2 = req.body.address2;
            var contact = req.body.contact;

            // doc.firstName = req.body.firstname;
            // doc.middleName = req.body.middlename;
            // doc.lastName = req.body.lastname;
            // doc.gender = req.body.gender;
            doc.dob = req.body.dob;
            doc.address = req.body.address;
            doc.address2 = address2;
            doc.state = req.body.state;
            doc.city = req.body.city;
            doc.pinCode = req.body.pin;
            doc.email = req.body.email;
            doc.contact = req.body.contact;
            // doc.enrollmentNo= ts,
            doc.department=req.body.department,
            doc.salary=req.body.salary,
            doc.designation=req.body.designation,
            doc.skill=req.body.skill,
            // doc.profilePicture = "";
            // doc.leaveDate = "";
            doc.save();
            console.info("Data updated!");
            console.info(doc);
            res.render('dashboard/admission-edit', {title: 'Admission edit', li3: true, dashboard: true, user: req.user, items: doc,msg:"Successfully updated!"});
        });
    }
});
/* GET admission-accept page. */
router.get('/admission/accept/:type/:id', function (req, res, next) {
    var type = req.params.type;
    var userId = req.params.id;

    Users.findById(userId, function (err, user) {
        if (err) {
            return res.write('Error!');
        }
        user.type = type;
        user.save();

        let ts = Date.now();
        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();

        if(type=="Student"){
            StudentRequests.findOne({'user': user.id}, function (err, doc) {
                var student= new Student({
                    user: userId,
                    firstName: doc.firstName,
                    middleName: doc.middleName,
                    lastName: doc.lastName,
                    gender: doc.gender,
                    dob:  doc.dob,
                    address:  doc.address,
                    address2:  doc.address2,
                    state:  doc.state,
                    city:  doc.city,
                    pinCode:  doc.pinCode,
                    email: doc.email,
                    contact:  doc.contact,
                    enrollmentNo:ts,
                    stream: doc.stream,
                    medium: doc.medium,
                    schoolName: doc.schoolName,
                    schoolAddress: doc.schoolAddress,
                    standard: doc.standard,
                    profilePicture: "",
                    registrationDate:Date( date + "-" + month + "-" + year),
                    leaveDate: ""
                });
                student.save().then(function (err, result) {
                    console.info("Student Data Inserted!");

                    StudentRequests.findByIdAndRemove(doc._id).exec();
                    console.info('data soft deleted' + doc._id);
                    res.redirect('/dashboard/admission');
                });
            });
        }
        else if(type=="Employee"){
            EmployeeRequests.findOne({'user': user.id}, function (err, doc) {
                var employee= new Employee({
                    user: userId,
                    firstName: doc.firstName,
                    middleName: doc.middleName,
                    lastName: doc.lastName,
                    gender: doc.gender,
                    dob:  doc.dob,
                    address:  doc.address,
                    address2:  doc.address2,
                    state:  doc.state,
                    city:  doc.city,
                    pinCode:  doc.pinCode,
                    email: doc.email,
                    contact:  doc.contact,
                    enrollmentNo:doc.enrollmentNo,
                    department:doc.department,
                    salary:doc.salary,
                    designation:doc.designation,
                    skill:doc.skill,
                    profilePicture: "",
                    registrationDate:Date( date + "-" + month + "-" + year),
                    leaveDate: ""
                });
                employee.save().then(function (err, result) {
                    console.info("Employee Data Inserted!");

                    EmployeeRequests.findByIdAndRemove(doc._id).exec();
                    console.info('data soft deleted' + doc._id);
                    res.redirect('/dashboard/admission');
                });
            });
        }
    });
});

/* GET admission-reject page. */
router.get('/admission/reject/:type/:id', function (req, res, next) {
    var type = req.params.type;
    var userId = req.params.id;
    Users.findById(userId, function (err, user) {
        if(type=="Student"){
            StudentRequests.findOne({'user': user.id}, function (err, doc) {
                doc.status='Rejected';
                doc.save();
            });
        }
        else if(type=="Employee"){
           EmployeeRequests.findOne({'user': user.id}, function (err, doc) {
                doc.status='Rejected';
                doc.save();
            });
        }
    });
    res.redirect('/dashboard/admission');
});

/* GET students page. */
router.get('/students', function (req, res, next) {
    Student.find().then(function (doc) {
        console.log(doc);
        res.render('dashboard/students', {title: 'Students', li4: true, dashboard: true, user: req.user, students:doc});
    });
});

/* GET employees page. */
router.get('/employees', function (req, res, next) {
    Employee.find().then(function (doc) {
        res.render('dashboard/emplyees', {title: 'Employees', li5: true, dashboard: true, user: req.user, students:doc});
    });
});

/* GET user edit page. */
router.get('/user-edit/:type/:id', function (req, res, next) {
    var type = req.params.type;
    var userId = req.params.id;
    if(type=="Student"){
        
        Student.findById(userId, function (err, doc) {
            if (err) {
                return res.write('Error!');
            }
            console.log('student:'+doc);
            res.render('dashboard/user-edit', {title: 'Student edit', li4: true, dashboard: true, user: req.user, items: doc});
        });
    }
    else if(type=="Employee"){
        Employee.findById(userId, function (err, doc) {
            if (err) {
                return res.write('Error!');
            }
            console.log('employee:'+doc);
            res.render('dashboard/user-edit', {title: 'Employee edit', li5: true, dashboard: true, user: req.user, items: doc});
        });
    }
});
/* Post user edit page. */
router.post('/user-edit/:type/:id', function (req, res, next) {
    var messages = [];
    var type = req.params.type;
    var userId = req.params.id;
    if(type=="Student"){
        Student.findById(userId, function (err, doc) {
            if (err) {
                return res.write('Error!');
            }
            var address2 = req.body.address2;
            var contact = req.body.contact;

            // doc.firstName = req.body.firstname;
            // doc.middleName = req.body.middlename;
            // doc.lastName = req.body.lastname;
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
            // doc.profilePicture = "";
            // doc.leaveDate = "";
            doc.save();
            console.info("Data updated!");
            console.info(doc);
            res.render('dashboard/user-edit', {title: 'Student edit', li4: true, dashboard: true, user: req.user, items: doc,msg:"Successfully updated!"});
        });
    }
    else if(type=="Employee"){
        Employee.findById(userId, function (err, doc) {
            if (err) {
                return res.write('Error!');
            }
            var address2 = req.body.address2;
            var contact = req.body.contact;

            // doc.firstName = req.body.firstname;
            // doc.middleName = req.body.middlename;
            // doc.lastName = req.body.lastname;
            // doc.gender = req.body.gender;
            doc.dob = req.body.dob;
            doc.address = req.body.address;
            doc.address2 = address2;
            doc.state = req.body.state;
            doc.city = req.body.city;
            doc.pinCode = req.body.pin;
            doc.email = req.body.email;
            doc.contact = req.body.contact;
            // doc.enrollmentNo= ts,
            doc.department=req.body.department,
            doc.salary=req.body.salary,
            doc.designation=req.body.designation,
            doc.skill=req.body.skill,
            // doc.profilePicture = "";
            // doc.leaveDate = "";
            doc.save();
            console.info("Data updated!");
            console.info(doc);
            res.render('dashboard/user-edit', {title: 'Employee edit', li5: true, dashboard: true, user: req.user, items: doc,msg:"Successfully updated!"});
        });
    }
});

/* GET class page. */
router.get('/class', function (req, res, next) {
    Class.find().then(function (doc) {

        console.log(doc);
        res.render('dashboard/class', {title: 'class', li6: true, dashboard: true, user: req.user, class:doc});
    });
});

/* GET class page. */
router.get('/class-add', function (req, res, next) {
    Employee.find(function (err, doc) {
        Student.find(function (err, doc2) {
            Subject.find(function (err, doc3) {
            res.render('dashboard/class-add', {title: 'class Add', li6: true, dashboard: true, user: req.user,employee:doc, students:doc2,subjects:doc3});
            });
        });
    });
});
/* GET class page. */
router.post('/class-add', function (req, res, next) {
    var standard=req.body.standard;
    var medium=req.body.medium;
    var division=req.body.division;
    var classTeacher=req.body.classTeacher;
    var students=req.body.students;
    var subjects=req.body.subjects;

    // console.log("Students : "+students);
    // console.log("Subjects : "+subjects);


    Student.find({'_id':students},function (err,doc){    
        // console.log("st:"+doc);
        Employee.findOne({'_id':classTeacher},function (err,doc2){    
            // console.log("ct:"+doc2);
            Subject.find({'_id':subjects},function (err,doc3){    
            // console.log("sub:"+doc3);
            var class1=new Class({
                standard:standard,
                medium:medium,
                division:division,
                classTeacher:{
                    user:doc2.user,
                    firstName:doc2.firstName,
                    middleName:doc2.middleName,
                    lastName:doc2.lastName,
                    email:doc2.email,
                    contact:doc2.contact,
                    enrollmentNo:doc2.enrollmentNo,
                    department:doc2.department
                }
                // ,
                // students:[{
                //     user:doc.user,
                //     firstName:doc.firstName,
                //     middleName:doc.middleName,
                //     lastName:doc.lastName,
                //     contact:doc.contact,
                //     enrollmentNo:doc.enrollmentNo,
                //     stream:doc.stream,
                //     medium:doc.medium,
                //     schoolName:doc.schoolName,
                //     standard:doc.standard
                // }],
                // subjects:[{
                //     id:doc3.id,
                //     code:doc3.code,
                //     title:doc3.title
                // }]
            });
            
            let st=[];
            for(let i=0;i<doc.length;i++){
                let student={           
                    user:doc[i].user,
                    firstName:doc[i].firstName,
                    middleName:doc[i].middleName,
                    lastName:doc[i].lastName,
                    contact:doc[i].contact,
                    enrollmentNo:doc[i].enrollmentNo,
                    stream:doc[i].stream,
                    medium:doc[i].medium,
                    schoolName:doc[i].schoolName,
                    standard:doc[i].standard
                };
                st.push(student);
            }

            let sub=[];
            for(let i=0;i<doc3.length;i++){
                let subject={
                    id:doc3[i].id,
                    code:doc3[i].code,
                    title:doc3[i].title
                }
                sub.push(subject);
            }
            class1.students=st;
            class1.subjects=sub;

            console.log("class1"+class1);

            class1.save().then(function (err, result) {
                if (err) {
                    // req.flash('error', "Failed:1  " + err.toString());
                }
                console.info("Data Inserted!");              
            });  
            });      
        });      
    });      
    res.redirect('class-add');
});

router.get('/class-remove/:id', function (req, res, next) {
    var id = req.params.id;
    Class.findByIdAndDelete(id, function (err) {
        if(err) {
            res.write('false');
            res.end();
            console.log(err)
        }
        else{        
            console.log("Successful deletion");
            res.write('true');
            res.end();   
        }
    });
    console.log("class-remove");
});
/* GET notify page. */
router.get('/notify', function (req, res, next) {
    res.render('dashboard/notify', {title: 'Notify', li6: true, dashboard: true, user: req.user});
});
module.exports = router;

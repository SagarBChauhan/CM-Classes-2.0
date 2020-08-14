var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var Student = require('../models/student');

var schema=new Schema({
    
    student: {
        user:{type: Schema.Types.ObjectId, ref: 'User'},
        firstName:String,
        middleName:String,
        lastName:String,
        contact:String,
        enrollmentNo:String,
        stream:String,
        medium:String,
        schoolName:String,
        standard:String
    },
    reason:{type: String,required:true},
    from:{type: Date,required:true},
    to:{type: Date,required:true},
    status:{type: String,required:false},
    remark:{type: String,required:false}
});


module.exports=mongoose.model('Leave',schema)
var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var ClassSchema=new Schema({
    standard:{type:String, required:true},
    medium:{type:String, required:true},
    division:{type:String, required:true},
    classTeacher:{
        user:{type: Schema.Types.ObjectId, ref: 'User'},
        firstName:String,
        middleName:String,
        lastName:String,
        email:String,
        contact:String,
        enrollmentNo:String,
        department:String
    },
    students:[{
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
    }],
    subjects:[{
        id:String,
        code:String,
        title:String
    }]
});

module.exports=mongoose.model('Class',ClassSchema);
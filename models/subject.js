var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var SubjectSchema=new Schema({
    code:{type:String, required:true},
    title:{type:String, required:true}
});

module.exports=mongoose.model('Subject',SubjectSchema);
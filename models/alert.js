var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var AlertSchema=new Schema({
    title:{type:String, required:true},
    description:{type:String, required:true},
    audience:{type:String, required:true},
    status:{type:String, required:true},
    date:{type:Date,required:true}
});

module.exports=mongoose.model('Alert',AlertSchema);
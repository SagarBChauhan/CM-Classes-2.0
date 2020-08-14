var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var StandardSchema=new Schema({
    standard:{type:String, required:true},
    medium:{type:String, required:true},
    stream:{type:String, required:true},
    subject:{type:Array,required:false},
});

module.exports=mongoose.model('Standard',StandardSchema);
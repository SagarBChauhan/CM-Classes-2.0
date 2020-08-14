var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/cmclasses');

var Subject=require('../models/subject');

var subjects=[
    new Subject({
        code:'0001',
        title:'English'
    }),
    new Subject({
        code:'0002',
        title:'Gujarati'
    }),
    new Subject({
        code:'0003',
        title:'Hindi'
    })
];
var done=0;
for(var i=0; i<subjects.length;i++)
{
    subjects[i].save(function(err,result){
        done++;
        if(done==subjects.length)
        {
            exit();
        }
    });
}
function exit()
{
    mongoose.disconnect();
}
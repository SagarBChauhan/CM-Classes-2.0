var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/cmclasses', {useNewUrlParser: true,useUnifiedTopology: true });

var Standard=require('../models/standard');

var standard=[
        new Standard({
            standard:'1',
            medium:'English',
            stream:'',
            subject:{
                "subject":[    
                {"name":"Science"},
                {"name":"Social Science"},
                {"name":"English"}
            ]}  
    })
];

var done=0;
for(var i=0; i<standard.length;i++)
{
    standard[i].save(function(err,result){
        done++;
        if(done==standard.length)
        {
            exit();
        }
    });
}
function exit()
{
    mongoose.disconnect();
}
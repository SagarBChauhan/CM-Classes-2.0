var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/shopping');

var Product=require('../models/product');

var products=[
        new Product({
        imagePath:'http://www.newgamesbox.net/wp-content/uploads/2016/10/Gothic-1-PC-Game-Free-Download.jpg',
        title:'Gothic Video Game',
        description:'Awesome game!!!',
        price:10
    }),
        new Product({
        imagePath:'https://images-na.ssl-images-amazon.com/images/I/71cTCvSFJTL._SY500_.jpg',
        title:'Player Unknown\'s Battle Grounds -PUBG',
        description:'Awesome game!!!',
        price:10
    }),
        new Product({
        imagePath:'https://cdn.vox-cdn.com/thumbor/ALObOjAcJ3a_Vop_IYD7_yc8kZE=/85x0:1014x619/1200x800/filters:focal(85x0:1014x619)/cdn.vox-cdn.com/assets/2894725/V_OGV_1280x720.jpg',
        title:'Grand Theft Auto V',
        description:'Awesome game!!!',
        price:10
    }),
        new Product({
        imagePath:'https://images-na.ssl-images-amazon.com/images/I/81L8-mjNlrL._SX425_.jpg',
        title:'Counter-strike: Global Offensive (PC)',
        description:'Awesome game!!!',
        price:10
    }),
        new Product({
        imagePath:'https://m.media-amazon.com/images/M/MV5BM2EzNmU3NGYtYTcyMy00M2M1LTkyMGUtYjFlNGE0OTFmYmMxXkEyXkFqcGdeQXVyMzY0MTE3NzU@._V1_.jpg',
        title:'Watch Dogs 2',
        description:'Awesome game!!!',
        price:10
    }),
        new Product({
        imagePath:'https://www.mobygames.com/images/covers/l/480193-far-cry-5-playstation-4-manual.jpg',
        title:'Far Cry 5 (2018)',
        description:'Awesome game!!!',
        price:10
    }),
        new Product({
        imagePath:'https://m.media-amazon.com/images/M/MV5BOGY3ZjM3NWUtMWNiMi00OTcwLWIxN2UtMjNhMDhmZWRlNzRkXkEyXkFqcGdeQXVyNjMxNzQ2NTQ@._V1_.jpg',
        title:'Fortnite',
        description:'Awesome game!!!',
        price:10
    }),
        new Product({
        imagePath:'https://www.mobygames.com/images/covers/l/538006-apex-legends-xbox-one-front-cover.jpg',
        title:'Apex Legends (2019)',
        description:'Awesome game!!!',
        price:10
    })
];
var done=0;
for(var i=0; i<products.length;i++)
{
    products[i].save(function(err,result){
        done++;
        if(done==products.length)
        {
            exit();
        }
    });
}
function exit()
{
    mongoose.disconnect();
}
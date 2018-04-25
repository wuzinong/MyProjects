var Movie = require("../models/Movie");
exports.movieAdd = function(req,res){
    if(req.params.name){
        return res.render('movie',{
            title:req.params.name+'|movie|manage|movie.me',
            label:'edit:'+req.params.name,
            movie:req.params.name
        });
    }else{
        return res.render('movie',{
            title:'add|movie|manage|movie.me',
            label:'add movie',
            movie:false
        });
    }
}

exports.doMovieAdd = function(req,res){
    res.send({'success':true});
}
var mongodb = require('../db/mogodb');
var Schema = mongodb.mongoose.Schema;
var MovieSchema = new Schema({
    name:String,
    alias:[String],
    publish:Date,
    create_data:{type:Date,default:Date.now},
    images:{
        coverSmall:String,
        coverBig:String,
    },
    source:[{
        link:String,
        swfLink:String,
        quality:String,
        version:String,
        lang:String,
        subtitle:String,
        create_data:{type:Date,default:Date.now}
    }]
});
var Movie = mongodb.mongoose.model("Movie",MovieSchema);
var MovieDAO = function(){};
module.exports = new MovieDAO();
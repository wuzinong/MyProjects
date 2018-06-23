var config = require('./webpack.config.js');
var webpack= require('webpack');
var WebpackDevServer = require('webpack-dev-server');

var compiler = webpack(config);
var server = new WebpackDevServer(compiler,{
    publicPath:config.output.publicPath,
    hot:true,
    inline:true,
    historyApiFallback:true,
    stats: {
		colors: true,
		hash: false,
		timings: true,
		chunks: false,
		chunkModules: false,
		modules: false
	}
});
server.listen(3000,'127.0.0.1',function(err,result){
    if(err){
        return console.log(err);
    }
    console.log("start listening");
});

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const entry = require('./webpack.entry');
entry.app = [
    'webpack-hot-middleware/client?reload=true',
    'webpack/hot/only-dev-server',
    ...entry.app
];

const config = {
    devtool:"cheap-module-eval-source-map",
    target:'web',
    entry,
    output:{
        path:path.join(__dirname,'/dist/'),
        filename:"[name].bundle.js",
        chunkFilename: '[name]-[hash:5].chunk.js', // for dynamic loading
        publicPath: "/",
    },
    plugins:[
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template:'./index.html',
            filename:'index.html',
            inject:'body'
        }),
        new ExtractTextPlugin({
            filename: 'bundle.css',
            disable: false,
            allChunks: true
        }),
        // new webpack.optimize.CommonsChunkPlugin({
        //          name: 'commonFile', // Specify the common bundle's name.
        //          //filename:'my-fileName.js' //自己取个特别的名字
        // }),
        new webpack.optimize.CommonsChunkPlugin({
                 name: 'vendor',
                 //filename:'my-vendor.js'
                 minChunks:Infinity
        }),
        new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('development')
			}
		})
    ],
    module:{
        rules:[
            {
            test:/\.jsx?$/,
            include:/src/,
            use:[
               {
               loader:"babel-loader"
             }
            ]
          },{
            test:/.scss$/,
            use:[
                "style-loader",
                {
                  loader:"css-loader",
                  options:{
                      minimize:true,
                      modules: true, //enable css modules
                      importLoaders: 2
                  }
                },
                "postcss-loader",
                "sass-loader"
            ]
          },{
			test: /\.(jpe?g|png|gif|svg)$/i,
			include: /src/,
			use: [
                {
                    loader:'url-loader',
                    options:{
                        limit:1024,
                        name:'[name].[ext]'
                    }
                }
			]
		 }
        ]
    },
    resolve:{
        extensions:['.js','.jsx','.json'],
        // modules:['node_modules'],
        // alias: {
		// 	'my-lib': path.resolve(__dirname, './src/libs')
		// }
    }
}

module.exports = config;



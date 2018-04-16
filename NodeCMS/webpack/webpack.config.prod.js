const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const entry = require('./webpack.entry');


 
console.log(process.env.NODE_ENV);

const config = {
    devtool:false,
    target:'web',
    entry,
    output:{
        path:path.join(__dirname,'/dist/'),
        filename:"[name].bundle.js",
        chunkFilename: '[name]-[hash:5].chunk.js', // for dynamic loading
        publicPath: "./",
    },
    plugins:[
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true
            },
            compress: {
                screw_ie8: true
            },
            comments: false
        }),
        new HtmlWebpackPlugin({
            template:'./index.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true
            },
            filename:'index.html',
            inject:'body'
        }),
        new ExtractTextPlugin({
            filename: 'bundle.css',
            disable: false,
            allChunks: true
        }),
        // new webpack.ProvidePlugin({
        //     'Promise':'es6-promise',
        //     'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
        // }),
        new webpack.optimize.CommonsChunkPlugin({
                 name: 'vendor',
                 //filename:'my-vendor.js'
                 minChunks:Infinity
        }),
        new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		})
    ],
    module:{
        rules:[{
            test:/\.jsx?$/,
            include:/src/,
            use:[
               {
               loader:"babel-loader"
             }
            ]
          },{
            test:/.scss$/,
            use:ExtractTextPlugin.extract({
                fallback:"style-loader",
                use:[{
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
            })
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



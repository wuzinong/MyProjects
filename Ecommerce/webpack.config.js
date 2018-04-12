const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

console.log(process.env.NODE_ENV);

const config = {
    devtool:"cheap-module-eval-source-map",
    target:'web',
    entry:[
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://127.0.0.1:3000',
        'webpack/hot/only-dev-server',
        'babel-polyfill',
        './src/index.js'
    ],
    output:{
        path:path.join(__dirname,'/dist/wwwroot'),
        filename:"[name].bundle.js",
        chunkFilename: '[name]-[hash:5].chunk.js', // for dynamic loading
        publicPath: "./",
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
if(isDev){
    config.devServer = {
        port:'3000',
        host:'0.0.0.0',
        hot:true,
        inline:true,
        historyApiFallback:true,
        overlay:{
            errors:true
        },
        stats: {
            colors: true,
            hash: false,
            timings: true,
            chunks: false,
            chunkModules: false,
            modules: false
        }
    }
    config.output.publicPath = "/";
}else{
    config.devtool = false;
    config.entry={
        vendor:['babel-polyfill','react','react-dom','react-router'],
        app:'./src/index.js'
    };
    config.module = {
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
    };

    config.plugins=[
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
    ];
}

module.exports = config;



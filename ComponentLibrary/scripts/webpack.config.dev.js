
const baseConfig = require('./webpack.config');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
    ...baseConfig,
    devtool: "source-map",
    mode: 'development',
    devServer: {
        historyApiFallback: {
            index: '/'
        },
        //contentBase: './',
        port: process.env.PORT || 3001,
        host: '127.0.0.1',
        hot: true,
        inline: true,
        overlay: true,
        publicPath: '/',
        // proxy: [
        //         {
        //             // TODO: Remove the / path. This is currently blocked by login redirect url going to /, and that request needs to be handled by the server, not client side.
        //             context: ['/', '/login', '/logout', '/api'],
        //             target: 'https://127.0.0.1:3000',
        //             secure: false
        //         }
        //     ]
        // proxy: {
        //     "/**": {
        //         target: 'https://localhost:44384/', //backend server
        //         secure: false,
        //         changeOrigin: true // ??????,??????????
        //     }
        // }
    },
    plugins:[
        ...baseConfig.plugins,
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,'../demos/index.html'),
            //alwaysWriteToDisk: true,
            filename: 'index.html',
            inject: 'body',
            // chunks: ["global", "polyfill", "app", "vendor"],
            chunks: ["app"],
            chunksSortMode: "manual"
        })
    ]
};

module.exports = config;
const webpack = require('webpack');
const baseConfig = require('./webpack.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const srcPath = subdir => path.resolve(__dirname, './ClientApp/', subdir);

const config = {
    ...baseConfig,
    mode:'production',
    devtool:false,
    output: {
        ...baseConfig.output,
        path: path.resolve(__dirname, '../dist')
    },
    plugins:[
       ...baseConfig.plugins,
       new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,'../demos/index.html'),
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
        })
    ]
}

module.exports = config;


const webpack = require('webpack');
const path = require('path');
const colors = require('colors');
const rimraf = require('rimraf');

const webpackConf = require('../webpack/webpack.config.dev');

rimraf.sync(webpackConf.output.path);

webpack(webpackConf).run((err,stats)=>{
    if(err){
        console.log(err.bold.red);
        return 1;
    }
    console.log(stats.toString({colors: true}));

    console.log('OK'.green);
    return 0;
})
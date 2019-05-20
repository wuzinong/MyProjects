const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const srcPath = subdir => path.resolve(__dirname, '../src/', subdir);

const env = process.env.NODE_ENV;


module.exports = {
    entry: {
        //polyfill: ["babel-polyfill"],
        app: [path.resolve(__dirname,'../demos/index.tsx')]
    },
    output: {
        publicPath: '/',
        filename: "[name].bundle.js",
        path: path.resolve(__dirname,'../dist'),
        chunkFilename: '[name].js'
    },

    resolve: {
        alias: {
            Components: srcPath('components'),
            Common: srcPath('components/Common'),
            Forms: srcPath('components/Forms'),
            consts: srcPath('consts.ts'),
            imgs: srcPath('assets/images'),
            styles: path.resolve(__dirname,'../assets/styles'),
            commonRedux: srcPath("redux"),
            store: srcPath('redux/store'),
            utils: srcPath('utils'),
            types: srcPath('types'),
            libs: path.resolve(__dirname,'../libs')
        },
        extensions: [".ts", ".tsx", ".jsx", ".js", ".json"]
    },
    optimization: {
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                vendors: {
                    test: path.resolve(__dirname, 'node_modules'),
                    name: "vendors",
                    priority: -10,
                    //chunks:"initial",
                    enforce: true
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    },
    plugins: [
        new ExtractTextPlugin({
            filename: '[name].bundle.css',
            disable: false,
            allChunks: true
        })
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)?$/,
                loaders: [
                    'ts-loader'
                ],
                exclude: /node_modules/
            },
            {
                test: /.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader:'css-loader',
                            options:{
                                modules:true,
                                localIdentName: '[hash:base64:6]'
                            }
                        },
                        'postcss-loader',
                        'sass-loader'
                    ]
                })
            }
            , {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 1024,
                            name: 'static/images/[name].[ext]'
                        }
                    }
                ]
            }
        ]
    }
};

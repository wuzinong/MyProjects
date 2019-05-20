module.exports = {
    loader: 'postcss-loader',
    plugins: [
      require('autoprefixer')({
        browsers:['ie>=8']
      })
    ]
  };
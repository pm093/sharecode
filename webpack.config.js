var webpack = require('webpack');
var path = require('path');

module.exports={
  entry:path.join(__dirname,'/client/index.js'),
  output:{
    path:path.join(__dirname,'build'),
    filename:'bundle.js',
    publicPath:'/'
  },
  devtool:'eval',
  module:{
   rules:[
     {
       test:/\.jsx?$/,
       loader:'babel-loader',
       exclude:path.join(__dirname,'node_modules')
     },
     {
       test:/\.scss$/,
       loaders:['style-loader','css-loader','sass-loader']
     }
   ]
 },
}

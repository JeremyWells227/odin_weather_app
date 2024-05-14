 const { merge } = require('webpack-merge');
 const common = require('./webpack.common.js');
const HTMLWebpackPlugin = require('html-webpack-plugin')

 module.exports = merge(common, {
   mode: 'development',
   devtool: 'inline-source-map',
	plugins:[
			new HTMLWebpackPlugin({
				title: "Development",
				template: 'src/index.html',
				filename: 'index.html',
				inject: 'body',
			}
			)
	],
   devServer: {
     static: './dist',
		 watchFiles:{
			 paths: ['src/*'],
			 options:{
				 usePolling: false,
			 },
		 }
	 }
 });

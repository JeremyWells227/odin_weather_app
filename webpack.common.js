const path = require('path');
const webpack = require('webpack')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const Dotenv = require('dotenv-webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
	mode: "development",
	entry: './src/index.js',
	devtool: 'inline-source-map',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader','postcss-loader'],
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif)$/i,
				type: 'asset/resource',
			},


		],

	},
	plugins: [
		new HTMLWebpackPlugin({
			title: "Development",
			template: 'src/index.html',
			filename: 'index.html',
			inject: 'body',
		}
		),
		new Dotenv(),
		new MiniCssExtractPlugin({
			filename: "styles.css"
		})
	],
	devServer: {
		watchFiles: {
			paths: ['src/**'],
			options: {
				usePolling: false,
			}
		}
	}
};

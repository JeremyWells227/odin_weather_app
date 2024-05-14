const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin')

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
				use: ['style-loader', 'css-loader'],
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
		)
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

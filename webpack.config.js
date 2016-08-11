var webpack = require('webpack')
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
var path = require('path')
var env = require('yargs').argv.mode

var libraryName = 'react-fgql'

var plugins = []
var outputFile = libraryName + '.js'

if (env === 'build') {
	plugins.push(new UglifyJsPlugin({ minimize: true }))
	outputFile = libraryName + '.min.js'
}

plugins.push(new webpack.DefinePlugin({
	'process.env': {
		'NODE_ENV': env === 'build' ? '"production"' : "'development'"
	},
	'FUNCTION': '"function"',
	'STRING': '"string"',
	'BOOLEAN': '"boolean"',
	'NUMBER': '"number"'
}))

plugins.push(new webpack.optimize.OccurenceOrderPlugin())

const externals = {
	react: {
		root: 'react',
		commonjs2: 'react',
		commonjs: 'react',
		amd: 'react'
	},
	fgql: {
		root: 'fgql',
		commonjs2: 'fgql',
		commonjs: 'fgql',
		amd: 'fgql'
	}
}

var config = {
	externals: externals,
	entry: path.join(__dirname, '/src/index.js'),
	devtool: 'source-map',
	output: {
		path: path.join(__dirname, '/lib'),
		filename: outputFile,
		library: libraryName,
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		loaders: [
			{
				test: /(\.jsx|\.js)$/,
				loader: 'babel',
				exclude: /(node_modules)/
			},
			{
				test: /(\.jsx|\.js)$/,
				loader: 'eslint-loader',
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		root: path.resolve('./src'),
		extensions: ['', '.js']
	},
	plugins: plugins
}

module.exports = config

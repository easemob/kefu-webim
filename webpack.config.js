/*
	以下文件老版本会引用到，不能在服务器上彻底删除

	/static/js/em-open.js
	/static/js/em-transfer.js
*/

const path = require("path");
const webpack = require("webpack");
const i18next = require("i18next");
const _zh_cn_map_ = require("./src/i18n/zh-CN");
const _en_us_map_ = require("./src/i18n/en-US");

const argv = require("yargs").argv;
const lang = argv.lang || "zh-CN";
const tmpVersion = "local_" + (Math.floor(Math.random() * 1e6)).toString();
const VERSION = process.env.TAG_NAME || tmpVersion;

// package 中的 KEY_PATH 必须填，当活文档
var KEY_PATH = process.env.KEY_PATH;
var SLASH_KEY_PATH = KEY_PATH == "webim" ? "" : "/" + KEY_PATH;

var distPath = lang === "zh-CN" ? "" : lang;
var staticPath = lang === "zh-CN" ? "static" : "../static";
var conmmonConfig;
var transfer;
var easemob;
var app;
var appPageCached;
var taskList;


i18next.init({
	lng: lang,
	fallbackLng: false,
	keySeparator: ".",
	nsSeparator: false,
	saveMissing: true,
	resources: {
		"zh-CN": {
			translation: _zh_cn_map_,
		},
		"en-US": {
			translation: _en_us_map_,
		},
	},
});

conmmonConfig = {
	resolve: {
		alias: {
			"@": path.resolve("./src/js")
		},
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
			},
			test: /\.js$/i,
			sourceMap: true,
			comments: false,
			mangle: {
				screw_ie8: false,
			},
		}),
	],
	module: {
		loaders: [
			// HtmlWebpackPlugin 需要此 loader
			{
				test: /Tpl.html$/,
				loaders: [ "html-loader" ]
			},
			{
				test: /easemob\.scss$/,
				loaders: [
					"ie8-style-loader?sourceMap=true",
					"postcss-loader?sourceMap=true",
					"sass-loader?sourceMap=true",
				],
			},
			{
				test: /im\.html$/,
				loaders: [
					"file-loader?name=../../[name].[ext]",
					"extract-loader",
					"html-loader",
					"string-replace-loader"
						+ "?search=__STATIC_PATH__"
						+ "&replace=" + staticPath
						+ "&flags=g",
				],
			},
			{
				test: /transfer\.html$/,
				loaders: [
					"file-loader?name=../../[name].[ext]",
					"extract-loader",
					"html-loader",
				],
			},
			{
				test: /im\.scss$/,
				loaders: [
					"file-loader?name=../css/[name].css",
					"extract-loader",
					"css-loader?sourceMap=true",
					"postcss-loader?sourceMap=true",
					"sass-loader?sourceMap=true&importLoader=true"
				],
			},
			{
				test: require.resolve("./src/js/app/sdk/webim.config.js"),
				loader: "expose-loader?WebIM"
			},
			{
				test: require.resolve("underscore"),
				loader: "expose-loader?_"
			},
			{
				test: require.resolve("./src/js/app/lib/modernizr.js"),
				loader: "expose-loader?Modernizr"
			},
			{
				test: [
					/init\.js$/,
					/userAPI\.js$/,
					/im\.html/,
					/iframe\.js/,
					/transfer\.html/,
				],
				loader: "string-replace-loader",
				query: {
					search: "__WEBIM_PLUGIN_VERSION__",
					replace: VERSION,
					flags: "g",
				},
			},
			//
			{
				test: [
					/init\.js$/,
					/userAPI\.js$/,
					/uikit\/loading\.js$/,
					/tools\/messageFactory\.js$/,
					/transfer\/api.js$/,
				],
				loader: "string-replace-loader",
				query: {
					search: "__WEBIM_SLASH_KEY_PATH__",
					replace: SLASH_KEY_PATH,
					flags: "g",
				},
			},
			{
				test: /\.js$/,
				loader: "i18next-loader",
				query: {
					quotes: "\"",
				},
			},
			// 字体文件
			{
				test: /\.(eot|svg|ttf|woff|woff2)$/,
				loader: "file-loader",
				query: {
					name: "../css/font/[name]-[hash:6].[ext]",
				},
			},
		],
	},
};
if(!argv.production){
	conmmonConfig.devtool = "eval";
}

transfer = Object.assign({}, conmmonConfig, {
	name: "transfer",
	entry: [
		"./src/js/transfer/api.js",
		"./src/html/transfer.html",
	],
	output: {
		filename: "em-transfer.js",
		path: path.resolve(__dirname, "static/js"),
	},
});

easemob = Object.assign({}, conmmonConfig, {
	name: "easemob",
	entry: [
		"./src/js/common/polyfill",
		"./src/js/plugin/userAPI.js",
	],
	output: {
		filename: "easemob.js",
		path: path.resolve(__dirname, distPath, "."),
		// 不能用umd模块输出的原因是：
		// 监测到AMD Loader时只执行define，此时不会初始化模块，所以不会暴露到全局
		// library: 'easemob-kefu-webim-plugin',
		// libraryTarget: 'umd',
		// umdNamedDefine: true,
	},
});

app = Object.assign({}, conmmonConfig, {
	name: "app",
	entry: [
		"./src/js/app/modules/init.js",
		"./src/scss/im.scss",
		"./src/html/im.html",
	],
	output: {
		filename: "main.js",
		path: path.resolve(__dirname, distPath, "static/js"),
	},
});

appPageCached = Object.assign({}, conmmonConfig, {
	name: "appCached",
	entry: "./src/html/im.html",
	output: {
		filename: "appPageCached.js",
		path: path.resolve(__dirname, distPath, "."),
	},
	module: {
		loaders: [
			{
				test: /im\.html$/,
				loaders: [
					"file-loader?name=[name]_cached.[ext]",
					"extract-loader",
					"html-loader",
					"string-replace-loader"
						+ "?search=__STATIC_PATH__"
						+ "&replace=" + staticPath
						+ "&flags=g",
					"string-replace-loader"
						+ "?search=__WEBIM_PLUGIN_VERSION__"
						+ "&replace=" + VERSION
						+ "&flags=g",
				],
			},
		],
	},
});

taskList = [
	transfer,
	easemob,
	app,
	appPageCached,
];

module.exports = taskList;

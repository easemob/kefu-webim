/*
	以下文件老版本会引用到，不能在服务器上彻底删除
	/static/js/em-open.js
	/static/js/em-transfer.js		// 这是老文件？
*/
const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");
const argv = require("yargs").argv;
const fs = require("fs");
const isPrd = argv.env === "production";

// 自动生成配置
const CFG_PATH = path.join(__dirname, "server/cfg.js");
const CFG_CONTENT = "\
module.exports = {\n\
	appcfg: {\n\
		tenantId: '49',\n\
		robotId: 'b79f650a-6b35-4048-a971-ef73b5b0007d',\n\
		domain: 'sandbox.robot.easemob.com',\n\
	},\n\
	servercfg: {\n\
		port: 8010,\n\
		proxyto: 'sandbox.robot.easemob.com',\n\
		secure: false,\n\
	},\n\
};";
try{
	fs.statSync(CFG_PATH);
}
catch(e){
	fs.writeFileSync(CFG_PATH, CFG_CONTENT);
}
const cfg = require("./server/cfg");

const tmpVersion = "local_" + (Math.floor(Math.random() * 1e6)).toString();
const VERSION = argv["tag-name"] || tmpVersion;
const ORIGIN = 	(cfg.servercfg.secure ? "https" : "http") + "://localhost:" + cfg.servercfg.port;


//
const setEnvVariable = (key, value) => {
	const env = {};
	env[key] = JSON.stringify(value);
	return {
		plugins: [new webpack.DefinePlugin(env)],
	};
};

const setHtmlBuilder = ({ filename, template, opt = {} }) => ({
	plugins: [
		new HtmlWebpackPlugin({
			//
			filename,		// 输出地址（关联 entry.path）
			template,		// 模板路径（不关联 entry.path）
			hash: true,		// 是否 hash css & js
			cache: true,	// 确定文件变更才更新 hash
			inject: false,

			// 是否压缩，竟然无规则报错！？
			// 不能用 true，文档有误！
			minify: isPrd
				? {
					removeComments: true,
					collapseWhitespace: true,
					minifyJS: true,
					minifyCSS: true
				}
				: false,

			// 自定义 opt
			version: VERSION,

			//
			opt
		})
	]
});

// 多语言
const lang = argv.lang || "zh-CN";
const distPath = lang === "zh-CN" ? "" : lang;
const i18next = require("i18next");
const _zh_cn_map_ = require("./src/i18n/zh-CN");
const _en_us_map_ = require("./src/i18n/en-US");
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

// 语言目录深一层
const staticPath = lang === "zh-CN" ? "static" : "../static";
const commonCfg = merge([{

	bail: true,

	resolve: {
		alias: {
			"@": path.resolve("./src/js"),
		}
	},

	//
	module: {
		rules: [
			// HtmlWebpackPlugin 需要此 loader
			{
				test: /\.html$/,
				use: [ "html-loader" ]
			},



			// fonts
			{
				test: /\.(eot|ttf|woff|woff2|svg)$/,
				use: [
					// 这个也能解决，不如 file-loader 贴切
					// "url-loader",
					{
						loader: "file-loader",
						options: {
							outputPath: "../../static/fonts/",
							// font 加载问题，与 sourcemap 冲突
							// 基于 file-loader 的 outputPath = ../../static/fonts/
							publicPath: ORIGIN + "/webim/static/fonts/",
							name: "[name].[hash:8].[ext]"
						}
					}
				]
			},



			// 第三方注入，expose-loader 注入到 window 下的
			{
				test: require.resolve("underscore"),
				use: [
					"expose-loader?_"
				]
			},
			{
				test: require.resolve("./src/js/app/lib/modernizr.js"),
				use: [
					"expose-loader?Modernizr"
				]
			},
			{
				test: require.resolve("moment"),
				use: [
					"expose-loader?moment"
				]
			},



			// 版本注入
			{
				test: [
					/init\.js$/,
					/userAPI\.js$/,
				],
				use: [
					{
						loader: "string-replace-loader",
						options: {
							search: "__WEBIM_PLUGIN_VERSION__",
							replace: VERSION,
							flags: "g",
						}
					}
				]
			},



		],
	},
}]);


conmmonConfig = {
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
	devtool: "eval",
	module: {
		loaders: [
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
	devtool: false,
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

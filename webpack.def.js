/*
	以下文件老版本会引用到，不能在服务器上彻底删除
	/static/js/em-open.js
	/static/js/em-transfer.js		// 这是老文件？
*/
const HtmlWebpackPlugin = require("html-webpack-plugin");
const merge = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");

const tmpVersion = "local_" + (Math.floor(Math.random() * 1e6)).toString();
const VERSION = process.env["tag-name"] || tmpVersion;
const argv = require("yargs").argv;
const isPrd = argv.env === "production";


// 多语言
const lang = process.env.LOCALE;
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


//
module.exports = function(envcfg){
	const ORIGIN = 	(envcfg.servercfg.secure ? "https" : "http") + "://localhost:" + envcfg.servercfg.port;

	//
	const setEnvVariable = (key, value) => {
		const env = {};
		env[key] = JSON.stringify(value);
		return {
			plugins: [new webpack.DefinePlugin(env)],
		};
	};

	const setHtmlBuilder = ({
		filename,
		template,
		opt = {},
		inject = false,
		staticPath = "."
	}) => ({
		plugins: [
			new HtmlWebpackPlugin({
				//
				filename,		// 输出地址（关联 entry.path）
				template,		// 模板路径（不关联 entry.path）
				hash: true,		// 是否 hash css & js
				cache: true,	// 确定文件变更才更新 hash
				inject: inject,

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
				staticPath,

				//
				opt,
			})
		]
	});


	const commonCfg = merge([{

		bail: true,

		resolve: {
			alias: {
				"@": path.resolve("./src/js"),
			},
		},

		// 自定义 loader
		resolveLoader: {
			alias: {
				"template-loader": path.resolve("./loaders/template-loader.js"),
			},
		},

		//
		module: {
			rules: [
				// HtmlWebpackPlugin 需要此 loader
				// 内部 html 可以直接加载了，因为 html 被这个 loader 转换成 CommonJs 了
				// 添加一层 extract 脱壳，反而不能执行了
				// loader 外 -> 内 执行顺序
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
							// join output.path
								outputPath: "static/fonts/",
								// join outputPath
								// font 加载问题，与 sourcemap 冲突
								publicPath: ORIGIN + "/webim/",
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
						path.resolve("src/js/app/modules/init"),
						path.resolve("src/js/plugin/userAPI"),
						path.resolve("src/js/plugin/iframe"),
					],
					use: "imports-loader?__WEBIM_PLUGIN_VERSION__=>\"" + VERSION + "\""
				},



				// 多语言注入
				{
					test: /\.js$/,
					loader: "i18next-loader",
					query: {
						quotes: "\"",
					},
				},



			],
		},
	}]);

	let devCfg = merge([
		commonCfg,
		{
			devtool: "cheap-module-eval-source-map",
			module: {
				rules: [
					// sourcemap 有效
					{
						test: /(easemob|im)\.scss$/,
						use: [
						// 兼容 ie8 的 style-loader
							"ie8-style-loader?sourceMap=true",

							// "file-loader?outputPath=../../static/css/&name=im.css",
							// "extract-loader",

							"css-loader?sourceMap=true&importLoaders=2",	// 转换 CSS 为 CommonJS
							"postcss-loader?sourceMap=true",
							"sass-loader?sourceMap=true",
						],
					},
				]
			},
			plugins: [
				new webpack.HotModuleReplacementPlugin(),
			]
		}
	]);

	// production 才执行，以免影响速度
	let prdCfg = merge([
		commonCfg,
		setEnvVariable("process.env.NODE_ENV", "production"),
		{
			devtool: "source-map",
			plugins: [
				new webpack.optimize.UglifyJsPlugin({
					compress: {
						warnings: false
					},
					test: /\.js$/i,
					sourceMap: true,
					comments: false,
					mangle: {
						screw_ie8: false
					}
				})
			],
			module: {
				rules: [
					// 去除 sourcemap
					{
						test: /(easemob|im)\.scss$/,
						use: [
							"ie8-style-loader",
							"css-loader?importLoaders=2",
							"postcss-loader",
							"sass-loader",
						],
					},
				]
			}
		}
	]);

	let transfer = merge([
		setHtmlBuilder({
			filename: "transfer.html",
			template: "src/html/transfer.ejs",
		}),
		{
			name: "transfer",
			entry: ["./src/js/transfer/api.js"],
			output: {
				filename: "static/js/em-transfer.js",
				path: __dirname,			// 推荐取 root
				publicPath: "/webim/"		// 取 path 对应的 server 路径
			}
		}
	]);
	transfer = isPrd
		? transfer
		: merge([
			transfer,
			// append 的，不是替换
			{ entry: ["webpack-hot-middleware/client?name=transfer"] }
		]);

	let easemob = merge([
		setHtmlBuilder({
			filename: "demo.html",			// 输出地址（关联 entry.path）
			template: "src/html/demo.ejs",	// 模板路径（不关联 entry.path）
			// 其中 domain 在 travis 中不会被 build 成 localhost
			opt: envcfg.appcfg
		}),
		{
			name: "easemob",
			entry: [
				// 增加一个文件（用 require 在内部做）
				// "./src/js/common/polyfill",
				"./src/js/plugin/userAPI.js"
			],
			output: {
				filename: "easemob.js",
				path: lang === "zh-CN" ? __dirname : path.join(__dirname, lang),
				publicPath: "/webim/"		// 取 path 对应的 server 路径
				// 不能用 umd 模块输出的原因是：
				// 监测到 AMD Loader 时只执行 define，此时不会初始化模块，所以不会暴露到全局
				// library: "easemob-kefu-webim-plugin",
				// libraryTarget: "umd",
				// umdNamedDefine: true,
			}
		}
	]);
	easemob = isPrd
		? easemob
		: merge([
			easemob,
			{ entry: ["webpack-hot-middleware/client?name=easemob"] }
		]);

	let app = merge([
		setHtmlBuilder({
			filename: "im_cached.html",		// 输出地址（关联 entry.path）
			template: "src/html/im.ejs",	// 模板路径（不关联 entry.path）
			staticPath: lang === "zh-CN" ? "." : "..",	// 语言目录深一层
		}),
		setHtmlBuilder({
			filename: "im.html",
			template: "src/html/im.ejs",
			staticPath: lang === "zh-CN" ? "." : "..",
		}),
		{
			name: "main",	// 匹配 client?name=main
			entry: ["./src/js/app/modules/init.js"],
			output: {
				filename: "static/js/main.js",	// join output.path
				path: lang === "zh-CN" ? __dirname : path.join(__dirname, lang),
				publicPath: "/webim/"			// 取 path 对应的 server 路径
			}
		}
	]);
	app = isPrd
		? app
		: merge([
			app,
			{ entry: ["webpack-hot-middleware/client?name=main"] }
		]);

	//
	return isPrd
		? [
			merge([transfer, prdCfg]),
			merge([easemob, prdCfg]),
			merge([app, prdCfg])
		]
		: [
			merge([transfer, devCfg]),
			merge([easemob, devCfg]),
			merge([app, devCfg])
		];
};

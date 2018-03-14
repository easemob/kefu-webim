/*
	以下文件老版本会引用到，不能在服务器上彻底删除
	/static/js/em-open.js
	/static/js/em-transfer.js		// 这是老文件？
*/
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const merge = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");

const tmpVersion = "local_" + (Math.floor(Math.random() * 1e6)).toString();
const VERSION = process.env.TAG_NAME || tmpVersion;
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
	const _protocol = envcfg.servercfg.secure ? "https://" : "http://";
	const _domain = envcfg.appcfg.ajaxProxyDomain;
	const ORIGIN_ON_DEV = _protocol + _domain;

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
	}) => ({
		plugins: [
			new HtmlWebpackPlugin({
				//
				filename,		// 输出地址（关联 entry.path）
				template,		// 模板路径（不关联 entry.path）
				// hash: true,		// 是否 hash css & js
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

				// 来自打包的
				version: VERSION,
				isPrd,

				// 来自配置的
				opt,
			})
		]
	});

	// PRODUCTION ONLY
	var extractCSS = ({ test, include, exclude, use }) => {
		// Output extracted CSS to a file
		const plugin = new ExtractTextPlugin({
			// 加入 hash 版本号
			// filename: "static/css/im.[contenthash:8].css",
			filename: "static/css/im.css",
			// `allChunks` is needed with CommonsChunkPlugin to extract from extracted chunks as well
			// allChunks: true,
		});
		return {
			module: {
				rules: [{
					test,
					include,
					exclude,
					// 这是一个 loader
					use: plugin.extract({
						use,
						// loader(e.g 'style-loader') that should be used when the CSS is not extracted (i.e. in an additional chunk when allChunks: false)
						fallback: "ie8-style-loader",
					}),
				}],
			},
			plugins: [plugin],
		};
	};

	var setFonts = ({ publicPath }) => {
		var options = {
			// join output.path
			outputPath: "static/fonts/",
			name: "[name].[hash:8].[ext]"
		};
		publicPath && (options.publicPath = publicPath);
		return {
			test: /\.(eot|ttf|woff|woff2|svg)$/,
			use: [
				// 这个也能解决，不如 file-loader 贴切
				// "url-loader",
				{
					loader: "file-loader",
					options
				}
			]
		};
	};

	var setImages = ({ include, exclude, options } = {}) => ({
		module: {
			rules: [{
				test: /\.(png|jpg|jpeg)$/,
				include,
				exclude,
				use: {
					loader: "url-loader",
					options
				},
			}]
		}
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
			// ExtractTextPlugin 只支持 source-map
			devtool: "source-map",
			// devtool: "cheap-module-eval-source-map",
			module: {
				rules: [
					// sourcemap 有效
					{
						test: /(im|easemob)\.scss$/,
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
					// 取 output.path 对应的 server 路径
					// font 加载问题，与 sourcemap 冲突
					setFonts({
						publicPath: ORIGIN_ON_DEV + "/webim/" + lang + "/"
					}),
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
		// file-loader 不能注入 HtmlWebpackPlugin
		// 单独导出的 css 不能支持 hot
		extractCSS({
			test: /im\.scss$/,
			use: [
				"css-loader?importLoaders=2",
				"postcss-loader",
				"sass-loader",
			]
		}),
		{
			// 关闭
			// devtool: "source-map",
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
						test: /easemob\.scss$/,
						use: [
							"ie8-style-loader",
							"css-loader?importLoaders=2",
							"postcss-loader",
							"sass-loader",
						],
					},
					// 不加 publicPath
					setFonts({}),
				]
			}
		}
	]);


	//
	let i18nOutputPath = path.join(__dirname, "build/" + lang);
	let i18nPublicPath = "/webim/" + lang + "/";
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
				path: i18nOutputPath,		// 建议取相对 root
				publicPath: i18nPublicPath	// 取 output.path 对应的 server 路径
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
				path: i18nOutputPath,
				publicPath: i18nPublicPath	// 取 output.path 对应的 server 路径
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
		}),
		setHtmlBuilder({
			filename: "im.html",
			template: "src/html/im.ejs",
		}),
		{
			name: "main",	// 匹配 client?name=main
			entry: ["./src/js/app/modules/init.js"],
			output: {
				filename: "static/js/main.js",	// join output.path
				path: i18nOutputPath,
				publicPath: i18nPublicPath		// 取 output.path 对应的 server 路径
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

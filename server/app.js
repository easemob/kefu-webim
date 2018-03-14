const express = require("express");
const httpProxy = require("http-proxy");
const path = require("path");
const fs = require("fs");
const argv = require("yargs").argv;
const https = require("https");
const http = require("http");

var colors = require("colors/safe");
const debug = require("debug");
const logSocket = debug("webim:socket");
const logProxy = debug("webim:proxy");
const logErr = debug("webim:error");
const currentPath = __dirname;
const wwwRoot = path.resolve(currentPath, "..");

// 只要需要 cfg 的地方，就要引用 validator
const cfgValidator = require("./cfgValidator");
cfgValidator
.then(function(){
	var webpack = require("webpack");
	var webpackConfig = require("../webpack.config");
	var devmidware = require("webpack-dev-middleware");
	var hotmidware = require("webpack-hot-middleware");
	var compiler;
	const envcfg = require("./cfg");

	const port = envcfg.servercfg.port;			// 不能有私有默认值
	const targetHost = envcfg.servercfg.proxyto;	// 不能有私有默认值
	const proxyTarget = `http://${targetHost}`;		// server to server 不搞 secure
	console.log(`\nbackend: ${proxyTarget}`);

	//
	const proxy = httpProxy.createProxyServer();
	const app = express();
	const PROXY_REGEX = [
		/^\/(v1)/i,
		/^\/socket\/info/i,
	];
	proxy.on("error", e => logErr(e));

	if(!argv.only){
		// dev 模式下返回的是 promise
		webpackConfig()
		.then((webpackDef) => {
			hmr(webpackDef);
			routing();
			proxying();
		});
	}
	else{
		routing();
		proxying();
	}

	let server;
	if(envcfg.servercfg.secure){
		server = https
		.createServer(
			{
				key: fs.readFileSync(currentPath + "/ssl.key"),
				cert: fs.readFileSync(currentPath + "/ssl.crt")
			},
			app
		)
		.listen(
			port,
			() => {
				console.log(`webim https SERVER running @: https://localhost:${port}/webim/\n`);
				argv.only && openOnScreen();
			}
		);
	}
	else{
		server = http
		.createServer(app)
		.listen(
			port,
			() => {
				console.log(`webim http SERVER running @: http://localhost:${port}/webim/\n`);
				argv.only && openOnScreen();
			}
		);
	}
	server.on("error", e => logErr(e));

	// ws proxy
	let wsProxy = httpProxy.createProxyServer({ ws: true });
	wsProxy.on("error", e => logErr(e));
	server.on("upgrade", function(req, sock, head){
		logSocket(req.url);
		// req.headers.host = targetHost;
		// server to server 不搞 secure
		wsProxy.ws(req, sock, head, { target: `ws://${envcfg.servercfg.proxyto}` });
	});

	//
	function hmr(webpackDef){
		compiler = webpack(webpackDef);
		app.use(devmidware(compiler, {
			watchOptions: {
				ignored: /node_modules/
			},
		}));
		app.use(hotmidware(compiler, {
			// log: console.log,
			// path: "/__webpack_hmr",
			// heartbeat: 2000
		}));
	}
	function routing(){
		// i18n
		app.use("/webim", express["static"](path.join(wwwRoot, "build")));

		// 默认跳转
		app.get("/", function(req, res, next){
			// res.location("/webim/demo.html");
			res.redirect("/webim/zh-CN/demo.html");
		});
		app.get("/webim", function(req, res, next){
			res.redirect("/webim/zh-CN/demo.html");
		});

		// 兼容旧版（only zh-CN）
		// 控制好 html 就行
		app.get("/webim/demo.html", function(req, res, next){
			res.redirect("/webim/zh-CN/demo.html");
		});
		app.get("/webim/im.html", function(req, res, next){
			res.redirect("/webim/zh-CN/im.html");
		});
		app.get("/webim/im_cached.html", function(req, res, next){
			res.redirect("/webim/zh-CN/im_cached.html");
		});
		app.get("/webim/transfer.html", function(req, res, next){
			res.redirect("/webim/zh-CN/transfer.html");
		});
	}
	function proxying(){
		app.use((req, res, next) => {
			var pathname = req.path;
			// 限制一下，避免请求到服务器资源，误判
			if(
				PROXY_REGEX.reduce(
					(pre, cur) => (pre || cur.test(pathname)),
					PROXY_REGEX[0].test(pathname)
				)
			){
				logProxy(pathname, proxyTarget);
				// 后端要靠这个header来区分走不同的服务，唉，说多了都是眼泪
				// req.headers.host = targetHost;
				proxy.web(req, res, { target: proxyTarget }, next);
			}
		});
	}
	function openOnScreen(){
		console.log(colors.cyan("OPEN Browser...\n"));
	}
});

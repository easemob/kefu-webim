const express = require("express");
const httpProxy = require("http-proxy");
const path = require("path");
const fs = require("fs");
const argv = require("yargs").argv;
const https = require("https");
const http = require("http");

const cfg = require("./cfg");
const debug = require("debug");
const logSocket = debug("webim:socket");
const logProxy = debug("webim:proxy");
const logErr = debug("webim:error");

var webpack = require("webpack");
var webpackConfig = require("../webpack.config");
var devmidware = require("webpack-dev-middleware");
var hotmidware = require("webpack-hot-middleware");
var compiler;

const port = cfg.servercfg.port;			// 不能有私有默认值
const targetHost = cfg.servercfg.proxyto;	// 不能有私有默认值
const proxyTarget = `http://${targetHost}`;	// server to server 不搞 secure

const currentPath = __dirname;
const wwwRoot = path.resolve(currentPath, "..");

// http proxy
console.log(`backend: ${proxyTarget}`);
const PROXY_REGEX = [
	/^\/(v1)/i,
	/^\/socket\/info/i,
];
const proxy = httpProxy.createProxyServer();
proxy.on("error", e => logErr(e));

//
const app = express();
if(!argv.only){
	compiler = webpack(webpackConfig);
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
app.get("/", function(req, res, next){
	// res.location("/webim/demo.html");
	res.redirect("/webim/demo.html");
});
app.get("/webim", function(req, res, next){
	res.redirect("/webim/demo.``html");
});
app.use("/webim", express["static"](wwwRoot));
app.use((req, res, next) => {
	var pathname = req.path;
	// 限制一下，避免请求到服务器资源，误判
	if(
		PROXY_REGEX.reduce(
			(pre, cur) => (pre || cur.test(pathname)),
			PROXY_REGEX[0].test(pathname)
		)
	){
		logProxy(pathname);
		// req.headers.host = targetHost;
		proxy.web(req, res, { target: proxyTarget }, next);
	}
});

let server;
if(cfg.servercfg.secure){
	server = https
	.createServer({
		key: fs.readFileSync(currentPath + "/ssl.key"),
		cert: fs.readFileSync(currentPath + "/ssl.crt"),
	}, app)
	.listen(
		port,
		() => console.log(`webim https SERVER running @: https://localhost:${port}/webim/`)
	);
}
else{
	server = http
	.createServer(app)
	.listen(
		port,
		() => console.log(`webim http SERVER running @: http://localhost:${port}/webim/`)
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
	wsProxy.ws(req, sock, head, { target: `ws://${cfg.servercfg.proxyto}` });
});

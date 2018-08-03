const express = require("express");
const httpProxy = require("http-proxy");
const path = require("path");
const fs = require("fs");
const program = require("commander");
const https = require("https");
const http = require("http");
const debug = require("debug");

const DEFAULT_PORT = 8008;
const DEFAULT_DOMAIN = "sandbox.kefu.easemob.com";
const DEFAULT_SERVER = `http://${DEFAULT_DOMAIN}`;

// package 中的 KEY_PATH 必须填，当活文档
const KEY_PATH = process.env.KEY_PATH;		// 默认 "webim"
const SLASH_KEY_PATH = KEY_PATH == "webim" ? "" : ("/" + KEY_PATH);
const PROXY_REGEX = [
	new RegExp(SLASH_KEY_PATH + "/v1", "i")
];

const logProxy = debug("webim:proxy");
const logBypass = debug("webim:bypass");
const logErr = debug("webim:error");

program
.version("0.0.2")
.option(`-p, --port <n>", "listen port, default ${DEFAULT_PORT}`, parseInt)
.option(
	"-t, --target [domain]",
	`backend domain name, default: ${DEFAULT_DOMAIN}`
)
.parse(global.process.argv);

const port = program.port || DEFAULT_PORT;
const target = typeof program.target === "string"
	? "http://" + program.target + "/"
	: DEFAULT_SERVER;

const currentPath = __dirname;
const wwwRoot = path.resolve(currentPath, "..");

const app = express();

app.use(SLASH_KEY_PATH + "/webim", express["static"](wwwRoot));

const proxy = httpProxy.createProxyServer();
proxy.on("error", e => logErr(e));

app.use((req, res, next) => {
	var pathname = req.path;
	if(
		PROXY_REGEX.reduce(
			(pre, cur) => (pre || cur.test(pathname)),
			PROXY_REGEX[0].test(pathname)
		)
	){
		logProxy(pathname);
		req.url = req.url.replace(SLASH_KEY_PATH, "");
		proxy.web(req, res, { target }, next);
	}
	else{
		logBypass(pathname);
	}
});

console.log(`backend: ${target}`);

// http server
http.createServer(app)
.listen(port, () => console.log(`
http SERVER running @:
http://localhost:${port}${SLASH_KEY_PATH}/webim/demo.html
`));

// https server
https.createServer({
	key: fs.readFileSync(currentPath + "/ssl.key"),
	cert: fs.readFileSync(currentPath + "/ssl.crt"),
}, app)
.listen(port + 1, () => console.log(`
https SERVER running @:
https://localhost:${port}${SLASH_KEY_PATH}/webim/demo.html
`));

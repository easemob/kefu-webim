const express = require("express");
const httpProxy = require("http-proxy");
const path = require("path");
const fs = require("fs");
const program = require("commander");
const https = require("https");
const http = require("http");
const debug = require("debug");

const DEFAULT_PORT = 8008;
const DEFAULT_SERVER = "http://sandbox.kefu.easemob.com/";
const PROXY_REGEX = /^\/v1/i;

const logProxy = debug("webim:proxy");
const logBypass = debug("webim:bypass");
const logErr = debug("webim:error");

program
.version("0.0.1")
.option("-p, --port <n>", "listen port, default 8080", parseInt)
.option(
	"-t, --target [domain]",
	"backend domain name, default: sandbox.kefu.easemob.com"
)
.parse(global.process.argv);

const port = program.port || DEFAULT_PORT;
const target = typeof program.target === "string"
	? "http://" + program.target + "/"
	: DEFAULT_SERVER;

const currentPath = __dirname;
const wwwRoot = path.resolve(currentPath, "..");

const app = express();

app.use("/webim", express["static"](wwwRoot));

const proxy = httpProxy.createProxyServer();
proxy.on("error", e => logErr(e));

app.use((req, res, next) => {
	var pathname = req.path;

	if(PROXY_REGEX.test(pathname)){
		logProxy(pathname);
		proxy.web(req, res, { target }, next);
	}
	else{
		logBypass(pathname);
	}
});

console.log(`backend: ${target}`);

// http server
http.createServer(app).listen(port, () => console.log(`
webim http SERVER running @:
http://localhost:${port}/webim/
`));

// https server
https.createServer({
	key: fs.readFileSync(currentPath + "/ssl.key"),
	cert: fs.readFileSync(currentPath + "/ssl.crt"),
}, app)
.listen(port + 1, () => console.log(`
webim https SERVER running @:
https://localhost:${port + 1}/webim/
`));

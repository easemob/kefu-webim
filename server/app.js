const express = require("express");
const httpProxy = require("http-proxy");
const path = require("path");
const fs = require("fs");
const program = require("commander");
const https = require("https");
const http = require("http");
const debug = require("debug");
const os = require('os')

/**
 * 获取当前机器的ip地址
 */
function getIpAddress() {
  var interfaces=os.networkInterfaces()

  for (var dev in interfaces) {
    let iface = interfaces[dev]

    for (let i = 0; i < iface.length; i++) {
      let {family, address, internal} = iface[i]

      if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
        return address
      }
    }
  }
}

const ipAddress = getIpAddress()
console.log("ipAddress", ipAddress)
const DEFAULT_PORT = 8008;
// const DEFAULT_DOMAIN = "sandbox.kefu.easemob.com";
// const DEFAULT_DOMAIN = "metlife-kefuim.easemob.com";
const DEFAULT_DOMAIN = "kefuim-uat.metlife.com.cn"; // 大都会 uat环境//218.97.57.168
// const DEFAULT_DOMAIN = "ddim-bau.metlife.com.cn"; // 大都会 bau环境//218.97.57.157
// const DEFAULT_DOMAIN = "opsim-uat.metlife.com.cn";//218.97.57.168
// http://localhost:8008/webim/im.html?configId=6b3b9442-a44a-4bba-aae4-e4b2e250700f&menutype=1

// const DEFAULT_SERVER = `http://${DEFAULT_DOMAIN}`;
const DEFAULT_SERVER = `https://${DEFAULT_DOMAIN}`; // 只有在 bau 环境 https 才放开！！！

// package 中的 KEY_PATH 必须填，当活文档
const KEY_PATH = process.env.KEY_PATH;		// 默认 "webim"
const SLASH_KEY_PATH = KEY_PATH == "webim" ? "" : ("/" + KEY_PATH);
// 代理！！！
const PROXY_REGEX = [
	new RegExp(SLASH_KEY_PATH + "/v1", "i"),
	new RegExp(SLASH_KEY_PATH + "/v6", "i")
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
		// 增加代理域名（只有在 bau 环境 https 才放开！！！）
		req.headers.host = DEFAULT_DOMAIN
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
https://localhost:${port+1}${SLASH_KEY_PATH}/webim/demo.html
`));

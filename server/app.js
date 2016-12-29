'use strict';

const colors = require("colors");
const express = require('express');
const httpProxy = require('http-proxy');
const path = require('path');
const fs = require('fs');
const program = require('commander');
const https = require('https');
const os = require('os');

// todo list:
// 增加https指定代理地址支持
// 修改日志输出
// 增加指定wwwRoot目录

var logProxy = require('debug')('kefu:proxy');
var logBypass = require('debug')('kefu:bypass');
var logErr = require('debug')('kefu:error');

program
	.version('0.0.1')
	.option('-p, --port <n>', 'listen port, default 8080', parseInt)
	.option(
		'-t, --target [domain]',
		'backend domain name, default: sandbox.kefu.easemob.com'
	)
	.option('-s, --ssl', 'use ssl for http')
	.parse(process.argv);

const port = program.port || 8080;
const isSSL = !!program.ssl;
const protocol = isSSL ? 'https:' : 'http:';
const target = protocol + parseTarget(program.target);

const currentPath = path.dirname(__filename);
const wwwRoot = path.resolve(currentPath, '..');

var app = express();
app.use('/webim', express.static(wwwRoot));


if(program.target){
	// http proxy
	var proxy = httpProxy.createProxyServer();
	var cfg = {
		target: target,
		port: null,
	};
	app.use(function(req, res, next){
		logBypass(req.path);
		if(/^\/v1/.test(req.path)){
			proxy.web(req, res, cfg, next);
		}
		else{
			logErr('assert failed!');
			proxy.web(req, res, cfg, next);
		}
	});
	proxy.on('error', function(e){
		logErr(e);
	});
}

if(isSSL){
	// https server
	https.createServer({
		key: fs.readFileSync(currentPath + '/ssl.key'),
		cert: fs.readFileSync(currentPath + '/ssl.crt'),
	}, app).listen(port);
	printConfig();
}
else{
	// http server
	var server = app.listen(port, printConfig);
	server.on('upgrade', function(req, sock, head){
		console.log('upgrade', req.url);
	});
	server.on('error',function(e){
		console.log('server.err', e);
	});
}

function printConfig() {
	console.log([
		'',
		'kefu-webim WEB SERVER running @:'.rainbow,
		(protocol + '//localhost:' + port + '/webim').cyan,
		('target: ' + (program.target ? target : 'none')).yellow,
		'',
	].join('\n'));
}

function parseTarget(target) {
	if(true === target){
		return '//sandbox.kefu.easemob.com/'
	}
	else if('string' === typeof target){
		return '//' + target + '/';
	}
	else{
		return false;
	}
}

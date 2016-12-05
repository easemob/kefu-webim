
var colors = require("colors");
var express = require('express');
var httpProxy = require('http-proxy');
var path = require('path');
var fs = require('fs');

var logProxy = require('debug')('kefu:proxy');
var logBypass = require('debug')('kefu:bypass');
var logErr = require('debug')('kefu:error');

var app = express();
var staticroot = path.resolve(path.dirname(__filename), '..');


// res static
// app.use(express.static(staticroot));
app.use('/webim', express.static(staticroot));

// // http proxy
// var proxy = httpProxy.createProxyServer();
// var cfg = {
// 	forward: {
// 		// "target": "http://kefu.easemob.com/",
// 		"target": "http://sandbox.kefu.easemob.com/",
// 		"port": null,	// default 8010
// 	}
// };

// app.use(function(req, res, next){
// 	logBypass(req.path);
// 	if(/^\/v1/.test(req.path)){
// 		proxy.web(req, res, cfg.forward, next);
// 	}
// 	else{
// 		logErr('assert failed!');
// 		proxy.web(req, res, cfg.forward, next);
// 	}
// });

// proxy.on('error', function(e){
// 	logErr(e);
// });




// start server
var port = 8080;
var server = app.listen(port, function(){
	console.log(
		'\n\n\n',
		'kefu-webim PROXY SERVER running @:'.rainbow,
		('http://localhost:' + port).cyan,
		'\n'
	);
});
server.on('upgrade', function(req, sock, head){
	console.log('upgrade', req.url);
});
server.on('error',function(e){
	console.log('server.err', e);
});


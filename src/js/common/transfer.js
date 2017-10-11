

var isPostMessageSupportObj = (function(){
	var supportObject = true;
	try{
		window.postMessage({
			toString: function(){
				supportObject = false;
			}
		}, "*");
	}
	catch(e){}
	return supportObject;
})();

function handleMsg(e, callback, accept){
	// 兼容旧版的标志
	var flag = false;
	var data = e.data;
	var msg;
	var i;
	var l;

	// 47.9 及以后的版本 postMessage 会传 object （如果浏览器支持的话）
	if(typeof data === "object"){
		msg = data;
	}
	// 47.9 以前的版本或者浏览器不支持时 postMessage 会传 JSON.stringigy 后得到的字符串，需要解析
	else if(typeof data === "string"){
		try{
			msg = JSON.parse(data);
		}
		catch(err){}

		if(typeof msg !== "object"){
			return;
		}
	}

	if(accept && accept.length){
		for(i = 0, l = accept.length; i < l; i++){
			if(msg.key === accept[i]){
				flag = true;
				typeof callback === "function" && callback(msg);
			}
		}
	}
	else{
		typeof callback === "function" && callback(msg);
	}

	if(!flag && accept){
		for(i = 0, l = accept.length; i < l; i++){
			if(accept[i] === "data"){
				typeof callback === "function" && callback(msg);
				break;
			}
		}
	}
}

var Transfer = function(iframeId, key, useObject){
	if(!(this instanceof Transfer)){
		return new Transfer(iframeId);
	}
	this.key = key;
	this.iframe = document.getElementById(iframeId);
	this.origin = location.protocol + "//" + location.host;
	this.useObject = useObject;
};

Transfer.prototype.send = function(msg, to){

	msg.origin = this.origin;

	msg.key = this.key;

	if(this.to){
		msg.to = this.to;
	}
	else if(to){
		msg.to = to;
	}

	// this.useObject 在实例化时指定
	// msg.useObject 在调用 send 时指定
	// 这两种情况都有效，之所以这样设计是为了兼容老版本
	// 因为 em-transfer.js 总是最新版的，main.js 可能是老版本的
	// 所以需要在通信的 msg 中增加 useObject，用来指示使用哪种方式
	if(!(isPostMessageSupportObj && (this.useObject || msg.useObject))){
		msg = JSON.stringify(msg);
	}

	if(this.iframe){
		this.iframe.contentWindow.postMessage(msg, "*");
	}
	else{
		window.parent.postMessage(msg, "*");
	}
	return this;
};

Transfer.prototype.listen = function(callback, accept){
	var me = this;

	if(window.addEventListener){
		window.addEventListener("message", function(e){
			handleMsg.call(me, e, callback, accept);
		}, false);
	}
	else if(window.attachEvent){
		window.attachEvent("onmessage", function(e){
			handleMsg.call(me, e, callback, accept);
		});
	}
	return this;
};

module.exports = Transfer;

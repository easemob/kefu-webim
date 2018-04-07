var utils = require("@/common/utils");
// 不包括 avatar
// app only
var kefuRoot;
var ajaxProxy = {
	transferHtml: "transfer.html",
};

module.exports = {
	init: function(ajaxProxyDomain){
		var kefuPath;
		var sameProtocolAjaxProxyDomain = utils.sameProtocol(ajaxProxyDomain);
		// 再加上，正则好写
		kefuPath = sameProtocolAjaxProxyDomain + "/webim/" + __LANGUAGE__ + "/";
		kefuRoot = sameProtocolAjaxProxyDomain + "/";
		_.each(ajaxProxy, function(v, k){
			ajaxProxy[k] = kefuPath + v;
		});
	},
	getRes: function(){
		return ajaxProxy;
	},
	getToBackend: function(path){
		if(!kefuRoot) throw new Error("kefuRoot not found!");
		path = path.replace(/^\//, "");	// 去掉开头的 /
		return kefuRoot + path;
	},
};


// 不包括 avatar
// app only
var kefuRoot;
var ajaxProxy = {
	transterHtml: "transfer.html",
};

module.exports = {
	init: function(ajaxProxyDomain){
		var kefuPath;
		// 全清理
		ajaxProxyDomain = ajaxProxyDomain.replace(/^http[s]?:/, "");
		ajaxProxyDomain = ajaxProxyDomain.replace(/^\/\//, "");
		// 再加上，正则好写
		kefuPath = "//" + ajaxProxyDomain + "/webim/" + __LANGUAGE__ + "/";
		kefuRoot = "//" + ajaxProxyDomain + "/";
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

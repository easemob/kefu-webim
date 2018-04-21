var utils = require("@/common/kit/utils");

// 不包括 avatar
// app only
var kefuRoot;
var ajaxProxy = {
	transferHtml: "transfer.html",
};

module.exports = {
	init: function(path){
		kefuRoot = path;
		_.each(ajaxProxy, function(v, k){
			ajaxProxy[k] = utils.mergePath(kefuRoot, "/webim/", __LANGUAGE__, v);
		});
	},
	getRes: function(){
		return ajaxProxy;
	},
	getToBackend: function(path){
		if(!kefuRoot) throw new Error("kefuRoot not found!");
		return utils.mergePath(kefuRoot, path);
	},
};

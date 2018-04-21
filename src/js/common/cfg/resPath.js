var utils = require("@/common/kit/utils");

// plugin only
var res = {
	dragImg: "static/img/drag.png",
	imCachedHtml: "im_cached.html",
};

module.exports = {
	initRes: function(staticPath){
		staticPath = staticPath || "";
		_.each(res, function(v, k){
			res[k] = utils.mergePath(staticPath, v);
		});
	},
	getRes: function(){
		return res;
	},
};

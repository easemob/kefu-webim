
// plugin only
var res = {
	dragImg: "static/img/drag.png",
	imCachedHtml: "im_cached.html",
};

module.exports = {
	initRes: function(staticPath){
		staticPath = staticPath || "";
		_.each(res, function(v, k){
			res[k] = staticPath + v;
		});
	},
	getRes: function(){
		return res;
	},
};

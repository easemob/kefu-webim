var domUtils =		require("@/common/kit/domUtils");
var classUtils =	require("@/common/kit/classUtils");
var Const =			require("@/common/cfg/const");
var tpl =			require("./template/loadingTpl.html");

var ins;
var Loading = classUtils.createView({
	init: function(){
		this.$el = domUtils.appendHTMLToBody(_.template(tpl)({
			loadingSvg: Const.loadingSvg,
		}));
	},
	show: function(){
		this.$el.style.display = "block";
	},
	hide: function(){
		this.$el.style.display = "none";
	}
});

module.exports = {
	show: function(){
		ins = ins || new Loading();
		ins.show();
	},
	hide: function(){
		ins = ins || new Loading();
		ins.hide();
	}
};

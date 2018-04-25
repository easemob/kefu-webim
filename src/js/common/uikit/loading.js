var domUtils =		require("@/common/kit/domUtils");
var classUtils =	require("@/common/kit/classUtils");
var Const =			require("@/common/cfg/const");
var resPath =		require("@/common/cfg/resPath");
var Dialog =		require("@/common/uikit/dialog");
var tpl =			require("./template/loadingTpl.html");
var rtpl =			require("./template/regularLoadingTpl.html");
var LOADING = Modernizr.inlinesvg
	? Const.loadingSvg
	: _.template(rtpl)({
		src: resPath.getRes().loadingImg
	});

var Loading = classUtils.createView({
	dialog: null,
	init: function(){
		this.$el = domUtils.createElementFromHTML(_.template(tpl)({
			loadingContent: LOADING
		}));
		this.dialog = new Dialog({
			contentDom: this.$el,
			className: "loading"
		});
	},
	show: function(){
		this.dialog.show();
	},
	hide: function(){

	},
});

var loading = new Loading();
var showLoadingObj = {};
function _show(secret){
	showLoadingObj[secret] = 1;
	loading.show();
}
function _hide(secret){
	delete showLoadingObj[secret];
	if(_.isEmpty(showLoadingObj)){
		loading.hide();
	}
}

module.exports = {
	show: _show,
	hide: _hide,
};

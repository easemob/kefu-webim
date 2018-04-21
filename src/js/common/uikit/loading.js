var utils =		require("@/common/kit/utils");
var Const =		require("@/common/cfg/const");
var uikit =		require("@/common/uikit/dialog");

var LOADING = Modernizr.inlinesvg ? Const.loadingSvg : "<img src=\"static/img/loading.gif\" width=\"20\" style=\"margin-top:10px;\"/>";

var dialog;
var showLoadingObj = {};

var _init = _.once(function(){
	var dom = utils.createElementFromHTML("<div class=\"wrapper\">" + LOADING + "</div>");
	dialog = uikit.createDialog({
		contentDom: dom,
		className: "loading"
	});
});

function _show(secret){
	_init();
	showLoadingObj[secret] = true;
	dialog.show();
}

function _hide(secret){
	delete showLoadingObj[secret];
	if(_.isEmpty(showLoadingObj)){
		dialog.hide();
	}
}

module.exports = {
	show: _show,
	hide: _hide,
};

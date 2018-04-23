var domUtils =	require("@/common/kit/domUtils");
var Const =		require("@/common/cfg/const");

var loadingDom;
var loadingHtml = [
	"<div class=\"easemobim-prompt-wrapper\">",
	"<div class=\"loading\">",
	Const.loadingSvg,
	"</div>",
	"</div>"
].join("");

function init(){
	loadingDom = loadingDom
		? loadingDom
		: domUtils.appendHTMLToBody(loadingHtml);
}

module.exports = {
	show: function(){
		init();
		loadingDom.style.display = "block";
	},
	hide: function(){
		init();
		loadingDom.style.display = "none";
	}
};

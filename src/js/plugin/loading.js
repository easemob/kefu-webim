var utils = require("../common/utils");
var _const = require("../common/const");

var loadingDom;
var loadingHtml = [
	"<div class=\"easemobim-prompt-wrapper\">",
	"<div class=\"loading\">",
	_const.loadingSvg,
	"</div>",
	"</div>"
].join("");

function init(){
	loadingDom = loadingDom
		? loadingDom
		: utils.appendHTMLToBody(loadingHtml);
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

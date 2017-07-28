
var utils = require("../common/utils");
var _const = require("../common/const");

var loadingDom = utils.appendHTMLToBody([
	"<div class=\"easemobim-prompt-wrapper\">",
	"<div class=\"loading\">",
	_const.loadingSvg,
	"</div>",
	"</div>"
].join(""));

module.exports = {
	show: function(){
		loadingDom.style.display = "block";
	},
	hide: function(){
		loadingDom.style.display = "none";
	}
};

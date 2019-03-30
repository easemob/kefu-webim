var apiHelper = require("@/app/common/apiHelper");
var utils = require("@/common/utils");
var tpl = require("./indexTpl.html");

module.exports = function(){
	var container = document.querySelector(".em-self-wrapper .faq-list-content");

	container.innerHTML = "";

	apiHelper.getFaqList()
	.then(function(data){
		container.innerHTML = _.template(tpl)({
			faq: data
		});
		utils.live(".question", "click", onMenuClick, container);
	});

	// 菜单点击
	function onMenuClick(e){
		var target = e.srcElement || e.target;
		utils.toggleClass(target.parentNode, "hide-answer");
		e.stopPropagation();
		return false;
	}
};

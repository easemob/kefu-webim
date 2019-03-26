var apiHelper = require("@/app/pages/main/apiHelper");
var commonConfig = require("@/common/config");
var utils = require("@/common/utils");
var tpl = require("./indexTpl.html");

module.exports = function(){
	var container = document.querySelector(".em-self-wrapper .faq-list-content");
	var configId = commonConfig.getConfig().configId;
	container.innerHTML = "";

	apiHelper.getFaqList(configId)
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

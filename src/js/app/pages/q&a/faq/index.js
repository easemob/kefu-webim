var apis = require("../apis");
var utils = require("@/common/utils");
var container_tpl = require("./indexTpl.html");
var item_tpl = require("./itemTpl.html");

module.exports = function(){
	var container = $(_.template(container_tpl)({
		faq: __("common.faq"),
	}));

	apis.getFaqList()
	.then(function(data){
		_.each(data, function(itm){
			itm.content = utils.encode(itm.content);
			itm.content = utils.parseUrl(itm.content);
		});
		container.removeClass("hide");
		container.find(".faq-list-content").append(_.template(item_tpl)({
			faq: data,
		}));
		container.delegate(".question", "click", onMenuClick);
		container.delegate(".question>i", "click", function(e){
			e.target.parentNode.click();
		});
	});

	// 菜单点击
	function onMenuClick(e){
		var issueId = e.target.getAttribute("data-id");
		issueId && apis.recordFaqClick(issueId);	// 统计
		utils.toggleClass(e.target.parentNode, "hide-answer");
		utils.stopPropagation();
		return false;
	}

	// APIs
	this.$el = container;
	this.show = function(){
	};
};

var apis = require("../apis");
var utils = require("@/common/utils");
var container_tpl = require("./indexTpl.html");
var item_tpl = require("./itemTpl.html");
var btn_tpl = require("./btnTpl.html");

var _const = require("@/common/const");
var eventListener = require("@/app/tools/eventListener");


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
		container.append(_.template(btn_tpl)({
			consult_agent: __("common.consult_agent")
		}));
		container.delegate(".question", "click", onMenuClick);

		// 移动网站 config 显示 “点击联系客服”
		if(utils.isMobile){
			container.find(".contact-customer-service").removeClass("hide");
			container.delegate(".contact-customer-service", "click", onContactClick);
		}
	});

	// 点击咨询客服
	function onContactClick(e){
		var domSelfWrapper = document.querySelector(".em-self-wrapper");
		utils.addClass(domSelfWrapper, "hide");
		eventListener.trigger(_const.SYSTEM_EVENT.CONSULT_AGENT);
		e.stopPropagation();
		return false;
	}

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

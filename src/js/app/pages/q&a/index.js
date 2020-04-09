var SelfService = require("./selfService");
var Faq = require("./faq");
var FaqIframe = require("./iframe");

var utils = require("../../../common/utils");
var apis = require("./apis");
var commonConfig = require("@/common/config");
var _const = require("@/common/const");
var eventListener = require("@/app/tools/eventListener");

var btn_tpl = require("./btnTpl.html");

function init(obj){
	var faq;
	var selfService;
	var iframe;

	var resultStatus = obj.resultStatus;
	apis.update(commonConfig.getConfig());

	// 外部已经处理了是否显示
	if(resultStatus[0]){
		faq = new Faq();
	}
	if(resultStatus[1]){
		selfService = new SelfService();
	}
	iframe = new FaqIframe({
		url: "http://baidu.com"
	});
	show();

	// 移动网站 config 显示 “点击联系客服”
	if(utils.isMobile){
		utils.removeClass(document.querySelector(".em-self-wrapper .contact-customer-service"), "hide");
		utils.live(".contact-customer-service", "click", onContactClick, document.querySelector(".em-self-wrapper"));
	}

	return {
		iframe: iframe.$el,
		faq: faq.$el,
		ss: selfService.$el,
		btn: _.template(btn_tpl)({
			consult_agent: __("common.consult_agent")
		}),
	};
}

// 点击咨询客服
function onContactClick(e){
	close();
	eventListener.trigger(_const.SYSTEM_EVENT.CONSULT_AGENT);
	utils.stopPropagation();
	return false;
}

function close(){
	var domSelfWrapper = document.querySelector(".em-self-wrapper");
	utils.addClass(domSelfWrapper, "hide");
}

function show(){
	var domSelfWrapper = document.querySelector(".em-self-wrapper");
	utils.removeClass(domSelfWrapper, "hide");
}


module.exports = {
	init: init,
	show: show,
	close: close,
};

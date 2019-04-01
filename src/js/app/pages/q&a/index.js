
var SelfService = require("./selfService");
var Faq = require("./faq");
var utils = require("../../../common/utils");
var apis = require("./apis");
var commonConfig = require("@/common/config");
var _const = require("@/common/const");
var eventListener = require("@/app/tools/eventListener");

module.exports = {
	init: init,
	show: show,
};

function init(obj){
	var faq;
	var selfService;
	var domFaqList = document.querySelector(".faq-list");
	var resultStatus = obj.resultStatus;

	apis.update(commonConfig.getConfig());

	if(resultStatus[0]){
		utils.removeClass(domFaqList, "hide");
		faq = new Faq();
	}
	else{
		utils.addClass(domFaqList, "hide");
	}

	if(resultStatus[1]){
		selfService = new SelfService();
	}
	show();


	// 移动网站 config 显示 “点击联系客服”
	obj.configTypeIsH5 && utils.removeClass(document.querySelector(".em-self-wrapper .contact-customer-service"), "hide");
	utils.live(".contact-customer-service", "click", onContactClick, document.querySelector(".em-self-wrapper"));

}

// 点击咨询客服
function onContactClick(e){
	close();
	eventListener.trigger(_const.SYSTEM_EVENT.CONSULT_AGENT);
	e.stopPropagation();
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

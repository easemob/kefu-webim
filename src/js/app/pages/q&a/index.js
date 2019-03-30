
var SelfService = require("./selfService");
var Faq = require("./faq");
var utils = require("../../../common/utils");
var apiHelper = require("@/app/common/apiHelper");
var commonConfig = require("@/common/config");
var _const = require("@/common/const");

var mainInitChat;
var configTypeIsH5;
module.exports = {
	init: init,
	show: show,
	close: close
};

function init(obj){
	var faq;
	var selfService;
	var domFaqList = document.querySelector(".faq-list");

	apiHelper.update(commonConfig.getConfig());

	mainInitChat = obj.mainInitChat;
	configTypeIsH5 = obj.configTypeIsH5;

	Promise.all([
		apiHelper.getFaqOrSelfServiceStatus("issue"),
		apiHelper.getFaqOrSelfServiceStatus("self-service")
	])
	.then(function(resultStatus){
		// h5 模式 常见问题和自助服务开关都关闭时显示 chat 页面
		if(!configTypeIsH5 || (!resultStatus[0] && !resultStatus[1])){
			mainInitChat();
		}
		if(resultStatus[0] || resultStatus[1]){

			// 重新去设置iframe 的宽高
			transfer.send({
				event: _const.EVENTS.RESET_IFRAME,
				data: {
					dialogHeight: commonConfig.getConfig().dialogHeight,
					dialogWidth: configTypeIsH5 ? commonConfig.getConfig().dialogWidth : "720px",
					dialogPosition: commonConfig.getConfig().dialogPosition
				}
			});

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
		}

		// H5 模式有一个功能开关打开就显示，iframe 的形式不需要直接显示，当点击联系客服按钮的时候显示
		if(
			(configTypeIsH5 && (resultStatus[0] || resultStatus[1]))
			|| !configTypeIsH5
		){
			show();
		}
	});




	// 移动网站 config 显示 “点击联系客服”
	configTypeIsH5 && utils.removeClass(document.querySelector(".em-self-wrapper .contact-customer-service"), "hide");
	utils.live(".contact-customer-service", "click", onContactClick, document.querySelector(".em-self-wrapper"));

}

// 点击咨询客服
function onContactClick(e){
	utils.addClass(document.querySelector(".em-self-wrapper"), "hide");
	mainInitChat();
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

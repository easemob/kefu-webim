
var SelfService = require("./selfService");
var Faq = require("./faq");
var utils = require("../../../common/utils");

module.exports = {
	init: init,
	show: show,
	close: close
};

function init(obj){
	var faq;
	var selfService;
	var domFaqList = document.querySelector(".faq-list");

	var faqStatus = obj.faqStatus;
	var selfServiceStatus = obj.selfServiceStatus;

	if(faqStatus){
		utils.removeClass(domFaqList, "hide");
		faq = new Faq();
	}
	else{
		utils.addClass(domFaqList, "hide");
	}

	if(selfServiceStatus){
		selfService = new SelfService();
	}

	// 移动端模式显示 “点击联系客服”
	utils.isMobile && utils.removeClass(document.querySelector(".em-self-wrapper .contact-customer-service"), "hide");


}
function close(){
	var domSelfWrapper = document.querySelector(".em-self-wrapper");
	utils.addClass(domSelfWrapper, "hide");
}

function show(){
	var domSelfWrapper = document.querySelector(".em-self-wrapper");
	utils.removeClass(domSelfWrapper, "hide");
}

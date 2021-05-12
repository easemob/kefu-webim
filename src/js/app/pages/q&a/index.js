var SelfService = require("./selfService");
var Faq = require("./faq");
var FaqIframe = require("./iframe");
var ContactBtn = require("./contact");

var utils = require("../../../common/utils");
var apis = require("./apis");
var commonConfig = require("@/common/config");

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
	// enable
	if(resultStatus[2]){
		// settings
		iframe = new FaqIframe(resultStatus[3][0]);
		var iframeList = [];
			for(var i=0;i<resultStatus[3].length;i++){
				console.log(resultStatus[3][i]);
				iframeList.push(new FaqIframe(resultStatus[3][i]))
			}
	}
	show();

	return {
		faq: faq,
		ss: selfService,
		iframe: iframe,
		contact: new ContactBtn(),
		iframeList:iframeList
	};
}

function show(){
	var domSelfWrapper = document.querySelector(".em-self-wrapper");
	utils.removeClass(domSelfWrapper, "hide");
}

module.exports = {
	init: init,
	show: show,
};

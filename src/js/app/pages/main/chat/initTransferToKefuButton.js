var _const = require("@/common/const");
var utils = require("@/common/utils");
var profile = require("@/app/tools/profile");
var eventListener = require("@/app/tools/eventListener");
var apiHelper = require("../apis");
var channel = require("../channel");
var commonConfig = require("@/common/config");

var toKefuBtn;

module.exports = function(){
	if(!commonConfig.getConfig().toolbar.transferToKefu) return;

	var editorView = document.querySelector(".em-widget-send-wrapper");
	// toKefuBtn = editorView.querySelector(".em-widget-to-kefu");
	toKefuBtn = document.querySelector(".em-widget-to-kefu-input-button");
	textareaBtn = editorView.querySelector(".em-widget-textarea");

	// 人工客服接起会话

	utils.on(toKefuBtn, "click", _.throttle(function(){
		channel.sendTransferToKf();
	},8000, {trailing: false}));


	// 把注册事件和方法提取到新增的输入框上方按钮文件
	// eventListener.add(_const.SYSTEM_EVENT.SESSION_OPENED, _displayOrHideTransferToKefuBtn);
	// eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERING, _displayOrHideTransferToKefuBtn);
	// eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERED, _displayOrHideTransferToKefuBtn);
	// eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _displayOrHideTransferToKefuBtn);
	// eventListener.add(_const.SYSTEM_EVENT.SESSION_NOT_CREATED, _displayOrHideTransferToKefuBtn);
	// eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED, _displayOrHideTransferToKefuBtn);
};

function _displayOrHideTransferToKefuBtn(officialAccount){
	// 忽略非当前服务号的事件
	if(profile.currentOfficialAccount !== officialAccount) return;

	var state = officialAccount.sessionState;
	var agentType = officialAccount.agentType;
	var type = officialAccount.type;
	var isRobotAgent = agentType === _const.AGENT_ROLE.ROBOT;

	if(type === "CUSTOM"){
		// 营销号一律不显示转人工按钮
		utils.addClass(toKefuBtn, "hide");
	}
	else if(state === _const.SESSION_STATE.PROCESSING){
		utils.toggleClass(toKefuBtn, "hide", !isRobotAgent);
	}
	else if(state === _const.SESSION_STATE.WAIT){
		// 待接入状态 隐藏按钮
		utils.addClass(toKefuBtn, "hide");
	}
	else{
		if(!officialAccount.isSessionOpen) return
		apiHelper.getRobertIsOpen().then(function(isRobotEnable){
			utils.toggleClass(toKefuBtn, "hide", !isRobotEnable);
		});
	}

	if(utils.isMobile){
		if(utils.hasClass(toKefuBtn, "hide")){
			textareaBtn.style.maxWidth = "calc(100% - 45px)";
		}
		else{
			textareaBtn.style.maxWidth = "calc(100% - 90px)";
		}
	}
	
	
}

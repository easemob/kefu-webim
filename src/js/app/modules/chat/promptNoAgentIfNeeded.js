var _const = require("../../../common/const");
var profile = require("../tools/profile");
var eventListener = require("../tools/eventListener");
var apiHelper = require("../apiHelper");
var channel = require("../channel");

var isNoAgentOnlineTipShowed = false;

module.exports = { init: init };

function init(){
	eventListener.add(_const.SYSTEM_EVENT.MESSAGE_SENT, function(event, messageBody){
		var type = messageBody.type;
		var text = messageBody.data;
		var action = messageBody.action;
		var hasTransferedToKefu;

		if(text && typeof text === "string" && type === "txt"){
			hasTransferedToKefu = !!~__("config.transfer_to_kefu_words").slice("|").indexOf(text);
			_promptNoAgentOnlineIfNeeded({ hasTransferedToKefu: hasTransferedToKefu });
		}
		else if(type === "cmd" && action === "TransferToKf"){
			_promptNoAgentOnlineIfNeeded({ hasTransferedToKefu: true });
		}
	});

	eventListener.add([
		_const.SYSTEM_EVENT.SESSION_TRANSFERED,
		_const.SYSTEM_EVENT.SESSION_OPENED,
	], function(officialAccount){
		_promptNoAgentOnlineIfNeeded({ officialAccount: officialAccount });
	});
}

function _promptNoAgentOnlineIfNeeded(opt){
	var hasTransferedToKefu = opt && opt.hasTransferedToKefu;
	var officialAccount = (opt && opt.officialAccount) || profile.currentOfficialAccount;
	var sessionState = officialAccount.sessionState;
	// 只去查询一次有无坐席在线
	if(isNoAgentOnlineTipShowed) return;
	// 待接入中的会话 不做查询
	if(sessionState === _const.SESSION_STATE.WAIT) return;
	// 开启机器人接待时 不转人工不查询
	if(profile.hasRobotAgentOnline && !hasTransferedToKefu) return;
	// 获取在线坐席数
	apiHelper.getOnlineAgentCount().then(function(data){
		profile.hasHumanAgentOnline = data.onlineHumanAgentCount > 0;
		profile.hasRobotAgentOnline = data.onlineRobotAgentCount > 0;

		isNoAgentOnlineTipShowed = true;
		// 显示无坐席在线(只显示一次)
		if(
			!profile.hasHumanAgentOnline
		){
			channel.appendEventMsg(_const.eventMessageText.NOTE, { ext: { official_account: officialAccount } });
		}
	});
}

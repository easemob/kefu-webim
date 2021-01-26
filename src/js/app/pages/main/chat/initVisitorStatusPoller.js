var _const = require("@/common/const");
var utils = require("@/common/utils");
var profile = require("@/app/tools/profile");
var eventListener = require("@/app/tools/eventListener");
var apiHelper = require("../apis");

var visitorLeaveTimer = null;
module.exports = function(){

	_init();

	eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, function(){
		// console.log("_const.SYSTEM_EVENT.SESSION_RESTORED");
	});
	eventListener.add(_const.SYSTEM_EVENT.SESSION_OPENED, _init);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_CLOSED, _clearTimer);
	eventListener.add(_const.SYSTEM_EVENT.CHAT_CLOSED, _clearTimer);
	eventListener.add(_const.SYSTEM_EVENT.CHAT_WINDOW_OPENED, _init);
};
function _init(){

	_clearTimer();

	// 开始轮询访客状态
	visitorLeaveTimer = setInterval(function(){
		var officialAccount = profile.currentOfficialAccount;
		_setVisitorStatus(officialAccount);
	}, 3000);
}
function _setVisitorStatus(officialAccount){
	var agentType = officialAccount.agentType;
	var isSessionOpen = officialAccount.isSessionOpen;
	var sessionId = officialAccount.sessionId;

	if(
		profile.grayList.visitorLeave &&
		isSessionOpen &&
		agentType === _const.AGENT_ROLE.AGENT &&
		sessionId){
		apiHelper.startKeep({ serviceSessionId: sessionId });
	}
	else{
		_clearTimer();
	}
}

function _clearTimer(){
	clearInterval(visitorLeaveTimer);
}

var _const = require("../../../common/const");
var utils = require("../../../common/utils");
var profile = require("../tools/profile");
var eventListener = require("../tools/eventListener");
var apiHelper = require("../apiHelper");

var preventTimestamp = 0;
var inputState;

module.exports = function(){
	var topBar;

	if(!profile.grayList.agentInputStateEnable) return;

	topBar = document.querySelector(".em-widget-header");
	inputState = topBar.querySelector(".em-agent-input-state");

	// start timer
	setInterval(function(){
		var officialAccount = profile.currentOfficialAccount;
		_update(officialAccount);
	}, _const.AGENT_INPUT_STATE_INTERVAL);

	eventListener.add(_const.SYSTEM_EVENT.SESSION_OPENED, _update);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_CLOSED, _update);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERED, _update);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _update);
	eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED, _update);
};

function _update(officialAccount){
	var state;
	var sessionId;
	var agentType;

	if(
		officialAccount !== profile.currentOfficialAccount
		|| !officialAccount
		|| !profile.isChatWindowOpen
		|| utils.isBrowserMinimized()
	) return;

	state = officialAccount.sessionState;
	sessionId = officialAccount.sessionId;
	agentType = officialAccount.agentType;

	if(
		sessionId
		&& state === _const.SESSION_STATE.PROCESSING
		&& agentType !== _const.AGENT_ROLE.ROBOT
	){
		apiHelper.getAgentInputState(sessionId).then(function(entity){
			var currentTimestamp = entity.timestamp;
			var ifDisplayTypingState = entity.input_state_tips;

			// 为了先发送的请求后回来的异步问题，仅处理时间戳比当前大的response
			if(currentTimestamp > preventTimestamp){
				preventTimestamp = currentTimestamp;
				utils.toggleClass(inputState, "hide", !ifDisplayTypingState);
			}
		});
	}
	else{
		utils.addClass(inputState, "hide");
	}
}

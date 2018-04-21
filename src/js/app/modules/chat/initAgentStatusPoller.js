var Const =			require("@/common/cfg/const");
var profile =		require("@/common/cfg/profile");
var utils =			require("@/common/kit/utils");
var apiHelper =		require("@/common/kit/apiHelper");
var eventListener =	require("@/common/disp/eventListener");

var $agentStatusText;

module.exports = function(){
	var topBar = document.querySelector(".em-widget-header");
	$agentStatusText = topBar.querySelector(".em-header-status-text");

	// 开始轮询坐席状态
	setInterval(function(){
		var officialAccount = profile.currentOfficialAccount;
		_setAgentStatus(officialAccount);
	}, 5000);

	eventListener.add(Const.SYSTEM_EVENT.SESSION_OPENED, _setAgentStatus);
	eventListener.add(Const.SYSTEM_EVENT.SESSION_TRANSFERED, _setAgentStatus);
	eventListener.add(Const.SYSTEM_EVENT.SESSION_CLOSED, _setAgentStatus);
	eventListener.add(Const.SYSTEM_EVENT.SESSION_TRANSFERING, _setAgentStatus);
	eventListener.add(Const.SYSTEM_EVENT.SESSION_RESTORED, _setAgentStatus);
	eventListener.add(Const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED, function(officialAccount){
		_update(officialAccount.status);
	});
};

function _setAgentStatus(officialAccount){
	if(
		officialAccount !== profile.currentOfficialAccount
		|| !officialAccount
		|| !profile.isChatWindowOpen
		|| utils.isBrowserMinimized()
	) return;

	var agentId = officialAccount.agentId;
	var agentType = officialAccount.agentType;
	var isSessionOpen = officialAccount.isSessionOpen;

	if(
		!profile.isAgentNicknameEnable
		|| !agentId
		|| !isSessionOpen
	){
		_update(null);
	}
	else if(agentType === Const.AGENT_ROLE.ROBOT){
		// 机器人不去轮询，显示为在线
		_update("Online");
	}
	else{
		apiHelper.getAgentStatus(agentId).then(function(status){
			officialAccount.agentState = status;
			_update(status);
		});
	}
}

function _update(status){
	var agentStatusText = Const.agentStatusText[status || "Other"];
	$agentStatusText.innerText = agentStatusText;
}

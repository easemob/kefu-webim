var Const =			require("@/common/cfg/const");
var profile =		require("@/common/cfg/profile");
var utils =			require("@/common/kit/utils");
var eventListener =	require("@/common/disp/eventListener");

var $agentNickname;

module.exports = function(){
	var topBar = document.querySelector(".em-widget-header");
	$agentNickname = topBar.querySelector(".em-widget-header-nickname");

	eventListener.add(Const.SYSTEM_EVENT.SESSION_OPENED, _updateAgentNickname);
	eventListener.add(Const.SYSTEM_EVENT.SESSION_TRANSFERED, _updateAgentNickname);
	eventListener.add(Const.SYSTEM_EVENT.SESSION_TRANSFERING, _updateAgentNickname);
	eventListener.add(Const.SYSTEM_EVENT.SESSION_CLOSED, _updateAgentNickname);

	eventListener.add(Const.SYSTEM_EVENT.AGENT_INFO_UPDATE, _updateAgentNickname);

	eventListener.add(Const.SYSTEM_EVENT.SESSION_RESTORED, _updateAgentNickname);
	eventListener.add(Const.SYSTEM_EVENT.SESSION_NOT_CREATED, _updateAgentNickname);

	eventListener.add(Const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED, _updateAgentNickname);
};

function _updateAgentNickname(officialAccount){
	if(officialAccount !== profile.currentOfficialAccount) return;

	var agentNickname = officialAccount.agentNickname;
	var agentAvatar = officialAccount.agentAvatar;
	var isSessionOpen = officialAccount.isSessionOpen;
	var officialAccountType = officialAccount.type;

	// fake: update system agent avatar
	if(officialAccountType === "SYSTEM"){
		profile.systemAgentAvatar = isSessionOpen
			? utils.getAvatarsFullPath(agentAvatar, profile.config.domain)
			: null;
	}

	if(officialAccountType === "CUSTOM"){
		// 昵称显示为服务号名称
		$agentNickname.innerText = officialAccount.name;
	}
	else if(
		profile.isAgentNicknameEnable
		&& agentNickname
		&& isSessionOpen
		&& agentNickname !== __("config.scheduler_role_nickname")
	){
		$agentNickname.innerText = agentNickname;
	}
	else{
		$agentNickname.innerText = profile.defaultAgentName;
	}
}

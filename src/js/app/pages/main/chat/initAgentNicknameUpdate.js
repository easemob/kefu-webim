var _const = require("@/common/const");
var utils = require("@/common/utils");
var profile = require("@/app/tools/profile");
var eventListener = require("@/app/tools/eventListener");
var commonConfig = require("@/common/config");

var $agentNickname, $agentFace;

module.exports = function(){
	var topBar = document.querySelector(".em-widget-header");
	$agentFace = topBar.querySelector(".em-agent-face");
	$agentNickname = topBar.querySelector(".em-widget-header-nickname");

	eventListener.add(_const.SYSTEM_EVENT.SESSION_OPENED, _updateAgentNickname);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERED, _updateAgentNickname);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERING, _updateAgentNickname);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_CLOSED, _updateAgentNickname);

	eventListener.add(_const.SYSTEM_EVENT.AGENT_INFO_UPDATE, _updateAgentNickname);

	eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _updateAgentNickname);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_NOT_CREATED, _updateAgentNickname);

	eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED, _updateAgentNickname);
};

function _updateAgentNickname(officialAccount){
	$(".em-service-title").addClass("hide");
	if(officialAccount !== profile.currentOfficialAccount) return;

	var agentNickname = officialAccount.agentNickname;
	var agentAvatar = officialAccount.agentAvatar;
	var isSessionOpen = officialAccount.isSessionOpen;
	var officialAccountType = officialAccount.type;
	var defaultAvatar = commonConfig.getConfig().staticPath + "/img/default_avatar.png";
	var faceImg;
	if(agentNickname && agentAvatar){
		faceImg = agentAvatar;
	}
	else if(officialAccount.img){
		faceImg = officialAccount.img
	}
	else{
		faceImg = $agentFace.src;
	}
	$agentFace.src = faceImg;
	// utils.removeClass($agentFace, "hide");

	// fake: update system agent avatar
	if(officialAccountType === "SYSTEM"){
		profile.systemAgentAvatar = isSessionOpen
			? utils.getAvatarsFullPath(agentAvatar, commonConfig.getConfig().domain)
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
	else if(profile.latestNiceName && isSessionOpen){
		$agentNickname.innerText = profile.latestNiceName;
	}
	else{
		$agentNickname.innerText = profile.defaultAgentName;
	}
	profile.newNickName = $agentNickname.innerText;
}

var _const = require("@/common/const");
var utils = require("@/common/utils");
var profile = require("@/app/tools/profile");
var eventListener = require("@/app/tools/eventListener");
var apiHelper = require("../apis");
var commonConfig = require("@/common/config");

var preventTimestamp = 0;
var $queuingNumberStatus;
var $queuingNumberLabel;

module.exports = function(){
	if(!profile.grayList.waitListNumberEnable) return;
	var editorView = document.querySelector(".em-widget-send-wrapper");
	$queuingNumberStatus = editorView.querySelector(".queuing-number-status");
	$queuingNumberLabel = $queuingNumberStatus.querySelector("label");

	// 海外集群10秒轮询一次，海外集群的tenantid是1000000开始的
	var config = commonConfig.getConfig();
	var t = 1000;
	if(config.tenantId >= 1000000){
		t = 10000;
	}
	else{
		t = 1000;
	}
	// 开始轮询排队人数
	setInterval(function(){
		var officialAccount = profile.currentOfficialAccount;
		_getQueuingNumber(officialAccount);
	}, t);

	eventListener.add(_const.SYSTEM_EVENT.SESSION_OPENED, _getQueuingNumber);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_CLOSED, _getQueuingNumber);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERED, _getQueuingNumber);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_CREATED, _getQueuingNumber);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _getQueuingNumber);
	eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED, _getQueuingNumber);
};

function _getQueuingNumber(officialAccount){
	if(
		officialAccount !== profile.currentOfficialAccount
		|| !officialAccount
		|| !profile.isChatWindowOpen
		|| utils.isBrowserMinimized()
	) return;

	var state = officialAccount.sessionState;
	var queueId = officialAccount.skillGroupId;
	var sessionId = officialAccount.sessionId;
	var officialAccountId = officialAccount.official_account_id;

	if(state === _const.SESSION_STATE.WAIT && sessionId){
		if(queueId){
			apiHelper.getWaitListNumber(sessionId, queueId).then(function(entity){
				var waitingNumber = entity.visitorUserWaitingNumber;
				var currentTimestamp = entity.visitorUserWaitingTimestamp;

				if(currentTimestamp > preventTimestamp){
					preventTimestamp = currentTimestamp;
					_update(waitingNumber);
				}
			});
		}
		else{
			apiHelper.getLastSession(officialAccountId).then(function(entity){
				officialAccount.skillGroupId = entity.skill_group_id;
			});
		}
	}
	else{
		_update(null);
	}
}

function _update(waitingNumber){
	var exit = document.querySelector(".em-widget-out-of-line"); //访客退队按钮
	// 没有人排队会返回 no
	if(!waitingNumber || waitingNumber === "no"){
		utils.addClass($queuingNumberStatus, "hide");
		$(exit).addClass("hide")
	}
	else{
		utils.removeClass($queuingNumberStatus, "hide");
		$queuingNumberLabel.innerHTML = waitingNumber;
		// document.querySelector(".em-widget-out-of-line")
		$(exit).removeClass("hide")
	}
}

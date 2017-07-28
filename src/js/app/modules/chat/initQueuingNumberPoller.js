var _const = require("../../../common/const");
var utils = require("../../../common/utils");
var profile = require("../tools/profile");
var eventListener = require("../tools/eventListener");
var apiHelper = require("../apiHelper");

var preventTimestamp = 0;
var $queuingNumberStatus;
var $queuingNumberLabel;

module.exports = function(){
	if(!profile.grayList.waitListNumberEnable) return;
	var editorView = document.querySelector(".em-widget-send-wrapper");
	$queuingNumberStatus = editorView.querySelector(".queuing-number-status");
	$queuingNumberLabel = $queuingNumberStatus.querySelector("label");

	// 开始轮询排队人数
	setInterval(function(){
		var officialAccount = profile.currentOfficialAccount;
		_getQueuingNumber(officialAccount);
	}, 1000);

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
	// 没有人排队会返回 no
	if(!waitingNumber || waitingNumber === "no"){
		utils.addClass($queuingNumberStatus, "hide");
	}
	else{
		utils.removeClass($queuingNumberStatus, "hide");
		$queuingNumberLabel.innerHTML = waitingNumber;
	}
}

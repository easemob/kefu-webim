app.initTransferToKefuButton = (function (_const, utils, profile, eventListener, apiHelper){
	var $toKefuBtn;

	return function(){
		if (!profile.config.toolbar.transferToKefu) return;

		var editorView = document.querySelector('.em-widget-send-wrapper');
		toKefuBtn = editorView.querySelector('.em-widget-to-kefu');

		// 人工客服接起会话
		utils.on($toKefuBtn, 'click', function () {
			channel.sendTransferToKf();
			utils.addClass($toKefuBtn, 'hide');
		});

		// todo: add listener to official changed
		eventListener.add(_const.SYSTEM_EVENT.SESSION_OPENED, _displayOrHideTransferToKefuBtn);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERED, _displayOrHideTransferToKefuBtn);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _displayOrHideTransferToKefuBtn);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_NOT_CREATED, _displayOrHideTransferToKefuBtn);
	};

	function _displayOrHideTransferToKefuBtn(officialAccount){
		if (profile.currentOfficialAccount !== officialAccount) return;

		var state = officialAccount.sessionState;
		var agentType = officialAccount.agentType;
		var isRobotAgent = agentType === _const.AGENT_ROLE.ROBOT;

		if (state === _const.SESSION_STATE.PROCESSING){
			utils.toggleClass($toKefuBtn, 'hide', !isRobotAgent);
		}
		else{
			apiHelper.getRobertIsOpen().then(function (isRobotEnable) {
				utils.toggleClass($toKefuBtn, 'hide', !isRobotEnable);
			});
		}
	}
}(easemobim._const, easemobim.utils, app.profile, app.eventListener, app.apiHelper));

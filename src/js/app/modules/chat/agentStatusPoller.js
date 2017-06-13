app.startOrStopPollAgentState = (function(_const, profile, utils, apiHelper){
	// todo: dom 操作分离出去
	var topBar = document.querySelector('.em-widget-header');
	var $agentStatusText = topBar.querySelector('.em-header-status-text');
	var _timerHandler;

	function _start() {
		if (_timerHandler) return;

		// start to poll
		_timerHandler = setInterval(function () {
			_update();
		}, 5000);
	}

	function _stop() {
		_timerHandler = clearInterval(_timerHandler);
		doms.agentStatusText.innerText = '';
	}

	function _update() {
		if (
			!profile.nickNameOption
			|| profile.isChatWindowOpen
			|| utils.isBrowserMinimized()
		) return;

		var officialAccount = profile.currentOfficialAccount;
		var agentId = officialAccount.agentId;
		var agentType = officialAccount.agentType;
		var isSessionOpen = officialAccount.isSessionOpen;

		if (!isSessionOpen){
			doms.agentStatusText.innerText = '';
		}
		else if (agentType === _const.AGENT_ROLE.ROBOT){
			// 机器人不去轮询，显示为在线
			$agentStatusText.innerText = _const.agentStatusText.Online;
		}
		else {
			apiHelper.getAgentStatus(agentId).then(function (state) {
				if (state) {
					$agentStatusText.innerText = _const.agentStatusText[state];
				}
			});
		}
	}

	return function(officialAccount){
		if (officialAccount !== profile.currentOfficialAccount) return;

		var sessionState = officialAccount.sessionState;

		if (sessionState === _const.SESSION_STATE.PROCESSING){
			_start();
		}
		else{
			stop();
		}

	};
}(easemobim._const, easemobim.utils, app.profile, app.apiHelper));

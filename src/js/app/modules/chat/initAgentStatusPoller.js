app.initAgentStatePoller = (function(_const,  utils, profile, eventListener, apiHelper){
	var $agentStatusText;
	var _timerHandler;

	return function(){
		var topBar = document.querySelector('.em-widget-header');
		$agentStatusText = topBar.querySelector('.em-header-status-text');

		eventListener.add(_const.SYSTEM_EVENT.SESSION_OPENED, startOrStopPollAgentState);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERED, startOrStopPollAgentState);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_CLOSED, startOrStopPollAgentState);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERING, startOrStopPollAgentState);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, startOrStopPollAgentState);
	};

	function _start() {
		if (_timerHandler) return;

		// start to poll
		_timerHandler = setInterval(function () {
			_update();
		}, 5000);
	}

	function _stop() {
		_timerHandler = clearInterval(_timerHandler);
		$agentStatusText.innerText = '';
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
			$agentStatusText.innerText = '';
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

	function startOrStopPollAgentState(officialAccount, event){
		if (officialAccount !== profile.currentOfficialAccount) return;

		var sessionState = officialAccount.sessionState;

		if (sessionState === _const.SESSION_STATE.PROCESSING){
			_start();
		}
		else{
			_stop();
		}
	}
}(easemobim._const, easemobim.utils, app.profile, app.eventListener, app.apiHelper));

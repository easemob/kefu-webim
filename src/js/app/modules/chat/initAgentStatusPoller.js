app.initAgentStatePoller = (function(_const,  utils, profile, eventListener, apiHelper){
	var $agentStatusText;
	var _timerHandler;

	return function(){
		var topBar = document.querySelector('.em-widget-header');
		$agentStatusText = topBar.querySelector('.em-header-status-text');

		// 开始轮询坐席状态
		_timerHandler = setInterval(function (){
			var officialAccount = profile.currentOfficialAccount;
			_setAgentStatus(officialAccount);
		}, 5000);

		eventListener.add(_const.SYSTEM_EVENT.SESSION_OPENED, _setAgentStatus);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERED, _setAgentStatus);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_CLOSED, _setAgentStatus);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERING, _setAgentStatus);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _setAgentStatus);
		eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED, function (officialAccount){
			_update(officialAccount.status);
		});
	};

	function _setAgentStatus(officialAccount) {
		if (
			officialAccount !== profile.currentOfficialAccount
			|| !officialAccount
			|| !profile.isChatWindowOpen
			|| utils.isBrowserMinimized()
		) return;

		var agentId = officialAccount.agentId;
		var agentType = officialAccount.agentType;
		var isSessionOpen = officialAccount.isSessionOpen;

		if (agentType === _const.AGENT_ROLE.ROBOT){
			// 机器人不去轮询，显示为在线
			_update('Online');
		}
		else if (
			!profile.nickNameOption
			|| !agentId
			|| !isSessionOpen
		){
			_update(null);
		}
		else {
			apiHelper.getAgentStatus(agentId).then(function (status){
				officialAccount.agentState = status;
				_update(status);
			});
		}
	}

	function _update(status){
		var agentStatusText = _const.agentStatusText[status || 'Other'];
		$agentStatusText.innerText = agentStatusText;
	}
}(easemobim._const, easemobim.utils, app.profile, app.eventListener, app.apiHelper));

app.agentStatusPoller = (function(_const, profile, utils, apiHelper){
	// todo: dom 操作分离出去
	var topBar = document.querySelector('.em-widget-header');
	var $agentStatusSymbol = topBar.querySelector('.agent-status');
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
	}

	function _clear() {
		doms.agentStatusSymbol.className = 'hide';
		doms.agentStatusText.innerText = '';
	}

	function _update() {
		if (
			!profile.nickNameOption
			|| profile.isChatWindowOpen
			|| utils.isBrowserMinimized()
		) return;

		var agentId = profile.currentOfficialAccount.agentId;

		if (!agentId){
			doms.agentStatusSymbol.className = 'hide';
			doms.agentStatusText.innerText = '';
		}
		else {
			apiHelper.getAgentStatus(agentId).then(function (state) {
				if (state) {
					$agentStatusText.innerText = _const.agentStatusText[state];
					$agentStatusSymbol.className = 'em-widget-agent-status ' + _const.agentStatusClassName[state];
				}
			});
		}
	}

	return {
		start: _start,
		stop: _stop,
		update: _update
	};
}(easemobim._const, easemobim.utils, app.profile, app.apiHelper));

app.initAgentInputStatePoller = (function(_const, utils, profile, apiHelper, eventListener){
	var isStarted = false;
	var timerHandler;
	var preventTimestamp = 0;
	var topBar;
	var inputState;

	return function (){
		if (!profile.grayList.agentInputStateEnable) return;

		topBar = document.querySelector('.em-widget-header');
		inputState = topBar.querySelector('.em-agent-input-state');

		// todo: add listener to official changed
		eventListener.add(_const.SYSTEM_EVENT.SESSION_OPENED, _startOrStopAgentInputStatePoller);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_CLOSED, _startOrStopAgentInputStatePoller);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERED, _startOrStopAgentInputStatePoller);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _startOrStopAgentInputStatePoller);
	};

	function _startOrStopAgentInputStatePoller(officialAccount, event){
		if (officialAccount !== profile.currentOfficialAccount) return;

		var state = officialAccount.sessionState;
		var agentType = officialAccount.agentType;

		if (
			state === _const.SESSION_STATE.PROCESSING
			&& agentType !== _const.AGENT_ROLE.ROBOT
		){
			_start();
		}
		else {
			_stop();
		}
	}

	function _start() {
		isStarted = true;

		// 保证当前最多只有1个timerHandler
		timerHandler = clearInterval(timerHandler);
		timerHandler = setInterval(_update, _const.AGENT_INPUT_STATE_INTERVAL);
	}

	function _update(){
		var sessionId = profile.currentOfficialAccount.sessionId;

		if (
			!profile.isChatWindowOpen
			|| utils.isBrowserMinimized()
			|| !sessionId
		) return;

		apiHelper.getAgentInputState(sessionId).then(function (entity){
			var currentTimestamp = entity.timestamp;
			var ifDisplayTypingState = entity.input_state_tips;

			// 为了先发送的请求后回来的异步问题，仅处理时间戳比当前大的response
			if (isStarted && currentTimestamp > preventTimestamp){
				preventTimestamp = currentTimestamp;
				utils.toggleClass(inputState, 'hide', !displayTypingState);
			}
		});
	}

	function _stop(){
		clearInterval(timerHandler);
		utils.addClass(inputState, 'hide');
		isStarted = false;
	}
}(easemobim._const, easemobim.utils, app.profile, app.apiHelper, app.eventListener));

app.initQueuingNumberPoller = (function (_const, utils, profile, eventListener, apiHelper){
	var isStarted = false;
	var timerHandler;
	var preventTimestamp = 0;
	var $queuingNumberStatus;
	var $queuingNumberLabel;

	return function(){
		if (!profile.grayList.waitListNumberEnable) return;
		$queuingNumberStatus = document.querySelector('.queuing-number-status');
		$queuingNumberLabel = $queuingNumberStatus.querySelector('label');

		// todo: add listener to official changed
		eventListener.add(_const.SYSTEM_EVENT.SESSION_OPENED, _startOrStopQueuingNumberPoller);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_CLOSED, _startOrStopQueuingNumberPoller);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERED, _startOrStopQueuingNumberPoller);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_CREATED, _startOrStopQueuingNumberPoller);
		eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _startOrStopQueuingNumberPoller);
	}

	function _startOrStopQueuingNumberPoller(officialAccount, event){
		if (profile.currentOfficialAccount !== officialAccount) return;

		var state = officialAccount.sessionState;

		if (state === _const.SESSION_STATE.WAIT){
			_start();
		}
		else {
			_stop();
		}
	}

	function _start() {
		isStarted = true;
		// 保证当前最多只有1个timer
		// 每次调用start都必须重新获取queueId
		clearInterval(timerHandler);
		apiHelper.getSessionQueueId().then(function (entity){
			var queueId;
			var sessionId;

			if (entity.state === 'Wait' && isStarted) {
				queueId = entity.queueId;
				sessionId = entity.serviceSessionId;
				// 避免请求在 轮询停止以后回来 而导致误开始
				// todo: use promise to optimize it
				timerHandler = setInterval(function () {
					apiHelper.getWaitListNumber().then(function (entity){
						var waitingNumber = entity.visitorUserWaitingNumber;
						var currentTimestamp = entity.visitorUserWaitingTimestamp;

						if (waitingNumber === 'no') {
							utils.addClass($queuingNumberStatus, 'hide');
						}
						else if (currentTimestamp > preventTimestamp) {
							preventTimestamp = currentTimestamp;
							utils.removeClass($queuingNumberStatus, 'hide');
							$queuingNumberLabel.innerHTML = entity.visitorUserWaitingNumber;
						}
					});
				}, 1000);
			}
		});
	}

	function _stop() {
		clearInterval(timerHandler);
		preventTimestamp = 0;
		isStarted = false;
		utils.addClass($queuingNumberStatus, 'hide');
	}
}(easemobim._const, easemobim.utils, app.profile, app.eventListener, app.apiHelper));

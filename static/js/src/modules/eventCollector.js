;(function(Polling, utils, api){
	var POLLING_INTERVAL = 5000;

	var _polling;
	var _callback;
	var _config;
	var _userId;

	function _reportData(userType, userId){
		_userId = userId;

		easemobim.api('reportEvent', {
			type: 'VISIT_URL',
			// for debug
			// url: 'http://172.17.3.146',
			url: _config.origin,
			// 时间戳不传，以服务器时间为准
			// timestamp: 0,
			userId: {
				type: userType,
				id: userId
			}
		}, function(res){
			var data = res.data;

			switch(data && data.type){
				// 没有坐席呼叫，什么都不做
				case 'OK':
					break;
				// 有坐席呼叫
				case 'INIT_CALL':
					if(_isStarted()){
						_stopReporting();
						_callback(data);
					}
					// 已停止轮询 （被呼叫的访客/游客 已经创建会话），不回呼
					// todo: 发送删除事件
					else{}
					// todo:
					break;
				// error: unexcepted return value
				default:
					break;
			}
		});
	}

	function _deleteEvent(){
		api('deleteEvent', {userId: _userId});
		_userId = '';
	}

	function _startToReoprt(config, callback){
		_callback || (_callback = callback);
		_config || (_config = config);


		if(_config.user.username){
			_reportVisitor();
		}
		else{
			_reportGuest();
		}
	}

	function _reportGuest(){
		var guestId = localStorage.getItem('guestId') || utils.uuid();

		transfer.send({
			event: 'setItem',
			data: {
				key: 'guestId',
				value: guestId
			}
		}, window.transfer.to);
		_polling = new Polling(function(){
			_reportData('GUEST', guestId);
		}, POLLING_INTERVAL);

		_startToPoll();
	}

	function _reportVisitor(){
		api('getRelevanceList', {
			tenantId: _config.tenantId
		}, function(msg) {
			if (!msg.data.length) {
				throw '未创建关联';
			}
			var relevanceList = msg.data[0];
			var orgName = relevanceList.orgName;
			var appName = relevanceList.appName;
			var imServiceNumber = relevanceList.imServiceNumber;
			var gid = orgName + '#' + appName + '_' + imServiceNumber;

			_polling = new Polling(function(){
				_reportData('VISITOR', gid);
			}, POLLING_INTERVAL);

			_startToPoll();
		});
	}

	function _stopReporting(){
		_polling && _polling.stop();
		_userId && _deleteEvent();
	}

	function _startToPoll(){
		_polling && _polling.start();
	}

	function _isStarted() {
		return _polling && _polling.isStarted;
	}

	easemobim.eventCollector = {
		startToReport: _startToReoprt,
		stopReporting: _stopReporting,
		isStarted: _isStarted
	};
}(
	easemobim.Polling,
	easemobim.utils,
	easemobim.api
));

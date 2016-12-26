;(function(Polling, utils, api){
	var POLLING_INTERVAL = 5000;

	var _polling;
	var _callback;
	var _config;
	var _gid;
	var _url;

	function _reportData(userType, userId){
		transfer.send({event: 'updateURL'}, window.transfer.to);

		_url && easemobim.api('reportEvent', {
			type: 'VISIT_URL',
			// 第一次轮询时URL还未传过来，所以使用origin
			url: _url,
			// for debug
			// url: 'http://172.17.3.86',
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
						// 回呼游客，游客身份变为访客
						if (data.userName){
							_gid = data.orgName + '#' + data.appName + '_' + data.userName;
							_polling.stop();
							_polling = new Polling(function(){
								_reportData('VISITOR', _gid);
							}, POLLING_INTERVAL);
						}
						_stopReporting();
						_callback(data);
					}
					// 已停止轮询 （被呼叫的访客/游客 已经创建会话），不回呼
					else {}
					break;
				default:
					break;
			}
		});
	}

	function _deleteEvent(){
		_gid && api('deleteEvent', {userId: _gid});
		// _gid = '';
	}

	function _startToReoprt(config, callback){
		_callback || (_callback = callback);
		_config || (_config = config);

		// h5 方式屏蔽访客回呼功能
		if(utils.isTop) return;

		// 要求外部页面更新URL
		transfer.send({event: 'updateURL'}, window.transfer.to);

		// 用户点击联系客服弹出的窗口，结束会话后调用的startToReport没有传入参数
		if(!_config){
			console.log('not config yet.');
		}
		else if(_polling){
			_polling.start();
		}
		else if(_config.user.username){
			_reportVisitor(_config.user.username);
		}
		else{
			_reportGuest();
		}
	}

	function _reportGuest(){
		var guestId = _config.guestId || utils.uuid();

		// 缓存guestId
		transfer.send({event: 'setItem', data: {
			key: 'guestId',
			value: guestId
		}}, window.transfer.to);

		_polling = new Polling(function(){
			_reportData('GUEST', guestId);
		}, POLLING_INTERVAL);

		_polling.start();
	}

	function _reportVisitor(username){
		// 获取关联信息
		api('getRelevanceList', {
			tenantId: _config.tenantId
		}, function(msg) {
			if (!msg.data.length) {
				throw '未创建关联';
			}
			var splited = _config.appKey.split('#');
			var relevanceList = msg.data[0];
			var orgName = splited[0] || relevanceList.orgName;
			var appName = splited[1] || relevanceList.appName;
			var imServiceNumber = relevanceList.imServiceNumber;

			_config.restServer = _config.restServer || relevanceList.restDomain;
			var cluster = _config.restServer ? _config.restServer.match(/vip\d/) : '';
			cluster = cluster && cluster.length ? '-' + cluster[0] : '';
			_config.xmppServer = _config.xmppServer || 'im-api' + cluster + '.easemob.com';

			_gid = orgName + '#' + appName + '_' + username;

			_polling = new Polling(function(){
				_reportData('VISITOR', _gid);
			}, POLLING_INTERVAL);

			// 获取当前会话信息
			api('getCurrentServiceSession', {
				tenantId: _config.tenantId,
				orgName: orgName,
				appName: appName,
				imServiceNumber: imServiceNumber,
				id: username
			}, function(msg){
				// 没有会话数据，则开始轮询
				if(!msg.data){
					_polling.start();
				}
			});
		});
	}

	function _stopReporting(){
		_polling && _polling.stop();
		_deleteEvent();
	}

	function _isStarted() {
		return _polling && _polling.isStarted;
	}

	easemobim.eventCollector = {
		startToReport: _startToReoprt,
		stopReporting: _stopReporting,
		isStarted: _isStarted,
		updateURL: function(url){
			_url = url;
		}
	};
}(
	easemobim.Polling,
	easemobim.utils,
	easemobim.api
));

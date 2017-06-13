app.eventCollector = (function (Polling, utils, _const, apiHelper, profile) {
	var POLLING_INTERVAL = 5000;

	var _polling;
	var _callback;
	var _config;
	var _gid;

	function _reportData(userType, userId) {
		var url = profile.currentBrowsingURL;

		transfer.send({event: _const.EVENTS.REQUIRE_URL});

		url && apiHelper.reportEvent(url, userType, userId).then(function (resp){
			var type = resp.type;
			var username = resp.userName;
			var orgName = resp.orgName;
			var appName = resp.appName;

			switch (type) {
				// 没有坐席呼叫，什么都不做
			case 'OK':
				break;
				// 有坐席呼叫
			case 'INIT_CALL':
				if (_isStarted()) {
					// 回呼游客，游客身份变为访客
					if (username) {
						_gid = orgName + '#' + appName + '_' + username;
						_polling.stop();
						_polling = new Polling(function () {
							_reportData('VISITOR', _gid);
						}, POLLING_INTERVAL);
					}
					_stopReporting();
					_callback(resp);
				}
				// 已停止轮询 （被呼叫的访客/游客 已经创建会话），不回呼
				else {}
				break;
			default:
				throw 'unexpected event type.'
				break;
			}
		});
	}

	function _startToReoprt(cfg, callback) {
		_callback || (_callback = callback);
		_config || (_config = cfg);

		// h5 方式屏蔽访客回呼功能
		if (utils.isTop) return;

		// 要求外部页面更新URL
		transfer.send({ event: _const.EVENTS.REQUIRE_URL });

		// 用户点击联系客服弹出的窗口，结束会话后调用的startToReport没有传入参数
		if (!_config) {
			console.error('not config yet.');
		}
		else if (_polling) {
			_polling.start();
		}
		else if (_config.user.username) {
			_reportVisitor(_config.user.username);
		}
		else {
			_reportGuest();
		}
	}

	function _reportGuest() {
		var guestId = _config.guestId || utils.uuid();

		// 缓存guestId
		transfer.send({
			event: _const.EVENTS.SET_ITEM,
			data: {
				key: 'guestId',
				value: guestId
			}
		});

		_polling = new Polling(function () {
			_reportData('GUEST', guestId);
		}, POLLING_INTERVAL);

		_polling.start();
	}

	function _reportVisitor(username) {
		// 获取关联信息
		apiHelper.getRelevanceList().then(function (relevanceList){
			var targetItem = relevanceList[0];
			var splited = _config.appKey.split('#');

			_config.orgName = splited[0] || targetItem.orgName;
			_config.appName = splited[1] || targetItem.appName;
			_config.imServiceNumber = targetItem.imServiceNumber;
			_config.restServer = _config.restServer || targetItem.restDomain;

			var cluster = _config.restServer ? _config.restServer.match(/vip\d/) : '';
			cluster = cluster && cluster.length ? '-' + cluster[0] : '';
			_config.xmppServer = _config.xmppServer || 'im-api' + cluster + '.easemob.com';

			_gid = _config.orgName + '#' + _config.appName + '_' + _config.username;

			_polling = new Polling(function (){
				_reportData('VISITOR', _gid);
			}, POLLING_INTERVAL);

			// 获取当前会话信息
			apiHelper.getCurrentServiceSession().then(function (response){
				// 没有会话数据，则开始轮询
				!response && _polling.start();
			});
		}, function(err){
			throw err;
		});
	}

	function _stopReporting() {
		_polling && _polling.stop();
		_gid && apiHelper.deleteEvent(_gid);
	}

	function _isStarted() {
		return _polling && _polling.isStarted;
	}

	return {
		startToReport: _startToReoprt,
		stopReporting: _stopReporting,
		isStarted: _isStarted
	};
}(
	easemobim.Polling,
	easemobim.utils,
	easemobim._const,
	app.apiHelper,
	app.profile
));

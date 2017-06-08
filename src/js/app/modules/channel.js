app.channel = (function(_const, utils, api, apiHelper, satisfaction, profile){
	'strict';

	var isNoAgentOnlineTipShowed;
	var receiveMsgTimer;
	var sessionListView;
	var token;
	var config;
	var conn;

	// other module
	var chat;
	var createMessageView;
	var sessionList;

	// 监听ack的timer, 每条消息启动一个
	var ackTimerDict = new easemobim.Dict();

	// 发消息队列
	var sendMsgDict = new easemobim.Dict();

	// 收消息队列
	var receiveMsgDict = new easemobim.Dict();


	var channel = {
		init: function(){
			config = profile.config;
			chat = app.chat;
			createMessageView = app.createMessageView;
			sessionList = app.sessionList;
		},
		initConnection: function(){
			conn = new WebIM.connection({
				url: config.xmppServer,
				retry: true,
				isMultiLoginSessions: config.resources,
				heartBeatWait: _const.HEART_BEAT_INTERVAL
			});
		},
		reSend: _reSend,
		open: _open,
		sendTransferToKf: _sendTransferToKf,
		sendText: _sendText,
		sendImg: _sendImg,
		sendFile: _sendFile,
		listen: _listen,
		attemptToAppendOfficialAccount: _attemptToAppendOfficialAccount,

		// todo: move this to message view
		handleHistoryMsg: function(element) {
			_handleMessage(_transformMessageFormat(element), null, true);
		},
		initSecondChannle: function () {
			receiveMsgTimer = setInterval(function() {
				api('receiveMsgChannel', {
					orgName: config.orgName,
					appName: config.appName,
					easemobId: config.toUser,
					tenantId: config.tenantId,
					visitorEasemobId: config.user.username
				}, function (msg) {
					//处理收消息
					msg.data
						&& msg.data.status === 'OK'
						&& _.each(msg.data.entities, function (elem) {
							_handleMessage(_transformMessageFormat({body: elem}), null, false);
						});
				});
			}, _const.SECOND_CHANNEL_MESSAGE_RECEIVE_INTERVAL);
		},
		handleReceive: _handleMessage
	};

	return channel;

	function _open(){
		var op = {
			user: config.user.username,
			appKey: config.appKey,
			apiUrl: location.protocol + '//' + config.restServer
		};

		if (config.user.token) {
			op.accessToken = config.user.token;
		}
		else {
			op.pwd = config.user.password;
		}

		conn.open(op);

		Modernizr.peerconnection
			&& config.grayList.audioVideo
			&& app.videoChat.init(conn, _sendText, config);
	}

	function _listen() {
		// xmpp连接超时则改为可发送消息状态
		// todo: 自动切换通道状态
		var reOpenTimerHandler;
		var firstTS = setTimeout(function () {
			chat.handleReady();
		}, _const.FIRST_CHANNEL_CONNECTION_TIMEOUT);

		conn.listen({
			onOpened: function (info) {
				// 连接未超时，清除timer，暂不开启api通道发送消息
				clearTimeout(firstTS);

				reOpenTimerHandler && clearTimeout(reOpenTimerHandler);
				token = info.accessToken;
				conn.setPresence();

				chat.handleReady(info);
			},
			onTextMessage: function (message) {
				_handleMessage(message, 'txt');
			},
			onEmojiMessage: function (message) {
				_handleMessage(message, 'emoji');
			},
			onPictureMessage: function (message) {
				_handleMessage(message, 'img');
			},
			onFileMessage: function (message) {
				_handleMessage(message, 'file');
			},
			onCmdMessage: function (message) {
				_handleMessage(message, 'cmd');
			},
			onOnline: function () {
				utils.isMobile && _open();
			},
			onOffline: function () {
				utils.isMobile && conn.close();
				// for debug
				console.log('onOffline-channel');
				// 断线关闭视频通话
				if (Modernizr.peerconnection) {
					app.videoChat.onOffline();
				}
				// todo 断线后停止轮询坐席状态
				// chat.stopGettingAgentStatus();
			},
			onError: function (e) {
				if (e.reconnect) {
					_open();
				}
				else if (e.type === _const.IM.WEBIM_CONNCTION_AUTH_ERROR) {
					reOpenTimerHandler || (reOpenTimerHandler = setTimeout(function () {
						_open();
					}, 2000));
				}
				else if (
					e.type === _const.IM.WEBIM_CONNCTION_OPEN_ERROR
					&& e.data.type === _const.IM.WEBIM_CONNCTION_AJAX_ERROR
					&& /user not found/.test(e.data.data)
					&& config.isUsernameFromCookie
				) {
					// 偶发创建用户失败，但依然可以获取到密码的情况，此时需要重新创建用户
					// 仅当用户名从cookie中取得时才会重新创建用户，客户集成指定用户错误不管
					console.error(e.data);
					easemobim.reCreateImUser();
				}
				// im sdk 会捕获回调中的异常，需要把出错信息打出来
				else if (e.type === _const.IM.WEBIM_CONNCTION_CALLBACK_INNER_ERROR) {
					console.error(e.data);
				}
				else {
					console.error(e);
					typeof config.onerror === 'function' && config.onerror(e);
				}
			}
		});
	}

	function _reSend(type, id) {
		if (!id) return;

		switch (type) {
		case 'txt':
			// 重试只发一次
			_sendMsgChannle(id, 0);
			break;
		default:
			// todo: 解决图片文件无法重发问题
			conn.send(id);
			break;
		}
	}

	function _sendText(message, ext) {
		var id = utils.uuid();
		var msg = new WebIM.message.txt(id);
		msg.set({
			msg: message,
			to: config.toUser,
			// 此回调用于确认im server收到消息, 有别于kefu ack
			success: function (id) {},
			fail: function (id) {}
		});

		if (ext) {
			_.extend(msg.body, ext);
		}
		_setExt(msg);
		_appendAck(msg, id);
		conn.send(msg.body);
		sendMsgDict.set(id, msg);
		_detectSendTextMsgByApi(id);

		// 空文本消息不上屏
		if (!message) return;
		_appendMsg({
			id: id,
			type: 'txt',
			data: message
		}, {
			isReceived: false,
			isHistory: false
		});

		_promptNoAgentOnlineIfNeeded({
			hasTransferedToKefu: message === '转人工' || message === '转人工客服'
		});
	}

	function _sendTransferToKf(tid, sessionId) {
		var id = utils.uuid();
		var msg = new WebIM.message.cmd(id);
		msg.set({
			to: config.toUser,
			action: 'TransferToKf',
			ext: {
				weichat: {
					ctrlArgs: {
						id: tid,
						serviceSessionId: sessionId
					}
				}
			}
		});
		_appendAck(msg, id);
		conn.send(msg.body);
		sendMsgDict.set(id, msg);
		_detectSendTextMsgByApi(id);

		_promptNoAgentOnlineIfNeeded({hasTransferedToKefu: true});
	}

	function _sendImg(fileMsg, fileInput) {
		var id = utils.uuid();
		var msg = new WebIM.message.img(id);

		fileInput && (fileInput.value = '');
		msg.set({
			apiUrl: location.protocol + '//' + config.restServer,
			file: fileMsg,
			accessToken: token,
			to: config.toUser,
			uploadError: function (error) {
				//显示图裂，无法重新发送
				var id = error.id;
				var loading = document.getElementById(id + '_loading');
				var msgWrap = document.querySelector('#' + id + ' .em-widget-msg-container');

				msgWrap && (msgWrap.innerHTML = '<i class="icon-broken-pic"></i>');
				utils.addClass(loading, 'hide');
				// todo: fix this part can not be called
			},
			success: function (id) {
				// todo: 验证这里是否执行，验证此处id是im msg id 还是 kefu-ack-id
				_hideFailedAndLoading(id);
			},
			fail: function (id) {
				_showFailed(id);
			}
		});
		_setExt(msg);
		_appendAck(msg, id);
		_appendMsg({
			id: id,
			type: 'img',
			url: fileMsg.url
		}, {
			isReceived: false,
			isHistory: false
		});
		conn.send(msg.body);
		sendMsgDict.set(id, msg);
		_detectUploadImgMsgByApi(id, fileMsg.data);

		// 自己发出去的图片要缓存File对象，用于全屏显示图片
		profile.imgFileList.set(fileMsg.url, fileMsg.data);
	}

	function _sendFile(fileMsg, fileInput) {
		var id = utils.uuid();
		var msg = new WebIM.message.file(id);

		fileInput && (fileInput.value = '');
		msg.set({
			apiUrl: location.protocol + '//' + config.restServer,
			file: fileMsg,
			to: config.toUser,
			uploadError: function (error) {
				var id = error.id;
				var loading = document.getElementById(id + '_loading');
				var msgWrap = document.querySelector('#' + id + ' .em-widget-msg-container');

				//显示图裂，无法重新发送
				msgWrap && (msgWrap.innerHTML = '<i class="icon-broken-pic"></i>');
				utils.addClass(loading, 'hide');
				// todo: fix this part can not be called
			},
			success: function (id) {
				// todo: 验证这里是否执行，验证此处id是im msg id 还是 kefu-ack-id
				_hideFailedAndLoading(id);
			},
			fail: function (id) {
				_showFailed(id);
			}
		});
		_setExt(msg);
		_appendMsg({
			id: id,
			type: 'file',
			url: fileMsg.url,
			filename: fileMsg.filename,
			fileLength: fileMsg.data.size
		}, {
			isReceived: false,
			isHistory: false
		});
		conn.send(msg.body);
	}

	function _handleMessage(msg, msgType, isHistory) {
		var str;
		var message;
		var title;
		var inviteId;
		var serviceSessionId;
		var agentInfo;
		var type = msgType || (msg && msg.type);
		var eventName = utils.getDataByPath(msg, 'ext.weichat.event.eventName');
		var eventObj = utils.getDataByPath(msg, 'ext.weichat.event.eventObj');
		var msgId = utils.getDataByPath(msg, 'ext.weichat.msgId');

		// from 不存在默认认为是收到的消息
		var isReceived = !msg.from || (msg.from.toLowerCase() !== config.user.username.toLowerCase());
		var officialAccount = utils.getDataByPath(msg, 'ext.weichat.official_account');

		if (receiveMsgDict.get(msgId)) {
			// 重复消息不处理
			return;
		}
		else if (msgId){
			// 消息加入去重列表
			receiveMsgDict.set(msgId, msg);
		}
		else {
			// 没有msgId忽略，继续处理（KEFU-ACK消息没有msgId）
		}

		// 绑定访客的情况有可能会收到多关联的消息，不是自己的不收
		if (!isHistory && msg.from && msg.from.toLowerCase() != config.toUser.toLowerCase() && !msg.noprompt) {
			return;
		}

		officialAccount && _attemptToAppendOfficialAccount(officialAccount);

		//满意度评价
		if (utils.getDataByPath(msg, 'ext.weichat.ctrlType') === 'inviteEnquiry') {
			type = 'satisfactionEvaluation';
		}
		// 机器人自定义菜单，仅收到的此类消息显示为菜单，（发出的渲染为文本消息）
		else if (isReceived && utils.getDataByPath(msg, 'ext.msgtype.choice')) {
			type = 'robotList';
		}
		//机器人转人工
		else if (utils.getDataByPath(msg, 'ext.weichat.ctrlType') === 'TransferToKfHint') {
			type = 'robotTransfer';
		}
		// 待接入超时转留言
		else if (
			eventName === 'ServiceSessionWillScheduleTimeoutEvent'
			&& eventObj
			&& eventObj.ticketEnable === 'true'
		){
			type = 'transferToTicket';
		}
		else {}

		switch (type) {
		case 'txt':
		case 'emoji':
		case 'img':
		case 'file':
			message = msg;
			message.type = type;
			break;

		case 'cmd':
			var action = msg.action;
			if (action === 'KF-ACK'){
				// 清除ack对应的site item
				_clearTS(msg.ext.weichat.ack_for_msg_id);
				return;
			}
			else if (action === 'KEFU_MESSAGE_RECALL'){
				// 撤回消息命令
				var recallMsgId = msg.ext.weichat.recall_msg_id;
				var dom = document.getElementById(recallMsgId);
				utils.addClass(dom, 'hide');
			}
			break;
		case 'satisfactionEvaluation':
			inviteId = msg.ext.weichat.ctrlArgs.inviteId;
			serviceSessionId = msg.ext.weichat.ctrlArgs.serviceSessionId;

			message = msg;
			message.type = 'list';
			message.data = '请对我的服务做出评价';
			message.list = [
			'<div class="em-btn-list">'
				+ '<button class="bg-hover-color js_satisfybtn" data-inviteid="'
				+ inviteId
				+ '" data-servicesessionid="'
				+ serviceSessionId
				+ '">立即评价</button></div>'
			];

			!isHistory && satisfaction.show(inviteId, serviceSessionId);
			break;
		case 'robotList':
			message = msg;
			message.type = 'list';
			message.list = '<div class="em-btn-list">'
				+ _.map(msg.ext.msgtype.choice.items, function(item){
					var id = item.id;
					var label = item.name;
					var className = 'js_robotbtn ';
					if (item.id === 'TransferToKf') {
						// 转人工按钮突出显示
						className += 'white bg-color border-color bg-hover-color-dark';
					}
					else {
						className += 'bg-hover-color';
					}
					return '<button class="' + className + '" data-id="' + id + '">' + label + '</button>';
				}).join('')
				+ '</div>';
			message.data = msg.ext.msgtype.choice.title;
			break;
		case 'skillgroupMenu':
			message = msg;
			message.type = 'list';
			message.list = '<div class="em-btn-list">'
				+ _.map(msg.data.children, function(item){
					var queueName = item.queueName;
					var label = item.menuName;
					var className = 'js_skillgroupbtn bg-hover-color';

					return '<button class="' + className + '" data-queue-name="' + queueName + '">' + label + '</button>';
				}).join('')
				+ '</div>';
			message.data = msg.data.menuName;
			break;
		case 'robotTransfer':
			var ctrlArgs = msg.ext.weichat.ctrlArgs;
			message = msg;
			message.type = 'list';
			message.data = message.data || utils.getDataByPath(msg, 'ext.weichat.ctrlArgs.label');
			/*
				msg.ext.weichat.ctrlArgs.label 未知是否有用，暂且保留
				此处修改为了修复取出历史消息时，转人工评价标题改变的bug
				还有待测试其他带有转人工的情况
			*/
			message.list = [
				'<div class="em-btn-list">',
					'<button class="white bg-color border-color bg-hover-color-dark js_robotTransferBtn" ',
					'data-sessionid="' + ctrlArgs.serviceSessionId + '" ',
					'data-id="' + ctrlArgs.id + '">' + ctrlArgs.label + '</button>',
				'</div>'
			].join('');
			break;
		case 'transferToTicket':
			message = msg;
			message.type = 'list';
			message.list = [
				'<div class="em-btn-list">',
					'<button class="white bg-color border-color bg-hover-color-dark js-transfer-to-ticket">',
						'留言',
					'</button>',
				'</div>'
			].join('');
			break;
		default:
			console.error('unexpected msg type');
			break;
		}
		if (!isHistory) {
			// 实时消息需要处理系统事件
			_handleSystemEvent(eventName, eventObj, msg);

			agentInfo = utils.getDataByPath(msg, 'ext.weichat.agent');
			if (agentInfo){
				// 开始轮询坐席状态
				chat.startToGetAgentStatus();
				chat.setAgentProfile(agentInfo);
				// todo: cache current avatar
			}
		}
		// 空文本消息不显示
		if (!message || (type === 'txt' && !message.data)) return;

		// 	给收到的消息加id，用于撤回消息
		message.id = msgId;

		// 消息上屏
		_appendMsg(message, {
			isReceived: isReceived,
			isHistory: isHistory,
			timestamp: msg.timestamp
		});

		if (!isHistory) {
			if (!msg.noprompt) {
				_messagePrompt(message);
			}

			// 兼容旧的消息格式
			message.value = message.data;
			// 收消息回调
			transfer.send({
				event: _const.EVENTS.ONMESSAGE,
				data: {
					from: msg.from,
					to: msg.to,
					message: message
				}
			});
		}
	}

	function _transformMessageFormat(element){
		var msgBody = element.body || {};
		var msg = utils.getDataByPath(msgBody, 'bodies.0') || {};
		var url = msg.url;
		var timestamp = element.timestamp || msgBody.timestamp;
		var fileLength;
		// 只有坐席发出的消息里边的file_length是准确的
		if (msgBody.from !== config.user.username){
			fileLength = msg.file_length;
		}

		// 给图片消息或附件消息的url拼上hostname
		if (url && !/^https?/.test(url)) {
			url = location.protocol + config.domain + url;
		}

		return {
			data: msg.msg,
			url: url,
			filename: msg.filename,
			action: msg.action,
			type: msg.type,
			msgId: element.msg_id,
			fromUser: element.from_user,
			timestamp: timestamp,
			fileLength: fileLength,
			ext: msgBody.ext,
			to: msgBody.to,
			from: msgBody.from
		};
	}

	function _showFailed(msgId) {
		utils.addClass(document.getElementById(msgId + '_loading'), 'hide');
		utils.removeClass(document.getElementById(msgId + '_failed'), 'hide');
	}

	function _hideFailedAndLoading(msgId){
		utils.addClass(document.getElementById(msgId + '_loading'), 'hide');
		_showFailed(msgId);
		utils.addClass(document.getElementById(msgId + '_failed'), 'hide');
	}

	// todo: merge setExt & appendAck
	function _appendAck(msg, id) {
		msg.body.ext.weichat.msg_id_for_ack = id;
	}

	function _setExt(msg) {
		msg.body.ext = msg.body.ext || {};
		msg.body.ext.weichat = msg.body.ext.weichat || {};

		//bind skill group
		if (config.emgroup) {
			msg.body.ext.weichat.queueName = config.emgroup;
		}

		//bind visitor
		if (!_.isEmpty(config.visitor)) {
			msg.body.ext.weichat.visitor = config.visitor;
		}

		//bind agent
		if (config.agentName) {
			msg.body.ext.weichat.agentUsername = config.agentName;
		}

		//set growingio id
		if (config.grUserId) {
			msg.body.ext.weichat.visitor = weichat.visitor || {};
			msg.body.ext.weichat.visitor.gr_user_id = config.grUserId;
		}

		if (profile.currentOfficialAccount.official_account_id){
			msg.body.ext.weichat.official_account = {
				id: profile.currentOfficialAccount.id,
				type: profile.currentOfficialAccount.type
			};
		}
	}

	function _promptNoAgentOnlineIfNeeded(opt){
		var hasTransferedToKefu = opt && opt.hasTransferedToKefu;
		// isServiceSessionOpened = true 时会话已被客服接起，此时认为有坐席在线
		var hasAgentOnline = hasTransferedToKefu
			? profile.isServiceSessionOpened || profile.hasHumanAgentOnline
			: profile.isServiceSessionOpened || profile.hasHumanAgentOnline || profile.hasRobotAgentOnline;

		// 显示无坐席在线(只显示一次)
		if (!hasAgentOnline && !isNoAgentOnlineTipShowed) {
			isNoAgentOnlineTipShowed = true;
			_appendEventMsg(_const.eventMessageText.NOTE);
		}
	}

	function _handleSystemEvent(event, data, msg){
		var eventMessageText = _const.SYSTEM_EVENT_MSG_TEXT[event];

		eventMessageText && _appendEventMsg(eventMessageText, msg);

		switch (event) {
			// 转接到客服
		case 'ServiceSessionTransferedEvent':
			_handleAgentStatusChanged(data);
			break;
			// 转人工或者转到技能组
		case 'ServiceSessionTransferedToAgentQueueEvent':
			chat.waitListNumber.start();
			break;
			// 会话结束
		case 'ServiceSessionClosedEvent':
			// todo: use promise to opt this code
			profile.hasReportedAttributes = false;
			// todo: use promise to opt this code
			chat.waitListNumber.stop();
			profile.agentId = null;
			profile.isServiceSessionOpened = false;
			chat.stopGettingAgentStatus();
			// 还原企业头像和企业名称
			chat.setEnterpriseInfo();
			// 去掉坐席状态
			chat.clearAgentStatus();

			// 停止轮询 坐席端的输入状态
			chat.agentInputState.stop();

			transfer.send({ event: _const.EVENTS.ONSESSIONCLOSED });
			break;
			// 会话打开
		case 'ServiceSessionOpenedEvent':
			// fake: 会话接起就认为有坐席在线
			_handleAgentStatusChanged(data);
			profile.isServiceSessionOpened = true;

			// 停止轮询当前排队人数
			chat.waitListNumber.stop();

			// 开始轮询 坐席端的输入状态
			chat.agentInputState.start();

			_attemptToSendAttribute();
			break;
			// 会话创建
		case 'ServiceSessionCreatedEvent':
			chat.waitListNumber.start();
			break;
		default:
			break;
		}
		_promptNoAgentOnlineIfNeeded();
	}

	// 系统事件消息上屏
	function _appendEventMsg(test, msg) {
		// 如果设置了hideStatus, 不显示此类提示
		if (!config.hideStatus) return;

		var officialAccountId = utils.getDataByPath(msg, 'ext.weichat.official_account.official_account_id');
		var targetOfficialAccount = _getOfficialAccountById(officialAccountId);

		targetOfficialAccount.messageView.appendEventMsg(msg);
	}

	function _getOfficialAccountById(id){
		// 默认返回系统服务号
		if (!id) return profile.systemOfficialAccount;

		return _.findWhere(profile.officialAccountList, {official_account_id: id});
	}

	// 坐席改变更新坐席头像和昵称并且开启获取坐席状态的轮训
	function _handleAgentStatusChanged(info) {
		if (!info) return;

		profile.agentId = info.userId;

		chat.setToKefuBtn({isSessionOpen: true});
		chat.updateAgentStatus();

		//更新头像和昵称
		chat.setAgentProfile({
			userNickname: info.agentUserNiceName,
			avatar: info.avatar
		});
	}

	function _appendMsg(msg, options) {
		var opt = options || {};
		var isReceived = opt.isReceived;
		var isHistory = opt.isHistory;
		var officialAccountId;

		if (!isReceived && !isHistory){
			// 自己发出去的即时消息使用当前messageView
			profile.currentOfficialAccount.messageView.appendMsg(msg, opt);
		}
		else{
			officialAccountId = utils.getDataByPath(msg, 'ext.weichat.official_account.official_account_id');
			_getOfficialAccountById(officialAccountId).messageView.appendMsg(msg, opt);
		}
	}

	function _attemptToAppendOfficialAccount(officialAccount){
		var id = officialAccount.official_account_id;
		var type = officialAccount.type;
		var img = officialAccount.img;
		var name = officialAccount.name;
		var targetOfficialAccount = _.findWhere(profile.officialAccountList, {official_account_id: id});

		// 如果相应messageView已存在，则不处理
		if (targetOfficialAccount) return;

		if (type === 'SYSTEM'){
			if (_.isEmpty(profile.systemOfficialAccount)){
				profile.systemOfficialAccount = officialAccount;
				officialAccount.messageView = createMessageView({
					parentContainer: chat.doms.chatWrapper,
					officialAccount: officialAccount
				});
				profile.officialAccountList.push(officialAccount);
			}
			else if (profile.systemOfficialAccount.official_account_id !== id){
			 	// 如果id不为null则更新 systemOfficialAccount
			 	profile.systemOfficialAccount.official_account_id = id;
				profile.systemOfficialAccount.img = img;
				profile.systemOfficialAccount.name = name;
			 }
		}
		else if (type === 'CUSTOM'){
			profile.ctaEnable = true;
			officialAccount.messageView = createMessageView({
				parentContainer: chat.doms.chatWrapper,
				officialAccount: officialAccount
			});
			profile.officialAccountList.push(officialAccount);
			_createSessionListViewIfNeeded();
			profile.sessionListView.appendItem(officialAccount);
		}
		else {
			throw 'unexpected official_account type.';
		}
	}

	function _createSessionListViewIfNeeded(){
		if (profile.sessionListView) return;

		profile.sessionListView = sessionList.init({
			onItemClick: function(id){
				var targerOfficialAccountProfile = id === 'SYSTEM'
				? profile.systemOfficialAccount
				: _.findWhere(profile.officialAccountList, {official_account_id: id});

				_.each(profile.officialAccountList, function(item){
					item.messageView.hide();
				});

				targerOfficialAccountProfile.messageView.show();
				profile.currentOfficialAccount = targerOfficialAccountProfile;
				_getLastSession(profile.currentOfficialAccount.official_account_id);
			}
		});
		// todo: show list button
		// todo: add list button
		utils.on(chat.doms.avatar, 'click', profile.sessionListView.show);
	}

	// 第二通道发消息
	function _sendMsgChannle(id, retryCount) {
		var count;
		var msg = sendMsgDict.get(id);

		if (typeof retryCount === 'number') {
			count = retryCount;
		}
		else {
			count = _const.SECOND_MESSAGE_CHANNEL_MAX_RETRY_COUNT;
		}
		api('sendMsgChannel', {
			from: config.user.username,
			to: config.toUser,
			tenantId: config.tenantId,
			bodies: [utils.getDataByPath(msg, 'body.body')],
			ext: utils.getDataByPath(msg, 'body.ext'),
			orgName: config.orgName,
			appName: config.appName,
			originType: 'webim'
		}, function () {
			// 发送成功清除
			_clearTS(id);
		}, function () {
			// 失败继续重试
			if (count > 0) {
				_sendMsgChannle(id, --count);
			}
			else {
				_showFailed(id);
			}
		});
	}

	// 第二通道上传图片消息
	function _uploadImgMsgChannle(id, file, retryCount) {
		var count;
		var msg = sendMsgDict.get(id);

		if (typeof retryCount === 'number') {
			count = retryCount;
		}
		else {
			count = _const.SECOND_MESSAGE_CHANNEL_MAX_RETRY_COUNT;
		}

		function success(apiMsg){
			msg.body.body = {
				filename: apiMsg.data.fileName,
				'type': 'img',
				url: apiMsg.data.url
			};
			_sendMsgChannle(id, 0);
		}

		function failed(){
			if (count > 0) {
				_uploadImgMsgChannle(msg, file, --count);
			}
			else {
				_showFailed(id);
			}
		}
		// token 存在时会自动从缓存取
		apiHelper.getToken().then(function(token){
			api('uploadImgMsgChannel', {
				userName: config.user.username,
				tenantId: config.tenantId,
				file: file,
				auth: 'Bearer ' + token,
				orgName: config.orgName,
				appName: config.appName,
			}, success, failed);
		}, function(err){
			console.error(err);
		});
	}

	//消息发送成功，清除timer
	function _clearTS(id) {
		clearTimeout(ackTimerDict.get(id));
		ackTimerDict.remove(id);

		_hideFailedAndLoading(id);
		sendMsgDict.remove(id);
	}

	//监听ack，超时则开启api通道, 发文本消息时调用
	function _detectSendTextMsgByApi(id) {
		ackTimerDict.set(
			id,
			setTimeout(function () {
				_sendMsgChannle(id);
			}, _const.FIRST_CHANNEL_MESSAGE_TIMEOUT)
		);
	}

	//监听ack，超时则开启api通道, 上传图片消息时调用
	function _detectUploadImgMsgByApi(id, file) {
		ackTimerDict.set(
			id,
			setTimeout(function () {
				_uploadImgMsgChannle(id, file);
			}, _const.FIRST_CHANNEL_IMG_MESSAGE_TIMEOUT)
		);
	}

	function _attemptToSendAttribute(){
		if (profile.hasReportedAttributes) return;

		apiHelper.getExSession().then(function (data){
			var sessionId = utils.getDataByPath(data, 'serviceSession.serviceSessionId');
			if (!profile.hasReportedAttributes && sessionId) {
				profile.hasReportedAttributes = true;
				apiHelper.reportVisitorAttributes(sessionId);
			}
		});
	}

	function _messagePrompt(message){
		if (utils.isTop) return;

		var value = message.data;
		var type = message.type;
		var tmpVal;
		var brief;
		var avatar = profile.ctaEnable
			? profile.currentOfficialAccount.img
			: profile.currentAgentAvatar;

		switch (type) {
		case 'txt':
		case 'list':
			brief = utils.getBrief(value.replace(/\n/mg, ''), 15);
			break;
		case 'emoji':
			tmpVal = _.map(value, function(item){
				return item.type === 'emoji' ? '[表情]' : item.data;
			}).join('').replace(/\n/mg, '');
			brief = utils.getBrief(tmpVal, 15);
			break;
		case 'img':
			brief = '[图片]';
			break;
		case 'file':
			brief = '[文件]';
			break;
		default:
			console.warn('unexpected message type.');
			brief = '';
		}

		if (utils.isBrowserMinimized() || !profile.isChatWindowOpen) {
			chat.playSound();
			transfer.send({ event: _const.EVENTS.SLIDE });
			transfer.send({
				event: _const.EVENTS.NOTIFY,
				data: {
					avatar: avatar,
					title: '新消息',
					brief: brief
				}
			});
		}
	}
}(
	easemobim._const,
	easemobim.utils,
	app.api,
	app.apiHelper,
	app.satisfaction,
	app.profile
));

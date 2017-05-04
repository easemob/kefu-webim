easemobim.channel = function (config) {
	var me = this;
	var utils = easemobim.utils;
	var api = easemobim.api;
	var _const = easemobim._const;
	var apiHelper = easemobim.apiHelper;

	//监听ack的timer, 每条消息启动一个
	var ackTimerDict = new easemobim.dict();

	//发消息队列
	var sendMsgDict = new easemobim.dict();

	//收消息队列
	var receiveMsgDict = new easemobim.dict();


	var _obj = {

		getConnection: function () {
			return new WebIM.connection({
				url: config.xmppServer,
				retry: true,
				isMultiLoginSessions: config.resources,
				heartBeatWait: _const.HEART_BEAT_INTERVAL
			});
		},

		reSend: function (type, id) {
			if (id) {
				switch (type) {
				case 'txt':
					// 重试只发一次
					_sendMsgChannle(id, 0);
					break;
				}
			}
		},

		appendAck: function (msg, id) {
			msg.body.ext.weichat.msg_id_for_ack = id;
		},

		sendSatisfaction: function (level, content, session, invite) {
			_obj.sendText('', {ext: {
				weichat: {
					ctrlType: 'enquiry',
					ctrlArgs: {
						inviteId: invite || '',
						serviceSessionId: session || '',
						detail: content,
						summary: level
					}
				}
			}});
		},

		sendText: function (message, ext) {
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
			me.setExt(msg);
			_obj.appendAck(msg, id);
			me.conn.send(msg.body);
			sendMsgDict.set(id, msg);
			_detectSendTextMsgByApi(id);

			// 空文本消息不上屏
			if (!message) return;
			me.appendMsg(false, msg, false);
		},


		sendTransferToKf: function (tid, sessionId) {
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
			_obj.appendAck(msg, id);
			me.conn.send(msg.body);
			sendMsgDict.set(id, msg);
			_detectSendTextMsgByApi(id);

			me.handleEventStatus(null, null, true);
		},

		sendImg: function (fileMsg, fileInput) {
			var id = utils.uuid();
			var msg = new WebIM.message.img(id);

			fileInput && (fileInput.value = '');
			msg.set({
				apiUrl: location.protocol + '//' + config.restServer,
				file: fileMsg,
				accessToken: me.token,
				to: config.toUser,
				uploadError: function (error) {
					setTimeout(function () {
						//显示图裂，无法重新发送
						var id = error.id;
						var loading = document.getElementById(id + '_loading');
						var msgWrap = document.querySelector('#' + id + ' .em-widget-msg-container');

						msgWrap && (msgWrap.innerHTML = '<i class="icon-broken-pic"></i>');
						utils.addClass(loading, 'hide');
						me.scrollBottom();
					}, 50);
				},
				success: function (id) {
					utils.$Remove(document.getElementById(id + '_loading'));
					utils.$Remove(document.getElementById(id + '_failed'));
				},
				fail: function (id) {
					utils.addClass(document.getElementById(id + '_loading'), 'hide');
					utils.removeClass(document.getElementById(id + '_failed'), 'hide');
				}
			});
			me.setExt(msg);
			_obj.appendAck(msg, id);
			me.conn.send(msg.body);
			sendMsgDict.set(id, msg);
			_detectUploadImgMsgByApi(id, fileMsg.data);
			me.appendMsg(false, msg, false);
		},

		sendFile: function (fileMsg, fileInput) {
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
					me.scrollBottom();
				},
				success: function (id) {
					utils.$Remove(document.getElementById(id + '_loading'));
					utils.$Remove(document.getElementById(id + '_failed'));
				},
				fail: function (id) {
					utils.addClass(document.getElementById(id + '_loading'), 'hide');
					utils.removeClass(document.getElementById(id + '_failed'), 'hide');
				}
			});
			me.setExt(msg);
			me.conn.send(msg.body);
			me.appendMsg(false, msg, false);
		},

		handleReceive: function (msg, type, isHistory) {
			var str;
			var message;
			var title;
			var msgId = msg.msgId || utils.getDataByPath(msg, 'ext.weichat.msgId');

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

			//绑定访客的情况有可能会收到多关联的消息，不是自己的不收
			if (!isHistory && msg.from && msg.from.toLowerCase() != config.toUser.toLowerCase() && !msg.noprompt) {
				return;
			}

			//满意度评价
			if (utils.getDataByPath(msg, 'ext.weichat.ctrlType') === 'inviteEnquiry') {
				type = 'satisfactionEvaluation';
			}
			//机器人自定义菜单
			else if (utils.getDataByPath(msg, 'ext.msgtype.choice')) {
				type = 'robotList';
			}
			//机器人转人工
			else if (utils.getDataByPath(msg, 'ext.weichat.ctrlType') === 'TransferToKfHint') {
				type = 'robotTransfer';
			}
			// 待接入超时转留言
			else if (
				utils.getDataByPath(msg, 'ext.weichat.event.eventName') === 'ServiceSessionWillScheduleTimeoutEvent'
				&& utils.getDataByPath(msg, 'ext.weichat.event.eventObj.ticketEnable') === 'true'
			){
				type = 'transferToTicket';
			}
			else {}

			switch (type) {
			case 'txt':
			case 'emoji':
				message = new WebIM.message.txt(msgId);
				message.set({ msg: me.getSafeTextValue(msg) });
				break;
			case 'cmd':
				var action = msg.action || utils.getDataByPath(msg, 'bodies.0.action');
				if (action === 'KF-ACK'){
					// 清除ack对应的site item
					_clearTS(msg.ext.weichat.ack_for_msg_id);
					return;
				}
				else if (action === 'KEFU_MESSAGE_RECALL'){
					// 撤回消息命令
					var recallMsgId = msg.ext.weichat.recall_msg_id;
					var dom = document.getElementById(recallMsgId);
					utils.$Remove(dom);
				}
				break;
			case 'img':
				message = new WebIM.message.img(msgId);
				message.set({
					file: {
						url: msg.url || utils.getDataByPath(msg, 'bodies.0.url')
					}
				});
				break;
			case 'file':
				message = new WebIM.message.file(msgId);
				message.set({
					file: {
						url: msg.url || utils.getDataByPath(msg, 'bodies.0.url'),
						filename: msg.filename || utils.getDataByPath(msg, 'bodies.0.filename'),
						filesize: msg.file_length || utils.getDataByPath(msg, 'bodies.0.file_length')
					}
				});
				break;
			case 'satisfactionEvaluation':
				message = new WebIM.message.list();
				message.set({
					value: '请对我的服务做出评价',
					list: [
						'<div class="em-widget-list-btns">'
							+ '<button class="em-widget-list-btn bg-hover-color js_satisfybtn" data-inviteid="'
							+ msg.ext.weichat.ctrlArgs.inviteId
							+ '" data-servicesessionid="'
							+ msg.ext.weichat.ctrlArgs.serviceSessionId
							+ '">立即评价</button></div>'
						]
				});

				if (!isHistory) {
					// 创建隐藏的立即评价按钮，并触发click事件
					var el = document.createElement('BUTTON');
					el.className = 'js_satisfybtn';
					el.style.display = 'none';
					el.setAttribute('data-inviteid', msg.ext.weichat.ctrlArgs.inviteId);
					el.setAttribute('data-servicesessionid', msg.ext.weichat.ctrlArgs.serviceSessionId);
					document.body.appendChild(el);
					utils.trigger(el, 'click');
					easemobim.textarea.blur();
				}
				break;
			case 'robotList':
				message = new WebIM.message.list();
				var list = msg.ext.msgtype.choice.items || msg.ext.msgtype.choice.list;

				if (list.length > 0) {
					str = '<div class="em-widget-list-btns">';
					for (var i = 0, l = list.length; i < l; i++) {
						if (list[i].id === 'TransferToKf') {
							str +=
								'<button class="em-widget-list-btn-white bg-color border-color bg-hover-color-dark js_robotbtn" data-id="' +
								list[i].id + '">' + (list[i].name || list[i]) + '</button>';
						}
						else {
							str += '<button class="em-widget-list-btn bg-hover-color js_robotbtn" data-id="' + list[i].id + '">' + (list[
								i].name || list[i]) + '</button>';
						}
					}
					str += '</div>';
				}
				message.set({ value: msg.ext.msgtype.choice.title, list: str });
				break;
			case 'robotTransfer':
				message = new WebIM.message.list();
				var ctrlArgs = msg.ext.weichat.ctrlArgs;
				title = me.getSafeTextValue(msg)
					|| utils.getDataByPath(msg, 'ext.weichat.ctrlArgs.label');
				/*
					msg.data 用于处理即时消息
					msg.bodies[0].msg 用于处理历史消息
					msg.ext.weichat.ctrlArgs.label 未知是否有用，暂且保留
					此处修改为了修复取出历史消息时，转人工评价标题改变的bug
					还有待测试其他带有转人工的情况
				*/
				str = [
					'<div class="em-widget-list-btns">',
						'<button class="em-widget-list-btn-white bg-color border-color bg-hover-color-dark js_robotTransferBtn" ',
						'data-sessionid="' + ctrlArgs.serviceSessionId + '" ',
						'data-id="' + ctrlArgs.id + '">' + ctrlArgs.label + '</button>',
					'</div>'
				].join('');

				message.set({ value: title, list: str });
				break;
			case 'transferToTicket':
				message = new WebIM.message.list();
				title = me.getSafeTextValue(msg);
				str = [
					'<div class="em-widget-list-btns">',
						'<button class="em-widget-list-btn-white bg-color border-color bg-hover-color-dark js-transfer-to-ticket">',
							'留言',
						'</button>',
					'</div>'
				].join('');

				message.set({ value: title, list: str });
				break;
			default:
				break;
			}
			if (!isHistory) {
				// 实时消息需要处理事件
				switch (utils.getDataByPath(msg, 'ext.weichat.event.eventName')) {
					// 转接到客服
				case 'ServiceSessionTransferedEvent':
					me.handleEventStatus('transferd', msg.ext.weichat.event.eventObj);
					break;
					// 转人工或者转到技能组
				case 'ServiceSessionTransferedToAgentQueueEvent':
					me.waitListNumber.start();
					me.handleEventStatus('transfering', msg.ext.weichat.event.eventObj);
					break;
					// 会话结束
				case 'ServiceSessionClosedEvent':
					// todo: use promise to opt this code
					me.hasSentAttribute = false;
					// todo: use promise to opt this code
					me.waitListNumber.stop();
					config.agentUserId = null;
					me.stopGettingAgentStatus();
					// 还原企业头像和企业名称
					me.setEnterpriseInfo();
					// 去掉坐席状态
					me.clearAgentStatus();
					me.handleEventStatus('close');

					// 停止轮询 坐席端的输入状态
					me.agentInputState.stop();

					!utils.isTop && transfer.send({ event: _const.EVENTS.ONSESSIONCLOSED }, window.transfer.to);
					break;
					// 会话打开
				case 'ServiceSessionOpenedEvent':
					// fake: 会话接起就认为有坐席在线
					me.hasAgentOnline = true;

					// 停止轮询当前排队人数
					me.waitListNumber.stop();

					// 开始轮询 坐席端的输入状态
					me.agentInputState.start();

					me.handleEventStatus('linked', msg.ext.weichat.event.eventObj);
					if (!me.hasSentAttribute) {
						api('getExSession', {
							id: config.user.username,
							orgName: config.orgName,
							appName: config.appName,
							imServiceNumber: config.toUser,
							tenantId: config.tenantId
						}, function (msg) {
							me.sendAttribute(msg);
						});
					}
					break;
					// 会话创建
				case 'ServiceSessionCreatedEvent':
					me.handleEventStatus('create');
					me.waitListNumber.start();
					if (!me.hasSentAttribute) {
						api('getExSession', {
							id: config.user.username,
							orgName: config.orgName,
							appName: config.appName,
							imServiceNumber: config.toUser,
							tenantId: config.tenantId
						}, function (msg) {
							me.sendAttribute(msg);
						});
					}
					break;
				default:
					var agent = utils.getDataByPath(msg, 'ext.weichat.agent');
					agent && me.handleEventStatus('reply', agent);
					break;
				}
			}
			// 空消息不显示
			if (!message || !message.value) return;

			// 	给收到的消息加id，用于撤回消息
			message.id = msgId;
			// 消息上屏
			me.appendMsg(true, message, isHistory, msg.timestamp);

			if (!isHistory) {
				if (!msg.noprompt) {
					me.messagePrompt(message);
				}
				me.scrollBottom(50);

				// 收消息回调
				!utils.isTop && transfer.send({
					event: _const.EVENTS.ONMESSAGE,
					data: {
						from: msg.from,
						to: msg.to,
						message: message
					}
				}, window.transfer.to);
			}
		},

		listen: function (option) {
			var opt = option || { receiveMessage: true };
			var handlers = {
				onOpened: function (info) {
					// 连接未超时，清除timer，暂不开启api通道发送消息
					clearTimeout(firstTS);

					me.reOpen && clearTimeout(me.reOpen);
					me.token = info.accessToken;
					me.conn.setPresence();

					me.handleReady(info);
				},
				onTextMessage: function (message) {
					me.channel.handleReceive(message, 'txt');
				},
				onEmojiMessage: function (message) {
					me.channel.handleReceive(message, 'emoji');
				},
				onPictureMessage: function (message) {
					me.channel.handleReceive(message, 'img');
				},
				onFileMessage: function (message) {
					me.channel.handleReceive(message, 'file');
				},
				onCmdMessage: function (message) {
					me.channel.handleReceive(message, 'cmd');
				},
				onOnline: function () {
					utils.isMobile && me.open();
				},
				onOffline: function () {
					utils.isMobile && me.conn.close();
					// for debug
					console.log('onOffline-channel');
					// 断线关闭视频通话
					if (Modernizr.peerconnection) {
						easemobim.videoChat.onOffline();
					}
					// todo 断线后停止轮询坐席状态
					// me.stopGettingAgentStatus();
				},
				onError: function (e) {
					if (e.reconnect) {
						me.open();
					}
					else if (e.type === _const.IM.WEBIM_CONNCTION_AUTH_ERROR) {
						me.reOpen || (me.reOpen = setTimeout(function () {
							me.open();
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
						console.warn(e.data);
						easemobim.reCreateImUser();
					}
					// im sdk 会捕获回调中的异常，需要把出错信息打出来
					else if (e.type === _const.IM.WEBIM_CONNCTION_CALLBACK_INNER_ERROR) {
						console.error(e.data);
					}
					else {
						console.warn(e);
						//me.conn.stopHeartBeat(me.conn);
						typeof config.onerror === 'function' && config.onerror(e);
					}
				}
			};

			if (!opt.receiveMessage) {
				delete handlers.onTextMessage;
				delete handlers.onEmojiMessage;
				delete handlers.onPictureMessage;
				delete handlers.onFileMessage;
				delete handlers.onCmdMessage;
			}

			me.conn.listen(handlers);
		},

		handleHistoryMsg: function (element) {
			var msgBody = element.body || {};
			var msg = utils.getDataByPath(msgBody, 'bodies.0') || {};
			var type = msg.type;
			var timestamp = element.timestamp || msgBody.timestamp;
			var filename = msg.filename;
			var textMsg = me.getSafeTextValue(msgBody) || msg.msg;
			var msgId = element.msgId;
			var msgObj;

			// 给图片消息或附件消息的url拼上hostname
			(msg.url && !/^https?/.test(msg.url)) && (msg.url = location.protocol + config.domain + msg.url);

			// 已撤回消息 不处理
			if (utils.getDataByPath(msgBody, 'ext.weichat.recall_flag') === 1) return;

			if (msgBody.from === config.user.username) {
				// 访客发出的消息
				// 仅处理文本、图片、附件3种
				// 空文本消息不上屏
				if (/img|file|txt/.test(type) && (type !== 'txt' || textMsg)){
					msgObj = new WebIM.message[type](msgId);
					// 此处后端无法取得正确的文件大小，删除属性
					delete msg.file_length;
					msgObj.set({
						msg: textMsg,
						file: msg
					});
					me.appendMsg(false, msgObj, true, timestamp);
					me.hideLoading(msgId);
				}
			}
			else {
				// 客服坐席发出的消息
				msgBody.timestamp = timestamp;
				msgBody.filename = filename;
				msgBody.data = textMsg;
				msgBody.msgId = msgId;
				msgBody.file_length = msg.file_length;
				me.channel.handleReceive(msgBody, type, true);
			}
		},
		initSecondChannle: function () {
			me.receiveMsgTimer = setInterval(_receiveMsgChannel, _const.SECOND_CHANNEL_MESSAGE_RECEIVE_INTERVAL);
		}
	};

	// 第二通道收消息
	function _receiveMsgChannel() {
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
					try {
						_obj.handleReceive(elem, elem.bodies[0].type, false);
					}
					catch (e) {
						console.warn(e);
					}
				});
		});
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
				me.showFailed(id);
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
				me.showFailed(id);
			}
		}
		// token 存在时会自动从缓存取
		apiHelper.fetch('getToken').then(function(token){
			api('uploadImgMsgChannel', {
				userName: config.user.username,
				tenantId: config.tenantId,
				file: file,
				auth: 'Bearer ' + token,
				orgName: config.orgName,
				appName: config.appName,
			}, success, failed);
		}, function(err){
			console.warn(err);
		});
	}

	//消息发送成功，清除timer
	function _clearTS(id) {
		clearTimeout(ackTimerDict.get(id));
		ackTimerDict.remove(id);

		utils.$Remove(document.getElementById(id + '_loading'));
		utils.$Remove(document.getElementById(id + '_failed'));

		if (sendMsgDict.get(id)) {
			me.handleEventStatus(null, null, sendMsgDict.get(id).value === '转人工' || sendMsgDict.get(id).value === '转人工客服');
		}

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
	
	// 初始监听xmpp的timer, xmpp连接超时则按钮变为发送
	var firstTS = setTimeout(function () {
		me.handleReady();
	}, _const.FIRST_CHANNEL_CONNECTION_TIMEOUT);

	return _obj;
};

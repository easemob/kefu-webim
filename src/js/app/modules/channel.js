easemobim.channel = function (config) {
	var me = this;
	var utils = easemobim.utils;
	var api = easemobim.api;
	var _const = easemobim._const;

	//监听ack的timer, 每条消息启动一个
	var ackTS = new easemobim.site();

	//发消息队列
	var sendMsgSite = new easemobim.site();

	//收消息队列
	var receiveMsgSite = new easemobim.site();


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
				var msg = sendMsgSite.get(id);

				switch (type) {
				case 'txt':
					_sendMsgChannle(msg, 0); //重试只发一次
					break;
				}
			}
		},

		appendAck: function (msg, id) {
			msg.body.ext.weichat.msg_id_for_ack = id;
		},

		sendSatisfaction: function (level, content, session, invite) {
			_obj.sendText('', false, {ext: {
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

		sendText: function (message, isHistory, ext) {
			var id = utils.uuid();
			var msg = new WebIM.message.txt(isHistory ? null : id);
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

			if (!isHistory) {
				// 开启倒计时
				_detectSendMsgByApi(id);
				me.setExt(msg);
				_obj.appendAck(msg, id);
				me.conn.send(msg.body);
				sendMsgSite.set(id, msg);
				// 空文本消息不上屏
				if (!message) return;
				me.appendDate(new Date().getTime(), config.toUser);
				me.appendMsg(config.user.username, config.toUser, msg);
			}
			else {
				if (!message) return;
				me.appendMsg(config.user.username, isHistory, msg, true);
			}
		},


		sendTransferToKf: function (tid, sessionId) {
			var id = utils.uuid();
			_detectSendMsgByApi(id);
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
			sendMsgSite.set(id, msg);

			me.handleEventStatus(null, null, true);
		},

		sendImg: function (file, isHistory) {
			var id = utils.uuid();
			var msg = new WebIM.message.img(isHistory ? null : id);

			msg.set({
				apiUrl: location.protocol + '//' + config.restServer,
				file: file,
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
				uploadComplete: function () {
					me.handleEventStatus();
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
			if (!isHistory) {
				me.setExt(msg);
				me.conn.send(msg.body);
				me.appendDate(new Date().getTime(), config.toUser);
				me.appendMsg(config.user.username, config.toUser, msg);
			}
			else {
				me.appendMsg(config.user.username, file.to, msg, true);
			}
		},

		sendFile: function (file, isHistory) {
			var id = utils.uuid();
			var msg = new WebIM.message.file(isHistory ? null : id);

			msg.set({
				apiUrl: location.protocol + '//' + config.restServer,
				file: file,
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
				uploadComplete: function () {
					me.handleEventStatus();
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
			if (!isHistory) {
				me.setExt(msg);
				me.conn.send(msg.body);
				me.appendDate(new Date().getTime(), config.toUser);
				me.appendMsg(config.user.username, config.toUser, msg);
			}
			else {
				me.appendMsg(config.user.username, file.to, msg, true);
			}
		},

		handleReceive: function (msg, type, isHistory) {
			var str;
			var message;
			var msgId = msg.msgId || utils.getDataByPath(msg, 'ext.weichat.msgId');

			if (receiveMsgSite.get(msgId)) {
				// 重复消息不处理
				return;
			}
			else if (msgId){
				// 消息加入去重列表
				receiveMsgSite.set(msgId, 1);
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
			// 直播消息
			else if (utils.getDataByPath(msg, 'ext.type') === 'live/video') {
				type = 'liveStreaming/video';  
			}
			else {}

			switch (type) {
			case 'txt':
			case 'emoji':
				message = new WebIM.message.txt(msgId);
				message.set({ msg: isHistory ? msg.data : me.getSafeTextValue(msg) });
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
				var title = msg.data
					|| utils.getDataByPath(msg, 'bodies.0.msg')
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
			case 'liveStreaming/video':
				message = new WebIM.message.txt(msgId);
				message.set({value: isHistory ? msg.data : me.getSafeTextValue(msg)});
				!isHistory
					&& utils.isMobile
					&& easemobim.liveStreaming
					&& easemobim.liveStreaming.open(msg.ext.msgtype.streamId);
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
					!utils.isTop && transfer.send({ event: _const.EVENTS.ONSESSIONCLOSED }, window.transfer.to);
					break;
					// 会话打开
				case 'ServiceSessionOpenedEvent':
					// fake: 会话接起就认为有坐席在线
					me.hasAgentOnline = true;

					// 停止轮询当前排队人数
					me.waitListNumber.stop();

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
			if (!message || !message.value) {
				// 空消息不显示
			}
			else if (isHistory) {
				// 历史消息仅上屏
				me.appendMsg(msg.from, msg.to, message, true);
			}
			else {
				if (!msg.noprompt) {
					me.messagePrompt(message);
				}
				me.appendDate(new Date().getTime(), msg.from);
				me.resetSpan();
				// 	给收到的消息加id，用于撤回消息
				message.id = msgId;
				me.appendMsg(msg.from, msg.to, message);
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

					try {
						me.handleReady(info);
					}
					catch (e) {
						console.warn(e);
					}
				},
				onTextMessage: function (message) {
					me.receiveMsg(message, 'txt');
				},
				onEmojiMessage: function (message) {
					me.receiveMsg(message, 'emoji');
				},
				onPictureMessage: function (message) {
					me.receiveMsg(message, 'img');
				},
				onFileMessage: function (message) {
					me.receiveMsg(message, 'file');
				},
				onCmdMessage: function (message) {
					me.receiveMsg(message, 'cmd');
				},
				onOnline: function () {
					utils.isMobile && me.open();
				},
				onOffline: function () {
					utils.isMobile && me.conn.close();
					// for debug
					console.log('onOffline-channel');
					// 断线关闭视频通话
					if (
						Modernizr.peerconnection
						&& WebIM.WebRTC
						&& easemobim.videoChat
						&& config.grayList.audioVideo
					) {
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
					// im sdk 会捕获 receiveMsg 回调中的异常，需要把出错信息打出来
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

		handleHistory: function (chatHistory) {
			_.each(chatHistory, function (element, index) {
				var msgBody = element.body;
				var msg = utils.getDataByPath(msgBody, 'bodies.0');
				var isSelf = msgBody.from === config.user.username;

				if (!msg) return;
				if (isSelf) {
					//visitors' msg
					switch (msg.type) {
					case 'img':
						msg.url = /^http/.test(msg.url) ? msg.url : config.base + msg.url;
						msg.to = msgBody.to;
						me.channel.sendImg(msg, true);
						break;
					case 'file':
						msg.url = /^http/.test(msg.url) ? msg.url : config.base + msg.url;
						msg.to = msgBody.to;
						// 此处后端无法取得正确的文件大小，故不读取
						// msg.filesize = msg.file_length;
						me.channel.sendFile(msg, true);
						break;
					case 'txt':
						me.channel.sendText(msg.msg, true);
						break;
					}
				}
				//agents' msg
				else if (utils.getDataByPath(msgBody, 'ext.weichat.ctrlType') === 'inviteEnquiry') {
					// 满意度调查的消息，第二通道会重发此消息，需要msgId去重
					msgBody.msgId = element.msgId;
					me.receiveMsg(msgBody, '', true);
				}
				else if (
					utils.getDataByPath(msgBody, 'ext.msgtype.choice')
					|| utils.getDataByPath(msgBody, 'ext.weichat.ctrlType') === 'TransferToKfHint'
				) {
					// 机器人自定义菜单，机器人转人工
					me.receiveMsg(msgBody, '', true);
				}
				else if (utils.getDataByPath(msgBody, 'ext.weichat.recall_flag') === 1) {
					// 已撤回消息，不处理
					return;
				}
				else {
					me.receiveMsg({
						msgId: element.msgId,
						data: msg.type === 'txt' ? me.getSafeTextValue(msgBody) : msg.msg,
						filename: msg.filename,
						file_length: msg.file_length,
						url: /^http/.test(msg.url) ? msg.url : config.base + msg.url,
						from: msgBody.from,
						to: msgBody.to
					}, msg.type, true);
				}

				if (
					// 非cmd消息, 非空文本消息, 非重复消息，非撤回消息
					msg.type !== 'cmd'
					&& (msg.type !== 'txt' || msg.msg)
					&& !receiveMsgSite.get(element.msgId)
				) {
					me.appendDate(element.timestamp || msgBody.timestamp, isSelf ? msgBody.to : msgBody.from, true);
				}
			});
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
					catch (e) {}
				});
		});
	}

	// 第二通道发消息
	function _sendMsgChannle(msg, retryCount) {
		var count;
		var id = msg.id;

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
			bodies: [{
				type: 'txt',
				msg: msg.value,
			}],
			ext: msg.body ? msg.body.ext : null,
			orgName: config.orgName,
			appName: config.appName,
			originType: 'webim'
		}, function () {
			//发送成功清除
			_clearTS(id);
		}, function () {
			//失败继续重试
			if (count > 0) {
				_sendMsgChannle(msg, --count);
			}
			else {
				utils.addClass(document.getElementById(id + '_loading'), 'hide');
				utils.removeClass(document.getElementById(id + '_failed'), 'hide');
			}
		});
	}

	//消息发送成功，清除timer
	function _clearTS(id) {
		clearTimeout(ackTS.get(id));
		ackTS.remove(id);

		utils.$Remove(document.getElementById(id + '_loading'));
		utils.$Remove(document.getElementById(id + '_failed'));

		if (sendMsgSite.get(id)) {
			me.handleEventStatus(null, null, sendMsgSite.get(id).value === '转人工' || sendMsgSite.get(id).value === '转人工客服');
		}

		sendMsgSite.remove(id);
	}

	//监听ack，超时则开启api通道, 发消息时调用
	function _detectSendMsgByApi(id) {
		ackTS.set(
			id,
			setTimeout(function () {
				//30s没收到ack使用api发送
				_sendMsgChannle(sendMsgSite.get(id));
			}, _const.FIRST_CHANNEL_MESSAGE_TIMEOUT)
		);
	}

	// 初始监听xmpp的timer, xmpp连接超时则按钮变为发送
	var firstTS = setTimeout(function () {
		me.handleReady();
	}, _const.FIRST_CHANNEL_CONNECTION_TIMEOUT);

	return _obj;
};

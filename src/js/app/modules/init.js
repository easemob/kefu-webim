(function (window, undefined) {
	'use strict';

	var utils = easemobim.utils;
	var _const = easemobim._const;
	var api = easemobim.api;
	var eventCollector = easemobim.eventCollector;
	var chat;
	var config;

	getConfig();

	function getConfig() {
		if (utils.isTop) {
			var tenantId = utils.query('tenantId');
			config = {};
			//get config from referrer's config
			try {
				config = JSON.parse(utils.code.decode(utils.getStore('emconfig' + tenantId)));
			}
			catch (e) {}

			config.tenantId = tenantId;
			config.hide = true;
			config.offDutyType = utils.query('offDutyType');
			config.grUserId = utils.query('grUserId');

			// H5 方式集成时不支持eventCollector配置
			config.to = utils.convertFalse(utils.query('to'));
			config.xmppServer = utils.convertFalse(utils.query('xmppServer'));
			config.restServer = utils.convertFalse(utils.query('restServer'));
			config.agentName = utils.convertFalse(utils.query('agentName'));
			config.resources = utils.convertFalse(utils.query('resources'));
			config.hideStatus = utils.convertFalse(utils.query('hideStatus'));
			config.satisfaction = utils.convertFalse(utils.query('sat'));
			config.wechatAuth = utils.convertFalse(utils.query('wechatAuth'));
			config.hideKeyboard = utils.convertFalse(utils.query('hideKeyboard'));

			config.appKey = utils.convertFalse(decodeURIComponent(utils.query('appKey')));
			config.domain = config.domain || '//' + location.host;
			config.offDutyWord = decodeURIComponent(utils.query('offDutyWord'));
			config.language = utils.query('language') || 'zh_CN';
			config.ticket = utils.query('ticket') === '' ? true : utils.convertFalse(utils.query('ticket')); //true default
			try {
				config.emgroup = decodeURIComponent(utils.query('emgroup'));
			}
			catch (e) {
				config.emgroup = utils.query('emgroup');
			}

			config.user = config.user || {};
			var usernameFromUrl = utils.query('user');
			var usernameFromCookie = utils.get('root' + config.tenantId + config.emgroup);
			var usernameFromConfig = config.user.username;

			if (usernameFromUrl && usernameFromUrl === usernameFromConfig) {
				// H5模式下，考虑到多租户情景或者是localstorage没清理
				// 故仅当url和localstorage中的用户名匹配时才认为指定的用户有效
				// 此时什么都不用做，自动使用从localstorage里取出的 username 和 password
			}
			else if (usernameFromUrl) {
				// 用户不匹配时，以url中的用户名为准
				config.user = { username: usernameFromUrl };
			}
			else if (usernameFromCookie) {
				// 未指定用户时，从cookie中取得用户名
				config.user = { username: usernameFromCookie };
				config.isUsernameFromCookie = true;
			}
			else {
				// 以上均不匹配时，需要重新创建用户
				config.user = {};
			}

			chat = easemobim.chat(config);
			initUI(config, initAfterUI);
		}
		else {
			window.transfer = new easemobim.Transfer(null, 'main').listen(function (msg) {
				switch (msg.event) {
				case _const.EVENTS.SHOW:
					if (eventCollector.isStarted()) {
						// 停止上报访客
						eventCollector.stopReporting();
						chatEntry.init(config);
						chatEntry.open();
					}
					else {
						chatEntry.open();
					}
					break;
				case _const.EVENTS.CLOSE:
					chatEntry.close();
					break;
				case _const.EVENTS.EXT:
					chat.channel.sendText('', false, msg.data.ext);
					break;
				case _const.EVENTS.TEXTMSG:
					chat.channel.sendText(msg.data.data, false, msg.data.ext);
					break;
				case _const.EVENTS.UPDATE_URL:
					easemobim.eventCollector.updateURL(msg.data);
					break;
				case _const.EVENTS.INIT_CONFIG:
					chat = easemobim.chat(msg.data);
					window.transfer.to = msg.data.parentId;
					initUI(msg.data, initAfterUI);
					// cache config
					config = msg.data;
					break;
				default:
					break;
				}
			}, ['easemob']);
		}
	}

	function initAfterUI(config) {
		config.base = location.protocol + config.domain;

		//load modules
		// easemobim.leaveMessage = easemobim.leaveMessage(chat, config.tenantId);
		easemobim.querySkillgroup = easemobim.querySkillgroup(chat,config);
		easemobim.workOrder = easemobim.workOrder(chat);
		easemobim.paste(chat).init();
		easemobim.satisfaction(chat);

		// 访客回呼功能
		if (config.eventCollector && !eventCollector.isStarted()) {
			eventCollector.startToReport(config, function (targetUserInfo) {
				chatEntry.init(config, targetUserInfo);
			});
			// 增加访客主动联系客服逻辑
			utils.one(easemobim.imBtn, 'click', function () {
				chatEntry.init(config);
				chatEntry.open();
			});
		}
		else {
			// 获取关联，创建访客，调用聊天窗口
			chatEntry.init(config);
		}

		// 获取主题颜色设置
		api('getTheme', {
			tenantId: config.tenantId
		}, function (msg) {
			var themeName = utils.getDataByPath(msg, 'data.0.optionValue');
			var className = _const.themeMap[themeName];

			className && utils.addClass(document.body, className);
		});
	}

	function initUI(config, callback) {
		var iframe = document.getElementById('cross-origin-iframe');

		iframe.src = config.domain + '/webim/transfer.html?v=<%=WEBIM_PLUGIN_VERSION%>';
		utils.on(iframe, 'load', function () {
			easemobim.getData = new easemobim.Transfer('cross-origin-iframe', 'data');
			callback(config);
		});

		// em-widgetPopBar
		utils.toggleClass(
			document.getElementById('em-widgetPopBar'),
			'hide',
			(utils.isTop || !config.minimum || config.hide)
		);

		// em-kefu-webim-chat
		utils.toggleClass(
			document.getElementById('em-kefu-webim-chat'),
			'hide', !(utils.isTop || !config.minimum)
		);

		// 设置联系客服按钮文字
		document.querySelector('.em-widget-pop-bar').innerText = config.buttonText;

		// 添加移动端样式类
		if (utils.isMobile) {
			utils.addClass(document.body, 'em-mobile');
		}

		// 留言按钮
		// utils.toggleClass(
		// 	document.querySelector('.em-widget-note'),
		// 	'hide', !config.ticket
		// );

		// 最小化按钮
		utils.toggleClass(
			document.querySelector('.em-widgetHeader-min'),
			'hide', !config.minimum || utils.isTop
		);

		// 低版本浏览器不支持上传文件/图片
		utils.toggleClass(
			document.querySelector('.em-widget-file'),
			'hide', !WebIM.utils.isCanUploadFileAsync
		);
		utils.toggleClass(
			document.querySelector('.em-widget-img'),
			'hide', !WebIM.utils.isCanUploadFileAsync
		);

		// 静音按钮
		utils.toggleClass(
			document.querySelector('.em-widgetHeader-audio'),
			'hide', !window.HTMLAudioElement || utils.isMobile || !config.soundReminder
		);

		// 输入框位置开关
		utils.toggleClass(
			document.querySelector('.em-widgetHeader-keyboard'),
			'hide', !utils.isMobile || config.hideKeyboard
		);

		// 满意度评价按钮
		utils.toggleClass(
			document.querySelector('.em-widget-satisfaction'),
			'hide', !config.satisfaction
		);

		// zto custom: add default rest and xmpp server address
		config.restServer = config.restServer || 'a1.jx.zto.com';
		config.xmppServer = config.xmppServer || 'im-api.jx.zto.com:5280';
	}

	var chatEntry = {
		init: function (config, targetUserInfo) {
			var me = this;

			//获取关联信息
			api('getRelevanceList', {
				tenantId: config.tenantId
			}, function (msg) {
				var relevanceList = msg.data;
				var targetItem;
				var appKey = config.appKey;
				var splited = appKey.split('#');
				var orgName = splited[0];
				var appName = splited[1];
				var toUser = config.toUser || config.to;

				// toUser 转为字符串， todo: move it to handle config
				'number' === typeof toUser && (toUser = toUser.toString(10));

				if (!relevanceList.length) {
					chat.errorPrompt('未创建关联', true);
					return;
				}

				if (appKey && toUser) {
					// appKey，imServiceNumber 都指定了
					targetItem = _.where(relevanceList, {
						orgName: orgName,
						appName: appName,
						imServiceNumber: toUser
					})[0];
				}

				// 未指定appKey, toUser时，或未找到符合条件的关联时，默认使用关联列表中的第一项
				if (!targetItem){
					targetItem = targetItem || relevanceList[0];
					console.log('mismatched channel, use default.');
				}

				// 获取企业头像和名称
				// todo：move to handle config (defaultAvatar)
				// todo: rename to tenantName
				config.tenantAvatar = utils.getAvatarsFullPath(targetItem.tenantAvatar, config.domain);
				config.defaultAvatar = config.staticPath ? config.staticPath + '/img/default_avatar.png' : 'static/img/default_avatar.png';
				config.defaultAgentName = targetItem.tenantName;

				config.logo = config.logo || targetItem.tenantLogo;
				config.toUser = targetItem.imServiceNumber;
				config.orgName = targetItem.orgName;
				config.appName = targetItem.appName;
				config.channelId = targetItem.channelId;

				config.appKey = config.orgName + '#' + config.appName;
				config.restServer = config.restServer || targetItem.restDomain;
				config.xmppServer = config.xmppServer || targetItem.xmppServer;

				chat.init();

				if (targetUserInfo) {

					config.toUser = targetUserInfo.agentImName;

					// 游客回呼
					if (targetUserInfo.userName) {
						config.user = {
							username: targetUserInfo.userName,
							password: targetUserInfo.userPassword
						};

						// 发送空的ext消息，延迟发送
						chat.cachedCommandMessage = { ext: { weichat: { agentUsername: targetUserInfo.agentUserName } } };
						chat.ready();
						chat.show();
						transfer.send({ event: _const.EVENTS.SHOW }, window.transfer.to);
						transfer.send({
							event: _const.EVENTS.CACHEUSER,
							data: {
								username: targetUserInfo.userName,
								// todo: check if need emgroup
								group: config.user.emgroup
							}
						}, window.transfer.to);
					}
					// 访客回呼
					else {
						api('getPassword', {
							userId: config.user.username,
							tenantId: config.tenantId
						}, function (msg) {
							var password = msg.data;
							if (!password) {
								// todo: 用户不存在自动降级，重新创建
								console.warn('用户不存在！');
							}
							else {
								config.user.password = password;

								// 发送空的ext消息，延迟发送
								chat.cachedCommandMessage = { ext: { weichat: { agentUsername: targetUserInfo.agentUserName } } };
								chat.ready();
								chat.show();
								transfer.send({ event: _const.EVENTS.SHOW }, window.transfer.to);
							}
						});
					}
				}
				else if (config.user.username && (config.user.password || config.user.token)) {
					chat.ready();
				}
				//检测微信网页授权
				else if (config.wechatAuth) {
					easemobim.wechat(function (data) {
						try {
							data = JSON.parse(data);
						}
						catch (e) {
							data = null;
						}
						if (!data) { //失败自动降级，随机创建访客
							me.go(config);
						}
						else {
							config.visitor = config.visitor || {};
							config.visitor.userNickname = data.nickname;
							var oid = config.tenantId + '_' + config.orgName + '_' + config.appName + '_' + config.toUser + '_' +
								data.openid;
							easemobim.emajax({
								url: '/v1/webimplugin/visitors/wechat/' + oid + '?tenantId=' + config.tenantId,
								data: {
									orgName: config.orgName,
									appName: config.appName,
									imServiceNumber: config.toUser
								},
								type: 'POST',
								success: function (info) {
									try {
										info = JSON.parse(info);
									}
									catch (e) {
										info = null;
									}
									if (info && info.status === 'OK') {
										config.user.username = info.entity.userId;
										config.user.password = info.entity.userPassword;
										chat.ready();
									}
									else {
										me.go(config);
									}

								},
								error: function (e) {
									//失败自动降级，随机创建访客
									me.go(config);
								}
							});
						}
					});
				}
				else if (config.user.username) {
					api('getPassword', {
						userId: config.user.username,
						tenantId: config.tenantId
					}, function (msg) {
						if (!msg.data) {
							me.go(config);
						}
						else {
							config.user.password = msg.data;
							chat.ready();
						}
					});
				}
				else {
					me.go(config);
				}
			});
		},
		go: function (config) {
			api('createVisitor', {
				orgName: config.orgName,
				appName: config.appName,
				imServiceNumber: config.toUser,
				tenantId: config.tenantId
			}, function (msg) {
				config.isNewUser = true;
				config.user.username = msg.data.userId;
				config.user.password = msg.data.userPassword;
				if (utils.isTop) {
					utils.set('root' + config.tenantId + config.emgroup, config.user.username);
				}
				else {
					transfer.send({
						event: _const.EVENTS.CACHEUSER,
						data: {
							username: config.user.username,
							group: config.user.emgroup
						}
					}, window.transfer.to);
				}
				chat.ready();
			});
		},
		open: function () {
			chat.show();
		},
		close: function () {
			chat.close();
		}
	};

	easemobim.reCreateImUser = _.once(function () {
		api('createVisitor', {
			orgName: config.orgName,
			appName: config.appName,
			imServiceNumber: config.toUser,
			tenantId: config.tenantId
		}, function (msg) {
			config.isNewUser = true;
			config.user.username = msg.data.userId;
			config.user.password = msg.data.userPassword;
			if (utils.isTop) {
				utils.set('root' + config.tenantId + config.emgroup, config.user.username);
			}
			else {
				// todo: directly transfer key & value to write cookies
				transfer.send({
					event: _const.EVENTS.CACHEUSER,
					data: {
						username: config.user.username,
						group: config.user.emgroup
					}
				}, window.transfer.to);
			}
			chat.open();
		});
	});
}(window, undefined));

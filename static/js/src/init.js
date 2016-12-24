;(function(window, undefined) {
	'use strict';

	var utils = easemobim.utils;
	var api = easemobim.api;
	var eventCollector = easemobim.eventCollector;
	var chat;
	var afterChatReady;
	var config;

	getConfig();

	function getConfig() {
		if (utils.isTop) {
			var tenantId = utils.query('tenantId');
			config = {};
			//get config from referrer's config
			try {
				config = JSON.parse(utils.code.decode(utils.getStore('emconfig' + tenantId)));
			} catch (e) {}

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
			} catch (e) {
				config.emgroup = utils.query('emgroup');
			}


			//没绑定user直接取cookie
			if (!utils.query('user')) {
				config.user = {
					username: utils.get('root' + config.tenantId + config.emgroup),
					password: '',
					token: ''
				};
			} else if (!config.user || (config.user.username && config.user.username !== utils.query('user'))) {
				config.user = {
					username: '',
					password: '',
					token: ''
				};
			}
			chat = easemobim.chat(config);
			initUI(config, initAfterUI);
		} else {
			window.transfer = new easemobim.Transfer(null, 'main').listen(function(msg) {
				switch (msg.event) {
					case easemobim.EVENTS.SHOW.event:
						if(eventCollector.isStarted()){
							// 停止上报访客
							eventCollector.stopReporting();
							chatEntry.init(config);
							chatEntry.open();
						}
						else{
							chatEntry.open();
						}
						break;
					case easemobim.EVENTS.CLOSE.event:
						chatEntry.close();
						break;
					case easemobim.EVENTS.EXT.event:
						chat.sendTextMsg('', false, msg.data.ext);
						break;
					case easemobim.EVENTS.TEXTMSG.event:
						chat.sendTextMsg(msg.data.data, false, msg.data.ext);
						break;
					case 'updateURL':
						easemobim.eventCollector.updateURL(msg.data);
						break;
					case 'initConfig':
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
		// chat = easemobim.chat(config);

		config.base = location.protocol + config.domain;

		//load modules
		easemobim.leaveMessage = easemobim.leaveMessage(chat, config.tenantId);
		easemobim.paste = easemobim.paste(chat);
		easemobim.satisfaction(chat);

		// 访客回呼功能
		if (config.eventCollector && !eventCollector.isStarted()) {
			eventCollector.startToReport(config, function(targetUserInfo) {
				chatEntry.init(config, targetUserInfo);
			});
			// 增加访客主动联系客服逻辑
			utils.one(easemobim.imBtn, 'click', function(){
				chatEntry.init(config);
				chatEntry.open();
			});
		}
		else {
			// 获取关联，创建访客，调用聊天窗口
			chatEntry.init(config);
		}
	}

	function initUI(config, callback) {
		var iframe = document.getElementById('EasemobKefuWebimIframe');

		iframe.src = config.domain + '/webim/transfer.html?v=<%=WEBIM_PLUGIN_VERSION%>';
		utils.on(iframe, 'load', function() {
			easemobim.getData = new easemobim.Transfer('EasemobKefuWebimIframe', 'data');
			callback(config);
		});

		// em-widgetPopBar
		utils.toggleClass(
			utils.$Dom('em-widgetPopBar'),
			'em-hide',
			(utils.isTop || !config.minimum || config.hide)
		);

		// em-kefu-webim-chat
		utils.toggleClass(
			utils.$Dom('em-kefu-webim-chat'),
			'em-hide',
			!(utils.isTop || !config.minimum)
		);

		// 设置联系客服按钮文字
		document.querySelector('.em-widget-pop-bar').innerText = config.buttonText;

		// 添加移动端样式类
		if (utils.isMobile) {
			utils.addClass(document.body, 'em-mobile');
		}

		// 留言按钮
		utils.toggleClass(
			utils.$Dom('em-widgetNote'),
			'em-hide',
			!config.ticket
		);

		// 最小化按钮
		utils.toggleClass(
			document.querySelector('.em-widgetHeader-min'),
			'hide',
			!config.minimum || utils.isTop
		);

		// 静音按钮
		utils.toggleClass(
			document.querySelector('.em-widgetHeader-audio'),
			'hide',
			!window.HTMLAudioElement || utils.isMobile || !config.soundReminder
		);

		// 输入框位置开关
		utils.toggleClass(
			document.querySelector('.em-widgetHeader-keyboard'),
			'hide',
			!utils.isMobile || config.offDuty || config.hideKeyboard
		);

		// 满意度评价按钮
		utils.toggleClass(
			document.querySelector('.em-widget-satisfaction'),
			'hide',
			!config.satisfaction
		);

		//不支持异步上传则加载swfupload
		if (!Easemob.im.Utils.isCanUploadFileAsync && Easemob.im.Utils.isCanUploadFile) {
			var script = document.createElement('script');
			script.onload = script.onreadystatechange = function() {
				if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
					easemobim.uploadShim(config, chat);
				}
			};
			script.src = location.protocol + config.staticPath + '/js/swfupload/swfupload.min.js';
			document.body.appendChild(script);
		}
	}

	var chatEntry = {
		init: function(config, targetUserInfo) {
			var me = this;

			config.toUser = config.toUser || config.to;

			//上下班状态
			api('getDutyStatus', {
				tenantId: config.tenantId
			}, function(msg) {
				config.offDuty = msg.data ? msg.data && config.offDutyType !== 'chat' : false;

				chat.setOffline(config.offDuty); //根据状态展示上下班不同view
			});

			config.orgName = config.appKey.split('#')[0];
			config.appName = config.appKey.split('#')[1];

			//获取关联信息
			api('getRelevanceList', {
				tenantId: config.tenantId
			}, function(msg) {
				if (msg.data.length === 0) {
					chat.errorPrompt('未创建关联', true);
					return;
				}
				config.relevanceList = msg.data;
				config.tenantAvatar = utils.getAvatarsFullPath(msg.data[0].tenantAvatar, config.domain);
				config.defaultAvatar = config.staticPath ? config.staticPath + '/img/default_avatar.png' : 'static' + '/img/default_avatar.png';
				config.defaultAgentName = msg.data[0].tenantName;
				config.logo = config.logo || msg.data[0].tenantLogo;
				config.toUser = config.toUser || msg.data[0].imServiceNumber;
				config.orgName = config.orgName || msg.data[0].orgName;
				config.appName = config.appName || msg.data[0].appName;
				config.channelid = config.channelid || msg.data[0].channelId;
				config.appKey = config.appKey || config.orgName + '#' + config.appName;
				config.restServer = config.restServer || msg.data[0].restDomain;
				var cluster = config.restServer ? config.restServer.match(/vip\d/) : '';
				cluster = cluster && cluster.length ? '-' + cluster[0] : '';
				config.xmppServer = config.xmppServer || 'im-api' + cluster + '.easemob.com';
				chat.init();

				if (targetUserInfo) {

					config.toUser = targetUserInfo.agentImName;

					// 游客回呼
					if(targetUserInfo.userName){
						config.user = {
							username: targetUserInfo.userName,
							password: targetUserInfo.userPassword
						};

						// 发送空的ext消息，延迟发送
						chat.cachedCommandMessage = {ext: {weichat: {agentUsername: targetUserInfo.agentUserName}}};
						chat.ready();
						chat.show();
						transfer.send(easemobim.EVENTS.SHOW, window.transfer.to);
						transfer.send({
							event: 'setUser',
							data: {
								username: targetUserInfo.userName,
								group: config.user.emgroup
							}
						}, window.transfer.to);
					}
					// 访客回呼
					else {
						api('getPassword', {
							userId: config.user.username,
							tenantId: config.tenantId
						}, function(msg) {
							if (!msg.data) {
								console.log('用户不存在！');
							} else {
								config.user.password = msg.data;

								// 发送空的ext消息，延迟发送
								chat.cachedCommandMessage = {ext: {weichat: {agentUsername: targetUserInfo.agentUserName}}};
								chat.ready();
								chat.show();
								transfer.send(easemobim.EVENTS.SHOW, window.transfer.to);
							}
						});
					}
				}
				else if (config.user.username && (config.user.password || config.user.token)) {
					chat.ready();
				}
				//检测微信网页授权
				else if (config.wechatAuth) {
					easemobim.wechat(function(data) {
						try {
							data = JSON.parse(data);
						} catch (e) {
							data = null;
						}
						if (!data) { //失败自动降级，随机创建访客
							me.go(config);
						} else {
							config.visitor = config.visitor || {};
							config.visitor.userNickname = data.nickname;
							var oid = config.tenantId + '_' + config.orgName + '_' + config.appName + '_' + config.toUser + '_' + data.openid;
							easemobim.emajax({
								url: '/v1/webimplugin/visitors/wechat/' + oid + '?tenantId=' + config.tenantId,
								data: {
									orgName: config.orgName,
									appName: config.appName,
									imServiceNumber: config.toUser
								},
								type: 'POST',
								success: function(info) {
									try {
										info = JSON.parse(info);
									} catch (e) {
										info = null;
									}
									if (info && info.status === 'OK') {
										config.user.username = info.entity.userId;
										config.user.password = info.entity.userPassword;
										chat.ready();
									} else {
										me.go(config);
									}

								},
								error: function(e) {
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
					}, function(msg) {
						if (!msg.data) {
							me.go(config);
						} else {
							config.user.password = msg.data;
							chat.ready();
						}
					});
				} else {
					me.go(config);
				}
			});
		},
		go: function(config) {
			api('createVisitor', {
				orgName: config.orgName,
				appName: config.appName,
				imServiceNumber: config.toUser,
				tenantId: config.tenantId
			}, function(msg) {
				config.newuser = true;
				config.user.username = msg.data.userId;
				config.user.password = msg.data.userPassword;
				if (utils.isTop) {
					utils.set('root' + config.tenantId + config.emgroup, config.user.username);
				} else {
					transfer.send({
						event: 'setUser', data: {
							username: config.user.username,
							group: config.user.emgroup
						}
					}, window.transfer.to);
				}
				chat.ready();
			});
		},
		open: function() {
			chat.show();
		},
		close: function() {
			chat.close();
		}
	};

}(window, undefined));
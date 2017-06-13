(function (_const, utils, uikit, apiHelper, eventCollector, chat, channel, profile, window) {
	'use strict';

	var config;

	if (utils.isTop){
		h5_mode_init();
	}
	else {
		chat_window_mode_init();
	}

	function h5_mode_init(){
		config = {};
		config.tenantId = utils.query('tenantId');
		config.configId = utils.query('configId');
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
		config.ticket = utils.query('ticket') === '' ? true : utils.convertFalse(utils.query('ticket')); //true default
		config.emgroup = decodeURIComponent(utils.query('emgroup'));

		config.user = {};
		var usernameFromUrl = utils.query('user');
		var usernameFromCookie = utils.get('root' + config.tenantId + config.emgroup);

		if (usernameFromUrl) {
			config.user.username = usernameFromUrl;
		}
		else if (usernameFromCookie) {
			config.user.username = usernameFromCookie;
			config.isUsernameFromCookie = true;
		}
		else {}

		profile.config = config;
		// fake transfer
		window.transfer = {
			send: function(){}
		};
		initCrossOriginIframe();
	}

	function chat_window_mode_init(){
		utils.removeClass(document.getElementById('em-widgetPopBar'), 'hide');
		window.transfer = new easemobim.Transfer(null, 'main', true).listen(function (msg){
			var event = msg.event;
			var data = msg.data;

			switch (event) {
			case _const.EVENTS.SHOW:
				if (eventCollector.isStarted()) {
					// 停止上报访客
					eventCollector.stopReporting();
					initChatEntry();
					chat.show();
				}
				else {
					chat.show();
				}
				break;
			case _const.EVENTS.CLOSE:
				chat.close();
				break;
			case _const.EVENTS.EXT:
				channel.sendText('', data.ext);
				break;
			case _const.EVENTS.TEXTMSG:
				channel.sendText(data.data, data.ext);
				break;
			case _const.EVENTS.UPDATE_URL:
				profile.currentBrowsingURL = data;
				break;
			case _const.EVENTS.INIT_CONFIG:
				window.transfer.to = data.parentId;
				config = data;
				profile.config = config;
				initCrossOriginIframe();
				break;
			default:
				break;
			}
		}, ['easemob']);
	}

	function initChat() {
		apiHelper.init(config);

		// 访客回呼功能
		if (config.eventCollector && !eventCollector.isStarted()) {
			eventCollector.startToReport(config, function (targetUserInfo) {
				initChatEntry(targetUserInfo);
			});
			// 增加访客主动联系客服逻辑
			utils.one(easemobim.imBtn, 'click', function () {
				initChatEntry();
				chat.show();
			});
		}
		else {
			// 获取关联，创建访客，调用聊天窗口
			initChatEntry();
		}


		apiHelper.getTheme().then(function(themeName){
			var className = _const.themeMap[themeName];
			className && utils.addClass(document.body, className);
		});

	}
	function handleMsgData() {
		// offDutyWord default value
		config.offDutyWord = config.offDutyWord || '现在是下班时间。';

		// fake patch: 老版本配置的字符串需要decode
		if (config.offDutyWord){
			try {
				config.offDutyWord = decodeURIComponent(config.offDutyWord);
			}
			catch (e){}
		}

		if (config.emgroup){
			try {
				config.emgroup = decodeURIComponent(config.emgroup);
			}
			catch (e){}
		}

		config.user = config.user || {};
		config.visitor = config.visitor || {};

		config.channel = {};
		config.ui = {
	 		H5Title :{}
		};
		config.toolbar = {};
		config.chat = {};

		profile.defaultAvatar = (config.staticPath || 'static') + '/img/default_avatar.png';

		// 用于预览模式
		if (config.previewObj) {
			handleConfig(config.previewObj);
			initChat();
		}
		else if (config.configId) {
			apiHelper.getConfig(config.configId).then(function(configJson){
				handleConfig(configJson);
				initChat();
			});
		}
		else{
			initChat();
		}
	}
	function handleConfig(configJson) {
		// todo: 把配置转换为新的
		// 用于config标记是否是来自于坐席端网页配置
		config.isWebChannelConfig = true;

		config.channel = configJson.channel;
		config.ui = configJson.ui;
		config.toolbar = configJson.toolbar;
		config.chat = configJson.chat;

		config.appKey = configJson.channel.appKey;
		config.to = configJson.channel.to;
		config.agentName = configJson.channel.agentName;
		config.emgroup = configJson.channel.emgroup;

		config.buttonText = configJson.ui.buttonText;
		config.dialogHeight = configJson.ui.dialogHeight;
		config.dialogWidth = configJson.ui.dialogWidth;
		config.dialogPosition = configJson.ui.dialogPosition;
		config.dragenable = configJson.ui.dragenable;
		config.hide = configJson.ui.hide;
		config.logo = configJson.ui.logo;
		config.notice = configJson.ui.notice;
		config.themeName = configJson.ui.themeName;

		config.autoConnect = configJson.toolbar.autoConnect;
		config.hideKeyboard = configJson.toolbar.hideKeyboard;
		config.minimum = configJson.toolbar.minimum;
		config.offDutyWord = configJson.toolbar.offDutyWord;
		config.offDutyType = configJson.toolbar.offDutyType;
		config.popupOnInitialized = configJson.toolbar.popupOnInitialized;
		config.satisfaction = configJson.toolbar.satisfaction;
		config.soundReminder = configJson.toolbar.soundReminder;
		config.ticket = configJson.toolbar.ticket;

		config.resources = configJson.chat.resources;
		config.hideStatus = configJson.chat.hideStatus;


		// 重新去设置iframe 的宽高
		transfer.send({
			event: _const.EVENTS.RESET_IFRAME,
			data: {
				dialogHeight: config.dialogHeight,
				dialogWidth: config.dialogWidth,
				dialogPosition: config.dialogPosition
			}
		});
	}

	function initCrossOriginIframe() {
		var iframe = document.getElementById('cross-origin-iframe');

		iframe.src = config.domain + '/webim/transfer.html?v=<%=WEBIM_PLUGIN_VERSION%>';
		utils.on(iframe, 'load', function () {
			apiHelper.initApiTransfer();
			handleMsgData();
		});
	}


	function initChatEntry(targetUserInfo) {
		//获取关联信息
		apiHelper.getRelevanceList().then(function (relevanceList){
			var targetItem;
			var appKey = config.appKey;
			var splited = appKey.split('#');
			var orgName = splited[0];
			var appName = splited[1];
			var toUser = config.toUser || config.to;

			// toUser 转为字符串， todo: move it to handle config
			'number' === typeof toUser && (toUser = toUser.toString(10));

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
			// todo: rename to tenantName
			profile.tenantAvatar = utils.getAvatarsFullPath(targetItem.tenantAvatar, config.domain);
			profile.defaultAgentName = targetItem.tenantName;
			config.logo = config.logo || {enabled: !!targetItem.tenantLogo,url: targetItem.tenantLogo};
			config.toUser = targetItem.imServiceNumber;
			config.orgName = targetItem.orgName;
			config.appName = targetItem.appName;
			config.channelId = targetItem.channelId;

			config.appKey = config.orgName + '#' + config.appName;
			config.restServer = config.restServer || targetItem.restDomain;
			config.xmppServer = config.xmppServer || targetItem.xmppServer;

			if (targetUserInfo) {

				// 访客回呼模式使用后端返回的关联信息
				config.toUser = targetUserInfo.agentImName;
				config.appName = targetUserInfo.appName;
				config.orgName = targetUserInfo.orgName;
				config.appKey = targetUserInfo.orgName + '#' + targetUserInfo.appName;

				// 游客
				if (targetUserInfo.userName) {
					config.user = {
						username: targetUserInfo.userName,
						password: targetUserInfo.userPassword
					};

					// 发送空的ext消息，延迟发送
					profile.commandMessageToBeSendList.push({ ext: { weichat: { agentUsername: targetUserInfo.agentUserName } } });
					chat.init();
					chat.show();
					transfer.send({ event: _const.EVENTS.SHOW });
					transfer.send({
						event: _const.EVENTS.CACHEUSER,
						data: {
							username: targetUserInfo.userName,
							// todo: check if need emgroup
							group: config.user.emgroup
						}
					});
				}
				// 访客
				else {
					apiHelper.getPassword().then(function(password){
						config.user.password = password;

						// 发送空的ext消息，延迟发送
						profile.commandMessageToBeSendList.push({ ext: { weichat: { agentUsername: targetUserInfo.agentUserName } } });
						chat.init();
						chat.show();
						transfer.send({ event: _const.EVENTS.SHOW });
					}, function(err){
						console.error('用户不存在！');
						throw err;
					});
				}
			}
			else if (config.user.username && (config.user.password || config.user.token)) {
				chat.init();
			}
			//检测微信网页授权
			else if (config.wechatAuth) {
				app.wechat(function (data) {
					try {
						data = JSON.parse(data);
					}
					catch (e) {
						data = null;
					}
					if (!data) { //失败自动降级，随机创建访客
						_downgrade();
					}
					else {
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
									chat.init();
								}
								else {
									_downgrade();
								}

							},
							error: function (e) {
								//失败自动降级，随机创建访客
								_downgrade();
							}
						});
					}
				});
			}
			else if (config.user.username) {
				apiHelper.getPassword().then(function(password){
					config.user.password = password;
					chat.init();
				}, function(err){
					_downgrade();
				});
			}
			else {
				_downgrade();
			}
		}, function(err){
			uikit.prompt('未创建关联');
			throw err;
		});
	}

	function _downgrade() {
		apiHelper.createVisitor().then(function(account){
			config.user.username = account.userId;
			config.user.password = account.userPassword;

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
				});
			}
			chat.init();
		});
	}

	easemobim.reCreateImUser = _.once(function (){
		apiHelper.createVisitor().then(function(account){
			config.user.username = account.userId;
			config.user.password = account.userPassword;

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
				});
			}
			chat.show();
		});
	});
}(
	easemobim._const,
	easemobim.utils,
	app.uikit,
	app.apiHelper,
	app.eventCollector,
	app.chat,
	app.channel,
	app.profile,
	window
));

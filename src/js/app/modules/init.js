'use strict';

require('es6-promise').polyfill();
require('../../common/polyfill');
require('../lib/modernizr');
require('../sdk/webim.config');
require('underscore');
require('moment');

var utils = require('../../common/utils');
var _const = require('../../common/const');
var Transfer = require('../../common/transfer');
var emajax = require('../../common/ajax');
var uikit = require('./uikit');
var apiHelper = require('./apiHelper');
var eventCollector = require('./eventCollector');
var chat = require('./chat');
var channel = require('./channel');
var profile = require('./tools/profile');
var doWechatAuth = require('./wechat');
var initQuerySkillgroup = require("./chat/initQuerySkillgroup");

var config;
var hasChatEntryInitialized;

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
	config.siteCode = utils.query('siteCode');
	config.billCode = utils.query('billCode');


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

	var usernameFromCookie = utils.get('root' + (config.configId || (config.tenantId + config.emgroup)));

	if (usernameFromUrl) {
		config.user.username = usernameFromUrl;
	}
	else if (usernameFromCookie) {
		config.user.username = usernameFromCookie;
		config.isUsernameFromCookie = true;
	}
	else {}

	profile.config = config;

	////初始化填写运单号页面  根据url中是否含有 运单号(billCode) 网点号(siteCode) 判断初始化时  是否显示运单号页面
	(config.siteCode || config.billCode) ? initQuerySkillgroup({isHide: true}) : initQuerySkillgroup();

	
	// fake transfer
	window.transfer = {
		send: function(){}
	};
	initCrossOriginIframe();
}

function chat_window_mode_init(){
	var $contactAgentBtn = document.getElementById('em-widgetPopBar');
	window.transfer = new Transfer(null, 'main', true).listen(function (msg){
		var event = msg.event;
		var data = msg.data;

		switch (event) {
		case _const.EVENTS.SHOW:
			// 在访客点击联系客服后停止上报访客
			if (eventCollector.isStarted()) {
				eventCollector.stopReporting();
				initChatEntry();
			}

			// 访客端有进行中会话，停止了轮询，此时需要走一遍之前被跳过的初始化流程
			if (eventCollector.hasProcessingSession()){
				initChatEntry();
			}

			if (eventCollector.hasCtaInvite()){
				initChatEntry();
				eventCollector.hideCtaPrompt();
			}

			// 显示聊天窗口
			chat.show();
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

	utils.removeClass($contactAgentBtn, 'hide');
	utils.on($contactAgentBtn, 'click', function (){
		transfer.send({ event: _const.EVENTS.SHOW });
	});
}

function initChat() {
	apiHelper.init(config);

	// 访客回呼功能
	if (!utils.isMobile && config.eventCollector && !eventCollector.isStarted()) {
		eventCollector.startToReport(function (targetUserInfo) {
			initChatEntry(targetUserInfo);
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
	// default value
	config.staticPath = config.staticPath || "static";
	config.offDutyWord = config.offDutyWord || '现在是下班时间。';
	config.emgroup = config.emgroup || '';
	config.tenantId += "";

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
	// zto custom: add default rest and xmpp server address
	config.restServer = config.restServer || 'a1.jx.zto.com';
	config.xmppServer = config.xmppServer || 'im-api.jx.zto.com:5280';

	profile.defaultAvatar = config.staticPath + '/img/default_avatar.png';

	// 用于预览模式
	if (config.previewObj) {
		handleConfig(config.previewObj);
		initChat();
	}
	else if (config.configId) {
		apiHelper.getConfig(config.configId).then(function(entity){
			config.tenantId = entity.tenantId + "";
			handleConfig(entity.configJson);
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
	// config.agentName = configJson.channel.agentName;
	config.emgroup = configJson.channel.emgroup;

	// config.buttonText = configJson.ui.buttonText;
	// config.dialogHeight = configJson.ui.dialogHeight;
	// config.dialogWidth = configJson.ui.dialogWidth;
	// config.dialogPosition = configJson.ui.dialogPosition;
	config.dragenable = configJson.ui.dragenable;
	config.hide = configJson.ui.hide;
	config.logo = configJson.ui.logo;
	config.notice = configJson.ui.notice;
	config.themeName = configJson.ui.themeName;

	config.autoConnect = configJson.toolbar.autoConnect;
	// config.hideKeyboard = configJson.toolbar.hideKeyboard;
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

	iframe.src = config.domain + '/webim/transfer.html?v=__WEBIM_PLUGIN_VERSION__';
	utils.on(iframe, 'load', function () {
		apiHelper.initApiTransfer();
		handleMsgData();
	});
}


function initChatEntry(targetUserInfo) {
	if (hasChatEntryInitialized) return;
	hasChatEntryInitialized = true;
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
			doWechatAuth(function (entity){
				config.user.username = entity.userId;
				config.user.password = entity.userPassword;
				chat.init();
			}, function (err){
				_downgrade();
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
		if(err.statusCode === 503){
			uikit.createDialog({
				contentDom: utils.createElementFromHTML([
					"<div class=\"wrapper\">",
					"<span class=\"icon-waiting\"></span>",
					"<p class=\"tip-word\">目前咨询人数较多，请稍候再试~~~</p>",
					"</div>"
				].join("")),
				className: "session-over-limit"
			}).show();
		}
		else{
		// chat.show()针对移动端，在pc端不是必要的逻辑
			chat.show();
			uikit.prompt(err);
			throw err;
		}
	});
}

function _downgrade() {
	apiHelper.createVisitor().then(function(entity){
		config.user.username = entity.userId;
		config.user.password = entity.userPassword;

		if (utils.isTop) {
			utils.set('root' + (config.configId || (config.tenantId + config.emgroup)), config.user.username);
		}
		else {
			var cacheKeyName = (config.configId || (config.to + config.tenantId + config.emgroup ))
			transfer.send({
				event: _const.EVENTS.CACHEUSER,
				data: {
					key: cacheKeyName,
					value: config.user.username,
				}
			});
		}
		chat.init();
	});
}

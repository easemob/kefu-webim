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

var config;
var hasChatEntryInitialized;

if (utils.isTop){
	h5_mode_init();
}
else {
	chat_window_mode_init();
}

function h5_mode_init(){
	profile.config = config = {
		hideKeyboard: utils.convertFalse(utils.query('hideKeyboard')),
		askApiServer: utils.query('askApiServer'),
		robotDemoUserId: utils.query('robotDemoUserId'),
	};
	// fake transfer
	window.transfer = {
		send: function(){}
	};
	initChat();
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
			initChat();
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

	profile.defaultAvatar = (config.staticPath || 'static') + '/img/default_avatar.png';

	chat.init();
}

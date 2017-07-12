var utils = require('../../common/utils');
var _const = require('../../common/const');
var Dict = require('./tools/Dict');
var List = require('./tools/List');
var profile = require('./tools/profile');
var eventListener = require('./tools/eventListener');
var apiHelper = require('./apiHelper');

var isNoAgentOnlineTipShowed;
var receiveMsgTimer;
// todo: use profile.token instead
var token;
var config;
var conn;


// 监听ack的timer, 每条消息启动一个
var ackTimerDict = new Dict();

// 发消息队列
var sendMsgDict = new Dict();

// 收消息队列
var receiveMsgDict = new Dict();

module.exports = {
	// todo: discard this
	init: function(){
		config = profile.config;
	},
	sendText: _sendText,
	sendMenuClick: _sendMenuClick,
	attemptToAppendOfficialAccount: _attemptToAppendOfficialAccount,
	handleMessage: _handleMessage
};

function _sendText(message) {
	var id = utils.uuid();

	apiHelper.sendTextMessage(message).then(function(resp){
		_handleRobotResponse(resp);
		_hideFailedAndLoading(id);
	}, function(err){
		_showFailed(id);
		console.error(err);
	});

	_appendMsg({
		id: id,
		type: 'txt',
		data: message,
	}, {
		isReceived: false,
		isHistory: false,
	});
}

function _sendMenuClick(message, menuId){
	var id = utils.uuid();

	apiHelper.sendMenuClick(menuId).then(function(resp){
		_handleRobotResponse(resp);
		_hideFailedAndLoading(id);
	}, function(err){
		_showFailed(id);
		console.error(err);
	});

	_appendMsg({
		id: id,
		type: 'txt',
		data: message,
	}, {
		isReceived: false,
		isHistory: false,
	});
}

function _handleRobotResponse(resp){
	var type = resp.matchType;
	var answer = resp.answer;
	var menuMessage;

	if (type === 'BEST_ANSWER'){
		_handleMessage({data: answer}, 'txt');
	}
	else if (type === 'RECOMMENDATE_QUESTIONS'){
		_handleMessage(_transferToRobotList(answer), 'robotList');
	}
	else {
		throw new Error('unexpected matchType: ' + type);
	}
}

function _transferToRobotList(answer){
	var items = _.chain(answer.ids)
		.zip(answer.questions)
		.map(function (elem){
			return {
				id: elem[0],
				name: elem[1],
			};
		})
		.value();

	return {
		ext: {
			msgtype: {
				choice: {
					title: answer.desc,
					items: items,
				}
			}
		}
	};
}

function _handleMessage(msg, msgType, isHistory) {
	var message;
	var inviteId;
	var serviceSessionId;
	var type = msgType || (msg && msg.type);
	var eventName = utils.getDataByPath(msg, 'ext.weichat.event.eventName');
	var eventObj = utils.getDataByPath(msg, 'ext.weichat.event.eventObj');
	var msgId = utils.getDataByPath(msg, 'ext.weichat.msgId');

	// from 不存在默认认为是收到的消息
	var isReceived = !msg.from || (msg.from.toLowerCase() !== config.user.username.toLowerCase());
	var officialAccount = utils.getDataByPath(msg, 'ext.weichat.official_account');
	var marketingTaskId = utils.getDataByPath(msg, 'ext.weichat.marketing.marketing_task_id');
	var officialAccountId = officialAccount && officialAccount.official_account_id;
	var targetOfficialAccount;

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
	targetOfficialAccount = _getOfficialAccountById(officialAccountId);

	switch (type) {
	case 'txt':
		message = msg;
		message.type = type;
		message.brief = message.data.replace(/\n/mg, ' ');
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
			}).join('') || ''
			+ '</div>';
		message.data = msg.ext.msgtype.choice.title;
		message.brief = '[菜单]';
		break;
	default:
		console.error('unexpected msg type');
		break;
	}

	// 空文本消息不显示
	if (!message || (type === 'txt' && !message.data) || (type === 'article' && _.isEmpty(utils.getDataByPath(msg, 'ext.msgtype.articles'))) ) return;

	// 	给收到的消息加id，用于撤回消息
	message.id = msgId;

	// 消息上屏
	_appendMsg(message, {
		isReceived: isReceived,
		isHistory: isHistory,
		officialAccount: targetOfficialAccount,
		timestamp: msg.timestamp
	});

	if (!isHistory) {
		if (!msg.noprompt) {
			_messagePrompt(message, targetOfficialAccount);
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

function _showFailed(msgId) {
	utils.addClass(document.getElementById(msgId + '_loading'), 'hide');
	utils.removeClass(document.getElementById(msgId + '_failed'), 'hide');
}

function _hideFailedAndLoading(msgId){
	utils.addClass(document.getElementById(msgId + '_loading'), 'hide');
	utils.addClass(document.getElementById(msgId + '_failed'), 'hide');
}


function _getOfficialAccountById(id){
	// 默认返回系统服务号
	if (!id) return profile.systemOfficialAccount;

	return _.findWhere(profile.officialAccountList, {official_account_id: id});
}

function _appendMsg(msg, options) {
	var opt = options || {};
	var isReceived = opt.isReceived;
	var isHistory = opt.isHistory;
	var officialAccount = opt.officialAccount || profile.currentOfficialAccount || profile.systemOfficialAccount;

	officialAccount.messageView.appendMsg(msg, opt);

	if (isReceived && !isHistory && !msg.noprompt){
		eventListener.excuteCallbacks(
			_const.SYSTEM_EVENT.MESSAGE_APPENDED,
			[officialAccount, msg]
		);
	}
}

function _attemptToAppendOfficialAccount(officialAccountInfo){
	var id = officialAccountInfo.official_account_id;
	var targetOfficialAccount = _.findWhere(profile.officialAccountList, {official_account_id: id});

	// 如果相应messageView已存在，则不处理
	if (targetOfficialAccount) return;

	var type = officialAccountInfo.type;
	var img = officialAccountInfo.img;
	var name = officialAccountInfo.name;
	// copy object
	var officialAccount = {
		official_account_id: id,
		type: type,
		img: img,
		'name': name
	};

	if (type === 'SYSTEM'){
		if (_.isEmpty(profile.systemOfficialAccount)){
			profile.systemOfficialAccount = officialAccount;
			profile.officialAccountList.push(officialAccount);
			officialAccount.unopenedMarketingTaskIdList = new List();
			officialAccount.unrepliedMarketingTaskIdList = new List();
			officialAccount.unreadMessageIdList = new List();
			eventListener.excuteCallbacks(
				_const.SYSTEM_EVENT.NEW_OFFICIAL_ACCOUNT_FOUND,
				[officialAccount]
			);
		}
		else if (profile.systemOfficialAccount.official_account_id !== id){
		 	// 如果id不为null则更新 systemOfficialAccount
		 	profile.systemOfficialAccount.official_account_id = id;
			profile.systemOfficialAccount.img = img;
			profile.systemOfficialAccount.name = name;
			eventListener.excuteCallbacks(_const.SYSTEM_EVENT.SYSTEM_OFFICIAL_ACCOUNT_UPDATED, []);
		 }
	}
	else if (type === 'CUSTOM'){
		profile.ctaEnable = true;
		profile.officialAccountList.push(officialAccount);
		officialAccount.unopenedMarketingTaskIdList = new List();
		officialAccount.unrepliedMarketingTaskIdList = new List();
		officialAccount.unreadMessageIdList = new List();
		eventListener.excuteCallbacks(
			_const.SYSTEM_EVENT.NEW_OFFICIAL_ACCOUNT_FOUND,
			[officialAccount]
		);
	}
	else {
		throw 'unexpected official_account type.';
	}
}

//消息发送成功，清除timer
function _clearTS(id) {
	clearTimeout(ackTimerDict.get(id));
	ackTimerDict.remove(id);

	_hideFailedAndLoading(id);
	sendMsgDict.remove(id);
}

function _messagePrompt(message, officialAccount){
	var officialAccountType = officialAccount.type;
	var brief = message.brief;
	var avatar = officialAccountType === 'CUSTOM'
		? officialAccount.img
		: profile.systemAgentAvatar || profile.tenantAvatar || profile.defaultAvatar;

	if (utils.isBrowserMinimized() || !profile.isChatWindowOpen) {
		eventListener.excuteCallbacks(_const.SYSTEM_EVENT.MESSAGE_PROMPT, []);

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


var utils = require("../../common/utils");
var _const = require("../../common/const");
var List = require("./tools/List");
var profile = require("./tools/profile");
var eventListener = require("./tools/eventListener");
var textParser = require("./tools/textParser");
var messageBuilder = require("../sdk/messageBuilder");
var cache = require("src/js/app/sdk/cache");

var config;

module.exports = {
	// todo: discard this
	init: function(){
		config = profile.config;
		eventListener.add([
			_const.SYSTEM_EVENT.MESSAGE_SENT,
			_const.SYSTEM_EVENT.MESSAGE_RECEIVED,
			_const.SYSTEM_EVENT.HISTORY_MESSAGE_GOT,
		], function(event, messageBody, options){
			handleMessage(messageBody, options);
		});
	},
	attemptToAppendOfficialAccount: _attemptToAppendOfficialAccount,

	// todo: move this to message view
	handleHistoryMsg: function(element){
		handleMessage(messageBuilder.transformFromKefu2Im(element), { isHistory: true });
	},
	handleMessage: handleMessage,
	appendEventMsg: _appendEventMsg,
};

function handleMessage(msg, options){
	var opt = options || {};
	var type = opt.type || (msg && msg.type) || null;
	var isHistory = opt.isHistory;
	var noPrompt = opt.noPrompt;
	var eventName = utils.getDataByPath(msg, "ext.weichat.event.eventName");
	var eventObj = utils.getDataByPath(msg, "ext.weichat.event.eventObj");
	var msgId = utils.getDataByPath(msg, "ext.weichat.msgId");

	var isReceived = typeof opt.isReceived === "boolean"
		? opt.isReceived
		// from 不存在默认认为是收到的消息
		: !msg.from || (msg.from.toLowerCase() !== profile.options.imUsername.toLowerCase());
	var officialAccount = utils.getDataByPath(msg, "ext.weichat.official_account");
	var marketingTaskId = utils.getDataByPath(msg, "ext.weichat.marketing.marketing_task_id");
	var officialAccountId = officialAccount && officialAccount.official_account_id;
	var videoTicket = utils.getDataByPath(msg, "ext.msgtype.sendVisitorTicket.ticket");
	var customMagicEmoji = utils.getDataByPath(msg, "ext.msgtype.customMagicEmoji");
	var action = utils.getDataByPath(msg, "action");
	var targetOfficialAccount;
	var message;
	var inviteId;
	var serviceSessionId;

	if(!msgId) throw new Error("message id not found");

	if(cache.isRendered(msgId)){
		// 重复消息不处理
		return;
	}
	// 消息加入去重列表
	cache.markAsRendered(msgId);
	// todo: evaluate this
	// // 绑定访客的情况有可能会收到多关联的消息，不是自己的不收
	// if(!isHistory && msg.from && msg.from.toLowerCase() != config.toUser.toLowerCase() && !noPrompt){
	// 	return;
	// }

	// 撤回的消息不处理
	if(utils.getDataByPath(msg, "ext.weichat.recall_flag") === 1) return;

	officialAccount && _attemptToAppendOfficialAccount(officialAccount);
	targetOfficialAccount = _getOfficialAccountById(officialAccountId);

	// 满意度评价
	if(utils.getDataByPath(msg, "ext.weichat.ctrlType") === "inviteEnquiry"){
		type = "satisfactionEvaluation";
	}
	// 机器人自定义菜单，仅收到的此类消息显示为菜单，（发出的渲染为文本消息）
	else if(
		isReceived
		&& utils.getDataByPath(msg, "ext.msgtype.choice.title")
		&& utils.getDataByPath(msg, "ext.msgtype.choice.items")
	){
		type = "robotList";
	}
	// 待接入超时转留言
	else if(
		eventName === "ServiceSessionWillScheduleTimeoutEvent"
		&& eventObj
		&& eventObj.ticketEnable === "true"
	){
		type = "transferToTicket";
	}
	else if(utils.getDataByPath(msg, "ext.msgtype.articles")){
		type = "article";
	}
	else if(utils.getDataByPath(msg, "ext.type") === "html/form"){
		type = "html-form";
	}
	// 视频ticket
	else if(videoTicket){
		type = "rtcVideoTicket";
	}
	else if(customMagicEmoji){
		type = "customMagicEmoji";
	}
	else{}

	switch(type){
	case "txt":
		message = msg;
		message.type = type;
		message.data = (msg && msg.data) || "";
		message.brief = textParser.getTextMessageBrief(message.data);
		break;
	case "img":
		message = msg;
		message.type = type;
		message.brief = __("message_brief.picture");
		break;
	case "file":
		message = msg;
		message.type = type;
		message.brief = __("message_brief.file");
		break;
	case "cmd":
		if(action === "KEFU_MESSAGE_RECALL"){
			// 撤回消息命令
			var recallMsgId = msg.ext.weichat.recall_msg_id;
			var dom = document.getElementById(recallMsgId);
			utils.addClass(dom, "hide");
		}
		break;
	case "satisfactionEvaluation":
		inviteId = msg.ext.weichat.ctrlArgs.inviteId;
		serviceSessionId = msg.ext.weichat.ctrlArgs.serviceSessionId;

		message = msg;
		message.type = "list";
		message.data = __("chat.evaluate_agent_title");
		message.list = [
			"<div class=\"em-btn-list\">"
			+ "<button class=\"bg-hover-color js_satisfybtn\" data-inviteid=\""
			+ inviteId
			+ "\" data-servicesessionid=\""
			+ serviceSessionId
			+ "\">" + __("chat.click_to_evaluate") + "</button></div>"
		];
		message.brief = __("message_brief.menu");

		!isHistory && eventListener.excuteCallbacks(
			_const.SYSTEM_EVENT.SATISFACTION_EVALUATION_MESSAGE_RECEIVED,
			[targetOfficialAccount, inviteId, serviceSessionId]
		);
		break;
	case "article":
		message = msg;
		message.type = "article";
		break;
	case "robotList":
		message = msg;
		message.type = "list";
		message.list = "<div class=\"em-btn-list\">"
			+ _.map(msg.ext.msgtype.choice.items, function(item){
				var id = item.id;
				var label = item.name;
				var className = "js_robotbtn bg-hover-color";
				if(item.id === "TransferToKf"){
					// 转人工按钮，后续可能会特殊处理
				}
				return "<button class=\"" + className + "\" data-id=\"" + id + "\">" + label + "</button>";
			}).join("") || ""
			+ "</div>";
		message.data = msg.ext.msgtype.choice.title;
		message.brief = __("message_brief.menu");
		break;
	case "skillgroupMenu":
		message = msg;
		message.type = "list";
		message.list = "<div class=\"em-btn-list\">"
			+ _.map(msg.data.children, function(item){
				var queueName = item.queueName;
				var label = item.menuName;
				var className = "js_skillgroupbtn bg-hover-color";

				return "<button class=\"" + className + "\" data-queue-name=\"" + queueName + "\">" + label + "</button>";
			}).join("") || ""
			+ "</div>";
		message.data = msg.data.menuName;
		message.brief = __("message_brief.menu");
		break;
	case "robotTransfer":
		var ctrlArgs = msg.ext.weichat.ctrlArgs;
		message = msg;
		message.type = "list";
		message.data = message.data || utils.getDataByPath(msg, "ext.weichat.ctrlArgs.label");
		/*
			msg.ext.weichat.ctrlArgs.label 未知是否有用，暂且保留
			此处修改为了修复取出历史消息时，转人工评价标题改变的bug
			还有待测试其他带有转人工的情况
		*/
		message.list = [
			"<div class=\"em-btn-list\">",
			"<button class=\"white bg-color border-color bg-hover-color-dark js_robotTransferBtn\" ",
			"data-sessionid=\"" + ctrlArgs.serviceSessionId + "\" ",
			"data-id=\"" + ctrlArgs.id + "\">" + ctrlArgs.label + "</button>",
			"</div>"
		].join("");
		message.brief = __("message_brief.menu");
		break;
	case "transferToTicket":
		message = msg;
		message.type = "list";
		message.list = [
			"<div class=\"em-btn-list\">",
			"<button class=\"white bg-color border-color bg-hover-color-dark js-transfer-to-ticket\">",
			__("chat.click_to_ticket"),
			"</button>",
			"</div>"
		].join("");
		message.brief = __("message_brief.menu");
		break;
	case "html-form":
		message = msg;
		message.type = "html-form";
		message.brief = __("message_brief.unknown");
		break;
	case "rtcVideoTicket":
		!isHistory && eventListener.excuteCallbacks(_const.SYSTEM_EVENT.VIDEO_TICKET_RECEIVED, [videoTicket]);
		break;
	case "customMagicEmoji":
		message = customMagicEmoji;
		message.type = "customMagicEmoji";
		message.brief = __("message_brief.emoji");
		break;
	default:
		console.error("unexpected msg type");
		break;
	}

	if(!isHistory){
		// 实时消息需要处理系统事件

		marketingTaskId
			&& type === "txt"
			&& eventListener.excuteCallbacks(
			_const.SYSTEM_EVENT.MARKETING_MESSAGE_RECEIVED,
			[
				targetOfficialAccount,
				marketingTaskId,
				msg
			]
		);

		if(eventName){
			_handleSystemEvent(eventName, eventObj, msg);
		}
		else{
			var agentInfo = utils.getDataByPath(msg, "ext.agent");
			if(agentInfo){
				targetOfficialAccount.agentNickname = agentInfo.userNickname;
				targetOfficialAccount.agentAvatar = agentInfo.avatar;

				eventListener.excuteCallbacks(_const.SYSTEM_EVENT.AGENT_INFO_UPDATE, [targetOfficialAccount]);
			}
		}
	}

	if(
		!message
		// 空文本消息不上屏
		|| (type === "txt" && !message.data)
		// 空文章不上屏
		|| (type === "article" && _.isEmpty(utils.getDataByPath(msg, "ext.msgtype.articles")))
		// 视频邀请不上屏
		|| (type === "rtcVideoTicket")
	) return;

	// 给收到的消息加id，用于撤回消息
	message.id = msgId;

	// 消息上屏
	_appendMsg(message, {
		isReceived: isReceived,
		isHistory: isHistory,
		officialAccount: targetOfficialAccount,
		timestamp: msg.timestamp,
		noPrompt: noPrompt,
	});

	if(!isHistory){
		!noPrompt && _messagePrompt(message, targetOfficialAccount);

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

function _handleSystemEvent(event, eventObj, msg){
	var eventMessageText = _const.SYSTEM_EVENT_MSG_TEXT[event];
	var officialAccountId = utils.getDataByPath(msg, "ext.weichat.official_account.official_account_id");
	var officialAccount = _getOfficialAccountById(officialAccountId);

	eventMessageText && _appendEventMsg(eventMessageText, msg);

	switch(event){
	case _const.SYSTEM_EVENT.SESSION_TRANSFERED:
		officialAccount.agentId = eventObj.userId;
		officialAccount.agentType = eventObj.agentType;
		officialAccount.agentAvatar = eventObj.avatar;
		officialAccount.agentNickname = eventObj.agentUserNiceName;
		officialAccount.sessionState = _const.SESSION_STATE.PROCESSING;
		officialAccount.isSessionOpen = true;
		break;
	case _const.SYSTEM_EVENT.SESSION_TRANSFERING:
		officialAccount.sessionState = _const.SESSION_STATE.WAIT;
		officialAccount.isSessionOpen = true;
		officialAccount.skillGroupId = null;
		break;
	case _const.SYSTEM_EVENT.SESSION_CLOSED:
		officialAccount.sessionState = _const.SESSION_STATE.ABORT;
		officialAccount.agentId = null;
		// 发起满意度评价需要回传sessionId，所以不能清空
		// officialAccount.sessionId = null;
		officialAccount.skillGroupId = null;
		officialAccount.isSessionOpen = false;
		officialAccount.hasReportedAttributes = false;

		transfer.send({ event: _const.EVENTS.ONSESSIONCLOSED });
		break;
	case _const.SYSTEM_EVENT.SESSION_OPENED:
		officialAccount.sessionState = _const.SESSION_STATE.PROCESSING;
		officialAccount.agentType = eventObj.agentType;
		officialAccount.agentId = eventObj.userId;
		officialAccount.sessionId = eventObj.sessionId;
		officialAccount.agentAvatar = eventObj.avatar;
		officialAccount.agentNickname = eventObj.agentUserNiceName;
		officialAccount.isSessionOpen = true;
		break;
	case _const.SYSTEM_EVENT.SESSION_CREATED:
		officialAccount.sessionState = _const.SESSION_STATE.WAIT;
		officialAccount.sessionId = eventObj.sessionId;
		officialAccount.isSessionOpen = true;
		break;
	default:
		break;
	}

	eventListener.excuteCallbacks(event, [officialAccount]);
}

// 系统事件消息上屏
function _appendEventMsg(text, msg){
	// 如果设置了hideStatus, 不显示此类提示
	if(config.hideStatus) return;

	var officialAccountId = utils.getDataByPath(msg, "ext.weichat.official_account.official_account_id");
	var targetOfficialAccount = _getOfficialAccountById(officialAccountId);

	targetOfficialAccount.messageView.appendEventMsg(text);
}

function _getOfficialAccountById(id){
	// 默认返回系统服务号
	if(!id) return profile.systemOfficialAccount;

	return _.findWhere(profile.officialAccountList, { official_account_id: id });
}

function _appendMsg(msg, options){
	var opt = options || {};
	var isReceived = opt.isReceived;
	var isHistory = opt.isHistory;
	var noPrompt = opt.noPrompt;
	var officialAccount = opt.officialAccount || profile.currentOfficialAccount || profile.systemOfficialAccount;

	officialAccount.messageView.appendMsg(msg, opt);

	if(isReceived && !isHistory && !noPrompt){
		eventListener.excuteCallbacks(
			_const.SYSTEM_EVENT.MESSAGE_APPENDED,
			[officialAccount, msg]
		);
	}
}

function _attemptToAppendOfficialAccount(officialAccountInfo){
	var id = officialAccountInfo.official_account_id;
	var targetOfficialAccount = _.findWhere(profile.officialAccountList, { official_account_id: id });

	// 如果相应messageView已存在，则不处理
	if(targetOfficialAccount) return;

	var type = officialAccountInfo.type;
	var img = officialAccountInfo.img;
	var name = officialAccountInfo.name;
	// copy object
	var officialAccount = {
		official_account_id: id,
		type: type,
		img: img,
		name: name
	};

	if(type === "SYSTEM"){
		if(_.isEmpty(profile.systemOfficialAccount)){
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
		else if(profile.systemOfficialAccount.official_account_id !== id){
			// 如果id不为null则更新 systemOfficialAccount
			profile.systemOfficialAccount.official_account_id = id;
			profile.systemOfficialAccount.img = img;
			profile.systemOfficialAccount.name = name;
			eventListener.excuteCallbacks(_const.SYSTEM_EVENT.SYSTEM_OFFICIAL_ACCOUNT_UPDATED, []);
		}
	}
	else if(type === "CUSTOM"){
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
	else{
		throw new Error("unexpected official_account type.");
	}
}

function _messagePrompt(message, officialAccount){
	var officialAccountType = officialAccount.type;
	var brief = message.brief;
	var avatar = officialAccountType === "CUSTOM"
		? officialAccount.img
		: profile.systemAgentAvatar || profile.tenantAvatar || profile.defaultAvatar;

	if(utils.isBrowserMinimized() || !profile.isChatWindowOpen){
		eventListener.excuteCallbacks(_const.SYSTEM_EVENT.MESSAGE_PROMPT, []);

		transfer.send({ event: _const.EVENTS.SLIDE });
		transfer.send({
			event: _const.EVENTS.NOTIFY,
			data: {
				avatar: avatar,
				title: __("prompt.new_message"),
				brief: brief
			}
		});
	}
}


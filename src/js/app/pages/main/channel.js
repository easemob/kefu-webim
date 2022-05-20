var WebIM = require("easemob-websdk");
var utils = require("@/common/utils");
var _const = require("@/common/const");
var Dict = require("@/app/tools/Dict");
var List = require("@/app/tools/List");
var profile = require("@/app/tools/profile");
var tools = require("@/app/tools/tools");
var eventListener = require("@/app/tools/eventListener");
var textParser = require("@/app/tools/textParser");
var apiHelper = require("./apis");
var moment = require("moment");
var commonConfig = require("@/common/config");
var getToHost = require("@/app/common/transfer");
var uikit = require("./uikit");

var isNoAgentOnlineTipShowed;
var receiveMsgTimer;
var config;
var conn;
var isSkillGroupBtnDisabled;

// 监听ack的timer, 每条消息启动一个
var ackTimerDict = new Dict();

// 发消息队列
var sendMsgDict = new Dict();

// 收消息队列
var receiveMsgDict = new Dict();

var _open = tools.retryThrottle(function(){
	var op = {
		user: config.user.username,
		appKey: config.appKey,
		apiUrl: location.protocol + "//" + config.restServer
	};

	if(profile.imToken !== null){
		op.accessToken = profile.imToken;
	}
	else{
		op.pwd = config.user.password;
	}

	conn.open(op);
}, {
	resetTime: 10 * 60 * 1000,
	waitTime: 2000,
	retryLimit: 3
});


module.exports = {
	// todo: discard this
	init: function(){
		config = commonConfig.getConfig();
		Promise.all([
			apiHelper.getDutyStatus(),
		]).then(function(result){
			isSkillGroupBtnDisabled = result[0] ? "" : "disabled"
		})
	},
	initConnection: _initConnection,
	reSend: _reSend,
	sendTransferToKf: _sendTransferToKf,
	sendText: _sendText,
	sendImg: _sendImg,
	sendFile: _sendFile,
	sendVideo: _sendVideo, // 新增小视频发送类型
	attemptToAppendOfficialAccount: _attemptToAppendOfficialAccount,

	// todo: move this to message view
	handleHistoryMsg: function(element){
		var textMessage = utils.getDataByPath(element, "body.bodies.0.msg");
		var titleMessage = utils.getDataByPath(element, "body.ext.msgtype.choice.title");
		// 后端历史消息转义2次，需要处理
		if(typeof textMessage === "string"){
			element.body.bodies[0].msg = textParser.unescape(textParser.unescape(textMessage));
		}
		if(typeof titleMessage === "string"){
			element.body.ext.msgtype.choice.title = textParser.unescape(textParser.unescape(titleMessage));
		}
		_handleMessage(_transformMessageFormat(element), { isHistory: true });
	},
	initSecondChannle: function(){
		receiveMsgTimer = clearInterval(receiveMsgTimer);
		receiveMsgTimer = setInterval(function(){
			apiHelper.receiveMsgChannel().then(function(msgList){
				_.each(msgList, function(elem){
					_handleMessage(_transformMessageFormat({ body: elem }), { isHistory: false });
				});
			});
		}, _const.SECOND_CHANNEL_MESSAGE_RECEIVE_INTERVAL);
	},
	handleMessage: _handleMessage,
	appendMsg: _appendMsg,
};

function _initConnection(onReadyCallback){
	// xmpp连接超时则改为可发送消息状态
	// todo: 自动切换通道状态
	var firstTS = setTimeout(function(){
		onReadyCallback();
	}, _const.FIRST_CHANNEL_CONNECTION_TIMEOUT);

	// init connection
	conn = new WebIM.connection({
		url: config.xmppServer,
		retry: true,
		isMultiLoginSessions: config.resources,
		heartBeatWait: _const.HEART_BEAT_INTERVAL
	});

	if(profile.imRestDown){
		onReadyCallback();
	}

	conn.listen({
		onOpened: function(info){
			// discard this
			if(info && info.accessToken && (profile.imToken === null)){
				profile.imToken = info.accessToken;
			}
			// 连接未超时，清除timer，暂不开启api通道发送消息
			clearTimeout(firstTS);

			conn.setPresence();

			onReadyCallback(info);
		},
		onTextMessage: function(message){
			_handleMessage(message, { type: "txt" });
		},
		onPictureMessage: function(message){
			_handleMessage(message, { type: "img" });
		},
		onFileMessage: function(message){
			_handleMessage(message, { type: "file" });
		},
		onVideoMessage: function(message){
			_handleMessage(message, { type: "video" });
		}, // 新增小视频类型
		onCmdMessage: function(message){
			_handleMessage(message, { type: "cmd" });
		},
		onOnline: function(){
			utils.isMobile && _open();
		},
		onOffline: function(){
			utils.isMobile && conn.close();

			eventListener.excuteCallbacks(_const.SYSTEM_EVENT.OFFLINE, []);
		},
		onError: function(e){
			if(e.reconnect){
				_open();
			}
			else if(e.type === _const.IM.WEBIM_CONNCTION_AUTH_ERROR){
				_open();
			}
			// im sdk 会捕获回调中的异常，需要把出错信息打出来
			else if(e.type === _const.IM.WEBIM_CONNCTION_CALLBACK_INNER_ERROR){
				console.error(e.data);
			}
			else{
				console.error(e);
			}
		}
	});

	// open connection
	_open();
}

function _reSend(type, id){
	if(!id) return;

	switch(type){
	case "txt":
		// 重试只发一次
		_sendMsgChannle(id, 0);
		break;
	default:
		// todo: 解决图片文件无法重发问题
		conn.send(id);
		break;
	}
}

function _sendText(message, ext){
	var id = utils.uuid();
	var msg = new WebIM.message.txt(id);
	msg.set({
		msg: message,
		to: config.toUser,
		// 此回调用于确认im server收到消息, 有别于kefu ack
		success: function(/* id */){},
		fail: function(/* id */){}
	});

	if(ext){
		_.extend(msg.body, ext);
	}
	_setExt(msg);
	_appendAck(msg, id);
	conn.send(msg.body);
	sendMsgDict.set(id, msg);
	_detectSendTextMsgByApi(id);

	_promptNoAgentOnlineIfNeeded({
		hasTransferedToKefu: !!~__("config.transfer_to_kefu_words").slice("|").indexOf(message)
	});

	_handleMessage(
		_transfromImMessage(msg),
		{ isReceived: false, isHistory: false, type: "txt" }
	);
}

// 这个临时使用，下个版本会去掉
function _transfromImMessage(msg){
	return {
		data: utils.getDataByPath(msg, "body.body.msg") || "",
		ext: utils.getDataByPath(msg, "body.ext") || "",
		type: utils.getDataByPath(msg, "body.type"),
	};
}

function _sendTransferToKf(tid, sessionId){
	var id = utils.uuid();
	var msg = new WebIM.message.cmd(id);
	msg.set({
		to: config.toUser,
		action: "TransferToKf",
		ext: {
			weichat: {
				ctrlArgs: {
					id: tid,
					serviceSessionId: sessionId
				}
			}
		}
	});
	_setExt(msg);
	_appendAck(msg, id);
	conn.send(msg.body);
	sendMsgDict.set(id, msg);
	_detectSendTextMsgByApi(id);

	_promptNoAgentOnlineIfNeeded({ hasTransferedToKefu: true });
}

function _sendImg(fileMsg){
	var id = utils.uuid();
	var msg = new WebIM.message.img(id);

	msg.set({
		apiUrl: location.protocol + "//" + config.restServer,
		file: fileMsg,
		accessToken: profile.imToken,
		to: config.toUser,
		success: function(id){
			// todo: 验证这里是否执行，验证此处id是im msg id 还是 kefu-ack-id
			_hideFailedAndLoading(id);
		},
		fail: function(id){
			_showFailed(id);
		},
	});
	_setExt(msg);
	_appendAck(msg, id);
	_appendMsg({
		id: id,
		type: "img",
		url: fileMsg.url
	}, {
		isReceived: false,
		isHistory: false,
	});
	conn.send(msg.body);
	sendMsgDict.set(id, msg);
	_detectUploadImgMsgByApi(id, fileMsg.data);

	// 自己发出去的图片要缓存File对象，用于全屏显示图片
	profile.imgFileList.set(fileMsg.url, fileMsg.data);
	eventListener.excuteCallbacks(_const.SYSTEM_EVENT.MESSAGE_SENT, []);
}

function _sendFile(fileMsg){
	var id = utils.uuid();
	var msg = new WebIM.message.file(id);

	msg.set({
		apiUrl: location.protocol + "//" + config.restServer,
		file: fileMsg,
		to: config.toUser,
		success: function(id){
			// todo: 验证这里是否执行，验证此处id是im msg id 还是 kefu-ack-id
			_hideFailedAndLoading(id);
		},
		fail: function(id){
			_showFailed(id);
		},
	});
	_setExt(msg);
	_appendMsg({
		id: id,
		type: "file",
		url: fileMsg.url,
		filename: fileMsg.filename,
		fileLength: fileMsg.data.size,
	}, {
		isReceived: false,
		isHistory: false,
	});
	conn.send(msg.body);
	eventListener.excuteCallbacks(_const.SYSTEM_EVENT.MESSAGE_SENT, []);
}

// 小视频发送
function _sendVideo(fileMsg){
	var id = utils.uuid();
	var msg = new Message.video(id); //   new Message.video => 339行  message 格式的转换

	msg.set({
		apiUrl: location.protocol + "//" + config.restServer,
		file: fileMsg,
		to: config.toUser,
		success: function(id){
			// todo: 验证这里是否执行，验证此处id是im msg id 还是 kefu-ack-id
			_hideFailedAndLoading(id);
		},
		fail: function(id){
			_showFailed(id);
		},
	});
	_setExt(msg);
	_appendMsg({
		id: id,
		type: "video",
		url: fileMsg.url,
		filename: fileMsg.filename,
		fileLength: fileMsg.data.size,
	}, {
		isReceived: false,
		isHistory: false,
	});
	conn.send(msg.body);
	eventListener.excuteCallbacks(_const.SYSTEM_EVENT.MESSAGE_SENT, []);
}

// 新增 视频格式发送
var Message = function(type, id){
	if(!(this instanceof Message)){
		return new Message(type);
	}

	this._msg = {};

	if(typeof Message[type] === "function"){
		Message[type].prototype.setGroup = this.setGroup;
		this._msg = new Message[type](id);
	}
	return this._msg;
};

Message.video = function(id){
	this.id = id;
	this.type = "video";
	this.body = {};
};
Message.video.prototype.set = function(opt){
	opt.file = opt.file;

	this.value = opt.file;
	this.filename = opt.filename || this.value.filename;

	this.body = {
		id: this.id
		, file: this.value
		, filename: this.filename
		, apiUrl: opt.apiUrl
		, to: opt.to
		, type: this.type
		, ext: opt.ext || {}
		, roomType: opt.roomType
		, onFileUploadError: opt.onFileUploadError
		, onFileUploadComplete: opt.onFileUploadComplete
		, success: opt.success
		, fail: opt.fail
		, flashUpload: opt.flashUpload
		, body: opt.body
	};
	!opt.roomType && delete this.body.roomType;
};


function _handleMessage(msg, options){
	// console.log('_handleMessage 消息列表：', msg)
	var opt = options || {};
	var type = opt.type || (msg && msg.type);
	var noPrompt = opt.noPrompt;
	var isHistory = opt.isHistory;
	var eventName = utils.getDataByPath(msg, "ext.weichat.event.eventName");
	var eventObj = utils.getDataByPath(msg, "ext.weichat.event.eventObj");
	var laiye = opt.laiye || utils.getDataByPath(msg, "ext.weichat.extRobot.laiye");
	var msgId = utils.getDataByPath(msg, "ext.weichat.msgId")
		// 这是自己发出去的消息的 msgId，此为临时修改，在完成 messageBuilder 之后应该就可以去掉了
		|| utils.getDataByPath(msg, "ext.weichat.msg_id_for_ack");
	var isReceived = typeof opt.isReceived === "boolean"
		? opt.isReceived
		// from 不存在默认认为是收到的消息
		: (!msg.from || (msg.from.toLowerCase() !== config.user.username.toLowerCase()));
	var officialAccount = utils.getDataByPath(msg, "ext.weichat.official_account");
	var marketingTaskId = utils.getDataByPath(msg, "ext.weichat.marketing.marketing_task_id");
	var satisfactionCommentInvitation = utils.getDataByPath(msg, "ext.weichat.extRobot.satisfactionCommentInvitation");
	var satisfactionCommentInfo = utils.getDataByPath(msg, "ext.weichat.extRobot.satisfactionCommentInfo");
	var origintype = utils.getDataByPath(msg, "ext.weichat.originType");
	var agentId = utils.getDataByPath(msg, "ext.weichat.agent.userId");
	var officialAccountId = officialAccount && officialAccount.official_account_id;
	var videoTicket = utils.getDataByPath(msg, "ext.msgtype.sendVisitorTicket.ticket");
	var videoExtend = utils.getDataByPath(msg, "ext.msgtype.sendVisitorTicket.extend");
	var customMagicEmoji = utils.getDataByPath(msg, "ext.msgtype.customMagicEmoji");
	var targetOfficialAccount;
	var message;
	var inviteId;
	var serviceSessionId;
	var extMsg
	var redirectUrl

	// 重复消息不处理
	if(receiveMsgDict.get(msgId)){
		return;
	}
	// 消息加入去重列表
	else if(msgId){
		receiveMsgDict.set(msgId, msg);
	}
	// 没有 msgId 忽略，继续处理（KEFU-ACK 消息没有 msgId）
	else{
	}
	// 绑定访客的情况有可能会收到多关联的消息，不是自己的不收
	if(!isHistory && msg.from && msg.from.toLowerCase() != config.toUser.toLowerCase() && !noPrompt){
		return;
	}
	// 撤回的消息不处理
	if(utils.getDataByPath(msg, "ext.weichat.recall_flag") === 1){
		return;
	}
	// 尝试
	if(officialAccount){
		_attemptToAppendOfficialAccount(officialAccount);
	}
	targetOfficialAccount = _getOfficialAccountById(officialAccountId);


	// ===========
	// 消息类型判断
	// ===========
	// 满意度评价
	if(utils.getDataByPath(msg, "ext.weichat.ctrlType") === "inviteEnquiry"){
		type = "satisfactionEvaluation";
	}
	// 机器人自定义菜单
	// 需要判断：收到的 choice 显示为菜单，发出的 choice 渲染为文本消息
	else if(
		isReceived
		// && utils.getDataByPath(msg, "ext.msgtype.choice.title")
		&& utils.getDataByPath(msg, "ext.msgtype.choice.items")
		&& !utils.getDataByPath(msg, "ext.msgtype.choice.mode")
	){
		type = "robotList";
		msg.ext.msgtype.choice.title = msg.ext.msgtype.choice.title|| ""
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
	// track 消息在访客端不与处理
	else if(utils.getDataByPath(msg, "ext.msgtype.track")){
		type = "track";
	}
	// order 消息在访客端不与处理
	else if(utils.getDataByPath(msg, "ext.msgtype.order")){
		type = "order";
	}
	else if(utils.getDataByPath(msg, "ext.type") === "html/form"){
		type = "html-form";
	}
	// 视频 ticket
	else if(videoTicket){
		type = "rtcVideoTicket";
	}
	else if(customMagicEmoji){
		type = "customMagicEmoji";
	}
	else if(
		isReceived
		&& utils.getDataByPath(msg, "ext.msgtype.choice.mode") == "transferManualGuide"
	){
		type = "transferManualGuide";
	}
	else{

	}


	// ===========
	// 消息结构构造
	// ===========
	switch(type){
	case "txt":
		message = msg;
		message.type = type;
		message.data = (msg && msg.data) || "";
		message.brief = textParser.getTextMessageBrief(message.data);
		extMsg = utils.getDataByPath(msg, "ext.msgtype");
		redirectUrl = utils.getDataByPath(msg, "ext.msgtype.redirectUrl");
		if(redirectUrl){
			// var detail = utils.getDataByPath(msg, "ext.entity");
			console.log(detail,33333)
			if(extMsg){
				_appendMsg({
					data:[
						'<div >',
							'<div data-redirecturl="' + extMsg.redirectUrl + '" class="js_productdetail"  className="body" style="cursor:pointer;display:flex;justify-content: space-between;border-bottom: 1px solid hsl(223deg 37% 93%);padding-bottom: 3px;">',
								'<div style=";line-height:50px;width: 100px;	overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">' + extMsg.productName + '</div>',
								'<img style="width:50px;height="50px" src="' + (extMsg.imageUrl || 'static/img/default_avatar.png') + '" />',
							'</div>',
							'<div data-redirecturl="' + extMsg.redirectUrl + '" class="js_productdetail"  className="footer" style="font-size:14px">大都会推荐</div>',
						'</div>'
					].join(""),
					type: "txtLink",
				}, {
					isReceived: true,
					isHistory: false
				});
			}
			return
		}
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
	case "video":
		message = msg;
		message.type = type;
		message.brief = __("message_brief.video");	// 页面接收提示视频
		break;
	case "article":
	case "track":
	case "order":
		message = msg;
		message.type = type;
		break;
	case "customMagicEmoji":
		message = customMagicEmoji;
		message.type = type;
		message.brief = __("message_brief.emoji");
		break;
	case "html-form":
		message = msg;
		message.type = type;
		message.brief = __("message_brief.unknown");
		break;





	case "cmd":
		var action = msg.action;
		if(action === "KF-ACK"){
			// 清除 ack 对应的 site item
			_clearTS(msg.ext.weichat.ack_for_msg_id);
			return;
		}
		else if(action === "KEFU_MESSAGE_RECALL"){
			// 撤回消息命令
			var recallMsgId = msg.ext.weichat.recall_msg_id;
			var dom = document.getElementById(recallMsgId);
			utils.addClass(dom, "hide");

		}else if(action === "product_detail"){
			// var detail = utils.getDataByPath(msg, "ext.entity");
			// console.log(detail,33333)
			// if(detail){
			// 	_appendMsg({
			// 		data:[
			// 			'<div >',
			// 				'<div data-redirecturl="' + detail.redirectUrl + '" class="js_productdetail"  className="body" style="cursor:pointer;display:flex;justify-content: space-between;border-bottom: 1px solid hsl(223deg 37% 93%);padding-bottom: 3px;">',
			// 					'<div style=";line-height:50px;width: 100px;	overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">' + detail.productName + '</div>',
			// 					'<img style="width:50px;height="50px" src="' + (detail.imageUrl || 'static/img/default_avatar.png') + '" />',
			// 				'</div>',
			// 				'<div data-redirecturl="' + detail.redirectUrl + '" class="js_productdetail"  className="footer" style="font-size:14px">大都会推荐</div>',
			// 			'</div>'
			// 		].join(""),
			// 		type: "txtLink",
			// 	}, {
			// 		isReceived: true,
			// 		isHistory: false
			// 	});
			// }
		}else if(action === "authlink"){
			var detail = utils.getDataByPath(msg, "ext.entity");
			console.log(detail,4444)
			if(detail){
				_appendMsg({
					data:[
						
						'<div data-redirecturl="' + detail.redirectUrl + '" class="js_authllink" >',
							'<div className="footer" style="cursor:pointer;font-size:14px;color:#00b6fb"><span style="color:#00b6fb">认证链接：</span>' + detail.redirectUrl + '</div>',
						'</div>'
					].join(""),
					type: "txtLink",
				}, {
					isReceived: true,
					isHistory: false
				});
			}
		}
		break;
	case "rtcVideoTicket":
		!isHistory && eventListener.excuteCallbacks(_const.SYSTEM_EVENT.VIDEO_TICKET_RECEIVED, [videoTicket, videoExtend]);
		break;





	case "satisfactionEvaluation":
		inviteId = msg.ext.weichat.ctrlArgs.inviteId;
		serviceSessionId = msg.ext.weichat.ctrlArgs.serviceSessionId;
		message = msg;
		message.type = "list";
		message.subtype = type;
		message.data = __("chat.evaluate_agent_title");
		// console.log('444 msg', msg)
		// console.log('555 msgId', msgId)
		// 官微租户的 禁用【立即评价】按钮
		var isEnquiry = utils.getDataByPath(msg, "guanweiMsgBody.isEnquiry");
		// console.log(666, isEnquiry)
		if (_const.isGuanwei == 'Y') {
			if (isEnquiry == 'yes') {
				var style= "background-color: #ccc; cursor:not-allowed;"
				// 禁用
				message.list = [
					"<div class=\"em-btn-list\">"
					+ "<button disabled style=\"" + style + "\" class=\"js_satisfybtn\" data-inviteid=\""
					+ inviteId
					+ "\" data-servicesessionid=\""
					+ serviceSessionId
					+ "\" data-messageid=\""
					+ msgId
					+ "\">" + __("chat.click_to_evaluate") + "</button></div>"
				];
			} else {
				message.list = [
					"<div class=\"em-btn-list\">"
					+ "<button class=\"bg-hover-color js_satisfybtn\" data-inviteid=\""
					+ inviteId
					+ "\" data-servicesessionid=\""
					+ serviceSessionId
					+ "\" data-messageid=\""
					+ msgId
					+ "\">" + __("chat.click_to_evaluate") + "</button></div>"
				];
			}
		} else {
			message.list = [
				"<div class=\"em-btn-list\">"
				+ "<button class=\"bg-hover-color js_satisfybtn\" data-inviteid=\""
				+ inviteId
				+ "\" data-servicesessionid=\""
				+ serviceSessionId
				+ "\">" + __("chat.click_to_evaluate") + "</button></div>"
			];
		}
		message.brief = __("message_brief.menu");
		!isHistory && config.ui.enquiryShowMode === "popup" && eventListener.excuteCallbacks(
			_const.SYSTEM_EVENT.SATISFACTION_EVALUATION_MESSAGE_RECEIVED,
			[targetOfficialAccount, inviteId, serviceSessionId, msgId]
		);
		break;
	case "robotDirectionlist":
		console.log('')
		// 如果取不到，就默认 true 打开菜单
		// 这个 service_session 对象，对于欢迎语类的消息，是没有的
		// serviceSessionId = utils.getDataByPath(msg, "ext.weichat.service_session.serviceSessionId");
		message = msg.data;
		message.type = "list";
		message.subtype = "robotDirectionList";
		// message.subtype = robotList;
		message.list = "<div class=\"em-btn-list\">"
			+ (_.map(msg.data.items, function(item){
				// var id = item.id;
				// var label = item.name;
				// var className = "js_robotbtn ";
				// // 为以后转人工按钮样式调整做准备
				// if(item.id === "TransferToKf"){
				// 	className += "bg-hover-color";
				// }
				// else{
				// 	className += "bg-hover-color";
				// }
				return "<button "
				+ "class=\"js_robotdirection bg-hover-color \""
				// + "data-id=\"" + item.id + "\" "
				+ ">" + item + "</button>";
			}).join("") || "")
			+ "</div>"
			+"<p>"+msg.data.prompt+"</p>";
		message.data = msg.data.title;
		message.brief = __("message_brief.menu");
		break
	case "robotList":
		// 如果取不到，就默认 true 打开菜单
		// 这个 service_session 对象，对于欢迎语类的消息，是没有的
		serviceSessionId = utils.getDataByPath(msg, "ext.weichat.service_session.serviceSessionId");
		message = msg;
		message.type = "list";
		message.subtype = type;
		message.list = "<div class=\"em-btn-list\">"
			+ _.map(msg.ext.msgtype.choice.items, function(item){
				// var id = item.id;
				// var label = item.name;
				// var className = "js_robotbtn ";
				// // 为以后转人工按钮样式调整做准备
				// if(item.id === "TransferToKf"){
				// 	className += "bg-hover-color";
				// }
				// else{
				// 	className += "bg-hover-color";
				// }
				return "<button "
				+ "class=\"js_robotbtn bg-hover-color " + (profile.shouldMsgActivated(serviceSessionId) ? "" : "disabled") + "\" "
				+ "data-id=\"" + item.id + "\" "
				+ ">" + item.name + "</button>";
			}).join("") || ""
			+ "</div>";
		message.data = msg.ext.msgtype.choice.title;
		message.brief = __("message_brief.menu");
		break;
	case "transferManualGuide":
		serviceSessionId = utils.getDataByPath(msg, "ext.weichat.service_session.serviceSessionId");
		message = msg;
		message.type = "list";
		message.subtype = type;
		message.list = "<div class=\"em-btn-list\">"
			+ _.map(msg.ext.msgtype.choice.items, function(item){
				if(item.queueType == "video"){
					if(
						window.location.protocol !== "https:"
						|| !Modernizr.peerconnection
						|| !profile.grayList.audioVideo
					){
						return "";
					}
				}
				if(item.id == "hasTransferNote"){
					item.queueType = "transfer";
				}

				return "<button "
				+ "class=\"js_transferManualbtn bg-hover-color " + (profile.shouldMsgActivated(serviceSessionId) ? "" : "disabled") + "\" "
				+ "data-id=\"" + item.id + "\" "
				+ "data-queue-id=\"" + item.queueId + "\" "
				+ "data-queue-type=\"" + item.queueType + "\" "
				+ ">" + item.name + "</button>";
			}).join("") || ""
			+ "</div>";
		message.data = msg.ext.msgtype.choice.title;
		message.brief = __("message_brief.menu");
		break;
	case "skillgroupMenu":
		message = msg;
		message.type = "list";
		message.subtype = type;
		message.list = "<div class=\"em-btn-list\">"
			+ _.map(msg.data.children, function(item){
				var queueName = item.queueName;
				var label = item.menuName;
				var className = "js_skillgroupbtn bg-hover-color";
				return "<button "+ isSkillGroupBtnDisabled +" class=\"" + className + "\" data-queue-name=\"" + queueName + "\">" + label + "</button>";
			}).join("") || ""
			+ "</div>";
		message.data = msg.data.menuName;
		message.brief = __("message_brief.menu");
		break;
	// 入口指定
	case "transferManualMenu":
		message = msg;
		message.type = "list";
		message.subtype = type;
		var array = msg.data.children;
		if(msg.data.hasTransferNote){
			var transferChild = {
				queueName: "hasTransferNote",
				itemName: "转留言",
				queueType: "transfer"
			};
			array.push(transferChild);
		}
		// 判断没有视频功能时，隐藏type为video的item

		message.list = "<div class=\"em-btn-list\">"
			+ _.map(array, function(item){
				var queueName = item.queueName;
				var label = item.itemName;
				var queueType = item.queueType;
				var className = "js_transferManualEntrybtn bg-hover-color";
				if(item.queueType == "video"){
					if(
						window.location.protocol !== "https:"
						|| !Modernizr.peerconnection
						|| !profile.grayList.audioVideo
					){
						return "";
					}
				}

				return "<button class=\"" + className + "\" data-queue-name=\"" + queueName + "\" data-queue-type=\"" + queueType + "\">" + label + "</button>";
			}).join("") || ""
			+ "</div>";
		message.data = msg.data.itemName;
		message.brief = __("message_brief.menu");
		break;
	case "robotTransfer":
		var ctrlArgs = msg.ext.weichat.ctrlArgs;
		message = msg;
		message.type = "list";
		message.subtype = type;
		message.data = message.data || utils.getDataByPath(msg, "ext.weichat.ctrlArgs.label");
		// msg.ext.weichat.ctrlArgs.label 未知是否有用，暂且保留
		// 此处修改为了修复取出历史消息时，转人工评价标题改变的 bug
		// 还有待测试其他带有转人工的情况
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
		message.subtype = type;
		message.list = [
			"<div class=\"em-btn-list\">",
			"<button class=\"white bg-color border-color bg-hover-color-dark js-transfer-to-ticket\">",
			__("chat.click_to_ticket"),
			"</button>",
			"</div>"
		].join("");
		message.brief = __("message_brief.menu");
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
			var agentInfo = utils.getDataByPath(msg, "ext.weichat.agent");
			if(agentInfo){
				targetOfficialAccount.agentNickname = agentInfo.userNickname;
				targetOfficialAccount.agentAvatar = agentInfo.avatar;
				eventListener.excuteCallbacks(_const.SYSTEM_EVENT.AGENT_INFO_UPDATE, [targetOfficialAccount]);
			}
		}
	}

	// ===========
	// 消息类型上屏
	// ===========
	if(
		!message
		// 空文本消息不上屏
		|| (type === "txt" && !message.data)
		// 空文章不上屏
		|| (type === "article" && _.isEmpty(utils.getDataByPath(msg, "ext.msgtype.articles")))
		// 视频邀请不上屏
		|| (type === "rtcVideoTicket")
		// 订单轨迹按条件上屏
		|| ((type === "track" || type === "order") && !profile.isShowTrackMsg)
	){
		return;
	}

	// 给收到的消息加 id，用于撤回消息
	message.id = msgId;

	// 消息上屏
	var transferData = utils.getDataByPath(message, "brief") || ''
	var istransfer = transferData.indexOf('[acs]转人工[/acs]') != -1;
	if(istransfer){
		_appendMsg({
			data: '<p>本次会话即将结束，是否需要接通专家咨询？</p>'+
			'<div class="em-btn-list">'+
				'<button class="js_transfertokefu bg-hover-color">转接人工</button>' +
			'</div>',
			type: "txtLink",
		}, {
			isReceived: isReceived,
			isHistory: isHistory
		});
		return
	}
	var busiData = utils.getDataByPath(message, "data") || ''
	var btnListIndex = busiData.indexOf('[menu]');
	if(btnListIndex != -1){
		console.log('message.data',message.data)
		var title = busiData.substr(0,btnListIndex)
		var body = busiData.substr(btnListIndex)
		var bodyArr = []
		body =body.split('[menu]')
		body.forEach(function(val, index){
			var flag = val.indexOf('[/menu]') != -1
			if(flag){
				val = val.replace('[/menu]', "")
				bodyArr.push({
					value: val.split('&')[0],
					text: val.split('&')[1]
				 })
			}
		})
		var $title = $('<div></div>');
		$title.append("<span class=\"text\">" + title + "</span>")
		var $body = $('<div class="em-btn-list"></div>')
		bodyArr.forEach(function(ele,index){
			$body.append('<button  data-bussi='+ ele.value +' class="js_bussibtn bg-hover-color">' + ele.text + '</button>')
		})
		_appendMsg({
			data: $("<div></div>").append($title,$body).html(),
			type: "txtLink",
		}, {
			isReceived: isReceived,
			isHistory: isHistory
		});
		return
	}

	message.laiye = laiye;
	var dat = message.data;
	// 来也机器人多条消息逐条展示
	if(laiye && !isJsonString(dat)){
		dat = dat.replace(/&amp;amp;quot;|&amp;quot;/g, "\"");
	}
	if(profile.grayList.multipleMsgOneByOne && laiye && isJsonString(dat)){
		dat = JSON.parse(dat);
		dat.forEach(function(item, index){
			var arr = [item];
			message.data = JSON.stringify(arr);
			if(item.type == "text"){
				message.type = "txt";
			}
			else if(item.type == "image"){
				message.type = "img";
				message.url = item.content;
			}
			else if(item.type == "richtext"){
				var articleDom = apiHelper.getlaiyeHtml(item.content);
				message.data = articleDom.response;
				message.type = "txt";
			}
			else{
				message.type = item.type;
			}
			message.multipleMsgOneByOne = true;
			_appendMsg(message, {
				isReceived: isReceived,
				isHistory: isHistory,
				officialAccount: targetOfficialAccount,
				timestamp: msg.timestamp,
				noPrompt: noPrompt,
			});
		});
	}
	else{
		_appendMsg(message, {
			isReceived: isReceived,
			isHistory: isHistory,
			officialAccount: targetOfficialAccount,
			timestamp: msg.timestamp,
			noPrompt: noPrompt,
		});
	}

	// 是否发送解决未解决 msg.ext.extRobot.satisfactionCommentInvitation
	if(satisfactionCommentInvitation && !isHistory){
		_appendMsg({
			data: "<p>此次服务是否已解决您的问题：</p><a class='statisfyYes' data-origintype='" + origintype + "' data-satisfactionCommentInfo='" + satisfactionCommentInfo + "' data-agentId='" + agentId + "'>解决</a>/<a class='statisfyNo'  data-origintype='" + origintype + "'  data-satisfactionCommentInfo='" + satisfactionCommentInfo + "' data-agentId='" + agentId + "'>未解决</a>",
			type: "txtLink",
		}, {
			isReceived: true,
			isHistory: false
		});
	}

	if(!isHistory){
		!noPrompt && _messagePrompt(message, targetOfficialAccount);
		// 兼容旧的消息格式
		message.value = message.data;
		// 收消息回调
		isReceived && getToHost.send({
			event: _const.EVENTS.ONMESSAGE,
			data: {
				from: msg.from,
				to: msg.to,
				message: message
			}
		});
	}
}
function isJsonString(str){
	try{
		if(typeof JSON.parse(str) == "object"){
			return true;
		}
	}
	catch(e){
	}
	return false;
}
function _transformMessageFormat(element){
	var msgBody = element.body || {};
	var msg = utils.getDataByPath(msgBody, "bodies.0") || {};
	var url = msg.url;
	var timestamp = moment(element.created_at, "YYYY-MM-DDTHH:mm:ss.SSSZZ").valueOf();
	var fileLength;
	// 只有坐席发出的消息里边的file_length是准确的
	if(msgBody.from !== config.user.username){
		fileLength = msg.file_length;
	}

	// 给图片消息或附件消息的 url 拼上 hostname
	if(url && !/^https?/.test(url)){
		url = config.domain + url;
	}

	return {
		data: msg.msg || "",
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
		from: msgBody.from,
		guanweiMsgBody: msgBody
	};
}

function _showFailed(msgId){
	utils.addClass(document.getElementById(msgId + "_loading"), "hide");
	utils.removeClass(document.getElementById(msgId + "_failed"), "hide");
}

function _hideFailedAndLoading(msgId){
	utils.addClass(document.getElementById(msgId + "_loading"), "hide");
	utils.addClass(document.getElementById(msgId + "_failed"), "hide");
}

// todo: merge setExt & appendAck
function _appendAck(msg, id){
	msg.body.ext.weichat.msg_id_for_ack = id;
}

function _setExt(msg){
	var officialAccount = profile.currentOfficialAccount || profile.systemOfficialAccount;
	var officialAccountId = officialAccount.official_account_id;
	var bindAgentUsername = officialAccount.bindAgentUsername;
	var bindSkillGroupName = officialAccount.bindSkillGroupName;
	var language = __("config.language");
	var customExtendMessage = commonConfig.customExtendMessage;
	var rulaiExtendMessage = commonConfig.getConfig().rulaiExtendMessage;

	msg.body.ext = msg.body.ext || {};
	msg.body.ext.weichat = msg.body.ext.weichat || {};

	msg.body.ext.weichat.language = language;

	// 对接百度机器人，增加消息扩展
	if(typeof customExtendMessage === "object"){
		_.assign(msg.body.ext, customExtendMessage);
	}

	// 对接敦煌网(如来机器人)，增加消息扩展
	if(typeof rulaiExtendMessage === "object"){
		_.assign(msg.body.ext, rulaiExtendMessage);
	}

	// bind skill group
	if(bindSkillGroupName){
		msg.body.ext.weichat.queueName = bindSkillGroupName;
	}
	else if(config.emgroup){
		msg.body.ext.weichat.queueName = msg.body.ext.weichat.queueName || config.emgroup;
	}

	// bind visitor
	if(!_.isEmpty(config.visitor)){
		msg.body.ext.weichat.visitor = config.visitor;
	}

	if(!_.isEmpty(config.menutype)){
		msg.body.ext.menutype = config.menutype;
	}
	if(!_.isEmpty(config.queueName)){
		msg.body.ext.weichat.queueName = window.decodeURI(config.queueName);
	}
	if(!_.isEmpty(config.queueId)){
		msg.body.ext.weichat.queueId = window.decodeURI(config.queueId);
	}
	if(!_.isEmpty(config.channelName)){
		msg.body.ext.channelName = config.channelName;
	}
	if(!_.isEmpty(config.tsrNumber)){
		msg.body.ext.tsrNumber = config.tsrNumber;
	}
	if(!_.isEmpty(config.csrNumber)){
		msg.body.ext.csrNumber = config.csrNumber;
	}
	if(!_.isEmpty(config.pageCode)){
		msg.body.ext.pageCode = config.pageCode;
	}
	if(!_.isEmpty(config.customerId)){
		msg.body.ext.customerId = config.customerId;
	}
	if(!_.isEmpty(config.isVipTsr)){
		msg.body.ext.isVipTsr = config.isVipTsr;
	}
	// // 新加参数 --- 开始
	// if (!_.isEmpty(config.visitorName)) {
	// 	msg.body.ext.visitorName = decodeURIComponent(config.visitorName);
	// }
	// if (!_.isEmpty(config.cardNumber)) {
	// 	msg.body.ext.cardNumber = config.cardNumber;
	// }
	// if (!_.isEmpty(config.phoneNumber)) {
	// 	msg.body.ext.phoneNumber = config.phoneNumber;
	// }
	if (!_.isEmpty(config.metlifeCustomerId)) {
		msg.body.ext.metlifeCustomerId = config.metlifeCustomerId;
	}
	// // 新加参数 --- 结束
	// console.log('[msg]',msg)
	// bind agent username
	if(bindAgentUsername){
		msg.body.ext.weichat.agentUsername = bindAgentUsername;
	}
	else if(config.agentName){
		msg.body.ext.weichat.agentUsername = config.agentName;
	}

	// set growingio id
	if(config.grUserId){
		msg.body.ext.weichat.visitor = msg.body.ext.weichat.visitor || {};
		msg.body.ext.weichat.visitor.gr_user_id = config.grUserId;
	}

	// 初始化时系统服务号的ID为defaut，此时不用传
	if(officialAccountId !== "default"){
		msg.body.ext.weichat.official_account = {
			official_account_id: officialAccountId
		};
	}
	console.log('[msg]', msg)
}

function _promptNoAgentOnlineIfNeeded(opt){
	var hasTransferedToKefu = opt && opt.hasTransferedToKefu;
	var officialAccountId = opt && opt.officialAccountId;
	var officialAccount = _getOfficialAccountById(officialAccountId);
	var sessionState = officialAccount.sessionState;
	// 只去查询一次有无坐席在线
	if(isNoAgentOnlineTipShowed) return;
	// 待接入中的会话 不做查询
	if(sessionState === _const.SESSION_STATE.WAIT) return;
	// 开启机器人接待时 不转人工不查询
	if(profile.hasRobotAgentOnline && !hasTransferedToKefu) return;
	// 获取在线坐席数
	apiHelper.getExSession().then(function(data){
		profile.hasHumanAgentOnline = data.onlineHumanAgentCount > 0;
		profile.hasRobotAgentOnline = data.onlineRobotAgentCount > 0;

		isNoAgentOnlineTipShowed = true;
		// 显示无坐席在线(只显示一次)
		if(
			!profile.hasHumanAgentOnline
		){
			_appendEventMsg(_const.eventMessageText.NOTE, { ext: { weichat: { official_account: officialAccount } } });
		}
	});
}

function _handleSystemEvent(event, eventObj, msg){
	var eventMessageText = _const.SYSTEM_EVENT_MSG_TEXT[event];
	var isSessionOpenEvent = _const.SYSTEM_EVENT.SESSION_OPENED == event
	var officialAccountId = utils.getDataByPath(msg, "ext.weichat.official_account.official_account_id");
	var officialAccount = _getOfficialAccountById(officialAccountId);
	var agentType = utils.getDataByPath(msg, "ext.weichat.event.eventObj.agentType");
	console.log('[event]',event);

	// 系统消息上屏
	if(eventMessageText && !isSessionOpenEvent){
		_appendEventMsg(eventMessageText, msg);
	}


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
		// to topLayer
		getToHost.send({ event: _const.EVENTS.ONSESSIONCLOSED });
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
	_promptNoAgentOnlineIfNeeded({ officialAccountId: officialAccountId });
}

// 系统事件消息上屏
function _appendEventMsg(text, msg){
	// 如果设置了 hideStatus, 不显示此类提示
	if(config.hideStatus){
		return;
	}
	var officialAccountId = utils.getDataByPath(msg, "ext.weichat.official_account.official_account_id");
	var targetOfficialAccount = _getOfficialAccountById(officialAccountId);
	targetOfficialAccount.messageView.appendEventMsg(text);
}

function _getOfficialAccountById(id){
	// 默认返回系统服务号
	if(!id){
		return profile.systemOfficialAccount;
	}
	return _.findWhere(profile.officialAccountList, { official_account_id: id });
}

function _appendMsg(msg, options){
	// 灰度打开时，访客收到菜单消息后，如果访客又发送了新消息，则菜单置灰不可再点选
	var msgType = utils.getDataByPath(msg, "ext.weichat.official_account.type");
	if(profile.grayList.rulaiRobotRichText && msgType !== "SYSTEM"){
		// 所有的 list 子类消息
		var allListBtn1 = document.querySelectorAll(".msgtype-robotList .em-btn-list button");
		var all = _.toArray(allListBtn1);
		_.each(all, function(robotBtn){
			utils.addClass(robotBtn, "disabled");
		});
	}

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
	// 没有使用（无用户）
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

// 第二通道发消息
function _sendMsgChannle(id, retryCount){
	var msg = sendMsgDict.get(id);
	var body = utils.getDataByPath(msg, "body.body");
	var ext = utils.getDataByPath(msg, "body.ext");
	var count = typeof retryCount === "number"
		? retryCount
		: _const.SECOND_MESSAGE_CHANNEL_MAX_RETRY_COUNT;

	apiHelper.sendMsgChannel(body, ext).then(function(){
		// 发送成功清除
		_clearTS(id);
	}, function(){
		// 失败继续重试
		if(count > 0){
			_sendMsgChannle(id, --count);
		}
		else{
			_showFailed(id);
		}
	});
}

// 第二通道上传图片消息
function _uploadImgMsgChannle(id, file, retryCount){
	var msg = sendMsgDict.get(id);
	var count = typeof retryCount === "number"
		? retryCount
		: _const.SECOND_MESSAGE_CHANNEL_MAX_RETRY_COUNT;


	apiHelper.uploadImgMsgChannel(file).then(function(resp){
		msg.body.body = {
			filename: resp.fileName,
			type: "img",
			url: resp.url
		};
		_sendMsgChannle(id, 0);
	}, function(){
		if(count > 0){
			_uploadImgMsgChannle(msg, file, --count);
		}
		else{
			_showFailed(id);
		}
	});
}

// 消息发送成功，清除timer
function _clearTS(id){
	clearTimeout(ackTimerDict.get(id));
	ackTimerDict.remove(id);

	_hideFailedAndLoading(id);
	sendMsgDict.remove(id);
}

// 监听ack，超时则开启api通道, 发文本消息时调用
function _detectSendTextMsgByApi(id){
	ackTimerDict.set(
		id,
		setTimeout(function(){
			_sendMsgChannle(id);
		}, _const.FIRST_CHANNEL_MESSAGE_TIMEOUT)
	);
}

// 监听ack，超时则开启api通道, 上传图片消息时调用
function _detectUploadImgMsgByApi(id, file){
	ackTimerDict.set(
		id,
		setTimeout(function(){
			_uploadImgMsgChannle(id, file);
		}, _const.FIRST_CHANNEL_IMG_MESSAGE_TIMEOUT)
	);
}

function _messagePrompt(message, officialAccount){
	var officialAccountType = officialAccount.type;
	var brief = message.brief;
	var avatar = officialAccountType === "CUSTOM"
		? officialAccount.img
		: profile.systemAgentAvatar || profile.tenantAvatar || profile.defaultAvatar;

	if(utils.isBrowserMinimized() || !profile.isChatWindowOpen){
		eventListener.excuteCallbacks(_const.SYSTEM_EVENT.MESSAGE_PROMPT, []);

		getToHost.send({ event: _const.EVENTS.SLIDE });
		getToHost.send({
			event: _const.EVENTS.NOTIFY,
			data: {
				avatar: avatar,
				title: __("prompt.new_message"),
				brief: brief
			}
		});
	}
}

var utils = require("../../common/utils");
var profile = require("../modules/tools/profile");
var moment = require("moment");

module.exports = {
	getMessageId: getMessageId,
	setMessageId: setMessageId,
	textMessage: textMessage,
	transformFromKefu2Im: transformFromKefu2Im,
	mediaFileMessage: function(options){
		var opt = options || {};
		var url = opt.url || "";
		var filename = opt.filename || "";
		var type = opt.type || "";
		var size = opt.size;
		var id = opt.id || null;
		var ext = opt.ext || null;
		var messageBody = _getMessageBody({ url: url, filename: filename, type: type, fileLength: size }, ext);
		id && setMessageId(messageBody, id);
		return messageBody;
	},
	toAgentTransfer: function(sessionId, transferId){
		return commandMessage("TransferToKf", {
			ctrlArgs: {
				id: transferId || null,
				serviceSessionId: sessionId || null,
			},
		});
	},
	videoInvitation: function(invitation){
		return textMessage(__("video.invite_agent_video"), {
			type: "rtcmedia/video",
			msgtype: { liveStreamInvitation: invitation },
		});
	},
	satisfactionEvaluation: function(options){
		return textMessage(null, { weichat: { ctrlType: "enquiry", ctrlArgs: options } });
	},
	menuSelection: function(text, menuId){
		return textMessage(text, { msgtype: { choice: { menuid: menuId } } });
	},
	skillGroupSelection: function(text, skillGroupName){
		return textMessage(text, { weichat: { queueName: skillGroupName } });
	},
	magicEmoji: function(imageUrl){
		return textMessage(null, { msgtype: { customMagicEmoji: { url: imageUrl } } });
	},
};
function getMessageId(messageBody){
	return utils.getDataByPath(messageBody, "ext.weichat.msgId") || null;
}
function setMessageId(messageBody, id){
	messageBody.ext.weichat = messageBody.ext.weichat || {};
	messageBody.ext.weichat.msgId = id || null;
}
function textMessage(text, ext){
	return _getMessageBody({ msg: text || "", type: "txt" }, ext);
}

function commandMessage(action, ext){
	return _getMessageBody({ msg: "", action: action || "", type: "cmd" }, ext);
}

function _getMessageBody(body, ext){
	var messageBody = {
		bodies: [ body ],
		ext: ext || {},
		from: profile.visitorInfo.name,
		channel_id: profile.channelId,
		tenantId: parseInt(profile.config.tenantId, 10),
		visitorUserId: profile.visitorInfo.kefuId,
		originType: "webim",
		channelType: "easemob",
	};
	_setExt(messageBody);

	return messageBody;
}

function _setExt(messageBody){
	var officialAccount = profile.currentOfficialAccount || profile.systemOfficialAccount;
	var officialAccountId = officialAccount.official_account_id;
	var bindAgentUsername = officialAccount.bindAgentUsername;
	var bindSkillGroupName = officialAccount.bindSkillGroupName;
	var ext = messageBody.ext;
	var weichat = ext.weichat = ext.weichat || {};
	var emgroup = profile.config.emgroup;
	var agentName = profile.config.agentName;
	var grUserId = profile.grUserId;

	_.assign(weichat, {
		originType: "webim",
		msgId: utils.uuid(),
		language: __("config.language"),
	});


	// bind skill group
	if(bindSkillGroupName){
		weichat.queueName = bindSkillGroupName;
	}
	else if(weichat.queueName){
		// 已经指定了技能组，则用现有的
	}
	else if(emgroup){
		weichat.queueName = emgroup;
	}

	// bind visitor
	// todo: confirm this
	if(!_.isEmpty(profile.visitorInfo)){
		weichat.visitor = profile.visitor;
	}

	// bind agent username
	if(bindAgentUsername){
		weichat.agentUsername = bindAgentUsername;
	}
	else if(agentName){
		weichat.agentUsername = agentName;
	}

	// set growingio id
	if(grUserId){
		weichat.visitor = weichat.visitor || {};
		weichat.visitor.gr_user_id = grUserId;
	}

	// 初始化时系统服务号的ID为defaut，此时不用传
	if(officialAccountId !== "default"){
		weichat.official_account = { official_account_id: officialAccountId };
	}
}

function transformFromKefu2Im(element){
	var msgBody = element.body || {};
	var msg = utils.getDataByPath(msgBody, "bodies.0") || {};
	var url = msg.url;
	var createdTime = element.created_at;
	var timestamp = createdTime
		? moment(createdTime, "YYYY-MM-DDTHH:mm:ss.SSSZZ").valueOf()
		: null;
	var ext = utils.getDataByPath(msgBody, "ext") || {};
	var id = element.msg_id || utils.getDataByPath(ext, "weichat.msgId") || null;
	var fileLength;

	if(id){
		ext.weichat = ext.weichat || {};
		ext.weichat.msgId = id;
	}
	// 只有坐席发出的消息里边的file_length是准确的
	// todo: fix this, move this to msg factory
	if(msgBody.from !== profile.options.imUsername){
		fileLength = msg.file_length;
	}

	// 给图片消息或附件消息的url拼上hostname
	// todo: move this to msg factory
	if(url && !/^(https?)|(blob)/.test(url)){
		url = location.protocol + profile.config.domain + url;
	}

	return {
		data: msg.msg || "",
		url: url,
		filename: msg.filename,
		action: msg.action,
		type: msg.type,
		fromUser: element.from_user,
		timestamp: timestamp,
		fileLength: fileLength,
		ext: ext,
		to: msgBody.to,
		from: msgBody.from,
		msg_id_for_ack: msgBody.msg_id_for_ack,
	};
}


var utils = require("../../common/utils");
var _const = require("../../common/const");
var profile = require("../modules/tools/profile");
var tools = require("src/js/app/modules/tools/tools");
var apiHelper = require("../modules/apiHelper");
var eventListener = require("../modules/tools/eventListener");
var messageBuilder = require("./messageBuilder");
var cache = require("./cache");
// todo: lazy load
var WebIM = require("easemob-websdk");

var ds;
var im;
var eventSendPath;
var receiveMessageTimerHandler;
var channelPromise;

module.exports = {
	send: send,
	init: function(){
		channelPromise = profile.deepStreamChannelEnable
			? _initDeepStreamConnection()
			: _initEasemobImConnection();

		return channelPromise;
	},
	startSecondChannelMessageReceiver: function(){
		if(receiveMessageTimerHandler) throw new Error("secone channel receiver is already started.");

		receiveMessageTimerHandler = setInterval(function(){
			apiHelper.getMessage().then(function(msgList){
				_.each(msgList, function(elem){
					eventListener.trigger(
						_const.SYSTEM_EVENT.MESSAGE_RECEIVED,
						messageBuilder.transformFromKefu2Im({ body: elem }),
						{ isHistory: false }
					);
				});
			});
		}, _const.SECOND_CHANNEL_MESSAGE_RECEIVE_INTERVAL);
	},
	stopSecondChannelMessageReceiver: function(){
		receiveMessageTimerHandler = clearInterval(receiveMessageTimerHandler);
	},
};

function _initEasemobImConnection(){
	var timeoutHandler;
	// 限制 im-channel 重新连接的次数和时间间隔
	var throttledOpen = tools.retryThrottle(function(){
		im.open({
			user: profile.options.imUsername,
			accessToken: profile.imToken,
			// 暂时不用密码登录
			// pwd: profile.options.imPassword,
			appKey: profile.config.orgName +  "#" + profile.config.appName,
			apiUrl: location.protocol + "//" + profile.options.imRestServer
		});
	}, {
		resetTime: 10 * 60 * 1000,
		waitTime: 2000,
		retryLimit: 3
	});
	return new Promise(function(resolve, reject){
		// 超时自动reject
		timeoutHandler = setTimeout(reject, _const.FIRST_CHANNEL_CONNECTION_TIMEOUT);

		// im-rest 挂掉时，自动reject
		if(profile.imRestDown){
			reject();
			return;
		}

		// 创建连接
		im = new WebIM.connection({
			url: profile.options.imXmppServer,
			retry: true,
			isMultiLoginSessions: profile.config.resources,
			heartBeatWait: _const.HEART_BEAT_INTERVAL,
		});

		// 添加回调
		im.listen({
			onOpened: function(info){
				// todo: 弄清这个是干什么用的
				im.setPresence();
				resolve();
			},
			onTextMessage: function(message){
				eventListener.trigger(_const.SYSTEM_EVENT.MESSAGE_RECEIVED, message, { type: "txt" });
			},
			onPictureMessage: function(message){
				eventListener.trigger(_const.SYSTEM_EVENT.MESSAGE_RECEIVED, message, { type: "img" });
			},
			onFileMessage: function(message){
				eventListener.trigger(_const.SYSTEM_EVENT.MESSAGE_RECEIVED, message, { type: "file" });
			},
			onCmdMessage: function(message){
				var action = message && message.action;
				var ackId = utils.getDataByPath(message, "ext.weichat.ack_for_msg_id");

				// 处理客服 ack
				if(action === "KF-ACK" && ackId){
					cache.resolveById(ackId);
					return;
				}
				eventListener.trigger(_const.SYSTEM_EVENT.MESSAGE_RECEIVED, message, { type: "cmd" });
			},
			onError: function(e){
				if(e.reconnect){
					throttledOpen();
				}
				else if(e.type === _const.IM.WEBIM_CONNCTION_AUTH_ERROR){
					throttledOpen();
				}
				// im sdk 会捕获回调中的异常，需要把出错信息打出来
				// 此段逻辑基本不再需要了
				else if(e.type === _const.IM.WEBIM_CONNCTION_CALLBACK_INNER_ERROR){
					console.error(e.data);
				}
				else{
					console.error(e);
				}
			}
		});

		// 打开连接
		throttledOpen();
	})
	.then(function(){
		// 连接成功，清除timer
		clearTimeout(timeoutHandler);
		return Promise.resolve("firstChannel");
	}, function(){
		// 连接超时，清除timer
		clearTimeout(timeoutHandler);
		return Promise.resolve("secondChannel");
	});
}
function _initDeepStreamConnection(){
	var channelPath = "event/" + profile.config.tenantId + "/" + profile.channelId;
	var eventReceivePath =  channelPath + "/visitor/" + profile.visitorInfo.kefuId;
	var timerHandler;
	var reconnectTimes = 0;

	eventSendPath = channelPath + "/agent";
	return apiHelper.getDeepStreamServer().then(function(serverAddress){
		return new Promise(function(resolve, reject){
			// 超时自动 reject
			timerHandler = setTimeout(reject, _const.FIRST_CHANNEL_CONNECTION_TIMEOUT);

			ds = window.deepstream(serverAddress);

			ds.on("connectionStateChanged", function(connectionState){
				switch(connectionState){
				case "OPEN":
					resolve();
					break;
				case "ERROR":
					console.warn("connection state changed to ERROR");
					break;
				default:
					break;
				}
				console.log("connectionState: ", connectionState);
			});

			ds.on("error", function(error, event, topic){
				if(event === "connectionError"){
					reconnectTimes++;
				}
				if(reconnectTimes >= 3) reject();
				console.warn(error, event, topic);
			});

			ds.login();
			ds.event.subscribe(eventReceivePath, _preProcessMessage);
		});
	})
	.then(function(){
		// 连接成功，清除timer
		clearTimeout(timerHandler);
		return Promise.resolve("firstChannel");
	}, function(){
		// 连接超时，清除timer
		clearTimeout(timerHandler);
		return Promise.resolve("secondChannel");
	});
}

function _preProcessMessage(eventData){
	var parsed = utils.safeJsonParse(eventData);
	var type = utils.getDataByPath(parsed, "bodies.0.type");
	var ackId = utils.getDataByPath(parsed, "msg_id_for_ack");

	// 处理 ack
	if(ackId){
		cache.resolveById(ackId);
		return;
	}
	eventListener.trigger(
		_const.SYSTEM_EVENT.MESSAGE_RECEIVED,
		messageBuilder.transformFromKefu2Im({ body: parsed }),
		{ type: type }
	);
}

function send(messageBody){
	var timeoutHandler;
	var messageId = messageBuilder.getMessageId(messageBody);

	channelPromise.then(function(channelName){
		// 若第一通道未能正常初始化，则跳过
		if(channelName === "secondChannel") return Promise.reject();
		return new Promise(function(resolve, reject){
			cache.registerResolve(messageId, resolve);
			if(profile.deepStreamChannelEnable){
				ds.event.emit(eventSendPath, JSON.stringify(messageBody));
			}
			else{
				im.send(_imMessageAdapterBeforeSending(messageBody));
			}
			// 超时自动 reject
			timeoutHandler = setTimeout(reject, _const.FIRST_CHANNEL_MESSAGE_TIMEOUT);
		});
	})
	.then(function(result){
		// 发送成功，清除超时定时器
		clearTimeout(timeoutHandler);
		// 结果原样返回
		return result;
	}, function(){
		// 超时后走第二通道
		return apiHelper.postMessage(messageBody);
	})
	.then(null, function(){
		// 若失败，则再重试一次
		return apiHelper.postMessage(messageBody);
	})
	.then(function(){
		// hide loading
		utils.addClass(document.getElementById(messageId + "_loading"), "hide");
		utils.addClass(document.getElementById(messageId + "_failed"), "hide");
	}, function(){
		// show failed
		utils.addClass(document.getElementById(messageId + "_loading"), "hide");
		utils.removeClass(document.getElementById(messageId + "_failed"), "hide");
	});
}

function _imMessageAdapterBeforeSending(messageBody){
	var type = messageBody.bodies[0].type;
	var id = messageBody.ext.weichat.msgId;
	var result;
	// 删除 msgId，添加 msg_id_for_ack
	delete messageBody.ext.weichat.msgId;
	// todo fix: 这里的 messageBody 对引用对象做了修改，可能影响别人获取 msgId
	messageBody.ext.weichat.msg_id_for_ack = id;
	result = {
		type: messageBody.bodies[0].type,
		msg: messageBody.bodies[0].msg,
		ext: messageBody.ext,
		from: profile.options.imUsername,
		to: profile.config.toUser,
	};

	if(type === "file" || type === "img"){
		result.file = messageBody.bodies[0].filename;
		result.body = messageBody.bodies[0];
	}

	return result;
}



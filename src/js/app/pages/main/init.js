require("es6-promise").polyfill();
require("@/common/polyfill");
require("../../libs/modernizr");
require("../../libs/sdk/webim.config");
require("underscore");

var utils = require("@/common/utils");
var _const = require("@/common/const");

var uikit = require("./uikit");
var apiHelper = require("./apis");
var eventCollector = require("./eventCollector");
var chat = require("./chat");
var channel = require("./channel");
var profile = require("@/app/tools/profile");
var commonConfig = require("@/common/config");
var getToHost = require("@/app/common/transfer");
var hasChatEntryInitialized;
var extendMessageSender = require("./chat/extendMessageSender");

var setConfig;

module.exports = {
	init: init,
	initChat: initChat,
	chat_window_mode_init: chat_window_mode_init,
	initRelevanceError: initRelevanceError,
	show: show,
	close: close,
};

function show(){
	utils.removeClass(document.querySelector(".em-widget-wrapper"), "hide");
}

function close(){
	utils.addClass(document.querySelector(".em-widget-wrapper"), "hide");
}

function init(obj){
	setConfig = obj;
	utils.on(window, "message", function(e){
		updateCustomerInfo(e);
	});
}

function updateCustomerInfo(e){
	var trackMsg;
	var temp;
	var data = e.data;
	if(typeof data === "string" && data != "undefined"){
		data = JSON.parse(data);
	}
	temp = utils.getDataByPath(data, "easemob.kefu.cta");
	if(temp){
		trackMsg = {
			ext: {
				msgtype: {
					track: {
						// 消息标题
						title: "从\"" + temp.title + "\"提交的手机号码：",
						// 商品描述
						desc: temp.phone,
						// 商品图片链接
						// img_url: "/images/robot/article_image.png",
						// 商品页面链接
						item_url: temp.item_url
					}
				}
			}
		};
		apiHelper.updateCustomerInfo({
			phone: temp.phone
		});
		channel.sendText("转人工客服", trackMsg);
	}
}

function DOMEval(code){
	console.log('code', code)
	var script = document.createElement("script");

	script.src = code;
	document.body.appendChild(script);
}

function initChat(){
	// 可回溯插件，上生产需要注释掉！！！
	// apiHelper.getisWeidian(commonConfig.getConfig().tenantId).then(function(res){
	// 	console.log('isweidian',res)
	// 	if("Y" == res){
	// 		DOMEval('https://isee-uat.metlife.com.cn/isee/eye.js')
	// 	}
	// })

	handleMsgData();
	utils.removeClass(document.querySelector(".em-widget-wrapper"), "hide");
	apiHelper.getGrayList(commonConfig.getConfig().tenantId).then(function(grayList){
		// 灰度列表
		profile.grayList = grayList;

		// 访客回呼功能
		// CLOUD-15395 在config中配置eventCollector:true, 在手机端浏览器会自动打开聊天窗口
		// !utils.isMobile && commonConfig.getConfig().eventCollector && !eventCollector.isStarted()
		if(commonConfig.getConfig().eventCollector && !eventCollector.isStarted()){
			eventCollector.startToReport(function(targetUserInfo){
				initChatEntry(targetUserInfo);
			});
		}
		else{
			// 获取关联，创建访客，调用聊天窗口
			initChatEntry();
		}
	});
}

function handleMsgData(){
	if(_.isArray(commonConfig.getConfig().extMsg)){
		_.each(commonConfig.getConfig().extMsg, function(elem){
			extendMessageSender.push(elem);
		});
	}
	else if(_.isObject(commonConfig.getConfig().extMsg)){
		extendMessageSender.push(commonConfig.getConfig().extMsg);
	}
}

function chat_window_mode_init(){
	var $contactAgentBtn = document.getElementById("em-widgetPopBar");
	getToHost.listen(function(msg){
		var event = msg.event;
		var data = msg.data;
		var extendMessage;

		switch(event){
		case _const.EVENTS.SHOW:
			// 在访客点击联系客服后停止上报访客
			if(eventCollector.isStarted()){
				eventCollector.stopReporting();
				initChatEntry();
			}

			// 访客端有进行中会话，停止了轮询，此时需要走一遍之前被跳过的初始化流程
			if(eventCollector.hasProcessingSession()){
				initChatEntry();
			}

			if(eventCollector.hasCtaInvite()){
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
			extendMessage = data.ext;
			extendMessageSender.push(extendMessage.ext);
			break;
		case _const.EVENTS.TEXTMSG:
			channel.sendText(data);
			break;
		case _const.EVENTS.UPDATE_URL:
			profile.currentBrowsingURL = data;
			break;
		default:
			break;
		}
	}, ["down2Im"]);

	utils.removeClass($contactAgentBtn, "hide");
	utils.on($contactAgentBtn, "click", function(){
		getToHost.send({ event: _const.EVENTS.SHOW });
	});
}

function initRelevanceError(err){
	if(err.statusCode === 503){
		uikit.createDialog({
			contentDom: utils.createElementFromHTML([
				"<div class=\"wrapper\">",
				"<span class=\"icon-waiting\"></span>",
				"<p class=\"tip-word\">" +  __("common.session_over_limit") + "</p>",
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
}

function initChatEntry(targetUserInfo){
	if(hasChatEntryInitialized){
		return;
	}
	hasChatEntryInitialized = true;
	setConfig(targetUserInfo)
	.then(function(type){
		// config ready
		apiHelper.update(commonConfig.getConfig());
		switch(type){
		case "user":
			userEntry(targetUserInfo);
			break;

		case "userWithToken":
			userTokenEntry(targetUserInfo);
			break;

		case "userWithPassword":
			userWithPasswordEntry(targetUserInfo);
			break;

		case "userWithNameAndToken":
			userNameAndTokenEntry();
			break;

		case "userWidthNameAndPassword":
			profile.imPassword = commonConfig.getConfig().user.password;
			chat.init();
			break;

		case "wechatAuth":
		case "widthPassword":
			chat.init();
			break;

		case "autoCreateAppointedVisitor":
		case "noWechatAuth":
		case "noAutoCreateAppointedVisitor":
		default:
			_createVisitor();
			break;
		}
	});

}

function userEntry(targetUserInfo){
	chat.init();
	chat.show();
	getToHost.send({
		event: _const.EVENTS.SHOW
	});
	getToHost.send({
		event: _const.EVENTS.CACHEUSER,
		data: {
			username: targetUserInfo.userName,
			// todo: check if need emgroup
			group: commonConfig.getConfig().user.emgroup
		}
	});
	// 发送指定坐席的ext消息，延迟发送
	extendMessageSender.push({
		weichat: {
			agentUsername: targetUserInfo.agentUserName
		}
	});
}

function userTokenEntry(targetUserInfo){
	// 发送空的ext消息，延迟发送
	profile.commandMessageToBeSendList.push({
		ext: {
			weichat: {
				agentUsername: targetUserInfo.agentUserName
			}
		}
	});
	chat.init();
	chat.show();
	getToHost.send({
		event: _const.EVENTS.SHOW
	});
	// 发送指定坐席的ext消息，延迟发送
	extendMessageSender.push({
		weichat: {
			agentUsername: targetUserInfo.agentUserName
		}
	});
}

function userWithPasswordEntry(targetUserInfo){
	chat.init();
	chat.show();
	getToHost.send({
		event: _const.EVENTS.SHOW
	});
	// 发送指定坐席的ext消息，延迟发送
	extendMessageSender.push({
		weichat: {
			agentUsername: targetUserInfo.agentUserName
		}
	});
}

function userNameAndTokenEntry(){
	// todo: move imToken to an independent key
	profile.imToken = commonConfig.getConfig().user.token;
	chat.init();
}




function _createVisitor(){
	var cacheKeyName = (commonConfig.getConfig().configId || (commonConfig.getConfig().to + commonConfig.getConfig().tenantId + commonConfig.getConfig().emgroup));

	if(commonConfig.getConfig().user.password === ""){
		profile.imRestDown = true;
	}
	if(utils.isTop){
		utils.set("root" + (commonConfig.getConfig().configId || (commonConfig.getConfig().tenantId + commonConfig.getConfig().emgroup)), commonConfig.getConfig().user.username);
	}
	else{
		getToHost.send({
			event: _const.EVENTS.CACHEUSER,
			data: {
				key: cacheKeyName,
				value: commonConfig.getConfig().user.username,
			}
		});
	}
	chat.init();
}

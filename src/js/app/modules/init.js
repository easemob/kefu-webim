require("es6-promise").polyfill();
require("../../common/polyfill");
require("../lib/modernizr");
require("../sdk/webim.config");
require("underscore");

var utils = require("../../common/utils");
var _const = require("../../common/const");
var Transfer = require("../../common/transfer");
var uikit = require("./uikit");
var apiHelper = require("./apiHelper");
var eventCollector = require("./eventCollector");
var chat = require("./chat");
var profile = require("./tools/profile");
var doWechatAuth = require("./wechat");
var extendMessageSender = require("./chat/extendMessageSender");
var body_template = require("raw-loader!../../../template/body.html");
var channelAdapter = require("../sdk/channelAdapter");
var messageBuilder = require("../sdk/messageBuilder");
var tools = require("src/js/app/modules/tools/tools");

var config;

load_html();
if(utils.isTop){
	h5_mode_init();
}
else{
	chat_window_mode_init();
}

function load_html(){
	utils.appendHTMLToBody(_.template(body_template)({
		contact_agent: __("common.contact_agent"),
		close: __("common.close"),
		video_ended: __("video.video_ended"),
		agent_is_typing: __("chat.agent_is_typing"),
		current_queue_number: __("chat.current_queue_number"),
		connecting: __("chat.connecting"),
		input_placeholder: __("chat.input_placeholder"),
		emoji: __("toolbar.emoji"),
		picture: __("toolbar.picture"),
		attachment: __("toolbar.attachment"),
		ticket: __("toolbar.ticket"),
		video_invite: __("toolbar.video_invite"),
		evaluate_agent: __("toolbar.evaluate_agent"),
		transfer_to_kefu: __("toolbar.transfer_to_kefu"),
		press_save_img: __("common.press_save_img"),
	}));

	chat.getDom();
}

function h5_mode_init(){
	config = {};
	config.tenantId = utils.query("tenantId");
	config.configId = utils.query("configId");
	config.offDutyType = utils.query("offDutyType");
	config.grUserId = utils.query("grUserId");
	config.domain = utils.query("domain") ? "//" + utils.query("domain") : "";

	// H5 方式集成时不支持eventCollector配置
	config.to = utils.convertFalse(utils.query("to"));
	profile.options.imXmppServer = utils.convertFalse(utils.query("xmppServer"));
	profile.options.imRestServer = utils.convertFalse(utils.query("restServer"));
	config.agentName = utils.convertFalse(utils.query("agentName"));
	config.resources = utils.convertFalse(utils.query("resources"));
	config.hideStatus = utils.convertFalse(utils.query("hideStatus"));
	config.satisfaction = utils.convertFalse(utils.query("sat"));
	config.wechatAuth = utils.convertFalse(utils.query("wechatAuth"));
	config.hideKeyboard = utils.convertFalse(utils.query("hideKeyboard"));

	config.appKey = utils.convertFalse(decodeURIComponent(utils.query("appKey")));
	config.domain = config.domain || "//" + location.host;
	config.offDutyWord = decodeURIComponent(utils.query("offDutyWord"));
	config.ticket = utils.query("ticket") === "" ? true : utils.convertFalse(utils.query("ticket")); // true default
	config.emgroup = decodeURIComponent(utils.query("emgroup"));

	config.user = {};
	var usernameFromUrl = utils.query("user");

	var usernameFromCookie = utils.get("root" + (config.configId || (config.tenantId + config.emgroup)));

	if(usernameFromUrl){
		profile.options.imUsername = usernameFromUrl;
	}
	else if(usernameFromCookie){
		profile.options.imUsername = usernameFromCookie;
		profile.options.isUsernameFromCookie = true;
	}
	else{}

	profile.config = config;
	// fake transfer
	window.transfer = {
		send: function(){}
	};
	initCrossOriginIframe();
}

function chat_window_mode_init(){
	var $contactAgentBtn = document.getElementById("em-widgetPopBar");
	window.transfer = new Transfer(null, "main", true).listen(function(msg){
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
			channelAdapter.sendText(messageBuilder.textMessage(data.data));;
			break;
		case _const.EVENTS.UPDATE_URL:
			profile.currentBrowsingURL = data;
			break;
		case _const.EVENTS.INIT_CONFIG:
			window.transfer.to = data.parentId;
			config = data;
			profile.options.isUsernameFromCookie = config.isUsernameFromCookie;
			profile.options.imUsername = config.user.username;
			profile.options.imPassword = config.user.password;
			profile.options.imXmppServer = config.xmppServer;
			profile.options.imRestServer = config.restServer;
			profile.visitorInfo = config.visitor || {};
			profile.config = config;
			initCrossOriginIframe();
			break;
		default:
			break;
		}
	}, ["easemob"]);

	utils.removeClass($contactAgentBtn, "hide");
	utils.on($contactAgentBtn, "click", function(){
		transfer.send({ event: _const.EVENTS.SHOW });
	});
}

function initChat(){
	apiHelper.init(config);
	apiHelper.getGrayList().then(function(grayList){
		// 灰度列表
		profile.grayList = grayList;
		profile.deepStreamChannelEnable = grayList.deepStreamChannel && Modernizr.websockets;

		// todo: 避免 initChatEntry 被重复调用
		// 访客回呼功能
		if(!utils.isMobile && config.eventCollector && !eventCollector.isStarted()){
			eventCollector.startToReport(function(targetUserInfo){
				initChatEntry(targetUserInfo);
			});
		}
		else{
			// 获取关联，创建访客，调用聊天窗口
			initChatEntry();
		}
	});



	apiHelper.getTheme().then(function(themeName){
		var className = _const.themeMap[themeName];
		className && utils.addClass(document.body, className);
	});

}

// todo: rename this function
function handleMsgData(){
	// default value
	config.staticPath = config.staticPath || __("config.static_path");
	config.offDutyWord = config.offDutyWord || __("prompt.default_off_duty_word");
	config.emgroup = config.emgroup || "";
	config.timeScheduleId = config.timeScheduleId || 0;

	if(_.isArray(config.extMsg)){
		_.each(config.extMsg, function(elem){
			extendMessageSender.push(elem);
		});
	}
	else if(_.isObject(config.extMsg)){
		extendMessageSender.push(config.extMsg);
	}

	// fake patch: 老版本配置的字符串需要decode
	if(config.offDutyWord){
		try{
			config.offDutyWord = decodeURIComponent(config.offDutyWord);
		}
		catch(e){}
	}

	if(config.emgroup){
		try{
			config.emgroup = decodeURIComponent(config.emgroup);
		}
		catch(e){}
	}

	config.user = config.user || {};
	config.visitor = config.visitor || {};

	config.channel = {};
	config.ui = {
		H5Title: {}
	};
	config.toolbar = {};
	config.chat = {};

	profile.defaultAvatar = config.staticPath + "/img/default_avatar.png";

	// 用于预览模式
	if(config.previewObj){
		handleConfig(config.previewObj);
		initChat();
	}
	else if(config.configId){
		apiHelper.getConfig(config.configId).then(function(entity){
			config.tenantId = entity.tenantId;
			handleConfig(entity.configJson);
			initChat();
		});
	}
	else{
		initChat();
	}
}
function handleConfig(configJson){
	// todo: 把配置转换为新的
	// 用于config标记是否是来自于坐席端网页配置
	profile.isConfigFromBackend = true;

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
	profile.options.noticeWord = configJson.ui.notice.enabled && configJson.ui.notice.content;
	profile.options.themeName = configJson.ui.themeName;

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
	config.timeScheduleId = configJson.chat.timeScheduleId || 0;


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

function initCrossOriginIframe(){
	var iframe = document.getElementById("cross-origin-iframe");

	iframe.src = config.domain + "/webim/transfer.html?v=__WEBIM_PLUGIN_VERSION__";
	utils.on(iframe, "load", function(){
		apiHelper.initApiTransfer();
		handleMsgData();
	});
}


function initChatEntry(targetUserInfo){
	return apiHelper.getRelevanceList().then(function(relevanceList){
		// 获取关联信息
		var targetChannel;
		var appKey = config.appKey || "";
		var splited = appKey.split("#");
		var orgName = splited[0];
		var appName = splited[1];
		var toUser = config.toUser || config.to;

		// toUser 转为字符串， todo: move it to handle config
		typeof toUser === "number" && (toUser = toUser.toString());

		if(appKey && toUser){
			// appKey，imServiceNumber 都指定了
			targetChannel = _.findWhere(relevanceList, {
				orgName: orgName,
				appName: appName,
				imServiceNumber: toUser
			});
		}

		// 未指定 appKey，imServiceNumber 时，或未找到符合条件的关联时，默认使用关联列表中的第一项
		if(!targetChannel){
			targetChannel = relevanceList[0];
			console.log("mismatched channel, use default.");
		}

		// todo: adapt this
		profile.tenantAvatar = utils.getAvatarsFullPath(targetChannel.tenantAvatar, config.domain);
		// 获取企业头像和名称
		// todo: rename to tenantName
		profile.defaultAgentName = targetChannel.tenantName;
		config.logo = config.logo || { enabled: !!targetChannel.tenantLogo, url: targetChannel.tenantLogo };

		profile.channelId = targetChannel.channelId;
		profile.options.imRestServer = profile.options.imRestServer || targetChannel.restDomain;
		profile.options.imXmppServer = profile.options.imXmppServer || targetChannel.xmppServer;
		// todo: move this to profile.options
		config.toUser = targetChannel.imServiceNumber;
		config.orgName = targetChannel.orgName;
		config.appName = targetChannel.appName;
	}, function(err){
		if(err.statusCode === 503){
			uikit.createDialog({
				contentDom: utils.createElementFromHTML([
					"<div class=\"wrapper\">",
					"<span class=\"icon-waiting\"></span>",
					"<p class=\"tip-word\">" +  __("common.session_over_limit") + "</p>",
					"</div>"
				].join("")),
				className: "session-over-limit",
			}).show();
		}
		else if(err.message === _const.ERROR_MSG.NO_VALID_CHANNEL){
			// chat.show()针对移动端，在pc端不是必要的逻辑
			chat.show();
			uikit.prompt(__("prompt.no_valid_channel"));
			throw err;
		}
		throw err;
	})
	.then(function(){
		// todo: 访客回呼稍后再做适配
		if(targetUserInfo){

			// 访客回呼模式使用后端返回的关联信息
			config.toUser = targetUserInfo.agentImName;
			config.appName = targetUserInfo.appName;
			config.orgName = targetUserInfo.orgName;

			// 游客
			if(targetUserInfo.userName){
				profile.options.imUsername = targetUserInfo.userName;
				config.user = {
					password: targetUserInfo.userPassword
				};

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
			else{
				apiHelper.getPassword().then(function(password){
					profile.options.imPassword = password;

					chat.show();
					transfer.send({ event: _const.EVENTS.SHOW });
				});
			}
			// 发送指定坐席的ext消息，延迟发送
			extendMessageSender.push({ weichat: { agentUsername: targetUserInfo.agentUserName } });
			return Promise.resolve();
		}
		// 检测微信网页授权
		else if(config.wechatAuth){
			// todo: weichat 改为 promise
			return new Promise(function(resolve, reject){
				doWechatAuth(function(entity){
					profile.options.imUsername = entity.userId;
					profile.options.imPassword = entity.userPassword;
					resolve();
				}, reject);
			})
			// 失败随机创建访客
			.then(null, function(){
				return _createImVisitor();
			});
		}
		else if(profile.options.imUsername && profile.options.imPassword){
			return Promise.resolve();
		}
		else if(profile.options.imUsername && config.user.token){
			profile.imToken = config.user.token;
			return Promise.resolve();
		}
		else if(profile.options.imUsername){
			return apiHelper.getPassword().then(function(password){
				profile.options.imPassword = password;
			}, function(){
				var specifiedUserName;
				if(profile.grayList.autoCreateAppointedVisitor && !profile.options.isUsernameFromCookie){
					// 仅当灰度开关开启，并且是用户指定的 imUsername 时才创建指定用户
					specifiedUserName = profile.options.imUsername;
				}
				return _createImVisitor(specifiedUserName);
			});
		}
		return _createImVisitor();
	})
	.then(function(){
		// 如果不是 im channel 则跳过获取 token
		if(profile.deepStreamChannelEnable) return Promise.resolve();
		return apiHelper.getToken()
		.then(null, function(err){
			// 如果登录失败则重新创建用户
			// todo: 仅当user not found 时才重新创建访客
			if(profile.isUsernameFromCookie) return _createImVisitor().then(function(){
				return apiHelper.getToken();
			});
			throw err;
		});
	})
	// 获取 visitorId
	.then(function(){
		return apiHelper.getKefuVisitorId(profile.options.imUsername)
		.then(null, function(){
			// 获取 visitorId 失败：
			// im-channel 的做法是不理会
			// ds-channel 的做法是重新创建kefu访客
			if(!profile.deepStreamChannelEnable) return Promise.resolve();
			return _createKefuVisitor();
		});
	})
	.then(function(){
		chat.init();
	});
}
function _createImVisitor(specifiedUserName){
	return apiHelper.createImVisitor(specifiedUserName).then(function(resp){
		profile.options.imUsername = resp.userId;
		profile.options.imPassword = resp.userPassword;
		tools.cacheUsername();
	});
}
function _createKefuVisitor(){
	return apiHelper.createKefuVisitor({
		// username: specific uername
		channelId: profile.channelId,
		nickname: profile.visitorInfo.userNickname,
		trueName: profile.visitorInfo.trueName,
		qq: profile.visitorInfo.qq,
		email: profile.visitorInfo.email,
		phone: profile.visitorInfo.phone,
		companyName: profile.visitorInfo.companyName,
		description: profile.visitorInfo.description,
	})
	.then(function(entity){
		profile.visitorInfo = {
			kefuId: entity.userId,
			// todo: discard profile.options.imUsername
			imUsername: profile.options.imUsername = utils.getDataByPath(entity, "channel_users.0.im_id"),
			nickname: entity.nickname,
			trueName: entity.trueName,
			qq: entity.qq,
			phone: entity.phone,
		};
		tools.cacheUsername();
	});
}

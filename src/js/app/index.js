// 1. 管理布局
// 2. 管理初始化
// 3. 管理通信
// 4. 管理切换
require("es6-promise").polyfill();
require("@/common/polyfill");
require("./libs/modernizr");
require("./libs/sdk/webim.config");
require("underscore");

var utils = require("@/common/utils");
var chat = require("./pages/main/chat");
var body_template = require("raw-loader!../../template/body.html");
var main = require("./pages/main/init");
var functionView = require("./pages/q&a");
var commonConfig = require("@/common/config");
var apiHelper = require("./pages/main/apiHelper");
var _const = require("@/common/const");
var profile = require("@/app/tools/profile");
var handleConfig = commonConfig.handleConfig;
var extendMessageSender = require("./pages/main/chat/extendMessageSender");
var Transfer = require("@/common/transfer");
var eventCollector = require("./pages/main/eventCollector");
var channel = require("./pages/main/channel");


var selfWrapper = document.querySelector(".em-self-wrapper");
var widgetWapper = document.querySelector(".em-widget-wrapper");

load_html();
if(utils.isTop){
	commonConfig.h5_mode_init();
	initCrossOriginIframe();
}
else{
	chat_window_mode_init();
}
main.init();
if(utils.isMobile){
	// 添加移动端样式类
	utils.addClass(document.body, "em-mobile");
	utils.live(".contact-customer-service", "click", onContactClick, selfWrapper);
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
				main.initChatEntry();
			}

			// 访客端有进行中会话，停止了轮询，此时需要走一遍之前被跳过的初始化流程
			if(eventCollector.hasProcessingSession()){
				main.initChatEntry();
			}

			if(eventCollector.hasCtaInvite()){
				main.initChatEntry();
				eventCollector.hideCtaPrompt();
			}

			// 显示聊天窗口
			chat.show();
			functionView.show();
			break;
		case _const.EVENTS.CLOSE:
			chat.close();
			functionView.close();
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
		case _const.EVENTS.INIT_CONFIG:
			window.transfer.to = data.parentId;
			commonConfig.setConfig(data);
			profile.config = commonConfig.getConfig();
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

// 点击咨询客服
function onContactClick(e){
	utils.removeClass(widgetWapper, "hide");
	utils.addClass(selfWrapper, "hide");
	main.initChat();
	e.stopPropagation();
	return false;
}

function initCrossOriginIframe(){
	var iframe = document.getElementById("cross-origin-iframe");
	iframe.src = commonConfig.getConfig().domain + "__WEBIM_SLASH_KEY_PATH__/webim/transfer.html?v=__WEBIM_PLUGIN_VERSION__";
	utils.on(iframe, "load", function(){
		apiHelper.initApiTransfer();
		handleMsgData();
	});
}

// body.html 显示词语
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
		send_video: __("toolbar.send_video"),
		faq: __("common.faq"),
		consult_agent: __("common.consult_agent")
	}));

	chat.getDom();
}


// todo: rename this function
function handleMsgData(){
	var defaultStaticPath = __("config.language") === "zh-CN" ? "static" : "../static";
	// default value

	commonConfig.setConfig({
		staticPath: commonConfig.getConfig().staticPath || defaultStaticPath,
		offDutyWord: commonConfig.getConfig().offDutyWord || __("prompt.default_off_duty_word"),
		emgroup: commonConfig.getConfig().emgroup || "",
		timeScheduleId: commonConfig.getConfig().timeScheduleId || 0
	});

	if(_.isArray(commonConfig.getConfig().extMsg)){
		_.each(commonConfig.getConfig().extMsg, function(elem){
			extendMessageSender.push(elem);
		});
	}
	else if(_.isObject(commonConfig.getConfig().extMsg)){
		extendMessageSender.push(commonConfig.getConfig().extMsg);
	}

	// fake patch: 老版本配置的字符串需要decode
	if(commonConfig.getConfig().offDutyWord){
		try{
			commonConfig.getConfig().offDutyWord = decodeURIComponent(commonConfig.getConfig().offDutyWord);
		}
		catch(e){}
	}

	if(commonConfig.getConfig().emgroup){
		try{
			commonConfig.setConfig({
				emgroup: decodeURIComponent(commonConfig.getConfig().emgroup)
			});
		}
		catch(e){}
	}

	commonConfig.setConfig({
		user: commonConfig.getConfig().user || {},
		visitor: commonConfig.getConfig().visitor || {},
		channel: {},
		ui: {
			H5Title: {}
		},
		toolbar: {},
		chat: {}
	});

	profile.defaultAvatar = commonConfig.getConfig().staticPath + "/img/default_avatar.png";

	// 用于预览模式
	if(commonConfig.getConfig().previewObj){
		handleConfig(commonConfig.getConfig().previewObj);
		handleSettingIframeSize();
		main.initChat();
	}
	else if(commonConfig.getConfig().configId){
		apiHelper.getConfig(commonConfig.getConfig().configId).then(function(entity){
			commonConfig.setConfig({ tenantId: entity.tenantId });
			handleConfig(entity.configJson);
			handleSettingIframeSize();
			!utils.isMobile && main.initChat();

			Promise.all([
				apiHelper.getFaqOrSelfServiceStatus(commonConfig.getConfig().configId, "issue"),
				apiHelper.getFaqOrSelfServiceStatus(commonConfig.getConfig().configId, "self-service")
			])
			.then(function(resultStatus){
				// h5 模式 常见问题和自助服务开关都关闭时显示 chat 页面
				if(utils.isTop && !resultStatus[0] && !resultStatus[1]){
					utils.removeClass(widgetWapper, "hide");
					main.initChat();
				}
				else if(resultStatus[0] || resultStatus[1]){
					utils.addClass(document.body, "big-window");
					functionView.init({ faqStatus: resultStatus[0], selfServiceStatus: resultStatus[1] });
					handleSettingIframeSize({ width: "720px" });
				}

				// H5 模式有一个功能开关打开就显示，iframe 的形式不需要直接显示，当点击联系客服按钮的时候显示
				if(utils.isTop && (resultStatus[0] || resultStatus[1])){
					functionView.show();
				}
			});

			apiHelper.getTheme().then(function(themeName){
				var className = _const.themeMap[themeName];
				className && utils.addClass(document.body, className);
			});

		});
	}
	else{
		main.initChat();
	}
}


function handleSettingIframeSize(params){
	params = params || {};
	// 重新去设置iframe 的宽高
	transfer.send({
		event: _const.EVENTS.RESET_IFRAME,
		data: {
			dialogHeight: commonConfig.getConfig().dialogHeight,
			dialogWidth: params.width || commonConfig.getConfig().dialogWidth,
			dialogPosition: commonConfig.getConfig().dialogPosition
		}
	});
}

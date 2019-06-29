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
var body_template = require("../../template/body.html");
var main = require("./pages/main/init");
var functionView = require("./pages/q&a");
var commonConfig = require("@/common/config");
var apiHelper = require("@/app/common/apiHelper");
var _const = require("@/common/const");
var profile = require("@/app/tools/profile");
var handleConfig = commonConfig.handleConfig;
var doWechatAuth = require("@/app/common/wechat");
var transfer = require("@/app/common/transfer");
var eventListener = require("@/app/tools/eventListener");
var fromUserClick = false;

load_html();
if(utils.isTop){
	commonConfig.h5_mode_init();
	initCrossOriginIframe();
	widgetBoxShow();
}
else{
	main.chat_window_mode_init();
	transfer.listen(function(msg){
		var event = msg.event;
		var data = msg.data;
		switch(event){
		// 用户点击联系客服时收到
		case _const.EVENTS.SHOW:
			fromUserClick = true;
			widgetBoxShow();
			break;
		case _const.EVENTS.CLOSE:
			widgetBoxHide();
			break;
		case _const.EVENTS.INIT_CONFIG:
			transfer.to = data.parentId;
			commonConfig.setConfig(data);
			initCrossOriginIframe();
			break;
		default:
			break;
		}
	}, ["easemob"]);
}
main.init(setUserInfo);

// 监听点击咨询客服收到的通知
eventListener.add(_const.SYSTEM_EVENT.CONSULT_AGENT, main.initChat);

function widgetBoxShow(){
	utils.removeClass(document.querySelector(".em-widget-box"), "hide");
}
function widgetBoxHide(){
	utils.addClass(document.querySelector(".em-widget-box"), "hide");
}
function setUserInfo(targetUserInfo){
	if(targetUserInfo){
		// 游客
		if(targetUserInfo.userName){
			return Promise.resolve("user");
		}
		// 访客带 token，sina patch
		else if(commonConfig.getConfig().user.token){
			return Promise.resolve("userWithToken");
		}
		return new Promise(function(resolve){
			apiHelper.getPassword().then(function(password){
				commonConfig.setConfig({
					user: _.extend({}, commonConfig.getConfig().user, {
						password: password
					})
				});
				resolve("userWithPassword");
			}, function(err){
				console.error("username is not exist.");
				throw err;
			});
		});
	}
	else if(
		commonConfig.getConfig().user.username
		&& (
			commonConfig.getConfig().user.password
			|| commonConfig.getConfig().user.token
		)
	){
		if(commonConfig.getConfig().user.token){
			return Promise.resolve("userWithNameAndToken");
		}
		return Promise.resolve("userWidthNameAndPassword");
	}
	// 检测微信网页授权
	else if(commonConfig.getConfig().wechatAuth){
		return new Promise(function(resolve){
			doWechatAuth(function(entity){
				commonConfig.setConfig({
					user: _.extend({}, commonConfig.getConfig().user, {
						username: entity.userId,
						password: entity.userPassword
					})
				});
				resolve("wechatAuth");
			}, function(){
				createVisitor().then(function(){
					resolve("noWechatAuth");
				});
			});
		});
	}
	else if(commonConfig.getConfig().user.username){
		return new Promise(function(resolve){
			apiHelper.getPassword().then(function(password){
				commonConfig.setConfig({
					user: _.extend({}, commonConfig.getConfig().user, {
						password: password
					})
				});
				resolve("widthPassword");
			}, function(){
				if(profile.grayList.autoCreateAppointedVisitor){
					createVisitor(commonConfig.getConfig().user.username).then(function(){
						resolve("autoCreateAppointedVisitor");
					});
				}
				else{
					createVisitor().then(function(){
						resolve("noAutoCreateAppointedVisitor");
					});
				}
			});
		});
	}

	return createVisitor().then(function(){
		return Promise.resolve();
	});
}

function createVisitor(username){
	return apiHelper.createVisitor(username).then(function(entity){
		commonConfig.setConfig({
			user: _.extend({}, commonConfig.getConfig().user, {
				username: entity.userId,
				password: entity.userPassword
			})
		});
		return Promise.resolve();
	});
}

function initConfig(){
	apiHelper.getConfig(commonConfig.getConfig().configId)
	.then(function(entity){
		entity.configJson.tenantId = entity.tenantId;
		handleConfig(entity.configJson);
		handleSettingIframeSize();
		initRelevanceList();
	});
}

function initRelevanceList(){
	// 获取关联信息（targetChannel）
	var relevanceList;
	apiHelper.getRelevanceList()
	.then(function(_relevanceList){
		relevanceList = _relevanceList;
		return initFunctionStatus();
	}, function(err){
		main.initRelevanceError(err);
	})
	.then(function(results){
		handleCfgData(relevanceList, results);
	}, function(){
		handleCfgData(relevanceList || [], []);
	});
}

function initFunctionStatus(){
	if(commonConfig.getConfig().configId){
		return arguments.callee.cache = arguments.callee.cache || Promise.all([
			apiHelper.getFaqOrSelfServiceStatus("issue"),
			apiHelper.getFaqOrSelfServiceStatus("self-service")
		]);
	}
	return Promise.resolve([]);
}

// todo: rename this function
function handleCfgData(relevanceList, status){
	var defaultStaticPath = __("config.language") === "zh-CN" ? "static" : "../static";
	// default value

	var targetItem;
	var appKey = commonConfig.getConfig().appKey;
	var splited = appKey.split("#");
	var orgName = splited[0];
	var appName = splited[1];
	var toUser = commonConfig.getConfig().toUser || commonConfig.getConfig().to;

	// toUser 转为字符串， todo: move it to handle config
	typeof toUser === "number" && (toUser = toUser.toString());

	if(appKey && toUser){
		// appKey，imServiceNumber 都指定了
		targetItem = _.where(relevanceList, {
			orgName: orgName,
			appName: appName,
			imServiceNumber: toUser
		})[0];
	}

	// 未指定appKey, toUser时，或未找到符合条件的关联时，默认使用关联列表中的第一项
	if(!targetItem){
		targetItem = targetItem || relevanceList[0];
		console.log("mismatched channel, use default.");
	}

	commonConfig.setConfig({
		logo: commonConfig.getConfig().logo || { enabled: !!targetItem.tenantLogo, url: targetItem.tenantLogo },
		toUser: targetItem.imServiceNumber,
		orgName: targetItem.orgName,
		appName: targetItem.appName,
		channelId: targetItem.channelId,
		appKey: targetItem.orgName + "#" + targetItem.appName,
		restServer: commonConfig.getConfig().restServer || targetItem.restDomain,
		xmppServer: commonConfig.getConfig().xmppServer || targetItem.xmppServer,
		staticPath: commonConfig.getConfig().staticPath || defaultStaticPath,
		offDutyWord: commonConfig.getConfig().offDutyWord || __("prompt.default_off_duty_word"),
		emgroup: commonConfig.getConfig().emgroup || "",
		timeScheduleId: commonConfig.getConfig().timeScheduleId || 0,

		user: commonConfig.getConfig().user || {},
		visitor: commonConfig.getConfig().visitor || {},
		channel: commonConfig.getConfig().channel || {},
		ui: commonConfig.getConfig().ui || {
			H5Title: {}
		},
		toolbar: commonConfig.getConfig().toolbar || {},
		chat: commonConfig.getConfig().chat || {}
	});

	// fake patch: 老版本配置的字符串需要decode
	if(commonConfig.getConfig().offDutyWord){
		try{
			commonConfig.setConfig({
				offDutyWord: decodeURIComponent(commonConfig.getConfig().offDutyWord)
			});
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

	// 获取企业头像和名称
	// todo: rename to tenantName
	profile.tenantAvatar = utils.getAvatarsFullPath(targetItem.tenantAvatar, commonConfig.getConfig().domain);
	profile.defaultAgentName = targetItem.tenantName;
	profile.defaultAvatar = commonConfig.getConfig().staticPath + "/img/default_avatar.png";

	renderUI(status);
}
function renderUI(resultStatus){
	// 添加移动端样式类
	if(utils.isMobile){
		utils.addClass(document.body, "em-mobile");
	}
	// 用于预览模式
	if(commonConfig.getConfig().previewObj){
		handleConfig(commonConfig.getConfig().previewObj);
		handleSettingIframeSize();
		main.initChat();
	}
	else if(commonConfig.getConfig().configId){
		if(!utils.isMobile){
			utils.addClass(document.body, "big-window");
		}
		// 全部渲染
		if(!utils.isMobile && (resultStatus[0] || resultStatus[1])){
			main.initChat();
			functionView.init({
				resultStatus: resultStatus
			});
			handleSettingIframeSize({ width: "720px" });
		}
		// 常见问题和自助服务开关都关闭时
		else if(!resultStatus[0] && !resultStatus[1]){
			main.initChat();
			!utils.isMobile && utils.removeClass(document.body, "big-window");
		}
		else{
			functionView.init({
				resultStatus: resultStatus
			});
			main.close();
		}
	}
	else{
		main.initChat();
		!fromUserClick && main.close();
	}

	apiHelper.getTheme().then(function(themeName){
		var className = _const.themeMap[themeName];
		className && utils.addClass(document.body, className);
	});
}


function handleSettingIframeSize(params){
	// 把 iframe 里收到 _const.EVENTS.RESET_IFRAME 事件时设置 config 参数移到这里了
	if(params){
		commonConfig.setConfig(params);
	}
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

function initCrossOriginIframe(){
	var iframe = document.getElementById("cross-origin-iframe");
	iframe.src = commonConfig.getConfig().domain + "__WEBIM_SLASH_KEY_PATH__/webim/transfer.html?v=__WEBIM_PLUGIN_VERSION__";
	utils.on(iframe, "load", function(){
		apiHelper.initApiTransfer();
		// 有 configId 需要先去获取 config 信息
		commonConfig.getConfig().configId ? initConfig() : initRelevanceList();
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

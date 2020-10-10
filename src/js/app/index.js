// 1. 管理布局
// 2. 管理初始化
// 3. 管理通信
// 4. 管理切换
require("es6-promise").polyfill();
require("@/common/polyfill");
require("./libs/modernizr");
require("./libs/sdk/webim.config");
require("underscore");
require("jquery");

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
var getToHost = require("@/app/common/transfer");
var eventListener = require("@/app/tools/eventListener");
var fromUserClick = false;
var Tab = require("@/common/uikit/tab");

load_html();
if(utils.isTop){
	commonConfig.h5_mode_init();
	initCrossOriginIframe();
	widgetBoxShow();
}
else{
	main.chat_window_mode_init();
	getToHost.listen(function(msg){
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
			getToHost.to = data.parentId;
			commonConfig.setConfig(data);
			initCrossOriginIframe();
			break;
		default:
			break;
		}
	}, ["down2Im"]);
}
main.init(setUserInfo);

// 监听点击咨询客服收到的通知
eventListener.add(_const.SYSTEM_EVENT.CONSULT_AGENT, function(){
	$(".em-self-wrapper").addClass("hide");
	main.initChat();
});

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
		entity.configJson.configName = entity.configName;
		handleConfig(entity.configJson);
		handleSettingIframeSize();
		initRelevanceList();
		initInvite({ themeName: entity.configJson.ui.themeName });
	});
}

function initInvite(opt){
	apiHelper.getInviteInfo(commonConfig.getConfig().tenantId, commonConfig.getConfig().configId)
	.then(function(res){
		if(res.status){
			res.themeName = opt.themeName;
			getToHost.send({
				event: _const.EVENTS.INVITATION_INIT,
				data: res
			});
		}
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
			apiHelper.getFaqOrSelfServiceStatus("self-service"),
			apiHelper.getIframeEnable(),
			apiHelper.getIframeSetting(),
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
		toolbar: commonConfig.getConfig().toolbar || {
			sendAttachment: true,
			sendSmallVideo:commonConfig.getConfig().configId ? false : true,
		},
		chat: commonConfig.getConfig().chat || {},
		options: commonConfig.getConfig().options || {
			showEnquiryButtonInAllTime: "false", //是否在所有时间段显示主动评价按钮,默认不会传该值，默认值为"false"，即只在坐席接待时显示主动评价按钮
			closeSessionWhenCloseWindow: "false" // 是否在关闭聊窗的时候关闭会话，默认不会传该值，默认值为"false"
		}
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

	var commonIssueEnable;
	var selfServiceEnable;
	var iframeEnable;
	// 用于预览模式
	if(commonConfig.getConfig().previewObj){
		handleSettingIframeSize();
		allDisable();	// 相当于全关
	}
	// configId
	else if(commonConfig.getConfig().configId){
		commonIssueEnable = resultStatus[0];
		selfServiceEnable = resultStatus[1];
		iframeEnable = resultStatus[2];
		// pc 端判断三个开关
		if(!utils.isMobile){
			// 任意一个打开
			if(commonIssueEnable || selfServiceEnable || iframeEnable){
				utils.addClass(document.body, "big-window");
				// iframe 没有 url 时，初始化 tab 条件满足，但是没有内容！
				if(!pcAnyEnable()){
					utils.removeClass(document.body, "big-window");
				}
				// 初始化成功 - 1 - im.html
				else if(utils.isTop){
					utils.addClass(document.body, "big-window-h5");
				}
				// 初始化成功 - 2 - demo.html
				else{
					handleSettingIframeSize({
						// iframe 常见问题和自主服务，固定宽度 360px
						width: (Math.floor(commonConfig.getConfig().dialogWidth.slice(0, -2)) + Math.floor(360)) + "px"
					});
				}
			}
			// 全关
			else{
				utils.removeClass(document.body, "big-window");
				allDisable();
			}
		}
		// 移动端不判断 iframe 开关
		else{
			// 全关
			if(!commonIssueEnable && !selfServiceEnable){
				allDisable();
			}
			// 任意一个打开（包括 iframeEnable）
			else{
				mobileAnyEnable();
			}
		}
	}
	// tenantId
	else{
		allDisable();	// 相当于全关
		if(!fromUserClick){
			main.close();
		}
	}

	apiHelper.getTheme().then(function(themeName){
		var color;
		var className;
		if(themeName.indexOf("theme_custom") > -1){ 
			var arr = themeName.split("theme_custom");
			color = arr[1];
			className = "theme_custom";
		}
		else{
			className = _const.themeMap[themeName];
		}
		className = className || "theme-1";
		className && utils.addClass(document.body, className); 

		// 自定义主题色
		
		if(themeName.indexOf("theme_custom") > -1){
			var fgColor = $(".theme_custom .fg-hover-color").css("color");
			$(".theme_custom").find(".fg-color").css("cssText","color: " + color + " !important"); 
			$(".theme_custom").find(".bg-color").css("cssText","background-color: " + color + " !important"); 
			$(".theme_custom .fg-hover-color").hover(function(){
			　　　$(this).css("cssText","color: " + color + " !important"); 
			},function(){
				$(this).css("cssText","color: " + fgColor + " !important");
			})
			// $(".theme_custom .bg-hover-color").hover(function(){
			// 	　　$(this).css("cssText","background-color: " + color + " !important"); 
			// },function(){
			// 		$(this).css("cssText","color: " + color + " !important");
			// })

			// $(".theme_custom").find(".border-color").css("cssText","border-color: " + color + " !important");
			// $(".theme_custom").find(".bg-border-bottom-color").css("cssText","border-bottom-color: " + color + " !important");
			
		} 
		 
	});

	function allDisable(){
		// console.log("全关");
		$(".em-self-wrapper").addClass("hide");
		main.initChat();
	}
	function mobileAnyEnable(){
		// console.log("移动任一");
		main.close();
		return initSidePage(resultStatus);
	}
	function pcAnyEnable(){
		// console.log("电脑任一");
		main.initChat();
		return initSidePage(resultStatus);
	}
	function initSidePage(resultStatus){
		var commonIssueEnable = resultStatus[0];
		var selfServiceEnable = resultStatus[1];
		var iframeEnable = resultStatus[2];
		var iframeSettings = resultStatus[3][0];	// 只取第一个
		var side_page = functionView.init({
			resultStatus: resultStatus
		});
		var tab = new Tab();
		if(commonIssueEnable || selfServiceEnable){
			var faqInsArr = [];
			if(selfServiceEnable){
				faqInsArr.push(side_page.ss);
				faqTxt = "自助服务";
			}
			if(commonIssueEnable){
				faqInsArr.push(side_page.faq);
				faqTxt = "常见问题";
			}
			if(utils.isMobile){
				faqInsArr.push(side_page.contact);
			}
			tab.addTab({
				sign: "faq",
				text: faqTxt,
				ins: faqInsArr,
			});
		}
		// iframe 开关开启并且信息完备时
		if(!utils.isMobile && iframeEnable && iframeSettings && iframeSettings.url){
			tab.addTab({
				sign: "iframe",
				text: iframeSettings.name,
				ins: [side_page.iframe],
			});
		}
		// 优先第一个
		if(tab.selectFirstTab()){
			$("#em-kefu-webim-self").append(tab.$el);
			return true;
		}
		return false;
	}
}


function handleSettingIframeSize(params){
	// 把 iframe 里收到 _const.EVENTS.RESET_IFRAME 事件时设置 config 参数移到这里了
	if(params){
		commonConfig.setConfig(params);
	}
	params = params || {};
	// 重新去设置iframe 的宽高
	getToHost.send({
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
	}));

	chat.getDom();
	
}


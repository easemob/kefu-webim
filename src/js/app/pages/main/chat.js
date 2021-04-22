var WebIM = require("easemob-kefu-webim");
var utils = require("@/common/utils");
var _const = require("@/common/const");
var commonConfig = require("@/common/config");
var uikit = require("./uikit");
var apiHelper = require("./apis");
var eventListener = require("@/app/tools/eventListener");
var channel = require("./channel");
var profile = require("@/app/tools/profile");
var satisfaction = require("./satisfaction");
var imgView = require("./imgview");
var NoteIframe = require("./noteIframe");
var initPasteImage = require("./paste");
var videoChat = require("./videoChat");
var guessInfo = require("./guess/guessInfo");

var TagSelector = require("./chat/tagSelector");
var initAgentInputStatePoller = require("./chat/initAgentInputStatePoller");
var initAgentStatusPoller = require("./chat/initAgentStatusPoller");
var initVisitorStatusPoller = require("./chat/initVisitorStatusPoller");
var initQueuingNumberPoller = require("./chat/initQueuingNumberPoller");
var initTransferToKefuButton = require("./chat/initTransferToKefuButton");
var initSessionList = require("./chat/initSessionList");
var initGetGreetings = require("./chat/initGetGreetings");
var initAgentNicknameUpdate = require("./chat/initAgentNicknameUpdate");
var initInputTopButton = require("./chat/initInputTopButton");
var initInputH5Button = require("./chat/initInputH5Button");
var emojiPanel = require("./chat/emojiPanel");
var extendMessageSender = require("./chat/extendMessageSender");
var TenantInfo = require("@/app/pages/main/tenantInfo/index");
var getToHost = require("@/app/common/transfer");
var tenantInfo;
var tagSelector = new TagSelector();

var isMessageChannelReady;
var config;
var inputBoxPosition = "down";

var topBar;
var editorView;
var doms;
var noteIframe;

var _reCreateImUser = _.once(function(){
	console.warn("user not found in current appKey, attempt to recreate user.");
	apiHelper.createVisitor().then(function(entity){
		var cacheKeyName = (config.configId || (config.to + config.tenantId + config.emgroup));
		commonConfig.setConfig({
			user: _.extend(
				{},
				commonConfig.getConfig().user,
				{ username: entity.userId, password: entity.userPassword }
			)
		});
		if(entity.userPassword === ""){
			profile.imRestDown = true;
		}

		_initSession();

		if(utils.isTop){
			utils.set("root" + (config.configId || (config.tenantId + config.emgroup)), entity.userId);
		}
		else{
			getToHost.send({
				event: _const.EVENTS.CACHEUSER,
				data: {
					key: cacheKeyName,
					value: entity.userId,
				}
			});
		}
	});
});

module.exports = {
	init: _init,
	close: _close,
	show: _show,
	getDom: _getDom,
};

function _initSystemEventListener(){
	eventListener.add([
		_const.SYSTEM_EVENT.SESSION_OPENED,
		_const.SYSTEM_EVENT.SESSION_RESTORED,
	], function(officialAccount){
		var sessionId = officialAccount.sessionId;
		var isSessionOpen = officialAccount.isSessionOpen;
		if(isSessionOpen && sessionId){
			apiHelper.reportVisitorAttributes(sessionId);
		}
	});
	// 禁止所有容器中 robotList 消息可操作
	eventListener.add([
		_const.SYSTEM_EVENT.SESSION_CLOSED,
	], function(officialAccount){
		// 所有的 list 子类消息
		var allListBtn1 = document.querySelectorAll(".msgtype-robotList .em-btn-list button");
		var allListBtn2 = document.querySelectorAll(".msgtype-txt .em-btn-list button");
		var allListBtn3 = document.querySelectorAll(".msgtype-img .em-btn-list button");
		var all = _.toArray(allListBtn1)
		.concat(_.toArray(allListBtn2))
		.concat(_.toArray(allListBtn3));
		_.each(all, function(robotBtn){
			utils.addClass(robotBtn, "disabled");
		});
	});
}

function _initUI(){
	((utils.isTop && !utils.isMobile) || !config.minimum) && utils.removeClass(doms.imChat, "hide");

	// 设置联系客服按钮文字
	document.querySelector(".em-widget-pop-bar").innerText = config.buttonText;

	// 判断灰度 关闭会话框按钮
	profile.grayList.visitorLeave
		&& !utils.isTop
		&& utils.removeClass(doms.closeBtn, "hide");

	// 最小化按钮
	config.minimum
		&& !utils.isTop
		&& utils.removeClass(doms.minifyBtn, "hide");

	// h5title设置
	if(config.ui.H5Title.enabled){
		document.title = config.ui.H5Title.content;
	}

	// 静音按钮
	window.HTMLAudioElement
		&& !utils.isMobile
		&& config.soundReminder
		&& utils.removeClass(doms.audioBtn, "hide");

	// 输入框位置开关
	utils.isMobile
		&& !config.hideKeyboard
		&& utils.removeClass(doms.switchKeyboardBtn, "hide");
}

function _initToolbar(){
	// 低版本浏览器不支持上传文件/图片
	if(WebIM.utils.isCanUploadFileAsync){
		utils.removeClass(doms.sendImgBtn, "hide");
		utils.removeClass(doms.sendVideoBtn, "hide");
	}
	// 小视频按钮
	if(config.sendSmallVideo){
		utils.removeClass(doms.sendVideoBtn, "hide");
	}
	else if(config.toolbar.sendSmallVideo){
		utils.removeClass(doms.sendVideoBtn, "hide");
	}
	else{
		utils.addClass(doms.sendVideoBtn, "hide");
	}
	// 上传附件按钮
	if(WebIM.utils.isCanUploadFileAsync && config.toolbar.sendAttachment){
		utils.removeClass(doms.sendFileBtn, "hide");
	}

	// 留言按钮
	config.ticket && utils.removeClass(doms.noteBtn, "hide");

	// 满意度评价按钮
	if(config.satisfaction && config.options.showEnquiryButtonInAllTime == "true"){
		utils.removeClass(doms.satisfaction, "hide");
	}
}

function _initSoundReminder(){
	if(!window.HTMLAudioElement || utils.isMobile || !config.soundReminder) return;

	var audioDom = document.createElement("audio");
	var slienceSwitch = document.querySelector(".em-widget-header .btn-audio");
	var isSlienceEnable = false;
	var play = _.throttle(function(){
		audioDom.play();
	}, 3000, { trailing: false });

	audioDom.src = config.staticPath + "/mp3/msg.m4a";

	// 音频按钮静音
	utils.on(slienceSwitch, "click", function(){
		isSlienceEnable = !isSlienceEnable;
		utils.toggleClass(slienceSwitch, "icon-slience", isSlienceEnable);
		utils.toggleClass(slienceSwitch, "icon-bell", !isSlienceEnable);
	});

	eventListener.add(_const.SYSTEM_EVENT.MESSAGE_PROMPT, function(){
		!isSlienceEnable && play();
	});
}

function _setLogo(){
	if(!config.logo.enabled) return;
	var logoImgWapper = document.querySelector(".em-widget-tenant-logo");
	var logoImg = logoImgWapper.querySelector("img");

	utils.removeClass(logoImgWapper, "hide");
	logoImg.src = config.logo.url;
}

function _setNotice(){
	var noticeContent = document.querySelector(".em-widget-tip .content");
	var noticeCloseBtn = document.querySelector(".em-widget-tip .tip-close");
	apiHelper.getNotice().then(function(notice){
		// test
		// notice.content = [
		// 	{
		// 		name: "自考介绍",
		// 		sub_button: [
		// 			{
		// 				type: "view",
		// 				name: "搜索2666",
		// 				url: "http://www.soso.com/"
		// 			}
		// 		]
		// 	},
		// 	{
		// 		type: "media_id",
		// 		name: "报考指南",
		// 		media_id: "75cffa4b-e462-40e8-a517-0ff807db29a6"
		// 	},
		// 	{
		// 		name: "课程试听",
		// 		sub_button: [
		// 			{
		// 				type: "media_id",
		// 				name: "111",
		// 				media_id: "75cffa4b-e462-40e8-a517-0ff807db29a6"
		// 			},
		// 			{
		// 				type: "media_id",
		// 				name: "香格里拉",
		// 				media_id: "4150c891-9917-4482-909c-ab7c9954110a"
		// 			}
		// 		]
		// 	}
		// ];


		var slogan = notice.content;
		if(!notice.enabled) return;

		// 显示信息栏
		utils.addClass(doms.imChat, "has-tip");

		// 新配置就走新 tenantInfo
		if(config.isWebChannelConfig){
			if(typeof slogan == "string"){
				renderSlogan();
			}
			else{
				tenantInfo = new TenantInfo();
			}
		}
		else{
			renderSlogan();
		}

		function renderSlogan(){
			// 设置信息栏内容
			noticeContent.innerHTML = WebIM.utils.parseLink(slogan);
			// 隐藏信息栏按钮
			utils.on(noticeCloseBtn, utils.click, function(){
				// 隐藏信息栏
				utils.removeClass(doms.imChat, "has-tip");
			});
		}
	});
}

function _setOffline(){
	switch(config.offDutyType){
	case "none":
		// 下班禁止留言、禁止接入会话
		var modelDom = utils.createElementFromHTML("<div class=\"em-model\"></div>");
		var offDutyPromptDom = utils.createElementFromHTML([
			"<div class=\"em-dialog off-duty-prompt\">",
			"<div class=\"bg-color header\">" + __("common.tip") + "</div>",
			"<div class=\"body\">",
			"<p class=\"content\">" + config.offDutyWord + "</p>",
			"</div>",
			"</div>"
		].join(""));
		doms.imChat.appendChild(modelDom);
		doms.imChat.appendChild(offDutyPromptDom);
		doms.sendBtn.innerHTML = __("chat.send");
		break;
	default:
		// 只允许留言此时无法关闭留言页面
		noteIframe.open({ hideCloseBtn: true });
		break;
	}

	getToHost.send({ event: _const.EVENTS.ON_OFFDUTY });
}

function _scrollToBottom(){
	var scrollToBottom = utils.getDataByPath(profile, "currentOfficialAccount.messageView.scrollToBottom");
	// 有可能在 messageView 未初始化时调用
	// todo: remove this detect
	typeof scrollToBottom === "function" && scrollToBottom();
}

function _checkGradeType(){
	var riskWarning = document.querySelector(".em-widget-risk-warning");
	apiHelper.getGradeType().then(function(data){
		var entity = data.entity;
		var grade = entity.grade;

		var defaultAvatar = commonConfig.getConfig().staticPath + "/img/default_avatar.png";
		var avatar = entity.avatar;
		var topBar = document.querySelector(".em-widget-header");
		$agentFace = topBar.querySelector(".em-agent-face");
		if(avatar) { 
			$agentFace.src = avatar;
		}else{
			$agentFace.src = defaultAvatar;
		}
		utils.removeClass($agentFace, "hide");

		if(grade == "TRIAL"){
			riskWarning.style.display = "block";
			utils.addClass(doms.imChat, "has-risk-tip");
		}
		else{
			riskWarning.style.display = "none";
			utils.removeClass(doms.imChat, "has-risk-tip");
		}
	});
}

function _initAutoGrow(){
	var originHeight = doms.textInput.clientHeight || 34;

	// 键盘上下切换按钮
	utils.on(doms.switchKeyboardBtn, "click", function(){
		var status = utils.hasClass(this, "icon-keyboard-down");
		var height = doms.editorView.getBoundingClientRect().height;
		inputBoxPosition = status ? "down" : "up";

		utils.toggleClass(this, "icon-keyboard-up", status);
		utils.toggleClass(this, "icon-keyboard-down", !status);
		emojiPanel.move(inputBoxPosition, height);

		switch(inputBoxPosition){
		case "up":
			doms.editorView.style.bottom = "auto";
			doms.editorView.style.zIndex = "3";
			doms.editorView.style.top = "0";
			doms.chatWrapper.style.bottom = "0";
			doms.queuingNumberStatus.style.top = height + "px";
			doms.editorView.style.paddingBottom = "0";
			break;
		case "down":
			doms.editorView.style.bottom = "0";
			doms.editorView.style.zIndex = "3";
			doms.editorView.style.top = "auto";
			doms.chatWrapper.style.bottom = height + "px";
			doms.queuingNumberStatus.style.top = "-26px";
			doms.editorView.style.paddingBottom = "max(3px,env(safe-area-inset-bottom))";
			_scrollToBottom();
			break;
		default:
			throw new Error("unexpected inputBoxPosition.");
		}
	});

	utils.on(doms.textInput, "input change", update);

	// todo: 高度不改变时，不更新dom
	function update(){
		var height = this.value ? this.scrollHeight : originHeight;
		this.style.height = height + "px";
		this.scrollTop = 9999;
		callback();
	}

	function callback(){
		var height = doms.editorView.getBoundingClientRect().height || 76;
		if(inputBoxPosition === "up"){
			doms.queuingNumberStatus.style.top = height + "px";
		}
		else{
			doms.chatWrapper.style.bottom = height + "px";
		}
		emojiPanel.move(inputBoxPosition, height);
		
		_scrollToBottom();
	}
}

function _initOfficialAccount(){
	return new Promise(function(resolve, reject){
		apiHelper.getOfficalAccounts().then(function(officialAccountList){
			_.each(officialAccountList, channel.attemptToAppendOfficialAccount);

			if(!profile.ctaEnable){
				profile.currentOfficialAccount = profile.systemOfficialAccount;
				profile.systemOfficialAccount.messageView.show();
			}

			eventListener.excuteCallbacks(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_LIST_GOT, []);

			resolve();
		}, function(err){
			// 未创建会话时初始化默认服务号
			if(err === _const.ERROR_MSG.VISITOR_DOES_NOT_EXIST){
				// init default system message view
				channel.attemptToAppendOfficialAccount({
					type: "SYSTEM",
					official_account_id: "default",
					img: null
				});

				profile.currentOfficialAccount = profile.systemOfficialAccount;
				profile.systemOfficialAccount.messageView.show();

				eventListener.excuteCallbacks(_const.SYSTEM_EVENT.SESSION_NOT_CREATED, [profile.systemOfficialAccount]);

				resolve();
			}
			else{
				reject(err);
			}
		});
	});
}

function _bindEvents(){
	if(!utils.isTop){
		// 关闭会话框按钮
		utils.on(doms.closeBtn, "click", function(){
			// 调用关闭会话框接口记录访客离开
			var officialAccount = profile.currentOfficialAccount;
			var sessionId = officialAccount.sessionId;

			// 查询会话是否已经评价，评价了就不弹出评价邀请框了
			apiHelper.getSessionEnquires(sessionId)
			.then(function(res){
				if(!res.length){
					// 弹出评价邀请框
					satisfaction.show(null, sessionId, "system");
				}
				else{
					// 取消轮询接口
					eventListener.trigger(_const.SYSTEM_EVENT.CHAT_CLOSED);
					sessionId && apiHelper.closeChatDialog({ serviceSessionId: sessionId });
					getToHost.send({ event: _const.EVENTS.CLOSE });
				}
			});

			// 关闭并且结束会话 
			var agentType = officialAccount.agentType;
			var isRobotAgent = agentType === _const.AGENT_ROLE.ROBOT;
			// 仅机器人接待时关闭会话
			if(isRobotAgent && officialAccount.isSessionOpen && profile.grayList.visitorLeave && config.options.closeSessionWhenCloseWindow == "true"){
				sessionId && apiHelper.visitorCloseSession({serviceSessionId: sessionId});
			}
			
		});

		// 最小化按钮
		utils.on(doms.minifyBtn, "click", function(){
			getToHost.send({ event: _const.EVENTS.CLOSE });
		});

		utils.on(document, "mouseover", function(){
			getToHost.send({ event: _const.EVENTS.RECOVERY });
		});
	}

	utils.on(doms.chatWrapper, "click", function(){
		doms.textInput.blur();
		// toolbar-mobile 隐藏
		if(utils.isMobile && !utils.hasClass(doms.toolBar, "hide")){
			utils.addClass(doms.toolBar, "hide");
			var height = doms.editorView.getBoundingClientRect().height;
			if(inputBoxPosition === "up"){
				doms.chatWrapper.style.bottom = "0";
				doms.queuingNumberStatus.style.top = height + "px";
			}else{
				doms.chatWrapper.style.bottom = height + "px";

			}
			emojiPanel.move(inputBoxPosition, height);
		}
	});
	utils.on(doms.chatWrapper, "touchmove", function(){
		// toolbar-mobile 隐藏
		if(utils.isMobile && !utils.hasClass(doms.toolBar, "hide")){
			utils.addClass(doms.toolBar, "hide");
			var height = doms.editorView.getBoundingClientRect().height; 
			if(inputBoxPosition === "up"){
				doms.chatWrapper.style.bottom = "0";
				doms.queuingNumberStatus.style.top = height + "px";
			}else{
				doms.chatWrapper.style.bottom = height + "px";
			}
			emojiPanel.move(inputBoxPosition, height);
		}
	});

	utils.live("img.em-widget-imgview", "click", function(){
		var imgSrc = this.getAttribute("src");
		imgView.show(imgSrc);
	});

	if(config.dragenable && !utils.isTop && !utils.isMobile){

		doms.dragBar.style.cursor = "move";

		utils.on(doms.dragBar, "mousedown", function(ev){
			var e = window.event || ev;
			doms.textInput.blur(); // ie a  ie...
			getToHost.send({
				event: _const.EVENTS.DRAGREADY,
				data: {
					x: e.clientX,
					y: e.clientY
				}
			});
			return false;
		}, false);
	}

	if(utils.isMobile){
		// 全屏播放视频
		utils.live("div.icon-play-box", "click", function(){
			var url = this.previousSibling.dataset.url;
			utils.removeClass(doms.videoPlayContainer, "hide");
			var html = "<video controls autoplay x5-video-player-fullscreen='false' x5-video-player-type='h5' x5-playsinline='true' data-url=\"" + url + " \" src=\"" + url + " \">"
				+ "<source  src=\"" + url + " \" type=\"video/mp4\"></source>"  
				+ "<source  src=\"" + url + " \" type=\"video/webm\"></source>"
				+ "<source  src=\"" + url + " \" type=\"video/ogg\"></source>"
				+ "</video>";
			
			doms.videoPlayBox.appendChild(utils.createElementFromHTML(html));
		});
		// 退出视频全屏
		utils.on(doms.videoBoxClose, "click", function(){
			utils.addClass(doms.videoPlayContainer, "hide");
			doms.videoPlayBox.innerHTML = '';
		})
	}
	

	// resend
	utils.live("div.em-widget-msg-status", "click", function(){
		var id = this.getAttribute("id").slice(0, -"_failed".length);
		var type = this.getAttribute("data-type");

		channel.reSend(type, id);
		utils.addClass(this, "hide");
		utils.removeClass(document.getElementById(id + "_loading"), "hide");
	});

	utils.live("button.js_robotTransferBtn", "click", function(e){
		var id = this.getAttribute("data-id");
		var ssid = this.getAttribute("data-sessionid");
		var transferToHumanId = this.getAttribute("data-transferToHumanId");
		// 只能点击一次
		if(!this.clicked){
			this.clicked = true;
			if(!utils.hasClass(e.target, "disabled")){
				channel.sendTransferToKf(id, ssid, transferToHumanId);
			}
		}
	});

	utils.live("button.js-transfer-to-ticket", "click", function(){
		var officialAccount = profile.currentOfficialAccount;
		if(!officialAccount){
			return;
		}
		var isSessionOpen = officialAccount.isSessionOpen;
		var sessionId = officialAccount.sessionId;
		isSessionOpen && apiHelper.closeServiceSession(sessionId);
		noteIframe.open({
			preData: {
				name: config.visitor.trueName,
				phone: config.visitor.phone,
				mail: config.visitor.email,
			}
		});
	});

	// 机器人列表
	utils.live("button.js_robotbtn", "click", function(e){
		if(!utils.hasClass(e.target, "disabled")){
			channel.sendText(this.innerText, {
				ext: {
					msgtype: {
						choice: {
							menuid: this.getAttribute("data-id")
						}
					}
				}
			});
		}
	});

	// 机器人关联规则列表
	utils.live("button.js_robotRelateListbtn", "click", function(e){
		var menuData;
		if(!utils.hasClass(e.target, "disabled")){
			menuData = {
				ruleId: this.getAttribute("data-ruleId"),
				answerId: this.getAttribute("data-answerId"),
				relatedRuleId: this.getAttribute("data-relatedRuleId")
			};
			channel.sendText(this.innerText, {
				ext: {
					msgtype: {
						choice: {
							relatedRuleClickActionData: JSON.stringify(menuData)
						}
					}
				}
			});
		}
	});

	// 根据菜单项选择指定的技能组
	utils.live("button.js_skillgroupbtn", "click", function(){
		channel.sendText(this.innerText, {
			ext: {
				weichat: {
					queueName: this.getAttribute("data-queue-name")
				}
			}
		});
	});

	// 转人工————根据询前引导菜单选择指定的一项
	utils.live("button.js_transferManualbtn", "click", function(){
		if(utils.hasClass(this, "disabled")){
			// 禁止发送
		}
		else if(this.getAttribute("data-queue-type") == "txt"){
			channel.sendText(this.innerText, {
				ext: {
					msgtype: {
						mode: "transferManualGuide",
						choice: {
							menuid: this.getAttribute("data-id"),
							queueId: this.getAttribute("data-queue-id"),
							queueType: "txt"
						}
					}
				}
			});
		}
		else if(this.getAttribute("data-queue-type") == "video"){
			channel.sendText(this.innerText, {
				ext: {
					msgtype: {
						mode: "transferManualGuide",
						choice: {
							menuid: this.getAttribute("data-id"),
							queueId: this.getAttribute("data-queue-id"),
							queueType: "video"
						}
					}
				}
			});
		}
		else if(this.getAttribute("data-queue-type") == "transfer"){
			noteIframe.open();
		}
		else{

		}


	});
	// 入口指定————询前引导
	utils.live("button.js_transferManualEntrybtn", "click", function(){
		if(utils.hasClass(this, "disabled")){
			// 禁止发送
		}
		else if(this.getAttribute("data-queue-type") == "txt"){
			channel.sendText(this.innerText, {
				ext: {
					weichat: {
						queueName: this.getAttribute("data-queue-name")
					}
				}
			});
		}
		else if(this.getAttribute("data-queue-type") == "video"){
			doms.videoInviteButton.click();
		}
		else if(this.getAttribute("data-queue-type") == "transfer"){
			noteIframe.open();
		}
		else{

		}

	});


	// 满意度评价
	utils.live("button.js_satisfybtn", "click", function(){
		var serviceSessionId = this.getAttribute("data-servicesessionid");
		var inviteId = this.getAttribute("data-inviteid");
		satisfaction.show(inviteId, serviceSessionId, "agent");
	});

	// 解决
	utils.live("a.statisfyYes", "click", function(){
		var satisfactionCommentKey = this.getAttribute("data-satisfactionCommentInfo");
		var robotAgentId = this.getAttribute("data-agentId");
		apiHelper.getStatisfyYes(robotAgentId, satisfactionCommentKey).then(function(data){
			uikit.tip("谢谢");
		}, function(err){
			if(err.errorCode === "KEFU_ROBOT_INTEGRATION_0207"){
				uikit.tip("已评价");
			}
		});
	});

	// 未解决
	utils.live("a.statisfyNo", "click", function(){
		var satisfactionCommentKey = this.getAttribute("data-satisfactionCommentInfo");
		var robotAgentId = this.getAttribute("data-agentId");

		apiHelper.getSatisfactionCommentTags(robotAgentId, satisfactionCommentKey)
		.then(function(dat){
			if(dat.length > 0){
				// tagSelector = new TagSelector(dat, robotAgentId, satisfactionCommentKey);
				tagSelector.show(dat, robotAgentId, satisfactionCommentKey);
			}
			else{
				apiHelper.confirmSatisfaction(robotAgentId, satisfactionCommentKey)
				.then(function(){
					uikit.tip("谢谢");
				}, function(err){
					if(err.errorCode === "KEFU_ROBOT_INTEGRATION_0207"){
						uikit.tip("已评价");
					}
				});
			}
		});
	});

	utils.live("#em-article-close .icon-back", "click", function(){
		var articleContainer = document.getElementById("em-article-container");
		var iframe = articleContainer.querySelector("iframe");
		iframe && utils.removeDom(iframe);
		articleContainer.style.display = "none";
		doms.editorView.style.display = "block";
		tenantInfo && tenantInfo.show();
	});

	// 交易风险提醒
	utils.live("#em-kefu-webim-chat .em-widget-risk-warning .icon-close", "click", function(){
		var riskWarning = document.querySelector(".em-widget-risk-warning");
		riskWarning.style.display = "none";
		utils.removeClass(doms.imChat, "has-risk-tip");
	});
	// 提示有新消息
	eventListener.add(_const.SYSTEM_EVENT.MESSAGE_APPENDED, function(oa, msg){
		utils.addClass(document.body.querySelector("#em-article-close .back-chat"), "hide");
		utils.removeClass(document.body.querySelector("#em-article-close .new-message"), "hide");
	});
	utils.live(".article-link", "click", function(e){
		var sendStatus = e.target.dataset.status;
		var curArticleDom = e.target.parentNode;
		var url = e.target.firstElementChild.innerText;
		url = utils.sameProtocol(url);
		window.open(url);
		// 根据sendStatus状态判断是否应该显示‘我正在看’状态
		if(sendStatus == "false"){
			// 发送一条图文
			channel.sendText("", {
				ext: {
					msgtype: {
						track: {
							// 消息标题
							title: "我正在看：",
							// 商品描述
							desc: curArticleDom.querySelector(".title").innerText,
							// 商品图片链接
							img_url: (
								curArticleDom.querySelector(".cover")
								|| curArticleDom.querySelector(".cover-img")
							).getAttribute("src"),
							// 商品页面链接
							item_url: url
						}
					}
				}
			});
		}
	});

	var messagePredict = _.throttle(function(msg){
		var officialAccount = profile.currentOfficialAccount || {};
		var sessionId = officialAccount.sessionId;
		var sessionState = officialAccount.sessionState;
		var agentType = officialAccount.agentType;
		var content = utils.getBrief(msg, _const.MESSAGE_PREDICT_MAX_LENGTH);

		if(
			sessionState === _const.SESSION_STATE.PROCESSING
			&& agentType !== _const.AGENT_ROLE.ROBOT
			&& sessionId
		){
			apiHelper.reportPredictMessage(sessionId, content);
		}
	}, 1000);

	function handleSendBtn(){
		var toKefuBtn = document.querySelector(".em-widget-to-kefu");
		var isEmpty = !doms.textInput.value.trim();

		utils.toggleClass(
			doms.sendBtn,
			"disabled", !isMessageChannelReady || isEmpty
		);
		profile.grayList.msgPredictEnable
			&& !isEmpty
			&& isMessageChannelReady
			&& messagePredict(doms.textInput.value);

		if(utils.isMobile){
			if(utils.hasClass(doms.sendBtn, "disabled")){
				utils.removeClass(doms.addBtn, "hide");
				if(utils.hasClass(toKefuBtn, "hide")){
					doms.textInput.style.maxWidth = "calc(100% - 45px)";
				}
				else{
					doms.textInput.style.maxWidth = "calc(100% - 90px)";
				}
				doms.emojiToggleButton.style.right = "40px";
	
			}else{
				utils.addClass(doms.addBtn, "hide");
				if(utils.hasClass(toKefuBtn, "hide")){
					doms.textInput.style.maxWidth = "calc(100% - 80px)";
				}
				else{
					doms.textInput.style.maxWidth = "calc(100% - 125px)";
				}
				doms.emojiToggleButton.style.right = "75px";
			}
		}	
	}

	if(Modernizr.oninput){
		utils.on(doms.textInput, "input change", handleSendBtn);
	}
	else{
		utils.on(doms.textInput, "keyup change", handleSendBtn);
	}

	if(utils.isMobile){
		utils.on(doms.textInput, "focus touchstart", function(){
			doms.textInput.style.overflowY = "auto";
			_scrollToBottom();
		});
	}

	// 发送小视频
	utils.on(doms.videoInput, "change", function(){
		var fileInput = doms.videoInput;
		var filesize = utils.getDataByPath(fileInput, "files.0.size");
		if(!fileInput.value){
		}
		else if(filesize > _const.UPLOAD_FILESIZE_LIMIT){
			uikit.tip(__("prompt._10_mb_file_limit"));  // ("文件大小不能超过10MB");
			fileInput.value = "";
		}
		else{
			channel.sendVideo(WebIM.utils.getFileUrl(fileInput)); // sendVideo 取自 channel.js
			fileInput.value = "";
		}
	});

	// 发送文件
	utils.on(doms.fileInput, "change", function(){
		var fileInput = doms.fileInput;
		var filesize = utils.getDataByPath(fileInput, "files.0.size");

		if(!fileInput.value){
			// 未选择文件
		}
		else if(filesize > _const.UPLOAD_FILESIZE_LIMIT){
			uikit.tip(__("prompt._10_mb_file_limit"));
			fileInput.value = "";
		}
		else{
			channel.sendFile(WebIM.utils.getFileUrl(fileInput));
			fileInput.value = "";
		}
	});

	// qq web browser patch
	// qq浏览器有时无法选取图片
	if(utils.isQQBrowser && utils.isAndroid){
		doms.imgInput.setAttribute("accept", "image/*");
	}
	// 发送图片
	utils.on(doms.imgInput, "change", function(){
		var fileInput = doms.imgInput;
		// ie8-9 do not support multifiles, so you can not get files
		var filesize = utils.getDataByPath(fileInput, "files.0.size");

		if(!fileInput.value){
			// 未选择文件
		}
		// 某些浏览器不能获取到正确的文件名，所以放弃文件类型检测
		// else if (!/\.(png|jpg|jpeg|gif)$/i.test(fileInput.value)) {
		// uikit.tip('unsupported picture format');
		// }
		// 某些浏览器无法获取文件大小, 忽略
		else if(filesize > _const.UPLOAD_FILESIZE_LIMIT){
			uikit.tip(__("prompt._10_mb_file_limit"));
			fileInput.value = "";
		}
		else{
			channel.sendImg(WebIM.utils.getFileUrl(fileInput));
			fileInput.value = "";
		}
	});

	// 弹出文件框
	utils.on(doms.sendFileBtn, "click", function(){
		doms.fileInput.click();
	});

	// 弹出小视频框
	utils.on(doms.sendVideoBtn, "click", function(){
		doms.videoInput.click();
	});

	// 弹出图片框
	utils.on(doms.sendImgBtn, "click", function(){
		doms.imgInput.click();
	});

	// 显示留言页面
	utils.on(doms.noteBtn, "click", function(){
		noteIframe.open();
	});

	// 满意度评价
	utils.on(doms.satisfaction, "click", function(){
		doms.textInput.blur();
		// 判断评价是否超时
		apiHelper.getEvaluateVerify(profile.currentOfficialAccount.sessionId)
		.then(function(resp){
			if(resp.status == "OK"){
				// 访客主动评价
				satisfaction.show(null, null, "visitor");
			}
			else{
				if(resp.errorCode == "WEBIM_338"){
					uikit.tip(__("evaluation.WEBIM_338"));
				}else{
					uikit.tip(__("evaluation.WEBIM_OTHER"));
				}
			}
		})
	});

	// ios patch: scroll page when keyboard is visible ones
	if(utils.isIOS){
		utils.on(doms.textInput, "focus", function(){
			if(utils.isTop){
				utils.removeClass(document.body, "em-mobile-translate");
			}
		});
		// CLOUD-15103 解决 ios 部分手机点击输入框失焦后输入框不能自动收回问题
		utils.on(doms.textInput, "blur", function(e){
			setTimeout(function(){
				// 曾经试过的方法
				// 1. 重新去设置iframe 的宽高
				// 2. document.body.scrollBottom = 0;		// 在 iframe 下会有问题
				// 3. document.body.scrollIntoView(false);	// 元素的底端将和其所在滚动区的可视区域的底端对齐 加载 iframe 的页面和 easemob.js 不在同一个域会出现问题。原因未知
				// 4. window.scrollTo(0, Math.max(document.body.clientHeight, document.documentElement.clientHeight));
				// 5. window.document.body.scrollTop = window.document.body.scrollHeight;

				if(utils.isTop){
					utils.addClass(document.body, "em-mobile-translate");
				}
				else{
					getToHost.send({
						event: _const.EVENTS.SCROLL_TO_BOTTOM,
					});
				}
				
			}, 100);

		});
	}

	// 回车发送消息
	utils.on(doms.textInput, "keydown", function(evt){
		if(
			evt.keyCode === 13
			&& !utils.isMobile
			&& !evt.ctrlKey
			&& !evt.shiftKey
		){
			// ie8 does not support preventDefault & stopPropagation
			if(evt.preventDefault){
				evt.preventDefault();
			}
			utils.trigger(doms.sendBtn, "click");
		}
	});


	utils.on(doms.sendBtn, "click", function(){
		var textMsg = doms.textInput.value;

		if(utils.hasClass(this, "disabled")){
			// 禁止发送
		}
		else if(textMsg.length > _const.MAX_TEXT_MESSAGE_LENGTH){
			uikit.tip(__("prompt.too_many_words"));
		}
		else{
			channel.sendText(textMsg);
			doms.textInput.value = "";
			utils.trigger(doms.textInput, "change");
			// 清除猜你想说 功能 并 重置样式(根据是否有灰度)
			if(profile.grayList.guessUSay){
				guessInfo.resetStyle();
			}
		}
	});

	utils.on(doms.addBtn, "click", function(){
		utils.toggleClass(doms.toolBar, "hide");
		var height = doms.editorView.getBoundingClientRect().height;
		if(inputBoxPosition === "up"){
			doms.chatWrapper.style.bottom = "0";
			doms.queuingNumberStatus.style.top = height + "px";
			
		}else{
			doms.chatWrapper.style.bottom = height + "px";
		}
		emojiPanel.move(inputBoxPosition, height);
		// 由于移动端时候轮播图的元素没有家在无法获取到 所以需要在加载完成以后改变主题色
		if(utils.isMobile) {
			// 获取主题色
			var color = "";
			var themeClassName;
			var config = commonConfig.getConfig();
			var themeName = config.ui.themeName;
			if(themeName && themeName.indexOf("theme_custom") > -1){
				var arr = themeName.split("theme_custom");
				color = arr[1];
				themeClassName = "theme_custom";
			}
			else{
				themeClassName = _const.themeMap[config.themeName];
			}
			var hoverColor = $("body."+ themeClassName +" .border-color").css("borderColor")
			// 设置主题色
			setTimeout(function(){
				var el = document.querySelector(".swiper-pagination-bullet-active")
				if(color){
					$(el).css("backgroundColor",color)
				}
				else{
					$(el).css("backgroundColor",hoverColor)
				}
			},300)
		}
	})
}

function _close(){
	profile.isChatWindowOpen = false;

	if(config && !config.hide){
		utils.addClass(doms.imChat, "hide");
		utils.removeClass(doms.imBtn, "hide");
	}

	eventListener.excuteCallbacks(_const.SYSTEM_EVENT.CHAT_WINDOW_CLOSED, []);
}

function _show(){
	profile.isChatWindowOpen = true;
	utils.addClass(doms.imBtn, "hide");
	utils.removeClass(doms.imChat, "hide");
	_scrollToBottom();
	if(
		profile.isInOfficeHours
		&& !utils.isMobile
		// IE 8 will throw an error when focus an invisible element
		&& doms.textInput.offsetHeight > 0
	){
		doms.textInput.focus();
	}
	getToHost.send({ event: _const.EVENTS.REOPEN }); // 不管是否ready，都send
	getToHost.send({ event: _const.EVENTS.RECOVERY });

	eventListener.excuteCallbacks(_const.SYSTEM_EVENT.CHAT_WINDOW_OPENED, []);
}

function _onReady(){
	// sessionStorage.setItem("tabIdSession",new Date().getTime());
	commonConfig.setConfig({
		tabIdSession: new Date().getTime(),
	});
	if(isMessageChannelReady) return;

	isMessageChannelReady = true;

	doms.sendBtn.innerHTML = __("chat.send");
	utils.trigger(doms.textInput, "change");

	// todo: discard this
	// bug fix:
	// minimum = fales 时, 或者 访客回呼模式 调用easemobim.bind时显示问题
	if(config.minimum === false || config.eventCollector === true){
		getToHost.send({ event: _const.EVENTS.SHOW });
	}

	eventListener.trigger(_const.SYSTEM_EVENT.MESSAGE_CHANNEL_READY);

	// onready 回调
	getToHost.send({ event: _const.EVENTS.ONREADY });
}

function _initSDK(){
	return new Promise(function(resolve){
		channel.initConnection(resolve);
	});
}
// 获取dom
function _getDom(){
	topBar = document.querySelector(".em-widget-header");
	editorView = document.querySelector(".em-widget-send-wrapper");
	var inputBox = editorView.querySelector(".input-box");

	var toolBar = utils.isMobile ? editorView.querySelector(".toolbar-mobile") : editorView.querySelector(".toolbar-pc");
	// 将猜你想说 dom 插入的指定元素之前
	toolBar.parentNode.insertBefore(guessInfo.loadHtml().dom, toolBar);

	doms = {
		imBtn: document.getElementById("em-widgetPopBar"),
		imChat: document.getElementById("em-kefu-webim-chat"),
		agentStatusText: topBar.querySelector(".em-header-status-text"),
		dragBar: topBar.querySelector(".drag-bar"),
		closeBtn: topBar.querySelector(".btn-close"),
		minifyBtn: topBar.querySelector(".btn-min"),
		audioBtn: topBar.querySelector(".btn-audio"),
		switchKeyboardBtn: topBar.querySelector(".btn-keyboard"),

		emojiToggleButton: utils.isMobile ? inputBox.querySelector(".em-bar-emoji") : toolBar.querySelector(".em-bar-emoji"),
		// 获取文件上传，图片，小视频按钮dom
		sendImgBtn: toolBar.querySelector(".em-widget-img"),
		sendFileBtn: toolBar.querySelector(".em-widget-file"),
		sendVideoBtn: toolBar.querySelector(".em-widget-video"),
		sendBtn: editorView.querySelector(".em-widget-send"),
		satisfaction: toolBar.querySelector(".em-widget-satisfaction"),
		textInput: editorView.querySelector(".em-widget-textarea"),
		noteBtn: toolBar.querySelector(".em-widget-note"),
		videoInviteButton: toolBar.querySelector(".em-video-invite"),
		queuingNumberStatus: editorView.querySelector(".queuing-number-status"),
		//  图片小视频文件 file框
		videoInput: document.querySelector(".upload-video-container"),
		imgInput: document.querySelector(".upload-img-container"),
		fileInput: document.querySelector(".upload-file-container"),
		chatWrapper: document.querySelector(".chat-wrapper"),
		addBtn: editorView.querySelector(".em-widget-add"),

		videoPlayContainer: document.querySelector(".em-video-container"),
		videoPlayBox: document.querySelector(".full-video-box"),
		videoBoxClose: document.querySelector(".video-container-close"),
		
		toolBar: toolBar,
		topBar: topBar,
		editorView: editorView,
		// inputTopButton:document.querySelector(".em-widget-send-wrapper-top>.input-top-btn"),
	};
}

function _init(){
	// 根据灰度设置 是否添加猜你想问功能
	if(profile.grayList.guessUSay){
		guessInfo.addEvents();
	}
	config = commonConfig.getConfig();
	channel.init();
	profile.isChatWindowOpen = true;
	_initSoundReminder();
	_initUI();
	// 初始化留言
	_initNote();
	_bindEvents();
	initSessionList();
	_initSession();
	// 查询是否开启询前引导开关
	if(profile.grayList.transfermanualmenuguide){
		apiHelper.getOptForManualMenuGuide().then(function(yes){
			profile.isManualMenuGuide = yes;
		});
	}
	var url;
    if(profile.grayList.poweredByEasemob){
        // utils.addClass(el, "paddingTo48");
        // utils.addClass(noMoreMsg, "top34");
        url = "http://www.easemob.com/product/cs?utm_source=csw&tenantid=" + commonConfig.getConfig().tenantId;
		if(!utils.isMobile){
			utils.appendHTMLTo(editorView, "<div class=\"easemob-copyright\"><a target=\"_blank\" href=" + url + "><span><i class=\"icon-easemob\"></i>"+ __("chat.powered_by_easemob") +"</a></div>");
			utils.addClass(editorView, "height-170");
			utils.addClass($(editorView).find(".em-widget-send"), "bottom-30");
			utils.addClass(document.querySelector(".chat-wrapper"), "chat-padding-40");
		}
	}

}

function _initSatisfactionButton(){
	eventListener.add(_const.SYSTEM_EVENT.SESSION_OPENED, _displayOrHideSatisfactionBtn);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERING, _displayOrHideSatisfactionBtn);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERED, _displayOrHideSatisfactionBtn);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _displayOrHideSatisfactionBtn);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_NOT_CREATED, _displayOrHideSatisfactionBtn);
	eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED, _displayOrHideSatisfactionBtn);
}

function _displayOrHideSatisfactionBtn(officialAccount){
	// 忽略非当前服务号的事件
	if(profile.currentOfficialAccount !== officialAccount) return;

	var state = officialAccount.sessionState;
	var agentType = officialAccount.agentType;
	var type = officialAccount.type;
	var isRobotAgent = agentType === _const.AGENT_ROLE.ROBOT;

	if(state === _const.SESSION_STATE.PROCESSING){
		utils.toggleClass(doms.satisfaction, "hide", isRobotAgent); 
	}
	else if(state === _const.SESSION_STATE.WAIT){
		// 待接入状态 隐藏按钮
		utils.addClass(doms.satisfaction, "hide");
	}
	else{
		if(profile.isAgentStateOnline){
			utils.removeClass(doms.satisfaction, "hide");
		}
	}
}

function _initNote(){
	var data;
	var closeNoteBtn = document.querySelector(".em-kefu-webim-note .note-top");
	noteIframe = new NoteIframe(config);
	if(window.addEventListener){
		window.addEventListener("message", function(e){
			closeNoteIframe(e);
		}, false);
	}
	else if(window.attachEvent){
		window.attachEvent("onmessage", function(e){
			closeNoteIframe(e);
		});
	}

	utils.on(closeNoteBtn, "click", function(){
		noteIframe.close();
	});

	function closeNoteIframe(e){
		data = e.data;
		if(typeof data === "string" && data != "undefined"){
			data = JSON.parse(data);
		}
		data.closeNote && noteIframe.close();
	}
}

function _initSession(){
	Promise.all([
		apiHelper.getDutyStatus(),
		apiHelper.getToken(),
	]).then(function(result){
		var dutyStatus = result[0];
		// 当配置为下班进会话时执行与上班相同的逻辑
		profile.isInOfficeHours = dutyStatus || config.offDutyType === "chat";
		if(profile.isInOfficeHours){
			emojiPanel.init({
				container: doms.imChat,
				toggleButton: doms.emojiToggleButton,
				textInput: doms.textInput,
			});
			videoChat.init({
				triggerButton: doms.videoInviteButton,
				parentContainer: doms.imChat,
			});
			extendMessageSender.init();

			Promise.all([
				// 查询是否开启机器人
				apiHelper.getRobertIsOpen().then(function(isRobotEnable){
					profile.hasRobotAgentOnline = isRobotEnable;
				}),
				// 获取坐席昵称设置
				apiHelper.getNickNameOption().then(function(displayNickname){
					profile.isAgentNicknameEnable = displayNickname;
				}),
				// 获取是否显示 track msg
				apiHelper.getOptForShowTrackMsg().then(function(yes){
					profile.isShowTrackMsg = yes;
				}),
				// 获取是否显示 客服状态
				apiHelper.getOnlineCustomerStatus().then(function(yes){
					profile.isHideCustomerStatus = yes;
				}),
			])
			.then(function(){
				return Promise.all([
					_initOfficialAccount(),
					_initSDK()
				]);
			})
			.then(_onReady);



			_initSystemEventListener();
			satisfaction.init();
			initAgentInputStatePoller();
			initAgentStatusPoller();
			initVisitorStatusPoller();
			initQueuingNumberPoller();
			initTransferToKefuButton();
			if(config.satisfaction && config.options.showEnquiryButtonInAllTime == "false"){
				_initSatisfactionButton();
				_InitH5AndInputTop(true);
			}
			else{
				_InitH5AndInputTop(false);
			}
			
			initAgentNicknameUpdate();
			initGetGreetings();

			// 第二通道收消息初始化
			channel.initSecondChannle();
			// todo: move to handle ready
			initPasteImage();
			// 显示广告条
			_setLogo();
			// 设置信息栏
			_setNotice();
			_initToolbar();
			// 检测租户版本是否是试用期
			_checkGradeType();
			// 移动端输入框自动增长
			utils.isMobile && _initAutoGrow();
		}
		else{
			// 设置下班时间展示的页面
			_setOffline();
		}
	}, function(err){
		if(
			err.error_description === "user not found"
			&& config.isUsernameFromCookie
		){
			_reCreateImUser();
		}
		else{
			throw err;
		}
	});
}
function _InitH5AndInputTop(isShowSatis){
	// em-widget-send-wrapper-top
	apiHelper.getInputTopStatus().then(function(res){
		//如果开关打开渲染输入框上边的快捷操作按钮
		if(res.entity){
			apiHelper.getInputTopButton().then(function(res){
				if(res.entities.length !=0){
					initInputTopButton(res.entities);
				}
			})
		}
		else{
			$(".em-widget-send-wrapper-top").addClass("hide");
		}
	})

	if(utils.isMobile) {
		// document.querySelector(".em-widget-send-wrapper-top").style.bottom = "60" + "px";
		// $(".em-widget-send-wrapper-top").addClass("hide");
		apiHelper.getInputH5Status().then(function(res){
			//如果开关打开渲染输入框上边的快捷操作按钮
			if(res.entity){
				apiHelper.getInputH5Button().then(function(res){
					if(res.entities.length !=0){
						initInputH5Button(res.entities,isShowSatis);
					}
				})
			}
			else{
				// $(".em-widget-send-wrapper-top").addClass("hide");
			}

		})
	} else {

	}
}

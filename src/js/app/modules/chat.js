var WebIM = require("easemob-websdk");
var utils = require("../../common/utils");
var _const = require("../../common/const");
var uikit = require("./uikit");
var apiHelper = require("./apiHelper");
var eventListener = require("./tools/eventListener");
var channel = require("./channel");
var profile = require("./tools/profile");
var satisfaction = require("./satisfaction");
var imgView = require("./imgview");
var leaveMessage = require("./leaveMessage");
var initPasteImage = require("./paste");
var videoChat = require("./videoChat");

var initAgentInputStatePoller = require("./chat/initAgentInputStatePoller");
var initAgentStatusPoller = require("./chat/initAgentStatusPoller");
var initQueuingNumberPoller = require("./chat/initQueuingNumberPoller");
var initTransferToKefuButton = require("./chat/initTransferToKefuButton");
var initSessionList = require("./chat/initSessionList");
var initGetGreetings = require("./chat/initGetGreetings");
var initAgentNicknameUpdate = require("./chat/initAgentNicknameUpdate");
var emojiPanel = require("./chat/emojiPanel");

var isMessageChannelReady;
var config;
var inputBoxPosition = "down";

var topBar;
var editorView;
var doms;

var _reCreateImUser = _.once(function(){
	console.warn("user not found in current appKey, attempt to recreate user.");
	apiHelper.createVisitor().then(function(entity){
		var cacheKeyName = (config.configId || (config.to + config.tenantId + config.emgroup));

		config.user.username = entity.userId;
		config.user.password = entity.userPassword;

		if(entity.userPassword === ""){
			profile.imRestDown = true;
		}

		_initSession();

		if(utils.isTop){

			utils.set("root" + (config.configId || (config.tenantId + config.emgroup)), config.user.username);
		}
		else{

			transfer.send({
				event: _const.EVENTS.CACHEUSER,
				data: {
					key: cacheKeyName,
					value: config.user.username,
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
	// send crm extend message
	eventListener.add([
		_const.SYSTEM_EVENT.SESSION_OPENED,
		_const.SYSTEM_EVENT.SESSION_RESTORED,
	], _.once(function(officialAccount){
		var sessionId = officialAccount.sessionId;
		var isSessionOpen = officialAccount.isSessionOpen;

		if(isSessionOpen && sessionId){
			apiHelper.reportVisitorAttributes(sessionId);
		}
	}));

	// report visitor info
	eventListener.add([
		_const.SYSTEM_EVENT.SESSION_OPENED,
		_const.SYSTEM_EVENT.SESSION_RESTORED,
	], _.once(function(officialAccount){
		if(!officialAccount.isSessionOpen) return;

		_.each(profile.commandMessageToBeSendList, function(msg){
			// 发送订单轨迹消息
			if(!utils.isCrmExtendMessage(msg)){
				channel.sendText("", msg);
			}
		});
	}));
}

function _initUI(){
	(utils.isTop || !config.minimum) && utils.removeClass(doms.imChat, "hide");

	// 设置联系客服按钮文字
	document.querySelector(".em-widget-pop-bar").innerText = config.buttonText;

	// 添加移动端样式类
	utils.isMobile && utils.addClass(document.body, "em-mobile");

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
		utils.removeClass(doms.sendFileBtn, "hide");
	}

	// 留言按钮
	config.ticket && utils.removeClass(doms.noteBtn, "hide");

	// 满意度评价按钮
	config.satisfaction
		&& utils.removeClass(doms.satisfaction, "hide");
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
		if(!notice.enabled) return;
		var slogan = notice.content;

		// 设置信息栏内容
		noticeContent.innerHTML = WebIM.utils.parseLink(slogan);
		// 显示信息栏
		utils.addClass(doms.imChat, "has-tip");

		// 隐藏信息栏按钮
		utils.on(noticeCloseBtn, utils.click, function(){
			// 隐藏信息栏
			utils.removeClass(doms.imChat, "has-tip");
		});
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
		leaveMessage({ hideCloseBtn: true });
		break;
	}

	transfer.send({ event: _const.EVENTS.ON_OFFDUTY });
}

function _scrollToBottom(){
	var scrollToBottom = utils.getDataByPath(profile, "currentOfficialAccount.messageView.scrollToBottom");
	// 有可能在 messageView 未初始化时调用
	// todo: remove this detect
	typeof scrollToBottom === "function" && scrollToBottom();
}

function _initAutoGrow(){
	var originHeight = doms.textInput.clientHeight;

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
			doms.editorView.style.top = "43px";
			doms.chatWrapper.style.bottom = "0";
			doms.queuingNumberStatus.style.top = height + "px";
			break;
		case "down":
			doms.editorView.style.bottom = "0";
			doms.editorView.style.zIndex = "3";
			doms.editorView.style.top = "auto";
			doms.chatWrapper.style.bottom = height + "px";
			doms.queuingNumberStatus.style.top = "-26px";
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
		var height = doms.editorView.getBoundingClientRect().height;
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
		// 最小化按钮
		utils.on(doms.minifyBtn, "click", function(){
			transfer.send({ event: _const.EVENTS.CLOSE });
		});

		utils.on(document, "mouseover", function(){
			transfer.send({ event: _const.EVENTS.RECOVERY });
		});
	}

	utils.on(doms.chatWrapper, "click", function(){
		doms.textInput.blur();
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
			transfer.send({
				event: _const.EVENTS.DRAGREADY,
				data: {
					x: e.clientX,
					y: e.clientY
				}
			});
			return false;
		}, false);
	}

	// resend
	utils.live("div.em-widget-msg-status", "click", function(){
		var id = this.getAttribute("id").slice(0, -"_failed".length);
		var type = this.getAttribute("data-type");

		channel.reSend(type, id);
		utils.addClass(this, "hide");
		utils.removeClass(document.getElementById(id + "_loading"), "hide");
	});

	utils.live("button.js_robotTransferBtn", "click", function(){
		var id = this.getAttribute("data-id");
		var ssid = this.getAttribute("data-sessionid");

		if(!this.clicked){
			this.clicked = true;
			channel.sendTransferToKf(id, ssid);
		}
	});

	utils.live("button.js-transfer-to-ticket", "click", function(){
		var officialAccount = profile.currentOfficialAccount;
		if(!officialAccount) return;

		var isSessionOpen = officialAccount.isSessionOpen;
		var sessionId = officialAccount.sessionId;

		isSessionOpen && apiHelper.closeServiceSession(sessionId);

		leaveMessage({
			preData: {
				name: config.visitor.trueName,
				phone: config.visitor.phone,
				mail: config.visitor.email,
			}
		});
	});

	// 机器人列表
	utils.live("button.js_robotbtn", "click", function(){
		channel.sendText(this.innerText, {
			ext: {
				msgtype: {
					choice: {
						menuid: this.getAttribute("data-id")
					}
				}
			}
		});
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

	// 满意度评价
	utils.live("button.js_satisfybtn", "click", function(){
		var serviceSessionId = this.getAttribute("data-servicesessionid");
		var inviteId = this.getAttribute("data-inviteid");
		satisfaction.show(inviteId, serviceSessionId);
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
		var isEmpty = !doms.textInput.value.trim();

		utils.toggleClass(
			doms.sendBtn,
			"disabled", !isMessageChannelReady || isEmpty
		);
		profile.grayList.msgPredictEnable
			&& !isEmpty
			&& isMessageChannelReady
			&& messagePredict(doms.textInput.value);
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

	// 弹出文件选择框
	utils.on(doms.sendFileBtn, "click", function(){
		doms.fileInput.click();
	});

	utils.on(doms.sendImgBtn, "click", function(){
		doms.imgInput.click();
	});

	// 显示留言页面
	utils.on(doms.noteBtn, "click", function(){
		leaveMessage();
	});

	// 满意度评价
	utils.on(doms.satisfaction, "click", function(){
		doms.textInput.blur();
		satisfaction.show();
	});

	// ios patch: scroll page when keyboard is visible ones
	if(utils.isIOS){
		utils.on(doms.textInput, "focus", function(){
			setTimeout(function(){
				if(
					document.activeElement === doms.textInput
					&& inputBoxPosition !== "up"
					// ios 11.1/11.2/11.3 给scrollTop赋值，会使scrollTop值为0
					&& !/(OS 11_1|OS 11_2|OS 11_3)/i.test(navigator.userAgent)
				){
					document.body.scrollTop = 9999;
					transfer.send({ event: _const.EVENTS.SCROLL_TO_BOTTOM });
				}
			}, 500);
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
		}
	});
}

function _close(){
	profile.isChatWindowOpen = false;

	if(!config.hide){
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

	transfer.send({ event: _const.EVENTS.RECOVERY });

	eventListener.excuteCallbacks(_const.SYSTEM_EVENT.CHAT_WINDOW_OPENED, []);
}

function _onReady(){
	if(isMessageChannelReady) return;

	isMessageChannelReady = true;

	doms.sendBtn.innerHTML = __("chat.send");
	utils.trigger(doms.textInput, "change");

	// todo: discard this
	// bug fix:
	// minimum = fales 时, 或者 访客回呼模式 调用easemobim.bind时显示问题
	if(config.minimum === false || config.eventCollector === true){
		transfer.send({ event: _const.EVENTS.SHOW });
	}

	_.each(profile.commandMessageToBeSendList, function(msg){
		// 发送订单、轨迹消息
		if(!utils.isCrmExtendMessage(msg)){
			channel.sendText("", msg);
		}
	});

	// onready 回调
	transfer.send({ event: _const.EVENTS.ONREADY });
}

function _initSDK(){
	return new Promise(function(resolve){
		channel.initConnection(resolve);
	});
}

function _getDom(){
	topBar = document.querySelector(".em-widget-header");
	editorView = document.querySelector(".em-widget-send-wrapper");

	doms = {
		imBtn: document.getElementById("em-widgetPopBar"),
		imChat: document.getElementById("em-kefu-webim-chat"),
		agentStatusText: topBar.querySelector(".em-header-status-text"),
		dragBar: topBar.querySelector(".drag-bar"),
		minifyBtn: topBar.querySelector(".btn-min"),
		audioBtn: topBar.querySelector(".btn-audio"),
		switchKeyboardBtn: topBar.querySelector(".btn-keyboard"),

		emojiToggleButton: editorView.querySelector(".em-bar-emoji"),
		sendImgBtn: editorView.querySelector(".em-widget-img"),
		sendFileBtn: editorView.querySelector(".em-widget-file"),
		sendBtn: editorView.querySelector(".em-widget-send"),
		satisfaction: editorView.querySelector(".em-widget-satisfaction"),
		textInput: editorView.querySelector(".em-widget-textarea"),
		noteBtn: editorView.querySelector(".em-widget-note"),
		videoInviteButton: editorView.querySelector(".em-video-invite"),
		queuingNumberStatus: editorView.querySelector(".queuing-number-status"),

		imgInput: document.querySelector(".upload-img-container"),
		fileInput: document.querySelector(".upload-file-container"),
		chatWrapper: document.querySelector(".chat-wrapper"),

		topBar: topBar,
		editorView: editorView,
	};
}

function _init(){
	config = profile.config;

	channel.init();

	profile.isChatWindowOpen = true;

	_initSoundReminder();

	_initUI();

	_bindEvents();

	initSessionList();

	_initSession();
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

			Promise.all([
				_initOfficialAccount(),
				_initSDK()
			]).then(_onReady);

			// 查询是否开启机器人
			apiHelper.getRobertIsOpen().then(function(isRobotEnable){
				profile.hasRobotAgentOnline = isRobotEnable;
			});

			// 获取坐席昵称设置
			apiHelper.getNickNameOption().then(function(displayNickname){
				profile.isAgentNicknameEnable = displayNickname;
			});

			_initSystemEventListener();
			satisfaction.init();
			initAgentInputStatePoller();
			initAgentStatusPoller();
			initQueuingNumberPoller();
			initTransferToKefuButton();
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

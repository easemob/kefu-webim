/*
	视频流程
	1.
		a. 访客发起邀请
		b. 坐席发起邀请
	2. 访客收到ticket
	3. 初始化sdk，回调
	4. 访客加入会议
	5. 振铃
	6. 访客接起
	7. 访客推流
*/

var _const = require("@/common/const");
var uikit = require("./uikit");
var channel = require("./channel");
var profile = require("@/app/tools/profile");
var eventListener = require("@/app/tools/eventListener");
var utils = require("@/common/utils");
var tools = require("@/app/tools/tools");
var Dispatcher = require("@/app/tools/Dispatcher");
var commonConfig = require("@/common/config");

var statusBar = require("./uikit/videoStatusBar");
var videoPanel = require("./uikit/videoPanel");
var videoChatTemplate = require("../../../../template/videoChat.html");
var apiHelper = require("./apis");
var TimerLabel = require("./uikit/TimerLabel");

var _initOnce = _.once(_init);
var parentContainer;
var videoWidget;
var dispatcher;

var config;
var dialog, agentInviteDialog, visitorDialog;
var timerBarDom, timerLabel;
var service;
var inviteByVisitor = false; //访客邀请的

var STATIC_PATH = __("config.language") === "zh-CN" ? "static" : "../static";

module.exports = {
	init: init,
};

function _init(){
	if(videoWidget) return;
	// init dom
	videoWidget = utils.createElementFromHTML(_.template(videoChatTemplate)());

	parentContainer.appendChild(videoWidget);

	config = commonConfig.getConfig();

	if(config.videoH5Status == ""){
		apiHelper.getVideoH5Status().then(function(res){
			if(res.entity){
				config.videoH5Status = res.entity
			}
		})
	}

	// init emedia config
	// window.emedia.config({ autoSub: false });

	// disable emedia log
	window.emedia.LOG_LEVEL = 5;

	dispatcher = new Dispatcher();

	service = new window.emedia.Service({
		// 这个目前没有定义，前段可写 web
		resource: "web",
		// 这个人的昵称，可以不写。比如 jid 中的name
		nickName: config.user.username,

		// 以下监听，this object == me == service.current
		listeners: {
			// 退出，服务端强制退出，进入会议失败，sdk重连失败等 均会调用到此处
			onMeExit: function(errorCode){
				// var errorMessage = _const.E_MEDIA_SDK_ERROR_CODE_MAP[errorCode] || "unknown error code.";

				statusBar.showClosing();
				videoPanel.hide();

				// if(errorCode !== 0) throw new Error(errorMessage);
			},
			// 某人进入会议
			onAddMember: function(member){
				console.info({
					type: "memberEnter",
					memberId: member.id,
					memberNickname: member.nickName,
				});
			},
			// 某人退出会议
			onRemoveMember: function(member){
				console.info({
					type: "memberExit",
					memberId: member.id,
					memberNickname: member.nickName,
				});
			},
			// 某人 发布 一个流 （音视频流，共享桌面等）（包含本地流）
			onAddStream: videoPanel.addOrUpdateStream,
			// 某人 取消 一个流 （音视频流，共享桌面等）（包含本地流）
			onRemoveStream: videoPanel.removeStream,
			// 更新 一个流 （音视频流，共享桌面等）。
			// 可能是 断网后，重新获取到远端媒体流，或者对方静音或关闭摄像头
			onUpdateStream: videoPanel.addOrUpdateStream,
			// 这个事件比较多，以后业务拓展时，根据需要再给开放一些回调，目前忽略
			onNotifyEvent: function(evt){
				// 接听 打开本地摄像头 并成功推流
				if(evt instanceof window.emedia.event.PushSuccess){}
				// 接听 打开本地摄像头 推流失败
				else if(evt instanceof window.emedia.event.PushFail){
					uikit.tip(__("video.can_not_connected"));
					service.exit();
				}
				// 接听 打开摄像头失败
				else if(evt instanceof window.emedia.event.OpenMediaError){
					uikit.tip(__("video.can_not_open_camera"));
					service.exit();
				}
				else{}
			},
		}
	});

	dialog = uikit.createDialog({
		contentDom: [
			"<p class=\"prompt\">",
			__("video.confirm_prompt"),
			"</p>"
		].join(""),
		className: "rtc-video-confirm",
	}).addButton({ confirm: _onConfirm });

	var $agentNickname = document.querySelector(".em-widget-header-nickname").innerText;
	var $agentFace = document.querySelector(".em-agent-face").src;
	agentInviteDialog = uikit.createDialog({
		contentDom: [
			"<div>",
			"<p class=\"title\">视频通话</p>",
			"<p class=\"time\"><p>",
			"<p> <img src=\"img"+ $agentFace +"\" class=\"\"/> </p>",
			"<p class=\"nickname\">"+ $agentNickname +"</p>",
			"<p class=\"title\">"+ __("video.confirm_prompt_agent")+"</p>",
			// "<p class=\"title\">客服邀请您进入视频通话</p>",
			// "<div class=\"foot\"> <svg class=\"icon svg-icon\" aria-hidden=\"true\"><use xlink:href=\"#newim-a-anwser1x\"></use> </svg></div>",
			"<div class=\"foot\"> <div class=\"button answer\"><i class=\"icon-answer\"></i> <span>接听</span></div> <div class=\"button huang\"><i class=\"icon-huang\"></i> <span>"+ __("common.refuse")+"</span></div> </div>",
			"</div>"
		].join(""),
		className: "agent-invite-video-confirm",
	})
	// .addButton({ confirmText: __("common.accept"), cancelText: __("common.refuse"), confirm: _onAgentInviteConfirm, cancel: _onAgentInviteCancel });

	utils.live(".icon-answer","click",_onAgentInviteConfirm);
	utils.live(".icon-huang","click",_onAgentInviteCancel);

	// agentInviteDialog = uikit.createDialog({
	// 	contentDom: [
	// 		"<div>",
	// 		"<p class=\"time\"><p>",
	// 		"<i class=\"icon-answer\"></i><span class=\"prompt\">",
	// 		__("video.confirm_prompt_agent"),
	// 		"</span>",
	// 		"</div>"
	// 	].join(""),
	// 	className: "agent-invite-video-confirm",
	// }).addButton({ confirmText: __("common.accept"), cancelText: __("common.refuse"), confirm: _onAgentInviteConfirm, cancel: _onAgentInviteCancel });

	timerBarDom = agentInviteDialog.el.querySelector(".time");
	timerLabel = new TimerLabel(timerBarDom);

	statusBar.init({
		wrapperDom: videoWidget.querySelector(".status-bar"),
		acceptCallback: function(){
			service.join(function(/* _memId */){
				videoPanel.show();
				statusBar.hideAcceptButton();
				statusBar.startTimer();
				statusBar.setStatusText(__("video.connecting"));
				_pushStream();
				visitorDialog && visitorDialog.hide();
			}, function(evt){
				service.exit();
				throw new Error("failed to join conference: " + evt.message());
			});
		},
		endCallback: function(){
			service && service.exit();
		},
	});

	videoPanel.init({
		wrapperDom: videoWidget.querySelector(".video-panel"),
		service: service,
		dispatcher: dispatcher,
	});
}

function startTimer(){
	timerLabel.start();
}

function init(option){
	var opt;
	var triggerButton;
	var adapterPath;
	var eMediaSdkPath;

	if(
		window.location.protocol !== "https:"
		|| !Modernizr.peerconnection // UC 和 夸克 该方法返回false，不支持webRtc
		|| !profile.grayList.audioVideo
	) return;

	opt = option || {};
	triggerButton = opt.triggerButton;
	parentContainer = opt.parentContainer;

	adapterPath = STATIC_PATH + "/js/lib/adapter.min.js?v=unknown-000";
	eMediaSdkPath = STATIC_PATH + "/js/lib/EMedia_sdk.min.js?v=1.1.2";

	// todo: resolve promise sequentially
	tools.loadScript(adapterPath)
	.then(function(){
		return tools.loadScript(eMediaSdkPath);
	})
	.then(function(){
		eventListener.add(_const.SYSTEM_EVENT.VIDEO_TICKET_RECEIVED, _reveiveTicket);

		// 显示视频邀请按钮，并绑定事件
		utils.removeClass(triggerButton, "hide");
		utils.on(triggerButton, "click", function(){
			_initOnce();
			// dialog.show();
			_onConfirm();
		});
	});
	
}

function _pushStream(){
	var myStream = new service.AVPubstream({ voff: 0, aoff: 0, name: "video" });

	service.openUserMedia(myStream).then(function(){
		service.push(myStream);
	});
}

function _reveiveTicket(ticketInfo, ticketExtend){
	// 有可能收到客服的主动邀请，此时需要初始化
	_initOnce();

	// 加入会议
	service.setup(ticketInfo, {
		identity: "visitor",
		nickname: config.visitor.trueName || config.user.username,
		avatarUrl: "",
		extend: ticketExtend
	});
	statusBar.reset();

	// 访客邀请的，不显示，直接打开视频, 
	// 开启“视频通话允许访客二次确认”，需要确认
	var wrapperDom = videoWidget.querySelector(".status-bar"); 
	var acceptButtonDom = wrapperDom.querySelector(".accept-button");
	if(inviteByVisitor && config.videoH5Status == false){
		acceptButtonDom.click();
		utils.addClass(acceptButtonDom, "hide");
		inviteByVisitor = false;
		statusBar.show();
	}
	else{
		utils.removeClass(acceptButtonDom, "hide");
		// 访客二次确认
		if(inviteByVisitor && config.videoH5Status){
			statusBar.show();
			$(".visitor-invite-video-confirm").addClass("hide")
		}
		else{
			// 弹 “客服邀请” 窗
			agentInviteDialog.show();
			startTimer();
		}
	}
	
}

function _onConfirm(){
	inviteByVisitor = true;
	eventListener.trigger("video.conform");
	channel.sendText(__("video.invite_agent_video"), {
		ext: {
			type: "rtcmedia/video",
			msgtype: {
				liveStreamInvitation: {
					msg: __("video.invite_agent_video"),
					orgName: config.orgName,
					appName: config.appName,
					userName: config.user.username,
					imServiceNumber: config.toUser,
					restServer: config.restServer,
					xmppServer: config.xmppServer,
					resource: "webim",
					isNewInvitation: true,
					userAgent: navigator.userAgent,
				},
			},
		},
	});
	// 开启视频通话添加取消按钮
	// var el = utils.createElementFromHTML("<span class=\"em-widget-exit-video\">取消视频通话</span>");
	// var editor = document.querySelector(".toolbar");
	// editor.appendChild(el);
	// var el = utils.createElementFromHTML("<div class=\"swiper-slide em-widget-exit-video\">取消视频通话</div>");

	var $agentNickname = document.querySelector(".em-widget-header-nickname").innerText;
	var $agentFace = document.querySelector(".em-agent-face").src;
	visitorDialog = uikit.createDialog({
		contentDom: [
			"<div>",
			"<p class=\"title\">视频通话</p>",
			"<p class=\"time\"><p>",
			"<p> <img src=\""+ $agentFace +"\" class=\"\"/> </p>",
			"<p class=\"nickname\">"+ $agentNickname +"</p>",
			"<p class=\"title\">"+ __("video.confirm_prompt_visitor")+"</p>",
			// "<div class=\"foot\"> <svg class=\"icon svg-icon\" aria-hidden=\"true\"><use xlink:href=\"#newim-a-anwser1x\"></use> </svg></div>",
			"<div class=\"foot\">  <div class=\"button\"><i class=\"icon-huang\"></i> <span>"+ __("common.Hangup")+"</span></div> </div>",
			"</div>"
		].join(""),
		className: "visitor-invite-video-confirm",
	})
	visitorDialog.show();
	$(".visitor-invite-video-confirm .icon-huang").on("click",_onConfirmExitvideo);
}

function _onAgentInviteConfirm(){
	timerLabel.stop();
	statusBar.show();
	statusBar.accept();
	agentInviteDialog.hide();
}

function _onAgentInviteCancel(){
	timerLabel.stop();
	statusBar.end();
	agentInviteDialog.hide();
}

function _onConfirmExitvideo(){
	eventListener.trigger("video.cancel");
	var serviceSessionId = profile.currentOfficialAccount.sessionId;
	apiHelper.deleteVideoInvitation(serviceSessionId)
	.then(function(res){
			channel.sendText(__("video.invite_exit_video"), {
			// channel.sendText("访客取消实时视频", {
				ext: {
					type: "rtcmedia/video",
					msgtype: {
						visitorCancelInvitation: {
							msg: __("video.invite_exit_video"),
							// msg: "访客取消实时视频",
							orgName: config.orgName,
							appName: config.appName,
							userName: config.user.username,
							imServiceNumber: config.toUser,
							restServer: config.restServer,
							xmppServer: config.xmppServer,
							resource: "webim",
							// isNewInvitation: true,
							userAgent: navigator.userAgent,
						},
					},
				},
			});
			visitorDialog.hide();
			// // 取消通话移除按钮
			// var editor = document.querySelector(".toolbar");
			// var ele = document.querySelector(".em-widget-exit-video");
			// editor.removeChild(ele)
	});
	// return false;



}

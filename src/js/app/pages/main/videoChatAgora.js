/*
	视频流程
	1.加载声网sdk
	2.
		a. 访客发起邀请
		b. 坐席发起邀请
	3. 访客收到ticket
	4初始化sdk，回调
	5. 访客加入会议
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
var videoChatAgora = require("./uikit/videoChatAgora");
var videoConnecting = false; // 是否正在视频通话
var videoInviteButton = false;
var thirdAgentName = null;
var _initOnce = _.once(_init);
var parentContainer;
var videoWidget;
var dispatcher;

var config;
var dialog, agentInviteDialog, visitorDialog;
var timerBarDom, timerLabel;
var service;
var serviceAgora;
var cfgAgora;
var callId;
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
		// 允许访客二次确认接口
		apiHelper.getVideoH5Status().then(function(res){
			if(res.entity){
				config.videoH5Status = res.entity
			}
		})
	}

	dispatcher = new Dispatcher();

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
			"<p> <img src=\""+ $agentFace +"\" class=\"\"/> </p>",
			"<p class=\"nickname\">"+ $agentNickname +"</p>",
			"<p class=\"title\">"+ __("video.confirm_prompt_agent")+"</p>",
			"<div class=\"foot\"> <div class=\"button answer\"><i class=\"icon-answer\"></i> <span>接听</span></div> <div class=\"button huang\"><i class=\"icon-huang\"></i> <span>"+ __("common.refuse")+"</span></div> </div>",
			"</div>"
		].join(""),
		className: "agent-invite-video-confirm",
	})

	utils.live(".agent-invite-video-confirm .icon-answer","click",_onAgentInviteConfirm);
	utils.live(".agent-invite-video-confirm .icon-huang","click",_onAgentInviteCancel);


	timerBarDom = agentInviteDialog.el.querySelector(".time");
	timerLabel = new TimerLabel(timerBarDom);

	statusBar.init({
		wrapperDom: videoWidget.querySelector(".status-bar"),
		acceptCallback: function(){
			serviceAgora.join(cfgAgora).then(function(){
				videoConnecting = true;
				statusBar.hideAcceptButton();
				$(".video-chat-wrapper").removeClass("hide");
				$(".mini-video-argo").removeClass("hide");
				serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("mini-video-visitor");
				serviceAgora.localAudioTrack && serviceAgora.localAudioTrack.setMuted(false);
				// 访客头像大图展示
				utils.on($("#mini-video-visitor"), "click", function(){
					$(".big-video-argo").removeClass("hide");
					$(".mini-video-argo").addClass("hide");
					$(".toggle-microphone-btn").removeClass("hide");
					$(".toggle-carema-btn").removeClass("hide");
					$(".video-chat-wrapper").addClass("big-video");
					serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video-argo");
					$("#big-video-argo>.nickname").html("我")
				});
				utils.on($(".return-to-multi-video"), "click", function(){
					$(".big-video-argo").addClass("hide");
					$(".mini-video-argo").removeClass("hide");
					$(".toggle-microphone-btn").addClass("hide");
					$(".toggle-carema-btn").addClass("hide");
					$(".video-chat-wrapper").removeClass("big-video");
					serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("mini-video-visitor");
				});
				// 静音
				utils.on($(".toggle-microphone-btn"), "click", function(e){
					if($(e.target).hasClass("icon-microphone")){
						serviceAgora.localAudioTrack && serviceAgora.localAudioTrack.setMuted(true);
						$(e.target).addClass("icon-disable-microphone");
						$(e.target).removeClass("icon-microphone");
					}
					else{
						$(e.target).removeClass("icon-disable-microphone");
						$(e.target).addClass("icon-microphone");
						serviceAgora.localAudioTrack && serviceAgora.localAudioTrack.setMuted(false);
					}
				});
				// 关闭摄像头
				utils.on($(".toggle-carema-btn"), "click", function(e){
					if($(e.target).hasClass("icon-camera")){
						serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.setMuted(true);
						$(e.target).addClass("icon-disable-camera");
						$(e.target).removeClass("icon-camera");
					}
					else{
						$(e.target).removeClass("icon-disable-camera");
						$(e.target).addClass("icon-camera");
						serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.setMuted(false);
					}
				});
			})
		},
		endCallback: function(){
			$("#main-video-argo").addClass("hide")
			serviceAgora.leave();
			videoConnecting = false;
			videoInviteButton = false;
			statusBar.showClosing();
			// 挂断通知
			channel.sendCmdExitVideo(callId,{
				ext: {
					type: "agorartcmedia/video",
					msgtype: {
						visitorRejectInvitation:{
							callId:callId
						}
					},
				},
			})
			setTimeout(function(){
				$(".video-chat-wrapper").addClass("hide")
				$("#main-video-argo").removeClass("hide")
			}, 3000);
			// service && service.exit();
		},
	});

	videoPanel.init({
		wrapperDom: videoWidget.querySelector(".video-panel"),
		// service: service,
		dispatcher: dispatcher,
	});
	// 展开折叠
	utils.on($(".collapse-toggle-button"), "click", function(){
		if($(".video-chat-wrapper>.status-bar").hasClass("collapsed")){
			$("#main-video-argo").addClass("hide");
		}
		else{
			$("#main-video-argo").removeClass("hide");
		}
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
		|| !profile.grayList.agoraVideo
	) return;

	opt = option || {};
	triggerButton = opt.triggerButton;
	parentContainer = opt.parentContainer;

	adapterPath = STATIC_PATH + "/js/lib/adapter.min.js?v=unknown-000";
	eMediaSdkPath = STATIC_PATH + "/js/lib/EMedia_sdk.min.js?v=1.1.2";

	var eMediaSdkPathSW = STATIC_PATH + "/js/lib/AgoraRTC_N-4.8.0.js";
	tools.loadScript(adapterPath)
	.then(function(){
		return tools.loadScript(eMediaSdkPathSW);
	})
	.then(function(){
		eventListener.add(_const.SYSTEM_EVENT.VIDEO_TICKET_RECEIVED, _reveiveTicket);

		// 显示视频邀请按钮，并绑定事件
		utils.removeClass(triggerButton, "hide");
		utils.on(triggerButton, "click", function(){
			if(videoInviteButton) return;
			_initOnce();
			 serviceAgora = new videoChatAgora({});
			_onConfirm();
			videoInviteButton = true;
			//  serviceAgora.createLocalTracks();
		});
	});
	
}

// 收到ticket通知
function _reveiveTicket(ticketInfo, ticketExtend){
	if(ticketInfo.isThirdAgent && ticketInfo.agentTicket){
		thirdAgentName = ticketInfo.agentTicket.niceName;
	}
	if(videoConnecting) return;
	$(".video-chat-wrapper").removeClass("hide");
	// 有可能收到客服的主动邀请，此时需要初始化
	_initOnce();
	// 加入会议
	
	cfgAgora= {
		appid:ticketInfo.appId,
		channel:ticketInfo.channel,
		token:ticketInfo.token,
		uid:ticketInfo.uid
	}
	// callId 拒绝视频邀请要用
	callId = ticketInfo.callId;
	// 初始化声网SDK
 	serviceAgora = new videoChatAgora({onRemoteUserChange:function(remoteUSer){
		 	var userVideo0,userVideo1;
			remoteUSer.forEach(function (item,index){
				item.videoTrack && item.videoTrack.play("mini-video-agent" + index);
				item.audioTrack && item.audioTrack.play();
				if(index === 1){
					userVideo1 = item;
				}
				else{
					userVideo0 = item;
				}
				videoConnecting = true;
			});
			// 坐席的视频
			utils.on($("#mini-video-agent0"), "click", function(){
				$(".big-video-argo").removeClass("hide");
				$(".mini-video-argo").addClass("hide");
				userVideo0._videoTrack && userVideo0._videoTrack.play("big-video-argo");
				userVideo0._audioTrack && userVideo0._audioTrack.play();
				$("#big-video-argo>.nickname").html(profile.newNickName)
			});
			utils.on($(".return-to-multi-video"), "click", function(){
				$(".big-video-argo").addClass("hide");
				$(".mini-video-argo").removeClass("hide");
				userVideo0._videoTrack && userVideo0._videoTrack.play("mini-video-agent0");
				userVideo0._audioTrack && userVideo0._audioTrack.play();
			});

			// 第三方客服
			utils.on($("#mini-video-agent1"), "click", function(){
				$(".big-video-argo").removeClass("hide");
				$(".mini-video-argo").addClass("hide");
				userVideo1._videoTrack && userVideo1._videoTrack.play("big-video-argo");
				userVideo1._audioTrack && userVideo1._audioTrack.play();
				$("#big-video-argo>.nickname").html(thirdAgentName);
			});
			utils.on($(".return-to-multi-video"), "click", function(){
				$(".big-video-argo").addClass("hide");
				$(".mini-video-argo").removeClass("hide");
				userVideo1._videoTrack && userVideo1._videoTrack.play("mini-video-agent1");
				userVideo1._audioTrack && userVideo1._audioTrack.play();
			});
		},
		onUserLeft:function(){
			if(serviceAgora.remoteUsers.length != 1){
				return;
			}
			$("#main-video-argo").addClass("hide")
			serviceAgora.leave();
			videoConnecting = false;
			videoInviteButton = false;
			statusBar.showClosing();
			// 挂断通知
			channel.sendCmdExitVideo(callId,{
				ext: {
					type: "agorartcmedia/video",
					msgtype: {
						visitorRejectInvitation:{
							callId:callId
						}
					},
				},
			})
			setTimeout(function(){
				$(".video-chat-wrapper").addClass("hide")
				$("#main-video-argo").removeClass("hide")
			}, 3000);
		}
	});
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
			$(".video-chat-wrapper").addClass("hide");
		}
	}
	$(".visitor-invite-video-confirm").addClass("hide")
}

function _onConfirm(){
	inviteByVisitor = true;
	eventListener.trigger("video.conform");
	channel.sendText(__("video.invite_agent_video"), {
		ext: {
			// type: "rtcmedia/video",
			type: "agorartcmedia/video",
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
	$(".video-chat-wrapper").removeClass("hide");
	timerLabel.stop();
	statusBar.show();
	statusBar.accept();
	agentInviteDialog.hide();
	statusBar.hideAcceptButton();
}

function _onAgentInviteCancel(){
	channel.sendCmdExitVideo(callId,{
		ext: {
			type: "agorartcmedia/video",
			msgtype: {
				visitorRejectInvitation:{
					callId:callId
				}
			},
		},
	})
	agentInviteDialog.hide();
	timerLabel.stop();
	statusBar.end();
	agentInviteDialog.hide();
	videoInviteButton = false;
}

function _onConfirmExitvideo(){
	channel.sendCmdExitVideo(null,{
		ext: {
			type: "agorartcmedia/video",
			msgtype: {
				visitorCancelInvitation:{
					callId:null
				}
			},
		},
	})
	visitorDialog.hide();
	videoInviteButton = false;
}
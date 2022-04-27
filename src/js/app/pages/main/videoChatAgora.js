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
var videoAgoraTemplate = require("../../../../template/videoChatAgora.html");
var apiHelper = require("./apis");
var TimerLabel = require("./uikit/TimerLabel");
var videoChatAgora = require("./uikit/videoChatAgora");
var videoConnecting = false; // 是否正在视频通话
var videoInviteButton = false;
var thirdAgentName = null;
var shaDesktopSuccFlag = false;
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
			"<p class=\"title\">"+ __("toolbar.video_invite") + "</p>",
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
				$("#main-video-argo").removeClass("hide");
				$(".video-chat-wrapper").removeClass("hide");
				$(".mini-video-argo").removeClass("hide");
				$("#mini-video-agent0>.nickname").html(profile.newNickName);
				statusBar.setStatusText(__("video.connecting"));
				serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("mini-video-visitor");
				serviceAgora.localAudioTrack && serviceAgora.localAudioTrack.setMuted(false);
				// 访客头像大图展示
				utils.on($("#mini-video-visitor"), "click", function(){
					$(".big-video-argo").removeClass("hide");
					$(".mini-video-argo").addClass("hide");
					$(".toggle-microphone-btn").removeClass("hide");
					$(".toggle-carema-btn").removeClass("hide");
					$(".desktop-share").removeClass("hide");
					$(".video-chat-wrapper").addClass("big-video");
					if(!profile.grayList.shareDesktop){
						$('#big-video-argo>.desktop-share').addClass("hide");
					}
					if(shaDesktopSuccFlag){
						serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("big-video-argo");
					}
					else{
						serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video-argo");
					}
					$("#big-video-argo>.nickname").html("我")
				});
				utils.on($(".return-to-multi-video"), "click", function(){
					returnToMuti();
					if(shaDesktopSuccFlag){
						serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("mini-video-visitor");
					}
					else{
						serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("mini-video-visitor");
					}
				});
				// 静音
				$('#big-video-argo>.toggle-microphone-btn').unbind('click').bind('click',function (e){
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
				$('#big-video-argo>.toggle-carema-btn').unbind('click').bind('click',function (e){
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
			serviceAgora.client.unpublish(serviceAgora.localScreenVideoTrack);
			serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.close();
			serviceAgora.localScreenAudioTrack && serviceAgora.localScreenAudioTrack.close();
			returnToMuti();
			$("#main-video-argo").addClass("hide")
			serviceAgora.leave();
			videoConnecting = false;
			videoInviteButton = false;
			inviteByVisitor = false;
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
			shaDesktopSuccFlag = false;
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

	$('#big-video-argo>.icon-desktop').unbind('click').bind('click',function (e){
		onDesktopControl();
	});
}
function returnToMuti(){
	$(".big-video-argo").addClass("hide");
	$(".mini-video-argo").removeClass("hide");
	$(".toggle-microphone-btn").addClass("hide");
	$(".toggle-carema-btn").addClass("hide");
	$(".icon-desktop").addClass("hide");
	$(".video-chat-wrapper").removeClass("big-video");
	$(".toggle-microphone-btn").removeClass("icon-disable-microphone").addClass("icon-microphone");
	$(".toggle-carema-btn").removeClass("icon-disable-camera").addClass("icon-camera");
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
		eventListener.add(_const.SYSTEM_EVENT.VIDEO_ARGO_END, _closeVideo);
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
			returnToMuti();
			$("#mini-video-agent0>.nickname").html(profile.newNickName);
			// statusBar.setStatusText(__("video.connecting"));
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
			utils.on($("#mini-video-agent1"), "click", function(e){
				if(!e.currentTarget.children.length) return;
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
			returnToMuti();
			$("#main-video-argo").addClass("hide")
			serviceAgora.leave();
			videoConnecting = false;
			videoInviteButton = false;
			statusBar.showClosing();
			inviteByVisitor = false;
			shaDesktopSuccFlag = false;
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
			$("#main-video-argo").addClass("hide");
			$(".visitor-invite-video-confirm").addClass("hide")
		}
		else{
			// 弹 “客服邀请” 窗
			agentInviteDialog.show();
			startTimer();
			videoInviteButton = true;
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

	var $agentNickname = document.querySelector(".em-widget-header-nickname").innerText;
	var $agentFace = document.querySelector(".em-agent-face").src;
	visitorDialog = uikit.createDialog({
		contentDom: [
			"<div>",
			"<p class=\"title\">"+ __("toolbar.video_invite") +"</p>",
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
	// 拒绝的消息先注释跟原来保持一致
	// channel.sendText(__("video.invite_reject_video"), {
	// 	ext: {
	// 		type: "rtcmedia/video",
	// 		msgtype: {
	// 			visitorCancelInvitation: {
	// 				msg: __("video.invite_reject_video"),
	// 				callId:callId,
	// 			},
	// 		},
	// 	},
	// });
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
	inviteByVisitor = false;
}

function _onConfirmExitvideo(){
	channel.sendText(__("video.invite_exit_video"), {
		ext: {
			type: "rtcmedia/video",
			msgtype: {
				visitorCancelInvitation: {
					msg: __("video.invite_exit_video"),
					callId:callId,
				},
			},
		},
	});
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
	inviteByVisitor = false;
}
function _closeVideo(){
	serviceAgora.client.unpublish(serviceAgora.localScreenVideoTrack);
	serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.close();
	serviceAgora.localScreenAudioTrack && serviceAgora.localScreenAudioTrack.close();
	returnToMuti();
	$("#main-video-argo").addClass("hide")
	serviceAgora = serviceAgora.leave();
	videoConnecting = false;
	videoInviteButton = false;
	inviteByVisitor = false;
	statusBar.showClosing();
	setTimeout(function(){
		$(".video-chat-wrapper").addClass("hide")
		$("#main-video-argo").removeClass("hide")
	}, 3000);
	agentInviteDialog && agentInviteDialog.hide();
	shaDesktopSuccFlag = false;
}

// 共享桌面的打开关闭
function onDesktopControl(e){
	if(!profile.grayList.shareDesktop){
		return;
	}
	if(shaDesktopSuccFlag) {
  		shaDesktopSuccFlag = false;

  		serviceAgora.client.unpublish(serviceAgora.localScreenVideoTrack);
		serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.close();
		serviceAgora.localScreenAudioTrack && serviceAgora.localScreenAudioTrack.close();

  		serviceAgora.publish(serviceAgora.localVideoTrack);
  		serviceAgora.localVideoTrack.play("big-video-argo");
  		$(".desktop-share").removeClass("icon-desktop-selected");
  		$(".desktop-share").addClass("icon-desktop");
  		return;
	}
  
	serviceAgora.createScreenVideoTrack({TrackInitConfig:{},withAudio:"auto"})
    	.then(function(localScreenTrack){
			if(!localScreenTrack){
				$(".desktop-share").removeClass("icon-desktop-selected");
				$(".desktop-share").addClass("icon-desktop");
				return;
			};
			serviceAgora.client.unpublish(serviceAgora.localVideoTrack);
			serviceAgora.localVideoTrack.stop();

			if(serviceAgora.localScreenAudioTrack == null){
				serviceAgora.client.publish([serviceAgora.localScreenVideoTrack]);
			}
			else{
				serviceAgora.client.publish([serviceAgora.localScreenVideoTrack, serviceAgora.localScreenAudioTrack]);
			}
			serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("big-video-argo");
			serviceAgora.localScreenAudioTrack && serviceAgora.localScreenAudioTrack.play("");
			shaDesktopSuccFlag = true;
			// 浏览器停止共享按钮事件监听
			serviceAgora.localScreenVideoTrack.on("track-ended", function(){
				// 关闭共享
				shaDesktopSuccFlag = false;
				serviceAgora.client.unpublish(serviceAgora.localScreenVideoTrack);
				serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.close();
				serviceAgora.localScreenAudioTrack && serviceAgora.localScreenAudioTrack.close();
				// localScreenVideoTrack
				// 打开本地摄像头
				serviceAgora.publish(serviceAgora.localVideoTrack);
				
				if($(".big-video-argo").hasClass("hide")){
					serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("mini-video-visitor");
				}
				else{
					serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video-argo");
				}
				$(".desktop-share").removeClass("icon-desktop-selected");
				$(".desktop-share").addClass("icon-desktop");
			});
			$(".desktop-share").addClass("icon-desktop-selected");
			$(".desktop-share").removeClass("icon-desktop");
  		})
}
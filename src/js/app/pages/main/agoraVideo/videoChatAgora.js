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
var uikit = require("../uikit");
var channel = require("../channel");
var profile = require("@/app/tools/profile");
var eventListener = require("@/app/tools/eventListener");
var utils = require("@/common/utils");
var tools = require("@/app/tools/tools");
var Dispatcher = require("@/app/tools/Dispatcher");
var commonConfig = require("@/common/config");

var statusBar = require("../uikit/videoStatusBar");
var videoPanel = require("../uikit/videoPanel");
// var videoChatTemplate = require("../../../../template/videoChat.html");
var videoAgoraTemplate = require("../../../../../template/videoChatAgora.html");
var apiHelper = require("../apis");
var TimerLabel = require("../uikit/TimerLabel");
var videoChatAgora = require("../uikit/videoChatAgora");
var videoConnecting = false; // 是否正在视频通话
var videoInviteButton = false;
var thirdAgentName = null;
var shaDesktopSuccFlag = false;
var _initOnce = _.once(_init);
var parentContainer;
var videoWidget;
var dispatcher;
var enlargeEl = {};
var enlargeBefore = {};
var config;
var dialog, agentInviteDialog, visitorDialog;
var timerBarDom, timerLabel;
var service;
var serviceAgora;
var cfgAgora;
var callId;
var inviteByVisitor = false; //访客邀请的
var whiteBoardConnect = false; //白板是否处于连接中
var userVideo0,userVideo1;
var dragMove = require("../uikit/drag")

var STATIC_PATH = __("config.language") === "zh-CN" ? "static" : "../static";

module.exports = {
	init: init,
};

function _init(){
	if(videoWidget) return;
	// init dom
	videoWidget = utils.createElementFromHTML(_.template(videoAgoraTemplate)());

	parentContainer.appendChild(videoWidget);
	// parentContainer.appendChild(utils.createElementFromHTML(_.template(videoAgoraTemplate)()));

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
			"<p class=\"title\">"+ __("toolbar.video_invite") +"</p>",
			"<p class=\"time\"><p>",
			"<p> <img src=\""+ $agentFace +"\" class=\"\"/> </p>",
			"<p class=\"nickname\">"+ $agentNickname +"</p>",
			"<p class=\"title\">"+ __("video.confirm_prompt_agent")+"</p>",
			"<div class=\"foot\"> <div class=\"button answer\"><i class=\"icon-answer\"></i> <span>"+ __("video.answer") +"</span></div> <div class=\"button huang\"><i class=\"icon-huang\"></i> <span>"+ __("common.refuse")+"</span></div> </div>",
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
				$(".video-agora-wrapper").removeClass("hide");
				$('.end-button').addClass("hide");
				var visitorMicrophoneState = $("#visitor-video >.toggle-microphone-state");
				// $(".mini-video-argo").removeClass("hide");
				// $("#mini-video-agent0>.nickname").html(profile.newNickName);
				$("#visitor-video >.small-name").html(__("video.me"));
				if(serviceAgora._audio_muted_){
					// 静音
					visitorMicrophoneState.removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
				}
				else{
					visitorMicrophoneState.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
				}
				statusBar.setStatusText(__("video.connecting"));
				serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
				serviceAgora.localAudioTrack && serviceAgora.localAudioTrack.setMuted(false);
				// 静音
				$(".foot>.toggle-microphone-btn-agora").unbind('click').bind('click',function (e){
				// utils.on($(".foot>.toggle-microphone-btn-agora"), "click", function(e){
					if($(e.target).hasClass("icon-microphone-agora")){
						serviceAgora.localAudioTrack && serviceAgora.localAudioTrack.setMuted(true);
						$(e.target).addClass("icon-disable-microphone-agora");
						$(e.target).removeClass("icon-microphone-agora");
						if(!$("#visitor-video").hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big")){
							visitorMicrophoneState.removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
						}
						else if($("#visitor-video").hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big")){
							$(".nickNameWraper >.toggle-microphone-state").removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
						}
						else if(!$("#visitor-video").hasClass("visitor-big")  && $("#agent-video").hasClass("agent-big")){
							visitorMicrophoneState.removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
						}
					}
					else{
						$(e.target).removeClass("icon-disable-microphone-agora");
						$(e.target).addClass("icon-microphone-agora");
						serviceAgora.localAudioTrack && serviceAgora.localAudioTrack.setMuted(false);
						if(!$("#visitor-video").hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big")){
							visitorMicrophoneState.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
						}
						else if($("#visitor-video").hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big")){
							$(".nickNameWraper >.toggle-microphone-state").addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
						}
						else if(!$("#visitor-video").hasClass("visitor-big")  && $("#agent-video").hasClass("agent-big")){
							visitorMicrophoneState.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
						}
					}
				});
				// 关闭摄像头
				$(".foot>.toggle-carema-btn-agora").unbind('click').bind('click',function (e){
					if($(e.target).hasClass("icon-camera-agora")){
						serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.setMuted(true);
						$(e.target).addClass("icon-disable-camera-agora");
						$(e.target).removeClass("icon-camera-agora");
					}
					else{
						$(e.target).removeClass("icon-disable-camera-agora");
						$(e.target).addClass("icon-camera-agora");
						serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.setMuted(false);
					}
				});
				// 获取视频弹窗的宽高

				enlargeEl.width = $("#em-kefu-webim-chat").width();
				enlargeEl.height = $("#em-kefu-webim-chat").height();
				// 拖拽缩放
				_dragVideo();
			})
		},
		endCallback: function(){
			serviceAgora.client.unpublish(serviceAgora.localScreenVideoTrack);
			serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.close();
			serviceAgora.localScreenAudioTrack && serviceAgora.localScreenAudioTrack.close();
			returnToMuti();
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
			// setTimeout(function(){
			// 	$(".video-agora-wrapper").addClass("hide")
			// }, 3000);
			$(".video-agora-wrapper").addClass("hide")

		},
	});

	// // 展开折叠
	// utils.on($(".collapse-toggle-button"), "click", function(){
	// 	if($(".video-agora-wrapper>.status-bar").hasClass("collapsed")){
	// 		$("#main-video-argo").addClass("hide");
	// 	}
	// 	else{
	// 		$("#main-video-argo").removeClass("hide");
	// 	}
	// });

	utils.on($(".desktop-share-agora"), "click", function(){
		onDesktopControl();
	});
	// 挂电话
	utils.on($(".toggle-huang-agora"), "click", function(){
		_closeVideo();
	});
	// 共享桌面灰度，集成端 手机端共享桌面按钮先隐藏
	if(!profile.grayList.shareDesktop || $("body").hasClass("window-demo") || utils.isMobile){
		$('.foot>.desktop-share-agora').addClass("hide");
	}
	// 白板灰度
	if(!profile.grayList.whiteBoard){
		$('.foot>.toggle-white-board-agora').addClass("hide");
	}
	utils.on($(".toggle-enlarge"), "click", function(e){
		if($(e.currentTarget).hasClass("icon-enlarge") ){
			$(".toggle-enlarge").addClass("icon-reduction");
			$(".toggle-enlarge").removeClass("icon-enlarge");
			enlargeBefore.top = $(".video-agora-wrapper").offset().top;
			enlargeBefore.left = $(".video-agora-wrapper").offset().left;
			enlargeBefore.width = $(".video-agora-wrapper").width();
			enlargeBefore.height = $(".video-agora-wrapper").height();
			$(".video-agora-wrapper").css({ 'width': enlargeEl.width + 'px', 'height': enlargeEl.height + 'px','top':'0','left':'0','margin-left': '0px', 'margin-top': '0px','position': 'absolute' });
		}
		else{
			$(".toggle-enlarge").addClass("icon-enlarge");
			$(".toggle-enlarge").removeClass("icon-reduction");
			$(".video-agora-wrapper").css({ 'width': enlargeBefore.width + 'px', 'height': enlargeBefore.height + 'px','top': enlargeBefore.top + 'px','left':enlargeBefore.left + 'px','position': 'fixed' });
		}
	});
	// 缩小
	utils.on($(".icon-narrow"), "click", function(){
		$(".video-agora-wrapper").addClass("hide");
		$(".small-video").removeClass("hide");
		$(".small-video-box").removeClass("hide");
		_dragIconVideo();
	});
	utils.on($(".small-video-box"), "mousedown", function(e){
		var oldTim = new Date().getTime();
		utils.on($(".small-video-box"), "mouseup", function(e){
			if((new Date().getTime() - oldTim) > 300 ){
				return false;
			}
			$(".video-agora-wrapper").removeClass("hide");
			$(".small-video").addClass("hide");
			$(".small-video-box").addClass("hide");
		});
	});
	// 关闭白板
	utils.on($("#close-white"), "click", function(){
		console.log("关闭白板")
		var whiteVideo = $("#white-video");
		if(whiteVideo.hasClass("visitor-white")){
			serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video");
			whiteVideo.removeClass("visitor-white");
			$("#white-board").addClass("hide")
			$("#big-video").removeClass("hide")
		}
		else if(whiteVideo.hasClass("agent0-white")){
			userVideo0._videoTrack && userVideo0._videoTrack.play("big-video");
			whiteVideo.removeClass("agent0-white");
			$("#white-board").addClass("hide")
			$("#big-video").removeClass("hide")
		}
		else if(whiteVideo.hasClass("agent1-white")){
			userVideo1._videoTrack && userVideo1._videoTrack.play("big-video");
			whiteVideo.removeClass("agent1-white");
			$("#white-board").addClass("hide")
			$("#big-video").removeClass("hide")
		}
		creatWhiteboard.destoryWhiteboard(document.getElementById("white-board"));
		whiteVideo.addClass("hide");
		// $("#white-board").empty();
		whiteBoardConnect = false;
		$(".desktop-share-agora").css({"pointer-events":"auto"});
		$(".desktop-share-agora").removeClass("icon-desktop-selected");
		$(".toggle-white-board-agora").css({"pointer-events":"auto"});
		$(".toggle-white-board-agora").removeClass("icon-white-board-connect");
		$(".nickNameWraper").removeClass("hide");
		_dragVideo();
		_dragIconVideo();
	});
	$('.end-button').addClass("hide");
	_dragIconVideo();
	// 白板
	utils.on($(".toggle-white-board-agora"), "click", function(){
		if(whiteBoardConnect){
			return;
		}
		if($(".toggle-enlarge").hasClass("icon-enlarge") ){
			$(".toggle-enlarge").click();
		}
		$("#white-video").removeClass("hide");
		$("#white-video>img").addClass("hide");
		// whiteBoardInitDom();
		_inviteWhiteBoard();
	});
}
function returnToMuti(){
	$(".toggle-microphone-btn-agora").removeClass("icon-disable-microphone-agora").addClass("icon-microphone-agora");
	$(".toggle-carema-btn-agora").removeClass("icon-disable-camera-agora").addClass("icon-camera-agora");
	$(".small-video").addClass("hide");
	$(".small-video-box").addClass("hide");
	$("#visitor-video").removeClass("visitor-big");
	$("#agent-video").removeClass("agent-big");
	if($("body").hasClass("window-demo")){
		$(".video-agora-wrapper").css({ 'width':'360px', 'height':'416px','top':'50%','left':'50%','margin-left': '-180px', 'margin-top': '-208px','position': 'absolute'  });
	}
	else{
		$(".video-agora-wrapper").css({ 'width':'400px', 'height':'616px','top':'50%','left':'50%','margin-left': '-180px', 'margin-top': '-308px','position': 'absolute'  });
	}
	$("#white-video").removeClass("visitor agent0 agent1 visitor-white agent0-white agent1-white").addClass("hide");
	$("#white-board").addClass("hide");
	$("#big-video").removeClass("hide");
	// 恢复共享 白板按钮状态
	$(".desktop-share-agora").css({"pointer-events":"auto"});
	$(".desktop-share-agora").removeClass("icon-desktop-selected");
	$(".toggle-white-board-agora").css({"pointer-events":"auto"});
	$(".toggle-white-board-agora").removeClass("icon-white-board-connect");
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
	var whiteBoardPath = STATIC_PATH + "/js/lib/white_board.js";
	tools.loadScript(adapterPath)
	.then(function(){
		return tools.loadScript(eMediaSdkPathSW);
	})
	.then(function(){
		eventListener.add(_const.SYSTEM_EVENT.VIDEO_TICKET_RECEIVED, _reveiveTicket);
		eventListener.add(_const.SYSTEM_EVENT.VIDEO_ARGO_END, _closeVideo);
		eventListener.add(_const.SYSTEM_EVENT.WHITE_BOARD_RECEIVED, _receiveWhiteBoard);
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
	// 加载白板JS
	if(profile.grayList.whiteBoard){
		tools.loadScript(whiteBoardPath).then(function(){
			window.lodash = _.noConflict();
		})
	}
	
}

// 收到ticket通知
function _reveiveTicket(ticketInfo, ticketExtend){
	if(ticketInfo.isThirdAgent && ticketInfo.agentTicket){
		thirdAgentName = ticketInfo.agentTicket.niceName;
	}
	if(videoConnecting) return;
	$(".video-agora-wrapper").removeClass("hide");
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
			// returnToMuti();
			// statusBar.setStatusText(__("video.connecting"));
			var microphoneState = $(".nickNameWraper >.toggle-microphone-state");
			var visitorMicrophoneState = $("#visitor-video >.toggle-microphone-state");
			var whiteVideo = $("#white-video");
			remoteUSer.forEach(function (item,index){
				if(index === 1){
					userVideo1 = item;
					$("#agent-video").removeClass("hide");
					userVideo1._videoTrack && userVideo1._videoTrack.play("agent-video");
					userVideo1.audioTrack && userVideo1.audioTrack.play();
					if(userVideo1._audio_muted_){
						// 静音
						if(!$("#visitor-video").hasClass("visitor-big")  && $("#agent-video").hasClass("agent-big")){
							// 三方坐席大图
							userVideo1._videoTrack && userVideo1._videoTrack.play("big-video");
							userVideo0._videoTrack && userVideo0._videoTrack.play("agent-video");
							$(".nickNameWraper >.toggle-microphone-state").removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
							$(".video-agora-wrapper .nickNameWraper >.nickName").html(__("chat.agent") + thirdAgentName);
						}
						else if(!$("#visitor-video").hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big")){
							// 坐席大图，三方坐席小图
							userVideo1._videoTrack && userVideo1._videoTrack.play("agent-video");
							if(serviceAgora.localScreenVideoTrack && !serviceAgora.localScreenVideoTrack._isClosed){
								serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("big-video");
							}
							else{
								// serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video");
								userVideo0._videoTrack && userVideo0._videoTrack.play("big-video");
							}
							$("#agent-video  >.toggle-microphone-state").removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
							$("#agent-video >.small-name").html(__("chat.agent") + thirdAgentName);
						}
						else if($("#visitor-video").hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big")){
							userVideo1._videoTrack && userVideo1._videoTrack.play("agent-video");
							userVideo0._videoTrack && userVideo0._videoTrack.play("visitor-video");
							$("#agent-video  >.toggle-microphone-state").removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
							$("#agent-video >.small-name").html(__("chat.agent") + thirdAgentName);
						}
						// $("#agent-video >.toggle-microphone-state").removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
					}
					else{
						if(!$("#visitor-video").hasClass("visitor-big")  && $("#agent-video").hasClass("agent-big")){
							// 三方坐席大图
							if(whiteBoardConnect){
								userVideo1._videoTrack && userVideo1._videoTrack.play("agent-video");
							}
							else{
								userVideo1._videoTrack && userVideo1._videoTrack.play("big-video");
								userVideo0._videoTrack && userVideo0._videoTrack.play("agent-video");
							}
							microphoneState.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
							$(".video-agora-wrapper .nickNameWraper >.nickName").html("客服" + thirdAgentName);
						}
						else if(!$("#visitor-video").hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big")){
							// 坐席大图，三方坐席小图
							if(whiteBoardConnect){
								userVideo1._videoTrack && userVideo1._videoTrack.play("agent-video");
							}
							else{
								userVideo1._videoTrack && userVideo1._videoTrack.play("agent-video");
								userVideo0._videoTrack && userVideo0._videoTrack.play("big-video");
							}
							$("#agent-video >.toggle-microphone-state").addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
							$("#agent-video >.small-name").html(__("chat.agent") + thirdAgentName);
						}
						else if($("#visitor-video").hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big")){
							if(whiteBoardConnect){
								userVideo1._videoTrack && userVideo1._videoTrack.play("agent-video");
							}
							else{
								userVideo1._videoTrack && userVideo1._videoTrack.play("agent-video");
								userVideo0._videoTrack && userVideo0._videoTrack.play("visitor-video");
							}
							$("#agent-video >.toggle-microphone-state").addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
							$("#agent-video >.small-name").html(__("chat.agent") + thirdAgentName);
						}
					}
				}
				else{
					if(whiteBoardConnect){
						return
					}
					userVideo0 = item;
					$("#agent-video").addClass("hide");
					if(userVideo0._audio_muted_){
						// 静音
						if($("#visitor-video").hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big")){
							// 访客大图
							// serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video");
							if(serviceAgora.localScreenVideoTrack && !serviceAgora.localScreenVideoTrack._isClosed){
								serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("big-video");
							}
							else{
								serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video");
							}
							userVideo0._videoTrack && userVideo0._videoTrack.play("visitor-video");
							$("#visitor-video >.toggle-microphone-state").removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
							$("#visitor-video >.small-name").html(__("chat.agent") + profile.newNickName);
						}
						else if(!$("#visitor-video").hasClass("visitor-big")  && $("#agent-video").hasClass("agent-big")){
							// 三方坐席大图
							// serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
							if(serviceAgora.localScreenVideoTrack && !serviceAgora.localScreenVideoTrack._isClosed){
								serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("visitor-video");
							}
							else{
								serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
							}
							userVideo0._videoTrack && userVideo0._videoTrack.play("agent-video");
							$("#agent-video >.toggle-microphone-state").removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
							$("#agent-video .nickNameWraper >.nickName").html(__("chat.agent") + profile.newNickName);
						}
						else if(!$("#visitor-video").hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big")){
							// 访客小图
							// serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
							if(serviceAgora.localScreenVideoTrack && !serviceAgora.localScreenVideoTrack._isClosed){
								serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("visitor-video");
							}
							else{
								serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
							}
							userVideo0._videoTrack && userVideo0._videoTrack.play("big-video");
							userVideo0.audioTrack && userVideo0.audioTrack.play();
							$(".nickNameWraper >.toggle-microphone-state").removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
							$(".video-agora-wrapper .nickNameWraper >.nickName").html(__("chat.agent") + profile.newNickName);
						}
						// microphoneState.removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
					}
					else{
						if($("#visitor-video").hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big")){
							// 访客大图
							// serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video");
							if(serviceAgora.localScreenVideoTrack && !serviceAgora.localScreenVideoTrack._isClosed){
								serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("big-video");
							}
							else{
								serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video");
							}
							userVideo0._videoTrack && userVideo0._videoTrack.play("visitor-video");
							userVideo0.audioTrack && userVideo0.audioTrack.play();
							$("#visitor-video >.toggle-microphone-state").addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
							$("#visitor-video >.small-name").html(__("chat.agent") + profile.newNickName);
						}
						else if(!$("#visitor-video").hasClass("visitor-big")  && $("#agent-video").hasClass("agent-big")){
							// 三方坐席大图
							if(serviceAgora.localScreenVideoTrack && !serviceAgora.localScreenVideoTrack._isClosed){
								serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("visitor-video");
							}
							else{
								serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
							}
							userVideo0._videoTrack && userVideo0._videoTrack.play("agent-video");
							userVideo1._videoTrack && userVideo1._videoTrack.play("big-video");
							$("#agent-video  >.toggle-microphone-state").addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
							$("#agent-video .nickNameWraper >.nickName").html(__("chat.agent") + profile.newNickName);
						}
						else if(!$("#visitor-video").hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big")){
							// 访客小图
							if(serviceAgora.localScreenVideoTrack && !serviceAgora.localScreenVideoTrack._isClosed){
								serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("visitor-video");
							}
							else{
								serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
							}
							userVideo0._videoTrack && userVideo0._videoTrack.play("big-video");
							userVideo0.audioTrack && userVideo0.audioTrack.play();
							$(".nickNameWraper  >.toggle-microphone-state").addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
							$(".video-agora-wrapper .nickNameWraper >.nickName").html(__("chat.agent") + profile.newNickName);
						}
					}
				}
				videoConnecting = true;
			});
			if(remoteUSer.length === 1){
				if(bigVideoEl() === "1"){
					$("#agent-video >.small-name").html("");
					$("#agent-video >.toggle-microphone-state").addClass("hide");
					userVideo0._videoTrack && userVideo0._videoTrack.play("big-video");
					$(".video-agora-wrapper .nickNameWraper >.nickName").html(__("chat.agent") + profile.newNickName);
				}
				else{
					$("#agent-video >.small-name").html("");
					$("#agent-video >.toggle-microphone-state").addClass("hide");
				}
				$("#agent-video").addClass("hide");
			}
			// 第三方客服
			$('#agent-video').unbind('click').bind('click',function (e){
				if(whiteBoardConnect){
					$("#white-board").addClass("hide")
					$("#big-video").removeClass("hide")
					$("#white-video>img").removeClass("hide");
					$("#white-video >.small-name").addClass("hide")
					$("#white-video  >.toggle-microphone-state").addClass("hide");
					whiteVideo.removeClass("visitor agent0 agent1 visitor-white agent0-white agent1-white");
				}
				if($(e.currentTarget).hasClass("agent-big") && !$("#visitor-video").hasClass("visitor-big")){
					userVideo0._videoTrack && userVideo0._videoTrack.play("big-video");
					userVideo1._videoTrack && userVideo1._videoTrack.play("agent-video");
					whiteVideo.addClass("agent0");
					$(e.currentTarget).removeClass("agent-big")
					$(".video-agora-wrapper .nickNameWraper >.nickName").html(__("chat.agent") + profile.newNickName);
					$("#agent-video >.small-name").html(__("chat.agent") + thirdAgentName);
					if(userVideo1._audio_muted_){
						// 静音
						// microphoneState.removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
						$("#agent-video >.toggle-microphone-state").removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
					}
					else{
						$("#agent-video >.toggle-microphone-state").addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
					}
					if(userVideo0._audio_muted_){
						// 静音
						microphoneState.removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
					}
					else{
						microphoneState.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
					}
				}
				else if(!$(e.currentTarget).hasClass("agent-big") && !$("#visitor-video").hasClass("visitor-big")){
					userVideo0._videoTrack && userVideo0._videoTrack.play("agent-video");
					userVideo1._videoTrack && userVideo1._videoTrack.play("big-video");
					whiteVideo.addClass("agent1");
					$(e.currentTarget).addClass("agent-big")
					$(".video-agora-wrapper .nickNameWraper >.nickName").html(__("chat.agent") + thirdAgentName);
					$("#agent-video >.small-name").html(__("chat.agent") +  profile.newNickName);
					if(userVideo1._audio_muted_){
						// 静音
						$(".nickNameWraper >.toggle-microphone-state").removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
					}
					else{
						$(".nickNameWraper >.toggle-microphone-state").addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
					}
					if(userVideo0._audio_muted_){
						// 静音
						$("#agent-video >.toggle-microphone-state").removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
					}
					else{
						$("#agent-video >.toggle-microphone-state").addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
					}
				}
				else if(!$(e.currentTarget).hasClass("agent-big") && $("#visitor-video").hasClass("visitor-big")){
					userVideo1._videoTrack && userVideo1._videoTrack.play("big-video");
					userVideo0._videoTrack && userVideo0._videoTrack.play("agent-video");
					whiteVideo.addClass("agent1");
					// serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
					if(serviceAgora.localScreenVideoTrack && !serviceAgora.localScreenVideoTrack._isClosed){
						serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("visitor-video");
					}
					else{
						serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
					}
					$(e.currentTarget).addClass("agent-big");
					$("#visitor-video").removeClass("visitor-big")
					$(".video-agora-wrapper .nickNameWraper >.nickName").html(__("chat.agent") + thirdAgentName);
					$("#agent-video >.small-name").html(__("chat.agent") +  profile.newNickName);
					$("#visitor-video >.small-name").html(__("video.me"));
					if(userVideo1._audio_muted_){
						// 静音
						$("#agent-video >.toggle-microphone-state").removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
					}
					else{
						$("#agent-video >.toggle-microphone-state").addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
					}
					if(userVideo0._audio_muted_){
						// 静音
						microphoneState.removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
					}
					else{
						microphoneState.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
					}
				}
			});

			// 访客的视频
			$('#visitor-video').unbind('click').bind('click',function (e){
				$(".nickNameWraper").removeClass("hide");
				if(whiteBoardConnect){
					// creatWhiteboard.default(document.getElementById("white-video"),{uuid:"0c7c3e80bd5d11ec97cdebb70556e411",userId:"0c7c3e80bd5d11ec97cdebb70556e411",identity:"joiner",region:"cn-hz"})
					$("#white-board").addClass("hide")
					$("#big-video").removeClass("hide")
					$("#white-video >.small-name").addClass("hide")
					$("#white-video  >.toggle-microphone-state").addClass("hide");
					$("#white-video>img").removeClass("hide");
					whiteVideo.removeClass("visitor agent0 agent1 visitor-white agent0-white agent1-white");
				}
				if($(e.currentTarget).hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big") ){
					userVideo0._videoTrack && userVideo0._videoTrack.play("big-video");
					whiteVideo.addClass("agent0");
					if(serviceAgora.localScreenVideoTrack && !serviceAgora.localScreenVideoTrack._isClosed){
						serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("visitor-video");
					}
					else{
						serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
					}
					$(e.currentTarget).removeClass("visitor-big");
					$(".video-agora-wrapper .nickNameWraper >.nickName").html(__("chat.agent") + profile.newNickName);
					$("#visitor-video >.small-name").html(__("video.me"));
					if(userVideo0._audio_muted_){
						// 静音
						microphoneState.removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
					}
					else{
						microphoneState.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
					}
					if(serviceAgora.localAudioTrack._muted){
						// 静音
						visitorMicrophoneState.removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
					}
					else{
						visitorMicrophoneState.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
					}
				}
				else if(!$(e.currentTarget).hasClass("visitor-big")  && !$("#agent-video").hasClass("agent-big") ){
					userVideo0._videoTrack && userVideo0._videoTrack.play("visitor-video");
					whiteVideo.addClass("visitor");
					if(serviceAgora.localScreenVideoTrack && !serviceAgora.localScreenVideoTrack._isClosed){
						serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("big-video");
					}
					else{
						serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video");
					}
					$(e.currentTarget).addClass("visitor-big");
					$(".video-agora-wrapper .nickNameWraper >.nickName").html(__("video.me"));
					$("#visitor-video >.small-name").html(__("chat.agent") + profile.newNickName);
					if(serviceAgora.localAudioTrack._muted){
						// 静音
						microphoneState.removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
					}
					else{
						microphoneState.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
					}
					if(userVideo0._audio_muted_){
						// 静音
						visitorMicrophoneState.removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
					}
					else{
						visitorMicrophoneState.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled").removeClass("hide");
					}
				}
				else if(!$(e.currentTarget).hasClass("visitor-big")  && $("#agent-video").hasClass("agent-big") ){
					// serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video");
					if(serviceAgora.localScreenVideoTrack && !serviceAgora.localScreenVideoTrack._isClosed){
						serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("big-video");
					}
					else{
						serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video");
					}
					userVideo0._videoTrack && userVideo0._videoTrack.play("visitor-video");
					userVideo1._videoTrack && userVideo1._videoTrack.play("agent-video");
					whiteVideo.addClass("visitor");
					$(e.currentTarget).addClass("visitor-big");
					$("#agent-video").removeClass("agent-big");
					$(".video-agora-wrapper .nickNameWraper >.nickName").html(__("video.me"));
					$("#visitor-video >.small-name").html(__("chat.agent") + profile.newNickName);
					$("#agent-video >.small-name").html(__("chat.agent") +  thirdAgentName);
				}

			});
			// 白板
			whiteVideo.unbind('click').bind('click',function (e){
				var whitSmallName = $("#white-video >.small-name");
				var white_board =  $("#white-board");
				var big_video = $("#big-video");
				if(whiteVideo.hasClass("visitor")){
					serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("white-video");
					whiteVideo.removeClass("visitor hide");
					white_board.removeClass("hide")
					big_video.addClass("hide")
					whitSmallName.removeClass("hide");
					whitSmallName.html(__("video.me"));
					whiteState();
				}
				else if(whiteVideo.hasClass("agent0")){
					userVideo0._videoTrack && userVideo0._videoTrack.play("white-video");
					whiteVideo.removeClass("agent0 hide");
					white_board.removeClass("hide")
					big_video.addClass("hide")
					whitSmallName.removeClass("hide");
					whitSmallName.html(__("chat.agent") + profile.newNickName);
					whiteState();
				}
				else if(whiteVideo.hasClass("agent1")){
					userVideo1._videoTrack && userVideo1._videoTrack.play("white-video");
					whiteVideo.removeClass("agent1 hide");
					white_board.removeClass("hide")
					big_video.addClass("hide")
					whitSmallName.removeClass("hide");
					whitSmallName.html(__("chat.agent") + thirdAgentName);
					whiteState();
				}
				else if(whiteVideo.hasClass("visitor-white")){
					serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video");
					$("#white-video>img").removeClass("hide");
					whiteVideo.removeClass("visitor-white");
					white_board.addClass("hide")
					big_video.removeClass("hide")
					whitSmallName.addClass("hide");
					$(".nickNameWraper").removeClass("hide");
					$("#white-video  >.toggle-microphone-state").addClass("hide");
				}
				else if(whiteVideo.hasClass("agent0-white")){
					userVideo0._videoTrack && userVideo0._videoTrack.play("big-video");
					$("#white-video>img").removeClass("hide");
					whiteVideo.removeClass("agent0-white");
					white_board.addClass("hide")
					big_video.removeClass("hide")
					whitSmallName.addClass("hide");
					$(".nickNameWraper").removeClass("hide");
					$("#white-video  >.toggle-microphone-state").addClass("hide");
				}
				else if(whiteVideo.hasClass("agent1-white")){
					userVideo1._videoTrack && userVideo1._videoTrack.play("big-video");
					$("#white-video>img").removeClass("hide");
					whiteVideo.removeClass("agent1-white");
					white_board.addClass("hide")
					big_video.removeClass("hide")
					whitSmallName.addClass("hide");
					$(".nickNameWraper").removeClass("hide");
					$("#white-video  >.toggle-microphone-state").addClass("hide");
				}
				else{
					whiteState();
					white_board.removeClass("hide")
					big_video.addClass("hide")
				}
			});
		},
		onUserLeft:function(){
			if(serviceAgora.remoteUsers.length != 1){
				return;
			}
			returnToMuti();
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
			// setTimeout(function(){
			// 	$(".video-agora-wrapper").addClass("hide")
			// }, 3000);
			$(".video-agora-wrapper").addClass("hide")

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
			// statusBar.show();
			// $('.end-button').removeClass("hide");
			// $(".visitor-invite-video-confirm").addClass("hide")
			// 弹 “客服邀请” 窗
			agentInviteDialog.show();
			startTimer();
			// videoInviteButton = true;
			$(".video-agora-wrapper").addClass("hide");
		}
		else{
			// 弹 “客服邀请” 窗
			agentInviteDialog.show();
			startTimer();
			videoInviteButton = true;
			$(".video-agora-wrapper").addClass("hide");
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
	$(".video-agora-wrapper").removeClass("hide");
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
	serviceAgora.client && serviceAgora.client.unpublish(serviceAgora.localScreenVideoTrack);
	serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.close();
	serviceAgora.localScreenAudioTrack && serviceAgora.localScreenAudioTrack.close();
	returnToMuti();
	serviceAgora && serviceAgora.leave();
	videoConnecting = false;
	videoInviteButton = false;
	inviteByVisitor = false;
	statusBar.showClosing();
	whiteBoardConnect = false;
	$(".toggle-enlarge").removeClass("icon-reduction").addClass("icon-enlarge")
	$(".video-agora-wrapper").addClass("hide")
	agentInviteDialog && agentInviteDialog.hide();
	shaDesktopSuccFlag = false;
	creatWhiteboard && creatWhiteboard.destoryWhiteboard(document.getElementById("white-board"));
}

// 共享桌面的打开关闭
function onDesktopControl(e){
	if(shaDesktopSuccFlag) {
  		shaDesktopSuccFlag = false;

  		serviceAgora.client.unpublish(serviceAgora.localScreenVideoTrack);
		serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.close();
		serviceAgora.localScreenAudioTrack && serviceAgora.localScreenAudioTrack.close();

		if(bigVideoEl() == "0"){
			serviceAgora.publish(serviceAgora.localVideoTrack);
			serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video");
		}
		else if(bigVideoEl() == "1"){
			serviceAgora.publish(serviceAgora.localVideoTrack);
			serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
		}
		else{
			serviceAgora.publish(serviceAgora.localVideoTrack);
			serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
			// userVideo0._videoTrack && userVideo0._videoTrack.play("big-video");
		}
  		$(".desktop-share-agora").removeClass("icon-desktop-selected");
  		$(".desktop-share-agora").addClass("icon-desktop");
  		return;
	}
  
	serviceAgora.createScreenVideoTrack({TrackInitConfig:{},withAudio:"auto"})
    	.then(function(localScreenTrack){
			if(!localScreenTrack){
				$(".desktop-share-agora").removeClass("icon-desktop-selected");
				$(".desktop-share-agora").addClass("icon-desktop");
				return;
			};

			if(serviceAgora.localScreenAudioTrack == null){
				serviceAgora.client.publish([serviceAgora.localScreenVideoTrack]);
			}
			else{
				serviceAgora.client.publish([serviceAgora.localScreenVideoTrack, serviceAgora.localScreenAudioTrack]);
			}
			serviceAgora.client.unpublish(serviceAgora.localVideoTrack);
			serviceAgora.localVideoTrack.stop();
			if(bigVideoEl() == "0"){
				// serviceAgora.client.unpublish(serviceAgora.localVideoTrack);
				// serviceAgora.localVideoTrack.stop();
				serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("big-video");
				serviceAgora.localScreenAudioTrack && serviceAgora.localScreenAudioTrack.play();
			}
			else if(bigVideoEl() == "1"){
				// userVideo1._videoTrack && userVideo1._videoTrack.stop();
				serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("visitor-video");
				serviceAgora.localScreenAudioTrack && serviceAgora.localScreenAudioTrack.play();
			}
			else{
				// userVideo0._videoTrack && userVideo0._videoTrack.stop();
				serviceAgora.localScreenVideoTrack && serviceAgora.localScreenVideoTrack.play("visitor-video");
				serviceAgora.localScreenAudioTrack && serviceAgora.localScreenAudioTrack.play();
			}

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
				if(bigVideoEl() == "0"){
					serviceAgora.publish(serviceAgora.localVideoTrack);
					serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("big-video");
				}
				else if(bigVideoEl() == "1"){
					serviceAgora.publish(serviceAgora.localVideoTrack);
					serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
				}
				else{
					serviceAgora.publish(serviceAgora.localVideoTrack);
					serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("visitor-video");
					// userVideo0._videoTrack && userVideo0._videoTrack.play("big-video");
				}

				$(".desktop-share-agora").removeClass("icon-desktop-selected");
				$(".desktop-share-agora").addClass("icon-desktop");
			});
			$(".desktop-share-agora").addClass("icon-desktop-selected");
			$(".desktop-share-agora").removeClass("icon-desktop");
  		})
}

function bigVideoEl(){
	// 0 访客在大图展示  1 三方坐席在大图展示   2坐席在大图展示
	if($("#visitor-video").hasClass("visitor-big")){
		return "0";
	}
	else if($("#agent-video").hasClass("agent-big")){
		return "1";
	}
	else{
		return "2";
	}
}
function _dragVideo(){
	dragMove.drag({
		parentdraf : '.video-agora-wrapper' , // 拖拽元素父级
		draftin : '.video-agora-wrapper' , // 拖拽元素
		// sizeLeft : '.video-agora-wrapper  .barl', // 改变大小左边
		sizeRight : '.video-agora-wrapper  .barr', // 改变大小右边
		// sizeTop : '.video-agora-wrapper  .bart', // 改变大小上边
		sizeBottom : '.video-agora-wrapper  .barb',  // 改变大小下边
		sizeSkew : '.video-agora-wrapper .bar'
	},utils.isMobile);
}
function _dragIconVideo(){
	dragMove.drag({
		parentdraf : '.small-video-box' , // 拖拽元素父级
		draftin : '.small-video-box' , // 拖拽元素
	},utils.isMobile);
}
function _receiveWhiteBoard(roomInfo){
	if(roomInfo && !whiteBoardConnect){
		if($(".toggle-enlarge").hasClass("icon-enlarge") ){
			$(".toggle-enlarge").click();
		}
		dragMove.offDarg('.video-agora-wrapper');  // 禁止拖拽
		dragMove.drag({
			parentdraf : '.video-agora-wrapper' , // 拖拽元素父级
			draftin : '.video-agora-wrapper .foot' , // 拖拽元素
		},utils.isMobile);
		dragMove.drag({
			parentdraf : '.video-agora-wrapper' , // 拖拽元素父级
			draftin : '.video-agora-wrapper .top' , // 拖拽元素
		},utils.isMobile);
		$(".desktop-share-agora").css({"pointer-events":"none"});
		$(".desktop-share-agora").addClass("icon-desktop-selected");
		$(".toggle-white-board-agora").css({"pointer-events":"none"});
		$(".toggle-white-board-agora").addClass("icon-white-board-connect");
		whiteBoardInitDom(roomInfo.roomUUID,callId,"creator","cn-hz",roomInfo.roomToken,roomInfo.appIdentifier,config.tenantId,callId);
	}
}
function _inviteWhiteBoard(){
	channel.sendCmdExitVideo(callId,{
		ext: {
			type: "agorartcmedia/video",
			msgtype: {
				whiteboardInvitaion:{
					callId:callId
				}
			},
		},
	});
}
function whiteBoardInitDom(uuid,callId,identity,region,roomToken,appIdentifier,tenantId,callId){
	var whiteMicrophone = $("#white-video  >.toggle-microphone-state");
	if(bigVideoEl() === "0"){
		serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("white-video");
		$("#white-video").addClass("visitor-white");
		whiteMicrophone.removeClass("icon-microphone-enable").addClass("icon-microphone-disabled");
		$("#white-video >.small-name").html(__("video.me"));
		if(serviceAgora.localAudioTrack._muted){
			// 静音
			whiteMicrophone.removeClass("icon-microphone-enable hide").addClass("icon-microphone-disabled");
		}
		else{
			whiteMicrophone.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled hide");
		}
	}
	else if(bigVideoEl() === "1"){
		userVideo1._videoTrack && userVideo1._videoTrack.play("white-video");
		$("#white-video").addClass("agent1-white");
		$("#white-video >.small-name").html(__("chat.agent") + thirdAgentName);
		if(userVideo1._audio_muted_){
			// 静音
			whiteMicrophone.removeClass("icon-microphone-enable hide").addClass("icon-microphone-disabled");
		}
		else{
			whiteMicrophone.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled hide");
		}
	}
	else{
		userVideo0._videoTrack && userVideo0._videoTrack.play("white-video");
		$("#white-video").addClass("agent0-white");
		$("#white-video >.small-name").html(__("chat.agent") + profile.newNickName);
		if(userVideo0._audio_muted_){
			// 静音
			whiteMicrophone.removeClass("icon-microphone-enable hide").addClass("icon-microphone-disabled");
		}
		else{
			whiteMicrophone.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled hide");
		}
	}
	if($("#white-board").hasClass("hide")){
		$("#white-board").removeClass("hide")
		$("#white-video").removeClass("hide");
		$("#big-video").addClass("hide");
		$(".nickNameWraper").addClass("hide");
        // const {uuid, userId, identity,region,roomToken,appIdentifier,tenantId,callId} = this.props;

		creatWhiteboard.creatWhiteboard(document.getElementById("white-board"),{uuid:uuid,userId:callId,identity:identity,region:region,roomToken:roomToken,appIdentifier:appIdentifier,tenantId:tenantId,callId:callId,language:__("config.language"),floatBar:!utils.isMobile})
		whiteBoardConnect = true;
	}
}
function whiteState(){
	var whiteVideo = $("#white-video");
	var whiteMicrophone = $("#white-video  >.toggle-microphone-state");
	$("#white-video>img").addClass("hide");
	whiteVideo.removeClass("visitor agent0 agent1");
	$(".nickNameWraper").addClass("hide");
	$("#white-video >.small-name").removeClass("hide");
	if(bigVideoEl() === "0"){
		serviceAgora.localVideoTrack && serviceAgora.localVideoTrack.play("white-video");
		whiteVideo.addClass("visitor-white");
		$("#white-video >.small-name").html(__("video.me"));
		if(serviceAgora.localAudioTrack._muted){
			// 静音
			whiteMicrophone.removeClass("icon-microphone-enable hide").addClass("icon-microphone-disabled");
		}
		else{
			whiteMicrophone.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled hide");
		}
	}
	else if(bigVideoEl() === "1"){
		userVideo1._videoTrack && userVideo1._videoTrack.play("white-video");
		whiteVideo.addClass("agent1-white");
		$("#white-video >.small-name").html(__("chat.agent")+ thirdAgentName);
		if(userVideo1._audio_muted_){
			// 静音
			whiteMicrophone.removeClass("icon-microphone-enable hide").addClass("icon-microphone-disabled");
		}
		else{
			whiteMicrophone.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled hide");
		}
	}
	else{
		userVideo0._videoTrack && userVideo0._videoTrack.play("white-video");
		whiteVideo.addClass("agent0-white");
		$("#white-video >.small-name").html(__("chat.agent") + profile.newNickName);
		if(userVideo0._audio_muted_){
			// 静音
			whiteMicrophone.removeClass("icon-microphone-enable hide").addClass("icon-microphone-disabled");
		}
		else{
			whiteMicrophone.addClass("icon-microphone-enable").removeClass("icon-microphone-disabled hide");
		}
	}
}

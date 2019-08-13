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

var _const = require("../../common/const");
var uikit = require("./uikit");
var channel = require("./channel");
var profile = require("./tools/profile");
var eventListener = require("./tools/eventListener");
var utils = require("../../common/utils");
var tools = require("./tools/tools");
var Dispatcher = require("./tools/Dispatcher");

var statusBar = require("./uikit/videoStatusBar");
var videoPanel = require("./uikit/videoPanel");
var videoChatTemplate = require("raw-loader!../../../template/videoChat.html");
var TimerLabel = require("./uikit/TimerLabel");
var _initOnce = _.once(_init);
var parentContainer;
var videoWidget;
var dispatcher;

var config;
var dialog;
var service;
var pubAVP;
var hasInited = false;
var timerLeftTop;

module.exports = {
	init: init,
	isInited: function(){
		return hasInited;
	},
	startVideo: function(){
		console.log("start video call");
		_initOnce();
		_onConfirm();
	}
};

function _init(){
	if(videoWidget) return;
	// init dom
	videoWidget = utils.createElementFromHTML(_.template(videoChatTemplate)());
	timerLeftTop = new TimerLabel(videoWidget.querySelector(".timer-box"));
	parentContainer.appendChild(videoWidget);

	config = profile.config;

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
				service.closePubstream(pubAVP);
				window.transfer.send({ event: _const.EVENTS.CLOSE });
				videoPanel.hide();
				document.querySelector(".video-chat-wrapper").style.display = "none";
				videoWidget.querySelector(".toolbar").style.display = "none";
				videoWidget.querySelector(".active-userinfo").style.display = "none";
				timerLeftTop.stop();
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

	statusBar.init({
		wrapperDom: videoWidget.querySelector(".status-bar"),
		acceptCallback: function(){
			statusBar.hideAcceptButton();
			statusBar.stopTimer();
			statusBar.setStatusText("");
			_pushStream();
			videoWidget.querySelector(".toolbar").style.display = "block";
			videoWidget.querySelector(".active-userinfo").style.display = "block";
			videoWidget.querySelector(".active-username").innerText = config.visitor.trueName || config.user.username;
			timerLeftTop.start();
			utils.removeClass(videoWidget.querySelector(".multi-video-container"), "hide");
		},
		endCallback: function(){
			window.transfer.send({ event: _const.EVENTS.CLOSE });
			videoWidget.querySelector(".toolbar").style.display = "none";
			videoWidget.querySelector(".active-userinfo").style.display = "none";
			timerLeftTop.stop();
			service && service.exit();
			if(pubAVP && service){
				service.closePubstream(pubAVP);
				statusBar.hide();
				videoPanel.hide();
				document.querySelector(".video-chat-wrapper").style.display = "none";
			}
		},
	});

	videoPanel.init({
		wrapperDom: videoWidget.querySelector(".video-panel"),
		service: service,
		dispatcher: dispatcher,
	});
}

function init(option){
	var opt;
	var triggerButton;
	var adapterPath;
	var eMediaSdkPath;
	hasInited = true;

	if(
		window.location.protocol !== "https:"
		|| !Modernizr.peerconnection
		|| !profile.grayList.audioVideo
	) return;

	opt = option || {};
	triggerButton = opt.triggerButton;
	parentContainer = opt.parentContainer;

	adapterPath = __("config.static_path") + "/js/lib/adapter.min.js?v=unknown-000";
	eMediaSdkPath = __("config.static_path") + "/js/lib/EMedia_sdk-2.1.1.29f2187.js?v=1.x.x";

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
			dialog.show();
		});
	});
}

function _pushStream(){
	// var myStream = new service.AVPubstream({ voff: 0, aoff: 0, name: "video" });

	// service.openUserMedia(myStream).then(function(){
	// 	service.push(myStream);
	// });
	service.push(pubAVP);
}

function _reveiveTicket(ticketInfo, ticketExtend, agentName){
	// 有可能收到客服的主动邀请，此时需要初始化
	_initOnce();

	console.log(ticketInfo, ticketExtend);

	// 加入会议
	service.setup(ticketInfo, {
		identity: "visitor",
		nickname: config.visitor.trueName || config.user.username,
		avatarUrl: "",
		extend: ticketExtend
	});

	service.join(function(/* _memId */){
		window.transfer.send({ event: _const.EVENTS.SHOW });
		statusBar.show();
		statusBar.setCallStatus("in");
		statusBar.setStatusText(agentName + " 进线中");
		document.querySelector(".video-chat-wrapper").style.display = "block";
		openUserMedia();
	}, function(evt){
		service.exit();
		throw new Error("failed to join conference: " + evt.message());
	});
}

function _onConfirm(){
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
	document.querySelector(".video-chat-wrapper").style.display = "block";
	statusBar.show();
	statusBar.setStatusText("等待对方接听");
	statusBar.setCallStatus("out");
	openUserMedia();
}

function openUserMedia(){
	var pubS = pubAVP || new service.AVPubstream({
		constaints: {
			audio: true,
			video: 1,
		},
		voff: 0,
		aoff: 0,
		name: "video",
		ext: ""
	});
	pubAVP = pubS;
	videoPanel.show();
	service.openUserMedia(pubS).then(
		function success(_user, stream){
			document.querySelector(".stream-local video").srcObject = stream;
			service._localMediaStream = stream;
		},
		function fail(evt){
		// 设备可能不支持，比如 没有摄像头，或 被禁止访问摄像头
			console.warn("请检查摄像头", evt);
		}
	);
}

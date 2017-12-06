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

var _initOnce = _.once(_init);
var parentContainer;
var videoWidget;
var dispatcher;

var config;
var dialog;
var service;

module.exports = {
	init: init,
};

function _init(){
	if(videoWidget) return;
	// init dom
	videoWidget = utils.createElementFromHTML(_.template(videoChatTemplate)());

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

	statusBar.init({
		wrapperDom: videoWidget.querySelector(".status-bar"),
		acceptCallback: function(){
			videoPanel.show();
			statusBar.hideAcceptButton();
			statusBar.startTimer();
			statusBar.setStatusText(__("video.connecting"));
			_pushStream();
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

function init(option){
	var opt;
	var triggerButton;
	var adapterPath;
	var eMediaSdkPath;

	if(
		window.location.protocol !== "https:"
		|| !Modernizr.peerconnection
		|| !profile.grayList.audioVideo
	) return;

	opt = option || {};
	triggerButton = opt.triggerButton;
	parentContainer = opt.parentContainer;

	adapterPath = __("config.static_path") + "/js/lib/adapter.min.js?v=unknown-000";
	eMediaSdkPath = __("config.static_path") + "/js/lib/EMedia_sdk.min.js?v=1.1.2";

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
	var myStream = new service.AVPubstream({ voff: 0, aoff: 0, name: "video" });

	service.openUserMedia(myStream).then(function(){
		service.push(myStream);
	});
}

function _reveiveTicket(ticketInfo){
	// 有可能收到客服的主动邀请，此时需要初始化
	_initOnce();

	// 加入会议
	service.setup(ticketInfo, {
		identity: "visitor",
		nickname: config.visitor.trueName || config.user.username,
		avatarUrl: "",
	});

	service.join(function(/* _memId */){
		statusBar.reset();
		statusBar.show();
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
}

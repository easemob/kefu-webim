/*
视频流程
访客发起邀请
访客收到ticket
init service
访客加入会议
振铃
访客接起
访客推流
订阅流？
*/

var _const = require("../../common/const");
var uikit = require("./uikit");
var channel = require("./channel");
var profile = require("./tools/profile");
var eventListener = require("./tools/eventListener");
var moment = require("moment");

var imChat;
var btnVideoInvite;
var videoWidget;
var dialBtn;
var ctrlPanel;
var subVideoWrapper;
var mainVideo;
var subVideo;

var statusTimerPrompt;
var statusTimerTimespan;
var closingTimerPrompt;
var closingTimerTimespan;

var dialog;

var config;
var localStream = null;
var remoteStream = null;
var service;
var myStream;
var isChanged = false;

// todo: add i18n ...
var EXIT_REASON_MAP = {
	0: "正常挂断",
	1: "没响应",
	2: "拒绝接通",
	3: "对方忙",
	4: "失败,可能是网络或服务器拒绝",
	5: "不支持",
	10: "其他设备登录",
	11: "会议关闭",
};

var statusTimer = {
	timer: null,
	counter: 0,
	start: function(prompt){
		var me = this;
		me.counter = 0;
		statusTimerPrompt.innerHTML = prompt;
		statusTimerTimespan.innerHTML = "00:00";
		me.timer = setInterval(function(){
			statusTimerTimespan.innerHTML = moment(++me.counter * 1000).format("mm:ss");
		}, 1000);
	},
	stop: function(){
		var me = this;
		clearInterval(me.timer);
	}
};

var closingTimer = {
	isConnected: false,
	timer: null,
	show: function(){
		var me = this;
		clearTimeout(me.timer);
		if(me.isConnected){
			closingTimerTimespan.innerHTML = statusTimerTimespan.innerHTML;
		}
		else{
			closingTimerTimespan.innerHTML = "00:00";
		}
		closingTimerPrompt.classList.remove("hide");
		setTimeout(function(){
			imChat.classList.remove("has-video");
			closingTimerPrompt.classList.add("hide");
		}, 3000);
	}
};

var events = {
	"btn-end-call": function(){
		service && service.exit();
	},
	"btn-accept-call": function(){
		closingTimer.isConnected = true;
		dialBtn.classList.add("hide");
		ctrlPanel.classList.remove("hide");
		subVideoWrapper.classList.remove("hide");
		statusTimer.stop();
		statusTimer.start(__("video.connecting"));
		_pushStream();
	},
	"btn-toggle": function(){
		localStream && service.voff(localStream, !localStream.voff);
	},
	"btn-change": function(){
		isChanged = !isChanged;
		_updateVideoSource();
	},
	"btn-minimize": function(){
		videoWidget.classList.add("minimized");
	},
	"btn-maximize": function(){
		videoWidget.classList.remove("minimized");
	}
};

var _init = _.once(function(){
	config = profile.config;

	dialog = uikit.createDialog({
		contentDom: [
			"<p class=\"prompt\">",
			__("video.confirm_prompt"),
			"</p>"
		].join(""),
		className: "rtc-video-confirm",
	}).addButton({ confirm: _onConfirm });

	// 视频组件初始化
	// 直接操作style是为了避免video标签在加载时一闪而过，影响体验
	videoWidget.style.display = "";

	// 视频组件事件绑定
	videoWidget.addEventListener("click", function(evt){
		var className = evt.target.className;

		Object.keys(events).forEach(function(key){
			~className.indexOf(key) && events[key]();
		});
	}, false);

	service = new window.emedia.Service({
		// 这个目前没有定义，前段可写 web
		resource: "web",
		// 这个人的昵称，可以不写。比如 jid 中的name
		nickName: config.user.username,

		// 以下监听，this object == me == service.current
		listeners: {
			onMeExit: function(reasonCode){
				// 退出，服务端强制退出，进入会议失败，sdk重连失败等 均会调用到此处
				console.log("reason: ", EXIT_REASON_MAP[reasonCode]);
				console.log("onTermCall");
				statusTimer.stop();
				closingTimer.show();
			},

			onAddMember: function(member){
				// 某人进入会议
				console.log(member.id + " " + (member.nickName || "") + " enter");
			},
			onRemoveMember: function(member){
				// 某人退出会议
				console.log(member.id + " " + (member.nickName || "") + " exit");
			},

			onAddStream: function(stream){
				// 某人 发布 一个流 （音视频流，共享桌面等）（包含本地流）
				console.log("Add stream: " + stream.id + " located: " + stream.located() + " webrtc: " + (stream.rtcId || "--"));
				_updateStream(stream);
			},
			onRemoveStream: function(stream){
				// 某人 取消 一个流 （音视频流，共享桌面等）（包含本地流）
				console.log("Remove stream: " + stream.id + " located: " + stream.located() + " webrtc: " + (stream.rtcId || "--"));
				_updateStream(stream);
			},
			onUpdateStream: function(stream){
				// 更新 一个流 （音视频流，共享桌面等）。
				// 可能是 断网后，重新获取到远端媒体流，或者对方静音或关闭摄像头
				console.log("Update stream: " + stream.id + " located: " + stream.located() + " webrtc: " + (stream.rtcId || "--"));
				_updateStream(stream);
			},
			// 这个事件比较多，以后业务拓展时，根据需要再给开放一些回调，目前忽略
			onNotifyEvent: function(){},
		}
	});
});

function _initEventListener(){
	if(
		window.location.protocol !== "https:"
		|| !Modernizr.peerconnection
		|| !profile.grayList.audioVideo
	) return;

	imChat = document.getElementById("em-kefu-webim-chat");
	btnVideoInvite = document.querySelector(".em-video-invite");
	videoWidget = document.querySelector(".em-widget-video");
	dialBtn = videoWidget.querySelector(".btn-accept-call");
	ctrlPanel = videoWidget.querySelector(".toolbar-control");
	subVideoWrapper = videoWidget.querySelector(".sub-win");
	mainVideo = videoWidget.querySelector("video.main");
	subVideo = videoWidget.querySelector("video.sub");

	statusTimerPrompt = videoWidget.querySelector(".status p.prompt");
	statusTimerTimespan = videoWidget.querySelector(".status p.time-escape");
	closingTimerPrompt = videoWidget.querySelector(".full-screen-prompt");
	closingTimerTimespan = videoWidget.querySelector(".full-screen-prompt p.time-escape");

	// 按钮初始化
	btnVideoInvite.classList.remove("hide");
	btnVideoInvite.addEventListener("click", function(){
		_init();
		dialog.show();
	}, false);

	eventListener.add(_const.SYSTEM_EVENT.VIDEO_TICKET_RECEIVED, _reveiveTicket);
}

function _pushStream(){
	myStream = new service.AVPubstream({ voff: 0, aoff: 0, name: "video" });

	service.openUserMedia(myStream).then(function(){
		service.push(myStream, function(){
			// todo: ...
		}, function(evt){
			// fail
			console.warn(evt.message());
		});
	});
}

function _reveiveTicket(ticketInfo){
	// 加入会议
	service.setup(ticketInfo, {
		identity: "visitor",
		nickname: "",
		avatarUrl: "",
	});

	service.join(function(_memId){
		console.warn("进入 ", _memId);
		_onRinging();
	}, function(evt){
		// 加入失败，请close
		console.warn("加入会议失败，原因:" + evt.message());
	});
}

function _updateStream(stream){
	if(stream.located()){
		localStream = stream;
	}
	else{
		remoteStream = stream;
	}

	_updateVideoSource();
}

function _updateVideoSource(){
	// todo: set src to null when no stream
	if(isChanged){
		mainVideo.src = _getSourceURL(localStream);
		subVideo.src =  _getSourceURL(remoteStream);
		mainVideo.muted = true;
	}
	else{
		mainVideo.src = _getSourceURL(remoteStream);
		subVideo.src =  _getSourceURL(localStream);
		subVideo.muted = true;
	}
	mainVideo.play();
	subVideo.play();

	function _getSourceURL(stream){
		var mediaStream = stream && stream.getMediaStream();
		var objectURL = mediaStream && URL.createObjectURL(mediaStream);
		return objectURL || "";
	}
}

function _onRinging(){
	// for debug
	console.log("onRinging");

	subVideo.muted = true;
	mainVideo.muted = false;
	closingTimer.isConnected = false;

	subVideoWrapper.classList.add("hide");
	ctrlPanel.classList.add("hide");
	imChat.classList.add("has-video");
	statusTimer.start(__("video.waiting_confirm"));
	dialBtn.classList.remove("hide");
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
				},
			},
		},
	});
}

module.exports = {
	initEventListener: _initEventListener,
};

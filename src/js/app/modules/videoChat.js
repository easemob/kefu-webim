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

var dialog = uikit.createDialog({
	contentDom: [
		"<p class=\"prompt\">",
		__("video.confirm_prompt"),
		"</p>"
	].join(""),
	className: "rtc-video-confirm"
}).addButton({
	confirm: function(){
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
						resource: "webim"
					}
				}
			}
		});
	}
});

var config;
var call = null;
var localStream = null;
var remoteStream = null;

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


function _endCall(){
	statusTimer.stop();
	closingTimer.show();
	localStream && localStream.getTracks().forEach(function(track){
		track.stop();
	});
	remoteStream && remoteStream.getTracks().forEach(function(track){
		track.stop();
	});
	mainVideo.src = "";
	subVideo.src = "";
}

var events = {
	"btn-end-call": function(){
		try{
			call.endCall();
		}
		catch(e){
			console.error("end call:", e);
		}
		finally{
			_endCall();
		}
	},
	"btn-accept-call": function(){
		closingTimer.isConnected = true;
		dialBtn.classList.add("hide");
		ctrlPanel.classList.remove("hide");
		subVideoWrapper.classList.remove("hide");
		statusTimer.stop();
		statusTimer.start(__("video.connecting"));
		call.acceptCall();
	},
	"btn-toggle": function(){
		localStream && localStream.getVideoTracks().forEach(function(track){
			track.enabled = !track.enabled;
		});
	},
	"btn-change": function(){
		var tmp;

		tmp = subVideo.src;
		subVideo.src = mainVideo.src;
		mainVideo.src = tmp;
		subVideo.play();
		mainVideo.play();

		subVideo.muted = !subVideo.muted;
		mainVideo.muted = !mainVideo.muted;
	},
	"btn-minimize": function(){
		videoWidget.classList.add("minimized");
	},
	"btn-maximize": function(){
		videoWidget.classList.remove("minimized");
	}
};

function _initEventListener(){
	if(!Modernizr.peerconnection || !profile.grayList.audioVideo) return;

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

	eventListener.add(_const.SYSTEM_EVENT.IM_CONNECTION_OPENED, _init);
	eventListener.add(_const.SYSTEM_EVENT.OFFLINE, _endCall);
}

function _init(conn){
	config = profile.config;

	// 视频组件初始化
	// 直接操作style是为了避免video标签在加载时一闪而过，影响体验
	videoWidget.style.display = "";
	// 按钮初始化
	btnVideoInvite.classList.remove("hide");
	btnVideoInvite.addEventListener("click", function(){
		dialog.show();
	}, false);

	// 视频组件事件绑定
	videoWidget.addEventListener("click", function(evt){
		var className = evt.target.className;

		Object.keys(events).forEach(function(key){
			~className.indexOf(key) && events[key]();
		});
	}, false);

	call = new WebIM.WebRTC.Call({
		connection: conn,

		mediaStreamConstaints: {
			audio: true,
			video: true
		},

		listener: {
			onAcceptCall: function(from, options){
				console.log("onAcceptCall", from, options);
			},
			onGotRemoteStream: function(stream){
				// for debug
				console.log("onGotRemoteStream", stream);
				mainVideo.src = URL.createObjectURL(stream);
				remoteStream = stream;
				mainVideo.play();
			},
			onGotLocalStream: function(stream){
				// for debug
				console.log("onGotLocalStream", stream);
				subVideo.src = URL.createObjectURL(stream);
				localStream = stream;
				subVideo.play();
			},
			onRinging: function(caller){
				// for debug
				console.log("onRinging", caller);

				subVideo.muted = true;
				mainVideo.muted = false;
				closingTimer.isConnected = false;

				subVideoWrapper.classList.add("hide");
				ctrlPanel.classList.add("hide");
				imChat.classList.add("has-video");
				statusTimer.start(__("video.waiting_confirm"));
				dialBtn.classList.remove("hide");
			},
			onTermCall: function(){
				// for debug
				console.log("onTermCall");
				_endCall();
			},
			onError: function(e){
				console.log(e && e.message ? e.message : "An error occured when calling webrtc");
			}
		}
	});
}

module.exports = {
	initEventListener: _initEventListener,
};

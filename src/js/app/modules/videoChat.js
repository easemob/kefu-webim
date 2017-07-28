var _const = require("../../common/const");
var uikit = require("./uikit");
var channel = require("./channel");
var profile = require("./tools/profile");
var eventListener = require("./tools/eventListener");

var imChat = document.getElementById("em-kefu-webim-chat");
var btnVideoInvite = document.querySelector(".em-video-invite");
var videoWidget = document.querySelector(".em-widget-video");
var dialBtn = videoWidget.querySelector(".btn-accept-call");
var ctrlPanel = videoWidget.querySelector(".toolbar-control");
var subVideoWrapper = videoWidget.querySelector(".sub-win");
var mainVideo = videoWidget.querySelector("video.main");
var subVideo = videoWidget.querySelector("video.sub");
var dialog = uikit.createDialog({
	contentDom: [
		"<p class=\"prompt\">",
		"您要邀请客服为您进行实时视频服务么？点击确认发送邀请，等待客服接受后即可体验实时视频服务。",
		"</p>"
	].join(""),
	className: "rtc-video-confirm"
}).addButton({
	confirm: function(){
		channel.sendText("邀请客服进行实时视频", {
			ext: {
				type: "rtcmedia/video",
				msgtype: {
					liveStreamInvitation: {
						msg: "邀请客服进行实时视频",
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
	prompt: videoWidget.querySelector(".status p.prompt"),
	timeSpan: videoWidget.querySelector(".status p.time-escape"),
	start: function(prompt){
		var me = this;
		me.counter = 0;
		me.prompt.innerHTML = prompt;
		me.timeSpan.innerHTML = "00:00";
		me.timer = setInterval(function(){
			me.timeSpan.innerHTML = format(++me.counter);
		}, 1000);

		function format(second){
			return (new Date(second * 1000))
			.toISOString()
			.slice(-"00:00.000Z".length)
			.slice(0, "00:00".length);
		}
	},
	stop: function(){
		var me = this;
		clearInterval(me.timer);
	}
};

var closingTimer = {
	isConnected: false,
	timer: null,
	delay: 3000,
	closingPrompt: videoWidget.querySelector(".full-screen-prompt"),
	timeSpan: videoWidget.querySelector(".full-screen-prompt p.time-escape"),
	show: function(){
		var me = this;
		if(me.isConnected){
			me.timeSpan.innerHTML = statusTimer.timeSpan.innerHTML;
		}
		else{
			me.timeSpan.innerHTML = "00:00";
		}
		me.closingPrompt.classList.remove("hide");
		setTimeout(function(){
			imChat.classList.remove("has-video");
			me.closingPrompt.classList.add("hide");
		}, me.delay);
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
		statusTimer.start("视频通话中");
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
				statusTimer.start("视频连接请求，等待你的确认");
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

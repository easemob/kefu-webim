var utils =			require("@/common/kit/utils");
var domUtils =		require("@/common/kit/domUtils");
var classUtils =	require("@/common/kit/classUtils");
var Const =			require("@/common/cfg/const");
var videoWindowTpl =	require("@/app/modules/video/template/videoWindowTpl.html");
var tpl =				require("@/app/modules/video/template/videoViewerTpl.html");
// adapter.js 会劫持这个 api，为了达到预期效果，事先保存
var nativeCreateObjectURL = URL && URL.createObjectURL;
function getStreamName(stream){
	return stream.located()
		? __("video.me")
		: utils.getDataByPath(stream, "owner.ext.nickname");
}

module.exports = classUtils.createView({

	dispatcher: null,
	service: null,
	videoDom: null,
	noAudioVideoDom: null,
	nicknameDom: null,
	returnButtonDom: null,
	toggleCameraButtonDom: null,
	navigateToNewWindowButtonDom: null,

	subWindowHandler: null,
	currentStream: null,
	currentNoAudioStream: null,
	currentOwnerName: null,

	events: {
		"click .return-to-multi-video": "returnToMultivideo",
		"click .toggle-microphone-btn": "toggleMicroPhone",
		"click .toggle-carema-btn": "toggleCarema",
	},

	init: function(option){
		var opt = option || {};
		this.service = opt.service;
		this.dispatcher = opt.dispatcher;

		this.$el = domUtils.createElementFromHTML(tpl);
		this.videoDom = this.$el.querySelector(".main-video");
		this.noAudioVideoDom = this.$el.querySelector(".no-audio-video");
		this.nicknameDom = this.$el.querySelector(".nickname");
		this.returnButtonDom = this.$el.querySelector(".return-to-multi-video");
		this.toggleMicroPhoneButtonDom = this.$el.querySelector(".toggle-microphone-btn");
		this.toggleCameraButtonDom = this.$el.querySelector(".toggle-carema-btn");
		this.navigateToNewWindowButtonDom = this.$el.querySelector(".navigate-to-independent-window-btn");

		this.dispatcher.addEventListener("addOrUpdateStream", this.addOrUpdateStream);
		this.dispatcher.addEventListener("removeStream", this.removeStream);

		// 移动端不显示在新窗口查看视频的按钮
		if(!utils.isMobile){
			domUtils.removeClass(this.navigateToNewWindowButtonDom, "hide");
			this.events["click .navigate-to-independent-window-btn"] = "navigateToNewWindow";
		}
	},

	returnToMultivideo: function(){
		this.dispatcher.trigger("returnToMultiVideoWindow");
	},

	toggleMicroPhone: function(){
		this.service.aoff(this.currentStream, !this.currentStream.aoff);
		this.updateButtonStatus();
	},

	toggleCarema: function(){
		this.service.voff(this.currentStream, !this.currentStream.voff);
		this.updateButtonStatus();
	},

	navigateToNewWindow: function(){
		if(this.subWindowHandler){
			this.closeSubWindow();
			this.updateButtonStatus();
			return;
		}
		this.subWindowHandler = window.open(
			URL.createObjectURL(
				new Blob([videoWindowTpl], { type: "text/html" })
			),
			"easemob_kefu_webim_webrtc_independent_video_window",
			"width=640,height=480,resizable,scrollbars,status"
		);
		this.watchDom(window, "message", this.eventHandler);
		this.updateButtonStatus();
	},

	updateButtonStatus: function(){
		var isMaximized = !!this.subWindowHandler;
		var isLocal = this.currentStream && this.currentStream.located();
		var isMicroPhoneDisabled;
		var isCameraDisabled;
		domUtils.toggleClass(this.navigateToNewWindowButtonDom, "icon-maximize-window", !isMaximized);
		domUtils.toggleClass(this.navigateToNewWindowButtonDom, "icon-minimize-window", isMaximized);
		domUtils.toggleClass(this.toggleMicroPhoneButtonDom, "hide", !isLocal);
		domUtils.toggleClass(this.toggleCameraButtonDom, "hide", !isLocal);
		if(isLocal){
			isMicroPhoneDisabled = !!this.currentStream.aoff;
			isCameraDisabled = !!this.currentStream.voff;
			domUtils.toggleClass(this.toggleMicroPhoneButtonDom, "icon-microphone", !isMicroPhoneDisabled);
			domUtils.toggleClass(this.toggleMicroPhoneButtonDom, "icon-disable-microphone", isMicroPhoneDisabled);
			domUtils.toggleClass(this.toggleCameraButtonDom, "icon-camera", !isCameraDisabled);
			domUtils.toggleClass(this.toggleCameraButtonDom, "icon-disable-camera", isCameraDisabled);
		}
	},

	closeSubWindow: function(){
		if(this.subWindowHandler){
			this.unWatchDom(window, "message", this.eventHandler);
			this.subWindowHandler.close();
			this.subWindowHandler = null;
		}
	},

	eventHandler: function(e){
		var message = e.data;
		var mediaStream;
		var stream = this.currentNoAudioStream || this.currentStream;
		mediaStream = stream.getMediaStream();
		if(message === "independentVidowSubWindowLoaded"){
			this.subWindowHandler && this.subWindowHandler.postMessage({
				type: "updateVideoBlobSrcUrl",
				info: {
					// 只有这里要避免被 hack nativeCreateObjectURL
					blobVideoUrl: nativeCreateObjectURL(mediaStream),
					// 直接取的 window.nickname，不对？
					nickname: getStreamName(stream),
				},
			}, "*");
		}
	},

	show: function(info){
		// reset video dom
		this.currentStream = null;
		this.videoDom.src = "";
		this.nicknameDom.innerText = "";
		this.currentNoAudioStream = null;
		this.noAudioVideoDom.src = "";
		domUtils.removeClass(this.videoDom, "hide");
		domUtils.addClass(this.noAudioVideoDom, "hide");

		this.currentOwnerName = info.ownerName;
		_.each(info.streams, this.addOrUpdateStream);
		domUtils.removeClass(this.$el, "hide");
	},

	hide: function(){
		this.currentOwnerName = null;
		this.closeSubWindow();
		this.updateButtonStatus();
		domUtils.addClass(this.$el, "hide");
	},

	addOrUpdateStream: function(stream){
		var mediaStream;
		var ownerName = utils.getDataByPath(stream, "owner.name");
		var isLocalStream = stream.located();

		if(ownerName !== this.currentOwnerName) return;
		mediaStream = stream.getMediaStream();

		switch(stream.type){
		case Const.STREAM_TYPE.NORMAL:
			this.currentStream = stream;
			this.videoDom.src = mediaStream ? URL.createObjectURL(mediaStream) : "";
			// 本地视频需要 muted
			this.videoDom.muted = isLocalStream;
			this.nicknameDom.innerText = getStreamName(stream);
			break;
		case Const.STREAM_TYPE.NO_AUDIO:
			this.currentNoAudioStream = stream;
			this.noAudioVideoDom.src = mediaStream ? URL.createObjectURL(mediaStream) : "";
			domUtils.addClass(this.videoDom, "hide");
			domUtils.removeClass(this.noAudioVideoDom, "hide");
			break;
		default:
			throw new Error("unexpected stream type.");
		}
		this.updateButtonStatus();
	},

	removeStream: function(stream){
		switch(stream.type){
		case Const.STREAM_TYPE.NORMAL:
			this.currentStream = null;
			this.videoDom.src = "";
			this.nicknameDom.innerText = "";
			break;
		case Const.STREAM_TYPE.NO_AUDIO:
			this.currentNoAudioStream = null;
			this.noAudioVideoDom.src = "";
			domUtils.removeClass(this.videoDom, "hide");
			domUtils.addClass(this.noAudioVideoDom, "hide");
			break;
		default:
			throw new Error("unexpected stream type.");
		}
		this.updateButtonStatus();
		// exit single viewer mode when all streams removed
		if(!this.currentStream && !this.currentNoAudioStream){
			this.dispatcher.trigger("returnToMultiVideoWindow");
		}
	},

});

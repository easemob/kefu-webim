var utils = require("../../../common/utils");
var _const = require("../../../common/const");

var independentVideoWindow = require("raw-loader!../../../../html/independentVideoWindow.html");

// adapter.js 会劫持这个 api，为了达到预期效果，事先保存
var nativeCreateObjectURL = URL && URL.createObjectURL;
var wrapperDom;
var videoDom;
var noAudioVideoDom;
var nicknameDom;
var returnButtonDom;
var toggleMicroPhoneButtonDom;
var toggleCameraButtonDom;
var navigateToNewWindowButtonDom;

var dispatcher;
var service;
var nickname;
var currentStream;
var currentNoAudioStream;
var currentOwnerName;

var subWindowHandler;
var independentVideoWindowPageBlobUrl;

module.exports = {
	init: init,
	show: show,
	hide: hide,
};

function init(option){
	var opt = option || {};

	if(wrapperDom) throw new Error("video viewer has been already initialized.");

	wrapperDom = opt.wrapperDom;
	service = opt.service;
	dispatcher = opt.dispatcher;

	videoDom = wrapperDom.querySelector(".main-video");
	noAudioVideoDom = wrapperDom.querySelector(".no-audio-video");
	nicknameDom = wrapperDom.querySelector(".nickname");
	returnButtonDom = wrapperDom.querySelector(".return-to-multi-video");
	toggleMicroPhoneButtonDom = wrapperDom.querySelector(".toggle-microphone-btn");
	toggleCameraButtonDom = wrapperDom.querySelector(".toggle-carema-btn");
	navigateToNewWindowButtonDom = wrapperDom.querySelector(".navigate-to-independent-window-btn");

	dispatcher.addEventListener("addOrUpdateStream", _addOrUpdateStream);
	dispatcher.addEventListener("removeStream", _removeStream);

	// 移动端不显示在新窗口查看视频的按钮
	if(!utils.isMobile){
		independentVideoWindowPageBlobUrl = URL.createObjectURL(
			new Blob([independentVideoWindow], { type: "text/html" })
		);

		utils.removeClass(navigateToNewWindowButtonDom, "hide");
		utils.on(navigateToNewWindowButtonDom, "click", _navigateToNewWindow);
	}

	utils.on(returnButtonDom, "click", _returnToMultivideo);
	utils.on(toggleMicroPhoneButtonDom, "click", _toggleMicroPhone);
	utils.on(toggleCameraButtonDom, "click", _toggleCarema);
}

function _returnToMultivideo(){
	dispatcher.trigger("returnToMultiVideoWindow");
}

function _toggleMicroPhone(){
	service.aoff(currentStream, !currentStream.aoff);
	_updateButtonStatus();
}

function _toggleCarema(){
	service.voff(currentStream, !currentStream.voff);
	_updateButtonStatus();
}

function _navigateToNewWindow(){
	if(subWindowHandler){
		_closeSubWindow();
		_updateButtonStatus();
		return;
	}

	subWindowHandler = window.open(
		independentVideoWindowPageBlobUrl,
		"easemob_kefu_webim_webrtc_independent_video_window",
		"width=640,height=480,resizable,scrollbars,status"
	);

	window.addEventListener("message", _eventHandler);

	_updateButtonStatus();
}

function _updateButtonStatus(){
	var isMaximized = !!subWindowHandler;
	var isLocal = currentStream && currentStream.located();
	var isMicroPhoneDisabled;
	var isCameraDisabled;

	utils.toggleClass(navigateToNewWindowButtonDom, "icon-maximize-window", !isMaximized);
	utils.toggleClass(navigateToNewWindowButtonDom, "icon-minimize-window", isMaximized);

	utils.toggleClass(toggleMicroPhoneButtonDom, "hide", !isLocal);
	utils.toggleClass(toggleCameraButtonDom, "hide", !isLocal);

	if(isLocal){
		isMicroPhoneDisabled = !!currentStream.aoff;
		isCameraDisabled = !!currentStream.voff;

		utils.toggleClass(toggleMicroPhoneButtonDom, "icon-microphone", !isMicroPhoneDisabled);
		utils.toggleClass(toggleMicroPhoneButtonDom, "icon-disable-microphone", isMicroPhoneDisabled);

		utils.toggleClass(toggleCameraButtonDom, "icon-camera", !isCameraDisabled);
		utils.toggleClass(toggleCameraButtonDom, "icon-disable-camera", isCameraDisabled);
	}
}

function _closeSubWindow(){
	if(subWindowHandler){
		window.removeEventListener("message", _eventHandler);
		subWindowHandler.close();
		subWindowHandler = null;
	}
}

function _eventHandler(e){
	var message = e.data;
	var mediaStream;
	var stream = currentNoAudioStream || currentStream;

	mediaStream = stream.getMediaStream();

	if(message === "independentVidowSubWindowLoaded"){
		subWindowHandler && subWindowHandler.postMessage({
			type: "updateVideoBlobSrcUrl",
			info: {
				blobVideoUrl: nativeCreateObjectURL(mediaStream),
				nickname: nickname,
			},
		}, "*");
	}
}

function show(info){
	// reset video dom
	currentStream = null;
	videoDom.src = "";
	nicknameDom.innerText = "";
	currentNoAudioStream = null;
	noAudioVideoDom.src = "";
	utils.removeClass(videoDom, "hide");
	utils.addClass(noAudioVideoDom, "hide");

	currentOwnerName = info.ownerName;
	_.each(info.streams, _addOrUpdateStream);
	utils.removeClass(wrapperDom, "hide");
}

function hide(){
	currentOwnerName = null;
	_closeSubWindow();
	_updateButtonStatus();
	utils.addClass(wrapperDom, "hide");
}

function _addOrUpdateStream(stream){
	var ownerName = utils.getDataByPath(stream, "owner.name");
	var isLocalStream = stream.located();
	var mediaStream;

	if(ownerName !== currentOwnerName) return;

	mediaStream = stream.getMediaStream();

	switch(stream.type){
	case _const.STREAM_TYPE.NORMAL:
		currentStream = stream;
		videoDom.src = mediaStream ? URL.createObjectURL(mediaStream) : "";
		// 本地视频需要 muted
		videoDom.muted = isLocalStream;
		nicknameDom.innerText = isLocalStream
			? __("video.me")
			: utils.getDataByPath(stream, "owner.ext.nickname");
		break;
	case _const.STREAM_TYPE.NO_AUDIO:
		currentNoAudioStream = stream;
		noAudioVideoDom.src = mediaStream ? URL.createObjectURL(mediaStream) : "";
		utils.addClass(videoDom, "hide");
		utils.removeClass(noAudioVideoDom, "hide");
		break;
	default:
		throw new Error("unexpected stream type.");
	}
	_updateButtonStatus();
}

function _removeStream(stream){
	switch(stream.type){
	case _const.STREAM_TYPE.NORMAL:
		currentStream = null;
		videoDom.src = "";
		nicknameDom.innerText = "";
		break;
	case _const.STREAM_TYPE.NO_AUDIO:
		currentNoAudioStream = null;
		noAudioVideoDom.src = "";
		utils.removeClass(videoDom, "hide");
		utils.addClass(noAudioVideoDom, "hide");
		break;
	default:
		throw new Error("unexpected stream type.");
	}

	_updateButtonStatus();

	// exit single viewer mode when all streams removed
	if(!currentStream && !currentNoAudioStream){
		dispatcher.trigger("returnToMultiVideoWindow");
	}
}

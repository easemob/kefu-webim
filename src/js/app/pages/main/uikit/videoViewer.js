var utils = require("@/common/utils");
var _const = require("@/common/const");

// adapter.js 会劫持这个 api，为了达到预期效果，事先保存
// var nativeCreateObjectURL = URL && URL.createObjectURL;

var wrapperDom;
var videoDom;
var noAudioVideoDom;
var nicknameDom;
var returnButtonDom;
var toggleMicroPhoneButtonDom;
var toggleCameraButtonDom;

var dispatcher;
var service;
var currentStream;
var currentNoAudioStream;
var currentOwnerName;

module.exports = {
	init: init,
	show: show,
	hide: hide,
};

function init(option){
	var opt = option || {};
	if(wrapperDom){
		throw new Error("video viewer has been already initialized.");
	}

	wrapperDom = opt.wrapperDom;
	service = opt.service;
	dispatcher = opt.dispatcher;
	parentContainer = opt.parentContainer;

	videoDom = wrapperDom.querySelector(".main-video");
	noAudioVideoDom = wrapperDom.querySelector(".no-audio-video");
	nicknameDom = wrapperDom.querySelector(".nickname");
	returnButtonDom = wrapperDom.querySelector(".return-to-multi-video");
	toggleMicroPhoneButtonDom = wrapperDom.querySelector(".toggle-microphone-btn");
	toggleCameraButtonDom = wrapperDom.querySelector(".toggle-carema-btn");
	toggleFullScreenButtonDom = wrapperDom.querySelector(".toggle-full-screen-btn");

	dispatcher.addEventListener("addOrUpdateStream", _addOrUpdateStream);
	dispatcher.addEventListener("removeStream", _removeStream);

	utils.on(returnButtonDom, "click", _returnToMultivideo);
	utils.on(toggleMicroPhoneButtonDom, "click", _toggleMicroPhone);
	utils.on(toggleCameraButtonDom, "click", _toggleCarema);
	utils.on(toggleFullScreenButtonDom, "click", _toggleFullScreen);

	if(utils.isMobile){
		utils.removeClass(toggleFullScreenButtonDom, "hide");
	}
}

function _returnToMultivideo(){
	dispatcher.trigger("returnToMultiVideoWindow");

	$(".video-chat-wrapper").css("height","auto");
	parentContainer.style.height = "auto";
	wrapperDom.style.height = "auto";
}

function _toggleMicroPhone(){
	service.aoff(currentStream, !currentStream.aoff);
	_updateButtonStatus();
}

function _toggleCarema(){
	service.voff(currentStream, !currentStream.voff);
	_updateButtonStatus();
}

function _toggleFullScreen(){
	utils.toggleClass(wrapperDom, "big");
	if(utils.hasClass(wrapperDom, "big")){
		$(".video-chat-wrapper").css("height","100%");
		parentContainer.style.height = "100%";
		wrapperDom.style.height = "calc(100% - 88px)";
		utils.removeClass(toggleFullScreenButtonDom, "icon-fullscreen");
		utils.addClass(toggleFullScreenButtonDom, "icon-hrefscreen");
	}
	else{
		$(".video-chat-wrapper").css("height","auto");
		parentContainer.style.height = "auto";
		wrapperDom.style.height = "auto";
		utils.addClass(toggleFullScreenButtonDom, "icon-fullscreen");
		utils.removeClass(toggleFullScreenButtonDom, "icon-hrefscreen");
	}
}

function _updateButtonStatus(){
	var isLocal = currentStream && currentStream.located();
	var isMicroPhoneDisabled;
	var isCameraDisabled;

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

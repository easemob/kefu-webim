var utils = require("../../../common/utils");
var independentVideoWindow = require("raw-loader!../../../../html/independentVideoWindow.html");

// adapter.js 会劫持这个 api，为了达到预期效果，事先保存
var nativeCreateObjectURL = URL && URL.createObjectURL;
var wrapperDom;
var videoDom;
var nicknameDom;
var returnButtonDom;
var toggleMicroPhoneButtonDom;
var toggleCameraButtonDom;
var navigateToNewWindowButtonDom;

var onReturnButtonClickCallback;
var service;
var nickname;
var srcObject;
var mediaStream;
var currentStream;

var nopFunction = function(){};
var subWindowHandler;
var independentVideoWindowPageBlobUrl;

module.exports = {
	init: init,
	show: show,
	hide: hide,
	update: update,
};

function init(option){
	var opt = option || {};

	if(wrapperDom) throw new Error("video viewer has been already initialized.");

	wrapperDom = opt.wrapperDom;
	onReturnButtonClickCallback = opt.onReturnButtonClickCallback || nopFunction;
	service = opt.service;

	videoDom = wrapperDom.querySelector("video");
	nicknameDom = wrapperDom.querySelector(".nickname");
	returnButtonDom = wrapperDom.querySelector(".return-to-multi-video");
	toggleMicroPhoneButtonDom = wrapperDom.querySelector(".toggle-microphone-btn");
	toggleCameraButtonDom = wrapperDom.querySelector(".toggle-carema-btn");
	navigateToNewWindowButtonDom = wrapperDom.querySelector(".navigate-to-independent-window-btn");

	independentVideoWindowPageBlobUrl = URL.createObjectURL(new Blob([independentVideoWindow], { type: "text/html" }));

	utils.on(returnButtonDom, "click", onReturnButtonClickCallback);
	utils.on(toggleMicroPhoneButtonDom, "click", _toggleMicroPhone);
	utils.on(toggleCameraButtonDom, "click", _toggleCarema);
	utils.on(navigateToNewWindowButtonDom, "click", _navigateToNewWindow);

	utils.toggleClass(navigateToNewWindowButtonDom, "hide", utils.isMobile);
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

function show(){
	utils.removeClass(wrapperDom, "hide");
}

function hide(){
	_closeSubWindow();
	_updateButtonStatus();
	utils.addClass(wrapperDom, "hide");
}

function update(info){
	nickname = info.nickname;
	srcObject = info.srcObject;
	mediaStream = info.mediaStream;
	currentStream = info.stream;

	nicknameDom.innerText = nickname;
	videoDom.src = srcObject;

	_updateButtonStatus();
}
